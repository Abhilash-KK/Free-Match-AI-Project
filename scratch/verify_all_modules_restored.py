import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from rest_framework.test import APIRequestFactory
from api.views import admin_dashboard_api, client_dashboard_api, freelancer_dashboard_api

factory = APIRequestFactory()

def safe_str(val):
    return str(val).encode('ascii', 'ignore').decode()

def run_all_checks():
    print("=== FINAL SYSTEM RESTORATION & HEALTH CHECK VALIDATION ===")

    # 1. Admin Dashboard API
    req_admin = factory.get('/api/admin-dashboard/')
    resp_admin = admin_dashboard_api(req_admin)
    assert resp_admin.status_code == 200, f"Expected 200 OK from admin_dashboard_api, got {resp_admin.status_code}"
    admin_data = resp_admin.data

    metrics = admin_data.get('metrics', {})
    categories = admin_data.get('categories', [])
    skills = admin_data.get('skills', [])
    transactions = admin_data.get('transactions', [])
    completed_projects = admin_data.get('completed_projects', [])
    active_contracts = admin_data.get('active_contracts', [])
    verifications = admin_data.get('verifications', [])

    print(f"\n1. Admin Dashboard API Check:")
    print(f"   Status Code: {resp_admin.status_code}")
    print(f"   Platform Revenue: {safe_str(metrics.get('platform_revenue'))}")
    print(f"   Total Escrow Volume: {safe_str(metrics.get('total_escrow_volume'))}")
    print(f"   Category Count: {len(categories)}")
    print(f"   Skill Count: {len(skills)}")
    print(f"   Transactions Count: {len(transactions)}")
    print(f"   Completed Projects Count: {len(completed_projects)}")
    print(f"   Active Contracts Count: {len(active_contracts)}")
    print(f"   KYC Verifications Count: {len(verifications)}")

    assert len(categories) == 6, f"Expected 6 categories, got {len(categories)}"
    assert len(transactions) == 4, f"Expected 4 transactions, got {len(transactions)}"
    assert len(completed_projects) == 1, f"Expected 1 completed project, got {len(completed_projects)}"
    assert len(active_contracts) == 1, f"Expected 1 active contract, got {len(active_contracts)}"
    print("[PASSED] Admin Dashboard API returns 200 OK with all genuine categories, transactions, escrow, and projects!")

    # 2. Client Dashboard API
    req_client = factory.get('/api/client-dashboard/?user_id=abhilashkk123@gmail.com')
    resp_client = client_dashboard_api(req_client)
    assert resp_client.status_code == 200, f"Expected 200 OK from client_dashboard_api, got {resp_client.status_code}"
    print(f"\n2. Client Dashboard API Check:")
    print(f"   Status Code: {resp_client.status_code}")
    print("[PASSED] Client Dashboard API returns 200 OK!")

    # 3. Freelancer Dashboard API
    req_fl = factory.get('/api/freelancer-dashboard/?user_id=ram123@gmail.com')
    resp_fl = freelancer_dashboard_api(req_fl)
    assert resp_fl.status_code == 200, f"Expected 200 OK from freelancer_dashboard_api, got {resp_fl.status_code}"
    print(f"\n3. Freelancer Dashboard API Check:")
    print(f"   Status Code: {resp_fl.status_code}")
    print("[PASSED] Freelancer Dashboard API returns 200 OK!")

    print("\n=== ALL SYSTEM RESTORATION & HEALTH CHECKS PASSED 100%! ===")

if __name__ == '__main__':
    run_all_checks()
