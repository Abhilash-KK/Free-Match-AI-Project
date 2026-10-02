import os
import sys
import django
from io import BytesIO

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from api.models import User, FreelancerIdentityVerification, FreelancerProfile

def test_pdf_and_image_preview_download():
    client = APIClient()
    print("=== STARTING KYC DOCUMENT PREVIEW & DOWNLOAD AUTOMATED TEST ===")

    # 1. Prepare test freelancer user
    fl_user, _ = User.objects.get_or_create(username='james123@gmail.com', defaults={'email': 'james123@gmail.com'})

    # Clean up previous test entries for james123@gmail.com
    FreelancerIdentityVerification.objects.filter(freelancer=fl_user).delete()

    # -------------------------------------------------------------------------
    # TEST A: UPLOAD REAL PDF DOCUMENT
    # -------------------------------------------------------------------------
    print("\n[TEST A] Uploading real PDF document ('Abhilash_KK_Internship_Report_.pdf')...")
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kinds [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    pdf_file = SimpleUploadedFile(
        name="Abhilash_KK_Internship_Report_.pdf",
        content=pdf_content,
        content_type="application/pdf"
    )

    sub_res = client.post('/api/freelancer/identity-verification/', {
        'user_id': fl_user.username,
        'document_type': 'PAN Card',
        'document_number': 'ABCDE1234F',
        'document_file': pdf_file
    }, format='multipart')

    assert sub_res.status_code == 201, f"Expected 201, got {sub_res.status_code}"
    sub_data = sub_res.json()
    print("[OK] Upload response:", sub_data.get('message'))

    # Verify DB Record
    v_rec = FreelancerIdentityVerification.objects.filter(freelancer=fl_user, document_type='PAN Card').first()
    assert v_rec is not None, "DB Record not created"
    assert v_rec.document_file_name == "Abhilash_KK_Internship_Report_.pdf"
    assert v_rec.document_file is not None, "FileField is None!"
    assert os.path.exists(v_rec.document_file.path), f"File path on disk does not exist: {v_rec.document_file.path}"
    print(f"[OK] DB Record verified! Stored file path on disk: {v_rec.document_file.path}")

    # Verify Admin List API returns document URLs
    admin_res = client.get('/api/admin/identity-verifications/')
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    v_item = [x for x in admin_data.get('verifications', []) if x['id'] == v_rec.id][0]
    
    doc_preview_url = v_item['document_file_url']
    doc_download_url = v_item['document_download_url']
    print(f"[OK] Preview URL: {doc_preview_url}")
    print(f"[OK] Download URL: {doc_download_url}")

    # Test Preview endpoint (inline PDF)
    preview_res = client.get(f'/api/identity-verifications/{v_rec.id}/document/')
    assert preview_res.status_code == 200, f"Preview returned {preview_res.status_code}"
    assert preview_res['Content-Type'] == 'application/pdf', f"Expected application/pdf, got {preview_res['Content-Type']}"
    assert 'inline' in preview_res['Content-Disposition'], "Expected inline disposition"
    preview_bytes = b''.join(preview_res.streaming_content)
    assert preview_bytes == pdf_content, "Preview PDF content does not match original uploaded bytes!"
    print("[OK] PDF Preview API verified! Returns exact PDF bytes with Content-Type: application/pdf & inline disposition.")

    # Test Download endpoint (attachment PDF)
    download_res = client.get(f'/api/identity-verifications/{v_rec.id}/document/?download=true')
    assert download_res.status_code == 200, f"Download returned {download_res.status_code}"
    assert download_res['Content-Type'] == 'application/pdf', f"Expected application/pdf, got {download_res['Content-Type']}"
    assert 'attachment' in download_res['Content-Disposition'], "Expected attachment disposition"
    assert 'Abhilash_KK_Internship_Report_.pdf' in download_res['Content-Disposition']
    dl_bytes = b''.join(download_res.streaming_content)
    assert dl_bytes == pdf_content, "Downloaded PDF content does not match original uploaded bytes!"
    print("[OK] PDF Download API verified! Returns exact original PDF bytes with attachment disposition.")

    # -------------------------------------------------------------------------
    # TEST B: UPLOAD REAL PNG IMAGE DOCUMENT
    # -------------------------------------------------------------------------
    print("\n[TEST B] Uploading real PNG Image document ('Freelancer_ID_Card.png')...")
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
    png_file = SimpleUploadedFile(
        name="Freelancer_ID_Card.png",
        content=png_content,
        content_type="image/png"
    )

    sub_res_img = client.post('/api/freelancer/identity-verification/', {
        'user_id': fl_user.username,
        'document_type': 'Aadhaar Card',
        'document_number': '987654321098',
        'document_file': png_file
    }, format='multipart')

    assert sub_res_img.status_code == 201
    v_rec_img = FreelancerIdentityVerification.objects.filter(freelancer=fl_user, document_type='Aadhaar Card').first()
    assert v_rec_img is not None
    assert os.path.exists(v_rec_img.document_file.path)
    print(f"[OK] DB Image Record verified! Stored file path on disk: {v_rec_img.document_file.path}")

    # Test Image Preview endpoint
    img_preview_res = client.get(f'/api/identity-verifications/{v_rec_img.id}/document/')
    assert img_preview_res.status_code == 200
    assert img_preview_res['Content-Type'] == 'image/png', f"Expected image/png, got {img_preview_res['Content-Type']}"
    assert 'inline' in img_preview_res['Content-Disposition']
    img_preview_bytes = b''.join(img_preview_res.streaming_content)
    assert img_preview_bytes == png_content, "Preview PNG content does not match uploaded bytes!"
    print("[OK] Image Preview API verified! Returns exact image bytes with Content-Type: image/png & inline disposition.")

    # Test Image Download endpoint
    img_download_res = client.get(f'/api/identity-verifications/{v_rec_img.id}/document/?download=true')
    assert img_download_res.status_code == 200
    assert img_download_res['Content-Type'] == 'image/png'
    assert 'attachment' in img_download_res['Content-Disposition']
    img_dl_bytes = b''.join(img_download_res.streaming_content)
    assert img_dl_bytes == png_content
    print("[OK] Image Download API verified! Returns exact original image bytes with attachment disposition.")

    # Clean up test records
    FreelancerIdentityVerification.objects.filter(freelancer=fl_user).delete()

    print("\n=== ALL KYC DOCUMENT PREVIEW & DOWNLOAD TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    test_pdf_and_image_preview_download()
