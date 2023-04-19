from django.shortcuts import render, redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import upsert_user_tokens, is_spotify_authenticated, exec_spotify_api_request, pause_song, play_song, skip_song
from api.models import Room
from .models import SkipVote

# Create your views here.
class AuthURLView(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    upsert_user_tokens(request.session.session_key, access_token, token_type,
                       expires_in, refresh_token)
    
    return redirect('frontend:')

class IsAuthenticatedView(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class CurrentSongView(APIView):
    def get(self, request, format=None):
        room_code = request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if not queryset.exists():
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        room = queryset[0]
        host = room.host
        endpoint = 'player/currently-playing'

        response = exec_spotify_api_request(host, endpoint)
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        if item:
            duration = item.get('duration_ms')
            progress = response.get('progress_ms')
            album_cover = item.get('album').get('images')[0].get('url')
            is_playing = response.get('is_playing')
            song_id = item.get('id')
            
            artist_string = ''
            for i, artist in enumerate(item.get('artists')):
                if i > 0:
                    artist_string += ', '
                name = artist.get('name')
                artist_string += name
            
            votes = len(SkipVote.objects.filter(room=room, song_id=song_id))
            song = {
                'title': item.get('name'),
                'artist': artist_string,
                'duration': duration,
                'time': progress,
                'image_url': album_cover,
                'is_playing': is_playing,
                'votes': votes,
                'votes_required': room.votes_to_skip,
                'id': song_id
            }
            self.update_room_song(room, song_id)
            return Response(song, status=status.HTTP_200_OK)
        
        return Response({}, status=status.HTTP_204_NO_CONTENT)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = SkipVote.objects.filter(room=room).delete()

class PauseSongView(APIView):
    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if request.session.session_key == room.host or room.guest_can_pause:
            response = pause_song(room.host)
            print(response['error']['message'])
            if 'error' in response:
                return Response({'error': response['error']['message']}, status=status.HTTP_403_FORBIDDEN)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({'error': 'You don\'t have access to do this action!'}, status=status.HTTP_403_FORBIDDEN)

class PlaySongView(APIView):
    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if request.session.session_key == room.host or room.guest_can_pause:
            response = play_song(room.host)
            if 'error' in response:
                return Response({'error': response['error']['message']}, status=status.HTTP_403_FORBIDDEN)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({'error': 'You don\'t have the permission to do this!'}, status=status.HTTP_403_FORBIDDEN)

class SkipSongView(APIView):
    def post(self, request, format=None):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = SkipVote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if request.session.session_key == room.host or len(votes) + 1 >= votes_needed:
            votes.delete()
            response = skip_song(room.host)
            if 'error' in response:
                return Response({'error': response['error']['message']}, status=status.HTTP_403_FORBIDDEN)
        else:
            vote = SkipVote(user=request.session.session_key, room=room, song_id=room.current_song)
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)
