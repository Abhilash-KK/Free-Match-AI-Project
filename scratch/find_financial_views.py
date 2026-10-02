with open(r'backend/api/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re

lines = content.split('\n')
print("Total lines in views.py:", len(lines))

print("\n--- Functions matching financial / client / escrow ---")
for idx, line in enumerate(lines, 1):
    if any(k in line.lower() for k in ['def client', 'def financial', 'escrow', 'financials']):
        print(f"Line {idx}: {line}")
