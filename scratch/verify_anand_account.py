import urllib.request
import json

def test_anand_full_isolation():
    print("=== VERIFYING ANAND M P ACCOUNT ISOLATION ===")
    
    # 1. Projects API
    url_proj = "http://localhost:8000/api/projects/?client_id=205"
    req_proj = urllib.request.Request(url_proj, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_proj) as resp:
        projs = json.loads(resp.read().decode('utf-8'))
        print(f"Anand M P Projects count: {len(projs)}")
        assert len(projs) == 0, f"Expected 0 projects for Anand M P, got {len(projs)}"

    # 2. Proposals API
    url_prop = "http://localhost:8000/api/proposals/?client_id=205"
    req_prop = urllib.request.Request(url_prop, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_prop) as resp:
        props = json.loads(resp.read().decode('utf-8'))
        print(f"Anand M P Proposals count: {len(props)}")
        assert len(props) == 0, f"Expected 0 proposals for Anand M P, got {len(props)}"

    # 3. Contracts API
    url_ctr = "http://localhost:8000/api/contracts/?client_id=205"
    req_ctr = urllib.request.Request(url_ctr, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_ctr) as resp:
        ctrs = json.loads(resp.read().decode('utf-8'))
        print(f"Anand M P Contracts count: {len(ctrs)}")
        assert len(ctrs) == 0, f"Expected 0 contracts for Anand M P, got {len(ctrs)}"

    # 4. Active Contracts API
    url_act_ctr = "http://localhost:8000/api/contracts/?client_id=205&status=Active"
    req_act_ctr = urllib.request.Request(url_act_ctr, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_act_ctr) as resp:
        act_ctrs = json.loads(resp.read().decode('utf-8'))
        print(f"Anand M P Active Contracts count: {len(act_ctrs)}")
        assert len(act_ctrs) == 0, f"Expected 0 active contracts for Anand M P, got {len(act_ctrs)}"

    # 5. Saved Freelancers API
    url_fav = "http://localhost:8000/api/saved-freelancers/?client_id=205"
    req_fav = urllib.request.Request(url_fav, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_fav) as resp:
        favs = json.loads(resp.read().decode('utf-8'))
        print(f"Anand M P Saved Freelancers count: {len(favs)}")
        assert len(favs) == 0, f"Expected 0 saved freelancers for Anand M P, got {len(favs)}"

    print("\nSUCCESS: Anand M P account is 100% isolated and clean! All APIs return 0 items.")

if __name__ == "__main__":
    test_anand_full_isolation()
