import os
import sys
import django

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from rest_framework.test import APIClient
from api.models import User, FreelancerProfile, UserProfile, FreelancerIdentityVerification

def run_tests():
    client = APIClient()
    print("=== STARTING CLEAN KYC & IDENTITY VERIFICATION MODULE TESTS ===")

    # Test User: james123@gmail.com
    fl_user, _ = User.objects.get_or_create(username='james123@gmail.com', defaults={'email': 'james123@gmail.com'})

    # -------------------------------------------------------------------------
    # 1. TEST UNSUBMITTED FREELANCER STATE
    # -------------------------------------------------------------------------
    print("\n1. Testing Unsubmitted Freelancer Account (james123@gmail.com)...")
    res = client.get(f'/api/freelancer/identity-verification/?user_id={fl_user.username}')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print("   Status:", data.get('status'))
    print("   History length:", len(data.get('history', [])))
    assert data.get('status') == 'NOT_SUBMITTED', f"Expected NOT_SUBMITTED, got {data.get('status')}"
    assert len(data.get('history', [])) == 0, f"Expected empty history, got {len(data.get('history', []))}"
    assert data.get('latest_verification') is None, "Expected latest_verification to be None"

    # Public verification status endpoint for clients
    pub_res = client.get(f'/api/freelancers/{fl_user.username}/verification-status/')
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    print("   Public Label:", pub_data.get('label'))
    assert pub_data.get('status') == 'NOT_SUBMITTED'
    assert pub_data.get('label') == 'Identity Not Verified'

    # Admin Queue when empty
    admin_res = client.get('/api/admin/identity-verifications/')
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    print("   Admin Queue Count:", admin_data.get('count'))
    assert admin_data.get('count') == 0, f"Expected 0 pending submissions, got {admin_data.get('count')}"

    # -------------------------------------------------------------------------
    # 2. TEST SUBMISSION WORKFLOW
    # -------------------------------------------------------------------------
    print("\n2. Testing Real Document Submission for james123@gmail.com...")
    sub_res = client.post('/api/freelancer/identity-verification/', {
        'user_id': fl_user.username,
        'document_type': 'Aadhaar Card',
        'document_number': '987654321098',
        'document_file_name': 'James_Aadhaar.pdf',
        'document_file_size': '1.5 MB'
    })
    assert sub_res.status_code == 201, f"Expected 201, got {sub_res.status_code}"
    sub_data = sub_res.json()
    print("   Submission Message:", sub_data.get('message'))
    print("   Submission Status:", sub_data.get('status'))
    assert sub_data.get('status') == 'PENDING'

    # Verify updated freelancer status
    res_after_sub = client.get(f'/api/freelancer/identity-verification/?user_id={fl_user.username}')
    data_after_sub = res_after_sub.json()
    assert data_after_sub.get('status') == 'PENDING'
    assert len(data_after_sub.get('history', [])) == 1
    assert data_after_sub['latest_verification']['document_number_masked'] == '98******1098'

    # Verify Admin Queue now contains 1 pending item
    admin_res_pending = client.get('/api/admin/identity-verifications/?status=pending')
    admin_data_pending = admin_res_pending.json()
    assert admin_data_pending.get('count') == 1
    assert admin_data_pending['verifications'][0]['user_id'] == fl_user.username
    v_id = admin_data_pending['verifications'][0]['id']

    # -------------------------------------------------------------------------
    # 3. TEST ADMIN APPROVAL WORKFLOW
    # -------------------------------------------------------------------------
    print(f"\n3. Testing Admin Approval for Submission ID #{v_id}...")
    app_res = client.post(f'/api/admin/identity-verifications/{v_id}/approve/')
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data.get('status') == 'APPROVED'

    # Verify profile is now verified
    fl_prof = FreelancerProfile.objects.get(user=fl_user)
    assert fl_prof.verified is True
    assert fl_prof.verification_status == 'Approved'

    pub_res_approved = client.get(f'/api/freelancers/{fl_user.username}/verification-status/')
    pub_data_approved = pub_res_approved.json()
    print("   Approved Public Label:", pub_data_approved.get('label'))
    assert pub_data_approved.get('status') == 'APPROVED'
    assert pub_data_approved.get('label') == 'Identity Verified'

    # -------------------------------------------------------------------------
    # 4. CLEANUP TEST DATA TO RESTORE PRISTINE STATE
    # -------------------------------------------------------------------------
    print("\n4. Cleaning up test data to restore unsubmitted state...")
    FreelancerIdentityVerification.objects.filter(freelancer=fl_user).delete()
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.save()
    up_prof = UserProfile.objects.filter(user=fl_user).first()
    if up_prof:
        up_prof.verified = False
        up_prof.verification_status = 'Not Submitted'
        up_prof.save()

    print("\n=== ALL CLEAN KYC TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
