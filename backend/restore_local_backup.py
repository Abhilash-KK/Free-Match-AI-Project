import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User

def run():
    print("Preparing database for exact local backup import...")
    # Delete dummy demo users seeded previously if present
    User.objects.filter(username__in=['techstream', 'alexmercer', 'sarahchen']).delete()
    
    backup_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'real_project_data.json')
    if os.path.exists(backup_file):
        print(f"Loading real project data from {backup_file}...")
        try:
            call_command('loaddata', backup_file)
            print("Real project data loaded successfully!")
        except Exception as e:
            print("Loaddata notice:", e)
    else:
        print("Backup file not found at", backup_file)

if __name__ == '__main__':
    run()
