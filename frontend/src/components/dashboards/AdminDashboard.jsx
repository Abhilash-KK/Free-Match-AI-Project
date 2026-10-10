import React, { useState, useEffect, useCallback, useRef } from 'react';
import Toast from '../Toast';
import NotificationCenter from '../NotificationCenter';
import AdminProfileView from '../AdminProfileView';
import AdminSettingsView from '../AdminSettingsView';
import { fetchNotifications } from '../../utils/notificationService';
import { openDocumentViewer } from '../../utils/documentViewer';
import { formatISTTimestamp, formatISTDate } from '../../utils/dateUtils';
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Tags,
  Landmark,
  ScrollText,
  Bell,
  UserCircle,
  LogOut,
  Settings,
  ChevronDown,
  Plus,
  Shield,
  FileCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Clock,
  Briefcase,
  Download,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

const AdminDashboard = ({ userSession, onSignOut }) => {
  const isDark = false;
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'project_verifications' | 'verifications' | 'users' | 'governance' | 'financials' | 'audit' | 'settings' | 'notifications' | 'profile'
  const [toast, setToast] = useState(null); // { message, type }

  // Header Profile Dropdown & Logout Confirmation
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const dropdownRef = useRef(null);

  // Modals & Action States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  const [searchQuery, setSearchQuery] = useState('');

  // Project Verification Queue Action States
  const [rejectingProject, setRejectingProject] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);

  // Identity Verification Queue Action States
  const [rejectingVerification, setRejectingVerification] = useState(null);
  const [verificationRejectionReasonInput, setVerificationRejectionReasonInput] = useState('');
  const [viewingDocumentModal, setViewingDocumentModal] = useState(null);
  const [deletingVerification, setDeletingVerification] = useState(null);
  const [kycFilterTab, setKycFilterTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [kycSearchQuery, setKycSearchQuery] = useState('');

  // Project Document Verification Queue States
  const [projectVerifSubTab, setProjectVerifSubTab] = useState('project_details'); // 'project_details' | 'project_documents'
  const [projectDocVerifications, setProjectDocVerifications] = useState([]);
  const [projDocFilterTab, setProjDocFilterTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [projDocSearchQuery, setProjDocSearchQuery] = useState('');
  const [rejectingProjDoc, setRejectingProjDoc] = useState(null);
  const [projDocRejectionReasonInput, setProjDocRejectionReasonInput] = useState('');
  const [viewingProjDocModal, setViewingProjDocModal] = useState(null);
  const [deletingProjDoc, setDeletingProjDoc] = useState(null);

  const currentUserId = (userSession?.username || userSession?.user_id || userSession?.email || 'admin').toLowerCase().trim();
  const currentUserName = userSession?.name || userSession?.first_name || 'System Admin';

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Platform Administrative Data
  const [metrics, setMetrics] = useState({
    platform_revenue: '₹0',
    platform_revenue_num: 0,
    total_escrow_volume: '₹0',
    total_escrow_volume_num: 0,
    active_contracts_count: 0,
    total_projects_count: 0,
    suspended_accounts_count: 0,
    critical_vulnerabilities: 0,
    total_transactions_count: 0
  });

  const [verifications, setVerifications] = useState([]);
  const [projectVerifications, setProjectVerifications] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [contractSubTab, setContractSubTab] = useState('active'); // 'active' | 'completed'
  const [selectedContractDetailModal, setSelectedContractDetailModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingCategoryModal, setDeletingCategoryModal] = useState(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [projectFinancialSummaries, setProjectFinancialSummaries] = useState([]);
  const [adminLedgerSubTab, setAdminLedgerSubTab] = useState('transactions'); // 'transactions' | 'projects'
  const [ledgerFilter, setLedgerFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'milestone_release' | 'escrow_hold'
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [viewingAdminTransaction, setViewingAdminTransaction] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deletingCategoryModal) setDeletingCategoryModal(null);
        if (viewingAdminTransaction) setViewingAdminTransaction(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletingCategoryModal, viewingAdminTransaction]);

  const handleDownloadAdminInvoice = (tx) => {
    if (!tx) return;
    let invUrl = '';
    if (tx.payment_id && (tx.status || '').toLowerCase() === 'paid') {
      invUrl = `http://localhost:8000/api/payments/${tx.payment_id}/invoice/`;
    } else if (tx.contract_id) {
      invUrl = `http://localhost:8000/api/contracts/${tx.contract_id}/invoice/`;
    } else {
      invUrl = `http://localhost:8000/api/payments/${tx.db_id || tx.id}/invoice/`;
    }
    window.open(invUrl, '_blank');
  };

  const fetchAdminData = async () => {
    try {
      let data = null;
      try {
        const res = await fetch('http://localhost:8000/api/admin-dashboard/');
        if (res.ok) data = await res.json();
      } catch (e1) {
        try {
          const res2 = await fetch('/api/admin-dashboard/');
          if (res2.ok) data = await res2.json();
        } catch (e2) {}
      }

      if (data) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.verifications)) setVerifications(data.verifications);
        if (Array.isArray(data.active_contracts)) setActiveContracts(data.active_contracts);
        if (Array.isArray(data.completed_projects)) setCompletedProjects(data.completed_projects);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !selectedCategory) {
            setSelectedCategory(data.categories[0].name);
          }
        }
        if (Array.isArray(data.skills)) setSkills(data.skills);
        if (Array.isArray(data.audit_logs)) setAuditLogs(data.audit_logs);
        if (Array.isArray(data.transactions)) setAdminTransactions(data.transactions);
        if (Array.isArray(data.project_financial_summaries)) setProjectFinancialSummaries(data.project_financial_summaries);
      }

      const backendPending = (data && Array.isArray(data.project_verifications)) ? data.project_verifications : [];
      
      // Also collect any pending projects saved in localStorage
      const localPending = [];
      try {
        const allKeys = Object.keys(localStorage);
        for (const k of allKeys) {
          if (k.includes('projects') || k.includes('shared')) {
            try {
              const itemData = JSON.parse(localStorage.getItem(k));
              if (Array.isArray(itemData)) {
                for (const item of itemData) {
                  const appSt = (item.approval_status || item.approvalStatus || item.status || '').toLowerCase().trim();
                  if (appSt === 'pending review' || appSt === 'pending admin review') {
                    localPending.push({
                      id: item.id || `proj_${Date.now()}`,
                      project_id: (item.id || '').replace('proj_', ''),
                      title: item.title || 'Untitled Project',
                      client: item.client || item.client_name || item.client_id || 'Client User',
                      client_id: item.client_id || item.clientId || item.client || 'client',
                      client_email: item.client_email || '',
                      category: item.category || 'Software Development',
                      budget: item.budget || '₹5,000',
                      duration: item.duration || '3 Weeks',
                      skills: item.skills || [],
                      postedDate: item.postedDate || item.posted || 'Just Now',
                      deadline: item.deadline || '3 Weeks',
                      description: item.description || '',
                      abstract: item.abstract || '',
                      attached_file_name: item.attached_file_name || (item.attachedFile ? item.attachedFile.name : ''),
                      attached_file_url: item.attached_file_url || (item.attachedFile ? item.attachedFile.url : ''),
                      approval_status: 'Pending Review',
                      rejection_reason: ''
                    });
                  }
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}

      // Combine backendPending and localPending, deduplicating by project title / ID
      const mergedMap = new Map();
      for (const p of [...backendPending, ...localPending]) {
        const key = (p.title || p.project_id || p.id || '').toString().toLowerCase().trim();
        if (key && !mergedMap.has(key)) {
          mergedMap.set(key, p);
        }
      }
      setProjectVerifications(Array.from(mergedMap.values()));

      // Fetch client project document verifications
      try {
        const pDocRes = await apiFetch('/api/admin/project-document-verifications/');
        if (pDocRes && pDocRes.ok) {
          const pDocData = await pDocRes.json();
          if (Array.isArray(pDocData)) {
            setProjectDocVerifications(pDocData);
          }
        }
      } catch (e) {}

    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const handleSync = () => fetchAdminData();
    window.addEventListener('freematch_shared_event', handleSync);
    window.addEventListener('freematch_notification_event', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('freematch_shared_event', handleSync);
      window.removeEventListener('freematch_notification_event', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Real-time Notifications State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadLiveNotifs = async () => {
      const aUserId = (userSession?.user_id || userSession?.username || userSession?.email || userSession?.id || 'admin').toString().trim();
      const list = await fetchNotifications(aUserId);
      setNotifications(Array.isArray(list) ? list : []);
    };
    loadLiveNotifs();

    const handleNotifEvent = () => loadLiveNotifs();
    window.addEventListener('freematch_notification_event', handleNotifEvent);
    return () => window.removeEventListener('freematch_notification_event', handleNotifEvent);
  }, [userSession]);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // Helper fetch to support both localhost:8000 cross-origin and relative paths
  const apiFetch = async (url, options = {}) => {
    const absoluteUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
    try {
      const res = await fetch(absoluteUrl, options);
      return res;
    } catch (err) {
      if (!url.startsWith('http')) {
        return await fetch(url, options);
      }
      throw err;
    }
  };

  // Handlers
  const fetchKycVerifications = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/identity-verifications/?status=${kycFilterTab}&search=${encodeURIComponent(kycSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verifications)) {
          setVerifications(data.verifications);
        }
      }
    } catch (e) {
      console.error('Failed to fetch KYC verifications:', e);
    }
  }, [kycFilterTab, kycSearchQuery]);

  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchKycVerifications();
    }
  }, [activeTab, fetchKycVerifications]);

  const handleApproveVerification = async (vObj) => {
    if (!vObj) return;
    const vId = vObj.id;
    const userId = typeof vObj === 'object' ? (vObj.user_id || vObj.id) : vObj;
    try {
      let url = '/api/admin-dashboard/verify/';
      if (vId && (typeof vId === 'number' || (!isNaN(Number(vId)) && Number(vId) > 0))) {
        url = `/api/admin/identity-verifications/${vId}/approve/`;
      }
      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, id: vId, action: 'approve' })
      });
      apiFetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'approve' })
      }).catch(() => {});

      if (res && res.ok) {
        setToast({ message: `Freelancer identity verified & Verified Badge awarded for '${vObj.name || userId}'!`, type: 'success' });
        fetchKycVerifications();
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('freematch_notification_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: errData.error || 'Failed to approve verification application.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error approving verification.', type: 'error' });
    }
  };

  const handleRejectVerificationSubmit = async () => {
    if (!rejectingVerification) return;
    const vId = rejectingVerification.id;
    const userId = rejectingVerification.user_id || rejectingVerification.id;
    const feedbackReason = verificationRejectionReasonInput.trim() || 'Verification documents do not meet platform security & compliance standards.';
    try {
      let url = '/api/admin-dashboard/verify/';
      if (vId && (typeof vId === 'number' || (!isNaN(Number(vId)) && Number(vId) > 0))) {
        url = `/api/admin/identity-verifications/${vId}/reject/`;
      }
      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: vId,
          action: 'reject',
          rejection_reason: feedbackReason
        })
      });
      apiFetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'reject',
          rejection_reason: feedbackReason
        })
      }).catch(() => {});

      if (res && res.ok) {
        setToast({ message: `Verification application for '${rejectingVerification.name || userId}' rejected. Freelancer notified.`, type: 'info' });
        setRejectingVerification(null);
        setVerificationRejectionReasonInput('');
        fetchKycVerifications();
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('freematch_notification_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: errData.error || 'Failed to reject verification application.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error rejecting verification.', type: 'error' });
    }
  };

  const handleDeleteVerificationSubmit = async () => {
    if (!deletingVerification) return;
    const vId = deletingVerification.id;
    try {
      const res = await apiFetch(`/api/admin/identity-verifications/${vId}/delete/`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        setToast({ message: `Rejected verification record #${vId} deleted successfully.`, type: 'info' });
        setDeletingVerification(null);
        fetchKycVerifications();
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('freematch_notification_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: errData.error || 'Failed to delete verification record.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error deleting verification.', type: 'error' });
    }
  };

  const handleCloseDocumentModal = () => {
    if (viewingDocumentModal?.blobUrl) {
      try {
        URL.revokeObjectURL(viewingDocumentModal.blobUrl);
      } catch (e) {}
    }
    setViewingDocumentModal(null);
  };

  const handleViewVerificationDocument = async (v) => {
    if (!v) return;
    const targetId = v.id || v.item?.id;
    let docName = v.document_file_name || v.docName || v.resume_name || 'Verification_Document.pdf';
    let rawUrl = v.document_file_url || (targetId ? `http://localhost:8000/api/identity-verifications/${targetId}/document/` : '');

    if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('data:')) {
      rawUrl = `http://localhost:8000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    }

    let rawStatus = (v.status || v.item?.status || '').toString().trim().toUpperCase();
    let normStatus = 'PENDING';
    if (rawStatus === 'APPROVED' || rawStatus === 'VERIFIED') normStatus = 'APPROVED';
    else if (rawStatus === 'REJECTED') normStatus = 'REJECTED';

    let rejectionReason = v.rejection_reason || v.item?.rejection_reason || '';

    const docObj = {
      id: targetId,
      user_id: v.user_id,
      name: v.name,
      docName: docName,
      docUrl: '',
      blobUrl: '',
      loading: true,
      error: '',
      docSize: v.document_file_size || 'File',
      document_type: v.document_type || 'Identity Document',
      document_number: v.document_number || 'N/A',
      status: normStatus,
      rejection_reason: rejectionReason,
      item: v
    };

    setViewingDocumentModal(docObj);

    if (targetId) {
      fetch('http://localhost:8000/api/admin/identity-verifications/')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.verifications)) {
            const match = data.verifications.find(x => String(x.id) === String(targetId));
            if (match) {
              let updatedNorm = 'PENDING';
              const st = (match.status || '').toString().trim().toUpperCase();
              if (st === 'APPROVED' || st === 'VERIFIED') updatedNorm = 'APPROVED';
              else if (st === 'REJECTED') updatedNorm = 'REJECTED';

              setViewingDocumentModal(prev => {
                if (!prev || String(prev.id) !== String(targetId)) return prev;
                return {
                  ...prev,
                  status: updatedNorm,
                  rejection_reason: match.rejection_reason || prev.rejection_reason,
                  item: match
                };
              });
            }
          }
        })
        .catch(err => console.error('Error refreshing document verification status:', err));
    }

    try {
      const fetchUrl = targetId ? `http://localhost:8000/api/identity-verifications/${targetId}/document/` : rawUrl;
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const contentType = res.headers.get('content-type') || (docName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      const createdBlobUrl = URL.createObjectURL(new Blob([blob], { type: contentType }));

      setViewingDocumentModal(prev => {
        if (!prev) return null;
        return {
          ...prev,
          docUrl: createdBlobUrl,
          blobUrl: createdBlobUrl,
          mimeType: contentType,
          loading: false,
          error: ''
        };
      });
    } catch (err) {
      console.error('Failed to load document blob preview:', err);
      setViewingDocumentModal(prev => {
        if (!prev) return null;
        return {
          ...prev,
          loading: false,
          error: 'Could not render document preview. Click Download Document below to save or view the file.',
          docUrl: rawUrl
        };
      });
    }
  };

  const handleDownloadVerificationDocument = async (v) => {
    if (!v) return;
    const targetId = v.id || v.item?.id;
    const docName = v.docName || v.document_file_name || v.resume_name || 'Verification_Document.pdf';

    try {
      let downloadBlobUrl = v.blobUrl;
      if (!downloadBlobUrl) {
        const fetchUrl = targetId ? `http://localhost:8000/api/identity-verifications/${targetId}/document/?download=true` : (v.document_download_url || v.docUrl || v.document_file_url);
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const blob = await res.blob();
          const contentType = res.headers.get('content-type') || 'application/octet-stream';
          downloadBlobUrl = URL.createObjectURL(new Blob([blob], { type: contentType }));
        }
      }

      if (downloadBlobUrl) {
        const a = document.createElement('a');
        a.href = downloadBlobUrl;
        a.download = docName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (!v.blobUrl) {
          setTimeout(() => URL.revokeObjectURL(downloadBlobUrl), 10000);
        }
      } else {
        window.open(`http://localhost:8000/api/identity-verifications/${targetId}/document/?download=true`, '_blank');
      }
    } catch (err) {
      console.error('Download document error:', err);
      if (targetId) {
        window.open(`http://localhost:8000/api/identity-verifications/${targetId}/document/?download=true`, '_blank');
      }
    }
  };

  // PROJECT DOCUMENT VERIFICATION HANDLERS
  const fetchProjectDocVerifications = async () => {
    try {
      const res = await apiFetch('/api/admin/project-document-verifications/');
      if (res && res.ok) {
        const data = await res.json();
        setProjectDocVerifications(data);
      }
    } catch (e) {
      console.error('Error fetching project document verifications:', e);
    }
  };

  const handleApproveProjDoc = async (docObj) => {
    if (!docObj) return;
    try {
      const res = await apiFetch(`/api/admin/project-document-verifications/${docObj.id}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docObj.id })
      });
      if (res && res.ok) {
        setToast({ message: `Project document for '${docObj.project_title}' approved successfully!`, type: 'success' });
        fetchProjectDocVerifications();
      } else {
        const err = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: err.error || 'Failed to approve document.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error approving document.', type: 'error' });
    }
  };

  const handleRejectProjDocSubmit = async () => {
    if (!rejectingProjDoc) return;
    const reason = projDocRejectionReasonInput.trim() || 'Project document does not meet quality requirements.';
    try {
      const res = await apiFetch(`/api/admin/project-document-verifications/${rejectingProjDoc.id}/reject/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectingProjDoc.id, rejection_reason: reason })
      });
      if (res && res.ok) {
        setToast({ message: `Project document for '${rejectingProjDoc.project_title}' rejected. Client notified.`, type: 'info' });
        setRejectingProjDoc(null);
        setProjDocRejectionReasonInput('');
        fetchProjectDocVerifications();
      } else {
        const err = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: err.error || 'Failed to reject document.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error rejecting document.', type: 'error' });
    }
  };

  const handleDeleteProjDoc = async (docObj) => {
    if (!docObj) return;
    try {
      const res = await apiFetch(`/api/admin/project-document-verifications/${docObj.id}/delete/`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        setToast({ message: 'Project document verification record deleted.', type: 'success' });
        setDeletingProjDoc(null);
        fetchProjectDocVerifications();
      } else {
        const err = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: err.error || 'Failed to delete record.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error deleting record.', type: 'error' });
    }
  };

  const handleViewProjDoc = async (docObj) => {
    if (!docObj) return;
    const targetId = docObj.id;
    try {
      const res = await apiFetch(`/api/project-documents/${targetId}/document/`);
      if (res && res.ok) {
        const blob = await res.blob();
        const contentType = res.headers.get('Content-Type') || blob.type || 'application/pdf';
        const blobUrl = URL.createObjectURL(blob);

        openDocumentViewer({
          url: blobUrl,
          title: docObj.document_name || `${docObj.project_title}_Spec.pdf`,
          document_name: docObj.document_name,
          freelancer_name: docObj.client_name,
          document_type: docObj.document_type || 'Project Requirement Spec',
          submitted_at: docObj.submitted_at,
          downloadUrl: `http://localhost:8000/api/project-documents/${targetId}/document/?download=true`,
          file_type: contentType
        });

        setViewingProjDocModal({
          ...docObj,
          blobUrl,
          contentType
        });
      } else {
        window.open(`http://localhost:8000/api/project-documents/${targetId}/document/`, '_blank');
      }
    } catch (err) {
      window.open(`http://localhost:8000/api/project-documents/${targetId}/document/`, '_blank');
    }
  };

  const handleDownloadProjDoc = async (docObj) => {
    if (!docObj) return;
    const targetId = docObj.id;
    try {
      const res = await apiFetch(`/api/project-documents/${targetId}/document/?download=true`);
      if (res && res.ok) {
        const blob = await res.blob();
        const downloadBlobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadBlobUrl;
        a.download = docObj.document_name || `Project_Document_${targetId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadBlobUrl), 10000);
      } else {
        window.open(`http://localhost:8000/api/project-documents/${targetId}/document/?download=true`, '_blank');
      }
    } catch (err) {
      window.open(`http://localhost:8000/api/project-documents/${targetId}/document/?download=true`, '_blank');
    }
  };

  const handleApproveProject = async (projObj) => {
    if (!projObj) return;
    const projId = projObj.project_id || projObj.id;
    try {
      const res = await apiFetch('/api/admin-dashboard/verify-project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projId, action: 'approve' })
      });

      if (res && res.ok) {
        // Also update any matching project in localStorage keys so client state stays synchronized
        try {
          const allKeys = Object.keys(localStorage);
          for (const k of allKeys) {
            if (k.includes('projects') || k.includes('shared')) {
              try {
                const itemData = JSON.parse(localStorage.getItem(k));
                if (Array.isArray(itemData)) {
                  let updated = false;
                  const newArr = itemData.map(item => {
                    const matchesId = item.id === projId || item.project_id === projId || `proj_${item.id}` === projId;
                    const matchesTitle = item.title && projObj.title && item.title.toLowerCase().trim() === projObj.title.toLowerCase().trim();
                    if (matchesId || matchesTitle) {
                      updated = true;
                      return {
                        ...item,
                        approval_status: 'Approved',
                        approvalStatus: 'Approved',
                        status: (item.status === 'Pending Review' || !item.status) ? 'Open for Bids' : item.status,
                        rejection_reason: '',
                        rejectionReason: ''
                      };
                    }
                    return item;
                  });
                  if (updated) {
                    localStorage.setItem(k, JSON.stringify(newArr));
                  }
                }
              } catch (e) {}
            }
          }
        } catch (e) {}

        setProjectVerifications(prev => prev.filter(p => (p.project_id || p.id) !== projId && p.id !== projId && p.title !== projObj.title));
        setToast({ message: `Project '${projObj.title}' approved & published to Freelancer Marketplace!`, type: 'success' });
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('freematch_notification_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: errData.error || 'Failed to approve project.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error approving project.', type: 'error' });
    }
  };

  const handleRejectProjectSubmit = async () => {
    if (!rejectingProject) return;
    const projId = rejectingProject.project_id || rejectingProject.id;
    const feedbackReason = rejectionReasonInput.trim() || 'Does not meet platform project quality & safety guidelines.';
    try {
      const res = await apiFetch('/api/admin-dashboard/verify-project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projId,
          action: 'reject',
          rejection_reason: feedbackReason
        })
      });

      if (res && res.ok) {
        // Also update any matching project in localStorage keys so client state stays synchronized
        try {
          const allKeys = Object.keys(localStorage);
          for (const k of allKeys) {
            if (k.includes('projects') || k.includes('shared')) {
              try {
                const itemData = JSON.parse(localStorage.getItem(k));
                if (Array.isArray(itemData)) {
                  let updated = false;
                  const newArr = itemData.map(item => {
                    const matchesId = item.id === projId || item.project_id === projId || `proj_${item.id}` === projId;
                    const matchesTitle = item.title && rejectingProject.title && item.title.toLowerCase().trim() === rejectingProject.title.toLowerCase().trim();
                    if (matchesId || matchesTitle) {
                      updated = true;
                      return {
                        ...item,
                        approval_status: 'Rejected',
                        approvalStatus: 'Rejected',
                        rejection_reason: feedbackReason,
                        rejectionReason: feedbackReason
                      };
                    }
                    return item;
                  });
                  if (updated) {
                    localStorage.setItem(k, JSON.stringify(newArr));
                  }
                }
              } catch (e) {}
            }
          }
        } catch (e) {}

        setProjectVerifications(prev => prev.filter(p => (p.project_id || p.id) !== projId && p.id !== projId && p.title !== rejectingProject.title));
        setToast({ message: `Project '${rejectingProject.title}' rejected. Client has been notified.`, type: 'info' });
        setRejectingProject(null);
        setRejectionReasonInput('');
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('freematch_notification_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setToast({ message: errData.error || 'Failed to reject project.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error rejecting project.', type: 'error' });
    }
  };

  const toggleUserStatus = async (userObj) => {
    const userId = typeof userObj === 'object' ? (userObj.user_id || userObj.id) : userObj;
    try {
      const res = await apiFetch('/api/admin-dashboard/toggle-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res && res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => ((u.user_id || u.id) === userId || u.id === userId) ? { ...u, status: data.status } : u));
        setToast({ message: `User account status updated to ${data.status}.`, type: 'info' });
        fetchAdminData();
      } else {
        setToast({ message: 'Failed to update user status.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error updating user status.', type: 'error' });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await apiFetch('/api/admin-dashboard/category/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategories(prev => [...prev.filter(c => c.name !== data.category.name), data.category]);
        }
        setToast({ message: `Category '${newCategoryName.trim()}' added successfully!`, type: 'success' });
        setNewCategoryName('');
        setShowAddCategoryModal(false);
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        setToast({ message: 'Failed to add category.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error creating category.', type: 'error' });
    }
  };

  const handleDeleteCategory = (cObj) => {
    if (!cObj) return;
    setDeletingCategoryModal(cObj);
  };

  const confirmDeleteCategory = async (cObj) => {
    if (!cObj) return;
    const catName = typeof cObj === 'string' ? cObj : cObj.name;
    const catId = cObj.id || cObj.raw_id;

    setDeletingCategoryLoading(true);
    try {
      const res = await apiFetch('/api/admin-dashboard/category/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: catId, name: catName, action: 'delete' })
      });
      const data = res ? await res.json().catch(() => ({})) : {};

      if (res && res.ok) {
        setCategories(prev => prev.filter(c => c.name !== catName && c.id !== catId));
        setToast({ message: data.message || `Category '${catName}' removed successfully.`, type: 'info' });
        setDeletingCategoryModal(null);
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
        window.dispatchEvent(new Event('storage'));
      } else {
        const errorMsg = data.error || 'Failed to remove category.';
        setToast({ message: errorMsg, type: 'error' });
        if (errorMsg.includes('associated with existing projects')) {
          setDeletingCategoryModal((prev) => prev ? { ...prev, errorMsg } : null);
        }
      }
    } catch (e) {
      setToast({ message: 'Network error deleting category.', type: 'error' });
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* ADMIN CONTROL CONSOLE SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
      }`}>
        <div>
          {/* Logo & Admin Console Title */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-500">FreeMatch AI</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold tracking-wider uppercase">System Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Console Overview', icon: LayoutDashboard },
              { id: 'project_verifications', label: 'Project Verification Queue', icon: FileCheck, badge: projectVerifications.length },
              { id: 'verifications', label: 'Identity Verifications', icon: ShieldCheck, badge: verifications.length },
              { id: 'active_contracts', label: 'Active Contracts', icon: Briefcase, badge: activeContracts.length || metrics.active_contracts_count },
              { id: 'users', label: 'User Moderation', icon: UserCheck },
              { id: 'governance', label: 'Skill Governance', icon: Tags },
              { id: 'financials', label: 'Escrow & Revenue Ledger', icon: Landmark },
              { id: 'audit', label: 'Security & Audit Logs', icon: ScrollText },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount }
            ].map(item => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <IconComp className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account Links */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs font-semibold">
          <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">ACCOUNT</p>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
              activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>View Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f4f7fc]">
        
        {/* Top Control Bar & Header Profile Dropdown */}
        <header className="sticky top-0 z-30 px-8 py-3.5 border-b border-slate-200/80 bg-[#f4f7fc]/90 backdrop-blur-md flex items-center justify-between">
          {/* Health Status Ticker */}
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">
              System Health: <span className="text-emerald-600 font-extrabold">PostgreSQL Healthy (99.98% Uptime)</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Button */}
            <button 
              onClick={() => setActiveTab('notifications')} 
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs relative cursor-pointer hover:bg-slate-50 flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-xs px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* TOP-RIGHT ADMIN PROFILE & ACCOUNT DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 pl-3 border-l border-slate-300 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900">{currentUserName}</p>
                  <p className="text-xs text-blue-600 font-extrabold tracking-wider uppercase">
                    SUPER ADMIN
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs overflow-hidden">
                  {userSession?.avatar_url ? (
                    <img src={userSession.avatar_url} alt="Admin" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span>SA</span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 font-bold ml-0.5" />
              </button>

              {/* PROFILE DROPDOWN MENU */}
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-2 space-y-1"
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-xl">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{currentUserName}</p>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{userSession?.email || `${currentUserId}@freematch.ai`}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                      Root Super Admin
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-blue-600" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>System Settings</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-8">
            
            {/* Header Banner */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Platform Management Console</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                Monitor user verification requests, ecosystem governance, and security audit logs.
              </p>
            </div>

            {/* 4 EXECUTIVE ADMIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab('financials')}
                className={`p-5 rounded-2xl border border-emerald-500/40 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isDark ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'bg-emerald-50/50 hover:bg-emerald-100/60 shadow-xs'}`}
                title="Click to view Escrow & Revenue Ledger"
              >
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">PLATFORM REVENUE (10% FEE)</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.platform_revenue}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">From {metrics.total_escrow_volume} Total Escrow Volume</p>
              </div>

              <div 
                onClick={() => setActiveTab('verifications')}
                className={`p-5 rounded-2xl border border-rose-500/40 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isDark ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'bg-rose-50/50 hover:bg-rose-100/60 shadow-xs'}`}
                title="Click to view Identity Verifications Queue"
              >
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">IDENTITY VERIFICATION QUEUE</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">{verifications.length} Application{verifications.length === 1 ? '' : 's'}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Pending Document & Tax Verification</p>
              </div>

              <div 
                onClick={() => setActiveTab('active_contracts')}
                className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isDark ? 'bg-[#060e22] border-slate-800 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'}`}
                title="Click to view Active Contracts"
              >
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.active_contracts_count} Contract{metrics.active_contracts_count === 1 ? '' : 's'} Running</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Across {metrics.total_projects_count} Total Project{metrics.total_projects_count === 1 ? '' : 's'}</p>
              </div>

              <div 
                onClick={() => setActiveTab('audit')}
                className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isDark ? 'bg-[#060e22] border-slate-800 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'}`}
                title="Click to view Security & Audit Logs"
              >
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">SECURITY ALERTS</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.critical_vulnerabilities} Critical Vulnerabilities</p>
                <p className="text-xs text-slate-600 font-medium mt-1">{metrics.suspended_accounts_count} User Account{metrics.suspended_accounts_count === 1 ? '' : 's'} Suspended</p>
              </div>
            </div>

            {/* SECTION: PROJECT VERIFICATION QUEUE */}
            <div className={`p-6 rounded-3xl border border-amber-500/40 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setActiveTab('project_verifications')}>
                    <FileCheck className="w-5 h-5 text-amber-600" />
                    <span>Project Verification Queue</span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Review and approve client project postings before they become visible in the Freelancer Browse Jobs Marketplace.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('project_verifications')}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{projectVerifications.length} Awaiting Review</span>
                </button>
              </div>

              {projectVerifications.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs text-slate-600 font-bold">No pending projects in queue. All client project postings are verified and active.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectVerifications.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl bg-amber-50/30 border border-amber-200/80 hover:border-amber-400/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300/80 rounded-md text-[10px] font-extrabold uppercase tracking-wide">
                            Pending Admin Review
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-md text-[10px] font-bold">
                            {p.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">•</span>
                          <span className="text-xs text-slate-500 font-semibold">Posted: {p.postedDate}</span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">{p.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                          <span className="font-bold text-slate-800 flex items-center space-x-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>Client: {p.client} ({p.client_id})</span>
                          </span>
                          <span>•</span>
                          <span>Budget: <strong className="text-slate-900 font-bold">{p.budget}</strong></span>
                          <span>•</span>
                          <span>Duration: <strong className="text-slate-900 font-bold">{p.duration}</strong></span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(Array.isArray(p.skills) ? p.skills : (typeof p.skills === 'string' ? p.skills.split(',') : [])).map((s, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-white text-slate-700 border border-slate-200">
                              {typeof s === 'string' ? s.trim() : s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => setSelectedProjectDetail(p)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Details</span>
                        </button>
                        <button
                          onClick={() => handleApproveProject(p)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectingProject(p)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 1: FREELANCER IDENTITY VERIFICATION QUEUE */}
            <div className={`p-6 rounded-3xl border border-rose-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Identity Verification Queue</h3>
                  <p className="text-xs text-slate-600">Review tax forms, certificates, and ID documents submitted by freelancers.</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-extrabold">
                  {verifications.filter(v => v.status === 'PENDING').length} Pending
                </span>
              </div>

              {verifications.filter(v => v.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-slate-600 font-bold py-4">No pending identity verification applications in queue.</p>
              ) : (
                <div className="space-y-3">
                  {verifications.filter(v => v.status === 'PENDING').map(v => (
                    <div key={v.id} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                          <span className="text-xs text-blue-600 font-bold">({v.role})</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">Skills: {v.skills || 'Not specified'}</p>
                        
                        {/* Document Verification Box */}
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex items-center space-x-2 text-xs">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-700">📄 {v.document_type || 'Document'}:</span>
                            <span className="font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{v.document_file_name || 'Identity_Document.pdf'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewVerificationDocument(v)}
                              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-xs rounded-lg border border-blue-200 flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Document</span>
                            </button>
                            <button
                              onClick={() => handleDownloadVerificationDocument(v)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium pt-0.5">Submitted: {v.submitted_at || v.date}</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                        <button onClick={() => handleApproveVerification(v)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Award Badge</span>
                        </button>
                        <button onClick={() => { setRejectingVerification(v); setVerificationRejectionReasonInput(''); }} className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: USER ACCOUNT MODERATION */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">User Account Moderation</h3>
                <p className="text-xs text-slate-600">Activate, suspend, or audit client and freelancer accounts.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-500 text-xs font-semibold">No registered users found.</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id}>
                          <td className="py-3 font-extrabold text-slate-900">{u.name}</td>
                          <td className="py-3 text-slate-700">{u.role}</td>
                          <td className="py-3 text-slate-600">{u.email}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => toggleUserStatus(u)}
                              className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                                u.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PROJECT VERIFICATION QUEUE TAB */}
        {activeTab === 'project_verifications' && (
          <div className="p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2.5">
                  <FileCheck className="w-7 h-7 text-amber-500" />
                  <span>Project Verification Queue</span>
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Review client project postings and verify uploaded technical documents, specifications, and abstracts.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black">
                  {projectVerifications.length} Pending Project Review{projectVerifications.length === 1 ? '' : 's'}
                </span>
                <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black">
                  {projectDocVerifications.filter(d => d.status === 'PENDING').length} Pending Document Verification{projectDocVerifications.filter(d => d.status === 'PENDING').length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* SUB-TAB NAV TOGGLE: PROJECT VERIFICATION vs PROJECT DOCUMENT VERIFICATION */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setProjectVerifSubTab('project_details')}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                  projectVerifSubTab === 'project_details'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Project Verification ({projectVerifications.length})</span>
              </button>

              <button
                onClick={() => setProjectVerifSubTab('project_documents')}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                  projectVerifSubTab === 'project_documents'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Project Document Verification ({projectDocVerifications.filter(d => (d.status || '').toUpperCase() === 'PENDING').length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: PROJECT DETAILS VERIFICATION */}
            {projectVerifSubTab === 'project_details' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Pending Marketplace Project Postings</h3>
                  <p className="text-xs text-slate-500 font-medium">Approved projects are instantly listed on the Freelancer Browse Jobs Marketplace.</p>
                </div>

                {projectVerifications.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-sm text-slate-800 font-extrabold">No pending project postings in queue.</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">All client project postings are verified and active.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectVerifications.map(p => (
                      <div key={p.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[10px] font-extrabold uppercase">
                              Pending Review
                            </span>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                              {p.category}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-semibold">Posted: {p.postedDate}</span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-base">{p.title}</h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                            <span className="font-bold text-slate-800 flex items-center space-x-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>Client: {p.client} ({p.client_id})</span>
                            </span>
                            <span>•</span>
                            <span>Budget: <strong className="text-slate-900 font-bold">{p.budget}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong className="text-slate-900 font-bold">{p.duration}</strong></span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(Array.isArray(p.skills) ? p.skills : (typeof p.skills === 'string' ? p.skills.split(',') : [])).map((s, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-slate-50 text-slate-700 border border-slate-200">
                                {typeof s === 'string' ? s.trim() : s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                          <button
                            onClick={() => setSelectedProjectDetail(p)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Details</span>
                          </button>
                          <button
                            onClick={() => handleApproveProject(p)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingProject(p)}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: PROJECT DOCUMENT VERIFICATION */}
            {projectVerifSubTab === 'project_documents' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Client Uploaded Project Documents</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Review requirement specifications, wireframe PDFs, and abstracts submitted by project clients.
                    </p>
                  </div>

                  {/* Status Filters */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
                    {[
                      { id: 'pending', label: 'Pending Queue' },
                      { id: 'approved', label: 'Approved' },
                      { id: 'rejected', label: 'Rejected' },
                      { id: 'all', label: 'All Submissions' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setProjDocFilterTab(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer font-extrabold ${
                          projDocFilterTab === f.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search project title, client name, document name, type..."
                    value={projDocSearchQuery}
                    onChange={(e) => setProjDocSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Filtered Document List */}
                {(() => {
                  const filteredDocs = projectDocVerifications.filter(d => {
                    const st = (d.status || '').toLowerCase();
                    if (projDocFilterTab === 'pending' && st !== 'pending') return false;
                    if (projDocFilterTab === 'approved' && st !== 'approved') return false;
                    if (projDocFilterTab === 'rejected' && st !== 'rejected') return false;

                    if (projDocSearchQuery.trim()) {
                      const q = projDocSearchQuery.toLowerCase().trim();
                      const matchTitle = (d.project_title || '').toLowerCase().includes(q);
                      const matchClient = (d.client_name || '').toLowerCase().includes(q) || (d.client_email || '').toLowerCase().includes(q);
                      const matchDoc = (d.document_name || '').toLowerCase().includes(q) || (d.document_type || '').toLowerCase().includes(q);
                      return matchTitle || matchClient || matchDoc;
                    }
                    return true;
                  });

                  if (filteredDocs.length === 0) {
                    return (
                      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm shadow-xs">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">No project document verification records found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {projDocFilterTab === 'pending'
                            ? 'No pending client project document verifications in queue.'
                            : 'No records match the selected filter or search query.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredDocs.map(d => (
                        <div key={d.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                  d.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : d.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {d.status === 'APPROVED' ? '✓ Verified' : (d.status === 'REJECTED' ? '✕ Rejected' : '◷ Pending Verification')}
                                </span>
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                                  {d.document_type || 'Project Requirement Spec'}
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500 font-semibold">Submitted: {d.submitted_at}</span>
                              </div>

                              <h4 className="font-extrabold text-slate-900 text-base leading-snug">{d.project_title}</h4>
                              <p className="text-xs text-slate-600 font-medium">
                                Client: <strong className="text-slate-900 font-extrabold">{d.client_name}</strong> ({d.client_email}) | Category: <span className="text-slate-800 font-bold">{d.project_category}</span> | Budget: <span className="text-slate-900 font-bold">{d.project_budget}</span>
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                              {d.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveProjDoc(d)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve Document</span>
                                  </button>

                                  <button
                                    onClick={() => { setRejectingProjDoc(d); setProjDocRejectionReasonInput(''); }}
                                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => setDeletingProjDoc(d)}
                                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                                title="Delete document record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Uploaded File Box */}
                          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 text-xs min-w-0 flex-1">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-extrabold text-slate-900 text-xs truncate">{d.document_name}</p>
                                <p className="text-[11px] text-slate-500 font-medium">Type: {d.document_type} • Size: {d.document_file_size || '1.5 MB'}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewProjDoc(d)}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Document</span>
                              </button>

                              <button
                                onClick={() => handleDownloadProjDoc(d)}
                                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>

                          {/* Rejection Reason Display */}
                          {d.status === 'REJECTED' && d.rejection_reason && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                              <strong className="font-bold">Rejection Feedback Reason:</strong> {d.rejection_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE CONTRACTS & COMPLETED PROJECTS TAB */}
        {activeTab === 'active_contracts' && (
          <div className="p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <span>Platform Contracts & Projects</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  View active client-freelancer contracts and inspect complete history for completed projects.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black">
                  {activeContracts.length} Active Contract{activeContracts.length === 1 ? '' : 's'}
                </span>
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                  {completedProjects.length} Completed Project{completedProjects.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* SUB-TAB TOGGLE FILTER */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setContractSubTab('active')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                  contractSubTab === 'active'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Contracts ({activeContracts.length})</span>
              </button>

              <button
                onClick={() => setContractSubTab('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                  contractSubTab === 'completed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed Projects ({completedProjects.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: ACTIVE CONTRACTS */}
            {contractSubTab === 'active' && (
              activeContracts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm shadow-xs">
                  No active contracts running currently.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeContracts.map(c => (
                    <div key={c.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                              {c.contract_id || `CTR-${c.id}`}
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{c.status || 'Active'}</span>
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">{c.project_title || c.project_name}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Agreed Budget</span>
                          <span className="text-lg font-black text-blue-600">{c.agreed_amount}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Details</span>
                          <p className="font-extrabold text-slate-800">{c.client_name}</p>
                          <p className="text-slate-500 font-medium truncate">{c.client_email}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Freelancer Details</span>
                          <p className="font-extrabold text-slate-800">{c.freelancer_name}</p>
                          <p className="text-slate-500 font-medium truncate">{c.freelancer_email}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Timeline & Escrow</span>
                          <p className="font-extrabold text-slate-800">Started: {c.start_date}</p>
                          <p className="text-emerald-600 font-bold">Escrow Held: {c.escrow_balance}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="w-full sm:w-2/3 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                            <span>Sprint Progress</span>
                            <span className="text-blue-600 font-extrabold">{c.progress_pct || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(5, c.progress_pct || 0)}%` }} />
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedContractDetailModal(c)}
                          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs shrink-0 flex items-center space-x-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB CONTENT 2: COMPLETED PROJECTS */}
            {contractSubTab === 'completed' && (
              completedProjects.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm shadow-xs">
                  No completed projects found yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedProjects.map(c => (
                    <div key={c.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                              {c.contract_id || `CTR-${c.id}`}
                            </span>
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-extrabold uppercase flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">{c.project_title || c.project_name}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Total Agreed Budget</span>
                          <span className="text-lg font-black text-emerald-600">{c.agreed_amount}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Details</span>
                          <p className="font-extrabold text-slate-800 truncate">{c.client_name}</p>
                          <p className="text-slate-500 font-medium truncate">{c.client_email}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Freelancer Details</span>
                          <p className="font-extrabold text-slate-800 truncate">{c.freelancer_name}</p>
                          <p className="text-slate-500 font-medium truncate">{c.freelancer_email}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid & Escrow</span>
                          <p className="font-extrabold text-emerald-600">{c.total_paid || c.agreed_amount}</p>
                          <p className="text-slate-500 font-medium">Remaining Escrow: {c.remaining_escrow || '₹0'}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Completion Date</span>
                          <p className="font-extrabold text-slate-800">{c.completion_date || c.end_date || 'Completed'}</p>
                          <p className="text-emerald-700 font-extrabold text-[11px]">{c.payment_status || 'Paid & Released'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="w-full sm:w-2/3 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                            <span>Project Progress</span>
                            <span className="text-emerald-600 font-extrabold">100% (Completed)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-full" />
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedContractDetailModal(c)}
                          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs shrink-0 flex items-center space-x-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* VERIFICATIONS TAB */}
        {activeTab === 'verifications' && (
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Freelancer Identity Verification</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Review and verify freelancer identity documents submitted for platform verification.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
                {[
                  { id: 'pending', label: 'Pending Queue' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'all', label: 'All Submissions' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setKycFilterTab(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer font-extrabold ${
                      kycFilterTab === f.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search freelancer name, email, document type, ID..."
                value={kycSearchQuery}
                onChange={(e) => setKycSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {verifications.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No pending identity verification applications</p>
                <p className="text-xs text-slate-400 mt-1">
                  {kycFilterTab === 'pending'
                    ? 'No pending freelancer identity verifications currently in queue.'
                    : 'No records match the selected filter or search query.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map(v => (
                  <div key={v.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm shrink-0">
                          {v.avatar_url ? (
                            <img src={v.avatar_url} alt={v.name} className="w-full h-full rounded-2xl object-cover" />
                          ) : (
                            (v.name || 'F').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-base text-slate-900">{v.name}</h3>
                            {v.status === 'APPROVED' && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-extrabold rounded-full">
                                ✓ Approved
                              </span>
                            )}
                            {v.status === 'PENDING' && (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-extrabold rounded-full">
                                ◷ Pending Review
                              </span>
                            )}
                            {v.status === 'REJECTED' && (
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-extrabold rounded-full">
                                Rejected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold">{v.email || v.user_id} • Submitted: {v.submitted_at || v.date}</p>
                        </div>
                      </div>

                      {/* Document Verification Info Box */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-500">Document Type:</span>
                            <span className="font-black text-slate-900">{v.document_type || 'Identity Document'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-500 ml-6">Doc Number:</span>
                            <span className="font-mono font-bold text-blue-600">{v.document_number || 'N/A'}</span>
                          </div>
                          {v.rejection_reason && v.status === 'REJECTED' && (
                            <div className="text-rose-600 font-medium ml-6 pt-1">
                              <strong>Rejection Reason:</strong> {v.rejection_reason}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewVerificationDocument(v)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Document</span>
                          </button>
                          <button
                            onClick={() => handleDownloadVerificationDocument(v)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions strictly based on status */}
                    <div className="flex items-center space-x-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
                      {v.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveVerification(v)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => { setRejectingVerification(v); setVerificationRejectionReasonInput(''); }}
                            className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center space-x-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      {v.status === 'REJECTED' && (
                        <button
                          onClick={() => setDeletingVerification(v)}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USER MODERATION TAB */}
        {activeTab === 'users' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">User Account Moderation</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500 text-xs font-semibold">No registered users found.</td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id}>
                        <td className="py-3 text-slate-900">{u.name}</td>
                        <td className="py-3 text-slate-600">{u.role}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => toggleUserStatus(u)} className={`px-3 py-1 rounded-xl text-xs cursor-pointer font-bold ${
                            u.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}>
                            {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GOVERNANCE TAB */}
        {activeTab === 'governance' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Category Governance</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Manage active project categories available for client project postings.</p>
              </div>
              <button onClick={() => setShowAddCategoryModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                + Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm">
                No project categories configured yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => (
                  <div key={c.id || c.name} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                      {(() => {
                        const count = typeof c.projects === 'number' ? c.projects : (c.activeProjects ?? 0);
                        return (
                          <p className="text-xs text-slate-500 mt-1">
                            {count} Active Project{count === 1 ? '' : 's'}
                          </p>
                        );
                      })()}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'financials' && (() => {
          const filteredAdminTransactions = adminTransactions.filter(tx => {
            if (ledgerSearchQuery.trim()) {
              const q = ledgerSearchQuery.toLowerCase().trim();
              const matchProject = (tx.project_name || '').toLowerCase().includes(q);
              const matchClient = (tx.client_email || '').toLowerCase().includes(q) || (tx.client_name || '').toLowerCase().includes(q);
              const matchFreelancer = (tx.freelancer_email || '').toLowerCase().includes(q) || (tx.freelancer_name || '').toLowerCase().includes(q);
              const matchContract = (tx.contract_number || '').toLowerCase().includes(q) || (tx.contract_id || '').toString().includes(q);
              const matchTxnId = (tx.id || '').toLowerCase().includes(q);
              const matchMilestone = (tx.milestone_name || '').toLowerCase().includes(q);
              if (!matchProject && !matchClient && !matchFreelancer && !matchContract && !matchTxnId && !matchMilestone) {
                return false;
              }
            }
            if (ledgerFilter === 'paid') return (tx.status || '').toLowerCase() === 'paid';
            if (ledgerFilter === 'pending') return (tx.status || '').toLowerCase() === 'pending';
            if (ledgerFilter === 'milestone_release') return (tx.type || '').toLowerCase().includes('milestone');
            if (ledgerFilter === 'escrow_hold') return (tx.type || '').toLowerCase().includes('escrow');
            return true;
          });

          return (
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Escrow & Revenue Ledger</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Real-time platform revenue tracking, active escrow holdings, project financial breakdowns, and full audit ledger.
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl">
                  <button
                    onClick={() => setAdminLedgerSubTab('transactions')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                      adminLedgerSubTab === 'transactions'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ScrollText className="w-4 h-4" />
                    <span>Transaction Ledger</span>
                  </button>
                  <button
                    onClick={() => setAdminLedgerSubTab('projects')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                      adminLedgerSubTab === 'projects'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Project Financial Breakdown</span>
                  </button>
                </div>
              </div>

              {/* 3 PRESERVED SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">TOTAL PLATFORM REVENUE</p>
                  <p className="text-3xl font-extrabold text-emerald-700 mt-1">{metrics.platform_revenue}</p>
                  <p className="text-[11px] text-emerald-600/80 font-semibold mt-1">10% Platform Commission Collected</p>
                </div>
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">ACTIVE ESCROW HELD</p>
                  <p className="text-3xl font-extrabold text-blue-700 mt-1">{metrics.total_escrow_volume}</p>
                  <p className="text-[11px] text-blue-600/80 font-semibold mt-1">Secured in FreeMatch Escrow Vault</p>
                </div>
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 shadow-xs">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">TOTAL TRANSACTIONS</p>
                  <p className="text-3xl font-extrabold text-purple-700 mt-1">{metrics.total_transactions_count}</p>
                  <p className="text-[11px] text-purple-600/80 font-semibold mt-1">Payment Releases & Escrow Holds</p>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    placeholder="Search by Project, Client, Freelancer, Contract or Txn ID..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {ledgerSearchQuery && (
                    <button
                      onClick={() => setLedgerSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="text-slate-400 font-semibold mr-1 flex items-center">
                    <Filter className="w-3.5 h-3.5 mr-1" /> Filter:
                  </span>
                  {[
                    { id: 'all', label: 'All Transactions' },
                    { id: 'paid', label: 'Paid / Released' },
                    { id: 'pending', label: 'Pending / Escrow Locked' },
                    { id: 'milestone_release', label: 'Milestone Releases' },
                    { id: 'escrow_hold', label: 'Escrow Holds' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setLedgerFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        ledgerFilter === f.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUB-TAB 1: TRANSACTION LEDGER TABLE */}
              {adminLedgerSubTab === 'transactions' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                      <ScrollText className="w-4 h-4 text-blue-600" />
                      <span>Payment & Escrow Transaction History</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      Showing {filteredAdminTransactions.length} of {adminTransactions.length} records
                    </span>
                  </div>

                  {filteredAdminTransactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-semibold text-xs space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-300" />
                      <p>No transaction records found matching your search or filter.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                            <th className="pb-3 px-2">Txn ID & Type</th>
                            <th className="pb-3 px-2">Project & Milestone</th>
                            <th className="pb-3 px-2">Client (Payer)</th>
                            <th className="pb-3 px-2">Freelancer (Payee)</th>
                            <th className="pb-3 px-2">Amount</th>
                            <th className="pb-3 px-2">Payment Status</th>
                            <th className="pb-3 px-2">Escrow Status</th>
                            <th className="pb-3 px-2">Date / Time</th>
                            <th className="pb-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                          {filteredAdminTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-2">
                                <span className="font-extrabold text-slate-900 block">{tx.id}</span>
                                <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  tx.type === 'Escrow Hold' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className="font-extrabold text-slate-900 block max-w-[180px] truncate" title={tx.project_name}>
                                  {tx.project_name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold block truncate max-w-[180px]">
                                  {tx.milestone_name} ({tx.milestone_id})
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium block">
                                  Contract: {tx.contract_number}
                                </span>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className="font-bold text-slate-900 block">{tx.client_name}</span>
                                <span className="text-[11px] text-slate-500 font-medium block">{tx.client_email}</span>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className="font-bold text-slate-900 block">{tx.freelancer_name}</span>
                                <span className="text-[11px] text-slate-500 font-medium block">{tx.freelancer_email}</span>
                              </td>
                              <td className="py-3.5 px-2 text-slate-900 font-extrabold text-sm">
                                {tx.amount}
                              </td>
                              <td className="py-3.5 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                  tx.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {tx.payment_status}
                                </span>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                  tx.escrow_status === 'Released' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}>
                                  {tx.escrow_status}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-slate-500 font-semibold text-[11px]">
                                {tx.date}
                              </td>
                              <td className="py-3.5 px-2 text-right space-x-1.5">
                                <button
                                  onClick={() => handleDownloadAdminInvoice(tx)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                  title="Download PDF Invoice"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  <span>PDF Invoice</span>
                                </button>
                                <button
                                  onClick={() => setViewingAdminTransaction(tx)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Details</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: PROJECT FINANCIAL BREAKDOWN VIEW */}
              {adminLedgerSubTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Project Financial Summaries & Milestone Breakdown</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      {projectFinancialSummaries.length} Total Contracts
                    </span>
                  </div>

                  {projectFinancialSummaries.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-semibold text-xs">
                      No project contracts found in database.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {projectFinancialSummaries.map(p => (
                        <div key={p.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-extrabold text-base text-slate-900">{p.project_name}</h4>
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-extrabold">
                                  {p.contract_number}
                                </span>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                                  {p.project_status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold mt-1">
                                Client: <span className="text-slate-800">{p.client_name}</span> ({p.client_email}) | Freelancer: <span className="text-slate-800">{p.freelancer_name}</span> ({p.freelancer_email})
                              </p>
                            </div>

                            <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Agreed Amount</p>
                                <p className="text-sm font-extrabold text-slate-900">{p.agreed_amount_str}</p>
                              </div>
                              <div className="border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Released</p>
                                <p className="text-sm font-extrabold text-emerald-700">{p.total_released_str}</p>
                              </div>
                              <div className="border-l border-slate-200 pl-4">
                                <p className="text-[10px] font-bold text-blue-600 uppercase">In Escrow</p>
                                <p className="text-sm font-extrabold text-blue-700">{p.remaining_escrow_str}</p>
                              </div>
                            </div>
                          </div>

                          {/* Milestones list for this project */}
                          <div>
                            <p className="text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">Milestone Breakdown Schedule</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {p.milestones && p.milestones.length > 0 ? (
                                p.milestones.map(m => (
                                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                                    <div>
                                      <p className="font-extrabold text-slate-900 truncate max-w-[160px]">{m.number}. {m.title}</p>
                                      <p className="text-slate-500 font-semibold mt-0.5">{m.amount || `₹${Math.round(m.amount_val || 0).toLocaleString()}`}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      m.is_paid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}>
                                      {m.is_paid ? 'Paid' : (m.status || 'In Progress')}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 font-semibold italic">No milestone breakdown configured.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TRANSACTION DETAILS MODAL */}
              {viewingAdminTransaction && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <ScrollText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900">
                            Transaction Details — {viewingAdminTransaction.id}
                          </h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              viewingAdminTransaction.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              Payment: {viewingAdminTransaction.payment_status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              viewingAdminTransaction.escrow_status === 'Released' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              Escrow: {viewingAdminTransaction.escrow_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewingAdminTransaction(null)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      {/* Project & Contract Info */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Project & Contract Info</p>
                        <div>
                          <span className="text-slate-500 block">Project Name:</span>
                          <span className="font-extrabold text-slate-900 text-sm block">{viewingAdminTransaction.project_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Project ID:</span>
                          <span className="text-slate-800 font-bold">#{viewingAdminTransaction.project_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Contract ID:</span>
                          <span className="text-slate-800 font-bold">{viewingAdminTransaction.contract_number} (Internal ID #{viewingAdminTransaction.contract_id})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Milestone Name:</span>
                          <span className="text-slate-800 font-bold">{viewingAdminTransaction.milestone_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Milestone ID:</span>
                          <span className="text-slate-800 font-bold">{viewingAdminTransaction.milestone_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Project Status:</span>
                          <span className="text-slate-800 font-bold">{viewingAdminTransaction.project_status}</span>
                        </div>
                      </div>

                      {/* Parties Involved */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Parties Involved</p>
                        <div className="pb-2 border-b border-slate-200/60">
                          <span className="text-slate-500 block">Client (Payer):</span>
                          <span className="font-extrabold text-slate-900 block">{viewingAdminTransaction.client_name}</span>
                          <span className="text-slate-600 block">{viewingAdminTransaction.client_email}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-500 block">Freelancer (Payee):</span>
                          <span className="font-extrabold text-slate-900 block">{viewingAdminTransaction.freelancer_name}</span>
                          <span className="text-slate-600 block">{viewingAdminTransaction.freelancer_email}</span>
                        </div>
                      </div>

                      {/* Transaction & Payment Data */}
                      <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Transaction ID</span>
                          <span className="font-extrabold text-slate-900">{viewingAdminTransaction.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Transaction Type</span>
                          <span className="font-extrabold text-slate-900">{viewingAdminTransaction.type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Amount</span>
                          <span className="font-extrabold text-blue-700 text-base">{viewingAdminTransaction.amount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Payment Date</span>
                          <span className="font-bold text-slate-900">{viewingAdminTransaction.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Payment Method</span>
                          <span className="font-bold text-slate-900">{viewingAdminTransaction.payment_method}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Invoice Info</span>
                          <span className="font-bold text-slate-900">{viewingAdminTransaction.invoice_info}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Release Status</span>
                          <span className="font-bold text-slate-900">{viewingAdminTransaction.release_status}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Escrow Vault</span>
                          <span className="font-bold text-slate-900">FreeMatch Escrow System</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleDownloadAdminInvoice(viewingAdminTransaction)}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF Invoice</span>
                      </button>
                      <button
                        onClick={() => setViewingAdminTransaction(null)}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Security & Audit Logs</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold py-4 text-center">No recent security or audit activity recorded.</p>
              ) : (
                auditLogs.map(l => (
                  <div key={l.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{l.event}</span>
                      <p className="text-slate-600 font-medium">{l.details}</p>
                    </div>
                    <span className="text-slate-600 font-bold">{l.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: ADMIN PROFILE VIEW */}
        {activeTab === 'profile' && (
          <AdminProfileView
            userSession={userSession}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isDark={false}
            onNavigateTab={setActiveTab}
            showToastMessage={(msg, type) => setToast({ message: msg, type })}
          />
        )}

        {/* TAB: ADMIN SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <AdminSettingsView
            userSession={userSession}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isDark={false}
            onNavigateTab={setActiveTab}
            showToastMessage={(msg, type) => setToast({ message: msg, type })}
          />
        )}

        {/* TAB: NOTIFICATIONS CENTER */}
        {activeTab === 'notifications' && (
          <div className="p-8">
            <NotificationCenter userSession={userSession} onNavigateTab={setActiveTab} />
          </div>
        )}



        {/* MODAL: ADD CATEGORY */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Add New Skill Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Mobile Engineering"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer">Add Category</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LOGOUT CONFIRMATION */}
        {showLogoutConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 sm:p-8 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Confirm Admin Logout</h3>
                  <p className="text-xs text-slate-600 font-semibold">Sign out of Admin Control Panel</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to log out of the FreeMatch AI Admin System Control Console? Your active session credentials will be cleared.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirmModal(false);
                    onSignOut();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT PROJECT REASON */}
        {rejectingProject && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Reject Project Post</h3>
                  <p className="text-xs text-slate-500 font-semibold">{rejectingProject.title}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Please provide specific feedback for the client (<strong>{rejectingProject.client}</strong>). This rejection reason will be displayed on their project page.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rejection Feedback / Reason</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Scope unclear, budget too low for requirements, or missing key details."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingProject(null);
                    setRejectionReasonInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectProjectSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT FREELANCER IDENTITY VERIFICATION */}
        {rejectingVerification && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Reject Identity Verification</h3>
                  <p className="text-xs text-slate-500 font-semibold">{rejectingVerification.name} ({rejectingVerification.user_id})</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Please provide specific feedback for the freelancer regarding why their identity/KYC document verification was rejected.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rejection Reason / Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={verificationRejectionReasonInput}
                  onChange={(e) => setVerificationRejectionReasonInput(e.target.value)}
                  placeholder="e.g. ID document unreadable, name mismatch on tax form, or missing government photo ID."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingVerification(null);
                    setVerificationRejectionReasonInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectVerificationSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW FULL PROJECT DETAILS */}
        {selectedProjectDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 sm:p-8 rounded-3xl max-w-2xl w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[10px] font-extrabold uppercase">
                    {selectedProjectDetail.approval_status || 'Pending Review'}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedProjectDetail.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Client: <strong className="text-slate-800">{selectedProjectDetail.client}</strong> ({selectedProjectDetail.client_id}) • Posted {selectedProjectDetail.postedDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProjectDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 font-bold text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Category</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedProjectDetail.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Budget</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedProjectDetail.budget}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Duration</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedProjectDetail.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedProjectDetail.skills) ? selectedProjectDetail.skills : (typeof selectedProjectDetail.skills === 'string' ? selectedProjectDetail.skills.split(',') : [])).map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {typeof s === 'string' ? s.trim() : s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Description</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {selectedProjectDetail.description}
                </p>
              </div>

              {selectedProjectDetail.abstract && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Technical Abstract / Spec</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    {selectedProjectDetail.abstract}
                  </p>
                </div>
              )}

              {selectedProjectDetail.attached_file_name && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attached Document</h4>
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{selectedProjectDetail.attached_file_name}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    const p = selectedProjectDetail;
                    setSelectedProjectDetail(null);
                    setRejectingProject(p);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer"
                >
                  Reject Project
                </button>
                <button
                  onClick={() => {
                    const p = selectedProjectDetail;
                    setSelectedProjectDetail(null);
                    handleApproveProject(p);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW FREELANCER IDENTITY VERIFICATION DOCUMENT / PDF */}
        {viewingDocumentModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 sm:p-8 rounded-3xl max-w-4xl w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-fadeIn">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                    <FileText className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Document Verification Preview</h3>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">
                      Freelancer: <strong className="text-slate-900">{viewingDocumentModal.name}</strong> ({viewingDocumentModal.user_id})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadVerificationDocument(viewingDocumentModal)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Document</span>
                  </button>
                  <button
                    onClick={handleCloseDocumentModal}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 font-bold text-xs cursor-pointer transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Document Meta Info Bar */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-extrabold shrink-0">
                <div className="flex items-center space-x-2 text-slate-700">
                  <span>📄 File:</span>
                  <span className="text-blue-600">{viewingDocumentModal.docName}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500">
                  <span>Type: {viewingDocumentModal.docName.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Verification File'}</span>
                  <span>•</span>
                  <span>Security: Verified Administrative Stream</span>
                </div>
              </div>

              {/* Document Content Viewer Area */}
              <div className="flex-1 min-h-[420px] bg-slate-800 rounded-2xl overflow-hidden relative border border-slate-700 flex items-center justify-center">
                {viewingDocumentModal.loading ? (
                  <div className="p-8 text-center text-white space-y-3">
                    <RefreshCw className="w-10 h-10 text-blue-400 mx-auto animate-spin" />
                    <p className="text-sm font-bold text-slate-200">Loading document preview from secure storage...</p>
                  </div>
                ) : viewingDocumentModal.docUrl ? (
                  viewingDocumentModal.docUrl.startsWith('data:image/') || (viewingDocumentModal.mimeType && viewingDocumentModal.mimeType.startsWith('image/')) || /\.(jpg|jpeg|png|webp|gif)$/i.test(viewingDocumentModal.docName) ? (
                    <img
                      src={viewingDocumentModal.docUrl}
                      alt={viewingDocumentModal.docName}
                      className="max-h-full max-w-full object-contain p-4 rounded-xl"
                    />
                  ) : (
                    <iframe
                      src={viewingDocumentModal.docUrl}
                      title={viewingDocumentModal.docName}
                      className="w-full h-full border-none"
                    />
                  )
                ) : (
                  <div className="p-8 text-center text-white space-y-3">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-300">Submitted Document: {viewingDocumentModal.docName}</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                      {viewingDocumentModal.error || 'Document record is stored securely in FreeMatch AI Security Vault. Use the Download button above to save or view locally.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                <div className="text-xs font-bold text-slate-500">
                  {viewingDocumentModal.status === 'APPROVED' ? (
                    <span className="text-emerald-700 font-semibold">This document is verified and approved. Identity badge awarded.</span>
                  ) : viewingDocumentModal.status === 'REJECTED' ? (
                    <span className="text-rose-700 font-semibold">
                      This document was rejected.{viewingDocumentModal.rejection_reason ? ` Reason: ${viewingDocumentModal.rejection_reason}` : ''}
                    </span>
                  ) : (
                    <span>Inspect submitted document carefully before awarding verified badge.</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {viewingDocumentModal.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          const item = viewingDocumentModal.item;
                          setViewingDocumentModal(null);
                          handleApproveVerification(item);
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Badge</span>
                      </button>
                      <button
                        onClick={() => {
                          const item = viewingDocumentModal.item;
                          setViewingDocumentModal(null);
                          setRejectingVerification(item);
                          setVerificationRejectionReasonInput('');
                        }}
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-extrabold cursor-pointer flex items-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  {viewingDocumentModal.status === 'APPROVED' && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approved / Verified</span>
                    </div>
                  )}
                  {viewingDocumentModal.status === 'REJECTED' && (
                    <div className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ACTIVE / COMPLETED CONTRACT DETAILS */}
        {selectedContractDetailModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 sm:p-8 rounded-3xl max-w-3xl w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b pb-4 border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                      {selectedContractDetailModal.contract_id || `CTR-${selectedContractDetailModal.id}`}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      selectedContractDetailModal.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {selectedContractDetailModal.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1.5">{selectedContractDetailModal.project_title || selectedContractDetailModal.project_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedContractDetailModal(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 font-bold text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Client Details</span>
                  <p className="font-extrabold text-slate-800 mt-0.5 truncate">{selectedContractDetailModal.client_name}</p>
                  <p className="text-slate-500 text-[11px] font-semibold truncate">{selectedContractDetailModal.client_email}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Freelancer Details</span>
                  <p className="font-extrabold text-slate-800 mt-0.5 truncate">{selectedContractDetailModal.freelancer_name}</p>
                  <p className="text-slate-500 text-[11px] font-semibold truncate">{selectedContractDetailModal.freelancer_email}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Agreed Budget</span>
                  <p className="font-extrabold text-blue-600 text-sm mt-0.5">{selectedContractDetailModal.agreed_amount}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">{selectedContractDetailModal.payment_type || 'Milestone Based'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Paid / Escrow</span>
                  <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{selectedContractDetailModal.total_paid || selectedContractDetailModal.agreed_amount}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">
                    Escrow: {selectedContractDetailModal.remaining_escrow !== undefined ? selectedContractDetailModal.remaining_escrow : (selectedContractDetailModal.escrow_balance || '₹0')}
                  </p>
                </div>
              </div>

              {/* DATES & PAYMENT STATUS META BAR */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Start / Completion Date</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedContractDetailModal.status === 'Completed'
                      ? (selectedContractDetailModal.completion_date || selectedContractDetailModal.end_date || 'Completed')
                      : (selectedContractDetailModal.start_date || 'Active')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Status</span>
                  <span className="font-extrabold text-emerald-700">
                    {selectedContractDetailModal.payment_status || (selectedContractDetailModal.status === 'Completed' ? 'Paid & Released' : 'Escrow Secured')}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 uppercase text-[10px] tracking-wider font-extrabold">Overall Project Progress</span>
                  <span className="text-blue-600 font-extrabold">{selectedContractDetailModal.progress_pct || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    selectedContractDetailModal.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`} style={{ width: `${Math.max(5, selectedContractDetailModal.progress_pct || 0)}%` }} />
                </div>
              </div>

              {/* MILESTONE & PAYMENT BREAKDOWN SECTION */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <ScrollText className="w-4 h-4 text-blue-600" />
                  <span>Agreed Milestones & Payment History Breakdown</span>
                </h4>

                {(!selectedContractDetailModal.milestones || selectedContractDetailModal.milestones.length === 0) ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No milestone breakdown details recorded for this contract.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedContractDetailModal.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-xs">
                            Milestone {idx + 1}: {m.title}
                          </span>
                          <span className="font-black text-blue-600 text-sm">{m.amount}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Status</span>
                            <span className={`font-extrabold ${m.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {m.status || 'In Progress'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Payment Status</span>
                            <span className={`font-extrabold ${m.payment_status === 'Paid & Released' ? 'text-emerald-700' : 'text-blue-600'}`}>
                              {m.payment_status || 'Pending'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Txn / Escrow Ref</span>
                            <span className="font-extrabold text-slate-800 font-mono">{m.transaction_id || 'N/A'}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Payment Date / Invoice</span>
                            <span className="font-extrabold text-slate-700">{m.payment_date || m.invoice_info || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedContractDetailModal(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CATEGORY DELETE CONFIRMATION */}
        {deletingCategoryModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setDeletingCategoryModal(null); }}
          >
            <div className="p-6 sm:p-7 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-5">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Delete Category?</h3>
                  <p className="text-xs text-slate-500 font-semibold">{deletingCategoryModal.name}</p>
                </div>
              </div>

              {(deletingCategoryModal.projects > 0 || deletingCategoryModal.errorMsg) ? (
                <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-1.5">
                  <p className="text-xs font-bold text-amber-900 leading-relaxed">
                    {deletingCategoryModal.errorMsg || `This category is currently associated with ${deletingCategoryModal.projects} existing project(s) and cannot be permanently deleted. You can deactivate it instead.`}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong className="font-extrabold text-slate-900">"{deletingCategoryModal.name}"</strong>? This action will remove the category from future project postings.
                </p>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingCategoryModal(null)}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {(deletingCategoryModal.projects > 0 || deletingCategoryModal.errorMsg) ? 'Close' : 'Cancel'}
                </button>

                {(!deletingCategoryModal.projects || deletingCategoryModal.projects === 0) && !deletingCategoryModal.errorMsg && (
                  <button
                    type="button"
                    onClick={() => confirmDeleteCategory(deletingCategoryModal)}
                    disabled={deletingCategoryLoading}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {deletingCategoryLoading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DELETE REJECTED IDENTITY VERIFICATION CONFIRMATION */}
        {deletingVerification && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setDeletingVerification(null); }}
          >
            <div className="p-6 sm:p-7 rounded-3xl max-w-md w-full border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 shadow-2xl space-y-5">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Verification?</h3>
                  <p className="text-xs text-slate-500 font-semibold">{deletingVerification.name || deletingVerification.user_id}</p>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete this rejected identity verification record for <strong className="font-extrabold text-slate-900 dark:text-white">{deletingVerification.name || deletingVerification.user_id}</strong>?
              </p>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeletingVerification(null)}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteVerificationSubmit}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT PROJECT DOCUMENT VERIFICATION */}
        {rejectingProjDoc && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setRejectingProjDoc(null); }}
          >
            <div className="p-6 sm:p-7 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Reject Project Document</h3>
                  <p className="text-xs text-slate-500 font-semibold">{rejectingProjDoc.document_name} ({rejectingProjDoc.project_title})</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Rejection Feedback Reason:
                </label>
                <textarea
                  rows="3"
                  value={projDocRejectionReasonInput}
                  onChange={(e) => setProjDocRejectionReasonInput(e.target.value)}
                  placeholder="Provide specific feedback or reason for rejecting this project document (e.g. illegible PDF, incomplete technical spec)..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingProjDoc(null)}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectProjDocSubmit}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Notify Client</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DELETE PROJECT DOCUMENT VERIFICATION RECORD */}
        {deletingProjDoc && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setDeletingProjDoc(null); }}
          >
            <div className="p-6 sm:p-7 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-5">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Delete Document Record?</h3>
                  <p className="text-xs text-slate-500 font-semibold">{deletingProjDoc.document_name}</p>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Are you sure you want to delete this project document record for <strong className="font-extrabold text-slate-900">{deletingProjDoc.project_title}</strong>?
              </p>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingProjDoc(null)}
                  className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProjDoc(deletingProjDoc)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
