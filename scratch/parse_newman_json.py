import json

with open('scratch/newman_full_results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

run = data.get('run', {})
stats = run.get('stats', {})
print("Stats:", json.dumps(stats, indent=2))

executions = run.get('executions', [])
print(f"Total Executions: {len(executions)}")

if executions:
    e0 = executions[0]
    print("Keys in execution 0:", e0.keys())
    req = e0.get('request', {})
    res = e0.get('response', {})
    item = e0.get('item', {})
    print("Item name:", item.get('name'))
    print("Method:", req.get('method'))
    print("URL:", req.get('url'))
    print("Status code:", res.get('code'), res.get('status'))
    print("Response time:", res.get('responseTime'))
    print("Response size:", res.get('responseSize'))
    assertions = e0.get('assertions', [])
    print("Assertions count:", len(assertions))
    if assertions:
        print("Assertion 0:", assertions[0])
