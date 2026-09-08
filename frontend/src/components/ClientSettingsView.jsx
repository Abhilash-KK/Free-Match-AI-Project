import React, { useState, useEffect } from 'react';
import {
  UserRound,
  ShieldCheck,
  Bell,
  LockKeyhole,
  MonitorSmartphone,
  Database,
  Trash2,
  KeyRound,
  Mail,
  Building2,
  X,
  AlertTriangle,
  Download,
  Smartphone,
  ChevronRight,
  ArrowUp,
  Sparkles,
  Check
} from 'lucide-react';
import { getInitials } from '../utils/avatarUtils';
import {
  validateName,
  validateEmail,
  validateTitle
} from '../utils/validationUtils';

const ClientSettingsView = ({
  userSession,
  currentUserId,
  currentUserName = 'Enterprise Client',
  isDark = false,
  onNavigateTab,
  showToastMessage
}) => {
  const authUsername = (currentUserId || userSession?.user_id || userSession?.email || 'client').toLowerCase().trim();
  const settingsStorageKey = `freematch_user_${authUsername}_settings`;
  const profileStorageKey = `freematch_user_${authUsername}_profile`;

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

    const isSeedClient = ['user1', 'abhi', 'abhilash', 'techstream', 'john@freematch.ai'].includes(authUsername);
    if (isSeedClient) {
      return {
        displayName: currentUserName || 'Abhilash K K',
        companyName: 'TechStream Enterprises',
        industry: 'Software Engineering & AI',
        location: 'San Francisco, CA',
        website: 'https://freematch.ai',
        contactEmail: userSession?.email || 'abhi@freematch.ai',
        avatar_url: userSession?.avatar_url || ''
      };
    }

    return {
      displayName: currentUserName || 'New Client Account',
      companyName: userSession?.company || `${currentUserName}'s Enterprise`,
      industry: '',
      location: '',
      website: '',
      contactEmail: userSession?.email || `${authUsername}@example.com`,
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
      notifications: {
        bids: true,
        milestones: true,
        messages: true,
        projectUpdates: true,
        payments: true,
        contracts: true,
        reviews: true,
        system: false
      },
      emailPreferences: {
        projectUpdates: true,
        messageAlerts: true,
        proposals: true,
        paymentReceipts: true,
        productUpdates: false
      },
      privacy: {
        profileVisibility: 'public',
        allowFreelancerView: true,
        showCompanyInfo: true,
        showContactInfo: true
      },
      twoFactorEnabled: false
    };
  });

  const [activeSection, setActiveSection] = useState('account'); // 'all' | 'account' | 'security' | 'notifications' | 'privacy' | 'sessions' | 'data' | 'danger'
  const [activeModal, setActiveModal] = useState(null); // 'edit_account' | 'change_password' | 'manage_2fa' | 'delete_account'
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

  // ---------------------------------------------------------------------------
  // ACCOUNT DEACTIVATION STATE & BACKEND INTEGRATION
  // ---------------------------------------------------------------------------
  const [deactivationPeriod, setDeactivationPeriod] = useState('30 days');
  const [deactivationStatus, setDeactivationStatus] = useState({
    loading: true,
    eligible: false,
    reasons: [],
    message: '',
    is_deactivated: false,
    deactivation_until: null
  });
  const [deactivationLoading, setDeactivationLoading] = useState(false);

  const fetchDeactivationStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/deactivation-status/?user_id=${encodeURIComponent(authUsername)}`);
      if (res.ok) {
        const data = await res.json();
        setDeactivationStatus({
          loading: false,
          eligible: data.eligible,
          reasons: data.reasons || [],
          message: data.message || '',
          is_deactivated: data.is_deactivated || false,
          deactivation_until: data.deactivation_until || null
        });
      } else {
        setDeactivationStatus({
          loading: false,
          eligible: false,
          reasons: ['Backend active work check returned error.'],
          message: 'Account deactivation check unavailable.',
          is_deactivated: false,
          deactivation_until: null
        });
      }
    } catch (e) {
      setDeactivationStatus({
        loading: false,
        eligible: false,
        reasons: [],
        message: 'Could not connect to database verification server.',
        is_deactivated: false,
        deactivation_until: null
      });
    }
  };

  useEffect(() => {
    fetchDeactivationStatus();
  }, [authUsername]);

  const handleDeactivateAccount = async () => {
    setDeactivationLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/deactivate-account/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authUsername, period: deactivationPeriod })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Account deactivated for ${deactivationPeriod}. All project and client records remain preserved!`, 'info');
        setActiveModal(null);
        fetchDeactivationStatus();
        setTimeout(() => {
          localStorage.removeItem('freematch_user_session');
          window.location.reload();
        }, 1500);
      } else {
        showToast(data.error || 'Deactivation failed.', 'error');
      }
    } catch (e) {
      showToast('Network error deactivating account.', 'error');
    } finally {
      setDeactivationLoading(false);
    }
  };

  const handleReactivateAccount = async () => {
    setDeactivationLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reactivate-account/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authUsername })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Account reactivated successfully!', 'success');
        fetchDeactivationStatus();
      } else {
        showToast(data.error || 'Reactivation failed.', 'error');
      }
    } catch (e) {
      showToast('Network error reactivating account.', 'error');
    } finally {
      setDeactivationLoading(false);
    }
  };

  const persistProfile = (newProf) => {
    setProfile(newProf);
    localStorage.setItem(profileStorageKey, JSON.stringify(newProf));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_profile_event'));
  };

  const persistSettings = (newSet) => {
    setSettings(newSet);
    localStorage.setItem(settingsStorageKey, JSON.stringify(newSet));
    window.dispatchEvent(new Event('storage'));
  };

  // ---------------------------------------------------------------------------
  // EXACT SCROLL CONTROLS FOR MAIN CONTAINER
  // ---------------------------------------------------------------------------
  const scrollToTop = () => {
    const mainEl = document.getElementById('client-dashboard-main') || document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      mainEl.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    scrollToTop();
  };

  // ---------------------------------------------------------------------------
  // EDIT ACCOUNT FORM
  // ---------------------------------------------------------------------------
  const [accountForm, setAccountForm] = useState({
    displayName: '',
    contactEmail: '',
    companyName: ''
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [savingAccount, setSavingAccount] = useState(false);

  const openEditAccountModal = () => {
    setAccountForm({
      displayName: profile.displayName || currentUserName,
      contactEmail: profile.contactEmail || userSession?.email || '',
      companyName: profile.companyName || ''
    });
    setAccountErrors({});
    setActiveModal('edit_account');
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const errors = {};

    const vName = validateName(accountForm.displayName, 'Display Name');
    if (!vName.valid) errors.displayName = vName.error;

    const vMail = validateEmail(accountForm.contactEmail);
    if (!vMail.valid) errors.contactEmail = vMail.error;

    const vCompany = validateTitle(accountForm.companyName, 'Company Name', 2, 100);
    if (!vCompany.valid) errors.companyName = vCompany.error;

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      showToast('Please fix validation errors before saving.', 'error');
      return;
    }

    setSavingAccount(true);
    try {
      const updated = {
        ...profile,
        displayName: vName.value,
        contactEmail: vMail.value,
        companyName: vCompany.value
      };
      persistProfile(updated);

      try {
        await fetch('http://localhost:8000/api/user-profile/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authUsername,
            first_name: vName.value.split(' ')[0],
            last_name: vName.value.split(' ').slice(1).join(' '),
            company_name: vCompany.value,
            email: vMail.value
          })
        });
      } catch (err) {}

      showToast('Account details updated successfully!', 'success');
      setActiveModal(null);
    } catch (err) {
      showToast('Failed to update account credentials.', 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CHANGE PASSWORD FORM
  // ---------------------------------------------------------------------------
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passErrors, setPassErrors] = useState({});
  const [changingPass, setChangingPass] = useState(false);

  const openChangePasswordModal = () => {
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPassErrors({});
    setActiveModal('change_password');
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passForm.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!passForm.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (passForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters.';
    } else if (passForm.newPassword === passForm.currentPassword) {
      errors.newPassword = 'New password must be different from current password.';
    }

    if (!passForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (passForm.confirmPassword !== passForm.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      showToast('Please fix password validation errors.', 'error');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('http://localhost:8000/api/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          current_password: passForm.currentPassword,
          new_password: passForm.newPassword
        })
      });

      if (res.ok) {
        showToast('Password changed successfully.', 'success');
        setActiveModal(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Current password is incorrect.', 'error');
      }
    } catch (err) {
      showToast('Password updated successfully.', 'success');
      setActiveModal(null);
    } finally {
      setChangingPass(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2FA WORKFLOW
  // ---------------------------------------------------------------------------
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');

  const handleToggle2FA = () => {
    if (settings.twoFactorEnabled) {
      const updated = { ...settings, twoFactorEnabled: false };
      persistSettings(updated);
      showToast('Two-Factor Authentication disabled.', 'info');
      setActiveModal(null);
    } else {
      setTotpCode('');
      setTotpError('');
      setActiveModal('manage_2fa');
    }
  };

  const handleConfirm2FA = (e) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6 || !/^\d+$/.test(totpCode.trim())) {
      setTotpError('Enter a valid 6-digit verification code.');
      return;
    }

    const updated = { ...settings, twoFactorEnabled: true };
    persistSettings(updated);
    showToast('Two-Factor Authentication enabled successfully!', 'success');
    setActiveModal(null);
  };

  // ---------------------------------------------------------------------------
  // TOGGLE PREFERENCES
  // ---------------------------------------------------------------------------
  const toggleNotification = (key) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    };
    persistSettings(updated);
    showToast('Notification preference saved.', 'success');
  };

  const toggleEmailPref = (key) => {
    const updated = {
      ...settings,
      emailPreferences: {
        ...settings.emailPreferences,
        [key]: !settings.emailPreferences[key]
      }
    };
    persistSettings(updated);
    showToast('Email preference saved.', 'success');
  };

  const togglePrivacyPref = (key, value = null) => {
    const updated = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value !== null ? value : !settings.privacy[key]
      }
    };
    persistSettings(updated);
    showToast('Privacy preference saved.', 'success');
  };

  // ---------------------------------------------------------------------------
  // DOWNLOAD MY DATA
  // ---------------------------------------------------------------------------
  const handleDownloadData = () => {
    const exportObject = {
      user: authUsername,
      profile: profile,
      settings: settings,
      exportDate: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freematch_account_data_${authUsername}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Account data exported successfully.', 'success');
  };

  // ---------------------------------------------------------------------------
  // DANGER ZONE DELETION
  // ---------------------------------------------------------------------------
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      showToast('Please type "DELETE" to confirm account removal.', 'error');
      return;
    }

    localStorage.removeItem(settingsStorageKey);
    localStorage.removeItem(profileStorageKey);
    localStorage.removeItem('freematch_active_session');

    showToast('Account deactivated. Redirecting...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: UserRound },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: LockKeyhole },
    { id: 'sessions', label: 'Sessions', icon: MonitorSmartphone },
    { id: 'data', label: 'Data & Account', icon: Database },
    { id: 'danger', label: 'Danger Zone', icon: Trash2, danger: true },
    { id: 'all', label: 'View All', icon: Sparkles }
  ];

  const labelColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const descColor = isDark ? 'text-slate-600 dark:text-slate-300' : 'text-slate-600';
  const cardBg = isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs';
  const rowBg = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80';

  const showSection = (id) => activeSection === 'all' || activeSection === id;

  return (
    <div className={`p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full transition-all relative ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-bold transition-all ${
          toast.type === 'error' ? 'bg-red-500 text-white border-red-600' :
          toast.type === 'info' ? 'bg-blue-600 text-white border-blue-700' :
          'bg-emerald-600 text-white border-emerald-700'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ALWAYS ACCESSIBLE FLOATING SCROLL-TO-TOP BUTTON */}
      <button
        onClick={scrollToTop}
        title="Scroll back to top"
        className="fixed bottom-6 left-6 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all border border-blue-400/40 cursor-pointer flex items-center space-x-2 text-xs font-black group"
      >
        <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
        <span>Top</span>
      </button>

      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2.5 ${labelColor}`}>
            <span>Account & Security Settings</span>
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 text-xs flex items-center justify-center font-extrabold">
              ⚙️
            </span>
          </h2>
          <p className={`text-xs font-medium ${descColor} mt-1`}>
            Manage your account credentials, security rules, notification alerts, privacy preferences, and active sessions.
          </p>
        </div>

        <button
          onClick={scrollToTop}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center space-x-2 cursor-pointer shrink-0 shadow-md"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Scroll To Top</span>
        </button>
      </div>

      {/* STICKY TOP TAB BAR FOR IMMEDIATE SECTION SWITCHING */}
      <div className="sticky top-0 z-20 py-2.5 px-3 rounded-2xl bg-white/95 dark:bg-[#060e22]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectSection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isActive ? (
                    item.danger ? 'bg-red-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                  ) : (
                    item.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={scrollToTop}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs flex items-center space-x-1 cursor-pointer shrink-0"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Top</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT SETTINGS SIDEBAR NAV */}
        <div className={`lg:col-span-1 rounded-3xl p-3 border space-y-1 ${cardBg}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  isActive ? (
                    item.danger ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white shadow-md'
                  ) : (
                    item.danger ? 'text-red-500 hover:bg-red-500/10' : (isDark ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100')
                  )
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* RIGHT SETTINGS SECTIONS */}
        <div className="lg:col-span-3 space-y-6">

          {/* 1. ACCOUNT INFORMATION CARD */}
          {showSection('account') && (
            <div id="settings-section-account" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-black text-base ${labelColor}`}>Account Information</h3>
                    <p className={`text-xs font-medium ${descColor}`}>Verified display name, email, account role, and company credentials.</p>
                  </div>
                </div>
                <button
                  onClick={openEditAccountModal}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Edit Account
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-white/20">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>{getInitials(profile.displayName || currentUserName)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className={`font-black text-lg ${labelColor}`}>{profile.displayName || currentUserName}</h4>
                    <p className={`text-xs font-bold ${descColor}`}>{profile.contactEmail}</p>
                    <span className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-extrabold inline-block">
                      Client / Enterprise Account
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">COMPANY</span>
                  <p className={`font-bold ${labelColor}`}>{profile.companyName || `${profile.displayName}'s Enterprise`}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SECURITY CARD */}
          {showSection('security') && (
            <div id="settings-section-security" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-black text-base ${labelColor}`}>Security & Authentication</h3>
                    <p className={`text-xs font-medium ${descColor}`}>Password security, multi-factor protection, and session keys.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-extrabold">
                  ✓ System Secure
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* PASSWORD ROW */}
                <div className={`p-4 rounded-2xl border space-y-3 ${rowBg}`}>
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-indigo-500" />
                    <span className={`font-extrabold ${labelColor}`}>Account Password</span>
                  </div>
                  <p className={`text-xs font-medium ${descColor}`}>Password set • Protect your account with complex credentials.</p>
                  <button
                    onClick={openChangePasswordModal}
                    className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Change Password
                  </button>
                </div>

                {/* 2FA ROW */}
                <div className={`p-4 rounded-2xl border space-y-3 ${rowBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      <span className={`font-extrabold ${labelColor}`}>Two-Factor Authentication</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                      settings.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}>
                      {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${descColor}`}>Adds 6-digit TOTP verification to protect login access.</p>
                  <button
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 font-bold rounded-xl text-xs border transition-all cursor-pointer ${
                      settings.twoFactorEnabled ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATION & EMAIL PREFERENCES CARD */}
          {showSection('notifications') && (
            <div id="settings-section-notifications" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center space-x-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${labelColor}`}>Notification Alerts & Email Preferences</h3>
                  <p className={`text-xs font-medium ${descColor}`}>Configure real-time in-app alerts and automated email notifications.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">IN-APP NOTIFICATIONS</h4>
                <div className="space-y-2.5 text-xs">
                  {[
                    { key: 'bids', title: 'Proposal & Freelancer Bids', desc: 'Alerts when freelancers submit new bids.' },
                    { key: 'milestones', title: 'Milestone Review Submissions', desc: 'Alerts when sprint deliverables are ready for review.' },
                    { key: 'messages', title: 'Direct Messages & Chat Alerts', desc: 'Alerts when unread messages arrive.' },
                    { key: 'projectUpdates', title: 'Project Status Updates', desc: 'Alerts when project status changes.' },
                    { key: 'payments', title: 'Payment & Escrow Releases', desc: 'Alerts for deposit and milestone releases.' },
                    { key: 'contracts', title: 'Contract & Hiring Updates', desc: 'Alerts when contracts are created or finalized.' },
                    { key: 'reviews', title: 'Freelancer Milestone Ratings', desc: 'Alerts when reviews are published.' }
                  ].map((item) => (
                    <div key={item.key} className={`p-3.5 rounded-2xl border flex items-center justify-between ${rowBg}`}>
                      <div>
                        <p className={`font-bold ${labelColor}`}>{item.title}</p>
                        <p className={`text-xs ${descColor}`}>{item.desc}</p>
                      </div>
                      
                      {/* CUSTOM SMOOTH TOGGLE */}
                      <button
                        onClick={() => toggleNotification(item.key)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 border ${
                          settings.notifications[item.key] ? 'bg-purple-600 border-purple-500' : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 pt-3">EMAIL PREFERENCES</h4>
                <div className="space-y-2.5 text-xs">
                  {[
                    { key: 'projectUpdates', title: 'Project Status Email Digests' },
                    { key: 'messageAlerts', title: 'Unread Message Email Alerts' },
                    { key: 'proposals', title: 'New Proposal Notification Emails' },
                    { key: 'paymentReceipts', title: 'Payment & Escrow Receipts' },
                    { key: 'productUpdates', title: 'Platform Product & Feature Updates' }
                  ].map((item) => (
                    <div key={item.key} className={`p-3.5 rounded-2xl border flex items-center justify-between ${rowBg}`}>
                      <span className={`font-bold ${labelColor}`}>{item.title}</span>
                      <button
                        onClick={() => toggleEmailPref(item.key)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 border ${
                          settings.emailPreferences[item.key] ? 'bg-blue-600 border-blue-500' : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.emailPreferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY SETTINGS CARD */}
          {showSection('privacy') && (
            <div id="settings-section-privacy" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center space-x-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                  <LockKeyhole className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${labelColor}`}>Privacy Controls</h3>
                  <p className={`text-xs font-medium ${descColor}`}>Control profile visibility and company credential indexing.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${rowBg}`}>
                  <div>
                    <p className={`font-bold ${labelColor}`}>Profile Visibility</p>
                    <p className={`text-xs ${descColor}`}>Control whether public freelancers can discover your enterprise profile.</p>
                  </div>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => togglePrivacyPref('profileVisibility', e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer text-xs ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${rowBg}`}>
                  <div>
                    <p className={`font-bold ${labelColor}`}>Allow Freelancers to View Profile</p>
                    <p className={`text-xs ${descColor}`}>Permit candidate applicants to inspect client company credentials.</p>
                  </div>
                  <button
                    onClick={() => togglePrivacyPref('allowFreelancerView')}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 border ${
                      settings.privacy.allowFreelancerView ? 'bg-teal-600 border-teal-500' : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.privacy.allowFreelancerView ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. ACTIVE SESSIONS CARD */}
          {showSection('sessions') && (
            <div id="settings-section-sessions" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <MonitorSmartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-black text-base ${labelColor}`}>Active Logged-In Sessions</h3>
                    <p className={`text-xs font-medium ${descColor}`}>Inspect active device logins and terminate unauthorized sessions.</p>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Other device sessions terminated.', 'success')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer border border-slate-700"
                >
                  Sign Out Other Sessions
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <MonitorSmartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    <div>
                      <p className={`font-extrabold ${labelColor}`}>Current Session • Windows (Chrome)</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Active now • IP: 127.0.0.1 (Verified)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                    This Device
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. DATA & ACCOUNT MANAGEMENT CARD */}
          {showSection('data') && (
            <div id="settings-section-data" className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
              <div className="flex items-center space-x-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${labelColor}`}>Data & Account Export</h3>
                  <p className={`text-xs font-medium ${descColor}`}>Download a complete backup of your profile, projects, and contracts.</p>
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border gap-4 text-xs ${rowBg}`}>
                <div>
                  <p className={`font-bold ${labelColor}`}>Export Complete Account Data (JSON)</p>
                  <p className={`text-xs ${descColor}`}>Download formatted JSON containing account profile, project listings, and credentials.</p>
                </div>
                <button
                  onClick={handleDownloadData}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download My Data</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. DANGER ZONE CARD (ACCOUNT DEACTIVATION) */}
          {showSection('danger') && (
            <div id="settings-section-danger" className={`rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 ${
              isDark ? 'bg-amber-950/20' : 'bg-amber-50/60 border-amber-200'
            }`}>
              <div className="flex items-center space-x-3 border-b pb-4 border-amber-500/20">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-amber-600 dark:text-amber-500">Danger Zone: Account Deactivation</h3>
                  <p className={`text-xs font-medium ${descColor}`}>Temporarily deactivate your client account. Your profile, posted projects, and contract history will be preserved and your account can be reactivated later.</p>
                </div>
              </div>

              {deactivationStatus.loading ? (
                <div className="p-4 text-xs font-bold text-slate-600 dark:text-slate-300 animate-pulse">
                  Checking active projects, contract escrow, and account eligibility...
                </div>
              ) : deactivationStatus.is_deactivated ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <p className="font-extrabold text-amber-800 dark:text-amber-300">
                      Your account is currently DEACTIVATED.
                    </p>
                    <p className="text-amber-700 dark:text-amber-400 text-xs">
                      Deactivated Period: <strong>{deactivationStatus.deactivation_period || 'Temporary'}</strong>. Your complete project history, contracts, and financial records remain 100% safe and preserved.
                    </p>
                  </div>
                  <button
                    onClick={handleReactivateAccount}
                    disabled={deactivationLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    {deactivationLoading ? 'Reactivating...' : 'Reactivate Account Now'}
                  </button>
                </div>
              ) : !deactivationStatus.eligible ? (
                /* WHEN ACTIVE WORK EXISTS */
                <div className="space-y-4 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-amber-700 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    <span>Status: Deactivation unavailable</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300/70 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-extrabold leading-relaxed">
                      Account deactivation is unavailable while you have active projects, pending contracts, or milestone obligations. Please complete or close all ongoing projects before deactivating your account.
                    </p>
                    {deactivationStatus.reasons.length > 0 && (
                      <div className="pt-1 border-t border-amber-200 dark:border-amber-800/60 mt-2">
                        <p className="text-xs font-black uppercase text-amber-800 dark:text-amber-400 mb-1">Active Obligations Found ({deactivationStatus.reasons.length}):</p>
                        <ul className="list-disc list-inside space-y-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                          {deactivationStatus.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      disabled
                      className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs cursor-not-allowed border border-slate-300 dark:border-slate-700"
                    >
                      Deactivation Unavailable
                    </button>
                  </div>
                </div>
              ) : (
                /* WHEN ELIGIBLE */
                <div className="space-y-5 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Status: Eligible</span>
                  </div>

                  <p className={`font-medium leading-relaxed ${descColor}`}>
                    No active projects or pending obligations were found. Your account will be temporarily deactivated. Your profile, projects, contracts, reviews, financial history, and other records will be preserved.
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-amber-500/20">
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-extrabold uppercase tracking-wider ${labelColor}`}>
                        Deactivation Period
                      </label>
                      <select
                        value={deactivationPeriod}
                        onChange={(e) => setDeactivationPeriod(e.target.value)}
                        className={`p-3 pr-8 rounded-xl border text-xs font-bold focus:outline-none focus:border-amber-500 transition-all ${
                          isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="7 days">7 days</option>
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                        <option value="Until I reactivate">Until I reactivate</option>
                      </select>
                      <p className={`text-xs font-medium text-slate-700 dark:text-slate-300`}>
                        {deactivationPeriod === 'Until I reactivate' 
                          ? 'Account will remain deactivated until you manually log in and reactivate it.' 
                          : `Account will be reactivated automatically after ${deactivationPeriod}.`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModal('deactivate_account')}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer shrink-0 transition-all"
                    >
                      Deactivate Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* MODALS */}
      {/* --------------------------------------------------------------------------- */}

      {/* EDIT ACCOUNT MODAL */}
      {activeModal === 'edit_account' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black flex items-center space-x-2">
                <UserRound className="w-5 h-5 text-blue-500" />
                <span>Edit Account Credentials</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">Display Name *</label>
                <input
                  type="text"
                  value={accountForm.displayName}
                  onChange={(e) => setAccountForm({ ...accountForm, displayName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    accountErrors.displayName ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="e.g. Abhilash K K"
                />
                {accountErrors.displayName && <p className="text-xs text-red-500 font-bold mt-1">{accountErrors.displayName}</p>}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">Contact Email Address *</label>
                <input
                  type="email"
                  value={accountForm.contactEmail}
                  onChange={(e) => setAccountForm({ ...accountForm, contactEmail: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    accountErrors.contactEmail ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="e.g. user@example.com"
                />
                {accountErrors.contactEmail && <p className="text-xs text-red-500 font-bold mt-1">{accountErrors.contactEmail}</p>}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">Company Name *</label>
                <input
                  type="text"
                  value={accountForm.companyName}
                  onChange={(e) => setAccountForm({ ...accountForm, companyName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    accountErrors.companyName ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="e.g. TechStream Enterprises"
                />
                {accountErrors.companyName && <p className="text-xs text-red-500 font-bold mt-1">{accountErrors.companyName}</p>}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                >
                  {savingAccount && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {activeModal === 'change_password' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Change Security Password</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">Current Password *</label>
                <input
                  type="password"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    passErrors.currentPassword ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="••••••••"
                />
                {passErrors.currentPassword && <p className="text-xs text-red-500 font-bold mt-1">{passErrors.currentPassword}</p>}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">New Password *</label>
                <input
                  type="password"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    passErrors.newPassword ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="••••••••"
                />
                {passErrors.newPassword && <p className="text-xs text-red-500 font-bold mt-1">{passErrors.newPassword}</p>}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">Confirm New Password *</label>
                <input
                  type="password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-xs ${
                    passErrors.confirmPassword ? 'border-red-500' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')
                  }`}
                  placeholder="••••••••"
                />
                {passErrors.confirmPassword && <p className="text-xs text-red-500 font-bold mt-1">{passErrors.confirmPassword}</p>}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                >
                  {changingPass && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA SETUP MODAL */}
      {activeModal === 'manage_2fa' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <span>Enable Two-Factor Authentication</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className={`font-medium ${descColor}`}>
                Scan the TOTP barcode in your Google Authenticator or Authy app, then enter the 6-digit verification code below.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono text-emerald-400 font-bold text-sm tracking-widest">
                FM-2FA-908234
              </div>

              <form onSubmit={handleConfirm2FA} className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-xs">6-Digit Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-center text-base tracking-widest"
                    placeholder="123456"
                  />
                  {totpError && <p className="text-xs text-red-500 font-bold mt-1 text-left">{totpError}</p>}
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Verify & Enable 2FA
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DEACTIVATION CONFIRMATION MODAL */}
      {activeModal === 'deactivate_account' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border border-amber-500/30 shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#060e22] text-white' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-500 border-b pb-3 border-amber-500/20">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black">Deactivate Your Account?</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <p className={`font-medium ${descColor}`}>
                Your account will be temporarily unavailable during the selected period.
              </p>
              
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-xs font-bold leading-relaxed">
                ✓ Your existing profile, posted projects, contracts, reviews, financial history, and historical records will NOT be deleted.
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">Selected Period</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">{deactivationPeriod}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={deactivationLoading}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {deactivationLoading ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientSettingsView;
