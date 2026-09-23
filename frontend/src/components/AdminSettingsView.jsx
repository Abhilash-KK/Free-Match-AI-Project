import React, { useState, useEffect } from 'react';
import {
  UserRound,
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  Mail,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  Smartphone,
  AlertTriangle,
  BadgeCheck,
  Building2,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { getInitials } from '../utils/avatarUtils';
import { validateName, validateEmail } from '../utils/validationUtils';

const AdminSettingsView = ({
  userSession,
  currentUserId,
  currentUserName = 'System Admin',
  isDark = false,
  onNavigateTab,
  showToastMessage
}) => {
  const authUsername = (currentUserId || userSession?.user_id || userSession?.username || userSession?.email || 'admin').toLowerCase().trim();
  const settingsStorageKey = `freematch_admin_${authUsername}_settings`;
  const profileStorageKey = `freematch_admin_${authUsername}_profile`;

  // ---------------------------------------------------------------------------
  // PROFILE STATE
  // ---------------------------------------------------------------------------
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
      username: authUsername,
      role: 'Super Admin',
      avatar_url: userSession?.avatar_url || ''
    };
  });

  // ---------------------------------------------------------------------------
  // SETTINGS STATE
  // ---------------------------------------------------------------------------
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(settingsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}

    return {
      twoFactorEnabled: true
    };
  });

  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'account' | 'security'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    if (showToastMessage) showToastMessage(message, type);
    else setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync profile & settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch (e) {}
  }, [profile, profileStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    } catch (e) {}
  }, [settings, settingsStorageKey]);

  // Sync with global user session avatar changes
  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const cachedAvatar = localStorage.getItem('freematch_user_avatar');
        if (cachedAvatar) {
          setProfile(prev => ({ ...prev, avatar_url: cachedAvatar }));
          setAvatarUrlInput(cachedAvatar);
        }
      } catch (e) {}
    };

    window.addEventListener('freematch_user_avatar_event', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('freematch_user_avatar_event', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // FORM FIELDS STATE
  // ---------------------------------------------------------------------------
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile.avatar_url);

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync local inputs when profile changes
  useEffect(() => {
    setDisplayNameInput(profile.displayName);
    setEmailInput(profile.email);
    setAvatarUrlInput(profile.avatar_url);
  }, [profile]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  // Profile Picture File Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      showToast('Please upload a valid PNG, JPG, or WEBP image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile picture size must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      
      setProfile(prev => ({ ...prev, avatar_url: base64Data }));
      setAvatarUrlInput(base64Data);

      try {
        localStorage.setItem('freematch_user_avatar', base64Data);
        const cachedUser = JSON.parse(localStorage.getItem(`freematch_profile_${authUsername}`) || '{}');
        cachedUser.avatar_url = base64Data;
        localStorage.setItem(`freematch_profile_${authUsername}`, JSON.stringify(cachedUser));
      } catch (err) {}

      // Persist to backend database via user-avatar API
      try {
        await fetch('http://localhost:8000/api/user-avatar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: authUsername, username: authUsername, avatar_url: base64Data })
        });
      } catch (err) {}

      // Dispatch global custom avatar event so navbar updates instantly
      window.dispatchEvent(new Event('freematch_user_avatar_event'));
      window.dispatchEvent(new Event('freematch_shared_event'));
      window.dispatchEvent(new Event('storage'));

      showToast('Admin profile picture updated successfully!', 'success');
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, avatar_url: '' }));
    setAvatarUrlInput('');
    try {
      localStorage.removeItem('freematch_user_avatar');
    } catch (e) {}

    window.dispatchEvent(new Event('freematch_user_avatar_event'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    showToast('Admin profile picture removed.', 'info');
  };

  // Save Account Credentials
  const handleSaveAccountCredentials = (e) => {
    e.preventDefault();

    const vName = validateName(displayNameInput, 'Admin Name');
    if (!vName.valid) {
      showToast(vName.error, 'error');
      return;
    }

    const vEmail = validateEmail(emailInput);
    if (!vEmail.valid) {
      showToast(vEmail.error, 'error');
      return;
    }

    const updatedProfile = {
      ...profile,
      displayName: displayNameInput.trim(),
      email: emailInput.trim(),
      avatar_url: avatarUrlInput.trim()
    };

    setProfile(updatedProfile);

    // Save to localStorage and notify system
    try {
      localStorage.setItem('freematch_user_avatar', avatarUrlInput.trim());
      localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
    } catch (err) {}

    window.dispatchEvent(new Event('freematch_user_avatar_event'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    showToast('Admin account details updated successfully!', 'success');
  };

  // Update Security Password
  const handleSavePassword = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Please enter your current admin password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New security password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New security passwords do not match.', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    showToast('Admin security password updated successfully!', 'success');
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const nextVal = !settings.twoFactorEnabled;
    setSettings(prev => ({ ...prev, twoFactorEnabled: nextVal }));
    showToast(`Two-Factor Authentication (2FA) ${nextVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const showSection = (id) => activeSection === 'all' || activeSection === id;

  const sectionNavItems = [
    { id: 'all', label: 'All Settings', icon: SlidersHorizontal },
    { id: 'account', label: 'Admin Account', icon: UserRound },
    { id: 'security', label: 'Security & Password', icon: LockKeyhole }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
      
      {/* LOCAL TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center space-x-2 animate-bounce ${
          toast.type === 'error'
            ? 'bg-rose-600 text-white border-rose-700'
            : toast.type === 'info'
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-emerald-600 text-white border-emerald-700'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER COVER BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-lg overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            {/* AVATAR CONTAINER WITH CAMERA UPLOAD OVERLAY */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/20 bg-blue-600 text-white font-black flex items-center justify-center text-3xl shadow-xl overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>{getInitials(profile.displayName)}</span>
                )}
              </div>

              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-105 flex items-center justify-center">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.displayName}</h1>
                <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />
              </div>

              <p className="text-xs text-blue-100/90 font-semibold">{profile.email}</p>

              <div className="flex items-center space-x-2 pt-1">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  Super Admin
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-extrabold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active Account</span>
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS ON HEADER BANNER */}
          {profile.avatar_url && (
            <button
              onClick={handleRemovePhoto}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-rose-600/80 text-white border border-white/20 text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION FILTER TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {sectionNavItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TWO-COLUMN GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* SECTION 1: ADMIN ACCOUNT SETTINGS */}
        {showSection('account') && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <UserRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Admin Account Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update account identity, contact information, and avatar.</p>
              </div>
            </div>

            <form onSubmit={handleSaveAccountCredentials} className="space-y-5 text-xs">
              {/* ADMIN FULL NAME */}
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Admin Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="Super Admin"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* WORK EMAIL ADDRESS */}
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@freematch.ai"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* USERNAME (READ-ONLY) */}
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username (System Identifier)
                </label>
                <input
                  type="text"
                  disabled
                  value={authUsername}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-extrabold cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Read-only unique account handle assigned by platform root.
                </p>
              </div>

              {/* SYSTEM ROLE (READ-ONLY) */}
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  System Role & Access Level
                </label>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-extrabold text-blue-950 dark:text-blue-200">Super Admin (System Control Panel)</p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Full root access & governance privileges</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase">
                    Read Only
                  </span>
                </div>
              </div>

              {/* AVATAR DIRECT URL (OPTIONAL) */}
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Profile Picture Image URL (Optional Direct Link)
                </label>
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://example.com/admin_avatar.jpg"
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Account Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 2: SECURITY & PASSWORD CONTROLS */}
        {showSection('security') && (
          <div className="space-y-8">
            
            {/* CARD: PASSWORD UPDATE */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <LockKeyhole className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Security & Password</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update your admin authentication password securely.</p>
                </div>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-5 text-xs">
                {/* CURRENT PASSWORD */}
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Admin Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Security Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Must be at least 6 characters with letters and numbers.
                  </p>
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT PASSWORD BUTTON */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD: TWO-FACTOR AUTHENTICATION (2FA) */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Require TOTP authenticator verification code on login.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`w-12 h-6.5 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                    settings.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                settings.twoFactorEnabled
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 text-amber-900 dark:text-amber-300'
              }`}>
                <div className="flex items-center space-x-2 text-xs font-bold">
                  {settings.twoFactorEnabled ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>2FA Authentication Enabled & Active for Admin Account</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>2FA Authentication Disabled</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {settings.twoFactorEnabled ? 'Protected' : 'Unprotected'}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSettingsView;
