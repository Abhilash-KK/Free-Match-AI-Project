import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User
from api.models import (
    UserProfile, FreelancerProfile, SkillCategory, Skill,
    Project, Proposal, Contract, ContractMilestone, Payment,
    Review, Message, ContactMessage, Notification, SavedFreelancer,
    SprintTask, FreelancerIdentityVerification, ProjectDocumentVerification
)

def run():
    print("Preparing database for exact local backup import...")
    backup_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'real_project_data.json')
    if not os.path.exists(backup_file):
        print("Backup file not found at", backup_file)
        return

    # Delete old placeholder data to prevent duplicate key / unique constraint conflicts
    SprintTask.objects.all().delete()
    ContractMilestone.objects.all().delete()
    Payment.objects.all().delete()
    Contract.objects.all().delete()
    Proposal.objects.all().delete()
    ProjectDocumentVerification.objects.all().delete()
    Project.objects.all().delete()
    FreelancerIdentityVerification.objects.all().delete()
    FreelancerProfile.objects.all().delete()
    UserProfile.objects.all().delete()
    Message.objects.all().delete()
    Notification.objects.all().delete()
    Review.objects.all().delete()
    SavedFreelancer.objects.all().delete()
    ContactMessage.objects.all().delete()
    User.objects.all().delete()
    Skill.objects.all().delete()
    SkillCategory.objects.all().delete()

    print(f"Loading real project data from {backup_file}...")
    call_command('loaddata', backup_file)
    print("Real project data loaded successfully!")

if __name__ == '__main__':
    run()
