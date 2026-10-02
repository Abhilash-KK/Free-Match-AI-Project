import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import FreelancerIdentityVerification, FreelancerProfile
from rest_framework.test import APIClient
from django.utils import timezone
import datetime

def run_test():
    print("=== TESTING MULTIPLE APPROVED KYC VERIFICATION DISPLAY & HISTORY ===")

    test_username = "multi_kyc_tester"
    user, _ = User.objects.get_or_create(username=test_username, defaults={'email': 'multi_kyc@example.com', 'first_name': 'Multi', 'last_name': 'Tester'})
    user.set_password("password123")
    user.save()

    fl_prof, _ = FreelancerProfile.objects.get_or_create(user=user)
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.save()

    # Clear previous verifications for test user
    FreelancerIdentityVerification.objects.filter(freelancer=user).delete()

    client = APIClient()

    # --- SCENARIO A: First Document (Aadhaar Card) Approved ---
    print("\n[SCENARIO A] Submitting & Approving Aadhaar Card...")
    res_aadhaar = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'Aadhaar Card',
        'document_number': '1234 5678 9012',
        'document_file_name': 'Aadhaar.pdf'
    })
    v_aadhaar_id = res_aadhaar.data['verification']['id']
    
    # Admin Approves Aadhaar
    client.post(f'/api/admin/identity-verifications/{v_aadhaar_id}/approve/')

    # Check Freelancer View
    res_get_a = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_get_a.data['status'] == 'APPROVED'
    assert res_get_a.data['latest_verification']['document_type'] == 'Aadhaar Card'
    print(" -> Green box displays: Aadhaar Card (Approved).")

    # --- SCENARIO B: Second Document (PAN Card) Submitted & PENDING ---
    print("\n[SCENARIO B] Submitting PAN Card (Pending review)...")
    res_pan = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file_name': 'PAN_Card.pdf'
    })
    v_pan_id = res_pan.data['verification']['id']

    # Check Freelancer View while PAN is Pending
    res_get_b = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_get_b.data['status'] == 'APPROVED', f"Expected APPROVED status, got {res_get_b.data['status']}"
    assert res_get_b.data['latest_verification']['document_type'] == 'Aadhaar Card', "Green box should continue displaying Aadhaar Card while PAN is pending"
    assert len(res_get_b.data['history']) == 2, f"Expected history length 2, got {len(res_get_b.data['history'])}"
    print(" -> Green box CONTINUES displaying Aadhaar Card while PAN Card is Pending.")
    print(f" -> Verification History contains 2 records: {res_get_b.data['history'][0]['document_type']} ({res_get_b.data['history'][0]['status']}) & {res_get_b.data['history'][1]['document_type']} ({res_get_b.data['history'][1]['status']}).")

    # --- SCENARIO C: Admin Approves Second Document (PAN Card) ---
    print("\n[SCENARIO C] Admin approves PAN Card...")
    client.post(f'/api/admin/identity-verifications/{v_pan_id}/approve/')

    # Check Freelancer View after PAN is Approved
    res_get_c = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_get_c.data['status'] == 'APPROVED'
    assert res_get_c.data['latest_verification']['document_type'] == 'PAN Card', "Green box should update to show PAN Card as latest approved document"
    assert len(res_get_c.data['history']) == 2, f"Expected history length 2, got {len(res_get_c.data['history'])}"
    assert res_get_c.data['history'][0]['status'] == 'APPROVED' and res_get_c.data['history'][1]['status'] == 'APPROVED'
    print(" -> SUCCESS! Green box UPDATES to display PAN Card (latest approved document).")
    print(" -> Verification History PRESERVES both approved documents (Aadhaar Card & PAN Card)!")

    # --- SCENARIO D: Third Document (Passport) Submitted & REJECTED ---
    print("\n[SCENARIO D] Submitting Passport and Admin Rejects Passport...")
    res_pass = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'Passport',
        'document_number': 'P1234567',
        'document_file_name': 'Passport.pdf'
    })
    v_pass_id = res_pass.data['verification']['id']
    client.post(f'/api/admin/identity-verifications/{v_pass_id}/reject/', {'rejection_reason': 'Photo mismatch'})

    # Check Freelancer View after Passport is Rejected
    res_get_d = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_get_d.data['status'] == 'APPROVED', "Freelancer must remain APPROVED because PAN & Aadhaar are approved"
    assert res_get_d.data['latest_verification']['document_type'] == 'PAN Card', "Green box should continue displaying latest approved (PAN Card)"
    assert len(res_get_d.data['history']) == 3, f"Expected history length 3, got {len(res_get_d.data['history'])}"
    print(" -> Green box CONTINUES displaying PAN Card after Passport rejection.")
    print(" -> Account remains Identity Verified = True!")

    # --- SCENARIO E: Public Client Badge API ---
    print("\n[SCENARIO E] Checking Public Client Badge API...")
    res_pub = client.get(f'/api/freelancers/{user.username}/verification-status/')
    assert res_pub.data['status'] == 'APPROVED'
    assert res_pub.data['label'] == 'Identity Verified'
    print(" -> Public Client badge endpoint returns status = APPROVED & label = 'Identity Verified'.")

    print("\n=== ALL MULTIPLE APPROVED KYC DISPLAY TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_test()
