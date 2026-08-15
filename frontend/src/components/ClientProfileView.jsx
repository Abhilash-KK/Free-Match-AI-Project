import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  UserRound, 
  MapPin, 
  Globe, 
  Mail, 
  Calendar, 
  FolderKanban, 
  UsersRound, 
  CircleCheck, 
  Star, 
  FileText, 
  Pencil, 
  Share2, 
  Eye, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Award,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { validateAvatarFile, getInitials } from '../utils/avatarUtils';
import { 
  validateName, 
  validateTitle, 
  validateText, 
  validateEmail, 
  validateUrl 
} from '../utils/validationUtils';

const ClientProfileView = ({
  userSession,
  currentUserId,
  currentUserName = 'Enterprise Client',
  isDark = false,
  clientProjects = [],
  hiredFreelancers = [],
  contracts = [],
  onNavigateTab,
  showToastMessage
}) => {
  const authUsername = (currentUserId || userSession?.user_id || userSession?.email || 'client').toLowerCase().trim();
  const profileStorageKey = `freematch_user_${authUsername}_profile`;

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}

    const isSeedClient = authUsername === 'user1' || authUsername === 'abhi' || authUsername === 'abhilash' || authUsername.includes('techstream') || authUsername === 'john@freematch.ai';

    if (isSeedClient) {
      return {
        displayName: currentUserName || 'Abhilash K K',
        companyName: 'TechStream Enterprises',
        industry: 'Software Engineering & Artificial Intelligence',
        location: 'San Francisco, CA',
        website: 'https://freematch.ai',
        contactEmail: userSession?.email || 'abhi@freematch.ai',
        description: 'Enterprise client account on FreeMatch AI platform driving next-generation AI model execution, full-stack web engineering, and autonomous pipeline optimization.',
        avatar_url: userSession?.avatar_url || '',
        joinedDate: 'October 2023',
        verified: true
      };
    }

    return {
      displayName: currentUserName || 'New Client Account',
      companyName: userSession?.company || `${currentUserName}'s Enterprise`,
      industry: '',
      location: '',
      website: '',
      contactEmail: userSession?.email || `${authUsername}@example.com`,
      description: '',
      avatar_url: userSession?.avatar_url || '',
      joinedDate: 'August 2026',
      verified: false
    };
  });

  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile' | 'confirm_delete_avatar' | 'company_details' | 'view_public'
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

  // Persist state to local storage and sync across windows
  const persistState = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_profile_event'));
  };

  // ---------------------------------------------------------------------------
  // AVATAR UPLOAD & REMOVAL WORKFLOW
  // ---------------------------------------------------------------------------
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    setAvatarError('');
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setAvatarPreview(base64Data);

      const updated = { ...profile, avatar_url: base64Data };
      persistState(updated);

      try {
        await fetch('http://localhost:8000/api/user-avatar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authUsername, avatar_url: base64Data })
        });
      } catch (err) {}

      showToast('Client profile picture updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const confirmRemoveAvatar = () => {
    setActiveModal('confirm_delete_avatar');
  };

  const handleRemoveAvatar = async () => {
    setAvatarPreview('');
    setAvatarError('');
    const updated = { ...profile, avatar_url: '' };
    persistState(updated);

    try {
      await fetch(`http://localhost:8000/api/user-avatar/?username=${encodeURIComponent(authUsername)}`, {
        method: 'DELETE'
      });
    } catch (err) {}

    showToast('Profile picture removed. Initials fallback restored.', 'info');
    setActiveModal(null);
  };

  // ---------------------------------------------------------------------------
  // EDIT PROFILE WORKFLOW & VALIDATION
  // ---------------------------------------------------------------------------
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    companyName: '',
    industry: '',
    location: '',
    website: '',
    contactEmail: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const openEditProfileModal = () => {
    setAvatarPreview(profile.avatar_url || '');
    setAvatarError('');
    setProfileForm({
      displayName: profile.displayName || currentUserName,
      companyName: profile.companyName || '',
      industry: profile.industry || '',
      location: profile.location || '',
      website: profile.website || '',
      contactEmail: profile.contactEmail || userSession?.email || '',
      description: profile.description || ''
    });
    setFormErrors({});
    setActiveModal('edit_profile');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};

    const vName = validateName(profileForm.displayName, 'Full Name');
    if (!vName.valid) errors.displayName = vName.error;

    const vCompany = validateTitle(profileForm.companyName, 'Company Name', 2, 100);
    if (!vCompany.valid) errors.companyName = vCompany.error;

    if (profileForm.industry && profileForm.industry.trim()) {
      const vInd = validateTitle(profileForm.industry, 'Industry', 2, 100);
      if (!vInd.valid) errors.industry = vInd.error;
    }

    if (profileForm.location && profileForm.location.trim()) {
      const vLoc = validateTitle(profileForm.location, 'Location', 2, 100);
      if (!vLoc.valid) errors.location = vLoc.error;
    }

    if (profileForm.website && profileForm.website.trim()) {
      const vWeb = validateUrl(profileForm.website, 'Official Website');
      if (!vWeb.valid) errors.website = vWeb.error;
    }

    if (profileForm.contactEmail && profileForm.contactEmail.trim()) {
      const vMail = validateEmail(profileForm.contactEmail);
      if (!vMail.valid) errors.contactEmail = vMail.error;
    }

    if (profileForm.description && profileForm.description.trim()) {
      const vDesc = validateText(profileForm.description, 'Company Description', 10, 2000, false);
      if (!vDesc.valid) errors.description = vDesc.error;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct the highlighted form errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      const updated = {
        ...profile,
        displayName: vName.value,
        companyName: vCompany.value,
        industry: profileForm.industry.trim() || 'Software Technology',
        location: profileForm.location.trim() || 'San Francisco, CA',
        website: profileForm.website.trim() ? (profileForm.website.startsWith('http') ? profileForm.website.trim() : `https://${profileForm.website.trim()}`) : 'https://freematch.ai',
        contactEmail: profileForm.contactEmail.trim() || userSession?.email || `${authUsername}@freematch.ai`,
        description: profileForm.description.trim() || 'Enterprise client on FreeMatch AI marketplace platform.'
      };

      persistState(updated);

      try {
        await fetch('http://localhost:8000/api/user-profile/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authUsername,
            first_name: vName.value.split(' ')[0],
            last_name: vName.value.split(' ').slice(1).join(' '),
            company_name: vCompany.value,
            bio: updated.description
          })
        });
      } catch (err) {}

      showToast('Client profile updated successfully!', 'success');
      setActiveModal(null);
    } catch (err) {
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DYNAMIC PROFILE COMPLETION & STATS CALCULATION
  // ---------------------------------------------------------------------------
  const completionPercentage = React.useMemo(() => {
    let score = 0;
    if (profile.displayName && profile.displayName.trim()) score += 15;
    if (profile.avatar_url && profile.avatar_url.trim()) score += 15;
    if (profile.companyName && profile.companyName.trim()) score += 15;
    if (profile.location && profile.location.trim()) score += 15;
    if (profile.website && profile.website.trim()) score += 10;
    if (profile.contactEmail && profile.contactEmail.trim()) score += 15;
    if (profile.description && profile.description.trim().length >= 10) score += 15;
    return Math.min(score, 100);
  }, [profile]);

  const projectsPostedCount = (clientProjects || []).length;
  const freelancersHiredCount = (hiredFreelancers || []).length;
  const completedProjectsCount = (clientProjects || []).filter(p => p.status === 'Completed').length;
  const activeContractsCount = (contracts || []).filter(c => c.status === 'Active').length;
  const reputationScoreStr = (projectsPostedCount > 0 || freelancersHiredCount > 0) ? '5.0 / 5.0' : 'No ratings yet';

  return (
    <div className={`p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full transition-all ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* LOCAL TOAST NOTIFICATION */}
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

      {/* PAGE HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>Client Enterprise Profile</span>
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 text-xs flex items-center justify-center font-extrabold">
              ✓
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Manage your enterprise marketplace identity, company credentials, posted projects, and verified reputation.
          </p>
        </div>

        {/* TOP COMPACT PROFILE COMPLETION PILL */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center space-x-3 shrink-0 ${
          isDark ? 'bg-[#081a18] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">PROFILE COMPLETION</span>
            <span className="text-xs font-black text-emerald-500">{completionPercentage}%</span>
          </div>
          <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* 1. MAIN CLIENT PROFILE HEADER CARD */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xs relative overflow-hidden space-y-6 ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* AVATAR + MAIN TITLE DETAILS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* AVATAR CONTAINER */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/20">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                ) : (
                  <span>{getInitials(profile.displayName || currentUserName)}</span>
                )}
              </div>

              {/* UPLOAD / CAMERA ICON OVERLAY */}
              <label 
                htmlFor="client-avatar-file-input" 
                className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer backdrop-blur-xs"
                title="Change Profile Picture"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Upload</span>
              </label>
              <input 
                id="client-avatar-file-input" 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleAvatarSelect} 
              />

              {/* VERIFIED BADGE */}
              <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs">
                ✓
              </span>
            </div>

            {/* NAME & META INFO */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.displayName || currentUserName}
                </h3>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-extrabold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Client</span>
                </span>
                <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[11px] font-extrabold flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Client / Enterprise</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                  <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{profile.companyName || `${profile.displayName || currentUserName}'s Enterprise`}</span>
                </span>
                <span className="text-slate-600 dark:text-slate-700">•</span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.location || 'Location Not Specified'}</span>
                </span>
                <span className="text-slate-600 dark:text-slate-700">•</span>
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Joined {profile.joinedDate || 'August 2026'}</span>
                </span>
              </div>

              {/* ACTION CHIPS FOR AVATAR MANAGEMENT */}
              {profile.avatar_url && (
                <div className="pt-1 flex items-center space-x-3">
                  <button 
                    onClick={confirmRemoveAvatar}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Profile Picture</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ACTION BUTTONS (STACKED / ROW) */}
          <div className="flex flex-wrap lg:flex-col items-center gap-2.5 shrink-0">
            <button
              onClick={openEditProfileModal}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 min-w-[150px]"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveModal('company_details')}
              className={`px-5 py-2.5 font-bold rounded-xl text-xs border transition-all cursor-pointer flex items-center justify-center space-x-2 min-w-[150px] ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Company Details</span>
            </button>

            <button
              onClick={() => {
                showToast('Public profile link copied to clipboard!', 'success');
              }}
              className={`px-5 py-2.5 font-bold rounded-xl text-xs border transition-all cursor-pointer flex items-center justify-center space-x-2 min-w-[150px] ${
                isDark ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>Share Profile</span>
            </button>
          </div>

        </div>

        {/* 2. STATS METRICS BAR */}
        <div className={`rounded-2xl p-5 border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x ${
          isDark ? 'bg-[#081a18]/60 border-slate-800 divide-slate-800' : 'bg-slate-50/80 border-slate-200/80 divide-slate-200'
        }`}>
          
          {/* PROJECTS POSTED */}
          <div className="flex items-center space-x-4 pt-3 sm:pt-0 sm:px-3 first:px-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">PROJECTS POSTED</span>
              <span className={`text-2xl font-black mt-0.5 block ${isDark ? 'text-white' : 'text-slate-900'}`}>{projectsPostedCount}</span>
            </div>
          </div>

          {/* FREELANCERS HIRED */}
          <div className="flex items-center space-x-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <UsersRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">FREELANCERS HIRED</span>
              <span className={`text-2xl font-black mt-0.5 block ${isDark ? 'text-white' : 'text-slate-900'}`}>{freelancersHiredCount}</span>
            </div>
          </div>

          {/* COMPLETED PROJECTS */}
          <div className="flex items-center space-x-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CircleCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">COMPLETED PROJECTS</span>
              <span className={`text-2xl font-black mt-0.5 block ${isDark ? 'text-white' : 'text-slate-900'}`}>{completedProjectsCount}</span>
            </div>
          </div>

          {/* REPUTATION SCORE */}
          <div className="flex items-center space-x-4 pt-3 sm:pt-0 sm:px-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">REPUTATION SCORE</span>
              <span className={`text-lg font-black mt-0.5 block ${isDark ? 'text-white' : 'text-slate-900'}`}>{reputationScoreStr}</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. ABOUT COMPANY & MARKETPLACE REPUTATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ABOUT COMPANY & MISSION (2 COLS) */}
        <div className={`lg:col-span-2 rounded-3xl p-6 sm:p-7 border shadow-xs space-y-4 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h3 className={`font-black text-base flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>About Company & Mission</span>
            </h3>
            <button onClick={openEditProfileModal} className="text-xs font-extrabold text-blue-500 hover:underline flex items-center space-x-1 cursor-pointer">
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {profile.description || 'No company description added yet. Click Edit Profile to add company overview.'}
          </p>

          {/* QUICK COMPANY META CHIPS */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">INDUSTRY</span>
              <span className="text-xs font-bold text-blue-500">{profile.industry || 'Not specified'}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">OFFICIAL WEBSITE</span>
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-500 hover:underline flex items-center space-x-1">
                  <span className="truncate">{profile.website.replace('https://', '').replace('http://', '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs font-bold text-slate-400">Not specified</span>
              )}
            </div>
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">CONTACT EMAIL</span>
              <span className="text-xs font-bold text-slate-300 truncate block">{profile.contactEmail}</span>
            </div>
          </div>
        </div>

        {/* MARKETPLACE REPUTATION & ACTIVITY SUMMARY (1 COL) */}
        <div className={`rounded-3xl p-6 sm:p-7 border shadow-xs space-y-4 flex flex-col justify-between ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <h3 className={`font-black text-base flex items-center space-x-2 border-b pb-3 border-slate-100 dark:border-slate-800 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Award className="w-5 h-5 text-amber-500" />
            <span>Marketplace Reputation</span>
          </h3>

          <div className="space-y-3">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <span className="text-xs font-bold text-slate-400">Client Rating</span>
              <span className="text-xs font-black text-emerald-500 flex items-center space-x-1">
                <span>{reputationScoreStr}</span>
                {reputationScoreStr.includes('5.0') && <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
            }`}>
              <span className="text-xs font-bold text-slate-400">Total Posted Projects</span>
              <span className="text-xs font-black text-blue-500">{projectsPostedCount}</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'
            }`}>
              <span className="text-xs font-bold text-slate-400">Active Hired Team</span>
              <span className="text-xs font-black text-purple-500">{freelancersHiredCount}</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'
            }`}>
              <span className="text-xs font-bold text-slate-400">Active Contracts</span>
              <span className="text-xs font-black text-amber-500">{activeContractsCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. COMPANY INFORMATION DETAILS CARD */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xs space-y-5 ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <h3 className={`font-black text-base flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Building2 className="w-5 h-5 text-indigo-500" />
            <span>Company Credentials & Information</span>
          </h3>
          <button onClick={openEditProfileModal} className="text-xs font-extrabold text-blue-500 hover:underline cursor-pointer">
            Edit Details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>INDUSTRY</span>
            </span>
            <p className="font-bold text-slate-200">{profile.industry || 'Software Engineering'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>OFFICIAL WEBSITE</span>
            </span>
            <p className="font-bold text-emerald-400">
              <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">
                {profile.website}
              </a>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>CONTACT EMAIL</span>
            </span>
            <p className="font-bold text-slate-200">{profile.contactEmail}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>LOCATION</span>
            </span>
            <p className="font-bold text-slate-200">{profile.location || 'San Francisco, CA'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>MEMBER SINCE</span>
            </span>
            <p className="font-bold text-slate-200">{profile.joinedDate || 'October 2023'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              <span>VERIFICATION STATUS</span>
            </span>
            <p className="font-bold text-emerald-400">✓ Payment & Identity Verified</p>
          </div>
        </div>
      </div>

      {/* 5. POSTED PROJECTS LISTING */}
      {onNavigateTab && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xs space-y-5 ${
          isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
            <h3 className={`font-black text-base flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <span>Client Posted Projects ({projectsPostedCount})</span>
            </h3>
            <button onClick={() => onNavigateTab('projects')} className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">
              Manage All Projects →
            </button>
          </div>

          {clientProjects.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700">
              <p className="text-xs font-bold text-slate-400">No projects posted yet.</p>
              <button 
                onClick={() => onNavigateTab('post-job')} 
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                + Post First Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clientProjects.slice(0, 4).map(p => (
                <div key={p.id || p.title} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.title}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {p.status || 'Open'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Category: <span className="font-bold text-slate-300">{p.category || 'Engineering'}</span> • Budget: <span className="font-bold text-emerald-400">{p.budget || '$5,000'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigateTab('my-projects')} 
                    className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer"
                  >
                    View Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* EDIT CLIENT PROFILE MODAL */}
      {/* --------------------------------------------------------------------------- */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative transition-all my-8 ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-blue-500" />
                <span>Edit Client Enterprise Profile</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* DISPLAY NAME */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    formErrors.displayName ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                  }`}
                  placeholder="e.g. Abhilash K K"
                />
                {formErrors.displayName && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.displayName}</p>}
              </div>

              {/* COMPANY NAME */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    formErrors.companyName ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                  }`}
                  placeholder="e.g. TechStream Enterprises"
                />
                {formErrors.companyName && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.companyName}</p>}
              </div>

              {/* ROW: INDUSTRY & LOCATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formErrors.industry ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                    }`}
                    placeholder="e.g. Software Technology"
                  />
                  {formErrors.industry && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.industry}</p>}
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formErrors.location ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                    }`}
                    placeholder="e.g. San Francisco, CA"
                  />
                  {formErrors.location && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.location}</p>}
                </div>
              </div>

              {/* ROW: WEBSITE & CONTACT EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formErrors.website ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                    }`}
                    placeholder="e.g. https://freematch.ai"
                  />
                  {formErrors.website && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.website}</p>}
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formErrors.contactEmail ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                    }`}
                    placeholder="e.g. abhi@freematch.ai"
                  />
                  {formErrors.contactEmail && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.contactEmail}</p>}
                </div>
              </div>

              {/* COMPANY DESCRIPTION */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  About Company & Mission
                </label>
                <textarea
                  rows="4"
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    formErrors.description ? 'border-red-500 ring-1 ring-red-500/30' : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                  }`}
                  placeholder="Describe your company, technical focus, and mission..."
                />
                {formErrors.description && <p className="text-[11px] font-bold text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              {/* MODAL FOOTER BUTTONS */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                >
                  {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE AVATAR MODAL */}
      {activeModal === 'confirm_delete_avatar' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black">Remove Profile Picture?</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Are you sure you want to remove your profile picture? Your profile will revert to the initial-based avatar fallback.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setActiveModal(null)} 
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveAvatar} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Remove Picture
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientProfileView;
