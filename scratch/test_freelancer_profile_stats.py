import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Contract, ContractMilestone, Project, Proposal, UserProfile, FreelancerProfile
from django.db.models import Q
from rest_framework.test import APIRequestFactory
from api.views import freelancer_profile_detail_api

User = get_user_model()
factory = APIRequestFactory()

def safe_str(val):
    return str(val).encode('ascii', 'ignore').decode()

def run_tests():
    print("=== TESTING FREELANCER PROFILE STATISTICS & COMPLETED PROJECTS COUNT ===")

    # 1. Test James123@gmail.com
    james_user = User.objects.filter(Q(email__iexact='james123@gmail.com') | Q(username__iexact='james123@gmail.com')).first()
    assert james_user is not None, "James123 user should exist in DB"

    req_james = factory.get(f'/api/freelancer-profile/?username={james_user.email}')
    resp_james = freelancer_profile_detail_api(req_james)
    assert resp_james.status_code == 200, f"Expected 200 OK, got {resp_james.status_code}"
    data_james = resp_james.data

    print(f"\n1. James123 Profile API Response:")
    print(f"   Name: {data_james.get('name')}")
    print(f"   Email: {data_james.get('email')}")
    print(f"   Completed Projects Count: {data_james.get('completed_projects_count')}")
    print(f"   Total Earnings: {safe_str(data_james.get('total_earnings'))}")
    print(f"   Active Contracts Count: {data_james.get('active_contracts_count')}")

    assert data_james.get('completed_projects_count') == 1, f"James123 completed_projects_count must be 1, got {data_james.get('completed_projects_count')}"
    print("[PASSED] James123@gmail.com displays completed_projects_count = 1")

    # 2. Test Freelancer with 0 completed projects
    zero_user, _ = User.objects.get_or_create(username='zero_freelancer_test', defaults={'email': 'zero@test.com', 'first_name': 'Zero'})
    UserProfile.objects.get_or_create(user=zero_user, defaults={'role': 'freelancer'})
    FreelancerProfile.objects.get_or_create(user=zero_user)

    req_zero = factory.get(f'/api/freelancer-profile/?username={zero_user.username}')
    resp_zero = freelancer_profile_detail_api(req_zero)
    assert resp_zero.status_code == 200
    data_zero = resp_zero.data
    print(f"\n2. Zero Completed Projects Test:")
    print(f"   Completed Projects Count: {data_zero.get('completed_projects_count')}")
    assert data_zero.get('completed_projects_count') == 0, f"Zero freelancer completed_projects_count must be 0, got {data_zero.get('completed_projects_count')}"
    print("[PASSED] Freelancer with 0 completed projects displays completed_projects_count = 0")

    # 3. Test Freelancer with multiple completed projects & multi-milestones
    multi_user, _ = User.objects.get_or_create(username='multi_freelancer_test', defaults={'email': 'multi@test.com', 'first_name': 'Multi'})
    UserProfile.objects.get_or_create(user=multi_user, defaults={'role': 'freelancer'})
    FreelancerProfile.objects.get_or_create(user=multi_user)

    client_user, _ = User.objects.get_or_create(username='test_client_user', defaults={'email': 'client@test.com'})

    # Create Project 1 (Completed with 3 milestones)
    proj1 = Project.objects.create(title='Multi-Milestone Project 1', status='Completed', client=client_user)
    contract1 = Contract.objects.create(
        contract_id='CTR-TEST-001',
        project=proj1,
        client=client_user,
        freelancer=multi_user,
        freelancer_id_str=multi_user.username,
        project_name='Multi-Milestone Project 1',
        status='Completed',
        agreed_amount='₹20,000'
    )
    ContractMilestone.objects.create(contract=contract1, milestone_number=1, title='Phase 1', amount='₹5,000', status='Paid')
    ContractMilestone.objects.create(contract=contract1, milestone_number=2, title='Phase 2', amount='₹10,000', status='Paid')
    ContractMilestone.objects.create(contract=contract1, milestone_number=3, title='Phase 3', amount='₹5,000', status='Paid')

    # Create Project 2 (Completed)
    proj2 = Project.objects.create(title='Multi-Milestone Project 2', status='Completed', client=client_user)
    contract2 = Contract.objects.create(
        contract_id='CTR-TEST-002',
        project=proj2,
        client=client_user,
        freelancer=multi_user,
        freelancer_id_str=multi_user.username,
        project_name='Multi-Milestone Project 2',
        status='Completed',
        agreed_amount='₹30,000'
    )

    # Create Project 3 (Active - should NOT be counted in completed)
    proj3 = Project.objects.create(title='Active Project 3', status='Active', client=client_user)
    contract3 = Contract.objects.create(
        contract_id='CTR-TEST-003',
        project=proj3,
        client=client_user,
        freelancer=multi_user,
        freelancer_id_str=multi_user.username,
        project_name='Active Project 3',
        status='Active',
        agreed_amount='₹15,000'
    )

    # Create Project 4 (Cancelled - should NOT be counted)
    proj4 = Project.objects.create(title='Cancelled Project 4', status='Cancelled', client=client_user)
    contract4 = Contract.objects.create(
        contract_id='CTR-TEST-004',
        project=proj4,
        client=client_user,
        freelancer=multi_user,
        freelancer_id_str=multi_user.username,
        project_name='Cancelled Project 4',
        status='Cancelled',
        agreed_amount='₹10,000'
    )

    # Create Proposal only (No contract - should NOT be counted)
    proj5 = Project.objects.create(title='Bid Only Project 5', status='Open', client=client_user)
    Proposal.objects.create(project=proj5, freelancer=multi_user, bid_amount=5000, status='Submitted')

    req_multi = factory.get(f'/api/freelancer-profile/?username={multi_user.username}')
    resp_multi = freelancer_profile_detail_api(req_multi)
    assert resp_multi.status_code == 200
    data_multi = resp_multi.data

    print(f"\n3. Multi Completed Projects & Edge Cases Test:")
    print(f"   Completed Projects Count: {data_multi.get('completed_projects_count')}")
    print(f"   Active Contracts Count: {data_multi.get('active_contracts_count')}")
    print(f"   Total Earnings: {safe_str(data_multi.get('total_earnings'))}")

    assert data_multi.get('completed_projects_count') == 2, f"Expected 2 completed projects for multi_user, got {data_multi.get('completed_projects_count')}"
    print("[PASSED] Multi-completed projects count matches DB (2 completed, 1 active ignored, 1 cancelled ignored, 1 bid only ignored)")

    # Cleanup test records
    contract1.delete()
    contract2.delete()
    contract3.delete()
    contract4.delete()
    proj1.delete()
    proj2.delete()
    proj3.delete()
    proj4.delete()
    proj5.delete()
    multi_user.delete()
    zero_user.delete()
    client_user.delete()

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
