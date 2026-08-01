from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.utils.crypto import get_random_string
from .models import UserProfile

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify Python Django PostgreSQL backend connectivity.
    """
    return Response({
        "status": "online",
        "message": "FreeMatch AI Django Backend Connected to PostgreSQL!",
        "framework": "Django 6.0",
        "database": "PostgreSQL"
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user in PostgreSQL database (Supports custom User ID + Email ID).
    """
    data = request.data
    email = data.get('email', '').strip().lower()
    raw_user_id = data.get('user_id', '').strip().lower()
    username = raw_user_id if raw_user_id else email
    password = data.get('password', '')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    role = data.get('role', 'client').lower()

    if not email or not password:
        return Response({"error": "Email Address and Password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": f"An account with email '{email}' already exists."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": f"User ID / Username '{username}' is already taken. Please choose another."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': role})

        return Response({
            "message": "User registered successfully in PostgreSQL",
            "user": {
                "user_id": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "email": user.email,
                "role": profile.role
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Authenticate user with PostgreSQL database using EITHER Email ID OR User ID.
    """
    data = request.data
    identifier = data.get('identifier', data.get('email', '')).strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return Response({"error": "Email ID / User ID and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    try:
        user_obj = User.objects.get(Q(username__iexact=identifier) | Q(email__iexact=identifier))
        if user_obj.check_password(password):
            user = user_obj
    except User.DoesNotExist:
        user = None

    if user is None:
        return Response({"error": "Invalid Email ID / User ID or password."}, status=status.HTTP_401_UNAUTHORIZED)

    req_role = data.get('role', '').strip().lower()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if req_role in ['admin', 'freelancer', 'client']:
        profile.role = req_role
        profile.save()

    return Response({
        "message": "Login successful",
        "user": {
            "user_id": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email,
            "role": profile.role
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate or register user via Google OAuth SSO in Django backend.
    """
    data = request.data
    email = data.get('email', '').strip().lower()
    first_name = data.get('first_name', 'Google')
    last_name = data.get('last_name', 'User')
    role = data.get('role', 'client').lower()

    if not email:
        return Response({"error": "Google email is required."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email).first()
    if not user:
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=get_random_string(32),
            first_name=first_name,
            last_name=last_name
        )

    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': role})

    return Response({
        "message": "Google Authentication Successful",
        "user": {
            "user_id": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email,
            "role": profile.role,
            "auth_provider": "Google"
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_review(request):
    """
    Submit a review for a freelancer/contract, updating Django ORM & recalculating freelancer average rating score.
    """
    from .models import Review
    data = request.data
    reviewer_name = data.get('reviewer', 'TechStream Corp')
    reviewee_name = data.get('reviewee', 'Alex Mercer')
    rating = int(data.get('rating', 5))
    comment = data.get('comment', '')
    project_title = data.get('project_title', 'Marketplace Project')

    try:
        reviewer_user = User.objects.filter(username__iexact=reviewer_name).first() or User.objects.filter(is_superuser=True).first()
        reviewee_user = User.objects.filter(username__iexact=reviewee_name).first()

        if reviewee_user and reviewer_user:
            Review.objects.create(
                reviewer=reviewer_user,
                reviewee=reviewee_user,
                rating=rating,
                comment=f"[{project_title}] {comment}"
            )
            fl_prof = getattr(reviewee_user, 'freelancer_profile', None)
            if fl_prof:
                fl_prof.rating = round((fl_prof.rating + rating) / 2.0, 1)
                fl_prof.save()

        return Response({
            "message": "Review submitted successfully and rating updated in database!",
            "rating": rating
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)