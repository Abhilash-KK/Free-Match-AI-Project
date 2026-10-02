import os
import sys
import django

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Contract, Project

print("=== STARTING CONTRACT CLEANUP ===")

# Identify legitimate active contract for "Ai powered document analysis system"
legit_contract = Contract.objects.filter(contract_id='CTR-9938').first()
if legit_contract:
    agreed_str = str(legit_contract.agreed_amount).encode('ascii', 'ignore').decode()
    print(f"Legitimate contract CTR-9938 found: ID {legit_contract.id}, Project: {legit_contract.project_id}, Status: {legit_contract.status}, Agreed: {agreed_str}")
else:
    print("WARNING: Legitimate contract CTR-9938 not found by contract_id, searching by project title...")
    legit_contract = Contract.objects.filter(project__title__icontains="document analysis").first()
    if legit_contract:
        print(f"Found legitimate contract: ID {legit_contract.id}, Code: {legit_contract.contract_id}")

# Archive/Cancel orphan test contracts where project is NULL or project title contains test bot
orphan_contracts = Contract.objects.filter(project__isnull=True).exclude(id=legit_contract.id if legit_contract else None)

updated_count = 0
for c in orphan_contracts:
    print(f"Archiving orphan contract ID {c.id} (Code: '{c.contract_id}', Client Str: '{c.client_id_str}', Status: '{c.status}')")
    c.status = 'Archived'
    c.save()
    updated_count += 1

print(f"\nSuccessfully archived {updated_count} orphan/stale test contracts.")

active_count = Contract.objects.filter(status='Active', project__isnull=False).count()
print(f"Active valid contracts remaining in DB: {active_count}")
