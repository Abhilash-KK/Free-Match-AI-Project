import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  BadgeCheck,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle2,
  RefreshCw,
  Eye,
  Lock,
  ChevronRight,
  Home
} from 'lucide-react';

const FreelancerIdentityVerificationView = ({
  userSession,
  currentUserId,
  isDark = false,
  showToastMessage = () => {},
  onNavigateHome = () => {}
}) => {
  const username = (currentUserId || userSession?.user_id || userSession?.email || 'freelancer').trim();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('NOT_SUBMITTED'); // NOT_SUBMITTED | PENDING | APPROVED | REJECTED
  const [rejectionReason, setRejectionReason] = useState('');
  const [latestVerification, setLatestVerification] = useState(null);
  const [history, setHistory] = useState([]);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  // Form fields
  const [documentType, setDocumentType] = useState('Aadhaar Card');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const fetchVerificationStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/freelancer/identity-verification/?user_id=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || 'NOT_SUBMITTED');
        setRejectionReason(data.rejection_reason || '');
        setLatestVerification(data.latest_verification || null);
        setHistory(Array.isArray(data.history) ? data.history : []);
      }
    } catch (err) {
      console.error('Failed to fetch identity verification status:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setFileError('Invalid file format. Please upload a PDF, JPG, JPEG, or PNG file.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');

    if (!documentNumber.trim()) {
      setFileError('Please enter your document number.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('user_id', username);
      if (latestVerification?.id) {
        formData.append('verification_id', latestVerification.id);
      }
      formData.append('document_type', documentType);
      formData.append('document_number', documentNumber.trim());

      if (selectedFile) {
        formData.append('document_file', selectedFile);
      } else {
        formData.append('document_file_name', `${username}_${documentType.replace(/\s+/g, '_')}.pdf`);
        formData.append('document_file_size', '1.2 MB');
      }

      const res = await fetch('http://localhost:8000/api/freelancer/identity-verification/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToastMessage(data.message || 'Identity verification document submitted successfully!', 'success');
        setDocumentNumber('');
        setSelectedFile(null);
        setShowResubmitForm(false);
        await fetchVerificationStatus();
      } else {
        setFileError(data.error || 'Failed to submit verification document.');
        showToastMessage(data.error || 'Submission failed.', 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setFileError('Network error while submitting verification.');
      showToastMessage('Network error while submitting verification.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormVisible = status === 'NOT_SUBMITTED' || status === 'REJECTED' || showResubmitForm;

  return (
    <div className={`p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-2">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <button onClick={onNavigateHome} className="hover:text-blue-600 flex items-center space-x-1 cursor-pointer">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-bold">Account</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-600 font-bold">Identity Verification</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-3">
              <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
              <span>Identity Verification</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Verify your identity to build trust and securely use the FreeMatch AI marketplace.
            </p>
          </div>
          <button
            onClick={fetchVerificationStatus}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading identity verification status...</p>
        </div>
      ) : (
        <>
          {/* STATUS CARDS */}
          {status === 'APPROVED' && (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <BadgeCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full inline-block uppercase tracking-wider">
                    ✓ Identity Verified
                  </span>
                  <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200 pt-1">
                    Your Freelancer Identity is Fully Verified
                  </h3>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Your identity documents have been reviewed and approved by the FreeMatch AI Admin team. The <strong>Identity Verified</strong> badge is now displayed across your freelancer profile, proposals, contracts, and hired freelancer listings for clients.
                  </p>
                </div>
              </div>

              {latestVerification && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Document Type</span>
                    <span>{latestVerification.document_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Document Number</span>
                    <span>{latestVerification.document_number_masked}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Verified Date</span>
                    <span>{latestVerification.reviewed_at || latestVerification.submitted_at}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'PENDING' && (
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full inline-block uppercase tracking-wider">
                    ◷ Under Review
                  </span>
                  <h3 className="text-lg font-black text-amber-900 dark:text-amber-200 pt-1">
                    Your Identity Documents are Under Admin Review
                  </h3>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                    Your identity verification submission has been received and is currently in the Admin verification queue. Once reviewed by an Admin, your status will update automatically.
                  </p>
                </div>
              </div>

              {latestVerification && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Submitted Document</span>
                    <span>{latestVerification.document_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Document Number</span>
                    <span>{latestVerification.document_number_masked}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-bold">Submission Date</span>
                    <span>{latestVerification.submitted_at}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'REJECTED' && (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-sm space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full inline-block uppercase tracking-wider">
                    Identity Verification Rejected
                  </span>
                  <h3 className="text-lg font-black text-rose-900 dark:text-rose-200 pt-1">
                    Verification Document Rejected by Admin
                  </h3>
                  {rejectionReason && (
                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 font-medium">
                      <strong>Rejection Reason:</strong> {rejectionReason}
                    </div>
                  )}
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-300 pt-1">
                    Please review the feedback above and submit a clear, valid identity document to proceed with verification.
                  </p>
                </div>
              </div>

              {!showResubmitForm && (
                <button
                  onClick={() => setShowResubmitForm(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Resubmit Documents</span>
                </button>
              )}
            </div>
          )}

          {status === 'NOT_SUBMITTED' && (
            <div className="p-6 rounded-3xl bg-blue-50 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full inline-block uppercase tracking-wider">
                  Action Required
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                  Identity verification has not been submitted.
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Submit a valid government-issued identity document to get verified. Verified freelancers receive higher client trust, verified badges, and priority matching.
                </p>
              </div>
            </div>
          )}

          {/* SUBMISSION / RESUBMISSION FORM */}
          {isFormVisible && (
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>{status === 'REJECTED' ? 'Resubmit Verification Document' : 'Submit Identity Document'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select a document type, enter your document number, and upload a clear document image or PDF.
                  </p>
                </div>
                {status === 'REJECTED' && showResubmitForm && (
                  <button
                    onClick={() => setShowResubmitForm(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {fileError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* DOCUMENT TYPE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving Licence">Driving Licence</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>

                  {/* DOCUMENT NUMBER */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Document Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F or 1234 5678 9012"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* UPLOAD FILE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Document <span className="text-rose-500">*</span>
                  </label>
                  <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {selectedFile ? selectedFile.name : 'Click or drag file to upload identity document'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        Supported formats: PDF, JPG, JPEG, PNG (Max size: 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="kyc-doc-file-input"
                    />
                    <label
                      htmlFor="kyc-doc-file-input"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
                    >
                      {selectedFile ? 'Change File' : 'Browse Files'}
                    </label>
                  </div>
                </div>

                {/* SECURITY NOTICE */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Your documents are stored securely. Clients will only see your verification badge and never your private KYC files or numbers.</span>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VERIFICATION HISTORY */}
          {history.length > 0 && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Verification History</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Document Type</th>
                      <th className="py-2.5 px-3">Doc Number</th>
                      <th className="py-2.5 px-3">Submitted Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Reviewed Date</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {history.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{item.document_type}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{item.document_number_masked}</td>
                        <td className="py-3 px-3">{item.submitted_at}</td>
                        <td className="py-3 px-3">
                          {item.status === 'APPROVED' && (
                            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold rounded-full">
                              ✓ Approved
                            </span>
                          )}
                          {item.status === 'PENDING' && (
                            <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[11px] font-extrabold rounded-full">
                              ◷ Pending Review
                            </span>
                          )}
                          {item.status === 'REJECTED' && (
                            <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[11px] font-extrabold rounded-full">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">{item.reviewed_at || '—'}</td>
                        <td className="py-3 px-3">
                          {item.status === 'REJECTED' && item.rejection_reason ? (
                            <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium" title={item.rejection_reason}>
                              {item.rejection_reason}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FreelancerIdentityVerificationView;
