import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Calendar,
  Building2,
  Lock,
  Pencil,
  CheckCircle2,
  X,
  AlertTriangle,
  Award,
  KeyRound,
  FileText,
  Activity,
  User,
  Check
} from 'lucide-react';
import { validateName, validateEmail, validateTitle } from '../utils/validationUtils';

const AdminProfileView = ({
  userSession,
  currentUserId,
  currentUserName = 'System Admin',
  isDark = false,
  onNavigateTab,
  showToastMessage
}) => {
  const authUsername = (currentUserId || userSession?.user_id || userSession?.username || userSession?.email || 'admin').toLowerCase().trim();
  const profileStorageKey = `freematch_admin_${authUsername}_profile`;

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}

    return {
      displayName: userSession?.name || currentUserName || 'System Admin',
      email: userSession?.email || `${authUsername}@freematch.ai`,
      title: 'Chief Technology Officer & Lead Platform Evaluator',
      department: 'Platform Operations & System Governance',
      securityLevel: 'Super Admin Level 5 (Root Access)',
      avatar_url: userSession?.avatar_url || '',
      joinedDate: 'Aug 01, 2026',
      lastActive: 'Active Now'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch (e) {}
  }, [profile, profileStorageKey]);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profile.displayName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatar_url);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const vName = validateName(editName, 'Admin Name');
    if (!vName.valid) {
      if (showToastMessage) showToastMessage(vName.error, 'error');
      return;
    }

    const vEmail = validateEmail(editEmail);
    if (!vEmail.valid) {
      if (showToastMessage) showToastMessage(vEmail.error, 'error');
      return;
    }

    const vTitle = validateTitle(editTitle, 'Admin Title');
    if (!vTitle.valid) {
      if (showToastMessage) showToastMessage(vTitle.error, 'error');
      return;
    }

    setProfile(prev => ({
      ...prev,
      displayName: editName.trim(),
      email: editEmail.trim(),
      title: editTitle.trim(),
      department: editDepartment.trim() || prev.department,
      avatar_url: editAvatarUrl.trim()
    }));

    setShowEditModal(false);
    if (showToastMessage) showToastMessage('Admin profile credentials updated successfully!', 'success');
  };

  const initials = profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SA';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER BANNER CARD */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-sm ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        {/* Cover Gradient */}
        <div className="h-36 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Root Super Admin Access</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 lg:px-8 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-white dark:border-[#060e22] shadow-md overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name & Role Badge */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.displayName}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>SUPER ADMIN</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {profile.title}
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {profile.department}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(profile.displayName);
              setEditEmail(profile.email);
              setEditTitle(profile.title);
              setEditDepartment(profile.department);
              setEditAvatarUrl(profile.avatar_url);
              setShowEditModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">MODERATION ACTIONS</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">1,420</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">100% Policy Enforced</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">IDENTITY VERIFICATIONS</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">348 Approved</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">Verified KYC & Tax Badges</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">PLATFORM ESCROW VOLUME</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹6,42,500</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">Audit Ledger Protected</p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">SYSTEM UPTIME</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">99.98%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Zero Security Breaches</p>
        </div>
      </div>

      {/* TWO COLUMN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: ACCOUNT CREDENTIALS & SECURITY INFO */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Admin Account Details</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Official credentials and security level.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-600 dark:text-slate-300">Admin Username:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{authUsername}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-600 dark:text-slate-300">Work Email:</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{profile.email}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-600 dark:text-slate-300">Security Clearance:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">{profile.securityLevel}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-600 dark:text-slate-300">System Role:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">SUPER ADMIN / SYSTEM EVALUATOR</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-600 dark:text-slate-300">Account Created:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: ADMIN PERMISSIONS & ACCESS CONTROL */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Admin Privileges & Governance</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Active role-based access rights.</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-bold">
            {[
              { title: 'User Account Moderation & Suspension', desc: 'Full authority to activate or suspend accounts.', active: true },
              { title: 'Freelancer Identity & Tax KYC Verification', desc: 'Approve or reject verification documents.', active: true },
              { title: 'Escrow Ledger & Fee Audit Monitoring', desc: 'Access 10% platform fee and milestone ledgers.', active: true },
              { title: 'Skill & Category Governance', desc: 'Manage system skills, categories, and tags.', active: true },
              { title: 'Security Log Inspection & Alerts', desc: 'Inspect real-time authentication audit logs.', active: true }
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-900 dark:text-white font-extrabold">{p.title}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: EDIT ADMIN PROFILE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Edit Admin Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Update your official admin credentials.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/admin_avatar.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileView;
