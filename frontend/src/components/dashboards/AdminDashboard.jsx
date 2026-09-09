import React, { useState, useEffect, useRef } from 'react';
import Toast from '../Toast';
import NotificationCenter from '../NotificationCenter';
import AdminProfileView from '../AdminProfileView';
import AdminSettingsView from '../AdminSettingsView';
import { fetchNotifications } from '../../utils/notificationService';
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
  Shield
} from 'lucide-react';

const AdminDashboard = ({ userSession, onSignOut }) => {
  const isDark = false;
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'users' | 'governance' | 'financials' | 'audit' | 'settings' | 'notifications' | 'profile'
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
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin-dashboard/');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.verifications)) setVerifications(data.verifications);
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
    return () => {
      window.removeEventListener('freematch_shared_event', handleSync);
      window.removeEventListener('freematch_notification_event', handleSync);
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

  // Handlers
  const handleApproveVerification = async (vObj) => {
    const userId = typeof vObj === 'object' ? (vObj.user_id || vObj.id) : vObj;
    try {
      const res = await fetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'approve' })
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => (v.user_id || v.id) !== userId && v.id !== userId));
        setToast({ message: 'Freelancer identity verified and trust badge awarded!', type: 'success' });
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
      } else {
        setToast({ message: 'Failed to approve verification application.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error approving verification.', type: 'error' });
    }
  };

  const handleRejectVerification = async (vObj) => {
    const userId = typeof vObj === 'object' ? (vObj.user_id || vObj.id) : vObj;
    try {
      const res = await fetch('/api/admin-dashboard/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'reject' })
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => (v.user_id || v.id) !== userId && v.id !== userId));
        setToast({ message: 'Verification application rejected.', type: 'warning' });
        fetchAdminData();
        window.dispatchEvent(new Event('freematch_shared_event'));
      } else {
        setToast({ message: 'Failed to reject verification application.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error rejecting verification.', type: 'error' });
    }
  };

  const toggleUserStatus = async (userObj) => {
    const userId = typeof userObj === 'object' ? (userObj.user_id || userObj.id) : userObj;
    try {
      const res = await fetch('/api/admin-dashboard/toggle-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
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
      const res = await fetch('/api/admin-dashboard/category/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategories(prev => [...prev.filter(c => c.name !== data.category.name), data.category]);
        }
        setToast({ message: 'Skill category registered successfully!', type: 'success' });
        setNewCategoryName('');
        setShowAddCategoryModal(false);
        fetchAdminData();
      } else {
        setToast({ message: 'Failed to add category.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error creating category.', type: 'error' });
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const res = await fetch('/api/admin-dashboard/skill/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim(), category: selectedCategory })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.skill) {
          setSkills(prev => [...prev.filter(s => s.name !== data.skill.name), data.skill]);
        }
        setToast({ message: 'Skill tag registered successfully!', type: 'success' });
        setNewSkillName('');
        setShowAddSkillModal(false);
        fetchAdminData();
      } else {
        setToast({ message: 'Failed to add skill tag.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error creating skill tag.', type: 'error' });
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
              { id: 'verifications', label: 'Identity Verifications', icon: ShieldCheck, badge: verifications.length },
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

            {/* Quick Admin Actions */}
            <button 
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Category</span>
            </button>
            <button 
              onClick={() => setShowAddSkillModal(true)}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Skill Tag</span>
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
              <div className={`p-5 rounded-2xl border border-emerald-500/40 ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-xs'}`}>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">PLATFORM REVENUE (10% FEE)</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.platform_revenue}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">From {metrics.total_escrow_volume} Total Escrow Volume</p>
              </div>

              <div className={`p-5 rounded-2xl border border-rose-500/40 ${isDark ? 'bg-rose-950/20' : 'bg-rose-50/50 shadow-xs'}`}>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">IDENTITY VERIFICATION QUEUE</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">{verifications.length} Application{verifications.length === 1 ? '' : 's'}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Pending Document & Tax Verification</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.active_contracts_count} Contract{metrics.active_contracts_count === 1 ? '' : 's'} Running</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Across {metrics.total_projects_count} Total Project{metrics.total_projects_count === 1 ? '' : 's'}</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">SECURITY ALERTS</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.critical_vulnerabilities} Critical Vulnerabilities</p>
                <p className="text-xs text-slate-600 font-medium mt-1">{metrics.suspended_accounts_count} User Account{metrics.suspended_accounts_count === 1 ? '' : 's'} Suspended</p>
              </div>
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
                    <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                          <span className="text-xs text-blue-600 font-bold">({v.role})</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">Skills: {v.skills}</p>
                        <p className="text-xs text-slate-600 font-medium">Docs Attached: <span className="font-bold text-slate-800">{v.docs}</span> • Submitted: {v.date}</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button onClick={() => handleApproveVerification(v)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer">
                          Approve & Award Badge
                        </button>
                        <button onClick={() => handleRejectVerification(v)} className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer">
                          Reject
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
                  <div key={v.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{v.name}</h3>
                      <p className="text-xs text-slate-600">{v.role} • Submitted: {v.date}</p>
                      <p className="text-xs text-blue-600 font-bold mt-1">Document: {v.docs}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleApproveVerification(v)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer">
                        Approve Badge
                      </button>
                      <button onClick={() => handleRejectVerification(v)} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer">
                        Reject
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
              <h2 className="text-2xl font-bold tracking-tight">Skill & Category Governance</h2>
              <button onClick={() => setShowAddCategoryModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                + Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm">
                No skill categories configured yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{c.activeSkills} Skills • {c.projects} Active Projects</p>
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

        {/* MODAL: ADD SKILL */}
        {showAddSkillModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl max-w-md w-full border bg-white border-slate-200 text-slate-900 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Add New Skill Tag</h3>
              <form onSubmit={handleAddSkill} className="space-y-4">
                {categories.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skill Tag Name</label>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Next.js, Kubernetes"
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddSkillModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer">Add Skill Tag</button>
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

      </main>

    </div>
  );
};

export default AdminDashboard;
