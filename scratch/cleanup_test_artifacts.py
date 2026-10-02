import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'C:\Users\kkabh\OneDrive\Documents\FREEMATCH AI\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Contract, ContractMilestone, Project, Proposal, SprintTask, Notification, SavedFreelancer

print("=== STARTING CONFIRMED TEST ARTIFACTS CLEANUP ===")

# 1. Identify test contracts where project is None or title in ('Client Contract', 'Contract Project')
test_contracts = Contract.objects.filter(project__isnull=True)
print(f"Found {test_contracts.count()} test contracts with project__isnull=True:")
for c in test_contracts:
    print(f"  Deleting Contract ID {c.id} ({c.contract_id}) - '{c.project_name}' - Amount: {c.agreed_amount}")
    ContractMilestone.objects.filter(contract=c).delete()
    c.delete()

# 2. Identify test project 'Automated Postman Test Project'
test_projects = Project.objects.filter(title__icontains='Automated Postman Test Project')
print(f"Found {test_projects.count()} test projects with title 'Automated Postman Test Project':")
for p in test_projects:
    print(f"  Deleting Project ID {p.id} - '{p.title}'")
    SprintTask.objects.filter(project=p).delete()
    Proposal.objects.filter(project=p).delete()
    p.delete()

print("\n=== CLEANUP COMPLETED ===")

# Verify remaining contracts for abhilashkk123@gmail.com
remaining_contracts = Contract.objects.all()
print(f"\nRemaining Contracts count: {remaining_contracts.count()}")
for c in remaining_contracts:
    print(f"  Contract ID {c.id} ({c.contract_id}): '{c.project_name}' | agreed: {c.agreed_amount} | project_rel: {c.project} | client: {c.client}")

remaining_projects = Project.objects.all()
print(f"\nRemaining Projects count: {remaining_projects.count()}")
for p in remaining_projects:
    print(f"  Project ID {p.id}: '{p.title}' | budget: {p.budget} | client: {p.client}")
