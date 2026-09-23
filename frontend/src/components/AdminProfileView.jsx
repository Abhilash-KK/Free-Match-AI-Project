import React, { useState, useEffect, useRef } from 'react';
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
  User,
  Camera,
  Upload,
  Trash2,
  Phone,
  Shield,
  FileText
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
  const fileInputRef = useRef(null);
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
      displayName: userSession?.name || userSession?.first_name || currentUserName || 'System Admin',
      email: userSession?.email || `${authUsername}@freematch.ai`,
      phone: userSession?.phone || '+1 (555) 019-2834',
      title: 'Chief Technology Officer & Lead Platform Evaluator',
      department: 'Platform Operations & System Governance',
      bio: 'Supervise platform user verification requests, system category & skill governance, escrow ledger auditing, and security audit logs.',
      securityLevel: 'Super Admin Level 5 (Root Access)',
      avatar_url: userSession?.avatar_url || localStorage.getItem('freematch_user_avatar') || '',
      joinedDate: 'Aug 01, 2026',
      status: 'Active & Verified'
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
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatar_url);

  // Profile Picture File Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      if (showToastMessage) showToastMessage('Please upload a valid PNG, JPG, or WEBP image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (showToastMessage) showToastMessage('Profile picture size must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      
      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: base64Data }));
      setEditAvatarUrl(base64Data);

      // Save to localStorage
      try {
        localStorage.setItem('freematch_user_avatar', base64Data);
        const cachedUser = JSON.parse(localStorage.getItem(`freematch_profile_${authUsername}`) || '{}');
        cachedUser.avatar_url = base64Data;
        localStorage.setItem(`freematch_profile_${authUsername}`, JSON.stringify(cachedUser));
      } catch (err) {}

      // Persist to backend database via user-avatar endpoint
      try {
        await fetch('http://localhost:8000/api/user-avatar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: authUsername, username: authUsername, avatar_url: base64Data })
        });
      } catch (err) {}

      // Broadcast avatar update event so top right header updates immediately
      window.dispatchEvent(new Event('freematch_user_avatar_event'));
      window.dispatchEvent(new Event('storage'));

      if (showToastMessage) showToastMessage('Admin profile picture updated successfully!', 'success');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setProfile(prev => ({ ...prev, avatar_url: '' }));
    setEditAvatarUrl('');
    try {
      localStorage.removeItem('freematch_user_avatar');
      await fetch('http://localhost:8000/api/user-avatar/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authUsername, username: authUsername })
      });
    } catch (e) {}

    window.dispatchEvent(new Event('freematch_user_avatar_event'));
    window.dispatchEvent(new Event('storage'));

    if (showToastMessage) showToastMessage('Profile picture removed.', 'info');
  };

  const handleSaveProfile = async (e) => {
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

    const updated = {
      ...profile,
      displayName: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      title: editTitle.trim(),
      department: editDepartment.trim() || profile.department,
      bio: editBio.trim() || profile.bio,
      avatar_url: editAvatarUrl.trim()
    };

    setProfile(updated);

    // Save to localStorage
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updated));
      if (editAvatarUrl) localStorage.setItem('freematch_user_avatar', editAvatarUrl);
    } catch (err) {}

    // Synchronize avatar event across UI
    window.dispatchEvent(new Event('freematch_user_avatar_event'));
    window.dispatchEvent(new Event('storage'));

    setShowEditModal(false);
    if (showToastMessage) showToastMessage('Admin profile credentials updated successfully!', 'success');
  };

  const initials = profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SA';

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-fadeIn font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* HEADER BANNER CARD */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-xs ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        {/* Cover Gradient */}
        <div className="h-48 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <div className="absolute top-5 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Root Super Admin Access</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-8 sm:px-10 pb-8 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 sm:-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar container with upload button overlay */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-blue-600 text-white font-black text-4xl flex items-center justify-center border-4 border-white dark:border-[#060e22] shadow-lg overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Camera Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="absolute bottom-1.5 right-1.5 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                title="Upload or Change Profile Picture"
              >
                <Camera className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Name & Role Badge */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.displayName}
                </h2>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Root Super Admin</span>
                </span>
              </div>
              <p className="text-sm font-extrabold text-blue-600">
                {profile.title}
              </p>
              <p className="text-xs font-semibold text-slate-500 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{profile.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-stretch sm:self-auto">
            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                title="Remove profile picture"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Photo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditName(profile.displayName);
                setEditEmail(profile.email);
                setEditPhone(profile.phone);
                setEditTitle(profile.title);
                setEditDepartment(profile.department);
                setEditBio(profile.bio);
                setEditAvatarUrl(profile.avatar_url);
                setShowEditModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD 1: OFFICIAL ADMIN ACCOUNT CREDENTIALS */}
        <div className={`p-8 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Admin Account Credentials</h3>
              <p className="text-xs text-slate-500 font-semibold">Verified account details from FreeMatch AI database.</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Full Name:</span>
              </span>
              <span className="font-black text-slate-900 dark:text-white text-sm">{profile.displayName}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Username:</span>
              </span>
              <span className="font-black text-slate-900 dark:text-white text-sm">{authUsername}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Work Email:</span>
              </span>
              <span className="font-extrabold text-blue-600 text-sm">{profile.email}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Phone Contact:</span>
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{profile.phone}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Security Clearance:</span>
              </span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
                {profile.securityLevel}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Department:</span>
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{profile.department}</span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Account Created:</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">{profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: OPERATIONAL RESPONSIBILITIES & GOVERNANCE */}
        <div className={`p-8 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Admin Responsibilities & Governance</h3>
              <p className="text-xs text-slate-500 font-semibold">Operational role privileges and platform duties.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                OPERATIONAL SUMMARY / BIO
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80">
                {profile.bio}
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-bold pt-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                ACTIVE ADMIN PRIVILEGES
              </span>
              {[
                { title: 'User Account Moderation & Suspension', desc: 'Full authority to activate, suspend, or audit platform users.' },
                { title: 'Freelancer Identity & Tax KYC Verification', desc: 'Review, approve, or reject identity verification documents.' },
                { title: 'Project Verification & Publication', desc: 'Review and verify client project postings before publication.' },
                { title: 'Escrow Ledger & Fee Audit Monitoring', desc: 'Inspect platform escrow balances and fee ledgers.' },
                { title: 'Skill & Category Governance', desc: 'Manage system skills, categories, and marketplace tags.' }
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-extrabold">{p.title}</p>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT ADMIN PROFILE */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Edit Admin Profile</h3>
                <p className="text-xs text-slate-500 font-semibold">Update your official admin credentials and information.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Avatar Image URL (or use camera upload button)
                </label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/admin_avatar.jpg or base64 stream"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
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
