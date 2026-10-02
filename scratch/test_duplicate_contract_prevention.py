import os
import sys
import django

sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Project, Contract, User
from rest_framework.test import APIRequestFactory
from api.views import hire_freelancer_api

print("=== TESTING DUPLICATE CONTRACT PREVENTION ===")

proj = Project.objects.filter(id=25).first() # Ai powered document analysis system
fl = User.objects.filter(email='james123@gmail.com').first()
client = proj.client if proj else None

print(f"Testing for Project ID: {proj.id if proj else 'None'}, Freelancer: {fl.email if fl else 'None'}")

# Count contracts before
count_before = Contract.objects.filter(project=proj, freelancer=fl).exclude(status__in=['Cancelled', 'Archived']).count()
print(f"Active contracts before duplicate call: {count_before}")

# Call hire_freelancer_api logic twice
factory = APIRequestFactory()
request_data = {
    'project_id': proj.id,
    'freelancer_id': fl.email,
    'client_id': client.username if client else 'abhilashkk123@gmail.com',
    'agreed_amount': '₹45,000'
}

request1 = factory.post('/api/hire-freelancer/', request_data, format='json')
resp1 = hire_freelancer_api(request1)
d1 = str(resp1.data).encode('ascii', 'ignore').decode()
print(f"Call 1 Response status: {resp1.status_code} | data: {d1}")

request2 = factory.post('/api/hire-freelancer/', request_data, format='json')
resp2 = hire_freelancer_api(request2)
d2 = str(resp2.data).encode('ascii', 'ignore').decode()
print(f"Call 2 Response status: {resp2.status_code} | data: {d2}")

count_after = Contract.objects.filter(project=proj, freelancer=fl).exclude(status__in=['Cancelled', 'Archived']).count()
print(f"Active contracts after duplicate calls: {count_after}")

assert count_after == 1, f"Expected 1 active contract, got {count_after}"
print("\nSUCCESS: Duplicate contract prevention verified! No duplicate contracts created.")
