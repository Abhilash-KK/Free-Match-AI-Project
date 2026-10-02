import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from api.models import (
    UserProfile, FreelancerProfile, SkillCategory, Skill, Project,
    SprintTask, Proposal, Contract, ContractMilestone, Payment,
    Review, Message, ContactMessage, Notification, SavedFreelancer,
    FreelancerPortfolio, FreelancerExperience, FreelancerEducation,
    FreelancerCertification, FreelancerWithdrawal, FreelancerIdentityVerification
)

User = get_user_model()

def inspect_db():
    print("=== DATABASE CONFIGURATION ===")
    print("DATABASES:", settings.DATABASES)
    
    db_engine = settings.DATABASES['default']['ENGINE']
    db_name = settings.DATABASES['default']['NAME']
    print(f"Engine: {db_engine}")
    print(f"Name: {db_name}")

    print("\n=== CURRENT RECORD COUNTS IN ACTIVE DATABASE ===")
    models_to_check = [
        ("User", User),
        ("UserProfile", UserProfile),
        ("FreelancerProfile", FreelancerProfile),
        ("SkillCategory", SkillCategory),
        ("Skill", Skill),
        ("Project", Project),
        ("SprintTask", SprintTask),
        ("Proposal", Proposal),
        ("Contract", Contract),
        ("ContractMilestone", ContractMilestone),
        ("Payment", Payment),
        ("Review", Review),
        ("Message", Message),
        ("ContactMessage", ContactMessage),
        ("Notification", Notification),
        ("SavedFreelancer", SavedFreelancer),
        ("FreelancerPortfolio", FreelancerPortfolio),
        ("FreelancerExperience", FreelancerExperience),
        ("FreelancerEducation", FreelancerEducation),
        ("FreelancerCertification", FreelancerCertification),
        ("FreelancerWithdrawal", FreelancerWithdrawal),
        ("FreelancerIdentityVerification", FreelancerIdentityVerification),
    ]

    for name, model in models_to_check:
        try:
            cnt = model.objects.count()
            print(f"  {name:30s}: {cnt}")
        except Exception as e:
            print(f"  {name:30s}: ERROR - {e}")

if __name__ == '__main__':
    inspect_db()
