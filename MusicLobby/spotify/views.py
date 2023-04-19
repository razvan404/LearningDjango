from django.shortcuts import render, redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import upsert_user_tokens, is_spotify_authenticated, exec_spotify_api_request
from api.models import Room

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
        room_code = self.request.session.get('room_code')
        queryset = Room.objects.filter(code=room_code)
        if not queryset.exists():
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        room = queryset[0]
        host = room.host
        endpoint = 'player/currently-playing'
        response = exec_spotify_api_request(host, endpoint)
        
        print(response)

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
            
            song = {
                'title': item.get('name'),
                'artist': artist_string,
                'duration': duration,
                'time': progress,
                'image_url': album_cover,
                'is_playing': is_playing,
                'votes': 0,
                'id': song_id
            }
            return Response(song, status=status.HTTP_200_OK)
        return Response({}, status=status.HTTP_204_NO_CONTENT)