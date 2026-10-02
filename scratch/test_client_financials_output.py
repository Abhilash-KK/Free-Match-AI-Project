import os
import sys
import django
import json

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'C:\Users\kkabh\OneDrive\Documents\FREEMATCH AI\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from api.views import client_financials_api

factory = APIRequestFactory()
request = factory.get('/api/client-financials/?client_id=abhilashkk123@gmail.com')
response = client_financials_api(request)

print("Status Code:", response.status_code)
print("Data:", json.dumps(response.data, indent=2))
