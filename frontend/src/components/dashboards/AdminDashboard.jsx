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

  // Sample System Data
  const [verifications, setVerifications] = useState([
    { id: 'v1', name: 'Sarah Chen', role: 'Senior UI/UX Architect', skills: 'Figma, React, Tailwind', docs: 'Passport_TaxID.pdf', date: 'Oct 29, 2023', status: 'Pending Verification' },
    { id: 'v2', name: 'Lana Kim', role: 'Cybersecurity Specialist', skills: 'PenTesting, Python, OWASP', docs: 'SecurityCert_GovID.pdf', date: 'Aug 03, 2026', status: 'Pending Verification' }
  ]);

  const [users, setUsers] = useState([
    { id: 'u1', name: 'Alex Mercer', role: 'Freelancer', email: 'alex.m@system.net', status: 'Active', verified: true, joined: 'Aug 01, 2026' },
    { id: 'u2', name: 'TechStream Corp', role: 'Client', email: 'contact@techstream.io', status: 'Active', verified: true, joined: 'Aug 01, 2026' },
    { id: 'u3', name: 'Sarah Chen', role: 'Freelancer', email: 's.chen@cloudstack.io', status: 'Pending', verified: false, joined: 'Aug 04, 2026' },
    { id: 'u4', name: 'David Wright', role: 'Freelancer', email: 'dwright@uxmasters.com', status: 'Suspended', verified: false, joined: 'Jul 25, 2026' }
  ]);

  const [categories, setCategories] = useState([
    { id: 'c1', name: 'Software Engineering', activeSkills: 42, projects: 420 },
    { id: 'c2', name: 'UI/UX & Visual Design', activeSkills: 28, projects: 215 },
    { id: 'c3', name: 'Data Science & AI/ML', activeSkills: 35, projects: 140 },
    { id: 'c4', name: 'Cybersecurity & Auditing', activeSkills: 19, projects: 115 }
  ]);

  const [skills, setSkills] = useState([
    { id: 's1', name: 'React.js', category: 'Frontend', demand: 'High' },
    { id: 's2', name: 'Python Django', category: 'Backend', demand: 'High' },
    { id: 's3', name: 'PostgreSQL', category: 'Database', demand: 'Medium' },
    { id: 's4', name: 'PyTorch ML', category: 'AI/ML', demand: 'High' },
    { id: 's5', name: 'Figma Design', category: 'Design', demand: 'Medium' }
  ]);

  const [auditLogs] = useState([
    { id: 'log1', time: '10:42:15 AM', event: 'Identity Verified', details: 'Admin approved Alex Mercer tax verification', type: 'security' },
    { id: 'log2', time: '10:35:00 AM', event: 'Escrow Locked', details: '₹8,000 locked for AI Pipeline Optimization milestone', type: 'financial' },
    { id: 'log3', time: '09:12:44 AM', event: 'Account Suspended', details: 'User David Wright suspended due to terms violation', type: 'alert' }
  ]);

  // Real-time Notifications State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadLiveNotifs = async () => {
      const list = await fetchNotifications(userSession?.user_id || userSession?.name || 'admin');
      setNotifications(list);
    };
    loadLiveNotifs();

    const handleNotifEvent = () => loadLiveNotifs();
    window.addEventListener('freematch_notification_event', handleNotifEvent);
    return () => window.removeEventListener('freematch_notification_event', handleNotifEvent);
  }, [userSession]);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // Handlers
  const handleApproveVerification = (id) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    setToast({ message: 'Freelancer identity verified and trust badge awarded!', type: 'success' });
  };

  const handleRejectVerification = (id) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    setToast({ message: 'Verification application rejected.', type: 'warning' });
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, { id: `c_${Date.now()}`, name: newCategoryName.trim(), activeSkills: 0, projects: 0 }]);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills(prev => [...prev, { id: `s_${Date.now()}`, name: newSkillName.trim(), category: selectedCategory, demand: 'Medium' }]);
    setNewSkillName('');
    setShowAddSkillModal(false);
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
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
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
              <p className={`text-sm ${isDark ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700'}`}>
                Monitor user verification requests, ecosystem governance, and security audit logs.
              </p>
            </div>

            {/* 4 EXECUTIVE ADMIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border border-emerald-500/40 ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-xs'}`}>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">PLATFORM REVENUE (10% FEE)</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹14,250</p>
                <p className="text-xs text-slate-600 font-medium mt-1">From ₹1,42,500 Total Escrow Volume</p>
              </div>

              <div className={`p-5 rounded-2xl border border-rose-500/40 ${isDark ? 'bg-rose-950/20' : 'bg-rose-50/50 shadow-xs'}`}>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">IDENTITY VERIFICATION QUEUE</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">{verifications.length} Applications</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Pending Document & Tax Verification</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">340 Contracts Running</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Across 890 Total Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">SECURITY ALERTS</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">0 Critical Vulnerabilities</p>
                <p className="text-xs text-slate-600 font-medium mt-1">1 User Account Suspended</p>
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
                        <button onClick={() => handleApproveVerification(v.id)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer">
                          Approve & Award Badge
                        </button>
                        <button onClick={() => handleRejectVerification(v.id)} className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer">
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
                    {users.map(u => (
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
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                              u.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
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
            <div className="space-y-4">
              {verifications.map(v => (
                <div key={v.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{v.name}</h3>
                    <p className="text-xs text-slate-600">{v.role} • Submitted: {v.date}</p>
                    <p className="text-xs text-blue-600 font-bold mt-1">Document: {v.docs}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleApproveVerification(v.id)} className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer">
                      Approve Badge
                    </button>
                    <button onClick={() => handleRejectVerification(v.id)} className="px-4 py-2 bg-rose-50 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 cursor-pointer">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="py-3 text-slate-900">{u.name}</td>
                      <td className="py-3 text-slate-600">{u.role}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => toggleUserStatus(u.id)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs cursor-pointer">
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(c => (
                <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{c.activeSkills} Skills • {c.projects} Active Projects</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'financials' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Escrow & Revenue Ledger</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-600">TOTAL PLATFORM REVENUE</p>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">₹14,250</p>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <p className="text-xs font-bold text-blue-600">ACTIVE ESCROW HELD</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">₹1,42,500</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-xs font-bold text-purple-600">TOTAL TRANSACTIONS</p>
                <p className="text-3xl font-extrabold text-purple-700 mt-1">1,240</p>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Security & Audit Logs</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              {auditLogs.map(l => (
                <div key={l.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{l.event}</span>
                    <p className="text-slate-600 font-medium">{l.details}</p>
                  </div>
                  <span className="text-slate-600 font-bold">{l.time}</span>
                </div>
              ))}
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
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Kubernetes"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
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
