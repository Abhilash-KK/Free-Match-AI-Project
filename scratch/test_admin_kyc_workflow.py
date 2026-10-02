import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import FreelancerIdentityVerification, FreelancerProfile, UserProfile
from rest_framework.test import APIRequestFactory
from api.views import (
    freelancer_identity_verification_api,
    admin_identity_verifications_list_api,
    admin_approve_identity_verification_api,
    admin_reject_identity_verification_api,
    freelancer_public_verification_status_api,
    admin_dashboard_api
)

User = get_user_model()
factory = APIRequestFactory()

def run_workflow_tests():
    print("=== TESTING COMPLETE ADMIN & FREELANCER KYC END-TO-END WORKFLOW ===")

    # Setup test freelancer & admin users
    admin_user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@freematch.ai', 'is_staff': True})
    fl_user, _ = User.objects.get_or_create(username='ram123', defaults={'email': 'ram123@gmail.com', 'first_name': 'Ram', 'last_name': 'Roy'})
    UserProfile.objects.get_or_create(user=fl_user, defaults={'role': 'freelancer'})
    fl_prof, _ = FreelancerProfile.objects.get_or_create(user=fl_user)

    # Clean previous verification records for ram123 to test full clean workflow
    FreelancerIdentityVerification.objects.filter(freelancer=fl_user).delete()
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.save()

    # Step 1: Freelancer submits KYC document
    print("\n1. Freelancer submits PAN Card document...")
    req1 = factory.post('/api/freelancer/identity-verification/', {
        'user_id': fl_user.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file_name': 'Ram_Roy_PAN_Card.pdf',
        'document_file_size': '1.8 MB'
    })
    resp1 = freelancer_identity_verification_api(req1)
    assert resp1.status_code == 201
    assert resp1.data.get('status') == 'PENDING'
    print("   [PASSED] Freelancer KYC submission succeeded. Status = PENDING.")

    # Step 2: Admin views pending identity verifications queue
    print("\n2. Admin views pending identity verifications queue...")
    req2 = factory.get('/api/admin/identity-verifications/?status=pending')
    resp2 = admin_identity_verifications_list_api(req2)
    assert resp2.status_code == 200
    pending_list = resp2.data.get('verifications', [])
    assert len(pending_list) >= 1
    target_submission = next((x for x in pending_list if x['user_id'] == fl_user.username), None)
    assert target_submission is not None, "Submitted freelancer must be in Admin pending queue"
    assert target_submission['document_type'] == 'PAN Card'
    assert target_submission['document_number'] == 'ABCDE1234F'
    print(f"   [PASSED] Submitted freelancer '{target_submission['name']}' found in Admin PENDING queue!")

    # Step 3: Admin approves the KYC verification
    print("\n3. Admin approves identity verification...")
    v_id = target_submission['id']
    req3 = factory.post(f'/api/admin/identity-verifications/{v_id}/approve/', {
        'id': v_id,
        'user_id': fl_user.username
    })
    req3.user = admin_user
    resp3 = admin_approve_identity_verification_api(req3, pk=v_id)
    assert resp3.status_code == 200
    assert resp3.data.get('status') == 'APPROVED'

    fl_prof.refresh_from_db()
    assert fl_prof.verified is True, "FreelancerProfile verified flag must be True after approval"
    print("   [PASSED] Identity verification APPROVED. FreelancerProfile.verified = True.")

    # Step 4: Verify client public badge API
    print("\n4. Client checks freelancer verification badge...")
    req4 = factory.get(f'/api/freelancer/public-verification/{fl_prof.user.username}/')
    resp4 = freelancer_public_verification_status_api(req4, user_id=fl_prof.user.username)
    assert resp4.data.get('status') == 'APPROVED'
    assert resp4.data.get('label') == 'Identity Verified'
    print("   [PASSED] Client public API returns status APPROVED and label 'Identity Verified'.")

    # Step 5: Admin rejects verification with reason
    print("\n5. Admin rejects verification with feedback reason...")
    req5 = factory.post(f'/api/admin/identity-verifications/{v_id}/reject/', {
        'id': v_id,
        'user_id': fl_user.username,
        'rejection_reason': 'PAN Card image is blurry and text is not readable.'
    })
    req5.user = admin_user
    resp5 = admin_reject_identity_verification_api(req5, pk=v_id)
    assert resp5.status_code == 200
    assert resp5.data.get('status') == 'REJECTED'

    fl_prof.refresh_from_db()
    assert fl_prof.verified is False, "FreelancerProfile verified flag must be False after rejection"

    req5_get = factory.get(f'/api/freelancer/identity-verification/?user_id={fl_user.username}')
    resp5_get = freelancer_identity_verification_api(req5_get)
    assert resp5_get.data.get('status') == 'REJECTED'
    assert resp5_get.data.get('rejection_reason') == 'PAN Card image is blurry and text is not readable.'
    print("   [PASSED] Admin rejection updated status to REJECTED, revoked verified flag, and saved feedback reason.")

    print("\n=== ALL ADMIN KYC WORKFLOW TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_workflow_tests()
