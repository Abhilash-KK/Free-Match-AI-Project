import os
import sys
import django

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Contract

print("=== DELETING ORPHAN TEST CONTRACTS ===")

stale = Contract.objects.filter(project__isnull=True)
count = stale.count()

for c in stale:
    print(f"Deleting stale test contract ID {c.id} (Code: '{c.contract_id}', Client ID: {c.client_id}, Project Name: '{c.project_name}')")
    c.delete()

print(f"Successfully deleted {count} stale test contracts from DB.")

print("\n=== REMAINING CONTRACTS IN DB ===")
for c in Contract.objects.all():
    proj_title = c.project.title if c.project else "No Project"
    print(f"ID: {c.id} | Code: '{c.contract_id}' | Proj: '{proj_title}' | Client ID: {c.client_id} | Status: '{c.status}'")
