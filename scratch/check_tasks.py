import os
import sys
import django

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import SprintTask, Project, Contract

print("=== SPRINT TASKS ===")
tasks = SprintTask.objects.all()
for t in tasks:
    project_title = t.project.title if hasattr(t, 'project') and t.project else getattr(t, 'projectTitle', getattr(t, 'project_name', 'No Project'))
    print(f"ID: {t.id} | Title: {t.title} | Status: '{t.status}' | Project: {project_title}")

print("\n=== PROJECTS ===")
projects = Project.objects.all()
for p in projects:
    print(f"ID: {p.id} | Title: {p.title} | Status: {p.status} | Client: {p.client_id}")
