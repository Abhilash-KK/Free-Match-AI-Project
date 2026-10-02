import re

with open(r'backend/api/views.py', 'r', encoding='utf-8') as f:
    views_code = f.read()

print("Search for 'audit' or 'security' in views.py:")
for idx, line in enumerate(views_code.split('\n'), 1):
    if any(k in line.lower() for k in ['audit', 'security_log', 'audit_log', 'log_action']):
        print(f"Line {idx}: {line}")
