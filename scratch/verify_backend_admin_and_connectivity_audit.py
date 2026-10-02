import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib import admin
from django.contrib.auth.models import User
from api import models
from rest_framework.test import APIClient

def run_audit():
    print("=== STARTING FULL DJANGO ADMIN, ENDPOINT & FRONTEND-BACKEND CONNECTIVITY AUDIT ===")

    # 1. Inspect & Verify All Django Models and Admin Registration
    all_models = [
        models.UserProfile,
        models.FreelancerProfile,
        models.SkillCategory,
        models.Skill,
        models.Project,
        models.SprintTask,
        models.Proposal,
        models.Contract,
        models.ContractMilestone,
        models.Payment,
        models.Review,
        models.Message,
        models.ContactMessage,
        models.Notification,
        models.SavedFreelancer,
        models.FreelancerPortfolio,
        models.FreelancerExperience,
        models.FreelancerEducation,
        models.FreelancerCertification,
        models.FreelancerWithdrawal,
        models.FreelancerIdentityVerification,
    ]

    print(f"\n[SECTION 1] Checking {len(all_models)} Django Models & Admin Registration...")
    registered_models = admin.site._registry

    unregistered = []
    for model in all_models:
        model_name = model.__name__
        if model in registered_models:
            print(f" [OK] Model '{model_name}' is registered in Django Admin.")
        else:
            print(f" [FAIL] Model '{model_name}' is NOT registered in Django Admin!")
            unregistered.append(model_name)

    assert len(unregistered) == 0, f"Unregistered models found: {unregistered}"

    # 2. Verify KYC Database -> REST API -> Admin -> Public Badge Connectivity
    print("\n[SECTION 2] Auditing KYC Database & API Connectivity...")
    fl_user, _ = User.objects.get_or_create(username="audit_freelancer", defaults={'email': 'audit_fl@example.com'})
    other_fl, _ = User.objects.get_or_create(username="other_freelancer", defaults={'email': 'other_fl@example.com'})
    client_user, _ = User.objects.get_or_create(username="audit_client", defaults={'email': 'audit_client@example.com'})

    client = APIClient()

    # Submit KYC document
    res_sub = client.post('/api/freelancer/identity-verification/', {
        'user_id': fl_user.username,
        'document_type': 'Aadhaar Card',
        'document_number': '1234 5678 9012',
        'document_file_name': 'Audit_Aadhaar.pdf',
        'document_file_size': '1.8 MB'
    })
    assert res_sub.status_code in [200, 201], f"KYC submission failed: {res_sub.data}"
    kyc_id = res_sub.data['verification']['id']
    print(f" [OK] Freelancer submitted KYC record #{kyc_id}.")

    # Admin List API check
    res_admin_list = client.get('/api/admin/identity-verifications/?status=pending')
    found_item = next((item for item in res_admin_list.data['verifications'] if item['id'] == kyc_id), None)
    assert found_item is not None, "Submitted KYC record not found in Admin List API!"
    assert found_item['document_type'] == 'Aadhaar Card'
    print(f" [OK] Admin List API returns record #{kyc_id} in Pending queue.")

    # Admin Approve check
    res_app = client.post(f'/api/admin/identity-verifications/{kyc_id}/approve/')
    assert res_app.status_code == 200, f"Approval failed: {res_app.data}"
    print(f" [OK] Admin Approval API executed successfully for #{kyc_id}.")

    # Freelancer Profile sync check
    fl_user.freelancer_profile.refresh_from_db()
    assert fl_user.freelancer_profile.verified == True
    assert fl_user.freelancer_profile.verification_status == 'Approved'
    print(" [OK] FreelancerProfile synced in database: verified = True.")

    # Public Client Badge check
    res_badge = client.get(f'/api/freelancers/{fl_user.username}/verification-status/')
    assert res_badge.status_code == 200
    assert res_badge.data['status'] == 'APPROVED'
    assert res_badge.data['label'] == 'Identity Verified'
    print(" [OK] Public Client Badge API returns status APPROVED & label 'Identity Verified'.")

    # 3. Security & Authorization Audit
    print("\n[SECTION 3] Auditing Security & Authorization Restrictions...")

    # Unauthorized document access check (other_fl trying to access fl_user's document)
    res_unauth = client.get(f'/api/identity-verifications/{kyc_id}/document/?user_id={other_fl.username}')
    assert res_unauth.status_code == 403, f"Expected 403 Forbidden for unauthorized user, got {res_unauth.status_code}"
    print(" [OK] Unauthorized document access blocked (403 Forbidden).")

    # Direct approval on REJECTED record check
    # Create rejected record
    res_sub2 = client.post('/api/freelancer/identity-verification/', {
        'user_id': other_fl.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file_name': 'PAN_Reject.pdf'
    })
    kyc2_id = res_sub2.data['verification']['id']
    client.post(f'/api/admin/identity-verifications/{kyc2_id}/reject/', {'rejection_reason': 'Invalid document.'})

    res_bad_app = client.post(f'/api/admin/identity-verifications/{kyc2_id}/approve/')
    assert res_bad_app.status_code == 400, f"Expected 400 Bad Request approving rejected record, got {res_bad_app.status_code}"
    print(" [OK] Direct approval on REJECTED record blocked by API (400 Bad Request).")

    # Clean up audit test records
    models.FreelancerIdentityVerification.objects.filter(id__in=[kyc_id, kyc2_id]).delete()

    # 4. Verify Essential API Endpoints
    print("\n[SECTION 4] Auditing Essential API Endpoints...")
    endpoints_to_test = [
        ('/api/projects/', 200),
        ('/api/categories/', 200),
        ('/api/contracts/', 200),
        ('/api/sprint-tasks/', 200),
        ('/api/notifications/?user_id=audit_freelancer', 200),
        ('/api/freelancer/identity-verification/?user_id=audit_freelancer', 200),
        ('/api/admin/identity-verifications/?status=all', 200),
    ]

    for path, expected_status in endpoints_to_test:
        r = client.get(path)
        assert r.status_code == expected_status, f"Endpoint {path} failed with status {r.status_code}"
        print(f" [OK] GET {path} returned HTTP {r.status_code}.")

    print("\n=== ALL CONNECTIVITY AND DJANGO ADMIN AUDIT TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_audit()
