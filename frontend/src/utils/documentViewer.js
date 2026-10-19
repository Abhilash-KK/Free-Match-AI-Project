/* eslint-disable */
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
const BACKEND_URL = (
  (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL)) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://freematch-ai-backend.onrender.com' : 'http://localhost:8000')
).replace(/\/api\/?$/, '');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

  let cleanUrl = url.trim();

  // Resolve relative backend endpoints
  if (cleanUrl.startsWith('/api/') || cleanUrl.startsWith('/media/')) {
    cleanUrl = `${BACKEND_URL}${cleanUrl}`;
  }

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
            .header { padding: 12px 24px; background: #1e293b; width: 100%; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
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

  // Open direct streaming PDF URL in native browser viewer
  window.open(targetUrl, '_blank');
}
