import urllib.request
import json

def test_new_client_and_existing_client():
    print("=== TEST 1: NEW CLIENT ZERO-STATE VERIFICATION ===")
    new_client_id = "new_client_test_account"
    
    # 1. Financials API
    fin_url = f"http://localhost:8000/api/client-financials/?client_id={new_client_id}"
    req_fin = urllib.request.Request(fin_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_fin) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        avail = str(data.get('available_balance_str')).encode('ascii', 'ignore').decode()
        escrow = str(data.get('escrow_balance_str')).encode('ascii', 'ignore').decode()
        released = str(data.get('released_payments_str')).encode('ascii', 'ignore').decode()
        pending = str(data.get('pending_release_str')).encode('ascii', 'ignore').decode()
        withdrawn = str(data.get('total_withdrawn_str')).encode('ascii', 'ignore').decode()
        
        print(f"New Client Financials Response:")
        print(f"  - Available Balance: {avail}")
        print(f"  - Escrow Locked Balance: {escrow}")
        print(f"  - Total Released Payments: {released}")
        print(f"  - Pending Milestone Release: {pending}")
        print(f"  - Total Completed Withdrawals: {withdrawn}")
        print(f"  - Transactions Count: {len(data.get('transactions', []))}")

        assert data.get('available_balance_str') == '₹0', f"Expected ₹0, got {data.get('available_balance_str')}"
        assert data.get('escrow_balance_str') == '₹0', f"Expected ₹0, got {data.get('escrow_balance_str')}"
        assert data.get('released_payments_str') == '₹0', f"Expected ₹0, got {data.get('released_payments_str')}"
        assert data.get('pending_release_str') == '₹0', f"Expected ₹0, got {data.get('pending_release_str')}"
        assert data.get('total_withdrawn_str') == '₹0', f"Expected ₹0, got {data.get('total_withdrawn_str')}"
        assert len(data.get('transactions', [])) == 0, f"Expected 0 transactions, got {len(data.get('transactions', []))}"
        print("-> NEW CLIENT FINANCIALS PASSED PERFECTLY!\n")

    # 2. Projects, Contracts, Proposals APIs
    for endpoint in ['projects', 'contracts', 'proposals']:
        url = f"http://localhost:8000/api/{endpoint}/?client_id={new_client_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            items = json.loads(resp.read().decode('utf-8'))
            print(f"New Client {endpoint} count: {len(items)}")
            assert len(items) == 0, f"Expected 0 {endpoint}, got {len(items)}"
    print("-> NEW CLIENT DATA ISOLATION PASSED PERFECTLY!\n")

    print("=== TEST 2: EXISTING CLIENT DATA PRESERVATION ===")
    ex_url = "http://localhost:8000/api/contracts/?client_id=55&status=Active"
    req_ex = urllib.request.Request(ex_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_ex) as resp_ex:
        ex_contracts = json.loads(resp_ex.read().decode('utf-8'))
        print(f"Existing Client (Abhilash) Active Contracts Count: {len(ex_contracts)}")
        assert len(ex_contracts) == 1, f"Expected 1 active contract, got {len(ex_contracts)}"
        c = ex_contracts[0]
        agreed = str(c.get('agreedAmount') or c.get('amount')).encode('ascii', 'ignore').decode()
        print(f"  - Contract ID: {c.get('contractId')} | Project: '{c.get('projectName')}' | Agreed: {agreed}")
        assert '45,000' in agreed, f"Expected 45,000, got {agreed}"
        print("-> EXISTING CLIENT DATA PRESERVATION PASSED PERFECTLY!\n")

    print("=== ALL NEW CLIENT & EXISTING CLIENT TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_new_client_and_existing_client()
