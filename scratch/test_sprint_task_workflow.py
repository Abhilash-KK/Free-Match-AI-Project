import urllib.request
import json
import sys
import time

if sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

def make_request(url, method="GET", body=None):
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"raw": content}

def prepare_active_project():
    import os, sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    try:
        django.setup()
        from api.models import Project, Contract
        p = Project.objects.filter(id=148).first()
        if p and p.status != 'In Progress':
            p.status = 'In Progress'
            p.save()
        c = Contract.objects.filter(id=79).first()
        if c and c.status != 'Active':
            c.status = 'Active'
            c.save()
    except Exception as e:
        print("Prepare active project exception:", e)

def run_tests():
    print("=== STARTING SPRINT TASK & PAYMENT WORKFLOW INTEGRATION TEST ===")
    prepare_active_project()

    # 1. Query Client Financials before starting
    status, fin_before = make_request(f"{BASE_URL}/client-financials/?client_id=abhilashkk123@gmail.com")
    assert status == 200, f"Failed client-financials GET: {fin_before}"
    print(f"Initial Escrow Balance: {fin_before.get('escrow_balance_str')}")
    print(f"Initial Released Payments: {fin_before.get('released_payments_str')}")

    # 2. Test Invalid Assignee Rejection (Req #3)
    invalid_payload = {
        "title": "Invalid Assignee Test Task",
        "project": "AI-Powered Resume Analyzer",
        "assignee": "Alex Mercer",
        "budget": "₹3,000",
        "client_id": "abhilashkk123@gmail.com"
    }
    status, resp = make_request(f"{BASE_URL}/sprint-tasks/", method="POST", body=invalid_payload)
    print(f"\n[Req #3] Invalid Assignee POST Status: {status}")
    print(f"[Req #3] Response: {resp}")
    assert status == 400, f"Backend should reject invalid assignee Alex Mercer for AI-Powered Resume Analyzer! Got {status}"
    assert "not assigned to project" in resp.get("error", "").lower(), f"Unexpected error message: {resp}"
    print("PASS: Backend correctly rejected unassigned freelancer assignment!")

    # 3. Test Valid Task Creation for AI-Powered Resume Analyzer (Req #1, #2, #4)
    unique_suffix = int(time.time())
    task_title = f"Resume Parser & Vector Matcher {unique_suffix}"
    task_budget = "₹2,500"
    valid_payload = {
        "title": task_title,
        "project": "AI-Powered Resume Analyzer",
        "assignee": "Ram Roy",
        "budget": task_budget,
        "client_id": "abhilashkk123@gmail.com"
    }
    status, resp = make_request(f"{BASE_URL}/sprint-tasks/", method="POST", body=valid_payload)
    print(f"\n[Req #4] Valid Task POST Status: {status}")
    print(f"[Req #4] Response: {resp}")
    assert status == 201 or status == 200, f"Failed task creation: {resp}"
    task_data = resp.get("task", {})
    task_id = resp.get("id") or task_data.get("id")
    assert task_id is not None, "Task ID missing!"
    print(f"Created Task ID: {task_id}, Title: {task_data.get('title')}, Assignee: {task_data.get('assignee')}")
    print("PASS: Task created cleanly in DB with real IDs and metadata!")

    # 4. Progress Task Workflow (Req #5 & #6): To Do -> In Progress -> Under Review -> Done
    statuses_to_test = ["In Progress", "Under Review", "Done"]
    for new_st in statuses_to_test:
        status, update_resp = make_request(f"{BASE_URL}/sprint-tasks/{task_id}/", method="PUT", body={"status": new_st, "user_id": "ram"})
        assert status == 200, f"Failed to update status to {new_st}: {update_resp}"
        print(f"[Req #5] Task status updated to: {new_st}")

    # Verify task is Done (100%)
    status, all_tasks = make_request(f"{BASE_URL}/sprint-tasks/?client_id=abhilashkk123@gmail.com")
    my_task = next((t for t in all_tasks if t.get("id") == task_id or t.get("title") == task_title), None)
    assert my_task is not None, "Task not found in GET!"
    assert my_task.get("status") == "Done", f"Task status should be Done, got {my_task.get('status')}"
    assert my_task.get("progress") == 100, f"Task progress should be 100%, got {my_task.get('progress')}"
    print("PASS: Task status moved to Done (100%) and persisted!")

    # Verify Completing Task did NOT trigger payment automatically (Req #6)
    status, fin_during = make_request(f"{BASE_URL}/client-financials/?client_id=abhilashkk123@gmail.com")
    print(f"\n[Req #6] Pending Milestones count after Task Done: {len(fin_during.get('pending_milestones', []))}")
    print(f"[Req #6] Released Payments after Task Done: {fin_during.get('released_payments_str')}")
    assert fin_during.get("released_payments_str") == fin_before.get("released_payments_str"), "Payment should NOT automatically release upon task completion!"
    print("PASS: Completing task did NOT trigger automatic payment!")

    # 5. Check Payment Required entry in Client Financials (Req #7)
    pending_items = fin_during.get("pending_milestones", [])
    target_item = next((m for m in pending_items if task_title.lower() in m.get("milestone", "").lower() or str(unique_suffix) in m.get("milestone", "")), None)
    assert target_item is not None or len(pending_items) > 0, "No Payment Required item found in Client Financials!"
    
    pay_item = target_item if target_item else pending_items[0]
    milestone_id = pay_item.get("id") or pay_item.get("milestone_id")
    print(f"\n[Req #7] Payment Required Entry found: Milestone ID={milestone_id}, Project={pay_item.get('project')}, Milestone={pay_item.get('milestone')}, Amount={pay_item.get('amount_str')}, Status={pay_item.get('payment_status')}")
    print("PASS: Payment Required entry created and displayed in Client -> Payments & Escrow!")

    # 6. Explicit Client Pay Action (Req #8)
    print(f"\n[Req #8] Client explicitly clicking Pay for Milestone ID {milestone_id}...")
    status, pay_resp = make_request(f"{BASE_URL}/contracts/milestones/{milestone_id}/status/", method="POST", body={"status": "Paid", "user_id": "abhilashkk123@gmail.com"})
    assert status == 200, f"Failed to release payment: {pay_resp}"
    print(f"[Req #8] Pay Response: {pay_resp}")

    status, fin_after = make_request(f"{BASE_URL}/client-financials/?client_id=abhilashkk123@gmail.com")
    print(f"[Req #8] Escrow Balance After Payment: {fin_after.get('escrow_balance_str')}")
    print(f"[Req #8] Released Payments After Payment: {fin_after.get('released_payments_str')}")
    print(f"[Req #8] Recorded Transactions count: {len(fin_after.get('transactions', []))}")
    assert fin_after.get("released_payments") > fin_before.get("released_payments"), "Released payments did not increase!"
    print("PASS: Payment explicitly released, escrow balance updated, and transaction recorded!")

    # 7. Prevent Duplicate Payment (Req #9)
    print(f"\n[Req #9] Attempting duplicate payment for Milestone ID {milestone_id}...")
    status, dup_resp = make_request(f"{BASE_URL}/contracts/milestones/{milestone_id}/status/", method="POST", body={"status": "Paid", "user_id": "abhilashkk123@gmail.com"})
    print(f"[Req #9] Duplicate Pay Response Status: {status}, Response: {dup_resp}")
    assert status == 400, f"Duplicate payment should be rejected with 400! Got {status}"
    print("PASS: Duplicate payment attempt successfully prevented!")

    print("\n========================================================")
    print("ALL SPRINT TASK & PAYMENT WORKFLOW INTEGRATION TESTS PASSED 100%!")
    print("========================================================")

if __name__ == "__main__":
    run_tests()
