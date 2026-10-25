import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def run():
    print("Preparing database for exact local backup import...")
    candidates = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'real_project_data.json'),
        os.path.join(os.getcwd(), 'real_project_data.json'),
        os.path.join(os.getcwd(), 'backend', 'real_project_data.json'),
    ]
    backup_file = None
    for p in candidates:
        if os.path.exists(p):
            backup_file = p
            break

    if not backup_file:
        print("Backup file not found in candidates:", candidates)
        return

    # Delete old placeholder data to prevent duplicate key / unique constraint conflicts
    try:
        with connection.cursor() as cursor:
            tables = [
                'django_admin_log',
                'django_session',
                'api_sprinttask',
                'api_contractmilestone',
                'api_payment',
                'api_contract',
                'api_proposal',
                'api_projectdocumentverification',
                'api_project',
                'api_freelanceridentityverification',
                'api_freelancerportfolio',
                'api_freelancerexperience',
                'api_freelancereducation',
                'api_freelancercertification',
                'api_freelancerwithdrawal',
                'api_freelancerprofile',
                'api_userprofile',
                'api_message',
                'api_notification',
                'api_review',
                'api_savedfreelancer',
                'api_contactmessage',
                'api_skill',
                'api_skillcategory',
                'auth_user'
            ]
            cursor.execute(f"TRUNCATE TABLE {', '.join(tables)} CASCADE;")
            print("Truncated tables cleanly via PostgreSQL CASCADE.")
    except Exception as e:
        print(f"SQL truncate failed ({e}), falling back to ORM delete...")
        from django.contrib.auth.models import User
        from api.models import (
            UserProfile, FreelancerProfile, SkillCategory, Skill,
            Project, Proposal, Contract, ContractMilestone, Payment,
            Review, Message, ContactMessage, Notification, SavedFreelancer,
            SprintTask, FreelancerIdentityVerification, ProjectDocumentVerification,
            FreelancerPortfolio, FreelancerExperience, FreelancerEducation,
            FreelancerCertification, FreelancerWithdrawal
        )
        for m in [
            SprintTask, ContractMilestone, Payment, Contract, Proposal,
            ProjectDocumentVerification, Project, FreelancerIdentityVerification,
            FreelancerPortfolio, FreelancerExperience, FreelancerEducation,
            FreelancerCertification, FreelancerWithdrawal,
            FreelancerProfile, UserProfile, Message, Notification,
            Review, SavedFreelancer, ContactMessage, User, Skill, SkillCategory
        ]:
            try:
                m.objects.all().delete()
            except Exception as del_err:
                print(f"Error deleting {m.__name__}: {del_err}")

    print(f"Loading real project data from {backup_file}...")
    try:
        call_command('loaddata', backup_file)
        print("Real project data loaded successfully!")
        from django.contrib.auth.models import User
        user_hashes = {
            'admin': 'pbkdf2_sha256$250000$h8YUppe7OM69NBeafdNoVx$ZOteq/GY3SyYmQYQ6h0avv4sn0oBPPQuT/Uh4wSGAPo=',
            'abhilashkk123@gmail.com': 'pbkdf2_sha256$250000$o7PLLzXfEoLUvPcC6LhMN9$ZcSQyTES7JXF0CN8Ycg1KcOmsrIiWVr8FOeOd89yqrs=',
            'james123@gmail.com': 'pbkdf2_sha256$250000$xO26wMLI6ASeKJsBq8VGEp$oTHZEMUssF6+yjG8oCukoFisorFIuwDZILlQSGnHsAc=',
            'karthik': 'pbkdf2_sha256$250000$XsiJVYMIxleDQByydjxw1L$4GBLRtwE0kV6gHOuWR8IpDSNmpcXdhMePqQjWAahZ6c=',
            'ram': 'pbkdf2_sha256$250000$OKHGR6XlZACKl7ldM8gDVE$jDPdO9TgZACnT5zp691vKGEfYxPp/8qRnoor0kc2fiM=',
            'haines': 'pbkdf2_sha256$250000$mHzIdOi9PmaiJEBDUR4I7z$1f1YEU0uOaS0TcqtAxaT5c5gD0438q9VKHLQHffxmig='
        }
        for uname, h in user_hashes.items():
            User.objects.filter(username=uname).update(password=h)
        from api.views import sync_contract_and_project_completion
        from api.models import Contract
        for c in Contract.objects.all():
            sync_contract_and_project_completion(c)
        print("Contract and project completions reconciled successfully!")
    except Exception as err:
        print(f"Error loading fixture: {err}")

if __name__ == '__main__':
    run()
