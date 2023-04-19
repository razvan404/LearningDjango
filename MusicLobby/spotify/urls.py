from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURLView.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticatedView.as_view()),
    path('current-song', CurrentSongView.as_view())
]