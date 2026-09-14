/**
 * Document Viewer utility for safely opening uploaded project documents and PDFs
 * across Client and Freelancer workspaces.
 */

/**
 * Opens an attached project document or PDF in a browser window.
 * Converts base64 Data URLs into native Blob URLs and wraps them in an HTML container page
 * so Chrome/Edge/Firefox native PDF renderers display the file without "Failed to load PDF document".
 *
 * @param {Object} fileObj - Attachment object containing { url, name, type, isImage }
 */
export function openDocumentViewer(fileObj) {
  if (!fileObj) {
    alert('No document attached to this project.');
    return;
  }

  const url = fileObj.url || fileObj.attached_file_url;
  const fileName = fileObj.name || fileObj.attached_file_name || 'Project_Document.pdf';

  if (!url || typeof url !== 'string' || !url.trim()) {
    alert('Invalid or missing document attachment URL.');
    return;
  }

  const cleanUrl = url.trim();

  // Handle Images
  const isImg = fileObj.isImage || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName) || cleanUrl.startsWith('data:image/');

  if (isImg) {
    const imgWin = window.open('', '_blank');
    if (imgWin) {
      imgWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${escapeHtml(fileName)}</title>
          <style>
            body { margin: 0; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; color: white; font-family: system-ui, -apple-system, sans-serif; }
            .header { padding: 12px 24px; background: #1e293b; width: 100%; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; shadow: 0 4px 12px rgba(0,0,0,0.4); }
            img { max-width: 90%; max-height: 85vh; margin-top: 60px; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .btn { background: #2563eb; color: white; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; }
            .btn:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="header">
            <span>🖼️ ${escapeHtml(fileName)}</span>
            <a href="${cleanUrl}" download="${escapeHtml(fileName)}" class="btn">Download Image</a>
          </div>
          <img src="${cleanUrl}" alt="${escapeHtml(fileName)}" />
        </body>
        </html>
      `);
      imgWin.document.close();
    }
    return;
  }

  // Handle PDF Documents
  let targetUrl = cleanUrl;

  if (cleanUrl.startsWith('data:')) {
    try {
      const parts = cleanUrl.split(';base64,');
      let contentType = 'application/pdf';
      const mimeMatch = cleanUrl.match(/^data:([^;]+)/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }

      if (contentType === 'text/plain' || contentType === 'application/octet-stream' || fileName.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      }

      const b64Data = parts[1] ? parts[1].replace(/\s/g, '') : '';
      if (b64Data) {
        const byteCharacters = atob(b64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        targetUrl = URL.createObjectURL(blob);
      }
    } catch (err) {
      console.error('Error converting Data URL to PDF Blob:', err);
    }
  }

  // Open PDF in a dedicated HTML container window to ensure Chrome/Edge PDF renderer loads reliably
  const pdfWin = window.open('', '_blank');
  if (pdfWin) {
    pdfWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${escapeHtml(fileName)}</title>
        <meta charset="utf-8" />
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #525659; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          .header { background: #323639; color: #f1f5f9; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.4); height: 46px; box-sizing: border-box; }
          .title-area { display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .btn { background: #2563eb; color: white; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .viewer-container { width: 100%; height: calc(100vh - 46px); background: #525659; }
          iframe, embed, object { width: 100%; height: 100%; border: none; display: block; }
          .error-box { padding: 40px; text-align: center; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <span>📄 ${escapeHtml(fileName)}</span>
          </div>
          <div>
            <a href="${targetUrl}" download="${escapeHtml(fileName)}" class="btn">Download Document</a>
          </div>
        </div>
        <div class="viewer-container">
          <object data="${targetUrl}" type="application/pdf">
            <embed src="${targetUrl}" type="application/pdf" />
            <iframe src="${targetUrl}" type="application/pdf">
              <div class="error-box">
                <p>Your browser does not support inline PDF viewing.</p>
                <a href="${targetUrl}" download="${escapeHtml(fileName)}" class="btn">Click here to download the PDF</a>
              </div>
            </iframe>
          </object>
        </div>
      </body>
      </html>
    `);
    pdfWin.document.close();
  } else {
    // Fallback anchor click if popup blocker is enabled
    const a = document.createElement('a');
    a.href = targetUrl;
    a.target = '_blank';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
