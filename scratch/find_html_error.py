with open(r'postman_tests/newman/FreeMatch AI API Tests-2026-09-25-13-32-15-652-0.html', 'r', encoding='utf-8') as f:
    c1 = f.read()

import re
# Find all text inside <div id="collapse-failed-..." or failure details
print("Failure snippets from Report 1:")
for match in re.finditer(r'(AssertionError|ENOTFOUND|ECONNREFUSED|undefined|Invalid URL|status code)', c1):
    start = max(0, match.start() - 50)
    end = min(len(c1), match.end() + 100)
    print("MATCH:", c1[start:end].replace('\n', ' '))
    break
