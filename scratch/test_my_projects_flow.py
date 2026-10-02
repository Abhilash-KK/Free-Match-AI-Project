import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000"

def get_json(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as res:
        data = res.read().decode('utf-8')
        return res.status, json.loads(data)

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        resp_data = res.read().decode('utf-8')
        return res.status, json.loads(resp_data)

def test_my_projects_data():
    print("--- TESTING MY PROJECTS DATA & VERIFICATION FLOW ---")

    # 1. Fetch Freelancer Verification Profile
    fl_username = "demo_freelancer"
    profile_url = f"{BASE_URL}/api/freelancer-profile/?username={fl_username}"
    status, prof_data = get_json(profile_url)
    print(f"1. GET /api/freelancer-profile/?username={fl_username} -> Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}"
    print(f"   verified: {prof_data.get('verified')}")
    print(f"   verification_status: {prof_data.get('verification_status')}")
    print(f"   verification_rejection_reason: {prof_data.get('verification_rejection_reason')}")
    assert "verification_status" in prof_data, "verification_status missing from profile response!"

    # 2. Fetch Freelancer Contracts (Assigned Projects)
    contracts_url = f"{BASE_URL}/api/contracts/?freelancer_id={fl_username}"
    status2, contracts = get_json(contracts_url)
    print(f"\n2. GET /api/contracts/?freelancer_id={fl_username} -> Status Code: {status2}")
    assert status2 == 200, f"Expected 200, got {status2}"
    print(f"   Contracts count: {len(contracts)}")
    if contracts:
        sample = contracts[0]
        print(f"   Sample Contract ID: {sample.get('id') or sample.get('contractId')}")
        print(f"   Sample Project Name: {sample.get('projectName') or sample.get('project')}")

    # 3. Test Admin Verification Status Update (Approve / Reject)
    admin_verify_url = f"{BASE_URL}/api/admin-dashboard/verify/"
    approve_payload = {
        "user_id": fl_username,
        "action": "approve"
    }
    status_app, _ = post_json(admin_verify_url, approve_payload)
    print(f"\n3. POST /api/admin-dashboard/verify/ (Approve) -> Status Code: {status_app}")
    assert status_app == 200, f"Expected 200, got {status_app}"
    
    # Check profile after approval
    _, res_prof_after = get_json(profile_url)
    print(f"   After Approve -> verified: {res_prof_after.get('verified')}, verification_status: {res_prof_after.get('verification_status')}")
    assert res_prof_after.get('verified') is True, "Expected verified=True after approve!"
    assert res_prof_after.get('verification_status') == "Approved", f"Expected Approved, got {res_prof_after.get('verification_status')}"

    # Rejection Test
    reject_payload = {
        "user_id": fl_username,
        "action": "reject",
        "reason": "ID image is blurry. Please re-upload a clear passport photo."
    }
    status_rej, _ = post_json(admin_verify_url, reject_payload)
    print(f"\n4. POST /api/admin-dashboard/verify/ (Reject) -> Status Code: {status_rej}")
    assert status_rej == 200, f"Expected 200, got {status_rej}"
    
    _, res_prof_rej = get_json(profile_url)
    print(f"   After Reject -> verified: {res_prof_rej.get('verified')}, verification_status: {res_prof_rej.get('verification_status')}, reason: {res_prof_rej.get('verification_rejection_reason')}")
    assert res_prof_rej.get('verification_status') == "Rejected", f"Expected Rejected, got {res_prof_rej.get('verification_status')}"
    assert "blurry" in res_prof_rej.get('verification_rejection_reason'), "Rejection reason mismatch!"

    # Reset back to Approved for demo freelancer
    post_json(admin_verify_url, approve_payload)
    print("\n--- ALL MY PROJECTS VERIFICATION FLOW TESTS PASSED SUCCESSFULLY ---")

if __name__ == "__main__":
    test_my_projects_data()
