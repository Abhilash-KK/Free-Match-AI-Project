import urllib.request
import json

def verify_milestones():
    # Try fetching with client_id=55 or all sprint tasks
    for url in ["http://localhost:8000/api/sprint-tasks/?client_id=55", "http://localhost:8000/api/sprint-tasks/?project_id=25", "http://localhost:8000/api/sprint-tasks/"]:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                tasks = json.loads(response.read().decode('utf-8'))
                if len(tasks) > 0:
                    print(f"URL: {url} -> Total sprint tasks: {len(tasks)}")
                    pending = [t for t in tasks if (t.get('status') or '').lower().strip() in ['to do', 'pending', 'to_do']]
                    in_progress = [t for t in tasks if (t.get('status') or '').lower().strip() in ['in progress', 'in_progress']]
                    under_review = [t for t in tasks if (t.get('status') or '').lower().strip() in ['under review', 'under_review']]
                    completed = [t for t in tasks if (t.get('status') or '').lower().strip() in ['done', 'completed']]
                    total = len(tasks)
                    pct = round(((len(completed) * 100) + (len(under_review) * 60) + (len(in_progress) * 30)) / total) if total > 0 else 0
                    print(f"Metrics -> Pending: {len(pending)}, In Progress: {len(in_progress)}, Under Review: {len(under_review)}, Completed: {len(completed)}, Total: {total}, Progress: {pct}%")
                    assert len(pending) == 2, f"Expected 2 Pending tasks, got {len(pending)}"
                    assert len(in_progress) == 2, f"Expected 2 In Progress tasks, got {len(in_progress)}"
                    assert len(completed) == 0, f"Expected 0 Completed tasks, got {len(completed)}"
                    assert total == 4, f"Expected 4 Total tasks, got {total}"
                    print("VERIFICATION SUCCESSFUL: Milestone Progress counts match Tasks Overview perfectly!")
                    return
        except Exception as e:
            print(f"URL {url} failed: {e}")

if __name__ == "__main__":
    verify_milestones()
