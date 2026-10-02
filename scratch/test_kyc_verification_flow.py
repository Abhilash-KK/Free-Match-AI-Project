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
    admin_approve_identity_verification_api,
    admin_reject_identity_verification_api,
    freelancer_public_verification_status_api,
    freelancer_profile_detail_api
)

User = get_user_model()
factory = APIRequestFactory()

def safe_str(val):
    return str(val).encode('ascii', 'ignore').decode()

def run_tests():
    print("=== TESTING COMPLETE FREELANCER KYC & IDENTITY VERIFICATION WORKFLOW ===")

    # ---------------------------------------------------------------------------
    # Test Case 6 / Initial Check: James123@gmail.com (No document uploaded)
    # ---------------------------------------------------------------------------
    james = User.objects.filter(email='james123@gmail.com').first()
    assert james is not None, "James123 user must exist"

    req_j = factory.get(f'/api/freelancer/identity-verification/?user_id={james.email}')
    resp_j = freelancer_identity_verification_api(req_j)
    assert resp_j.status_code == 200
    assert resp_j.data.get('status') == 'NOT_SUBMITTED', f"James123 status must be NOT_SUBMITTED, got {resp_j.data.get('status')}"
    
    fp_j = FreelancerProfile.objects.get(user=james)
    assert fp_j.verified is False, "James123 verified flag must be False in DB"
    
    req_pub_j = factory.get(f'/api/freelancer/public-verification/{james.username}/')
    resp_pub_j = freelancer_public_verification_status_api(req_pub_j, user_id=james.username)
    assert resp_pub_j.data.get('status') == 'NOT_SUBMITTED'
    assert resp_pub_j.data.get('label') == 'Identity Not Verified'
    print("[PASSED] Test Case 6: James123@gmail.com with no KYC documents has status NOT_SUBMITTED, verified=False, label='Identity Not Verified'")

    # ---------------------------------------------------------------------------
    # Test Case 1: New freelancer with no KYC document
    # ---------------------------------------------------------------------------
    test_fl, _ = User.objects.get_or_create(username='kyc_test_fl', defaults={'email': 'kyc_test@freematch.ai', 'first_name': 'KYC', 'last_name': 'Tester'})
    UserProfile.objects.get_or_create(user=test_fl, defaults={'role': 'freelancer'})
    fl_prof, _ = FreelancerProfile.objects.get_or_create(user=test_fl)
    
    # Cleanup any pre-existing KYC records for clean test execution
    FreelancerIdentityVerification.objects.filter(freelancer=test_fl).delete()
    fl_prof.verified = False
    fl_prof.verification_status = 'Not Submitted'
    fl_prof.save()

    req1 = factory.get(f'/api/freelancer/identity-verification/?user_id={test_fl.username}')
    resp1 = freelancer_identity_verification_api(req1)
    assert resp1.status_code == 200
    assert resp1.data.get('status') == 'NOT_SUBMITTED'
    assert resp1.data.get('latest_verification') is None
    print("[PASSED] Test Case 1: New freelancer with no document returns status NOT_SUBMITTED, no verified badge")

    # ---------------------------------------------------------------------------
    # Test Case 2: Freelancer uploads document -> PENDING
    # ---------------------------------------------------------------------------
    req2 = factory.post('/api/freelancer/identity-verification/', {
        'user_id': test_fl.username,
        'document_type': 'Aadhaar Card',
        'document_number': '1234-5678-9012',
        'document_file_name': 'test_aadhaar.pdf',
        'document_file_size': '1.5 MB'
    })
    resp2 = freelancer_identity_verification_api(req2)
    assert resp2.status_code == 201
    assert resp2.data.get('status') == 'PENDING'

    fl_prof.refresh_from_db()
    assert fl_prof.verified is False, "FreelancerProfile verified must be False when PENDING"
    assert fl_prof.verification_status == 'Pending Verification'

    req2_get = factory.get(f'/api/freelancer/identity-verification/?user_id={test_fl.username}')
    resp2_get = freelancer_identity_verification_api(req2_get)
    assert resp2_get.data.get('status') == 'PENDING'
    print("[PASSED] Test Case 2: Uploaded document creates PENDING record, verified flag remains False")

    # ---------------------------------------------------------------------------
    # Test Case 3: Admin approves document -> APPROVED
    # ---------------------------------------------------------------------------
    latest_kyc = FreelancerIdentityVerification.objects.filter(freelancer=test_fl).order_by('-submitted_at').first()
    assert latest_kyc is not None

    req3 = factory.post('/api/admin/identity-verifications/approve/', {
        'id': latest_kyc.id,
        'user_id': test_fl.username
    })
    resp3 = admin_approve_identity_verification_api(req3)
    assert resp3.status_code == 200
    assert resp3.data.get('status') == 'APPROVED'
    assert resp3.data.get('verified') is True

    fl_prof.refresh_from_db()
    assert fl_prof.verified is True, "FreelancerProfile verified must be True when APPROVED"

    req3_pub = factory.get(f'/api/freelancer/public-verification/{test_fl.username}/')
    resp3_pub = freelancer_public_verification_status_api(req3_pub, user_id=test_fl.username)
    assert resp3_pub.data.get('status') == 'APPROVED'
    assert resp3_pub.data.get('label') == 'Identity Verified'
    print("[PASSED] Test Case 3: Admin approval sets status APPROVED, verified=True, label='Identity Verified'")

    # ---------------------------------------------------------------------------
    # Test Case 4: Admin rejects document -> REJECTED
    # ---------------------------------------------------------------------------
    req4 = factory.post('/api/admin/identity-verifications/reject/', {
        'id': latest_kyc.id,
        'user_id': test_fl.username,
        'rejection_reason': 'Document image is blurry and text is unreadable.'
    })
    resp4 = admin_reject_identity_verification_api(req4)
    assert resp4.status_code == 200
    assert resp4.data.get('status') == 'REJECTED'
    assert resp4.data.get('rejection_reason') == 'Document image is blurry and text is unreadable.'

    fl_prof.refresh_from_db()
    assert fl_prof.verified is False, "FreelancerProfile verified must be False when REJECTED"

    req4_get = factory.get(f'/api/freelancer/identity-verification/?user_id={test_fl.username}')
    resp4_get = freelancer_identity_verification_api(req4_get)
    assert resp4_get.data.get('status') == 'REJECTED'
    assert resp4_get.data.get('rejection_reason') == 'Document image is blurry and text is unreadable.'
    print("[PASSED] Test Case 4: Admin rejection sets status REJECTED, stores rejection reason, verified=False")

    # ---------------------------------------------------------------------------
    # Test Case 5: Freelancer resubmits after rejection -> PENDING
    # ---------------------------------------------------------------------------
    req5 = factory.post('/api/freelancer/identity-verification/', {
        'user_id': test_fl.username,
        'document_type': 'Passport',
        'document_number': 'Z9876543',
        'document_file_name': 'clear_passport.pdf',
        'document_file_size': '2.1 MB'
    })
    resp5 = freelancer_identity_verification_api(req5)
    assert resp5.status_code == 201
    assert resp5.data.get('status') == 'PENDING'

    fl_prof.refresh_from_db()
    assert fl_prof.verified is False, "Verified must remain False after resubmission until approved"

    req5_get = factory.get(f'/api/freelancer/identity-verification/?user_id={test_fl.username}')
    resp5_get = freelancer_identity_verification_api(req5_get)
    assert resp5_get.data.get('status') == 'PENDING'
    print("[PASSED] Test Case 5: Resubmission creates new PENDING record, verified remains False until Admin approves")

    # Cleanup test freelancer
    FreelancerIdentityVerification.objects.filter(freelancer=test_fl).delete()
    test_fl.delete()

    print("\n=== ALL 6 KYC VERIFICATION TEST CASES PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
