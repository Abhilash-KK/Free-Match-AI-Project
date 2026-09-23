import React, { useState, useEffect, useRef } from 'react';
import Toast from '../Toast';
import NotificationCenter from '../NotificationCenter';
import AdminProfileView from '../AdminProfileView';
import AdminSettingsView from '../AdminSettingsView';
import { fetchNotifications } from '../../utils/notificationService';
import { openDocumentViewer } from '../../utils/documentViewer';
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
  AlertTriangle
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
  const [selectedContractDetailModal, setSelectedContractDetailModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingCategoryModal, setDeletingCategoryModal] = useState(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && deletingCategoryModal) {
        setDeletingCategoryModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletingCategoryModal]);

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
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !selectedCategory) {
            setSelectedCategory(data.categories[0].name);
          }
        }
        if (Array.isArray(data.skills)) setSkills(data.skills);
        if (Array.isArray(data.audit_logs)) setAuditLogs(data.audit_logs);
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
  const handleApproveVerification = async (vObj) => {
    if (!vObj) return;
    const userId = typeof vObj === 'object' ? (vObj.user_id || vObj.id) : vObj;
    try {
      const res = await apiFetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'approve' })
      });
      if (res && res.ok) {
        setVerifications(prev => prev.filter(v => (v.user_id || v.id) !== userId && v.id !== userId));
        setToast({ message: `Freelancer identity verified & Verified Badge awarded for '${vObj.name || userId}'!`, type: 'success' });
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
    const userId = rejectingVerification.user_id || rejectingVerification.id;
    const feedbackReason = verificationRejectionReasonInput.trim() || 'Verification documents do not meet platform security & compliance standards.';
    try {
      const res = await apiFetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'reject',
          rejection_reason: feedbackReason
        })
      });

      if (res && res.ok) {
        setVerifications(prev => prev.filter(v => (v.user_id || v.id) !== userId && v.id !== userId));
        setToast({ message: `Verification application for '${rejectingVerification.name || userId}' rejected. Freelancer notified.`, type: 'info' });
        setRejectingVerification(null);
        setVerificationRejectionReasonInput('');
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

  const handleViewVerificationDocument = async (v) => {
    let docUrl = v.resume_url;
    let docName = v.resume_name || v.docs || 'Verification_Document.pdf';

    if (!docUrl && v.user_id) {
      try {
        const res = await apiFetch(`/api/freelancer-profile/?username=${encodeURIComponent(v.user_id)}`);
        if (res.ok) {
          const profData = await res.json();
          if (profData && profData.resume_url) {
            docUrl = profData.resume_url;
            docName = profData.resume_name || docName;
          }
        }
      } catch (e) {}
    }

    const docObj = {
      user_id: v.user_id,
      name: v.name,
      docName: docName,
      docUrl: docUrl,
      docSize: v.resume_size || 'PDF Document',
      item: v
    };

    setViewingDocumentModal(docObj);

    if (docUrl) {
      openDocumentViewer({ url: docUrl, name: docName });
    }
  };

  const handleDownloadVerificationDocument = async (v) => {
    let docUrl = v.docUrl || v.resume_url;
    let docName = v.docName || v.resume_name || v.docs || 'Verification_Document.pdf';

    if (!docUrl && v.user_id) {
      try {
        const res = await apiFetch(`/api/freelancer-profile/?username=${encodeURIComponent(v.user_id)}`);
        if (res.ok) {
          const profData = await res.json();
          if (profData && profData.resume_url) {
            docUrl = profData.resume_url;
            docName = profData.resume_name || docName;
          }
        }
      } catch (e) {}
    }

    if (docUrl) {
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `FREEMATCH AI - FREELANCER IDENTITY VERIFICATION DOCUMENT\n\nFreelancer: ${v.name} (${v.user_id})\nDocument Name: ${docName}\nDate Submitted: ${v.date || 'Sep 2026'}\nVerification Status: ${v.status || 'Pending Verification'}\n\nThis document record is registered and saved in FreeMatch AI System Archives.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = docName.endsWith('.txt') ? docName : `${docName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
                  {verifications.length} Pending
                </span>
              </div>

              {verifications.length === 0 ? (
                <p className="text-xs text-slate-600 font-bold py-4">No pending identity verification applications in queue.</p>
              ) : (
                <div className="space-y-3">
                  {verifications.map(v => (
                    <div key={v.id} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                          <span className="text-xs text-blue-600 font-bold">({v.role})</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Skills: {v.skills}</p>
                        
                        {/* Document Verification Box */}
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex items-center space-x-2 text-xs">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-700">📄 Document:</span>
                            <span className="font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{v.resume_name || v.docs || 'Verification_Doc.pdf'}</span>
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
                        <p className="text-[11px] text-slate-500 font-medium pt-0.5">Submitted: {v.date}</p>
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

        {/* ACTIVE CONTRACTS TAB */}
        {activeTab === 'active_contracts' && (
          <div className="p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <span>Active Contracts</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  View and manage all currently active client-freelancer contracts running on the platform.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black">
                  {activeContracts.length || metrics.active_contracts_count} Active Contract{(activeContracts.length || metrics.active_contracts_count) === 1 ? '' : 's'}
                </span>
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                  Escrow Volume: {metrics.total_escrow_volume}
                </span>
              </div>
            </div>

            {activeContracts.length === 0 ? (
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
                        <h3 className="text-lg font-black text-slate-900">{c.project_title}</h3>
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
            )}
          </div>
        )}

        {/* VERIFICATIONS TAB */}
        {activeTab === 'verifications' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Identity Verification Queue</h2>
            {verifications.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm">
                No pending identity verification applications in queue.
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map(v => (
                  <div key={v.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{v.name}</h3>
                        <p className="text-xs text-slate-600 font-semibold">{v.role} • Submitted: {v.date}</p>
                      </div>

                      {/* Document Verification Box */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 max-w-xl">
                        <div className="flex items-center space-x-2 text-xs">
                          <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                          <span className="font-extrabold text-slate-700">📄 Document:</span>
                          <span className="font-extrabold text-slate-900 truncate max-w-xs">{v.resume_name || v.docs || 'Verification_Doc.pdf'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewVerificationDocument(v)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Document</span>
                          </button>
                          <button
                            onClick={() => handleDownloadVerificationDocument(v)}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                      <button onClick={() => handleApproveVerification(v)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Badge</span>
                      </button>
                      <button onClick={() => { setRejectingVerification(v); setVerificationRejectionReasonInput(''); }} className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
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
                      <p className="text-xs text-slate-500 mt-1">{c.projects || 0} Active Projects</p>
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
        {activeTab === 'financials' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Escrow & Revenue Ledger</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-600">TOTAL PLATFORM REVENUE</p>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">{metrics.platform_revenue}</p>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <p className="text-xs font-bold text-blue-600">ACTIVE ESCROW HELD</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">{metrics.total_escrow_volume}</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-xs font-bold text-purple-600">TOTAL TRANSACTIONS</p>
                <p className="text-3xl font-extrabold text-purple-700 mt-1">{metrics.total_transactions_count}</p>
              </div>
            </div>
          </div>
        )}

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

        {/* TAB: DEDICATED PROJECT VERIFICATION QUEUE */}
        {activeTab === 'project_verifications' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
                  <FileCheck className="w-6 h-6 text-amber-600" />
                  <span>Project Verification Queue</span>
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Review and verify client project postings before they are published to the Freelancer Marketplace.
                </p>
              </div>
              <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-extrabold flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>{projectVerifications.length} Awaiting Verification</span>
              </span>
            </div>

            {projectVerifications.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">Project Verification Queue Empty</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All submitted client projects have been reviewed and processed. New project submissions will automatically appear here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectVerifications.map(p => (
                  <div key={p.id} className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wide">
                          Pending Review
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                          {p.category}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-semibold">Posted {p.postedDate}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{p.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-800 flex items-center space-x-1">
                          <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Client: {p.client} ({p.client_id})</span>
                        </span>
                        <span>•</span>
                        <span>Budget: <strong className="text-slate-900 font-bold">{p.budget}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong className="text-slate-900 font-bold">{p.duration}</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(Array.isArray(p.skills) ? p.skills : (typeof p.skills === 'string' ? p.skills.split(',') : [])).map((s, i) => (
                          <span key={i} className="text-xs px-2.5 py-0.5 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {typeof s === 'string' ? s.trim() : s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-start md:self-center border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      <button
                        onClick={() => setSelectedProjectDetail(p)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review Spec</span>
                      </button>
                      <button
                        onClick={() => handleApproveProject(p)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Project</span>
                      </button>
                      <button
                        onClick={() => setRejectingProject(p)}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    onClick={() => setViewingDocumentModal(null)}
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
                {viewingDocumentModal.docUrl ? (
                  viewingDocumentModal.docUrl.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(viewingDocumentModal.docName) ? (
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
                      Document record is stored securely in FreeMatch AI Security Vault. Use the Download button above to save or view locally.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                <div className="text-xs font-bold text-slate-500">
                  Inspect submitted document carefully before awarding verified badge.
                </div>
                <div className="flex items-center space-x-3">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ACTIVE CONTRACT DETAILS */}
        {selectedContractDetailModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 sm:p-8 rounded-3xl max-w-2xl w-full border bg-white border-slate-200 text-slate-900 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b pb-4 border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                      {selectedContractDetailModal.contract_id}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase">
                      {selectedContractDetailModal.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1.5">{selectedContractDetailModal.project_title}</h3>
                </div>
                <button
                  onClick={() => setSelectedContractDetailModal(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 font-bold text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Client Name & Email</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedContractDetailModal.client_name}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">{selectedContractDetailModal.client_email}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Freelancer Name & Email</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedContractDetailModal.freelancer_name}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">{selectedContractDetailModal.freelancer_email}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Contract Budget & Type</span>
                  <p className="font-extrabold text-blue-600 text-sm mt-0.5">{selectedContractDetailModal.agreed_amount}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">{selectedContractDetailModal.payment_type}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Escrow Balance & Status</span>
                  <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{selectedContractDetailModal.escrow_balance}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">Funds Held in Secure Escrow</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 uppercase text-[10px] tracking-wider font-extrabold">Overall Sprint Completion</span>
                  <span className="text-blue-600 font-extrabold">{selectedContractDetailModal.progress_pct || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(5, selectedContractDetailModal.progress_pct || 0)}%` }} />
                </div>
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

      </main>

    </div>
  );
};

export default AdminDashboard;
