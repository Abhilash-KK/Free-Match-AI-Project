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
    matched_users = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier))
    for user_obj in matched_users:
        if user_obj.check_password(password):
            user = user_obj
            break

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
    comm = int(data.get('comm', rating))
    code = int(data.get('code', rating))
    deadline = int(data.get('deadline', rating))
    comment = data.get('comment', '')
    project_title = data.get('project_title', 'Marketplace Project')

    try:
        first_word = reviewee_name.split()[0] if reviewee_name else ''
        reviewee_user = (
            User.objects.filter(username__iexact=reviewee_name).first() or
            User.objects.filter(username__iexact=reviewee_name.replace(" ", "")).first() or
            User.objects.filter(first_name__iexact=first_word).first() or
            User.objects.filter(first_name__icontains=first_word).first() or
            User.objects.filter(profile__role='freelancer').first()
        )

        reviewer_first = reviewer_name.split()[0] if reviewer_name else ''
        reviewer_user = (
            User.objects.filter(username__iexact=reviewer_name).first() or
            User.objects.filter(username__iexact=reviewer_name.replace(" ", "")).first() or
            User.objects.filter(first_name__iexact=reviewer_first).first() or
            User.objects.filter(profile__company_name__icontains=reviewer_name).first() or
            User.objects.filter(profile__role='client').first() or
            User.objects.first()
        )

        if reviewee_user and reviewer_user:
            rev_obj = Review.objects.create(
                reviewer=reviewer_user,
                reviewee=reviewee_user,
                project_title=project_title,
                rating=rating,
                communication_rating=comm,
                code_quality_rating=code,
                deadline_adherence_rating=deadline,
                comment=comment
            )
            fl_prof = getattr(reviewee_user, 'freelancer_profile', None)
            if fl_prof:
                all_revs = Review.objects.filter(reviewee=reviewee_user)
                avg_val = sum([r.rating for r in all_revs]) / float(all_revs.count())
                fl_prof.rating = round(avg_val, 1)
                fl_prof.save()

        return Response({
            "message": "Review submitted successfully and rating updated in database!",
            "rating": rating
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_reviews(request):
    """
    Retrieve all submitted reviews or reviews for a specific freelancer.
    """
    from .models import Review
    freelancer_query = request.GET.get('freelancer', '').strip()
    try:
        reviews_qs = Review.objects.all().order_by('-created_at')
        result = []
        for r in reviews_qs:
            reviewee_display = f"{r.reviewee.first_name} {r.reviewee.last_name}".strip() or r.reviewee.username
            reviewer_display = r.reviewer.profile.company_name if (hasattr(r.reviewer, 'profile') and r.reviewer.profile.company_name) else f"{r.reviewer.first_name} {r.reviewer.last_name}".strip() or r.reviewer.username
            
            if freelancer_query:
                q_clean = freelancer_query.lower().replace(" ", "")
                rev_clean = reviewee_display.lower().replace(" ", "")
                uname_clean = r.reviewee.username.lower()
                first_word = freelancer_query.split()[0].lower() if freelancer_query else ''
                if (q_clean not in rev_clean and 
                    q_clean not in uname_clean and 
                    first_word not in rev_clean and 
                    first_word not in uname_clean):
                    continue

            result.append({
                "id": f"rev_{r.id}",
                "type": "given",
                "reviewer": reviewer_display,
                "reviewee": reviewee_display,
                "projectTitle": r.project_title or "Completed Deliverable",
                "rating": r.rating,
                "comm": r.communication_rating,
                "code": r.code_quality_rating,
                "deadline": r.deadline_adherence_rating,
                "comment": r.comment,
                "date": r.created_at.strftime("%b %d, %Y") if r.created_at else "Just now"
            })
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_contact(request):
    """
    Receive contact messages from LandingPage Contact Form, save to PostgreSQL,
    and route inquiries directly to recipient_email (kkabhilash30@gmail.com).
    """
    from .models import ContactMessage
    from django.core.mail import send_mail
    data = request.data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()
    recipient_email = data.get('recipient_email', 'kkabhilash30@gmail.com')

    if not name or not email or not message:
        return Response({"error": "Name, Email, and Message are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contact_obj = ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject or 'Contact Inquiry via FreeMatch AI',
            message=message,
            recipient_email=recipient_email
        )

        try:
            send_mail(
                subject=f"[FreeMatch AI Contact] {subject or 'New Inquiry'}",
                message=f"From: {name} <{email}>\n\nMessage:\n{message}",
                from_email=email,
                recipient_list=[recipient_email],
                fail_silently=True
            )
        except Exception:
            pass

        return Response({
            "message": f"Your message has been sent successfully to {recipient_email} and recorded in database!",
            "id": contact_obj.id,
            "recipient_email": recipient_email
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def projects_api(request):
    """
    GET: Retrieve all project postings from PostgreSQL database.
    POST: Create and persist a new project posting in PostgreSQL database.
    """
    from .models import Project, SkillCategory
    if request.method == 'GET':
        try:
            projects = Project.objects.all().order_by('-created_at')
            project_list = []
            for p in projects:
                project_list.append({
                    "id": f"proj_{p.id}",
                    "title": p.title,
                    "client": p.client.username if p.client else 'TechStream Corp',
                    "category": p.category.name if p.category else 'Software Development',
                    "budget": p.budget,
                    "duration": p.duration,
                    "skills": p.skills_required,
                    "status": p.get_status_display() if hasattr(p, 'get_status_display') else p.status,
                    "postedDate": p.created_at.strftime("%b %d, %Y") if p.created_at else "Just Now",
                    "progress": 0,
                    "applicants": p.proposals.count() if hasattr(p, 'proposals') else 0,
                    "description": p.description,
                    "abstract": p.abstract
                })
            return Response(project_list, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        data = request.data
        title = data.get('title', '').strip()
        client_name = data.get('client', 'TechStream Corp')
        category_name = data.get('category', 'Software Development')
        budget = data.get('budget', '$5,000')
        duration = data.get('duration', '3 Weeks')
        skills = data.get('skills', '')
        description = data.get('description', '')
        abstract = data.get('abstract', '')

        if not title:
            return Response({"error": "Project Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.filter(username__iexact=client_name).first() or User.objects.filter(is_superuser=True).first() or User.objects.first()
            category_obj, _ = SkillCategory.objects.get_or_create(name=category_name)

            proj = Project.objects.create(
                client=user,
                title=title,
                category=category_obj,
                budget=budget,
                duration=duration,
                skills_required=skills,
                description=description,
                abstract=abstract,
                status='Open'
            )

            return Response({
                "message": "Project posted and persisted in PostgreSQL database!",
                "project": {
                    "id": f"proj_{proj.id}",
                    "title": proj.title,
                    "client": client_name,
                    "category": category_name,
                    "budget": budget,
                    "duration": duration,
                    "skills": skills,
                    "status": "Open for Bids",
                    "postedDate": "Just Now",
                    "progress": 0,
                    "applicants": 0,
                    "description": description,
                    "abstract": abstract
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)