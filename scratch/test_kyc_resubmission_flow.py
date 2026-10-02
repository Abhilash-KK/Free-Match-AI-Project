import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import FreelancerIdentityVerification, FreelancerProfile, UserProfile
from rest_framework.test import APIClient

def run_test():
    print("=== TESTING KYC RESUBMISSION WORKFLOW (UPDATE EXISTING RECORD) ===")

    # 1. Setup test freelancer account
    test_email = "resubmit_tester@example.com"
    user, created = User.objects.get_or_create(username="resubmit_tester", defaults={'email': test_email, 'first_name': 'Resubmit', 'last_name': 'Tester'})
    user.set_password("password123")
    user.save()

    fl_prof, _ = FreelancerProfile.objects.get_or_create(user=user)
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.verification_rejection_reason = ''
    fl_prof.save()

    # Clean up any existing verification records for test user
    FreelancerIdentityVerification.objects.filter(freelancer=user).delete()

    client = APIClient()

    # STEP 1: Freelancer Submits KYC (First Time)
    print("\n[STEP 1] Freelancer submits initial PAN Card KYC document...")
    res = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file_name': 'PAN_Card.pdf',
        'document_file_size': '1.5 MB'
    })
    assert res.status_code in [200, 201], f"Step 1 failed: {res.data}"
    v1 = FreelancerIdentityVerification.objects.filter(freelancer=user).first()
    assert v1 is not None, "Step 1 failed: No record created"
    initial_id = v1.id
    print(f" -> Initial KYC Record created. ID: {initial_id}, Status: {v1.status}")

    # Verify count == 1
    count = FreelancerIdentityVerification.objects.filter(freelancer=user).count()
    assert count == 1, f"Expected 1 record, got {count}"

    # STEP 2 & 3: Admin Rejects the KYC Document
    print("\n[STEP 2 & 3] Admin rejects the submitted KYC document with reason...")
    res_reject = client.post(f'/api/admin/identity-verifications/{initial_id}/reject/', {
        'rejection_reason': 'Document image is blurry and text is illegible.'
    })
    assert res_reject.status_code == 200, f"Step 2 failed: {res_reject.data}"

    v1.refresh_from_db()
    assert v1.status == 'REJECTED', f"Expected status REJECTED, got {v1.status}"
    assert v1.rejection_reason == 'Document image is blurry and text is illegible.'
    print(f" -> Record ID {initial_id} rejected. Status: {v1.status}, Reason: '{v1.rejection_reason}'")

    # Freelancer status check
    res_get = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_get.data['status'] == 'REJECTED'
    assert res_get.data['rejection_reason'] == 'Document image is blurry and text is illegible.'
    print(" -> Freelancer GET status verified: REJECTED with rejection reason displayed.")

    # STEP 4, 5, 6, 7: Freelancer Clicks Resubmit and Uploads New Aadhaar Document
    print("\n[STEP 4-7] Freelancer resubmits with new Aadhaar Card document...")
    res_resubmit = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'verification_id': initial_id,
        'document_type': 'Aadhaar Card',
        'document_number': '9876 5432 1098',
        'document_file_name': 'Aadhaar_Card_Clear.pdf',
        'document_file_size': '2.1 MB'
    })
    assert res_resubmit.status_code in [200, 201], f"Resubmit failed: {res_resubmit.data}"

    # STEP 7 CRITICAL CHECK: Ensure record count is STILL 1 and ID remains SAME
    all_records = list(FreelancerIdentityVerification.objects.filter(freelancer=user))
    assert len(all_records) == 1, f"FAILED: Expected 1 record, but found {len(all_records)} records! (Duplicate created)"
    updated_v = all_records[0]
    assert updated_v.id == initial_id, f"FAILED: Verification ID changed from {initial_id} to {updated_v.id}!"
    assert updated_v.status == 'PENDING', f"Expected status PENDING, got {updated_v.status}"
    assert updated_v.rejection_reason == '', f"Expected active rejection_reason to be cleared, got '{updated_v.rejection_reason}'"
    assert updated_v.document_type == 'Aadhaar Card'
    assert updated_v.document_number == '9876 5432 1098'
    print(f" -> SUCCESS! Record ID remains {initial_id} (0 duplicate records created). Status updated to PENDING.")

    # STEP 8 & 9: Login as Admin & Check Pending Queue
    print("\n[STEP 8 & 9] Checking Admin Pending Queue...")
    res_admin_pending = client.get('/api/admin/identity-verifications/?status=pending')
    assert res_admin_pending.status_code == 200
    pending_items = [x for x in res_admin_pending.data['verifications'] if x['user_id'] == user.username]
    assert len(pending_items) == 1, f"Expected exactly 1 pending item in Admin queue for freelancer, found {len(pending_items)}"
    pending_item = pending_items[0]
    assert pending_item['id'] == initial_id
    assert pending_item['document_type'] == 'Aadhaar Card'
    print(f" -> Admin Queue verified: Exactly 1 pending entry for ID {initial_id} with updated Aadhaar Card.")

    # STEP 10: Admin Approves the Resubmitted Record
    print("\n[STEP 10] Admin approves the resubmitted KYC document...")
    res_approve = client.post(f'/api/admin/identity-verifications/{initial_id}/approve/')
    assert res_approve.status_code == 200, f"Approval failed: {res_approve.data}"
    print(f" -> Record ID {initial_id} approved by Admin.")

    # STEP 11 & 12: Confirm Freelancer is Identity Verified and status persists
    print("\n[STEP 11 & 12] Confirming Freelancer Identity Verified status persists...")
    fl_prof.refresh_from_db()
    assert fl_prof.verified == True, "Freelancer profile verified flag is False!"
    assert fl_prof.verification_status == 'Approved', f"Freelancer profile status is {fl_prof.verification_status}"

    res_final_get = client.get(f'/api/freelancer/identity-verification/?user_id={user.username}')
    assert res_final_get.data['status'] == 'APPROVED', f"Expected APPROVED status, got {res_final_get.data['status']}"
    assert len(res_final_get.data['history']) == 1, f"Expected history length 1, got {len(res_final_get.data['history'])}"
    print(f" -> Freelancer Status: APPROVED. Verified Badge: True. History Count: {len(res_final_get.data['history'])}.")

    print("\n=== ALL 12 KYC RESUBMISSION TEST STEPS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_test()
