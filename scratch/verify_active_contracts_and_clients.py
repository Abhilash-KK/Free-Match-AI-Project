import urllib.request
import json

def test_admin_and_client_verification():
    print("=== TEST 1: VERIFY SUPER ADMIN DASHBOARD API ===")
    admin_url = "http://localhost:8000/api/admin-dashboard/"
    req = urllib.request.Request(admin_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        
        metrics = data.get('metrics', {})
        active_cnt = metrics.get('active_contracts_count')
        escrow_vol = str(metrics.get('total_escrow_volume')).encode('ascii', 'ignore').decode()
        escrow_num = metrics.get('total_escrow_volume_num')
        active_list = data.get('active_contracts', [])
        
        print(f"Super Admin Active Contracts Count: {active_cnt}")
        print(f"Super Admin Escrow Volume: {escrow_vol} (Numeric: {escrow_num})")
        print(f"Active Contracts List Length: {len(active_list)}")
        
        for c in active_list:
            agreed = str(c.get('agreed_amount')).encode('ascii', 'ignore').decode()
            print(f"  - Contract ID: {c.get('contract_id')} | Project: '{c.get('project_title')}' | Client: '{c.get('client_name')}' ({c.get('client_email')}) | Freelancer: '{c.get('freelancer_name')}' | Agreed: {agreed}")
            
        assert active_cnt == 1, f"Expected 1 Active Contract, got {active_cnt}"
        assert escrow_num == 45000.0, f"Expected 45000.0 escrow volume, got {escrow_num}"
        assert len(active_list) == 1, f"Expected 1 active contract in list, got {len(active_list)}"
        assert active_list[0].get('contract_id') == 'CTR-9938', f"Expected CTR-9938, got {active_list[0].get('contract_id')}"
        assert '45,000' in active_list[0].get('agreed_amount'), f"Expected 45,000 in agreed amount, got {active_list[0].get('agreed_amount')}"
        
        print("-> SUPER ADMIN METRICS API PASSED PERFECTLY!\n")

    print("=== TEST 2: VERIFY ANAND M P CLIENT CONTRACTS ===")
    anand_url = "http://localhost:8000/api/contracts/?client_id=205&status=Active"
    req_anand = urllib.request.Request(anand_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_anand) as resp_anand:
        anand_contracts = json.loads(resp_anand.read().decode('utf-8'))
        print(f"Active contracts count for Anand M P: {len(anand_contracts)}")
        assert len(anand_contracts) == 0, f"Expected 0 active contracts for Anand M P, got {len(anand_contracts)}"
        print("-> ANAND M P CLIENT CONTRACTS PASSED PERFECTLY!\n")

    print("=== TEST 3: VERIFY ABHILASH CLIENT CONTRACTS ===")
    abhilash_url = "http://localhost:8000/api/contracts/?client_id=55&status=Active"
    req_abhilash = urllib.request.Request(abhilash_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_abhilash) as resp_abhilash:
        abhilash_contracts = json.loads(resp_abhilash.read().decode('utf-8'))
        print(f"Active contracts count for Abhilash: {len(abhilash_contracts)}")
        assert len(abhilash_contracts) == 1, f"Expected 1 active contract for Abhilash, got {len(abhilash_contracts)}"
        c = abhilash_contracts[0]
        c_code = c.get('contractId') or c.get('id')
        p_name = c.get('projectName') or c.get('project')
        agreed = str(c.get('agreedAmount') or c.get('amount')).encode('ascii', 'ignore').decode()
        print(f"  - Contract ID: {c_code} | Project: '{p_name}' | Agreed: {agreed}")
        assert c_code == 'CTR-9938' or c.get('db_id') == 18, "Contract ID mismatch"
        print("-> ABHILASH CLIENT CONTRACTS PASSED PERFECTLY!\n")

    print("=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_admin_and_client_verification()
