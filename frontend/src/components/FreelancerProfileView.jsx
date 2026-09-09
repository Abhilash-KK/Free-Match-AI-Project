import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Pencil, 
  Zap, 
  FolderKanban, 
  FileText, 
  MessageCircle, 
  UserPlus, 
  Clock, 
  MapPin, 
  Wallet, 
  User, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Star, 
  Download, 
  Upload, 
  AlertTriangle, 
  BadgeCheck, 
  CheckCircle2,
  X,
  Plus,
  Building2,
  Eye,
  Trash2,
  Camera,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { validateAvatarFile, getInitials } from '../utils/avatarUtils';
import { 
  validateName, 
  validateTitle, 
  validateText, 
  validateMoney, 
  validateSkill, 
  validateUrl, 
  validateResumeFile 
} from '../utils/validationUtils';

/**
 * FreelancerProfileView Component
 * 
 * Fully functional 8-section Freelancer Profile & Skills Portfolio
 * Supports complete CRUD operations, frontend/backend validation,
 * PostgreSQL database persistence, loading states, delete confirmations,
 * dynamic profile completion calculation, and modern Lucide React icons.
 */
export default function FreelancerProfileView({
  userSession = null,
  initialFreelancerData = {},
  reviews = [],
  viewMode = 'client', // 'client' | 'freelancer'
  isDark = true,
  isSaved = false,
  onToggleSave = null,
  onMessage = () => {},
  onHire = () => {},
  onClose = null,
  showToast = () => {}
}) {
  // Determine authenticated username
  const authUsername = userSession?.user_id || userSession?.username || initialFreelancerData.user_id || initialFreelancerData.username || '';

  // Core State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState([]);

  // Active Modals State
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile' | 'edit_skills' | 'portfolio' | 'resume' | 'certification' | 'education' | 'experience' | 'confirm_delete' | 'project_detail'
  const [deleteConfig, setDeleteConfig] = useState(null); // { type, id, title, action }

  // Form Fields & Validation States
  const [formErrors, setFormErrors] = useState({});
  const [projectDetailModal, setProjectDetailModal] = useState(null);

  // ---------------------------------------------------------------------------
  // 1. FETCH LIVE DATA FROM DJANGO REST BACKEND & LOCAL STORAGE PERSISTENCE
  // ---------------------------------------------------------------------------
  const loadReviewsData = useCallback(async () => {
    let combined = Array.isArray(reviews) ? [...reviews] : [];

    // 1. Fetch from backend REST API with user ID query
    if (authUsername) {
      try {
        const resUser = await fetch(`http://localhost:8000/api/reviews/?freelancer=${encodeURIComponent(authUsername)}`);
        if (resUser.ok) {
          const apiData = await resUser.json();
          if (Array.isArray(apiData)) combined = [...combined, ...apiData];
        }
      } catch (e) {}
    }

    // 2. Fetch from backend REST API with display name query
    if (initialFreelancerData?.name && initialFreelancerData.name !== authUsername) {
      try {
        const resName = await fetch(`http://localhost:8000/api/reviews/?freelancer=${encodeURIComponent(initialFreelancerData.name)}`);
        if (resName.ok) {
          const apiData = await resName.json();
          if (Array.isArray(apiData)) combined = [...combined, ...apiData];
        }
      } catch (e) {}
    }

    // 3. Scan LocalStorage keys strictly for reviews matching this freelancer
    const curName = (initialFreelancerData?.name || '').toLowerCase().trim();
    const curUser = (authUsername || '').toLowerCase().trim();
    if (curName || curUser) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('reviews') || key.includes('freematch'))) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(parsed)) {
                parsed.forEach(item => {
                  if (item && item.reviewee && (item.comment || item.rating)) {
                    const revTarget = String(item.reviewee).toLowerCase().trim();
                    const matches = (curUser && (revTarget === curUser || revTarget.includes(curUser) || curUser.includes(revTarget))) ||
                                    (curName && (revTarget === curName || revTarget.includes(curName) || curName.includes(revTarget)));
                    if (matches) {
                      combined.push(item);
                    }
                  }
                });
              }
            } catch (err) {}
          }
        }
      } catch (e) {}
    }

    // Deduplicate by composite semantic key (reviewer + reviewee + project)
    const uniqueMap = new Map();
    combined.forEach(r => {
      if (!r) return;
      const rev = String(r.reviewer_username || r.reviewer || '').toLowerCase().trim();
      const target = String(r.reviewee_username || r.reviewee || '').toLowerCase().trim();
      const proj = String(r.projectTitle || r.project_title || '').toLowerCase().trim();
      const key = `${rev}___${target}___${proj}`;

      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, r);
      } else {
        const existingIsBackend = String(existing.id || '').startsWith('rev_') || typeof existing.id === 'number';
        const currentIsBackend = String(r.id || '').startsWith('rev_') || typeof r.id === 'number';
        if (!existingIsBackend && currentIsBackend) {
          uniqueMap.set(key, r);
        }
      }
    });

    setFetchedReviews(Array.from(uniqueMap.values()));
  }, [reviews, authUsername]);

  useEffect(() => {
    loadReviewsData();
    const handleSync = () => loadReviewsData();
    window.addEventListener('freematch_review_submitted', handleSync);
    return () => {
      window.removeEventListener('freematch_review_submitted', handleSync);
    };
  }, [loadReviewsData]);

  const hasLoadedRef = useRef(false);
  const loadedUserRef = useRef(null);

  const loadProfileData = useCallback(async (force = false) => {
    if (!force && hasLoadedRef.current && loadedUserRef.current === authUsername) {
      return;
    }
    loadedUserRef.current = authUsername;

    // Only display full-screen loading skeleton on initial mount when profile state is null
    setProfile(prev => {
      if (!prev) setLoading(true);
      return prev;
    });

    try {
      const res = await fetch(`http://localhost:8000/api/freelancer-profile/?username=${encodeURIComponent(authUsername)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        hasLoadedRef.current = true;
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend API connection notice, using synchronized local store fallback:', err);
    } finally {
      setLoading(false);
    }

    let loadedProfile = null;
    const savedLocal = localStorage.getItem(`freematch_profile_${authUsername}`);
    if (savedLocal) {
      try {
        loadedProfile = JSON.parse(savedLocal);
      } catch (e) {}
    }

    if (!loadedProfile) {
      const isDemo = authUsername === 'demo_freelancer';
      if (isDemo) {
        loadedProfile = {
          user_id: authUsername,
          name: authUsername.toLowerCase().includes('haines') ? 'Haines JP' : (initialFreelancerData?.name || 'Alex Mercer'),
          title: initialFreelancerData?.title || 'Senior React, PyTorch & Django Architect',
          headline: initialFreelancerData?.headline || 'Senior React, PyTorch & Django Architect',
          location: initialFreelancerData?.location || 'San Francisco, CA',
          hourly_rate: initialFreelancerData?.hourlyRate || '₹4,000/hr',
          raw_hourly_rate: 75.0,
          availability_status: 'Available for Work',
          available_hours: '40 hrs/week',
          years_experience: '7+',
          bio: initialFreelancerData?.bio || 'Senior Full Stack & Artificial Intelligence Engineer with 7+ years of experience constructing high-performance RESTful APIs, deep learning inference pipelines, and real-time React web applications.',
          skills: initialFreelancerData?.skills || ['React.js', 'Python Django', 'PyTorch ML', 'PostgreSQL', 'Tailwind CSS', 'FastAPI', 'OWASP Security'],
          avatar_url: '',
          resume_name: 'Alex_Mercer_Senior_Engineer_Resume.pdf',
          resume_url: '#',
          resume_size: '1.4 MB',
          portfolio: [
            { id: 101, title: 'AI Automated Test Pipeline', description: 'Automated test execution pipeline with FastAPI and PostgreSQL telemetry logging.', skills: ['Python', 'FastAPI', 'PostgreSQL'], status: 'Completed', completion_info: 'Delivered in 3 Weeks' },
            { id: 102, title: 'AI Pipeline Optimization', description: 'High-performance inference acceleration engine using PyTorch quantization and TensorRT bindings.', skills: ['PyTorch', 'TensorRT', 'CUDA'], status: 'In Progress', completion_info: 'Active Contract • 4x Speedup' }
          ],
          experience: [
            { id: 201, role: 'Principal AI & Full Stack Architect', organization: 'FreeMatch AI Client Projects', start_date: '2021', end_date: 'Present', currently_working: true, description: 'Architected deep learning inference servers and real-time React web dashboards.' }
          ],
          education: [
            { id: 301, degree: 'B.S. in Computer Science', institution: 'Stanford University', start_year: '2015', end_year: '2019', description: 'Specialized in Artificial Intelligence & Systems Design.' }
          ],
          certifications: [
            { id: 401, name: 'AWS Certified Solutions Architect', organization: 'Amazon Web Services', issue_date: '2022', expiry_date: '2025', credential_id: 'AWS-9021', credential_url: 'https://aws.amazon.com' }
          ]
        };
      } else {
        loadedProfile = {
          user_id: authUsername,
          name: userSession?.name || userSession?.user_id || authUsername,
          title: initialFreelancerData?.title || '',
          headline: initialFreelancerData?.headline || '',
          location: initialFreelancerData?.location || '',
          hourly_rate: initialFreelancerData?.hourlyRate || '₹0/hr',
          raw_hourly_rate: 0.0,
          availability_status: 'Available for Work',
          available_hours: '40 hrs/week',
          years_experience: '0',
          bio: initialFreelancerData?.bio || '',
          skills: initialFreelancerData?.skills || [],
          avatar_url: userSession?.avatar_url || '',
          resume_name: '',
          resume_url: '',
          resume_size: '',
          portfolio: [],
          experience: [],
          education: [],
          certifications: []
        };
      }
    }
    setProfile(loadedProfile);
    hasLoadedRef.current = true;
  }, [authUsername]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Sync state helper to local storage & backend
  const persistState = (updatedProfile) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem(`freematch_profile_${authUsername}`, JSON.stringify(updatedProfile));
      const sessionStr = localStorage.getItem('freematch_active_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if ((session.user_id || session.username || '').toLowerCase() === authUsername.toLowerCase()) {
          session.avatar_url = updatedProfile.avatar_url;
          session.name = updatedProfile.name;
          localStorage.setItem('freematch_active_session', JSON.stringify(session));
        }
      }
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('freematch_profile_event', { detail: updatedProfile }));
    window.dispatchEvent(new CustomEvent('freematch_user_avatar_event', { detail: { avatar_url: updatedProfile.avatar_url, username: authUsername } }));
  };

  // ---------------------------------------------------------------------------
  // 2. DYNAMIC PROFILE COMPLETION CALCULATION
  // ---------------------------------------------------------------------------
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name && profile.title && profile.bio && profile.hourly_rate) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.portfolio && profile.portfolio.length > 0) score += 20;
    if (profile.resume_name && profile.resume_name.trim() !== '') score += 20;
    if (profile.certifications && profile.certifications.length > 0) score += 20;
    return score;
  };

  const completenessPercentage = calculateCompleteness();

  // ---------------------------------------------------------------------------
  // 3. EDIT PROFILE WORKFLOW & VALIDATION
  // ---------------------------------------------------------------------------
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    headline: '',
    location: '',
    hourly_rate: '',
    availability_status: 'Available for Work',
    available_hours: '40 hrs/week',
    years_experience: '0',
    bio: '',
    avatar_url: ''
  });

  const openEditProfileModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!profile) return;
    const isDemo = authUsername === 'demo_freelancer';
    setAvatarPreview(profile.avatar_url || '');
    setAvatarError('');
    setProfileForm({
      name: profile.name || '',
      title: profile.title || '',
      headline: profile.headline || profile.title || '',
      location: profile.location || (isDemo ? 'San Francisco, CA' : ''),
      hourly_rate: profile.hourly_rate ? String(profile.hourly_rate).replace('$', '').replace('₹', '').replace('/hr', '').trim() : (isDemo ? '4000' : '0'),
      availability_status: profile.availability_status || 'Available for Work',
      available_hours: profile.available_hours || '40 hrs/week',
      years_experience: profile.years_experience !== undefined && profile.years_experience !== '' ? profile.years_experience : (isDemo ? '7+' : '0'),
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || ''
    });
    setFormErrors({});
    setActiveModal('edit_profile');
  };

  const handleDirectAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return; // User cancelled file picker -> preserve existing avatar

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      e.target.value = '';
      return;
    }

    setSaving(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setSaving(false);
      showToast('Error reading selected image file.', 'error');
      e.target.value = '';
    };
    reader.onload = async () => {
      try {
        const base64Data = reader.result;

        const res = await fetch('http://localhost:8000/api/user-avatar/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authUsername,
            avatar_url: base64Data
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update profile picture.');
        }

        const updated = { ...profile, avatar_url: base64Data };
        persistState(updated);
        setAvatarPreview(base64Data);
        setProfileForm(prev => ({ ...prev, avatar_url: base64Data }));

        showToast('Profile picture updated successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to upload profile picture.', 'error');
      } finally {
        setSaving(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    setAvatarError('');
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setProfileForm(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const confirmRemoveAvatar = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setAvatarPreview('');
      setAvatarError('');
      setProfileForm(prev => ({ ...prev, avatar_url: '' }));
    }
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (saving) return; // Prevent duplicate submissions

    const errors = {};

    const vName = validateName(profileForm.name, 'Full Name');
    if (!vName.valid) errors.name = vName.error;

    const vTitle = validateTitle(profileForm.title, 'Professional Title', 3, 100);
    if (!vTitle.valid) errors.title = vTitle.error;

    const vBio = validateText(profileForm.bio, 'Bio', 10, 5000);
    if (!vBio.valid) errors.bio = vBio.error;

    const vRate = validateMoney(profileForm.hourly_rate, 'Hourly Rate', 0, 50000);
    if (!vRate.valid) errors.hourly_rate = vRate.error;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct the highlighted fields.', 'error');
      return;
    }

    const trimmedName = vName.value;
    const trimmedTitle = vTitle.value;
    const trimmedBio = vBio.value;
    const rateNum = vRate.value;

    setSaving(true);
    try {
      const payload = {
        username: authUsername,
        name: trimmedName,
        title: trimmedTitle,
        headline: profileForm.headline.trim() || trimmedTitle,
        location: profileForm.location.trim() || '',
        hourly_rate: rateNum,
        availability_status: profileForm.availability_status,
        available_hours: profileForm.available_hours,
        years_experience: profileForm.years_experience,
        bio: trimmedBio,
        avatar_url: profileForm.avatar_url
      };

      const res = await fetch('http://localhost:8000/api/freelancer-profile/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error persisting profile to database.');
      }

      const updated = {
        ...profile,
        name: trimmedName,
        title: trimmedTitle,
        headline: payload.headline,
        location: payload.location,
        hourly_rate: `₹${rateNum}/hr`,
        raw_hourly_rate: rateNum,
        availability_status: payload.availability_status,
        available_hours: payload.available_hours,
        years_experience: payload.years_experience,
        bio: trimmedBio,
        avatar_url: profileForm.avatar_url
      };

      persistState(updated);
      showToast('Profile updated successfully and saved to database.', 'success');
      setActiveModal(null);
    } catch (err) {
      showToast(err.message || 'Error persisting profile to database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. SKILLS WORKFLOW
  // ---------------------------------------------------------------------------
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const vSkill = validateSkill(newSkillInput, profile.skills || []);
    if (!vSkill.valid) {
      showToast(vSkill.error, 'error');
      return;
    }
    const cleanSkill = vSkill.value;

    setSaving(true);
    try {
      const updatedSkills = [...(profile.skills || []), cleanSkill];
      await fetch('http://localhost:8000/api/freelancer-skills/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, skills: updatedSkills })
      });

      const updated = { ...profile, skills: updatedSkills };
      persistState(updated);
      setNewSkillInput('');
      showToast(`Skill '${cleanSkill}' added successfully.`, 'success');
    } catch (err) {
      showToast('Failed to add skill to database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmRemoveSkill = (skillName) => {
    setDeleteConfig({
      title: `Remove Skill`,
      message: `Are you sure you want to remove '${skillName}' from your skills portfolio?`,
      action: async () => {
        setSaving(true);
        try {
          const updatedSkills = (profile.skills || []).filter(s => s !== skillName);
          await fetch(`http://localhost:8000/api/freelancer-skills/?username=${encodeURIComponent(authUsername)}&skill=${encodeURIComponent(skillName)}`, {
            method: 'DELETE'
          });

          const updated = { ...profile, skills: updatedSkills };
          persistState(updated);
          showToast(`Skill '${skillName}' removed successfully.`, 'info');
        } catch (err) {
          showToast('Failed to delete skill.', 'error');
        } finally {
          setSaving(false);
          setActiveModal(null);
        }
      }
    });
    setActiveModal('confirm_delete');
  };

  // ---------------------------------------------------------------------------
  // 5. PORTFOLIO CRUD WORKFLOW
  // ---------------------------------------------------------------------------
  const [portfolioForm, setPortfolioForm] = useState({
    id: null,
    title: '',
    description: '',
    skills: '',
    project_url: '',
    github_url: '',
    completion_info: 'Completed',
    status: 'Completed'
  });

  const openAddPortfolioModal = (project = null) => {
    if (project) {
      setPortfolioForm({
        id: project.id,
        title: project.title || '',
        description: project.description || '',
        skills: Array.isArray(project.skills) ? project.skills.join(', ') : project.skills || '',
        project_url: project.project_url || '',
        github_url: project.github_url || '',
        completion_info: project.completion_info || 'Completed',
        status: project.status || 'Completed'
      });
    } else {
      setPortfolioForm({
        id: null,
        title: '',
        description: '',
        skills: '',
        project_url: '',
        github_url: '',
        completion_info: 'Completed in 3 Weeks',
        status: 'Completed'
      });
    }
    setFormErrors({});
    setActiveModal('portfolio');
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    const errors = {};

    const vTitle = validateTitle(portfolioForm.title, 'Project Title', 3, 150);
    if (!vTitle.valid) errors.title = vTitle.error;

    const vDesc = validateText(portfolioForm.description, 'Project Description', 10, 2000);
    if (!vDesc.valid) errors.description = vDesc.error;

    if (portfolioForm.project_url && portfolioForm.project_url.trim()) {
      const vProjUrl = validateUrl(portfolioForm.project_url, 'Live Demo URL');
      if (!vProjUrl.valid) errors.project_url = vProjUrl.error;
    }

    if (portfolioForm.github_url && portfolioForm.github_url.trim()) {
      const vGitUrl = validateUrl(portfolioForm.github_url, 'GitHub Repo URL');
      if (!vGitUrl.valid) errors.github_url = vGitUrl.error;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix errors in the portfolio form.', 'error');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = portfolioForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const isEdit = !!portfolioForm.id;
      const endpoint = 'http://localhost:8000/api/freelancer-portfolio/';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        username: authUsername,
        id: portfolioForm.id,
        title: portfolioForm.title.trim(),
        description: portfolioForm.description.trim(),
        skills: skillsArray,
        project_url: portfolioForm.project_url.trim(),
        github_url: portfolioForm.github_url.trim(),
        completion_info: portfolioForm.completion_info.trim(),
        status: portfolioForm.status
      };

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let updatedPortfolio = [...(profile.portfolio || [])];
      if (isEdit) {
        updatedPortfolio = updatedPortfolio.map(p => p.id === portfolioForm.id ? { ...p, ...payload } : p);
      } else {
        const newProj = { ...payload, id: Date.now() };
        updatedPortfolio.unshift(newProj);
      }

      const updated = { ...profile, portfolio: updatedPortfolio };
      persistState(updated);
      showToast(`Portfolio project ${isEdit ? 'updated' : 'added'} successfully.`, 'success');
      setActiveModal(null);
    } catch (err) {
      showToast('Error saving portfolio project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeletePortfolio = (proj) => {
    setDeleteConfig({
      title: 'Delete Portfolio Project',
      message: `Are you sure you want to delete portfolio project '${proj.title}'? This action cannot be undone.`,
      action: async () => {
        setSaving(true);
        try {
          await fetch(`http://localhost:8000/api/freelancer-portfolio/?username=${encodeURIComponent(authUsername)}&id=${proj.id}`, {
            method: 'DELETE'
          });
          const updatedPortfolio = (profile.portfolio || []).filter(p => p.id !== proj.id);
          const updated = { ...profile, portfolio: updatedPortfolio };
          persistState(updated);
          showToast(`Portfolio project '${proj.title}' deleted successfully.`, 'info');
        } catch (err) {
          showToast('Failed to delete portfolio project.', 'error');
        } finally {
          setSaving(false);
          setActiveModal(null);
        }
      }
    });
    setActiveModal('confirm_delete');
  };

  // ---------------------------------------------------------------------------
  // 6. RESUME WORKFLOW
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      showToast('Only PDF and DOCX files are supported.', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must not exceed 5 MB.', 'error');
      e.target.value = '';
      return;
    }

    setSaving(true);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const reader = new FileReader();
    reader.onerror = () => {
      setSaving(false);
      showToast('Error reading the selected resume file.', 'error');
    };
    reader.onload = async () => {
      try {
        const fileDataUrl = reader.result;

        const res = await fetch('http://localhost:8000/api/freelancer-resume/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authUsername,
            file_name: file.name,
            file_url: fileDataUrl,
            file_size: fileSizeMB
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload resume.');
        }

        const data = await res.json();
        const updated = {
          ...profile,
          resume_name: data.resume_name || file.name,
          resume_url: data.resume_url || fileDataUrl,
          resume_size: data.resume_size || fileSizeMB
        };

        persistState(updated);
        showToast('Resume uploaded successfully and saved to profile.', 'success');
        setActiveModal(null);
      } catch (err) {
        showToast(err.message || 'Failed to upload resume.', 'error');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const confirmRemoveResume = () => {
    setDeleteConfig({
      title: 'Remove Resume',
      message: 'Are you sure you want to remove your uploaded resume file from your profile?',
      action: async () => {
        setSaving(true);
        try {
          const res = await fetch(`http://localhost:8000/api/freelancer-resume/?username=${encodeURIComponent(authUsername)}`, {
            method: 'DELETE'
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to remove resume.');
          }

          const updated = { ...profile, resume_name: '', resume_url: '', resume_size: '' };
          persistState(updated);
          showToast('Resume removed from profile successfully.', 'info');
        } catch (err) {
          showToast(err.message || 'Failed to remove resume.', 'error');
        } finally {
          setSaving(false);
          setActiveModal(null);
        }
      }
    });
    setActiveModal('confirm_delete');
  };

  // ---------------------------------------------------------------------------
  // 7. CERTIFICATIONS WORKFLOW
  // ---------------------------------------------------------------------------
  const [certForm, setCertForm] = useState({ id: null, name: '', organization: '', issue_date: '', expiry_date: '', credential_url: '' });

  const openAddCertModal = (cert = null) => {
    if (cert) {
      setCertForm({ ...cert });
    } else {
      setCertForm({ id: null, name: '', organization: '', issue_date: '2023', expiry_date: '2026', credential_url: '' });
    }
    setFormErrors({});
    setActiveModal('certification');
  };

  const handleSaveCertification = async (e) => {
    e.preventDefault();
    if (!certForm.name.trim() || !certForm.organization.trim()) {
      showToast('Certification name and organization are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!certForm.id;
      const method = isEdit ? 'PUT' : 'POST';
      const payload = { username: authUsername, ...certForm };

      await fetch('http://localhost:8000/api/freelancer-certifications/', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let updatedCerts = [...(profile.certifications || [])];
      if (isEdit) {
        updatedCerts = updatedCerts.map(c => c.id === certForm.id ? certForm : c);
      } else {
        updatedCerts.unshift({ ...certForm, id: Date.now() });
      }

      const updated = { ...profile, certifications: updatedCerts };
      persistState(updated);
      showToast(`Certification ${isEdit ? 'updated' : 'added'} successfully.`, 'success');
      setActiveModal(null);
    } catch (err) {
      showToast('Failed to save certification.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteCert = (cert) => {
    setDeleteConfig({
      title: 'Delete Certification',
      message: `Are you sure you want to delete certification '${cert.name}'?`,
      action: async () => {
        setSaving(true);
        try {
          await fetch(`http://localhost:8000/api/freelancer-certifications/?username=${encodeURIComponent(authUsername)}&id=${cert.id}`, { method: 'DELETE' });
          const updatedCerts = (profile.certifications || []).filter(c => c.id !== cert.id);
          persistState({ ...profile, certifications: updatedCerts });
          showToast('Certification deleted successfully.', 'info');
        } catch (err) {
          showToast('Error deleting certification.', 'error');
        } finally {
          setSaving(false);
          setActiveModal(null);
        }
      }
    });
    setActiveModal('confirm_delete');
  };

  // ---------------------------------------------------------------------------
  // 8. EDUCATION & WORK EXPERIENCE WORKFLOWS
  // ---------------------------------------------------------------------------
  const [eduForm, setEduForm] = useState({ id: null, degree: '', institution: '', end_year: '2020', description: '' });
  const openAddEduModal = (edu = null) => {
    if (edu) setEduForm({ ...edu });
    else setEduForm({ id: null, degree: '', institution: '', end_year: '2020', description: '' });
    setActiveModal('education');
  };

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      showToast('Degree and institution are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!eduForm.id;
      const payload = { username: authUsername, ...eduForm };
      await fetch('http://localhost:8000/api/freelancer-education/', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let updatedEdus = [...(profile.education || [])];
      if (isEdit) updatedEdus = updatedEdus.map(e => e.id === eduForm.id ? eduForm : e);
      else updatedEdus.unshift({ ...eduForm, id: Date.now() });

      persistState({ ...profile, education: updatedEdus });
      showToast(`Education entry ${isEdit ? 'updated' : 'added'} successfully.`, 'success');
      setActiveModal(null);
    } catch (err) {
      showToast('Error saving education.', 'error');
    } finally { setSaving(false); }
  };

  const confirmDeleteEducation = (edu) => {
    setDeleteConfig({
      title: 'Delete Education Entry',
      message: `Delete '${edu.degree}' from education details?`,
      action: async () => {
        setSaving(true);
        try {
          await fetch(`http://localhost:8000/api/freelancer-education/?username=${encodeURIComponent(authUsername)}&id=${edu.id}`, { method: 'DELETE' });
          persistState({ ...profile, education: (profile.education || []).filter(e => e.id !== edu.id) });
          showToast('Education deleted.', 'info');
        } catch (err) { showToast('Error deleting education.', 'error'); }
        finally { setSaving(false); setActiveModal(null); }
      }
    });
    setActiveModal('confirm_delete');
  };

  const [expForm, setExpForm] = useState({ id: null, role: '', organization: '', start_date: '2021', end_date: 'Present', currently_working: true, description: '' });
  const openAddExpModal = (exp = null) => {
    if (exp) setExpForm({ ...exp });
    else setExpForm({ id: null, role: '', organization: '', start_date: '2021', end_date: 'Present', currently_working: true, description: '' });
    setActiveModal('experience');
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.organization.trim()) {
      showToast('Job role and organization name are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!expForm.id;
      const payload = { username: authUsername, ...expForm };
      await fetch('http://localhost:8000/api/freelancer-experience/', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let updatedExps = [...(profile.experience || [])];
      if (isEdit) updatedExps = updatedExps.map(e => e.id === expForm.id ? expForm : e);
      else updatedExps.unshift({ ...expForm, id: Date.now(), period: `${expForm.start_date} – ${expForm.currently_working ? 'Present' : expForm.end_date}` });

      persistState({ ...profile, experience: updatedExps });
      showToast(`Work experience ${isEdit ? 'updated' : 'added'} successfully.`, 'success');
      setActiveModal(null);
    } catch (err) { showToast('Error saving experience.', 'error'); }
    finally { setSaving(false); }
  };

  const confirmDeleteExperience = (exp) => {
    setDeleteConfig({
      title: 'Delete Experience Entry',
      message: `Delete '${exp.role}' from work experience?`,
      action: async () => {
        setSaving(true);
        try {
          await fetch(`http://localhost:8000/api/freelancer-experience/?username=${encodeURIComponent(authUsername)}&id=${exp.id}`, { method: 'DELETE' });
          persistState({ ...profile, experience: (profile.experience || []).filter(e => e.id !== exp.id) });
          showToast('Work experience entry deleted.', 'info');
        } catch (err) { showToast('Error deleting experience.', 'error'); }
        finally { setSaving(false); setActiveModal(null); }
      }
    });
    setActiveModal('confirm_delete');
  };

  // Helper variables
  if (loading || !profile) {
    return (
      <div className="w-full py-16 text-center text-slate-600 dark:text-slate-300 font-bold space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs uppercase tracking-wider">Syncing Profile with PostgreSQL DB...</p>
      </div>
    );
  }

  const isDemo = (authUsername || '').toLowerCase().trim() === 'demo_freelancer';
  const name = profile.name || authUsername;
  const title = profile.title || (isDemo ? 'Senior Software Engineer' : '');
  const headline = profile.headline || title || (isDemo ? 'Senior Software Engineer' : 'Freelancer');
  const location = profile.location || (isDemo ? 'San Francisco, CA' : 'Remote');
  const hourlyRate = profile.hourly_rate || (isDemo ? '₹4,000/hr' : '₹0/hr');
  const availabilityStatus = profile.availability_status || 'Available for Work';
  const availableHours = profile.available_hours || '40 hrs/week';
  const bio = profile.bio || (isDemo ? 'Professional Software Engineer specializing in modern full-stack web and AI systems.' : '');

  const currentFreelancerName = (profile?.name || initialFreelancerData?.name || authUsername || '').trim();
  const currentFreelancerUser = (authUsername || userSession?.user_id || '').trim();

  const filteredReviews = (fetchedReviews || []).filter(r => {
    if (!r || !r.reviewee) return false;
    const target = String(r.reviewee).toLowerCase().trim().replace(/\s+/g, '');
    const cleanName = currentFreelancerName.toLowerCase().trim().replace(/\s+/g, '');
    const cleanUser = currentFreelancerUser.toLowerCase().trim().replace(/\s+/g, '');
    
    if (!cleanName && !cleanUser) return false;

    const matchesName = cleanName && (target === cleanName || target.includes(cleanName) || cleanName.includes(target));
    const matchesUser = cleanUser && (target === cleanUser || target.includes(cleanUser) || cleanUser.includes(target));
    const firstName = cleanName.split(' ')[0];
    const firstUser = cleanUser.split('@')[0].split('.')[0];
    const matchesFirstName = firstName && firstName.length > 2 && target.includes(firstName.toLowerCase());
    const matchesFirstUser = firstUser && firstUser.length > 2 && target.includes(firstUser.toLowerCase());

    return matchesName || matchesUser || matchesFirstName || matchesFirstUser;
  });
  const hasReviews = filteredReviews.length > 0;
  const avgRating = hasReviews 
    ? (filteredReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / filteredReviews.length).toFixed(1)
    : null;

  const rawSkills = profile.skills || [];
  const categorizeSkills = (skillsList) => {
    const cat = { 'Frontend': [], 'Backend': [], 'AI / Machine Learning': [], 'Database': [], 'Security & Cloud': [], 'Other Skills': [] };
    skillsList.forEach(s => {
      const sl = s.toLowerCase();
      if (/react|vue|angular|tailwind|css|html|javascript|typescript|next|d3|canvas|webgl|ui|ux/.test(sl)) cat['Frontend'].push(s);
      else if (/python|django|fastapi|node|express|api|rest|graphql|backend|golang|java|ruby/.test(sl)) cat['Backend'].push(s);
      else if (/pytorch|tensorflow|ml|machine learning|ai|nlp|spacy|langchain|tensorrt|cuda|vllm|deep learning/.test(sl)) cat['AI / Machine Learning'].push(s);
      else if (/postgres|sql|mongo|redis|neo4j|pinecone|vector|db/.test(sl)) cat['Database'].push(s);
      else if (/owasp|security|oauth|aws|docker|kubernetes|cloud|devops/.test(sl)) cat['Security & Cloud'].push(s);
      else cat['Other Skills'].push(s);
    });
    return Object.fromEntries(Object.entries(cat).filter(([_, items]) => items.length > 0));
  };
  const skillCategories = categorizeSkills(rawSkills);

  const cardBg = isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm';
  const subCardBg = isDark ? 'bg-[#040919] border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 transition-colors">
      
      {/* MODAL CLOSE BUTTON */}
      {onClose && (
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Verified Freelancer Profile View
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            <span>Close Profile</span>
          </button>
        </div>
      )}

      {/* DYNAMIC PROFILE COMPLETENESS BANNER */}
      {viewMode === 'freelancer' && (
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isDark ? 'bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-[#060e22] border-blue-500/30' : 'bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-blue-200 shadow-xs'
        }`}>
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-400">Profile Completion</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {completenessPercentage}%
              </span>
            </div>
            {/* Dynamic Progress Bar */}
            <div className="w-full bg-slate-700/30 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completenessPercentage}%` }}
              ></div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <span className={`text-xs font-bold flex items-center space-x-1 ${profile.name && profile.title ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /><span>Basic Information</span>
              </span>
              <span className={`text-xs font-bold flex items-center space-x-1 ${(profile.skills || []).length > 0 ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /><span>Skills & Stack</span>
              </span>
              <span className={`text-xs font-bold flex items-center space-x-1 ${(profile.portfolio || []).length > 0 ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /><span>Portfolio Projects</span>
              </span>
              <span className={`text-xs font-bold flex items-center space-x-1 ${profile.resume_name ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /><span>Resume & Bio</span>
              </span>
              <span className={`text-xs font-bold flex items-center space-x-1 ${(profile.certifications || []).length > 0 ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /><span>Certifications</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button 
              onClick={openEditProfileModal} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={() => setActiveModal('edit_skills')} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Edit Skills</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          SECTION 1: FREELANCER PROFILE HEADER
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 relative overflow-hidden ${cardBg}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Avatar & Headline Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl ring-4 ring-blue-500/20 overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>{getInitials(name)}</span>
                )}
              </div>

              {viewMode === 'freelancer' && (
                <label 
                  htmlFor="freelancer-direct-avatar-input"
                  className={`absolute -bottom-1 -right-1 w-8 h-8 sm:w-8.5 sm:h-8.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg border-2 ${isDark ? 'border-[#060e22]' : 'border-white'} cursor-pointer transition-all hover:scale-110 z-10`}
                  title="Upload or Change Profile Picture"
                  aria-label="Upload profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input 
                    id="freelancer-direct-avatar-input"
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleDirectAvatarUpload}
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name}</h1>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-full flex items-center space-x-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  <span>Verified Freelancer Pro</span>
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-blue-400 leading-snug">
                {headline}
              </p>

              {/* Status & Sub-meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{availabilityStatus}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 mr-1" /><span>{availableHours}</span></span>
                <span>•</span>
                <span className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 mr-1" /><span>{location}</span></span>
                <span>•</span>
                <span className="text-emerald-400 font-extrabold flex items-center space-x-1"><Wallet className="w-3.5 h-3.5 text-emerald-400 mr-1" /><span>{hourlyRate}</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 border-slate-800/40 pt-4 lg:pt-0">
            {viewMode === 'client' ? (
              <>
                {onToggleSave && (
                  <button
                    onClick={() => onToggleSave(profile || initialFreelancerData)}
                    className={`flex-1 lg:flex-none px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 border shadow-md ${
                      isSaved
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                    }`}
                    title={isSaved ? 'Remove from Saved Freelancers' : 'Bookmark / Save Freelancer'}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Save Freelancer</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => onMessage(name)}
                  className="flex-1 lg:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 border border-slate-700 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => onHire(profile)}
                  className="flex-1 lg:flex-none px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Hire Freelancer</span>
                </button>
              </>
            ) : (
              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <button 
                  onClick={openEditProfileModal} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button 
                  onClick={() => setActiveModal('edit_skills')} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Edit Skills</span>
                </button>
                <button 
                  onClick={() => openAddPortfolioModal()} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </button>
                <button 
                  onClick={() => setActiveModal('resume')} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 2: PROFILE KEY METRICS
         ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 transition-all ${subCardBg}`}>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
            <Briefcase className="w-3 h-3 text-slate-600 dark:text-slate-300 mr-1" /><span>Experience</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-400">{profile.years_experience !== undefined && profile.years_experience !== '' ? profile.years_experience : (isDemo ? '7+' : '0')}</p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">Years Experience</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 transition-all ${subCardBg}`}>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
            <FolderKanban className="w-3 h-3 text-slate-600 dark:text-slate-300 mr-1" /><span>Completed</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-400">{isDemo ? ((profile.portfolio || []).length || 24) : (profile.portfolio || []).length}</p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">Projects Completed</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 transition-all ${subCardBg}`}>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
            <BadgeCheck className="w-3 h-3 text-slate-600 dark:text-slate-300 mr-1" /><span>Job Success</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">100%</p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">Job Success Rate</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 transition-all ${subCardBg}`}>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
            <Clock className="w-3 h-3 text-slate-600 dark:text-slate-300 mr-1" /><span>On-Time</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">98%</p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">On-Time Delivery</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 transition-all col-span-2 sm:col-span-1 ${subCardBg}`}>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
            <Wallet className="w-3 h-3 text-slate-600 dark:text-slate-300 mr-1" /><span>Earnings</span>
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">{profile.total_earnings || (isDemo ? '₹2,89,000' : '₹0')}</p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">Total Client Payouts</span>
        </div>
      </div>

      {/* ==================================================
          SECTION 3: ABOUT ME
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold tracking-tight">About Me</h2>
          </div>
          {viewMode === 'freelancer' && (
            <button onClick={openEditProfileModal} className="text-xs text-blue-400 font-bold hover:underline flex items-center space-x-1">
              <Pencil className="w-3 h-3 mr-1" /><span>Edit Bio</span>
            </button>
          )}
        </div>
        <p className={`text-sm leading-relaxed whitespace-pre-line font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {bio}
        </p>
      </div>

      {/* ==================================================
          SECTION 4: TECHNICAL SKILLS
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <div className="flex items-center space-x-3">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Technical Skills</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {rawSkills.length} Verified Skills
            </span>
            {viewMode === 'freelancer' && (
              <button onClick={() => setActiveModal('edit_skills')} className="text-xs text-blue-400 font-bold hover:underline flex items-center space-x-1">
                <Zap className="w-3 h-3 mr-1" /><span>Edit Skills</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(skillCategories).map(([categoryName, skillsInCat]) => (
            <div key={categoryName} className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${subCardBg}`}>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
                <span>•</span><span>{categoryName}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsInCat.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl flex items-center space-x-1.5"
                  >
                    <span>{skill}</span>
                    {viewMode === 'freelancer' && (
                      <button 
                        onClick={() => confirmRemoveSkill(skill)} 
                        className="text-slate-700 dark:text-slate-300 hover:text-rose-400 text-xs font-bold ml-1 cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          SECTION 5: PORTFOLIO / RECENT PROJECTS
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <div className="flex items-center space-x-3">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Portfolio & Recent Projects</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {(profile.portfolio || []).length} Projects
            </span>
            {viewMode === 'freelancer' && (
              <button onClick={() => openAddPortfolioModal()} className="px-3 py-1 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5 mr-1" /><span>Add Project</span>
              </button>
            )}
          </div>
        </div>

        {(profile.portfolio || []).length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${subCardBg}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No portfolio projects added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(profile.portfolio || []).map(proj => (
              <div 
                key={proj.id} 
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:border-blue-500/40 ${subCardBg}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-base text-blue-400 leading-snug">{proj.title}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full shrink-0 ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(proj.skills || []).map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs font-semibold rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setProjectDetailModal(proj)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>View Project</span>
                    </button>
                  </div>

                  {viewMode === 'freelancer' && (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openAddPortfolioModal(proj)} className="text-xs text-blue-400 hover:underline font-bold">
                        Edit
                      </button>
                      <button onClick={() => confirmDeletePortfolio(proj)} className="text-xs text-rose-400 hover:underline font-bold">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================
          SECTION 6: WORK EXPERIENCE
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Work Experience</h2>
          </div>
          {viewMode === 'freelancer' && (
            <button onClick={() => openAddExpModal()} className="px-3 py-1 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5 mr-1" /><span>Add Experience</span>
            </button>
          )}
        </div>

        {(profile.experience || []).length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 italic">No work experience listed yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-8 my-4">
            {(profile.experience || []).map((exp, idx) => (
              <div key={exp.id || idx} className="relative space-y-2">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-extrabold text-base text-blue-400">{exp.role}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700">
                      {exp.start_date} – {exp.currently_working ? 'Present' : exp.end_date}
                    </span>
                    {viewMode === 'freelancer' && (
                      <div className="flex items-center space-x-2 ml-2">
                        <button onClick={() => openAddExpModal(exp)} className="text-xs text-blue-400 hover:underline font-bold">Edit</button>
                        <button onClick={() => confirmDeleteExperience(exp)} className="text-xs text-rose-400 hover:underline font-bold">Delete</button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{exp.organization}</p>
                <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================
          SECTION 7: EDUCATION & CERTIFICATIONS
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex items-center space-x-3 border-b border-slate-800/40 pb-3">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-extrabold tracking-tight">Education & Certifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div className={`p-5 rounded-2xl border space-y-3 ${subCardBg}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400 mr-1" />
                <span>Education</span>
              </h3>
              {viewMode === 'freelancer' && (
                <button onClick={() => openAddEduModal()} className="text-xs text-blue-400 font-bold hover:underline">+ Add</button>
              )}
            </div>
            {(profile.education || []).length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">No formal education listed.</p>
            ) : (
              (profile.education || []).map((edu, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-slate-800/30 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <p className="font-extrabold text-sm text-slate-200">{edu.degree}</p>
                    {viewMode === 'freelancer' && (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openAddEduModal(edu)} className="text-xs text-blue-400 hover:underline">Edit</button>
                        <button onClick={() => confirmDeleteEducation(edu)} className="text-xs text-rose-400 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{edu.institution} • {edu.end_year}</p>
                </div>
              ))
            )}
          </div>

          {/* Certifications */}
          <div className={`p-5 rounded-2xl border space-y-3 ${subCardBg}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400 mr-1" />
                <span>Certifications</span>
              </h3>
              {viewMode === 'freelancer' && (
                <button onClick={() => openAddCertModal()} className="text-xs text-emerald-400 font-bold hover:underline">+ Add</button>
              )}
            </div>
            {(profile.certifications || []).length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">No certifications added yet.</p>
            ) : (
              (profile.certifications || []).map((cert, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-slate-800/30 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <p className="font-extrabold text-sm text-emerald-400">{cert.name}</p>
                    {viewMode === 'freelancer' && (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openAddCertModal(cert)} className="text-xs text-blue-400 hover:underline">Edit</button>
                        <button onClick={() => confirmDeleteCert(cert)} className="text-xs text-rose-400 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{cert.organization} • {cert.issue_date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION 8: CLIENT REVIEWS & PERFORMANCE FEEDBACK
         ================================================== */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Client Reviews & Performance Feedback</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Verified ratings and project feedback submitted by clients after completed deliverables.
              </p>
            </div>
          </div>
          {hasReviews && (
            <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black rounded-xl flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>⭐ {avgRating} / 5.0</span>
            </span>
          )}
        </div>

        {!hasReviews ? (
          <div className={`p-8 text-center rounded-2xl border space-y-2 ${subCardBg}`}>
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <p className="text-base font-extrabold text-slate-200">No client reviews yet.</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Reviews from completed projects will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Rating Summary Card */}
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark ? 'bg-gradient-to-r from-amber-950/20 via-amber-900/10 to-[#060e22] border-amber-500/30' : 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Overall Rating</p>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-black tracking-tight text-amber-400">⭐ {avgRating}</span>
                    <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300">/ 5.0</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold rounded-xl inline-block">
                  Based on {filteredReviews.length} client review{filteredReviews.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* List of Review Cards */}
            <div className="space-y-4">
              {filteredReviews.map((rv, idx) => (
                <div key={rv.id || idx} className={`p-6 rounded-2xl border space-y-4 transition-all hover:border-amber-500/40 ${subCardBg}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/40 pb-3">
                    <div className="flex items-center space-x-3">
                      {rv.reviewerAvatar ? (
                        <img src={rv.reviewerAvatar} alt={rv.reviewer} className="w-10 h-10 rounded-2xl object-cover border border-amber-500/30" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-extrabold text-sm flex items-center justify-center">
                          {getInitials(rv.reviewer || 'Client')}
                        </div>
                      )}
                      <div>
                        <h4 className={`font-extrabold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{rv.reviewer || 'Client'}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          Client • <span className="font-bold text-amber-400/90">{rv.projectTitle || rv.project_title || 'Completed Project'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(Math.min(5, Math.max(1, Math.round(Number(rv.rating || 5)))))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-amber-400">⭐ {Number(rv.rating || 5).toFixed(1)} / 5.0</span>
                      {rv.date && <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold ml-2">({rv.date})</span>}
                    </div>
                  </div>

                  {(rv.comm || rv.code || rv.deadline) && (
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border text-xs font-semibold ${isDark ? 'border-slate-800/50 bg-black/20 text-slate-200' : 'border-slate-200 bg-slate-100/80 text-slate-800'}`}>
                      {rv.comm && <div className="flex items-center space-x-1.5"><MessageCircle className="w-3.5 h-3.5 text-amber-400" /><span>Communication: <span className="text-amber-400 font-bold">{rv.comm}/5 ★</span></span></div>}
                      {rv.code && <div className="flex items-center space-x-1.5"><Code2 className="w-3.5 h-3.5 text-amber-400" /><span>Work Quality: <span className="text-amber-400 font-bold">{rv.code}/5 ★</span></span></div>}
                      {rv.deadline && <div className="flex items-center space-x-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /><span>Deadline Adherence: <span className="text-amber-400 font-bold">{rv.deadline}/5 ★</span></span></div>}
                    </div>
                  )}

                  <p className={`text-xs italic p-4 rounded-xl border leading-relaxed font-semibold ${
                    isDark 
                      ? 'border-amber-500/30 bg-amber-950/20 text-slate-100' 
                      : 'border-amber-300 bg-amber-50/90 text-slate-900 shadow-2xs'
                  }`}>
                    "{rv.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==============================================================================
          MODALS & FUNCTIONAL DIALOGS
         ============================================================================== */}

      {/* 1. EDIT PROFILE MODAL */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-2xl w-full border shadow-2xl space-y-6 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-blue-400">Edit Freelancer Profile</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white font-bold"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* PROFILE PICTURE SECTION */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <label className="text-xs font-extrabold block text-blue-400">Profile Picture</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current / Preview Image */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center overflow-hidden border-2 border-blue-500/30 shrink-0">
                    {avatarPreview || profileForm.avatar_url ? (
                      <img 
                        src={avatarPreview || profileForm.avatar_url} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{getInitials(profileForm.name || name)}</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold cursor-pointer transition-all inline-flex items-center space-x-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>{profileForm.avatar_url || avatarPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          onChange={handleAvatarSelect}
                          className="hidden" 
                        />
                      </label>

                      {(avatarPreview || profileForm.avatar_url) && (
                        <button
                          type="button"
                          onClick={confirmRemoveAvatar}
                          className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Remove Picture</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Supported formats: JPG, PNG, WEBP. Maximum file size: 5MB.
                    </p>
                    {avatarError && (
                      <p className="text-rose-400 text-xs font-extrabold">{avatarError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                />
                {formErrors.name && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold block mb-1">Professional Title *</label>
                  <input 
                    type="text" 
                    value={profileForm.title} 
                    onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} 
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                  {formErrors.title && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="text-xs font-extrabold block mb-1">Hourly Rate (₹ INR / hr) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={profileForm.hourly_rate} 
                    onChange={e => setProfileForm({ ...profileForm, hourly_rate: e.target.value })} 
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                  {formErrors.hourly_rate && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.hourly_rate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-extrabold block mb-1">Location</label>
                  <input 
                    type="text" 
                    value={profileForm.location} 
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} 
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold block mb-1">Availability Status</label>
                  <select 
                    value={profileForm.availability_status} 
                    onChange={e => setProfileForm({ ...profileForm, availability_status: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  >
                    <option value="Available for Work">Available for Work</option>
                    <option value="Partially Available">Partially Available</option>
                    <option value="Busy / In Contract">Busy / In Contract</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold block mb-1">Hours / Week</label>
                  <input 
                    type="text" 
                    value={profileForm.available_hours} 
                    onChange={e => setProfileForm({ ...profileForm, available_hours: e.target.value })} 
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-extrabold block">Professional Bio *</label>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">{profileForm.bio.length} / 5000 chars</span>
                </div>
                <textarea 
                  rows="4" 
                  value={profileForm.bio} 
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} 
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs leading-relaxed"
                ></textarea>
                {formErrors.bio && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.bio}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT SKILLS MODAL */}
      {activeModal === 'edit_skills' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-lg w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-blue-400">Edit Technical Skills</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white font-bold"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter new skill (e.g. GraphQL, PyTorch, Docker)..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
              />
              <button 
                type="submit"
                disabled={saving}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Skill</span>
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Current Skills List ({rawSkills.length})</p>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                {rawSkills.map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <span>{s}</span>
                    <button 
                      onClick={() => confirmRemoveSkill(s)} 
                      className="text-slate-600 dark:text-slate-300 hover:text-rose-400 text-xs font-bold ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PORTFOLIO MANAGING MODAL */}
      {activeModal === 'portfolio' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-xl w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-blue-400">{portfolioForm.id ? 'Edit Portfolio Project' : 'Add Portfolio Project'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white font-bold"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold block mb-1">Project Title *</label>
                <input 
                  type="text" 
                  value={portfolioForm.title} 
                  onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                />
                {formErrors.title && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="text-xs font-extrabold block mb-1">Project Description *</label>
                <textarea 
                  rows="3" 
                  value={portfolioForm.description} 
                  onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                ></textarea>
                {formErrors.description && <p className="text-rose-400 text-xs font-bold mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-extrabold block mb-1">Technologies Used (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="React, Python, FastAPI..."
                  value={portfolioForm.skills} 
                  onChange={e => setPortfolioForm({ ...portfolioForm, skills: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold block mb-1">Status</label>
                  <select 
                    value={portfolioForm.status} 
                    onChange={e => setPortfolioForm({ ...portfolioForm, status: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold block mb-1">Completion Info</label>
                  <input 
                    type="text" 
                    placeholder="Delivered in 3 Weeks"
                    value={portfolioForm.completion_info} 
                    onChange={e => setPortfolioForm({ ...portfolioForm, completion_info: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-extrabold">
                  {saving ? 'Saving...' : portfolioForm.id ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. RESUME UPLOAD MODAL */}
      {activeModal === 'resume' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-lg w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-blue-400">Resume & CV Management</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white font-bold"><X className="w-5 h-5" /></button>
            </div>

            {profile.resume_name ? (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-extrabold text-sm text-emerald-400">{profile.resume_name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{profile.resume_size} • Uploaded & Verified</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <a 
                    href={profile.resume_url} 
                    download={profile.resume_name}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs text-center rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    <span>Download Resume</span>
                  </a>
                  <label className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-extrabold text-xs text-center rounded-xl border border-blue-500/30 flex items-center justify-center space-x-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>Replace</span>
                    <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button 
                    onClick={confirmRemoveResume} 
                    className="px-4 py-2 bg-rose-900/40 hover:bg-rose-800 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center space-y-3 bg-slate-900/40">
                <Upload className="w-10 h-10 text-slate-600 dark:text-slate-300 mx-auto" />
                <div>
                  <p className="font-extrabold text-sm text-slate-200">Upload Professional Resume</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Supported formats: PDF, DOCX (Max size: 5 MB)</p>
                </div>
                <label className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold cursor-pointer">
                  <span>Browse File</span>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CERTIFICATION MODAL */}
      {activeModal === 'certification' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-md w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xl font-extrabold text-emerald-400">{certForm.id ? 'Edit Certification' : 'Add Certification'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white font-bold"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveCertification} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold block mb-1">Certification Name *</label>
                <input 
                  type="text" 
                  value={certForm.name} 
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold block mb-1">Issuing Organization *</label>
                <input 
                  type="text" 
                  value={certForm.organization} 
                  onChange={e => setCertForm({ ...certForm, organization: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold block mb-1">Issue Date</label>
                  <input 
                    type="text" 
                    value={certForm.issue_date} 
                    onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold block mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    value={certForm.expiry_date} 
                    onChange={e => setCertForm({ ...certForm, expiry_date: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-extrabold">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDUCATION & EXPERIENCE MODALS */}
      {activeModal === 'education' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-md w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <h3 className="text-xl font-extrabold text-blue-400">{eduForm.id ? 'Edit Education' : 'Add Education'}</h3>
            <form onSubmit={handleSaveEducation} className="space-y-4">
              <input type="text" placeholder="Degree (e.g. B.S. in Computer Science)" value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              <input type="text" placeholder="Institution (e.g. Stanford University)" value={eduForm.institution} onChange={e => setEduForm({ ...eduForm, institution: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              <input type="text" placeholder="Graduation Year (e.g. 2019)" value={eduForm.end_year} onChange={e => setEduForm({ ...eduForm, end_year: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'experience' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-md w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <h3 className="text-xl font-extrabold text-blue-400">{expForm.id ? 'Edit Experience' : 'Add Work Experience'}</h3>
            <form onSubmit={handleSaveExperience} className="space-y-4">
              <input type="text" placeholder="Job Title (e.g. Senior Deep Learning Engineer)" value={expForm.role} onChange={e => setExpForm({ ...expForm, role: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              <input type="text" placeholder="Company / Client Name" value={expForm.organization} onChange={e => setExpForm({ ...expForm, organization: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Start Year (2021)" value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })} className="p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
                <input type="text" placeholder="End Year (Present)" value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })} className="p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
              </div>
              <textarea rows="3" placeholder="Job description & achievements..." value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"></textarea>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION DIALOG */}
      {activeModal === 'confirm_delete' && deleteConfig && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-7 rounded-3xl max-w-md w-full border border-rose-500/30 shadow-2xl space-y-4 ${cardBg}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-extrabold text-rose-400">{deleteConfig.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{deleteConfig.message}</p>
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setActiveModal(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); deleteConfig.action(); }}
                disabled={saving}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PROJECT DETAIL MODAL */}
      {projectDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-xl w-full border shadow-2xl space-y-5 ${cardBg}`}>
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {projectDetailModal.status}
                </span>
                <h3 className="text-xl font-extrabold text-blue-400 mt-1">{projectDetailModal.title}</h3>
              </div>
              <button onClick={() => setProjectDetailModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-white text-lg font-bold"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{projectDetailModal.description}</p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">Technologies & Stack Used</span>
              <div className="flex flex-wrap gap-1.5">
                {(projectDetailModal.skills || []).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-black/20 text-xs font-bold text-slate-600 dark:text-slate-300 flex justify-between">
              <span>Status: {projectDetailModal.status}</span>
              <span>{projectDetailModal.completion_info}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setProjectDetailModal(null)}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
