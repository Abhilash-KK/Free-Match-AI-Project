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
    print("=== TESTING COMPLETE ADMIN KYC REJECTED VERIFICATIONS + RESUBMISSION WORKFLOW (20 STEPS) ===")

    # Setup test freelancer account
    test_username = "resubmit_workflow_user"
    user, _ = User.objects.get_or_create(username=test_username, defaults={'email': 'resubmit_workflow@example.com', 'first_name': 'Resubmit', 'last_name': 'User'})
    user.set_password("password123")
    user.save()

    fl_prof, _ = FreelancerProfile.objects.get_or_create(user=user)
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.verification_rejection_reason = ''
    fl_prof.save()

    # Clean up previous verifications for test user
    FreelancerIdentityVerification.objects.filter(freelancer=user).delete()

    client = APIClient()

    # STEP 1: Freelancer submits KYC
    print("\n[STEP 1] Freelancer submits initial PAN Card KYC document...")
    res = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file_name': 'PAN_Card.pdf',
        'document_file_size': '1.2 MB'
    })
    assert res.status_code in [200, 201], f"Step 1 failed: {res.data}"
    sub1 = FreelancerIdentityVerification.objects.filter(freelancer=user, status='PENDING').first()
    assert sub1 is not None, "Step 1 failed: No pending record created"
    sub1_id = sub1.id
    print(f" -> Created submission #1. ID: {sub1_id}, Status: PENDING")

    # STEP 2: Admin sees it in Pending
    print("\n[STEP 2] Admin checks Pending Queue...")
    res_pending = client.get('/api/admin/identity-verifications/?status=pending')
    pending_ids = [x['id'] for x in res_pending.data['verifications'] if x['user_id'] == user.username]
    assert sub1_id in pending_ids, f"Step 2 failed: Submission {sub1_id} not in pending list"
    print(f" -> Admin sees submission #{sub1_id} in Pending Queue.")

    # STEP 3 & 4: Admin rejects it -> Moves to Rejected
    print("\n[STEP 3 & 4] Admin rejects submission #1...")
    res_rej = client.post(f'/api/admin/identity-verifications/{sub1_id}/reject/', {
        'rejection_reason': 'Document is blurry and unreadable.'
    })
    assert res_rej.status_code == 200, f"Step 3 failed: {res_rej.data}"
    sub1.refresh_from_db()
    assert sub1.status == 'REJECTED'
    print(f" -> Submission #{sub1_id} status updated to REJECTED.")

    res_rejected_list = client.get('/api/admin/identity-verifications/?status=rejected')
    rejected_ids = [x['id'] for x in res_rejected_list.data['verifications'] if x['user_id'] == user.username]
    assert sub1_id in rejected_ids, "Step 4 failed: Record #1 not in Admin Rejected list"
    print(f" -> Submission #{sub1_id} present in Admin Rejected list.")

    # STEP 5 & 6: Confirm rejected record has NO Approve action (API blocks direct approve on REJECTED)
    print("\n[STEP 5 & 6] Verifying status security & Delete availability on rejected record...")
    res_bad_approve = client.post(f'/api/admin/identity-verifications/{sub1_id}/approve/')
    assert res_bad_approve.status_code == 400, f"Expected 400 Bad Request approving rejected record, got {res_bad_approve.status_code}"
    print(" -> API successfully BLOCKED attempt to approve a REJECTED record directly!")

    # STEP 7, 8, 9: Freelancer sees Rejected and Resubmits new document
    print("\n[STEP 7-9] Freelancer resubmits new Aadhaar Card document...")
    res_resubmit = client.post('/api/freelancer/identity-verification/', {
        'user_id': user.username,
        'document_type': 'Aadhaar Card',
        'document_number': '9876 5432 1098',
        'document_file_name': 'Aadhaar_Clear.pdf',
        'document_file_size': '2.0 MB'
    })
    assert res_resubmit.status_code in [200, 201], f"Resubmit failed: {res_resubmit.data}"

    # STEP 10, 11, 12, 13, 14: Admin Pending Queue & Old Rejected History Check
    print("\n[STEP 10-14] Admin checks Pending Queue and Rejected list after resubmission...")
    res_pending2 = client.get('/api/admin/identity-verifications/?status=pending')
    pending_records_for_user = [x for x in res_pending2.data['verifications'] if x['user_id'] == user.username]
    assert len(pending_records_for_user) == 1, f"Expected exactly 1 pending request for user, found {len(pending_records_for_user)}"
    sub2 = pending_records_for_user[0]
    sub2_id = sub2['id']
    assert sub2_id != sub1_id, f"Resubmission should create a new attempt ID distinct from sub1 #{sub1_id}"
    assert sub2['status'] == 'PENDING'
    assert sub2['document_type'] == 'Aadhaar Card'
    print(f" -> New submission #{sub2_id} created with status PENDING. Exactly 1 pending entry in queue.")

    # Confirm old rejected sub1 remains in Rejected list (History preserved!)
    res_rejected_list2 = client.get('/api/admin/identity-verifications/?status=rejected')
    rejected_ids2 = [x['id'] for x in res_rejected_list2.data['verifications'] if x['user_id'] == user.username]
    assert sub1_id in rejected_ids2, f"Old rejected submission #{sub1_id} should remain in Rejected list as history"
    print(f" -> Old rejected submission #{sub1_id} preserved in Rejected list as history.")

    # STEP 15, 16, 17: Admin approves new pending submission #2
    print("\n[STEP 15-17] Admin approves the new pending submission #2...")
    res_app2 = client.post(f'/api/admin/identity-verifications/{sub2_id}/approve/')
    assert res_app2.status_code == 200, f"Approval failed: {res_app2.data}"

    fl_prof.refresh_from_db()
    assert fl_prof.verified == True
    assert fl_prof.verification_status == 'Approved'
    print(f" -> Submission #{sub2_id} APPROVED! Freelancer is now Identity Verified.")

    # STEP 18: Client Public Badge API Check
    print("\n[STEP 18] Verifying safe public client badge API...")
    res_pub = client.get(f'/api/freelancers/{user.username}/verification-status/')
    assert res_pub.status_code == 200
    assert res_pub.data['status'] == 'APPROVED'
    assert res_pub.data['label'] == 'Identity Verified'
    print(" -> Public Client badge endpoint returns status = APPROVED & label = 'Identity Verified'.")

    # STEP 19 & 20: Test Delete on the old rejected record #1
    print("\n[STEP 19 & 20] Testing Admin DELETE action on old rejected record #1...")
    res_del = client.delete(f'/api/admin/identity-verifications/{sub1_id}/delete/')
    assert res_del.status_code == 200, f"Delete failed: {res_del.data}"

    # Confirm record #1 is deleted from DB
    assert FreelancerIdentityVerification.objects.filter(id=sub1_id).first() is None
    print(f" -> Old rejected record #{sub1_id} deleted from database.")

    # Confirm record #2 (APPROVED) remains untouched in DB and profile remains verified
    sub2_obj = FreelancerIdentityVerification.objects.filter(id=sub2_id).first()
    assert sub2_obj is not None and sub2_obj.status == 'APPROVED'
    fl_prof.refresh_from_db()
    assert fl_prof.verified == True
    assert fl_prof.verification_status == 'Approved'
    print(f" -> Approved submission #{sub2_id} and Freelancer Verified status remain 100% INTACT!")

    print("\n=== ALL 20 ADMIN KYC REJECTED VERIFICATIONS + RESUBMISSION WORKFLOW STEPS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_test()
