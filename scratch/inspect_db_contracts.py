import os
import sys
import django

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import UserProfile, Project, Proposal, Contract, ContractMilestone, Payment

print("=== USERS ===")
for u in UserProfile.objects.select_related('user').all():
    name = f"{u.user.first_name} {u.user.last_name}".strip() or u.user.username
    print(f"ID: {u.id} | User ID: {u.user.id} | Email: {u.user.email} | Username: {u.user.username} | Name: '{name}' | Role: {u.role}")

print("\n=== PROJECTS ===")
for p in Project.objects.select_related('client').all():
    c_name = f"{p.client.first_name} {p.client.last_name}".strip() if p.client else "None"
    print(f"ID: {p.id} | Title: '{p.title}' | Client ID: {p.client_id} ({c_name}) | Status: '{p.status}' | Budget: {str(p.budget).encode('ascii', 'ignore').decode()}")

print("\n=== PROPOSALS ===")
for prop in Proposal.objects.select_related('project', 'freelancer').all():
    p_title = prop.project.title if prop.project else "None"
    fl_email = prop.freelancer.email if prop.freelancer else "None"
    print(f"ID: {prop.id} | Project: {prop.project_id} ('{p_title}') | Freelancer: {prop.freelancer_id} ({fl_email}) | Status: '{prop.status}' | Bid: {str(prop.bid_amount).encode('ascii', 'ignore').decode()}")

print("\n=== CONTRACTS IN DB ===")
for c in Contract.objects.select_related('project', 'client', 'freelancer').all():
    proj_title = c.project.title if c.project else c.project_name or "No Project"
    client_name = f"{c.client.first_name} {c.client.last_name}".strip() if c.client else c.client_name or "No Client"
    fl_email = c.freelancer.email if c.freelancer else c.freelancer_name or "No Freelancer"
    print(f"ID: {c.id} | Contract ID: '{c.contract_id}' | Proj ID: {c.project_id} ('{proj_title}') | Client ID: {c.client_id} (Str: '{c.client_id_str}', Name: '{client_name}') | FL ID: {c.freelancer_id} (Str: '{c.freelancer_id_str}', Email: '{fl_email}') | Status: '{c.status}' | Agreed: {str(c.agreed_amount).encode('ascii', 'ignore').decode()} | Escrow: {str(c.escrow_balance).encode('ascii', 'ignore').decode()}")

print("\n=== CONTRACT MILESTONES IN DB ===")
for cm in ContractMilestone.objects.select_related('contract').all():
    code = cm.contract.contract_id if cm.contract else "No Contract"
    print(f"ID: {cm.id} | Contract: {code} | Title: '{cm.title}' | Amount: {str(cm.amount).encode('ascii', 'ignore').decode()} | Status: '{cm.status}'")

print("\n=== PAYMENTS IN DB ===")
for p in Payment.objects.select_related('contract').all():
    code = p.contract.contract_id if p.contract else "No Contract"
    print(f"ID: {p.id} | Contract: {code} | Amount: {str(p.amount).encode('ascii', 'ignore').decode()} | Type: {p.payment_type} | Status: '{p.status}'")
