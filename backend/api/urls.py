from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='api_root'),
    path('health/', views.health_check, name='health_check'),
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/google/', views.google_auth, name='google_auth'),
    path('reviews/', views.get_reviews, name='get_reviews'),
    path('reviews/submit/', views.submit_review, name='submit_review'),
    path('contact/submit/', views.submit_contact, name='submit_contact'),
    path('projects/', views.projects_api, name='projects_api'),
]
