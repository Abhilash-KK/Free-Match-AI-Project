from django.contrib.auth.hashers import PBKDF2PasswordHasher

class OptimizedPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    """
    Optimized PBKDF2 hasher tuned for cloud containers.
    Provides strong OWASP-compliant security (250,000 iterations)
    without excessive CPU starvation on shared/throttled CPU cores.
    """
    iterations = 250000
