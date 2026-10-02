import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from rest_framework.test import APIRequestFactory
from api.views import admin_dashboard_api

factory = APIRequestFactory()

def safe_str(val):
    return str(val).encode('ascii', 'ignore').decode()

def test_admin_api():
    req = factory.get('/api/admin-dashboard/')
    resp = admin_dashboard_api(req)
    print("Status Code:", resp.status_code)
    data = resp.data

    print("\n--- ADMIN DASHBOARD METRICS ---")
    metrics = data.get('metrics', {})
    for k, v in metrics.items():
        print(f"  {k}: {safe_str(v)}")

    print("\n--- CATEGORIES COUNT ---")
    cats = data.get('categories', [])
    print(f"Categories ({len(cats)}):")
    for c in cats:
        print(f"  Category: {safe_str(c)}")

    print("\n--- SKILLS COUNT ---")
    skills = data.get('skills', [])
    print(f"Skills ({len(skills)}):")
    for s in skills:
        print(f"  Skill: {safe_str(s)}")

    print("\n--- TRANSACTIONS COUNT ---")
    txs = data.get('transactions', [])
    print(f"Transactions ({len(txs)}):")
    for t in txs:
        print(f"  Tx: {safe_str(t)}")

    print("\n--- COMPLETED PROJECTS COUNT ---")
    cp = data.get('completed_projects', [])
    print(f"Completed Projects ({len(cp)}):")
    for c in cp:
        print(f"  CP: {safe_str(c.get('project_title'))}, Agreed: {safe_str(c.get('agreed_amount'))}, Paid: {safe_str(c.get('total_paid'))}")

    print("\n--- ACTIVE CONTRACTS COUNT ---")
    ac = data.get('active_contracts', [])
    print(f"Active Contracts ({len(ac)}):")
    for a in ac:
        print(f"  AC: {safe_str(a.get('project_name'))}, Client: {safe_str(a.get('client_name'))}, Freelancer: {safe_str(a.get('freelancer_name'))}")

    print("\n--- VERIFICATIONS COUNT ---")
    v_list = data.get('verifications', [])
    print(f"Verifications ({len(v_list)}):")
    for v in v_list:
        print(f"  Verification: {safe_str(v)}")

if __name__ == '__main__':
    test_admin_api()
