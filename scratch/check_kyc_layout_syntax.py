import re

def check_jsx_brackets(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    curly = 0
    paren = 0
    bracket = 0
    for char in content:
        if char == '{': curly += 1
        elif char == '}': curly -= 1
        elif char == '(': paren += 1
        elif char == ')': paren -= 1
        elif char == '[': bracket += 1
        elif char == ']': bracket -= 1

    print(f"{filepath}: curly={curly}, paren={paren}, bracket={bracket}")
    assert curly == 0, f"Unbalanced curly braces in {filepath}: {curly}"
    assert paren == 0, f"Unbalanced parentheses in {filepath}: {paren}"
    assert bracket == 0, f"Unbalanced square brackets in {filepath}: {bracket}"
    print(f"[PASSED] {filepath} has perfectly balanced syntax!")

check_jsx_brackets(r"c:\Users\kkabh\OneDrive\Documents\FREEMATCH AI\frontend\src\components\dashboards\FreelancerDashboard.jsx")
check_jsx_brackets(r"c:\Users\kkabh\OneDrive\Documents\FREEMATCH AI\frontend\src\components\FreelancerIdentityVerificationView.jsx")
