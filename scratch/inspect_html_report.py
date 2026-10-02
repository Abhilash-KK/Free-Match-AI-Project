import re

file1 = r'postman_tests/newman/FreeMatch AI API Tests-2026-09-25-13-32-15-652-0.html'
file2 = r'newman/FreeMatch AI API Tests-2026-09-25-13-36-55-195-0.html'

with open(file1, 'r', encoding='utf-8') as f:
    c1 = f.read()

with open(file2, 'r', encoding='utf-8') as f:
    c2 = f.read()

def parse_report(html_text, name):
    print(f"=== {name} ===")
    total_req = re.search(r'Total Requests\s*<span[^>]*>(\d+)</span>', html_text)
    failed_tests = re.search(r'Failed Tests\s*<span[^>]*>(\d+)</span>', html_text)
    total_assertions = re.search(r'TOTAL ASSERTIONS</div>\s*<div[^>]*>\s*(\d+)', html_text)
    
    print("Total Requests:", total_req.group(1) if total_req else "N/A")
    print("Total Assertions:", total_assertions.group(1) if total_assertions else "N/A")
    print("Failed Tests:", failed_tests.group(1) if failed_tests else "N/A")
    
    # Check for sample errors
    failures = re.findall(r'<td class="align-middle text-center">\s*<span class="badge badge-danger">([^<]+)</span>', html_text)
    print("Failure badges count:", len(failures))
    
    # Sample error text
    err_matches = re.findall(r'<pre><code>(.*?)</code></pre>', html_text, re.DOTALL)
    if err_matches:
        print("Sample Error Text 1:", err_matches[0][:200].strip())

parse_report(c1, "Report 1 (19:02 - Screenshot)")
print("\n")
parse_report(c2, "Report 2 (19:06 - Fixed Run)")
