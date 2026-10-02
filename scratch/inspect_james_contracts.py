import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Contract, Project, Proposal, UserProfile, FreelancerProfile

User = get_user_model()

print("--- USERS SEARCH FOR James123@gmail.com ---")
users = User.objects.filter(email__iexact='james123@gmail.com') | User.objects.filter(username__iexact='james123@gmail.com')
if not users.exists():
    print("No exact match for james123@gmail.com, searching contains...")
    users = User.objects.filter(email__icontains='james') | User.objects.filter(username__icontains='james')

for u in users:
    print(f"\nUser ID: {u.id}, Username: '{u.username}', Email: '{u.email}', Name: '{u.first_name} {u.last_name}'")
    fl_prof = FreelancerProfile.objects.filter(user=u).first()
    if fl_prof:
        print(f"  FreelancerProfile rating={fl_prof.rating}, earnings={fl_prof.total_earnings}, verified={fl_prof.verified}")

    # Contracts as freelancer
    contracts = Contract.objects.filter(
        django.db.models.Q(freelancer=u) |
        django.db.models.Q(freelancer_id_str__iexact=u.username) |
        django.db.models.Q(freelancer_id_str__iexact=u.email)
    )
    print(f"  Contracts count as freelancer: {contracts.count()}")
    for c in contracts:
        print(f"    Contract {c.id} / {c.contract_id}: status={c.status}, project_name={c.project_name}, project_status={c.project.status if c.project else 'N/A'}, agreed_amount={c.agreed_amount}")

print("\n--- ALL COMPLETED CONTRACTS IN DB ---")
all_completed = Contract.objects.filter(
    django.db.models.Q(status='Completed') | django.db.models.Q(project__status='Completed')
)
for c in all_completed:
    fl_str = c.freelancer.email if c.freelancer else c.freelancer_id_str
    print(f"Completed Contract {c.id} / {c.contract_id}: Freelancer={fl_str}, Status={c.status}, Project={c.project_name}")
