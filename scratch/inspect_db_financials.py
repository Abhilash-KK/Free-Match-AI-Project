import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'C:\Users\kkabh\OneDrive\Documents\FREEMATCH AI\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Contract, Project, Proposal, ContractMilestone, UserProfile

clean_cl = 'abhilashkk123@gmail.com'
client_user = User.objects.filter(email=clean_cl).first() or User.objects.filter(username=clean_cl).first()

print("--- CLIENT USER ---")
print("User:", client_user)
if client_user:
    print("  ID:", client_user.id)
    print("  Username:", client_user.username)
    print("  Email:", client_user.email)

print("\n--- CONTRACTS IN DB ---")
contracts = Contract.objects.all()
for c in contracts:
    print(f"Contract ID: {c.id} | string_id: {c.contract_id} | title: '{c.project_name}' | agreed: {c.agreed_amount} | escrow: {c.escrow_balance} | status: {c.status}")
    print(f"   client: {c.client} | client_id_str: '{c.client_id_str}' | client_name: '{c.client_name}'")
    print(f"   freelancer: {c.freelancer} | freelancer_id_str: '{c.freelancer_id_str}' | freelancer_name: '{c.freelancer_name}'")
    print(f"   project_rel: {c.project}")
    ms = c.milestones.all()
    for m in ms:
        print(f"      Milestone {m.id}: {m.title} | amt: {m.amount} | status: {m.status}")

print("\n--- PROJECTS IN DB ---")
projects = Project.objects.all()
for p in projects:
    print(f"Project ID: {p.id} | title: '{p.title}' | budget: {p.budget} | status: {p.status} | approval: {getattr(p, 'approval_status', 'N/A')} | client: {p.client}")

print("\n--- PROPOSALS IN DB ---")
proposals = Proposal.objects.all()
for prop in proposals:
    print(f"Proposal ID: {prop.id} | project: '{prop.project}' | freelancer: {prop.freelancer} | bid: {prop.bid_amount} | status: {prop.status}")
