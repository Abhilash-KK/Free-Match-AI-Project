import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  Bell,
  SlidersHorizontal,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { validateName, validateEmail, validateTitle } from '../utils/validationUtils';

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

  // Profile State
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
      avatar_url: userSession?.avatar_url || ''
    };
  });

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(settingsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}

    return {
      twoFactorEnabled: true,
      sessionTimeoutMinutes: '30',
      autoFlagVerifications: true,
      maintenanceMode: false,
      auditRetentionDays: '90',
      emailSecurityAlerts: true,
      emailVerificationAlerts: true,
      emailFinancialAlerts: true
    };
  });

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

  // Form Fields
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [titleInput, setTitleInput] = useState(profile.title);
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile.avatar_url);

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Save Credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();

    const vName = validateName(displayNameInput, 'Admin Name');
    if (!vName.valid) {
      if (showToastMessage) showToastMessage(vName.error, 'error');
      return;
    }

    const vEmail = validateEmail(emailInput);
    if (!vEmail.valid) {
      if (showToastMessage) showToastMessage(vEmail.error, 'error');
      return;
    }

    const vTitle = validateTitle(titleInput, 'Admin Title');
    if (!vTitle.valid) {
      if (showToastMessage) showToastMessage(vTitle.error, 'error');
      return;
    }

    setProfile(prev => ({
      ...prev,
      displayName: displayNameInput.trim(),
      email: emailInput.trim(),
      title: titleInput.trim(),
      avatar_url: avatarUrlInput.trim()
    }));

    if (showToastMessage) showToastMessage('Admin account credentials updated successfully!', 'success');
  };

  // Save Password
  const handleSavePassword = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      if (showToastMessage) showToastMessage('Please enter your current admin password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      if (showToastMessage) showToastMessage('New admin password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (showToastMessage) showToastMessage('New passwords do not match.', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    if (showToastMessage) showToastMessage('Admin security password updated successfully!', 'success');
  };

  // Save System Governance Settings
  const handleToggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    if (showToastMessage) showToastMessage('Admin system governance setting updated!', 'info');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER TITLE */}
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Admin System Settings
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1">
          Manage system security controls, admin account credentials, and platform governance parameters.
        </p>
      </div>

      {/* TWO COLUMN SETTINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: ADMIN ACCOUNT CREDENTIALS */}
        <div className={`p-6 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Admin Credentials</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Update account identity and contact information.</p>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Full Name
              </label>
              <input
                type="text"
                required
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                System Role Title
              </label>
              <input
                type="text"
                required
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Credentials</span>
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: SECURITY & PASSWORD CHANGE */}
        <div className={`p-6 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Security & Password Controls</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Update admin authentication password and 2FA.</p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                New Security Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* CARD 3: SYSTEM GOVERNANCE & MAINTENANCE CONTROLS */}
        <div className={`p-6 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Platform Governance Controls</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">System flags and operational modes.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold">
            {/* Toggle 1: 2FA */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Two-Factor Authentication (2FA)</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">Require TOTP authenticator token for admin sign-in.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('twoFactorEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Toggle 2: Auto-Flag Verifications */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Auto-Flag Document Anomalies</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">NLP verification scan flags suspicious PDF credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('autoFlagVerifications')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.autoFlagVerifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoFlagVerifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Toggle 3: Maintenance Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Platform Maintenance Mode</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">Restrict user project creation during database upgrades.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('maintenanceMode')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: SYSTEM NOTIFICATIONS & ALERTS */}
        <div className={`p-6 rounded-3xl border space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Admin System Alerts</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Real-time alert notifications and trigger limits.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Security Audit Event Alerts</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">Receive instant notifications on failed admin logins.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('emailSecurityAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.emailSecurityAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailSecurityAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Verification Queue Notifications</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">Notify when new freelancer KYC submissions arrive.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('emailVerificationAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.emailVerificationAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailVerificationAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-white font-extrabold">Escrow Ledger Volume Thresholds</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">Alert when milestone escrow release exceeds ₹1,00,000.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('emailFinancialAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  settings.emailFinancialAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailFinancialAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettingsView;
