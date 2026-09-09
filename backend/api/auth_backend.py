from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q

class CaseInsensitiveModelBackend(ModelBackend):
    """
    Custom authentication backend that permits case-insensitive username 
    or email authentication in Django admin and other login views.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if not username or not password:
            return None
        
        username_clean = str(username).strip()
        user = User.objects.filter(
            Q(username__iexact=username_clean) | Q(email__iexact=username_clean)
        ).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
