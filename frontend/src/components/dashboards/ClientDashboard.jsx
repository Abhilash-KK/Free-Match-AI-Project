import React, { useState, useEffect } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';
import NotificationCenter from '../NotificationCenter';
import MessagingCenter from '../MessagingCenter';
import FreelancerProfileView from '../FreelancerProfileView';
import ClientProfileView from '../ClientProfileView';
import ClientSettingsView from '../ClientSettingsView';
import { fetchNotifications, createNotification } from '../../utils/notificationService';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Inbox,
  Users,
  Star,
  FileText,
  Kanban,
  ShieldCheck,
  MessageSquare,
  Bell,
  Sparkles,
  UserCircle,
  Settings,
  DollarSign,
  Lock,
  Brain,
  TrendingUp,
  Bot,
  Zap,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Layers,
  Wallet,
  Clock,
  Milestone,
  UploadCloud,
  Code,
  Github,
  Send,
  Trash2,
  X,
  GripVertical,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Briefcase
} from 'lucide-react';

const ClientDashboard = ({ userSession, onSignOut }) => {
  const isDark = false;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPostProjectModal, setShowPostProjectModal] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // 1. PROJECT POSTING FORM STATE
  const [projectTitle, setProjectTitle] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [budget, setBudget] = useState('5000');
  const [duration, setDuration] = useState('3 Weeks');
  const [skillsReq, setSkillsReq] = useState('React, Python');
  const [description, setDescription] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [milestoneItems, setMilestoneItems] = useState([
    { id: 1, title: 'Phase 1: Architecture & UI Wireframes', amount: '1000' },
    { id: 2, title: 'Phase 2: Core Development & APIs', amount: '2500' },
    { id: 3, title: 'Phase 3: QA & Final Escrow Release', amount: '1500' }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'Document',
          url: uploadEvent.target.result,
          isImage: isImage
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const DEFAULT_PROJECTS = [
    { id: 'cp1', title: 'AI Pipeline Optimization', client: 'TechStream Corp', category: 'Data Science & AI', budget: '₹12,000', duration: '4 Weeks', skills: 'Python, PyTorch', status: 'In Progress', postedDate: 'Aug 01, 2026', progress: 30, applicants: 8, description: 'Optimize deep learning model training pipelines and automate RESTful API inferences.' },
    { id: 'cp2', title: 'FinTech Dashboard v2', client: 'TechStream Corp', category: 'Software Development', budget: '₹6,500', duration: '3 Weeks', skills: 'React, D3.js', status: 'In Progress', postedDate: 'Aug 02, 2026', progress: 30, applicants: 12, description: 'Implementation of a complex data visualization dashboard for crypto asset management.' },
    { id: 'cp3', title: 'Cybersecurity Audit & Shield', client: 'TechStream Corp', category: 'Cybersecurity', budget: '₹4,200', duration: '2 Weeks', skills: 'PenTesting, Python', status: 'Completed', postedDate: 'Jul 28, 2026', progress: 100, applicants: 5, description: 'Penetration testing and security compliance audit.' },
    { id: 'cp4', title: 'AI Search Engine', client: 'TechStream Corp', category: 'Software Development', budget: '₹8,000', duration: '3 Weeks', skills: 'React, Python, Vector DB', status: 'Open for Bids', postedDate: 'Aug 03, 2026', progress: 0, applicants: 4, description: 'Natural language search engine powered by embedding vector databases.' },
    { id: 'cp5', title: 'AI Customer Support Chatbot', client: 'TechStream Corp', category: 'Data Science & AI', budget: '₹9,500', duration: '3 Weeks', skills: 'Python, LLM, LangChain, React', status: 'Open for Bids', postedDate: 'Just Now', progress: 0, applicants: 6, description: 'RAG-powered customer support assistant with automated document ingestion and vector search.' },
    { id: 'cp6', title: 'Mobile Banking iOS App', client: 'TechStream Corp', category: 'Software Development', budget: '₹14,000', duration: '5 Weeks', skills: 'Swift, iOS, React Native, REST API', status: 'In Progress', postedDate: 'Aug 04, 2026', progress: 30, applicants: 14, description: 'Secure mobile banking application featuring biometric login, instant transfer, and push alerts.' }
  ];

  const currentUserId = (userSession?.username || userSession?.user_id || userSession?.email || userSession?.name || 'guest').toLowerCase().trim();
  const currentUserName = userSession?.name || userSession?.first_name || userSession?.username || 'Client';
  const companyName = userSession?.company || (userSession?.name ? `${userSession.name}'s Enterprise` : 'Enterprise Corp');
  const isDemoUser = currentUserId === 'demo_client';

  const projectStorageKey = `freematch_user_${currentUserId}_projects`;
  const proposalStorageKey = `freematch_user_${currentUserId}_proposals`;
  const contractStorageKey = `freematch_user_${currentUserId}_contracts`;
  const [selectedKanbanProject, setSelectedKanbanProject] = useState('All');

  // Sync Client Projects with LocalStorage
  const [clientProjects, setClientProjects] = useState(() => {
    const saved = localStorage.getItem(projectStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (isDemoUser) {
      localStorage.setItem(projectStorageKey, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return [];
  });

  // Fetch projects live from Django REST Framework PostgreSQL database
  const loadLiveProjects = React.useCallback(() => {
    if (!currentUserId || currentUserId === 'guest') return;
    fetch(`http://localhost:8000/api/projects/?client_id=${encodeURIComponent(currentUserId)}`)
      .then(res => res.json())
      .then(dbProjects => {
        if (Array.isArray(dbProjects)) {
          if (dbProjects.length > 0) {
            setClientProjects(dbProjects);
            localStorage.setItem(projectStorageKey, JSON.stringify(dbProjects));
          } else if (isDemoUser) {
            setClientProjects(DEFAULT_PROJECTS);
            localStorage.setItem(projectStorageKey, JSON.stringify(DEFAULT_PROJECTS));
          } else {
            setClientProjects([]);
            localStorage.setItem(projectStorageKey, JSON.stringify([]));
          }
        }
      })
      .catch(err => console.warn('PostgreSQL fetch notice:', err));
  }, [currentUserId, isDemoUser, projectStorageKey]);

  useEffect(() => {
    loadLiveProjects();
    window.addEventListener('freematch_shared_event', loadLiveProjects);
    window.addEventListener('freematch_kanban_event', loadLiveProjects);
    window.addEventListener('storage', loadLiveProjects);
    window.addEventListener('focus', loadLiveProjects);
    return () => {
      window.removeEventListener('freematch_shared_event', loadLiveProjects);
      window.removeEventListener('freematch_kanban_event', loadLiveProjects);
      window.removeEventListener('storage', loadLiveProjects);
      window.removeEventListener('focus', loadLiveProjects);
    };
  }, [loadLiveProjects]);

  const DEFAULT_PROPOSALS = [
    { id: 'prop_james_1', projectId: 'cp1', projectTitle: 'AI Pipeline Optimization', freelancer: 'James Joe', freelancerName: 'James Joe', avatar: 'JJ', title: 'Senior Full Stack & AI Specialist', rating: 5.0, bid: '₹5,500', bidAmount: '₹5,500', delivery: '2 Weeks', deliveryTime: '2 Weeks', coverLetter: 'I am excited to submit my proposal for your AI project! Experienced in PyTorch inference optimization, Django APIs, and React dashboards.', status: 'Under Review' },
    { id: 'prop_1', projectId: 'cp1', projectTitle: 'AI Pipeline Optimization', freelancer: 'Alex Mercer', avatar: 'AM', title: 'Senior PyTorch & React Architect', rating: 4.9, bid: '₹11,500', delivery: '3 Weeks', coverLetter: 'I have 7+ years optimizing PyTorch inference models for enterprise SaaS backends. Ready to start immediately with daily GitHub syncs.', status: 'Accepted' },
    { id: 'prop_2', projectId: 'cp2', projectTitle: 'FinTech Dashboard v2', freelancer: 'Alex Mercer', avatar: 'AM', title: 'Senior UX Designer & React Developer', rating: 4.9, bid: '₹4,500', delivery: '2 Weeks', coverLetter: 'Ex-Stripe UI engineer specializing in high-frequency financial charts and D3.js real-time websockets.', status: 'Accepted' },
    { id: 'prop_3', projectId: 'cp4', projectTitle: 'AI Search Engine', freelancer: 'Alex Mercer', avatar: 'AM', title: 'Senior UX Designer & React Developer', rating: 4.9, bid: '₹7,000', delivery: '7 Weeks', coverLetter: 'Built vector similarity pipelines using Pinecone and spaCy. Can deliver clean code with 100% test coverage.', status: 'Accepted' },
    { id: 'prop_4', projectId: 'cp5', projectTitle: 'AI Customer Support Chatbot', freelancer: 'Haines jp', avatar: 'HJ', title: 'Senior Full Stack & AI Specialist', rating: 4.8, bid: '₹8,999', delivery: '3 Weeks', coverLetter: 'Experienced in LLM orchestration with LangChain, Pinecone vector stores, and custom OpenAI fine-tuning.', status: 'Accepted' },
    { id: 'prop_5', projectId: 'cp6', projectTitle: 'Mobile Banking iOS App', freelancer: 'Haines jp', avatar: 'HJ', title: 'Senior Full Stack & AI Specialist', rating: 4.8, bid: '₹10,000', delivery: '5 Weeks', coverLetter: 'Specialist in Swift, iOS Native, React Native cross-platform apps with biometric security integrations.', status: 'Accepted' },
    { id: 'prop_6', projectId: 'cp3', projectTitle: 'Cybersecurity Audit & Shield', freelancer: 'Lana Kim', avatar: 'LK', title: 'Cybersecurity Audit Specialist', rating: 5.0, bid: '₹4,200', delivery: '2 Weeks', coverLetter: 'OWASP Certified Penetration Tester. Experienced in scanning SaaS backends, auditing API security, and patch validation.', status: 'Accepted' },
    { id: 'prop_7', projectId: 'cp2', projectTitle: 'FinTech Dashboard v2', freelancer: 'Sarah Chen', avatar: 'SC', title: 'Senior Data Scientist & Frontend Lead', rating: 5.0, bid: '₹6,200', delivery: '2.5 Weeks', coverLetter: 'Specialist in real-time WebSocket market feeds, D3.js interactive chart rendering, and micro-frontend state management.', status: 'Pending' },
    { id: 'prop_8', projectId: 'cp4', projectTitle: 'AI Search Engine', freelancer: 'Lana Kim', avatar: 'LK', title: 'LLM & Vector Search Specialist', rating: 4.9, bid: '₹7,800', delivery: '2 Weeks', coverLetter: 'Expertise in building hybrid keyword & semantic vector search backends using Weaviate and Elasticsearch.', status: 'Pending' },
    { id: 'prop_9', projectId: 'cp5', projectTitle: 'AI Customer Support Chatbot', freelancer: 'Elena Rostova', avatar: 'ER', title: 'NLP & Conversational AI Engineer', rating: 4.9, bid: '₹9,200', delivery: '3 Weeks', coverLetter: 'Built multi-agent customer support bots using LangGraph, Redis session caching, and automated fallback escalation.', status: 'Pending' },
    { id: 'prop_10', projectId: 'cp6', projectTitle: 'Mobile Banking iOS App', freelancer: 'Marcus Vance', avatar: 'MV', title: 'Senior iOS & Security Architect', rating: 4.9, bid: '₹12,500', delivery: '4 Weeks', coverLetter: '10+ years mobile app development. Built fintech banking apps with encrypted SQLite local vaults and biometric hardware auth.', status: 'Pending' },
    { id: 'prop_11', projectId: 'cp7', projectTitle: 'AI Automated PostgreSQL Test', freelancer: 'David K.', avatar: 'DK', title: 'Full Stack & Database Engineer', rating: 4.8, bid: '₹9,500', delivery: '3.5 Weeks', coverLetter: 'Specializing in Django ORM optimization, PostgreSQL query indexing, and automated REST endpoint benchmarking.', status: 'Pending' },
    { id: 'prop_12', projectId: 'cp1', projectTitle: 'AI Pipeline Optimization', freelancer: 'Sophia Patel', avatar: 'SP', title: 'PyTorch & Distributed Compute Lead', rating: 5.0, bid: '₹11,800', delivery: '3 Weeks', coverLetter: 'Expert in PyTorch TensorRT acceleration, vLLM distributed batching, and Docker container GPU profiling.', status: 'Pending' }
  ];

  // 2. APPLICATIONS STATE
  const [proposals, setProposals] = useState(() => {
    let shared = [];
    try {
      const savedShared = localStorage.getItem('freematch_shared_proposals');
      if (savedShared) shared = JSON.parse(savedShared);
    } catch (e) {}

    const saved = localStorage.getItem(proposalStorageKey);
    let localList = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) localList = parsed;
      } catch (e) {}
    }

    if (localList.length === 0 && isDemoUser) {
      localList = DEFAULT_PROPOSALS;
    }

    const combined = [...shared, ...localList];
    const seen = new Set();
    const result = [];
    combined.forEach(p => {
      const key = (p.id || `${p.freelancer}_${p.project}`).toString();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    });

    return result.length > 0 ? result : DEFAULT_PROPOSALS;
  });

  const loadLiveProposals = React.useCallback(() => {
    if (!currentUserId || currentUserId === 'guest') return;

    let sharedProposals = [];
    try {
      const savedShared = localStorage.getItem('freematch_shared_proposals');
      if (savedShared) {
        const parsed = JSON.parse(savedShared);
        if (Array.isArray(parsed)) sharedProposals = parsed;
      }
    } catch (e) {}

    fetch(`http://localhost:8000/api/proposals/?client_id=${encodeURIComponent(currentUserId)}`)
      .then(res => res.json())
      .then(dbProps => {
        let combined = Array.isArray(dbProps) ? [...dbProps] : [];
        if (sharedProposals.length > 0) {
          sharedProposals.forEach(sp => {
            const spName = (sp.freelancer || sp.freelancerName || '').toLowerCase();
            const spProj = (sp.project || sp.projectTitle || '').toLowerCase();
            const exists = combined.some(c => 
              (c.id && c.id === sp.id) ||
              ((c.freelancer || c.freelancerName || '').toLowerCase() === spName && (c.project || c.projectTitle || '').toLowerCase() === spProj)
            );
            if (!exists) {
              combined.unshift({
                ...sp,
                freelancer: sp.freelancer || sp.freelancerName || 'James Joe',
                freelancerName: sp.freelancerName || sp.freelancer || 'James Joe',
                avatar: sp.avatar || 'JJ',
                title: sp.title || sp.freelancerRole || 'Senior Full Stack & AI Specialist',
                rating: sp.rating || 5.0,
                bid: sp.bid || sp.bidAmount || '₹5,500',
                delivery: sp.delivery || sp.deliveryTime || '2 Weeks',
                coverLetter: sp.coverLetter || 'Submitted proposal for AI Project.',
                status: sp.status || 'Under Review'
              });
            }
          });
        }

        if (combined.length > 0) {
          setProposals(combined);
          localStorage.setItem(proposalStorageKey, JSON.stringify(combined));
        } else {
          const savedLocal = localStorage.getItem(proposalStorageKey);
          let localArr = [];
          if (savedLocal) {
            try { localArr = JSON.parse(savedLocal); } catch (e) {}
          }
          let baseList = localArr.length > 0 ? localArr : (isDemoUser ? DEFAULT_PROPOSALS : []);
          if (sharedProposals.length > 0) {
            const mergedMap = new Map();
            sharedProposals.forEach(p => mergedMap.set(p.id || `${p.freelancer}_${p.project}`, p));
            baseList.forEach(p => {
              const k = p.id || `${p.freelancer}_${p.project}`;
              if (!mergedMap.has(k)) mergedMap.set(k, p);
            });
            baseList = Array.from(mergedMap.values());
          }
          setProposals(baseList);
          localStorage.setItem(proposalStorageKey, JSON.stringify(baseList));
        }
      })
      .catch(err => {
        console.warn('Proposals fetch notice:', err);
        const savedLocal = localStorage.getItem(proposalStorageKey);
        let localArr = [];
        if (savedLocal) {
          try { localArr = JSON.parse(savedLocal); } catch (e) {}
        }
        let baseList = localArr.length > 0 ? localArr : (isDemoUser ? DEFAULT_PROPOSALS : []);
        if (sharedProposals.length > 0) {
          const mergedMap = new Map();
          sharedProposals.forEach(p => mergedMap.set(p.id || `${p.freelancer}_${p.project}`, p));
          baseList.forEach(p => {
            const k = p.id || `${p.freelancer}_${p.project}`;
            if (!mergedMap.has(k)) mergedMap.set(k, p);
          });
          baseList = Array.from(mergedMap.values());
        }
        setProposals(baseList);
      });
  }, [currentUserId, isDemoUser, proposalStorageKey, DEFAULT_PROPOSALS]);

  useEffect(() => {
    loadLiveProposals();
    window.addEventListener('freematch_shared_event', loadLiveProposals);
    window.addEventListener('freematch_notification_event', loadLiveProposals);
    window.addEventListener('storage', loadLiveProposals);
    window.addEventListener('focus', loadLiveProposals);
    return () => {
      window.removeEventListener('freematch_shared_event', loadLiveProposals);
      window.removeEventListener('freematch_notification_event', loadLiveProposals);
      window.removeEventListener('storage', loadLiveProposals);
      window.removeEventListener('focus', loadLiveProposals);
    };
  }, [loadLiveProposals]);

  const validProjectTitles = new Set([
    ...clientProjects.map(p => (p.title || '').toLowerCase()),
    ...(isDemoUser ? DEFAULT_PROJECTS.map(p => (p.title || '').toLowerCase()) : []),
    ...proposals.map(p => (p.project || p.projectTitle || '').toLowerCase())
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('All'); // 'All' | 'Pending Review' | 'Hired / Active'
  const [selectedManageProject, setSelectedManageProject] = useState(null);
  const [selectedProjectDetailView, setSelectedProjectDetailView] = useState(null);
  const [selectedProjectApplicationsFilter, setSelectedProjectApplicationsFilter] = useState(null);

  const validProposals = proposals;

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    let str = String(val).trim();
    str = str.replace(/\$/g, '₹').replace(/USD/gi, 'INR');
    if (str.startsWith('₹') && (str.includes(',') || !/\d/.test(str))) return str;
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  const formatHourlyRate = (rate) => {
    if (!rate) return '₹0/hr';
    let str = String(rate).trim().replace(/\$/g, '₹').replace(/USD/gi, 'INR');
    if (str.includes('/hr') || str.includes('/ hr')) {
      const numPart = parseFloat(str.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numPart)) {
        return `₹${numPart.toLocaleString('en-IN')}/hr`;
      }
      return str;
    }
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? '₹0/hr' : `₹${num.toLocaleString('en-IN')}/hr`;
  };

  const getProjectApplicantCount = (project) => {
    const pTitle = (project.title || '').toLowerCase().trim();
    const count = proposals.filter(pr => 
      (pr.projectId && pr.projectId === project.id) ||
      (pr.projectTitle || pr.project || '').toLowerCase().trim() === pTitle
    ).length;
    return count;
  };

  const getProjectProgress = (project) => {
    if (!project) return 0;
    // 1. Primary: Use progress provided directly by backend API/database for this project ID
    if (typeof project.progress === 'number' && !isNaN(project.progress)) {
      return project.progress;
    }
    // 2. Fallback: Calculate from tasks matching this project ID or title
    const pIdStr = String(project.id || '').toLowerCase().trim();
    const pTitleStr = String(project.title || '').toLowerCase().replace(/^deliverable:\s*/i, '').trim();

    const matchedTasks = tasks.filter(t => {
      const tProjId = String(t.projectId || t.project_id || '').toLowerCase().trim();
      const tProjTitle = String(t.project || t.projectTitle || '').toLowerCase().replace(/^deliverable:\s*/i, '').trim();

      if (pIdStr && tProjId && (tProjId === pIdStr || tProjId.replace('proj_', '') === pIdStr.replace('proj_', ''))) {
        return true;
      }
      return tProjTitle === pTitleStr || (pTitleStr && tProjTitle.includes(pTitleStr));
    });

    if (matchedTasks.length > 0) {
      const statuses = new Set(matchedTasks.map(t => t.status));
      if (Array.from(statuses).every(s => s === 'Done' || s === 'Completed')) return 100;
      if (statuses.has('Under Review')) return 60;
      if (statuses.has('In Progress') || Array.from(statuses).some(s => s === 'Done' || s === 'Completed')) return 30;
      return 0;
    }

    if (project.status === 'Completed') return 100;
    if (project.status === 'In Progress') return 30;
    return 0;
  };

  // 3. DYNAMIC HIRED FREELANCERS ROSTER (Includes defaults + accepted proposals)
  const defaultHired = isDemoUser ? [
    { id: 'hf1', name: 'Alex Mercer', avatar: 'AM', title: 'Senior PyTorch & React Architect', project: 'AI Pipeline Optimization', rate: '₹75/hr', status: 'Active', hiredDate: 'Oct 21, 2023' },
    { id: 'hf2', name: 'Sarah Chen', avatar: 'SC', title: 'Senior Data Scientist', project: 'FinTech Dashboard v2', rate: '₹85/hr', status: 'Active', hiredDate: 'Oct 23, 2023' },
    { id: 'hf3', name: 'Lana Kim', avatar: 'LK', title: 'Cybersecurity Audit Specialist', project: 'Cybersecurity Audit & Shield', rate: '₹90/hr', status: 'Completed', hiredDate: 'Oct 15, 2023' }
  ] : [];

  const acceptedProposalsList = proposals.filter(p => p.status === 'Accepted' || p.status === 'Hired');
  const dynamicHiredFromProps = acceptedProposalsList.map((p, idx) => {
    const name = p.freelancer || p.freelancerName || 'Freelancer';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';
    return {
      id: `hired_${p.id || idx}`,
      name: name,
      avatar: p.avatar || initials,
      title: p.title || 'Senior Full Stack & AI Specialist',
      project: p.project || p.projectTitle || 'Marketplace Project',
      rate: p.bid || p.bidAmount || '₹75/hr',
      status: 'Active',
      hiredDate: p.date || 'Just Now'
    };
  });

  const rawHired = [...defaultHired];
  dynamicHiredFromProps.forEach(dh => {
    if (!rawHired.some(hf => hf.name.toLowerCase() === dh.name.toLowerCase() && hf.project.toLowerCase() === dh.project.toLowerCase())) {
      rawHired.push(dh);
    }
  });
  const hiredFreelancers = rawHired;

  // 4. DYNAMIC CONTRACTS STATE & API INTEGRATION
  const [dbContracts, setDbContracts] = useState([]);
  const [contractFilter, setContractFilter] = useState('All'); // 'All' | 'Active' | 'Pending' | 'Completed' | 'Cancelled'
  const [selectedContractDetail, setSelectedContractDetail] = useState(null);

  const [removedContractIds, setRemovedContractIds] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_deleted_contracts`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Fetch contracts from Django REST API
  const loadLiveContracts = React.useCallback(() => {
    if (!currentUserId || currentUserId === 'guest') return;
    fetch(`http://localhost:8000/api/contracts/?client_id=${encodeURIComponent(currentUserId)}`)
      .then(res => res.json())
      .then(apiContracts => {
        if (Array.isArray(apiContracts)) {
          setDbContracts(apiContracts);
        }
      })
      .catch(err => console.warn('Contracts fetch notice:', err));
  }, [currentUserId]);

  useEffect(() => {
    loadLiveContracts();
    window.addEventListener('freematch_shared_event', loadLiveContracts);
    return () => window.removeEventListener('freematch_shared_event', loadLiveContracts);
  }, [loadLiveContracts]);

  // SAVED FREELANCERS STATE & API SYNC (Client-scoped)
  const [savedFreelancers, setSavedFreelancers] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_saved_freelancers`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return isDemoUser ? [
      { id: 'sf1', freelancer_id: 'sarahchen', name: 'Sarah Chen', title: 'Senior AI Lead & Data Scientist', hourly_rate: '₹110/hr', rating: 5.0, skills: 'PyTorch, DICOM, LangChain, Neo4j', avatar: 'SC' },
      { id: 'sf2', freelancer_id: 'alexmercer', name: 'Alex Mercer', title: 'Senior PyTorch Architect', hourly_rate: '₹95/hr', rating: 4.9, skills: 'PyTorch, Python, React, FastAPI', avatar: 'AM' }
    ] : [];
  });

  const loadSavedFreelancers = React.useCallback(() => {
    if (!currentUserId || currentUserId === 'guest') return;
    fetch(`http://localhost:8000/api/saved-freelancers/?client_id=${encodeURIComponent(currentUserId)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedFreelancers(data);
          localStorage.setItem(`freematch_user_${currentUserId}_saved_freelancers`, JSON.stringify(data));
        }
      })
      .catch(err => console.warn('Saved freelancers fetch notice:', err));
  }, [currentUserId, isDemoUser]);

  useEffect(() => {
    loadSavedFreelancers();
  }, [loadSavedFreelancers]);

  const handleSaveFreelancer = async (freelancerObj) => {
    const flId = freelancerObj.freelancer_id || freelancerObj.username || freelancerObj.freelancer || freelancerObj.name;
    try {
      const res = await fetch('http://localhost:8000/api/saved-freelancers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: currentUserId, freelancer_id: flId })
      });
      if (res.ok) {
        setToast({ message: `${freelancerObj.name || flId} added to Saved Freelancers!`, type: 'success' });
        loadSavedFreelancers();
      }
    } catch (e) {
      setToast({ message: `${freelancerObj.name || flId} saved to list!`, type: 'success' });
    }
  };

  const handleRemoveSavedFreelancer = async (freelancerId) => {
    try {
      await fetch(`http://localhost:8000/api/saved-freelancers/?client_id=${encodeURIComponent(currentUserId)}&freelancer_id=${encodeURIComponent(freelancerId)}`, {
        method: 'DELETE'
      });
      setSavedFreelancers(prev => prev.filter(f => f.freelancer_id !== freelancerId && f.name !== freelancerId));
      localStorage.setItem(`freematch_user_${currentUserId}_saved_freelancers`, JSON.stringify(savedFreelancers.filter(f => f.freelancer_id !== freelancerId && f.name !== freelancerId)));
      setToast({ message: 'Freelancer removed from saved list.', type: 'info' });
    } catch (e) {}
  };

  const handleHireSavedFreelancer = async (freelancerObj, projectId) => {
    const flId = freelancerObj.freelancer_id || freelancerObj.freelancer || freelancerObj.name;
    const projId = projectId || (clientProjects[0]?.id || 'proj_1');
    try {
      const res = await fetch('http://localhost:8000/api/hire-freelancer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: currentUserId,
          freelancer_id: flId,
          project_id: projId,
          agreed_amount: freelancerObj.hourly_rate ? `${freelancerObj.hourly_rate}` : '₹5,000'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `Hired ${freelancerObj.name || flId}! Contract created (${data.contract_id}).`, type: 'success' });
        loadLiveContracts();
      } else {
        setToast({ message: data.error || 'Hiring completed.', type: 'info' });
      }
    } catch (e) {
      setToast({ message: `Contract activated for ${freelancerObj.name || flId}.`, type: 'success' });
    }
  };

  const defaultContracts = (isDemoUser && dbContracts.length === 0) ? [
    { contractId: 'CTR-9024', id: 'CTR-9024', freelancerName: 'Alex Mercer', freelancer: 'Alex Mercer', project: 'AI Pipeline Optimization', projectName: 'AI Pipeline Optimization', amount: '₹2,25,000', agreedAmount: '₹2,25,000', escrow: '₹2,25,000', escrowBalance: '₹2,25,000', startDate: 'Aug 10, 2026', status: 'Active', paymentType: 'Fixed Price', hourlyRate: '₹75/hr' },
    { contractId: 'CTR-8812', id: 'CTR-8812', freelancerName: 'Sarah Chen', freelancer: 'Sarah Chen', project: 'FinTech Dashboard v2', projectName: 'FinTech Dashboard v2', amount: '₹1,20,000', agreedAmount: '₹1,20,000', escrow: '₹1,20,000', escrowBalance: '₹1,20,000', startDate: 'Aug 08, 2026', status: 'Active', paymentType: 'Fixed Price', hourlyRate: '₹85/hr' }
  ] : [];

  const rawContracts = dbContracts.length > 0 ? [...dbContracts] : [...defaultContracts];
  acceptedProposalsList.forEach((p, idx) => {
    const dcId = `CTR-${9050 + idx}`;
    const pTitle = (p.project || p.projectTitle || '').toLowerCase().trim();
    if (pTitle && !rawContracts.some(c => (c.projectName || c.project || '').toLowerCase().trim() === pTitle)) {
      rawContracts.push({
        contractId: dcId,
        id: dcId,
        freelancer: p.freelancer || p.freelancerName || 'Freelancer',
        freelancerName: p.freelancer || p.freelancerName || 'Freelancer',
        project: p.project || p.projectTitle || 'Marketplace Project',
        projectName: p.project || p.projectTitle || 'Marketplace Project',
        amount: p.bid || p.bidAmount || '₹5,000',
        agreedAmount: p.bid || p.bidAmount || '₹5,000',
        escrow: p.bid || p.bidAmount || '₹5,000',
        escrowBalance: p.bid || p.bidAmount || '₹5,000',
        startDate: p.date || 'Aug 10, 2026',
        status: 'Active',
        paymentType: 'Fixed Price',
        hourlyRate: '₹75/hr'
      });
    }
  });

  const contracts = rawContracts.filter(c => {
    const cid = c.contractId || c.id;
    if (removedContractIds.includes(cid) || removedContractIds.includes(c.id)) return false;

    if (contractFilter === 'Active') return c.status === 'Active';
    if (contractFilter === 'Pending') return c.status === 'Pending';
    if (contractFilter === 'Completed') return c.status === 'Completed';
    if (contractFilter === 'Cancelled') return c.status === 'Cancelled' || c.status === 'Archived';
    return c.status !== 'Cancelled' && c.status !== 'Archived';
  });

  const handleRemoveContract = (contract) => {
    const cId = contract.contractId || contract.id;
    if (window.confirm(`Are you sure you want to remove contract "${cId}"?\n\nThis will mark the contract status as Cancelled/Archived and remove it from active agreements while preserving database records.`)) {
      fetch(`http://localhost:8000/api/contracts/${cId}/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      }).catch(() => {});

      const updated = [...removedContractIds, cId, contract.id];
      setRemovedContractIds(updated);
      localStorage.setItem('freematch_deleted_contracts', JSON.stringify(updated));
      setToast({ message: `Contract ${cId} archived and removed from active view.`, type: 'info' });
      window.dispatchEvent(new Event('freematch_shared_event'));
    }
  };

  const handleDownloadContractPDF = (contract) => {
    const cId = contract.contractId || contract.id || 'CTR-9024';
    const cProject = contract.projectName || contract.project || 'AI System Architecture';
    const cClient = contract.clientName || contract.client || userSession?.name || 'Abhilash K K';
    const cFreelancer = contract.freelancerName || contract.freelancer || 'Alex Mercer';
    const cAmount = formatCurrency(contract.agreedAmount || contract.agreed_amount || contract.amount || '₹5,000');
    const cEscrow = formatCurrency(contract.escrowBalance || contract.escrow || cAmount);
    const cStartDate = contract.startDate || 'Aug 10, 2026';
    const cPaymentType = contract.paymentType || 'Fixed Price';
    const cHourlyRate = formatHourlyRate(contract.hourlyRate || contract.hourly_rate || '₹75/hr');
    const cStatus = contract.status || 'Active';

    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FreeMatch AI Contract Document - ${cId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { color: #2563eb; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
          .sub { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em; }
          .contract-badge { background: #eff6ff; color: #2563eb; padding: 8px 18px; border-radius: 12px; font-size: 15px; font-weight: 800; border: 1px solid #bfdbfe; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; }
          .box-title { margin: 0 0 8px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
          .box-val { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; }
          .box-sub { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 13px; }
          .table th { background: #f1f5f9; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 11px; }
          .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FREE MATCH AI</div>
            <div class="sub">FREELANCER CONTRACT AGREEMENT & ESCROW TERMS</div>
          </div>
          <div class="contract-badge">${cId}</div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="box-title">AUTHENTICATED CLIENT</div>
            <div class="box-val">${cClient}</div>
            <div class="box-sub">Client Account ID: ${contract.clientId || 'client_1'}</div>
          </div>
          <div class="box">
            <div class="box-title">CONTRACTED FREELANCER</div>
            <div class="box-val">${cFreelancer}</div>
            <div class="box-sub">Freelancer Account ID: ${contract.freelancerId || 'fl_1'}</div>
          </div>
        </div>

        <div class="box" style="margin-bottom: 30px;">
          <div class="box-title">PROJECT SCOPE & FINANCIAL AGREEMENT</div>
          <p style="margin: 6px 0;"><strong>Project Name:</strong> <span style="color:#2563eb; font-weight:800;">${cProject}</span></p>
          <p style="margin: 6px 0;"><strong>Agreed Budget:</strong> ${cAmount}</p>
          <p style="margin: 6px 0;"><strong>Escrow Funded Balance:</strong> <span style="color:#16a34a; font-weight:800;">${cEscrow}</span></p>
          <p style="margin: 6px 0;"><strong>Payment Type:</strong> ${cPaymentType} (${cHourlyRate})</p>
          <p style="margin: 6px 0;"><strong>Contract Start Date:</strong> ${cStartDate}</p>
          <p style="margin: 6px 0;"><strong>Contract Status:</strong> ${cStatus}</p>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color:#0f172a; margin-bottom: 10px;">Agreed Milestone Deliverables</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Deliverable Scope</th>
              <th>Agreed Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(contract.milestones && contract.milestones.length > 0) ? contract.milestones.map(m => `
              <tr>
                <td>Phase ${m.number || 1}</td>
                <td>${m.title}</td>
                <td><strong style="color:#0f172a;">${m.amount}</strong></td>
                <td><span style="color:#16a34a; font-weight:bold;">${m.status}</span></td>
              </tr>
            `).join('') : `
              <tr>
                <td>Phase 1</td>
                <td>Phase 1: ${cProject} Core Development & Integration</td>
                <td><strong style="color:#0f172a;">${cAmount}</strong></td>
                <td><span style="color:#16a34a; font-weight:bold;">In Progress</span></td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="footer">
          Legally binding electronic marketplace agreement generated automatically by FreeMatch AI Platform.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    pdfWindow.document.close();
  };

  const handleDeleteProject = (projId, projTitle) => {
    const updatedProjects = clientProjects.filter(p => p.id !== projId && p.title !== projTitle);
    setClientProjects(updatedProjects);
    localStorage.setItem('freematch_shared_projects', JSON.stringify(updatedProjects));

    const updatedProps = proposals.filter(pr => pr.projectId !== projId && (pr.projectTitle || pr.project) !== projTitle);
    setProposals(updatedProps);
    localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProps));

    setToast({ message: `Project "${projTitle || 'Selected Project'}" and related contracts removed.`, type: 'info' });
  };

  const taskStorageKey = `freematch_user_${currentUserId}_tasks`;

  // 5. KANBAN TASKS STATE (4 Columns: To-Do, In Progress, Under Review, Done)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(taskStorageKey) || localStorage.getItem('freematch_kanban_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/sprint-tasks/')
      .then(res => res.json())
      .then(apiTasks => {
        if (Array.isArray(apiTasks) && apiTasks.length > 0) {
          const normalized = apiTasks.map(t => ({
            ...t,
            project: t.project || t.projectTitle || t.project_name || 'Enterprise Project',
            assignee: t.assignee || t.assignee_name || 'Assigned Freelancer'
          }));
          setTasks(normalized);
          localStorage.setItem(taskStorageKey, JSON.stringify(normalized));
        }
      })
      .catch(() => {});
  }, [taskStorageKey]);

  // 6. MESSAGES STATE (Client-scoped)
  const [selectedChat, setSelectedChat] = useState('Alex Mercer');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_messages`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return isDemoUser ? [
      { id: 'm1', sender: 'Alex Mercer', text: 'Hi team! I submitted the milestone 1 code to the GitHub repo.', timestamp: '10:14 AM' },
      { id: 'm2', sender: 'You', text: 'Awesome Alex! We verified the build logs. Escrow payment released.', timestamp: '10:18 AM' }
    ] : [];
  });

  useEffect(() => {
    if (currentUserId && currentUserId !== 'guest') {
      localStorage.setItem(`freematch_user_${currentUserId}_messages`, JSON.stringify(messages));
    }
  }, [messages, currentUserId]);

  // 7. PAYMENTS & ESCROW STATE (Client-scoped)
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_payments`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return isDemoUser ? [
      { id: 'INV-3041', date: 'Aug 01, 2026', project: 'AI Pipeline Optimization', milestone: 'Milestone 1: Model Setup', amount: '₹4,000', type: 'Milestone Release', status: 'Paid' },
      { id: 'INV-3042', date: 'Aug 03, 2026', project: 'FinTech Dashboard v2', milestone: 'Milestone 1: Wireframes', amount: '₹2,500', type: 'Escrow Lock', status: 'Pending' }
    ] : [];
  });

  useEffect(() => {
    if (currentUserId && currentUserId !== 'guest') {
      localStorage.setItem(`freematch_user_${currentUserId}_payments`, JSON.stringify(payments));
    }
  }, [payments, currentUserId]);

  // 8. DYNAMIC REVIEWS STATE & CANDIDATES (Client-scoped)
  const baseCandidates = [
    { id: 'cand_alex_1', freelancer: 'Alex Mercer', avatar: 'AM', projectTitle: 'AI Pipeline Optimization', rate: '₹75/hr' },
    { id: 'cand_alex_2', freelancer: 'Alex Mercer', avatar: 'AM', projectTitle: 'AI Automated Test Pipeline', rate: '₹75/hr' },
    { id: 'cand_haines_1', freelancer: 'Haines jp', avatar: 'HJ', projectTitle: 'NextGen Autonomous Trading Engine', rate: '₹85/hr' },
    { id: 'cand_haines_2', freelancer: 'Haines jp', avatar: 'HJ', projectTitle: 'Autonomous Supply Chain Freight Router', rate: '₹85/hr' },
    { id: 'cand_haines_3', freelancer: 'Haines jp', avatar: 'HJ', projectTitle: 'AI Medical Imaging Diagnostic Suite', rate: '₹85/hr' },
    { id: 'cand_sarah_1', freelancer: 'Sarah Chen', avatar: 'SC', projectTitle: 'Enterprise Knowledge Graph RAG Bot', rate: '₹85/hr' },
    { id: 'cand_sarah_2', freelancer: 'Sarah Chen', avatar: 'SC', projectTitle: 'AI Medical Imaging Diagnostic Suite', rate: '₹85/hr' },
    { id: 'cand_lana_1', freelancer: 'Lana Kim', avatar: 'LK', projectTitle: 'Penetration Testing & OWASP Scan', rate: '₹90/hr' },
    { id: 'cand_james_1', freelancer: 'James Joe', avatar: 'JJ', projectTitle: 'Autonomous Supply Chain Freight Router', rate: '₹65/hr' }
  ];

  hiredFreelancers.forEach((hf, idx) => {
    let projName = hf.project;
    if ((hf.name || '').toLowerCase().includes('alex') && projName === 'NextGen Autonomous Trading Engine') {
      projName = 'AI Pipeline Optimization';
    }
    if (!baseCandidates.some(c => (c.freelancer || '').toLowerCase() === (hf.name || '').toLowerCase() && (c.projectTitle || '').toLowerCase() === (projName || '').toLowerCase())) {
      baseCandidates.push({
        id: `cand_dyn_${hf.id || idx}`,
        freelancer: hf.name,
        avatar: hf.avatar,
        projectTitle: projName,
        rate: hf.rate
      });
    }
  });

  const REVIEWABLE_CANDIDATES = baseCandidates;

  const [selectedCandidate, setSelectedCandidate] = useState(REVIEWABLE_CANDIDATES[0] || {
    id: 'cand_alex_1', freelancer: 'Alex Mercer', avatar: 'AM', projectTitle: 'AI Pipeline Optimization', rate: '₹75/hr'
  });
  const [commRating, setCommRating] = useState(5);
  const [codeRating, setCodeRating] = useState(5);
  const [deadlineRating, setDeadlineRating] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewTab, setReviewTab] = useState('given'); // 'given' | 'received'

  const [reviews, setReviews] = useState([]);

  const loadClientReviews = React.useCallback(async () => {
    let combined = [];

    // 1. Load from user-specific localStorage
    try {
      const savedUser = localStorage.getItem(`freematch_user_${currentUserId}_reviews`);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (Array.isArray(parsed)) combined = [...combined, ...parsed];
      }
    } catch (e) {}

    // 2. Load from shared localStorage log
    try {
      const savedShared = localStorage.getItem('freematch_shared_reviews');
      if (savedShared) {
        const parsed = JSON.parse(savedShared);
        if (Array.isArray(parsed)) combined = [...combined, ...parsed];
      }
    } catch (e) {}

    // 3. Fetch from backend REST API
    try {
      const res = await fetch('http://localhost:8000/api/reviews/');
      if (res.ok) {
        const apiData = await res.json();
        if (Array.isArray(apiData)) combined = [...combined, ...apiData];
      }
    } catch (e) {}

    // Fallback demo reviews if empty and isDemoUser
    if (combined.length === 0 && isDemoUser) {
      combined = [
        { id: 'r1', type: 'given', reviewer: currentUserName, reviewee: 'Alex Mercer', projectTitle: 'AI Pipeline Optimization', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Alex completed the model inference optimization ahead of schedule with 4x speedup!', date: 'Aug 01, 2026' },
        { id: 'r2', type: 'given', reviewer: currentUserName, reviewee: 'Alex Mercer', projectTitle: 'AI Automated Test Pipeline', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Excellent execution on the automated test suite pipeline and FastAPI telemetry integration.', date: 'Aug 05, 2026' },
        { id: 'r3', type: 'given', reviewer: currentUserName, reviewee: 'Lana Kim', projectTitle: 'Penetration Testing & OWASP Scan', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Lana completed the penetration audit ahead of schedule with zero security flaws left unpatched.', date: 'Aug 01, 2026' }
      ];
    }

    // Deduplicate by unique key
    const uniqueMap = new Map();
    combined.forEach(r => {
      if (!r) return;
      const key = r.id || `${r.reviewer}_${r.reviewee}_${r.projectTitle || r.project_title}_${r.comment}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    });

    setReviews(Array.from(uniqueMap.values()));
  }, [currentUserId, currentUserName, isDemoUser]);

  useEffect(() => {
    loadClientReviews();
    const handleSync = () => loadClientReviews();
    window.addEventListener('storage', handleSync);
    window.addEventListener('freematch_review_submitted', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('freematch_review_submitted', handleSync);
    };
  }, [loadClientReviews]);

  useEffect(() => {
    if (currentUserId && currentUserId !== 'guest' && reviews.length > 0) {
      localStorage.setItem(`freematch_user_${currentUserId}_reviews`, JSON.stringify(reviews));
    }
  }, [reviews, currentUserId]);

  const [selectedProfileFreelancer, setSelectedProfileFreelancer] = useState(null);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const avgRating = Math.round((commRating + codeRating + deadlineRating) / 3.0);
    const newRev = {
      id: `r_${Date.now()}`,
      type: 'given',
      reviewer: currentUserName,
      reviewee: selectedCandidate.freelancer,
      projectTitle: selectedCandidate.projectTitle,
      rating: avgRating,
      comm: commRating,
      code: codeRating,
      deadline: deadlineRating,
      comment: commentInput,
      date: 'Just now'
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(`freematch_user_${currentUserId}_reviews`, JSON.stringify(updated));

    // Save to shared localStorage review log for cross-session/cross-account sync
    try {
      let shared = [];
      const savedShared = localStorage.getItem('freematch_shared_reviews');
      if (savedShared) shared = JSON.parse(savedShared);
      shared = [newRev, ...shared.filter(r => r.id !== newRev.id)];
      localStorage.setItem('freematch_shared_reviews', JSON.stringify(shared));
    } catch (e) {}

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_review_submitted'));

    // Try posting to Python Django backend REST API
    try {
      await fetch('http://localhost:8000/api/reviews/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: newRev.reviewer,
          reviewee: newRev.reviewee,
          rating: avgRating,
          comm: commRating,
          code: codeRating,
          deadline: deadlineRating,
          comment: commentInput,
          project_title: selectedCandidate.projectTitle
        })
      });
    } catch (err) {}

    setCommentInput('');
    setToast({ 
      message: `Review for ${selectedCandidate.freelancer} submitted! Rating updated in database and displayed on freelancer profile.`, 
      type: 'success' 
    });
  };

  // 9. CLIENT PROFILE & SETTINGS STATE (Client-scoped)
  const [clientProfile, setClientProfile] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_profile`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      displayName: currentUserName,
      companyName: companyName,
      industry: 'Software Technology',
      website: 'https://freematch.ai',
      location: 'San Francisco, CA',
      joinedDate: 'Joined Recently',
      description: `${currentUserName} enterprise client account on FreeMatch AI platform.`,
      paymentVerified: true,
      paymentMethod: 'Visa ending in **** 4242',
      escrowLocked: '₹0',
      totalSpent: '₹0',
      projectsPosted: clientProjects.length,
      activeHires: hiredFreelancers.length
    };
  });

  useEffect(() => {
    const syncClientProfile = () => {
      const keys = [
        `freematch_user_${currentUserId}_profile`,
        `freematch_client_${currentUserId}_profile`,
        `freematch_profile_${currentUserId}`,
        `freematch_user_user1_profile`,
        `freematch_user_abhi_profile`
      ];
      for (const k of keys) {
        const saved = localStorage.getItem(k);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              setClientProfile(parsed);
              break;
            }
          } catch (e) {}
        }
      }
    };

    window.addEventListener('storage', syncClientProfile);
    window.addEventListener('freematch_profile_event', syncClientProfile);
    window.addEventListener('freematch_user_avatar_event', syncClientProfile);
    return () => {
      window.removeEventListener('storage', syncClientProfile);
      window.removeEventListener('freematch_profile_event', syncClientProfile);
      window.removeEventListener('freematch_user_avatar_event', syncClientProfile);
    };
  }, [currentUserId]);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(clientProfile.displayName);
  const [editCompanyName, setEditCompanyName] = useState(clientProfile.companyName);
  const [editIndustry, setEditIndustry] = useState(clientProfile.industry);
  const [editWebsite, setEditWebsite] = useState(clientProfile.website);
  const [editDescription, setEditDescription] = useState(clientProfile.description);
  const [editAvatarUrl, setEditAvatarUrl] = useState(clientProfile.avatar_url || '');
  const [clientAvatarPreview, setClientAvatarPreview] = useState(clientProfile.avatar_url || '');
  const [clientAvatarError, setClientAvatarError] = useState('');

  const handleClientAvatarSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    setClientAvatarError('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes((file.type || '').toLowerCase())) {
      setClientAvatarError('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setClientAvatarError('Profile picture size exceeds the allowed 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setClientAvatarPreview(reader.result);
      setEditAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const confirmRemoveClientAvatar = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setClientAvatarPreview('');
      setEditAvatarUrl('');
      setClientAvatarError('');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      ...clientProfile,
      displayName: editDisplayName,
      companyName: editCompanyName,
      industry: editIndustry,
      website: editWebsite,
      description: editDescription,
      avatar_url: editAvatarUrl
    };
    setClientProfile(updated);
    localStorage.setItem(`freematch_user_${currentUserId}_profile`, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    try {
      await fetch('http://localhost:8000/api/user-avatar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUserId,
          avatar_url: editAvatarUrl
        })
      });
    } catch (err) {}

    setShowEditProfileModal(false);
    setToast({ message: 'Client profile and avatar updated successfully!', type: 'success' });
  };


  // 9. REAL-TIME NOTIFICATIONS & MESSAGES STATE
  const [notifications, setNotifications] = useState([]);
  const [messagesCount, setMessagesCount] = useState(2);

  useEffect(() => {
    const loadLiveNotifications = async () => {
      const list = await fetchNotifications(userSession?.user_id || userSession?.name || 'client');
      setNotifications(list);
    };

    const loadLiveMessagesCount = async () => {
      const cUserId = (userSession?.username || userSession?.user_id || userSession?.email || 'client').toLowerCase().trim();
      try {
        const res = await fetch(`http://localhost:8000/api/messages/?user_id=${encodeURIComponent(cUserId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.conversations)) {
            setMessagesCount(data.conversations.length);
          }
        }
      } catch (err) {}
    };

    loadLiveNotifications();
    loadLiveMessagesCount();

    const handleNotifEvent = () => {
      loadLiveNotifications();
      loadLiveMessagesCount();
    };
    window.addEventListener('freematch_notification_event', handleNotifEvent);
    window.addEventListener('freematch_shared_event', handleNotifEvent);
    return () => {
      window.removeEventListener('freematch_notification_event', handleNotifEvent);
      window.removeEventListener('freematch_shared_event', handleNotifEvent);
    };
  }, [userSession]);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // List Filter State
  const [projectFilter, setProjectFilter] = useState('All');

  // Skill Chip Tag Management Helper
  const [skillTagInput, setSkillTagInput] = useState('');

  const currentSkillsList = React.useMemo(() => {
    if (Array.isArray(skillsReq)) return skillsReq;
    if (typeof skillsReq === 'string' && skillsReq.trim()) {
      return skillsReq.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [skillsReq]);

  const handleAddSkillTag = (skillName) => {
    const trimmed = (skillName || '').trim().replace(/,/g, '');
    if (!trimmed) return;
    if (currentSkillsList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillTagInput('');
      return;
    }
    const newList = [...currentSkillsList, trimmed];
    setSkillsReq(newList.join(', '));
    setSkillTagInput('');
  };

  const handleRemoveSkillTag = (skillToRemove) => {
    const newList = currentSkillsList.filter(s => s !== skillToRemove);
    setSkillsReq(newList.join(', '));
  };

  // Saved Drafts State & Helpers
  const draftListKey = `freematch_user_${userSession?.user_id || 'client'}_project_drafts_list`;
  const activeDraftKey = `freematch_user_${userSession?.user_id || 'client'}_project_draft`;

  const [savedDraftsList, setSavedDraftsList] = useState(() => {
    try {
      const saved = localStorage.getItem(`freematch_user_${userSession?.user_id || 'client'}_project_drafts_list`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const handleSaveDraft = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const titleToSave = (projectTitle || '').trim() || 'Untitled Project Draft';
      const draftId = `draft_${Date.now()}`;
      const now = new Date();
      const savedAtFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString();

      const draftObj = {
        id: draftId,
        projectTitle: titleToSave,
        category: category || 'Software Development',
        skillsReq: skillsReq || '',
        budget: budget || '',
        duration: duration || '3 Weeks',
        description: description || '',
        projectAbstract: projectAbstract || '',
        attachedFile: attachedFile || null,
        milestoneItems: milestoneItems || [],
        savedAt: savedAtFormatted
      };

      localStorage.setItem(activeDraftKey, JSON.stringify(draftObj));

      const existingList = savedDraftsList.filter(d => (d.projectTitle || '').toLowerCase() !== titleToSave.toLowerCase());
      const updatedList = [draftObj, ...existingList];

      setSavedDraftsList(updatedList);
      localStorage.setItem(draftListKey, JSON.stringify(updatedList));

      setToast({ 
        message: `Project draft "${titleToSave}" saved successfully! You can resume it anytime under My Projects -> Saved Drafts.`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Draft saved to local workspace.', type: 'info' });
    }
  };

  const handleResumeDraft = (draftObj) => {
    if (!draftObj) return;
    if (draftObj.projectTitle) setProjectTitle(draftObj.projectTitle);
    if (draftObj.category) setCategory(draftObj.category);
    if (draftObj.skillsReq) setSkillsReq(draftObj.skillsReq);
    if (draftObj.budget) setBudget(draftObj.budget);
    if (draftObj.duration) setDuration(draftObj.duration);
    if (draftObj.description) setDescription(draftObj.description);
    if (draftObj.projectAbstract) setProjectAbstract(draftObj.projectAbstract);
    if (draftObj.attachedFile) setAttachedFile(draftObj.attachedFile);
    if (Array.isArray(draftObj.milestoneItems) && draftObj.milestoneItems.length > 0) {
      setMilestoneItems(draftObj.milestoneItems);
    }
    setShowPostProjectModal(true);
    setToast({ message: `Loaded draft "${draftObj.projectTitle || 'Project Draft'}"!`, type: 'info' });
  };

  const handleDeleteDraft = (draftId) => {
    const updatedList = savedDraftsList.filter(d => d.id !== draftId);
    setSavedDraftsList(updatedList);
    localStorage.setItem(draftListKey, JSON.stringify(updatedList));
    setToast({ message: 'Saved draft removed from workspace.', type: 'info' });
  };

  // Title formatting helper
  const formatTitle = (str) => {
    if (!str) return '';
    return str
      .replace(/\bai\b/gi, 'AI')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };



  // Handlers
  const handlePostProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const currentUserName = userSession?.name || 'TechStream Corp';
    const currentUserId = userSession?.user_id || 'client';
    const projectStorageKey = `freematch_projects_${currentUserId}`;

    const formattedBudget = `$${parseInt(budget || 0).toLocaleString()}`;
    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectTitle,
      client: currentUserName,
      client_id: currentUserId,
      category: category,
      budget: formattedBudget,
      duration: duration,
      skills: skillsReq,
      status: 'Open for Bids',
      postedDate: 'Just Now',
      progress: 0,
      applicants: 0,
      description: description,
      abstract: projectAbstract,
      attachedFile: attachedFile
    };

    const updated = [newProj, ...clientProjects];
    setClientProjects(updated);
    localStorage.setItem(projectStorageKey, JSON.stringify(updated));

    // Persist project directly into Django PostgreSQL database
    try {
      await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          client: currentUserId,
          client_name: currentUserName,
          category: category,
          budget: formattedBudget,
          duration: duration,
          skills: Array.isArray(skillsReq) ? skillsReq.join(', ') : skillsReq,
          description: description,
          abstract: projectAbstract
        })
      });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    setShowPostProjectModal(false);
    setToast({ message: `Project "${projectTitle}" posted successfully!`, type: 'success' });
    setProjectTitle('');
    setDescription('');
    setProjectAbstract('');
    setAttachedFile(null);
    window.dispatchEvent(new Event('freematch_shared_event'));
  };

  const handleAcceptProposal = (acceptedProp) => {
    const currentUserName = userSession?.name || 'Abhilash K K';
    const currentUserId = userSession?.user_id || 'abhi';
    const projectStorageKey = `freematch_user_${currentUserId}_projects`;
    const proposalStorageKey = `freematch_user_${currentUserId}_proposals`;
    const taskStorageKey = `freematch_user_${currentUserId}_tasks`;

    const updated = proposals.map((p) =>
      (p.id === acceptedProp.id || p.db_id === acceptedProp.db_id) ? { ...p, status: 'Accepted' } : p
    );

    setProposals(updated);
    localStorage.setItem(proposalStorageKey, JSON.stringify(updated));
    localStorage.setItem('freematch_shared_proposals', JSON.stringify(updated));

    const flName = acceptedProp.freelancer || acceptedProp.freelancerName || 'Freelancer';
    const targetProjTitle = acceptedProp.projectTitle || acceptedProp.project || 'Project';
    const rawBid = acceptedProp.bid || acceptedProp.bidAmount || '₹5,000';
    const bidVal = formatCurrency(rawBid);

    const updatedProjects = clientProjects.map(p => {
      if (p.id === acceptedProp.projectId || (p.title || '').toLowerCase().trim() === targetProjTitle.toLowerCase().trim()) {
        return { ...p, status: 'In Progress', hiredFreelancer: flName, progress: Math.max(p.progress || 0, 30) };
      }
      return p;
    });

    setClientProjects(updatedProjects);
    localStorage.setItem(projectStorageKey, JSON.stringify(updatedProjects));
    localStorage.setItem('freematch_shared_projects', JSON.stringify(updatedProjects));

    const savedTasks = localStorage.getItem(taskStorageKey);
    let currentTasks = [];
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) currentTasks = parsed;
      } catch (e) {}
    }

    let updatedTasks = currentTasks.filter(t => 
      (t.project || '').toLowerCase().trim() !== targetProjTitle.toLowerCase().trim() &&
      !(t.title || '').toLowerCase().includes(targetProjTitle.toLowerCase().trim())
    );

    const task1 = {
      id: `t_proj_${Date.now()}_1`,
      title: `Build Rust Order Execution Core Engine`,
      status: 'In Progress',
      assignee: flName,
      budget: bidVal,
      project: targetProjTitle
    };
    const task2 = {
      id: `t_proj_${Date.now()}_2`,
      title: `Implement WebSocket Orderbook & Telemetry Feed`,
      status: 'To Do',
      assignee: flName,
      budget: bidVal,
      project: targetProjTitle
    };

    updatedTasks = [task1, task2, ...updatedTasks];
    localStorage.setItem(taskStorageKey, JSON.stringify(updatedTasks));

    // 3. Persist Contract to Django PostgreSQL Database API
    const propDbId = acceptedProp.db_id || String(acceptedProp.id || '').replace('prop_', '');
    fetch('http://localhost:8000/api/contracts/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: targetProjTitle,
        client_name: currentUserName,
        client_id: currentUserId,
        freelancer_name: flName,
        freelancer_id: acceptedProp.freelancerId || flName,
        agreed_amount: bidVal,
        escrow_balance: bidVal,
        proposal_id: propDbId,
        start_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.contract) {
        setDbContracts(prev => [data.contract, ...prev]);
      }
      loadLiveProjects();
      loadLiveProposals();
      window.dispatchEvent(new Event('freematch_shared_event'));
      window.dispatchEvent(new Event('freematch_kanban_event'));
    })
    .catch(err => console.warn('Contract API notice:', err));

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_kanban_event'));

    createNotification({
      type: 'hired',
      title: `Contract Created for ${targetProjTitle}`,
      message: `Contract created successfully for ${targetProjTitle} with ${flName}.`,
      project_name: targetProjTitle,
      related_user_name: flName,
      user_id: currentUserId
    });

    createNotification({
      type: 'proposal',
      title: `Proposal Accepted & Contract Active`,
      message: `Congratulations! Your proposal for ${targetProjTitle} has been accepted by ${currentUserName}. Your contract is now active.`,
      project_name: targetProjTitle,
      related_user_name: currentUserName,
      user_id: flName
    });

    setToast({ message: `Hired ${flName} for "${targetProjTitle}"! Contract activated and task added to Sprint Board.`, type: 'success' });
  };
  const updateTaskStatus = (taskId, newStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    setToast({ message: `Task moved to "${newStatus}"`, type: 'info' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const newMsg = { id: `m_${Date.now()}`, sender: 'You', text: messageInput, timestamp: 'Just now' };
    setMessages([...messages, newMsg]);
    setMessageInput('');
  };

  const handleClosePosting = (project) => {
    if (project.status === 'In Progress' || project.status === 'Completed') {
      alert(`Project "${project.title}" is currently ${project.status} with a hired freelancer and cannot be simply closed.`);
      return;
    }
    if (window.confirm(`Are you sure you want to close project "${project.title}"?\n\nClosing the posting will prevent new freelancer applications.`)) {
      const updated = clientProjects.map(p => p.id === project.id ? { ...p, status: 'Closed' } : p);
      setClientProjects(updated);
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));

      const updatedProps = proposals.map(pr => 
        (pr.projectId === project.id || pr.projectTitle === project.title) 
          ? { ...pr, projectStatus: 'Closed' } 
          : pr
      );
      setProposals(updatedProps);
      localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProps));

      setToast({ message: `Project "${project.title}" posting is now Closed.`, type: 'info' });
      window.dispatchEvent(new Event('freematch_shared_event'));
    }
  };

  const searchClean = searchQuery.toLowerCase().trim();
  const filteredProjects = clientProjects.filter((p) => {
    const pTitle = (p.title || '').toLowerCase();
    const pCategory = (p.category || '').toLowerCase();
    const pSkills = (Array.isArray(p.skills) ? p.skills.join(' ') : p.skills || '').toLowerCase();
    const pFreelancer = (p.hiredFreelancer || p.freelancer || '').toLowerCase();
    const pContract = (p.contractId || '').toLowerCase();

    const matchesSearch = !searchClean || 
      pTitle.includes(searchClean) || 
      pCategory.includes(searchClean) || 
      pSkills.includes(searchClean) || 
      pFreelancer.includes(searchClean) || 
      pContract.includes(searchClean);

    if (!matchesSearch) return false;

    const pProg = getProjectProgress(p);
    const isHiring = p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open' || (pProg === 0 && p.status !== 'Closed' && p.status !== 'Completed');
    const isCompleted = p.status === 'Completed' || pProg === 100;
    const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
    const isInProgress = p.status === 'In Progress' || (!isHiring && !isCompleted && !isClosed);

    if (projectFilter === 'Hiring') return isHiring;
    if (projectFilter === 'In Progress') return isInProgress;
    if (projectFilter === 'Completed') return isCompleted;
    if (projectFilter === 'Closed') return isClosed;
    return true;
  });

  return (
    <div className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* Background Glowing Orbs */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0 ${
        isDark ? 'bg-blue-600/10' : 'bg-blue-400/15'
      }`}></div>
      <div className={`absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none z-0 ${
        isDark ? 'bg-blue-700/10' : 'bg-blue-300/20'
      }`}></div>
      <div className={`absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 ${
        isDark ? 'bg-indigo-600/10' : 'bg-indigo-300/15'
      }`}></div>

      {/* 3D Floating Grid Environment */}
      <div className="bg-3d-grid-clean"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between p-5 relative z-20 shadow-xs">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center space-x-3 px-2 pt-1">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#2563eb]">FreeMatch AI</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-extrabold tracking-wider uppercase">CLIENT WORKSPACE</p>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-5 text-xs font-semibold">
            
            {/* 1. WORKSPACE */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">WORKSPACE</p>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'post', label: 'Post Project', icon: PlusCircle, action: () => setShowPostProjectModal(true) },
                { id: 'projects', label: 'My Projects', icon: FolderKanban, badge: clientProjects.length },
                { id: 'applications', label: 'Project Applications', icon: Inbox, badge: proposals.length },
                { id: 'freelancers', label: 'Hired Freelancers', icon: Users },
                { id: 'saved-freelancers', label: 'Saved Freelancers', icon: Star, badge: savedFreelancers.length }
              ].map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                      activeTab === item.id 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 2. MANAGEMENT */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">MANAGEMENT</p>
              {[
                { id: 'contracts', label: 'Contracts', icon: FileText },
                { id: 'kanban', label: 'Sprint Task Board', icon: Kanban },
                { id: 'payments', label: 'Payments & Escrow', icon: ShieldCheck },
                { id: 'reviews', label: 'Reviews', icon: Star }
              ].map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                      activeTab === item.id 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. COMMUNICATION */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">COMMUNICATION</p>
              {[
                { id: 'messages', label: 'Messages', icon: MessageSquare, badge: messagesCount },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount }
              ].map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                      activeTab === item.id 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 4. AI POWERED */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">AI POWERED</p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3 rounded-2xl border border-blue-100/80 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">AI Assistant</p>
                  <p className="text-xs text-blue-600 font-bold">Smart NLP Auto-Match</p>
                </div>
              </div>
            </div>

            {/* 5. ACCOUNT */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">ACCOUNT</p>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'profile' 
                  ? 'bg-[#2563eb] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
                <UserCircle className="w-4 h-4" />
                <span>View Profile</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'settings' 
                  ? 'bg-[#2563eb] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main id="client-dashboard-main" className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f4f7fc]">
        
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 px-8 py-4 border-b border-slate-200/80 bg-[#f4f7fc]/90 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 dark:text-slate-300 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, category, skills, freelancer, or contract ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder:text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-3 space-y-3">
                {(() => {
                  const q = searchQuery.toLowerCase().trim();
                  const matchingProjects = clientProjects.filter(p => 
                    p.title.toLowerCase().includes(q) || 
                    p.category.toLowerCase().includes(q) || 
                    (Array.isArray(p.skills) ? p.skills.join(' ') : p.skills).toLowerCase().includes(q)
                  ).slice(0, 3);

                  const matchingFreelancers = Array.from(new Set([
                    ...proposals.map(pr => pr.freelancer),
                    ...clientProjects.map(p => p.hiredFreelancer || p.freelancer).filter(Boolean),
                    'Alex Mercer', 'Haines JP', 'Lana Kim', 'Sarah Chen'
                  ])).filter(name => name.toLowerCase().includes(q)).slice(0, 3);

                  const matchingContracts = contracts.filter(c => 
                    c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
                  ).slice(0, 3);

                  const totalMatches = matchingProjects.length + matchingFreelancers.length + matchingContracts.length;

                  if (totalMatches === 0) {
                    return (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center py-2">No matching results found for "{searchQuery}"</p>
                    );
                  }

                  return (
                    <>
                      {matchingProjects.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">PROJECTS</p>
                          <div className="space-y-1">
                            {matchingProjects.map(p => (
                              <div key={p.id} onClick={() => { setActiveTab('projects'); setSearchQuery(''); }} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">{p.title}</span>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{p.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchingFreelancers.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-purple-600 uppercase tracking-wider mb-1">FREELANCERS</p>
                          <div className="space-y-1">
                            {matchingFreelancers.map(name => (
                              <div key={name} onClick={() => { setActiveTab('freelancers'); setSearchQuery(''); }} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">{name}</span>
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Hired Candidate</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchingContracts.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-1">CONTRACTS</p>
                          <div className="space-y-1">
                            {matchingContracts.map(c => (
                              <div key={c.id} onClick={() => { setActiveTab('contracts'); setSearchQuery(''); }} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs">
                                <span className="font-extrabold text-slate-900">{c.id} — {c.title}</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{c.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('notifications')} className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs relative cursor-pointer hover:bg-slate-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-xs px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 pl-3 border-l border-slate-300 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900">{currentUserName}</p>
                  <p className="text-xs text-[#2563eb] font-extrabold tracking-wider uppercase">
                    CLIENT WORKSPACE
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-xs shadow-xs overflow-hidden">
                  {(() => {
                    const uid = (currentUserId || userSession?.user_id || userSession?.email || '').toLowerCase();
                    let avatarUrl = clientProfile?.avatar_url || userSession?.avatar_url || '';
                    if (!avatarUrl && uid) {
                      const keys = [
                        `freematch_user_${uid}_profile`,
                        `freematch_client_${uid}_profile`,
                        `freematch_profile_${uid}`,
                        `freematch_user_user1_profile`,
                        `freematch_user_abhi_profile`
                      ];
                      for (const k of keys) {
                        try {
                          const cached = JSON.parse(localStorage.getItem(k) || '{}');
                          if (cached && cached.avatar_url) {
                            avatarUrl = cached.avatar_url;
                            break;
                          }
                        } catch (e) {}
                      }
                    }
                    const initials = currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';
                    return avatarUrl ? (
                      <img src={avatarUrl} alt={currentUserName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>{initials}</span>
                    );
                  })()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 font-bold ml-0.5" />
              </button>

              {/* PROFILE DROPDOWN MENU */}
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-2 space-y-1"
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-xl">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{currentUserName}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate mt-0.5">{userSession?.email || `${currentUserId}@freematch.ai`}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-blue-600" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
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

        {/* TAB 1: MODERN CLIENT SAAS COMMAND CENTER DASHBOARD */}
        {activeTab === 'dashboard' && (() => {
          const parseCurrency = (val) => {
            if (!val) return 0;
            const cleaned = String(val).replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
          };

          const activeProjectsCount = clientProjects.filter(p => 
            p.status !== 'Completed' && p.status !== 'Closed' && p.status !== 'Cancelled'
          ).length;

          const inProgressCount = clientProjects.filter(p => p.status === 'In Progress').length;
          const pendingAppsCount = proposals.filter(p => p.status === 'Pending').length;
          const pendingReviewCount = proposals.filter(p => p.status === 'Pending').length;

          const totalBudgetSum = clientProjects.reduce((sum, p) => sum + parseCurrency(p.budget), 0);
          const formattedTotalBudget = `₹${totalBudgetSum.toLocaleString('en-IN')}`;

          const activeContracts = contracts.filter(c => c.status === 'Active');
          const pendingEscrowSum = activeContracts.reduce((sum, c) => sum + parseCurrency(c.escrow || c.escrowBalance || c.amount || c.agreedAmount || c.agreed_amount), 0);
          const formattedPendingEscrow = `₹${pendingEscrowSum.toLocaleString('en-IN')}`;

          return (
            <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
              
              {/* WELCOME BANNER SECTION */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {(() => {
                      const hr = new Date().getHours();
                      const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
                      const firstName = currentUserName.split(' ')[0] || 'Client';
                      return `${greeting}, ${firstName} 👋`;
                    })()}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                    Here's an overview of your projects, hiring activity, and payments.
                  </p>
                </div>

                <button 
                  onClick={() => setShowPostProjectModal(true)}
                  className="bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <span>+</span>
                  <span>Post New Project</span>
                </button>
              </div>

              {/* 4 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Card 1: ACTIVE PROJECTS */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">ACTIVE PROJECTS</p>
                      <p className="text-3xl font-extrabold text-slate-900">{activeProjectsCount}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{inProgressCount} in progress</p>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ↑ 2 this month
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Card 2: PENDING APPLICATIONS */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">PENDING APPLICATIONS</p>
                      <p className="text-3xl font-extrabold text-slate-900">{pendingAppsCount}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{pendingReviewCount} require your review</p>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ↑ 3 new
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>

                  {/* Card 3: TOTAL PROJECT VALUE */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">TOTAL PROJECT VALUE</p>
                      <p className="text-3xl font-extrabold text-slate-900">{formattedTotalBudget}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Across all active projects</p>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ↑ 12% this month
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-black text-emerald-600">₹</span>
                    </div>
                  </div>

                  {/* Card 4: ESCROW BALANCE */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">ESCROW BALANCE</p>
                      <p className="text-3xl font-extrabold text-slate-900">{formattedPendingEscrow}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">₹2,400 available</p>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          ↓ ₹300 this month
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>

                </div>

            {/* ROW 1: ACTIVE PROJECTS (LARGE CARD) + ACTION REQUIRED + HIRING ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 1. ACTIVE PROJECTS PANEL (6 Cols width) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">Active Projects</h3>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>View All Projects</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {clientProjects.length === 0 ? (
                    <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                        <FolderKanban className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">No projects yet</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto font-medium">
                        Start by posting your first project to receive freelancer applications and AI matches.
                      </p>
                      <button 
                        onClick={() => setShowPostProjectModal(true)}
                        className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Post New Project</span>
                      </button>
                    </div>
                  ) : (
                    clientProjects.slice(0, 3).map((p, idx) => {
                      const pProgress = getProjectProgress(p);
                      const isHiring = p.status === 'Open for Bids' || p.status === 'Hiring' || (pProgress === 0 && !p.hiredFreelancer);
                      const hiredFreelancer = p.hiredFreelancer || p.freelancer;
                      const initials = hiredFreelancer ? hiredFreelancer.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FL';

                      return (
                        <div key={p.id || idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                {idx === 0 ? <Brain className="w-5 h-5 text-blue-600" /> : idx === 1 ? <TrendingUp className="w-5 h-5 text-blue-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-extrabold text-slate-900 text-sm">{formatTitle(p.title)}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    isHiring ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {isHiring ? 'Hiring' : 'In Progress'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                                  {Array.isArray(p.skills) ? p.skills.join(' • ') : p.skills}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-extrabold text-slate-900">{formatCurrency(p.budget)}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">BUDGET</p>
                            </div>
                          </div>

                          {/* Dynamic Progress Bar */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isHiring ? 'bg-amber-500' : 'bg-[#2563eb]'}`} 
                                style={{ width: `${pProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-extrabold text-slate-700">{pProgress}%</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            {hiredFreelancer ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{hiredFreelancer}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-300">Hired Freelancer</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Posted: {p.postedDate || 'Aug 10, 2026'}</p>
                            )}

                            <div className="flex items-center space-x-4">
                              {isHiring ? (
                                <>
                                  <div className="text-center">
                                    <p className="font-extrabold text-slate-800 text-xs">{getProjectApplicantCount(p)}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">APPLICANTS</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-extrabold text-slate-800 text-xs">{p.duration || '3 weeks'}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">DURATION</p>
                                  </div>
                                  <button 
                                    onClick={() => { setApplicationFilter('All'); setActiveTab('applications'); }}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  >
                                    View Applications
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="text-center">
                                    <p className="font-extrabold text-slate-800 text-xs">Milestones</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">ACTIVE</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-extrabold text-slate-800 text-xs">{p.duration || '3 weeks'}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">REMAINING</p>
                                  </div>
                                  <button 
                                    onClick={() => setSelectedManageProject(p)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Manage Project
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. ACTION REQUIRED PANEL (3 Cols width) */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-lg text-slate-900">Action Required</h3>
                  </div>
                  <button onClick={() => setActiveTab('applications')} className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {pendingAppsCount === 0 && activeContracts.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 flex-1 flex flex-col justify-center items-center min-h-[160px]">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-extrabold text-slate-800">You're all caught up</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">No actions currently require your review.</p>
                    </div>
                  ) : (
                    <>
                      {pendingAppsCount > 0 && (
                        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Users className="w-4 h-4 text-amber-700" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-900">{pendingAppsCount} proposals waiting for review</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">Review and shortlist candidates</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab('applications')}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {activeContracts.length > 0 && (
                        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-4 h-4 text-purple-700" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-900">Milestone active on contract</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">{activeContracts[0].projectName || activeContracts[0].project}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const projTitle = activeContracts[0]?.projectName || activeContracts[0]?.project || 'All';
                              setSelectedKanbanProject(projTitle);
                              setActiveTab('kanban');
                              window.dispatchEvent(new Event('freematch_kanban_event'));
                            }}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 3. HIRING ACTIVITY PANEL (3 Cols width) */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">Hiring Activity</h3>
                  <button onClick={() => setActiveTab('notifications')} className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {notifications.length === 0 && proposals.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 flex-1 flex flex-col justify-center items-center min-h-[160px]">
                      <p className="text-xs font-extrabold text-slate-800">No hiring activity yet.</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Activity will appear when proposals are submitted.</p>
                    </div>
                  ) : (
                    (notifications.length > 0 ? notifications : proposals).slice(0, 3).map((item, idx) => (
                      <div key={item.id || idx} className="flex items-start space-x-3 text-xs">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-slate-900">{item.title || 'Activity Event'}</p>
                          <p className="text-slate-700 dark:text-slate-300 truncate text-xs">{item.message || item.coverLetter || 'Update recorded'}</p>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium shrink-0">Just now</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* ROW 2: MILESTONE PROGRESS OVERVIEW + FINANCIAL OVERVIEW + TOP HIRED FREELANCERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. MILESTONE PROGRESS OVERVIEW */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Milestone Progress Overview</h3>
                  <button onClick={() => setActiveTab('kanban')} className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer">
                    View All Milestones →
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {contracts.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center min-h-[160px]">
                      <p className="text-xs font-extrabold text-slate-800">No active milestones.</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Milestones will appear when contracts are activated.</p>
                    </div>
                  ) : (
                    contracts.slice(0, 2).map((c, idx) => (
                      <div key={c.id || idx} className="space-y-3">
                        <div className="flex items-center space-x-2 font-bold text-slate-800">
                          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">🧠</span>
                          <span>{c.projectName || c.project}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600 font-semibold">Milestone 1</span>
                              <span className="text-emerald-600 font-bold flex items-center space-x-1">
                                <span>100%</span>
                                <span>✓</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600 font-semibold">Milestone 2</span>
                              <span className="text-blue-600 font-bold flex items-center space-x-1">
                                <span>60%</span>
                                <span>🕒</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. FINANCIAL OVERVIEW */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Financial Overview</h3>
                  <button onClick={() => setActiveTab('payments')} className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer">
                    View All Payments →
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* Total Value + Sparkline */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase">Total Project Value</p>
                      <p className="text-2xl font-extrabold text-slate-900">{formattedTotalBudget}</p>
                    </div>

                    {/* Sparkline Graphic */}
                    <svg className="w-28 h-8 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
                      <path d="M0 25 L20 20 L40 22 L60 10 L80 14 L100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Sub Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">Escrow Funded</p>
                      <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{formattedPendingEscrow}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100/60">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">Released</p>
                      <p className="text-xs font-extrabold text-blue-600 mt-0.5">₹0</p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/60">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">Pending</p>
                      <p className="text-xs font-extrabold text-amber-600 mt-0.5">{formattedPendingEscrow}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase">Available</p>
                      <p className="text-xs font-extrabold text-emerald-600 mt-0.5">₹0</p>
                    </div>
                  </div>

                  {/* Spending Bar Chart SVG */}
                  <div className="pt-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase mb-2">Spending Overview (Last 6 Months)</p>
                    <div className="flex items-end justify-between h-14 pt-2 border-t border-slate-100 text-xs text-slate-600 dark:text-slate-300 font-semibold px-1">
                      {['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => {
                        const heights = totalBudgetSum > 0 ? ['h-3', 'h-4', 'h-3', 'h-6', 'h-5', 'h-10'] : ['h-1', 'h-1', 'h-1', 'h-1', 'h-1', 'h-1'];
                        return (
                          <div key={m} className="flex flex-col items-center space-y-1">
                            <div className={`w-4 ${heights[i]} bg-[#2563eb] rounded-t-md`}></div>
                            <span>{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. TOP HIRED FREELANCERS */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Top Hired Freelancers</h3>
                  <button onClick={() => setActiveTab('freelancers')} className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer">
                    View All Freelancers →
                  </button>
                </div>

                <div className="space-y-4">
                  {hiredFreelancers.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center min-h-[160px]">
                      <p className="text-xs font-extrabold text-slate-800">Hired Freelancers (0)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">No freelancers hired yet.</p>
                      <button onClick={() => setActiveTab('applications')} className="mt-2 text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                        View Applications →
                      </button>
                    </div>
                  ) : (
                    hiredFreelancers.slice(0, 3).map((fl, idx) => (
                      <div key={fl.id || idx} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/40">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                            {fl.avatar || (fl.name ? fl.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FL')}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{fl.name}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{fl.title || 'Senior Software Specialist'}</p>
                            <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                              <span className="text-amber-500">⭐ 4.9</span>
                              <span>•</span>
                              <span className="text-emerald-600">Active</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('freelancers')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          View Profile
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* ROW 3: AI HIRING ASSISTANT BANNER */}
            {clientProjects.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/80 to-purple-50 p-6 rounded-3xl border border-blue-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-lg text-slate-900">AI Hiring Assistant</h3>
                      <span className="text-xs">🪄</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Create a project to get AI-powered freelancer matches.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPostProjectModal(true)}
                  className="bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md shrink-0 cursor-pointer"
                >
                  <span>+</span>
                  <span>Post Project</span>
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/80 to-purple-50 p-6 rounded-3xl border border-blue-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-lg text-slate-900">AI Hiring Assistant</h3>
                      <span className="text-xs">🪄</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      AI candidate recommendations active for your posted projects.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  <div className="bg-white p-2.5 px-4 rounded-2xl border border-slate-200/80 flex items-center space-x-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      AI
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Smart Candidate Match</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">NLP Skill Indexing</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 ml-1">
                      96% Match
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
          );
        })()}

        {/* TAB 2: MY PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  My Posted Projects ({clientProjects.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal mt-1">
                  Central project-management hub. Manage active postings, applications, hired freelancers, contracts, and milestone progress.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowPostProjectModal(true)}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Post New Project</span>
                </button>
              </div>
            </div>

            {/* Filter Pills with Dynamic Database Counts */}
            {(() => {
              const counts = {
                all: clientProjects.length,
                hiring: clientProjects.filter(p => {
                  const pProg = getProjectProgress(p);
                  return p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open' || (pProg === 0 && p.status !== 'Closed' && p.status !== 'Completed');
                }).length,
                inProgress: clientProjects.filter(p => {
                  const pProg = getProjectProgress(p);
                  return p.status === 'In Progress' || (pProg > 0 && pProg < 100 && p.status !== 'Closed');
                }).length,
                completed: clientProjects.filter(p => {
                  const pProg = getProjectProgress(p);
                  return p.status === 'Completed' || pProg === 100;
                }).length,
                closed: clientProjects.filter(p => p.status === 'Closed' || p.status === 'Cancelled').length,
                drafts: savedDraftsList.length
              };

              return (
                <div className="flex items-center space-x-2 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs flex-wrap gap-y-1">
                  {[
                    { label: 'All', key: 'All', count: counts.all },
                    { label: 'Hiring', key: 'Hiring', count: counts.hiring },
                    { label: 'In Progress', key: 'In Progress', count: counts.inProgress },
                    { label: 'Completed', key: 'Completed', count: counts.completed },
                    { label: 'Closed', key: 'Closed', count: counts.closed },
                    { label: 'Saved Drafts 📝', key: 'Drafts', count: counts.drafts }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setProjectFilter(f.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        projectFilter === f.key 
                          ? 'bg-[#2563eb] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Projects List Container */}
            <div className="space-y-5">
              {projectFilter === 'Drafts' ? (
                savedDraftsList.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-2xl mx-auto font-bold">
                      📄
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">No saved drafts yet</h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-md mx-auto font-medium">
                        When you click "Save Draft" while creating a project in the Post New Marketplace Project modal, your saved drafts will appear here so you can edit and publish them anytime.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowPostProjectModal(true)}
                      className="px-5 py-2.5 bg-[#2563eb] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      + Create & Save Draft
                    </button>
                  </div>
                ) : (
                  savedDraftsList.map(draft => (
                    <div 
                      key={draft.id} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4 transition-all hover:border-slate-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                              {formatTitle(draft.projectTitle)}
                            </h3>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
                              📄 Saved Draft
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                              {draft.category || 'Software Development'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                            {draft.description || 'No detailed scope written yet for this project draft.'}
                          </p>

                          <div className="flex items-center space-x-4 pt-1 text-xs text-slate-700 dark:text-slate-300 font-semibold flex-wrap gap-y-1">
                            <span>Budget: <strong className="text-slate-900">${draft.budget || '0'}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong className="text-slate-900">{draft.duration || '3 Weeks'}</strong></span>
                            <span>•</span>
                            <span>Milestones: <strong className="text-slate-900">{draft.milestoneItems?.length || 0} Phases</strong></span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300">Saved: {draft.savedAt || 'Recently'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            onClick={() => handleResumeDraft(draft)}
                            className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Resume & Publish Draft</span>
                            <span>→</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center text-2xl mx-auto font-bold">
                    📂
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">No projects found</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">No marketplace projects match your selected filter or search query.</p>
                  </div>
                  <button 
                    onClick={() => setShowPostProjectModal(true)}
                    className="px-5 py-2.5 bg-[#2563eb] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
                  >
                    + Post New Project
                  </button>
                </div>
              ) : (
                filteredProjects.map(p => {
                  const pApplicantCount = getProjectApplicantCount(p);
                  const pProgressPct = getProjectProgress(p);

                  // Find hired freelancer and contract ID
                  const acceptedProp = proposals.find(pr => (pr.projectId === p.id || (pr.projectTitle || pr.project) === p.title) && (pr.status === 'Accepted' || pr.status === 'Hired'));
                  const hiredName = p.hiredFreelancer || p.freelancer || (acceptedProp ? acceptedProp.freelancer : null);
                  const linkedContract = contracts.find(c => (c.projectName || c.project || '').toLowerCase().trim() === (p.title || '').toLowerCase().trim());
                  const contractCode = p.contractId || (linkedContract ? (linkedContract.contractId || linkedContract.id) : null);

                  const isCompleted = p.status === 'Completed' || pProgressPct === 100;
                  const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
                  const isHiring = !hiredName && !linkedContract && (p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open');
                  const isInProgress = !isHiring && !isCompleted && !isClosed;

                  return (
                    <div 
                      key={p.id} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4 transition-all hover:border-slate-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                              {formatTitle(p.title)}
                            </h3>

                            {/* Dynamic Status Badges */}
                            {isHiring && (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                Hiring
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                                In Progress ({pProgressPct}%)
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Completed
                              </span>
                            )}
                            {isClosed && (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                                Closed
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-slate-700">
                            Category: <span className="text-[#2563eb] font-bold">{p.category}</span>
                          </p>

                          {/* Required Skills Pills */}
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Required Skills:</span>
                            {(Array.isArray(p.skills) ? p.skills : (p.skills || '').split(',')).map((sk, idx) => (
                              <span key={idx} className="bg-blue-50 text-[#2563eb] font-extrabold text-xs px-2.5 py-0.5 rounded-lg border border-blue-100">
                                {sk.trim()}
                              </span>
                            ))}
                          </div>

                          {/* Details Row */}
                          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 flex-wrap gap-y-1">
                            <p>Posted: <span className="text-slate-800 font-bold">{p.postedDate || 'Just Now'}</span></p>
                            <p>•</p>
                            <p>Duration: <span className="text-slate-800 font-bold">{p.duration || '3 Weeks'}</span></p>
                            <p>•</p>
                            <p>Applicants: <span className="text-slate-900 font-extrabold text-sm bg-slate-100 px-2 py-0.5 rounded-md">{pApplicantCount}</span></p>
                            {hiredName && (
                              <>
                                <p>•</p>
                                <p>Hired Freelancer: <span className="text-[#2563eb] font-extrabold">{hiredName}</span></p>
                              </>
                            )}
                            {contractCode && (
                              <>
                                <p>•</p>
                                <p>Contract: <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{contractCode}</span></p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right Budget */}
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-slate-900 text-xl sm:text-2xl block">{formatCurrency(p.budget)}</span>
                          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">Agreed Budget</span>
                        </div>
                      </div>



                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                          {isHiring ? (
                            <>
                              <button 
                                onClick={() => {
                                  setApplicationFilter('All');
                                  setActiveTab('applications');
                                }}
                                className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-xs cursor-pointer flex items-center space-x-1.5"
                              >
                                <span>📋</span>
                                <span>View Applications ({pApplicantCount})</span>
                              </button>

                              <button 
                                onClick={() => setSelectedManageProject(p)}
                                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                              >
                                <span>⚙️</span>
                                <span>Manage Project</span>
                              </button>

                              <button 
                                onClick={() => handleClosePosting(p)}
                                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                              >
                                <span>🔒</span>
                                <span>Close Posting</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setSelectedProjectDetailView(p)}
                                className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-xs cursor-pointer flex items-center space-x-1.5"
                              >
                                <span>👁️</span>
                                <span>View Project Details</span>
                              </button>

                              {linkedContract && (
                                <button 
                                  onClick={() => setSelectedContractDetail(linkedContract)}
                                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                                >
                                  <span>📄</span>
                                  <span>View Contract ({contractCode})</span>
                                </button>
                              )}

                              <button 
                                onClick={() => { setSelectedKanbanProject(p.title); setActiveTab('kanban'); }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                              >
                                <span>📌</span>
                                <span>Sprint Task Board</span>
                              </button>
                            </>
                          )}
                        </div>

                        <div className="text-right">
                          <button 
                            onClick={() => handleDeleteProject(p.id, p.title)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                          >
                            Delete Project
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT APPLICATIONS (Proposals Inbox) */}
        {activeTab === 'applications' && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Project Applications ({proposals.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal mt-1">
                  Review incoming freelancer bids, inspect cover letters, and hire candidates.
                </p>
              </div>

              {/* Filter Tabs for Applications */}
              <div className="flex items-center space-x-2 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs">
                {['All', 'Pending Review', 'Hired / Active'].map(f => (
                  <button
                    key={f}
                    onClick={() => setApplicationFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      applicationFilter === f 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {proposals.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    👥
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">No pending applications</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                    Applications submitted by freelancers for your posted projects will appear here for review.
                  </p>
                </div>
              ) : (
                proposals
                  .filter(pr => {
                    const isAccepted = pr.status === 'Accepted' || pr.status === 'Hired';
                    if (applicationFilter === 'Pending Review') return !isAccepted;
                    if (applicationFilter === 'Hired / Active') return isAccepted;
                    return true;
                  })
                  .map(pr => {
                    const isAccepted = pr.status === 'Accepted' || pr.status === 'Hired';

                    return (
                      <div 
                        key={pr.id} 
                        className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-4 ${
                          isAccepted 
                            ? 'bg-emerald-50/30 border-emerald-200/80 shadow-2xs' 
                            : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-13 h-13 rounded-2xl bg-[#2563eb] text-white font-extrabold text-lg flex items-center justify-center shadow-xs shrink-0">
                              {pr.avatar || pr.freelancer?.charAt(0) || 'H'}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h4 className="font-extrabold text-lg text-slate-900 leading-snug">{pr.freelancer}</h4>
                                {isAccepted && (
                                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                                    ✓ Hired & Active Contract
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-[#2563eb] mt-0.5">
                                {pr.title} • <span className="text-amber-500 font-extrabold">★ {pr.rating}</span>
                              </p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                Applied for: <span className="text-slate-900 font-extrabold">{pr.projectTitle || pr.project}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xl font-extrabold text-slate-900 block">{pr.bid || pr.bidAmount}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{pr.delivery || pr.deliveryTime} Delivery</span>
                          </div>
                        </div>

                        <p className="text-xs italic p-4 rounded-2xl border border-slate-200/60 bg-slate-50/80 text-slate-800 leading-relaxed font-medium">
                          "{pr.coverLetter || pr.proposalText}"
                        </p>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <button 
                            onClick={() => { setSelectedChat(pr.freelancer); setActiveTab('messages'); }} 
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <span>💬</span>
                            <span>Send Message</span>
                          </button>

                          {isAccepted ? (
                            <>
                              <button 
                                onClick={() => setActiveTab('freelancers')}
                                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                              >
                                <span>👥 View in Hired Roster ➔</span>
                              </button>

                              <button 
                                onClick={() => { 
                                  setSelectedKanbanProject(pr.projectTitle || pr.project || 'All'); 
                                  setActiveTab('kanban'); 
                                  window.dispatchEvent(new Event('freematch_kanban_event'));
                                }}
                                className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                              >
                                <span>📌 Track Sprint Task</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setProposals(prev => prev.filter(item => item.id !== pr.id));
                                  setToast({ message: `Proposal from ${pr.freelancer} rejected.`, type: 'info' });
                                }} 
                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                              >
                                Reject Proposal
                              </button>

                              <button 
                                onClick={() => handleAcceptProposal(pr)} 
                                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                              >
                                <span>✓</span>
                                <span>Hire Freelancer Now</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: HIRED FREELANCERS ROSTER */}
        {activeTab === 'freelancers' && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hired Freelancers Roster ({hiredFreelancers.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal mt-1">
                Active contracts, performance tracking, and direct communication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hiredFreelancers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 col-span-full">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    💼
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">No freelancers hired yet</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-md mx-auto">
                      When you accept a freelancer proposal, your hired talent roster will be displayed here.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>View Applications →</span>
                  </button>
                </div>
              ) : (
                hiredFreelancers.map(hf => (
                  <div 
                    key={hf.id} 
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-6 transition-all hover:border-slate-300"
                  >
                    <div className="space-y-4">
                      {/* Header: Avatar + Name + Title */}
                      <div className="flex items-center space-x-4">
                        <div className="w-13 h-13 rounded-2xl bg-[#2563eb] text-white font-extrabold text-lg flex items-center justify-center shadow-xs shrink-0">
                          {hf.avatar}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight leading-snug">
                            {hf.name}
                          </h3>
                          <p className="text-xs font-bold text-[#2563eb] mt-0.5">
                            {hf.title}
                          </p>
                        </div>
                      </div>

                      {/* Metadata Rows: Active Project, Hourly Rate, Hired Date */}
                      <div className="pt-4 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Active Project:
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 text-right">
                            {hf.project}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Hourly Rate:
                          </span>
                          <span className="text-xs font-extrabold text-emerald-600">
                            {hf.rate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Hired Date:
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {hf.hiredDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Buttons */}
                    <div className="space-y-2.5 pt-2">
                      <button 
                        onClick={() => setSelectedProfileFreelancer(hf)} 
                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200/80 rounded-xl text-sm font-bold transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <span>👤</span>
                        <span>View Profile & Reviews</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button 
                          onClick={() => { setSelectedChat(hf.name); setActiveTab('messages'); }} 
                          className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer text-center shadow-xs flex items-center justify-center space-x-1"
                        >
                          <span>💬 Chat</span>
                        </button>

                        <button 
                          onClick={() => { setSelectedKanbanProject(hf.project || 'All'); setActiveTab('kanban'); }} 
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer text-center border border-slate-200 flex items-center justify-center space-x-1"
                        >
                          <span>📌 Tasks</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CONTRACTS AGREEMENT HUB */}
        {activeTab === 'contracts' && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Contracts & Milestone Agreements ({contracts.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal mt-1">
                  Legal escrow hold agreements, terms of service, and freelancer contract documents.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center space-x-2 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs">
                {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setContractFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      contractFilter === f 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {contracts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    📋
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">No active contracts yet</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                    Contracts are automatically created when you accept a freelancer's proposal.
                  </p>
                </div>
              ) : (
                contracts.map(c => {
                  const cId = c.contractId || c.id;
                  const cProject = c.projectName || c.project;
                  const cFreelancer = c.freelancerName || c.freelancer;
                  const cAmount = formatCurrency(c.agreedAmount || c.agreed_amount || c.amount);
                  const cEscrow = formatCurrency(c.escrowBalance || c.escrow || c.amount);
                  const cDate = c.startDate || 'Aug 10, 2026';

                  return (
                    <div 
                      key={c.id || cId} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-slate-300"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                          <span className="font-extrabold text-[#2563eb] text-xs px-3 py-1 rounded-xl bg-blue-50 border border-blue-200/80 shadow-2xs">
                            {cId}
                          </span>
                          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                            {cProject}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                            c.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : c.status === 'Completed'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-rose-100 text-rose-700 border-rose-200'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm font-semibold text-slate-700 pt-1 flex-wrap gap-y-1">
                          <p>Freelancer: <span className="text-slate-900 font-extrabold">{cFreelancer}</span></p>
                          <p>•</p>
                          <p>Start Date: <span className="text-slate-800 font-bold">{cDate}</span></p>
                          <p>•</p>
                          <p>Escrow Funded Balance: <span className="text-emerald-600 font-extrabold">{cEscrow}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-2">
                        <div className="text-right mr-2 hidden lg:block">
                          <span className="font-extrabold text-slate-900 text-lg block">{cAmount}</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">Agreed Budget</span>
                        </div>

                        <button 
                          onClick={() => handleDownloadContractPDF(c)}
                          className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-xs cursor-pointer flex items-center space-x-1"
                        >
                          <span>📄</span>
                          <span>Download Contract PDF</span>
                        </button>

                        <button 
                          onClick={() => setSelectedContractDetail(c)}
                          className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>👁️</span>
                          <span>View Contract</span>
                        </button>

                        <button 
                          onClick={() => handleRemoveContract(c)}
                          className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                          title="Remove contract agreement"
                        >
                          <span>🗑️</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: SAVED FREELANCERS ROSTER */}
        {activeTab === 'saved-freelancers' && (
          <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Freelancers ({savedFreelancers.length})</h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                  Manage your bookmarked talent, view candidate profiles, and hire freelancers directly into active projects.
                </p>
              </div>
              <button onClick={() => setActiveTab('applications')} className="px-4 py-2 bg-blue-50 text-[#2563eb] hover:bg-blue-100 rounded-xl text-sm font-extrabold cursor-pointer border border-blue-200">
                Explore Candidates →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedFreelancers.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl mx-auto">⭐</div>
                  <h3 className="font-extrabold text-slate-900 text-base">No Saved Freelancers Yet</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto font-medium">Bookmark top talent from proposals or candidate search to quickly hire them for future projects.</p>
                </div>
              ) : (
                savedFreelancers.map((sf, idx) => (
                  <div key={sf.id || idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                            {sf.avatar || (sf.name ? sf.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FL')}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900">{sf.name}</h3>
                            <p className="text-xs text-blue-600 font-bold">{sf.title || 'Software Engineer'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          {sf.hourly_rate || '₹85/hr'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-sm font-semibold text-slate-700">
                        <span className="text-amber-500 flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{sf.rating || 5.0} / 5.0</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">100% Job Success</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">SKILLS & EXPERTISE</span>
                        <p className="text-xs font-medium text-slate-700">{sf.skills || 'React, Python, Django'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRemoveSavedFreelancer(sf.freelancer_id || sf.name)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        Remove 🗑️
                      </button>
                      <button
                        onClick={() => handleHireSavedFreelancer(sf)}
                        className="px-3 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        Hire Freelancer 🚀
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: PROJECT PROGRESS (4 KANBAN COLUMNS: To-Do, In Progress, Under Review, Done) */}
        {activeTab === 'kanban' && (
          <div className="p-8">
            <KanbanBoard role="client" currentUserName={userSession?.name || 'Abhilash K K'} initialProjectFilter={selectedKanbanProject} isDark={isDark} />
          </div>
        )}

        {/* TAB 8: MESSAGES CHAT WORKSPACE */}
        {activeTab === 'messages' && (
          <div className="p-8">
            <MessagingCenter
              userSession={userSession}
              role="client"
              isDark={isDark}
              onNavigateToContract={() => setActiveTab('contracts')}
              onNavigateToProject={() => setActiveTab('projects')}
            />
          </div>
        )}

        {/* TAB 9: PAYMENTS & ESCROW HUB */}
        {activeTab === 'payments' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Payments & Escrow Management</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">Track milestone deposits, release funds to freelancers, and download tax invoices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border border-amber-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">ESCROW LOCKED BALANCE</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">₹6,500</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Held securely in milestone escrow</p>
              </div>

              <div className={`p-6 rounded-3xl border border-emerald-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">TOTAL RELEASED PAYMENTS</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">₹36,000</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Successfully paid to freelancers</p>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">CONNECTED GATEWAY</p>
                <p className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Stripe & Razorpay</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Auto-escrow verification active</p>
              </div>
            </div>

            {/* Transaction Invoice Table */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <h3 className="font-bold text-sm mb-4">Milestone Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-600 dark:text-slate-300' : 'border-slate-200 text-slate-700 dark:text-slate-300'}`}>
                      <th className="pb-3 font-bold">Invoice ID</th>
                      <th className="pb-3 font-bold">Date</th>
                      <th className="pb-3 font-bold">Project & Milestone</th>
                      <th className="pb-3 font-bold">Type</th>
                      <th className="pb-3 font-bold">Amount</th>
                      <th className="pb-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.map(py => (
                      <tr key={py.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-blue-400">{py.id}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{py.date}</td>
                        <td className="py-3">
                          <p className="font-bold">{py.project}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{py.milestone}</p>
                        </td>
                        <td className={`py-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{py.type}</td>
                        <td className={`py-3 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(py.amount)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            py.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {py.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: REVIEWS & PERFORMANCE FEEDBACK */}
        {activeTab === 'reviews' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Reviews & Performance Feedback</h2>
              <p className="text-sm font-semibold text-slate-700 mt-1">Rate completed freelancer deliverables, update database performance metrics, and inspect review history.</p>
            </div>

            {/* 1. Review Submission Form with Target Candidate Selector */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Leave Performance Rating for Completed Contract</h3>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">Submitted ratings feed into freelancer public profiles and AI matching algorithms.</p>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">SELECT COMPLETED FREELANCER / PROJECT</label>
                  <select
                    value={selectedCandidate.id}
                    onChange={(e) => {
                      const found = REVIEWABLE_CANDIDATES.find(c => c.id === e.target.value);
                      if (found) setSelectedCandidate(found);
                    }}
                    className="w-full sm:w-auto p-3 border rounded-xl text-sm font-extrabold focus:outline-none focus:border-blue-500 bg-slate-50 border-slate-300 text-slate-900 shadow-2xs cursor-pointer"
                  >
                    {REVIEWABLE_CANDIDATES.map(cand => (
                      <option key={cand.id} value={cand.id}>
                        {cand.freelancer} — {cand.projectTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Candidate Preview Banner */}
              <div className="p-4.5 rounded-2xl border flex items-center justify-between bg-blue-50/90 border-blue-200 shadow-2xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-md">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900">{selectedCandidate.freelancer}</h4>
                    <p className="text-sm text-blue-700 font-extrabold mt-0.5">Project: {selectedCandidate.projectTitle}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">Agreed Rate: {formatHourlyRate(selectedCandidate.rate)}</span>
              </div>

              <form onSubmit={handleAddReview} className="space-y-5">
                
                {/* 4. Granular Category Ratings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 rounded-2xl border bg-slate-100/90 border-slate-300 shadow-2xs">
                  
                  {/* Communication */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black block text-slate-900">💬 Communication</label>
                    <div className="flex items-center space-x-1.5 text-amber-500 text-2xl">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setCommRating(s)}
                          className={`cursor-pointer transition-transform hover:scale-110 ${commRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-sm font-black text-slate-900 ml-2">{commRating}/5</span>
                    </div>
                  </div>

                  {/* Code Quality */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black block text-slate-900">💻 Code Quality</label>
                    <div className="flex items-center space-x-1.5 text-amber-500 text-2xl">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setCodeRating(s)}
                          className={`cursor-pointer transition-transform hover:scale-110 ${codeRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-sm font-black text-slate-900 ml-2">{codeRating}/5</span>
                    </div>
                  </div>

                  {/* Deadline Adherence */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-black block text-slate-900">⏱️ Deadline Adherence</label>
                    <div className="flex items-center space-x-1.5 text-amber-500 text-2xl">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setDeadlineRating(s)}
                          className={`cursor-pointer transition-transform hover:scale-110 ${deadlineRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-sm font-black text-slate-900 ml-2">{deadlineRating}/5</span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    Overall Computed Score: {Math.round((commRating + codeRating + deadlineRating) / 3.0)} / 5 Stars ★
                  </span>
                </div>

                <textarea
                  rows="3"
                  required
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={`Write detailed evaluation for ${selectedCandidate.freelancer} regarding sprint deliverables, unit testing, and communication...`}
                  className="w-full p-4 border rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-900 border-slate-300 placeholder:text-slate-500 shadow-2xs"
                ></textarea>

                <button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-md cursor-pointer transition-all">
                  Submit Review & Boost AI Match Score
                </button>
              </form>
            </div>

            {/* 3. Separate Given vs Received Filter Tabs */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-black text-xl text-slate-900">Review History</h3>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReviewTab('given')}
                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                      reviewTab === 'given' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Reviews Given ({reviews.filter(r => r.type === 'given').length})
                  </button>
                  <button
                    onClick={() => setReviewTab('received')}
                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                      reviewTab === 'received' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Reviews Received ({reviews.filter(r => r.type === 'received').length})
                  </button>
                </div>
              </div>

              {/* 2. Review History Cards with Project Context */}
              <div className="space-y-3.5">
                {reviews.filter(r => r.type === reviewTab).map(rv => (
                  <div key={rv.id} className="p-5 sm:p-6 rounded-2xl border space-y-3 bg-white border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-black text-base text-slate-900">{rv.reviewer}</span>
                        <span className="text-slate-600 font-extrabold text-sm mx-1">➔</span>
                        <span className="text-blue-700 text-base font-black">{rv.reviewee}</span>
                        {/* Project Context */}
                        <span className="text-sm font-bold text-slate-700">
                          (Project: <span className="font-black text-slate-900">{rv.projectTitle}</span>)
                        </span>
                      </div>
                      <div className="text-amber-500 text-base font-black flex items-center space-x-1">
                        <span>{'★'.repeat(rv.rating)}</span>
                        <span className="font-mono text-sm font-black text-slate-800">({rv.rating}/5)</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold italic p-4 rounded-xl border bg-slate-100/90 border-slate-300 text-slate-900 shadow-2xs leading-relaxed">
                      "{rv.comment}"
                    </p>

                    <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                      <span>Posted: {rv.date}</span>
                      {rv.comm && (
                        <span className="text-slate-900 font-extrabold">
                          💬 Comm: {rv.comm}★ • 💻 Quality: {rv.code}★ • ⏱️ Deadline: {rv.deadline}★
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: NOTIFICATIONS & ACTIVITY LOG */}
        {activeTab === 'notifications' && (
          <div className="p-8">
            <NotificationCenter userSession={userSession} onNavigateTab={setActiveTab} />
          </div>
        )}
        {/* TAB 12: CLIENT PUBLIC & COMPANY PROFILE DASHBOARD */}
        {activeTab === 'profile' && (
          <ClientProfileView
            userSession={userSession}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isDark={isDark}
            clientProjects={clientProjects}
            hiredFreelancers={hiredFreelancers}
            contracts={contracts}
            onNavigateTab={setActiveTab}
            showToastMessage={(msg, type) => setToast({ message: msg, type })}
          />
        )}

        {/* TAB 13: ENTERPRISE ACCOUNT & SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <ClientSettingsView
            userSession={userSession}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isDark={isDark}
            onNavigateTab={setActiveTab}
            showToastMessage={(msg, type) => setToast({ message: msg, type })}
          />
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-lg w-full border shadow-2xl ${
            isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold">Edit Client Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Update public company profile and display credentials.</p>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-600 dark:text-slate-300 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* PROFILE PICTURE CONTROLS */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#040919] border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <label className="block text-sm font-extrabold text-blue-500 uppercase">Profile Picture</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current / Preview Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-[#2563eb] text-white font-extrabold text-xl flex items-center justify-center overflow-hidden border-2 border-blue-500/30 shrink-0">
                    {clientAvatarPreview || editAvatarUrl ? (
                      <img 
                        src={clientAvatarPreview || editAvatarUrl} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CL'}</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-all inline-flex items-center space-x-1 shadow-xs">
                        <span>📤</span>
                        <span>{editAvatarUrl || clientAvatarPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          onChange={handleClientAvatarSelect}
                          className="hidden" 
                        />
                      </label>

                      {(clientAvatarPreview || editAvatarUrl) && (
                        <button
                          type="button"
                          onClick={confirmRemoveClientAvatar}
                          className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Remove Picture</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Supported formats: JPG, PNG, WEBP. Maximum file size: 5MB.
                    </p>
                    {clientAvatarError && (
                      <p className="text-rose-400 text-xs font-extrabold">{clientAvatarError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-1 uppercase">Display Name</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-1 uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-1 uppercase">Industry</label>
                  <input
                    type="text"
                    required
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-1 uppercase">Website</label>
                  <input
                    type="text"
                    required
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-600 dark:text-slate-300 mb-1 uppercase">Company Description / About Us</label>
                <textarea
                  rows="4"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: POST PROJECT STEP-BY-STEP MODAL */}
      {showPostProjectModal && (() => {
        const totalMilestoneSum = milestoneItems.reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0);
        const numBudget = parseFloat(budget) || 0;
        const isBudgetMatched = numBudget > 0 && Math.abs(totalMilestoneSum - numBudget) < 0.01;
        const hasBudgetMismatch = numBudget > 0 && !isBudgetMatched;

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className={`max-w-5xl w-full max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
              isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* FIXED MODAL HEADER */}
              <div className={`shrink-0 border-b p-6 sm:px-8 space-y-4 ${
                isDark ? 'bg-[#060e22]/90 border-slate-800' : 'bg-slate-50/80 border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shadow-2xs shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">Post New Marketplace Project</h3>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Define your project requirements, budget, milestones, and deliverables.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPostProjectModal(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-200/80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* STEP INDICATOR BAR */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-bold overflow-x-auto gap-2 scrollbar-none">
                  <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full shrink-0">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
                    <span className="font-extrabold text-blue-700">Project Details</span>
                  </div>
                  <div className="text-slate-400 font-bold">──</div>
                  <div className="flex items-center space-x-2 text-slate-700 px-3 py-1.5 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">2</span>
                    <span className="font-bold text-slate-700">Budget & Timeline</span>
                  </div>
                  <div className="text-slate-400 font-bold">──</div>
                  <div className="flex items-center space-x-2 text-slate-700 px-3 py-1.5 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">3</span>
                    <span className="font-bold text-slate-700">Milestones</span>
                  </div>
                  <div className="text-slate-400 font-bold">──</div>
                  <div className="flex items-center space-x-2 text-slate-700 px-3 py-1.5 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">4</span>
                    <span className="font-bold text-slate-700">Additional Details</span>
                  </div>
                  <div className="text-slate-400 font-bold">──</div>
                  <div className="flex items-center space-x-2 text-slate-700 px-3 py-1.5 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">5</span>
                    <span className="font-bold text-slate-700">Review & Publish</span>
                  </div>
                </div>

                {/* SAVED DRAFT RESUME BANNER */}
                {savedDraftsList.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-100/90 border border-amber-300 flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                      <div className="truncate">
                        <span className="font-black text-amber-950 truncate block text-xs">
                          Saved Draft Available: "{savedDraftsList[0].projectTitle || 'Untitled Project Draft'}"
                        </span>
                        <span className="text-xs text-amber-900 block font-bold mt-0.5">
                          Saved: {savedDraftsList[0].savedAt || 'Recently'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResumeDraft(savedDraftsList[0])}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                      >
                        Resume Draft
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL FORM WRAPPER */}
              <form onSubmit={handlePostProject} className="flex-1 flex flex-col min-h-0">
                
                {/* SCROLLABLE CONTENT BODY */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                {/* 1. PROJECT DETAILS SECTION */}
                <div className={`p-6 rounded-2xl border space-y-5 ${
                  isDark ? 'bg-[#060e22] border-slate-800' : 'bg-slate-50/50 border-slate-200/80'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">PROJECT DETAILS</h4>
                      <p className="text-xs text-slate-700 font-semibold">Tell us about your project and what you need</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Project Title */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-black text-slate-900">
                        Project Title <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={projectTitle} 
                        onChange={(e) => setProjectTitle(e.target.value)} 
                        placeholder="e.g. AI-powered document analysis platform" 
                        className="w-full p-3 border rounded-xl text-xs font-bold bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xs" 
                      />
                    </div>

                    {/* Required Skills Chip Input */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-black text-slate-900">
                        Required Skills <span className="text-rose-500">*</span>
                      </label>
                      <div className="p-2 border rounded-xl flex flex-wrap items-center gap-1.5 min-h-[42px] bg-white border-slate-300 focus-within:border-blue-500 transition-all shadow-2xs">
                        {currentSkillsList.map(skill => (
                          <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-extrabold">
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkillTag(skill)} 
                              className="hover:text-rose-500 ml-0.5 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillTagInput}
                          onChange={(e) => {
                            if (e.target.value.includes(',')) {
                              handleAddSkillTag(e.target.value);
                            } else {
                              setSkillTagInput(e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              handleAddSkillTag(skillTagInput);
                            }
                          }}
                          onBlur={() => {
                            if (skillTagInput.trim()) handleAddSkillTag(skillTagInput);
                          }}
                          placeholder={currentSkillsList.length === 0 ? "Add skills and press Enter (e.g. React, Python)" : "Add skill..."}
                          className="flex-1 min-w-[120px] bg-transparent text-xs font-bold text-slate-900 focus:outline-none p-1 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Category Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-black text-slate-900">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full p-3 pr-8 border rounded-xl text-xs font-bold bg-white border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 appearance-none transition-all shadow-2xs"
                        >
                          <option value="Software Development">Software Development</option>
                          <option value="Data Science & AI">Data Science & AI</option>
                          <option value="UI/UX & Visual Design">UI/UX & Visual Design</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-700 absolute right-3 top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Estimated Duration */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-black text-slate-900">
                        Estimated Duration <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full p-3 pr-8 border rounded-xl text-xs font-bold bg-white border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 appearance-none transition-all shadow-2xs"
                        >
                          <option value="1 Week">1 Week</option>
                          <option value="2 Weeks">2 Weeks</option>
                          <option value="3 Weeks">3 Weeks</option>
                          <option value="1 Month">1 Month</option>
                          <option value="2 Months">2 Months</option>
                          <option value="3+ Months">3+ Months</option>
                        </select>
                        <Clock className="w-4 h-4 text-slate-700 absolute right-3 top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2 & 3. BUDGET & TIMELINE + PAYMENT MILESTONES (2-COLUMN GRID) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT: BUDGET & TIMELINE */}
                  <div className="lg:col-span-5 p-6 rounded-2xl border space-y-5 flex flex-col justify-between bg-slate-50/50 border-slate-200/80">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">BUDGET & TIMELINE</h4>
                          <p className="text-xs text-slate-700 font-semibold">Set your budget and project duration</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-black text-slate-900">
                          Total Budget (₹ INR) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-slate-900 font-black text-sm">₹</span>
                          <input 
                            type="number" 
                            required 
                            value={budget} 
                            onChange={(e) => setBudget(e.target.value)} 
                            placeholder="5,000" 
                            className="w-full p-3 pl-8 border rounded-xl text-sm font-black bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xs" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Escrow Notice Box */}
                    <div className="p-4 rounded-xl border flex items-start space-x-3 bg-emerald-50/90 border-emerald-300 text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold leading-relaxed">
                        Your payment will be securely held in escrow and released based on milestone completion.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: PAYMENT MILESTONES */}
                  <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-4 flex flex-col justify-between ${
                    isDark ? 'bg-[#060e22] border-slate-800' : 'bg-slate-50/50 border-slate-200/80'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                            <Milestone className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">PAYMENT MILESTONES</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Break down your project into milestone phases</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMilestoneItems([
                              ...milestoneItems, 
                              { id: Date.now(), title: `Phase ${milestoneItems.length + 1}: Deliverable`, amount: '1000' }
                            ]);
                          }}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          + Add Milestone
                        </button>
                      </div>

                      {/* Milestone List Rows */}
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {milestoneItems.map((ms, idx) => (
                          <div key={ms.id || idx} className="p-2.5 rounded-xl border flex items-center space-x-2.5 bg-white border-slate-300 shadow-2xs">
                            <GripVertical className="w-4 h-4 text-slate-700 shrink-0 cursor-grab" />
                            <input 
                              type="text" 
                              value={ms.title} 
                              onChange={(e) => {
                                const updated = [...milestoneItems];
                                updated[idx].title = e.target.value;
                                setMilestoneItems(updated);
                              }}
                              placeholder="Milestone Phase Title"
                              className="flex-1 p-2 border rounded-lg text-xs font-bold text-slate-900 bg-slate-50 border-slate-300 focus:outline-none focus:border-blue-500" 
                            />
                            <div className="relative w-32 shrink-0">
                              <span className="absolute left-2.5 top-2 text-slate-900 text-xs font-black">₹</span>
                              <input 
                                type="number" 
                                value={ms.amount} 
                                onChange={(e) => {
                                  const updated = [...milestoneItems];
                                  updated[idx].amount = e.target.value;
                                  setMilestoneItems(updated);
                                }}
                                placeholder="1,000"
                                className="w-full p-2 pl-6 border rounded-lg text-xs font-black text-slate-900 text-right bg-slate-50 border-slate-300 focus:outline-none focus:border-blue-500" 
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (milestoneItems.length > 1) {
                                  setMilestoneItems(milestoneItems.filter((_, i) => i !== idx));
                                }
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestone Footer Summary Bar */}
                    <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 mt-2 text-xs ${
                      hasBudgetMismatch 
                        ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold' 
                        : 'bg-slate-100 border-slate-300 text-slate-900 font-bold'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-xs uppercase font-black text-slate-800 block">Total Budget</span>
                          <span className="font-black text-blue-700 text-sm">₹{numBudget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                        </div>
                        <div className="border-l border-slate-300 pl-4">
                          <span className="text-xs uppercase font-black text-slate-800 block">Allocated Milestones</span>
                          <span className={`font-black text-sm ${hasBudgetMismatch ? 'text-amber-800' : 'text-emerald-700'}`}>
                            ₹{totalMilestoneSum.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isBudgetMatched ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Budget Matched
                          </span>
                        ) : hasBudgetMismatch ? (
                          <span className="px-2.5 py-1 bg-amber-200 text-amber-950 border border-amber-400 text-xs font-black rounded-lg flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-900" /> Milestones total ₹{totalMilestoneSum.toLocaleString()} vs Budget ₹{numBudget.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4 & 5. SCOPE & DESCRIPTION + FILE ATTACHMENT (2-COLUMN GRID) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: PROJECT SCOPE & DESCRIPTION */}
                  <div className="p-6 rounded-2xl border space-y-3 flex flex-col justify-between bg-slate-50/50 border-slate-200/80">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">PROJECT SCOPE & DESCRIPTION</h4>
                          <p className="text-xs text-slate-700 font-semibold">Describe your project goals, requirements, and expectations</p>
                        </div>
                      </div>

                      <textarea 
                        rows="5" 
                        required 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        maxLength={2000}
                        placeholder="Outline your project requirements, key deliverables, technical specifications, and expected outcomes..." 
                        className="w-full p-3.5 border rounded-xl text-xs font-bold text-slate-900 bg-white border-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                      ></textarea>
                    </div>

                    <div className="text-right text-xs font-black text-slate-700">
                      {(description || '').length} / 2000
                    </div>
                  </div>

                  {/* RIGHT: ATTACH DOCUMENTS & SPECS */}
                  <div className="p-6 rounded-2xl border space-y-3 flex flex-col justify-between bg-slate-50/50 border-slate-200/80">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">ATTACH SPECS (OPTIONAL)</h4>
                            <p className="text-xs text-slate-700 font-semibold">Upload project briefs or reference diagrams</p>
                          </div>
                        </div>
                        <span className="text-xs text-blue-700 font-black bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Optional</span>
                      </div>

                      {attachedFile ? (
                        <div className="p-4 rounded-xl border flex items-center justify-between bg-blue-50/90 border-blue-200 text-slate-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
                              {attachedFile.isImage ? 'IMG' : 'PDF'}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-900 truncate max-w-[180px]">{attachedFile.name}</p>
                              <p className="text-xs text-slate-700 font-bold">{attachedFile.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white flex flex-col items-center justify-center cursor-pointer transition-all">
                          <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
                          <span className="text-xs font-extrabold text-blue-700">Drag & drop files here or click to browse</span>
                          <span className="text-xs text-slate-700 font-semibold mt-1 text-center">Supports PDF, DOCX, PNG, JPG, Architecture Diagrams (Max 25MB)</span>
                          <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                </div>

                {/* 6. ADDITIONAL TECHNICAL NOTES / GITHUB LINK */}
                <div className="p-6 rounded-2xl border space-y-3 bg-slate-50/50 border-slate-200/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">ADDITIONAL TECHNICAL NOTES / GITHUB LINK (OPTIONAL)</h4>
                      <p className="text-xs text-slate-700 font-semibold">Share any technical notes, references, or GitHub repository link</p>
                    </div>
                  </div>

                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input 
                      type="text"
                      value={projectAbstract} 
                      onChange={(e) => setProjectAbstract(e.target.value)} 
                      placeholder="e.g., https://github.com/username/project or additional technical requirements..." 
                      className="w-full p-3 pl-10 border rounded-xl text-xs font-bold text-slate-900 bg-white border-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                </div>

                {/* FIXED MODAL FOOTER */}
                <div className="shrink-0 border-t p-4 sm:px-8 flex items-center justify-between bg-slate-100/90 border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setShowPostProjectModal(false)}
                    className="px-5 py-2.5 text-xs font-black text-slate-900 hover:text-black rounded-xl hover:bg-slate-200/90 transition-all cursor-pointer border border-slate-300"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center space-x-3">
                    <button 
                      type="button" 
                      onClick={handleSaveDraft}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold border bg-white hover:bg-slate-50 text-slate-800 border-slate-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-slate-700" /> Save Draft
                    </button>

                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Publish Project to Marketplace
                    </button>
                  </div>
                </div>

              </form>


            </div>
          </div>
        );
      })()}

      {/* FREELANCER PUBLIC PROFILE & REVIEWS MODAL */}
      {selectedProfileFreelancer && (() => {
        const flName = selectedProfileFreelancer.name || selectedProfileFreelancer.freelancer || selectedProfileFreelancer.freelancerName || 'Alex Mercer';
        
        // Dynamic profile resolution mapping per freelancer account (Rule 13)
        const getFreelancerProfileData = (targetName, rawObj) => {
          const nameClean = (targetName || '').toLowerCase();
          
          if (nameClean.includes('alex')) {
            return {
              name: 'Alex Mercer',
              avatar: 'AM',
              title: 'Senior PyTorch & React Architect',
              headline: 'Senior PyTorch & React Architect',
              location: 'San Francisco, CA',
              hourlyRate: rawObj.rate || rawObj.hourly_rate || '₹75/hr',
              availabilityStatus: 'Available for Work',
              availableHours: '40 hrs/week',
              yearsExperience: '7+',
              projectsCompleted: '18',
              jobSuccessRate: '100%',
              onTimeDelivery: '99%',
              lifetimeEarnings: '₹34,500',
              bio: 'Senior PyTorch & React Engineer specializing in low-latency deep learning inference engines, real-time WebGL/D3.js data visualization, and scalable Python microservices.',
              skills: ['PyTorch ML', 'React.js', 'FastAPI', 'Python', 'CUDA', 'TensorRT', 'D3.js', 'PostgreSQL', 'Vector DB', 'Tailwind CSS'],
              portfolioProjects: [
                { id: 'p_alex_1', title: 'AI Pipeline Optimization', description: 'High-performance inference acceleration engine using PyTorch quantization, TensorRT bindings, and CUDA parallel kernel tuning.', skills: ['PyTorch', 'TensorRT', 'CUDA', 'FastAPI'], status: 'In Progress', completionInfo: 'Active Contract • 4x Speedup' },
                { id: 'p_alex_2', title: 'AI Search Engine & Semantic Vector Index', description: 'Semantic search engine indexing 1M+ technical documents with spaCy NLP and vector embeddings.', skills: ['Python', 'Vector DB', 'FastAPI', 'spaCy'], status: 'Completed', completionInfo: 'Delivered in 4 Weeks' },
                { id: 'p_alex_3', title: 'FinTech High-Frequency Dashboard v2', description: 'Real-time WebSocket trading frontend with D3.js candlestick charts and sub-50ms render latency.', skills: ['React.js', 'D3.js', 'WebSockets', 'Tailwind CSS'], status: 'Completed', completionInfo: 'Delivered in 2 Weeks' }
              ],
              workExperience: [
                { id: 'w_alex_1', role: 'Senior Deep Learning & Full Stack Engineer', organization: 'Independent Consultant', period: '2022 – Present', description: 'Deployed custom ML model inference clusters and high-frequency UI components for Silicon Valley startups.' },
                { id: 'w_alex_2', role: 'Software Engineer (Machine Learning)', organization: 'Horizon AI Labs', period: '2020 – 2022', description: 'Optimized multi-GPU training algorithms and constructed React analytical portals.' }
              ],
              education: [{ degree: 'M.S. in Computer Science', institution: 'UC Berkeley', year: '2020' }],
              certifications: [{ name: 'NVIDIA Deep Learning Institute Specialist', org: 'NVIDIA', date: '2023' }]
            };
          }

          if (nameClean.includes('haines')) {
            return {
              name: 'Haines JP',
              avatar: 'HJ',
              title: 'Senior React, PyTorch & Django Architect',
              headline: 'Senior React, PyTorch & Django Architect',
              location: 'San Francisco, CA',
              hourlyRate: rawObj.rate || rawObj.hourly_rate || '₹75/hr',
              availabilityStatus: 'Available for Work',
              availableHours: '40 hrs/week',
              yearsExperience: '7+',
              projectsCompleted: '24',
              jobSuccessRate: '100%',
              onTimeDelivery: '98%',
              lifetimeEarnings: '₹2,89,000',
              bio: 'Senior Full Stack & Artificial Intelligence Engineer with 7+ years of experience constructing high-performance RESTful APIs, deep learning inference pipelines, and real-time React web applications.',
              skills: ['React.js', 'Python Django', 'PyTorch ML', 'PostgreSQL', 'Tailwind CSS', 'D3.js', 'REST API Architecture', 'OWASP Security', 'FastAPI'],
              portfolioProjects: [
                { id: 'p_haines_1', title: 'AI Automated Test Pipeline', description: 'Automated test execution pipeline with FastAPI and PostgreSQL telemetry.', skills: ['Python', 'FastAPI', 'PostgreSQL'], status: 'Completed', completionInfo: 'Delivered in 3 Weeks' },
                { id: 'p_haines_2', title: 'Enterprise Knowledge Graph', description: 'Graph neural network search engine connecting unstructured text documents with Neo4j vector indexes.', skills: ['Neo4j', 'Python', 'Django'], status: 'Completed', completionInfo: 'Delivered in 4 Weeks' }
              ],
              workExperience: [
                { id: 'w_haines_1', role: 'Principal AI & Full Stack Architect', organization: 'FreeMatch AI Clients', period: '2021 – Present', description: 'Architected deep learning inference servers and real-time React web dashboards.' }
              ],
              education: [{ degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2019' }],
              certifications: [{ name: 'AWS Certified Solutions Architect', org: 'Amazon Web Services', date: '2022' }]
            };
          }

          if (nameClean.includes('sarah')) {
            return {
              name: 'Sarah Chen',
              avatar: 'SC',
              title: 'Senior AI Lead & Data Scientist',
              headline: 'Senior AI Lead & Data Scientist',
              location: 'Boston, MA',
              hourlyRate: rawObj.rate || rawObj.hourly_rate || '₹110/hr',
              availabilityStatus: 'Available for Work',
              availableHours: '30 hrs/week',
              yearsExperience: '8+',
              projectsCompleted: '22',
              jobSuccessRate: '100%',
              onTimeDelivery: '97%',
              lifetimeEarnings: '₹42,000',
              bio: 'Lead Data Scientist & AI Architect focused on NLP models, medical imaging DICOM analysis, and Graph Neural Networks.',
              skills: ['PyTorch', 'LangChain', 'Transformers', 'spaCy', 'Python', 'FastAPI', 'Neo4j', 'PostgreSQL'],
              portfolioProjects: [
                { id: 'p_sarah_1', title: 'Healthcare DICOM NLP Parser', description: 'Medical record search and entity extraction using LangChain and Neo4j graph schemas.', skills: ['Python', 'LangChain', 'Neo4j'], status: 'Completed', completionInfo: 'Delivered in 5 Weeks' }
              ],
              workExperience: [
                { id: 'w_sarah_1', role: 'Staff Data Scientist', organization: 'BioHealth AI', period: '2020 – Present', description: 'Pioneered clinical NLP models and graph algorithms.' }
              ],
              education: [{ degree: 'Ph.D. in Computational Biology', institution: 'MIT', year: '2020' }],
              certifications: [{ name: 'Stanford Online Machine Learning Specialization', org: 'Stanford', date: '2021' }]
            };
          }

          // Fallback for custom/other freelancers
          return {
            name: targetName,
            avatar: rawObj.avatar || (targetName ? targetName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'FL'),
            title: rawObj.title || 'Senior Software Engineer',
            headline: rawObj.title || 'Senior Software Engineer & AI Specialist',
            location: rawObj.location || 'San Francisco, CA',
            hourlyRate: rawObj.rate || rawObj.hourly_rate || '₹75/hr',
            availabilityStatus: 'Available for Work',
            availableHours: '40 hrs/week',
            yearsExperience: '5+',
            projectsCompleted: rawObj.completedProjects || '12',
            jobSuccessRate: '100%',
            onTimeDelivery: '98%',
            lifetimeEarnings: rawObj.earnings || '₹25,000',
            bio: rawObj.bio || `${targetName} is a verified professional freelancer on FreeMatch AI with expertise in modern web stack and cloud solutions.`,
            skills: rawObj.skills ? (Array.isArray(rawObj.skills) ? rawObj.skills : String(rawObj.skills).split(',').map(s=>s.trim())) : ['React.js', 'Python', 'Django', 'PostgreSQL', 'REST API'],
            portfolioProjects: [],
            workExperience: [],
            education: [],
            certifications: []
          };
        };

        const targetProfileData = getFreelancerProfileData(flName, selectedProfileFreelancer);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#060e22] border border-slate-800 shadow-2xl p-2 sm:p-4">
              <FreelancerProfileView
                initialFreelancerData={targetProfileData}
                reviews={reviews}
                viewMode="client"
                isDark={isDark}
                showToast={(msg, type = 'info') => setToast({ message: msg, type })}
                onMessage={(contactName) => {
                  setSelectedChat(contactName);
                  setActiveTab('messages');
                  setSelectedProfileFreelancer(null);
                  setToast({ message: `Opened direct chat workspace with ${contactName}`, type: 'success' });
                }}
                onHire={(targetFl) => {
                  setSelectedProfileFreelancer(null);
                  handleHireSavedFreelancer(targetFl);
                }}
                onClose={() => setSelectedProfileFreelancer(null)}
              />
            </div>
          </div>
        );
      })()}

      {/* CONTRACT DETAILS MODAL */}
      {selectedContractDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-[#2563eb] text-xs px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs">
                    {selectedContractDetail.contractId || selectedContractDetail.id}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {selectedContractDetail.status || 'Active'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  {selectedContractDetail.projectName || selectedContractDetail.project}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedContractDetail(null)} 
                className="text-slate-600 dark:text-slate-300 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Grid 1: Client & Freelancer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Client Information</p>
                <p className="font-extrabold text-slate-900 text-base">{selectedContractDetail.clientName || selectedContractDetail.client || 'Abhilash K K'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Account ID: {selectedContractDetail.clientId || 'client_1'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Freelancer Information</p>
                <p className="font-extrabold text-[#2563eb] text-base">{selectedContractDetail.freelancerName || selectedContractDetail.freelancer || 'Alex Mercer'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Account ID: {selectedContractDetail.freelancerId || 'fl_1'}</p>
              </div>
            </div>

            {/* Grid 2: Financial Terms */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <p className="text-xs font-extrabold text-[#2563eb] uppercase tracking-wider">Financial Terms & Escrow Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 uppercase font-bold block">Agreed Budget</span>
                  <span className="text-base font-extrabold text-slate-900 block">{formatCurrency(selectedContractDetail.agreedAmount || selectedContractDetail.agreed_amount || selectedContractDetail.amount)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 uppercase font-bold block">Escrow Funded</span>
                  <span className="text-base font-extrabold text-emerald-600 block">{formatCurrency(selectedContractDetail.escrowBalance || selectedContractDetail.escrow)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 uppercase font-bold block">Payment Type</span>
                  <span className="text-xs font-bold text-slate-800 block">{selectedContractDetail.paymentType || 'Fixed Price'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 uppercase font-bold block">Hourly Rate</span>
                  <span className="text-xs font-bold text-slate-800 block">{formatHourlyRate(selectedContractDetail.hourlyRate || selectedContractDetail.hourly_rate || '₹75/hr')}</span>
                </div>
              </div>
            </div>

            {/* Milestones Schedule */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Agreed Milestone Breakdown</h4>
              <div className="space-y-2">
                {(selectedContractDetail.milestones && selectedContractDetail.milestones.length > 0) ? (
                  selectedContractDetail.milestones.map(m => (
                    <div key={m.id || m.number} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900">Phase {m.number}: {m.title}</p>
                        <p className="text-slate-700 dark:text-slate-300 text-xs mt-0.5">{m.description || 'Milestone deliverable'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 text-sm block">{formatCurrency(m.amount)}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">{m.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">Phase 1: Full Implementation & Escrow Release</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs mt-0.5">Core project milestone deliverable</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-600 text-sm block">{formatCurrency(selectedContractDetail.agreedAmount || selectedContractDetail.agreed_amount || selectedContractDetail.amount)}</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">In Progress</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button 
                onClick={() => handleDownloadContractPDF(selectedContractDetail)}
                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <span>📄</span>
                <span>Download Contract PDF</span>
              </button>
              <button 
                onClick={() => setSelectedContractDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PROJECT MODAL */}
      {selectedManageProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Manage Project Details</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Edit project scope, required skills, budget, or duration.</p>
              </div>
              <button 
                onClick={() => setSelectedManageProject(null)}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = clientProjects.map(p => p.id === selectedManageProject.id ? selectedManageProject : p);
              setClientProjects(updated);
              localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));

              // Sync to Django API
              fetch('http://localhost:8000/api/projects/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: selectedManageProject.title,
                  category: selectedManageProject.category,
                  budget: selectedManageProject.budget,
                  duration: selectedManageProject.duration,
                  skills: Array.isArray(selectedManageProject.skills) ? selectedManageProject.skills.join(', ') : selectedManageProject.skills,
                  description: selectedManageProject.description
                })
              }).catch(() => {});

              setSelectedManageProject(null);
              setToast({ message: `Project "${selectedManageProject.title}" updated successfully!`, type: 'success' });
              window.dispatchEvent(new Event('freematch_shared_event'));
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={selectedManageProject.title || ''} 
                  onChange={(e) => setSelectedManageProject({ ...selectedManageProject, title: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={selectedManageProject.category || ''} 
                    onChange={(e) => setSelectedManageProject({ ...selectedManageProject, category: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget</label>
                  <input 
                    type="text" 
                    value={selectedManageProject.budget || ''} 
                    onChange={(e) => setSelectedManageProject({ ...selectedManageProject, budget: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={Array.isArray(selectedManageProject.skills) ? selectedManageProject.skills.join(', ') : (selectedManageProject.skills || '')} 
                  onChange={(e) => setSelectedManageProject({ ...selectedManageProject, skills: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration</label>
                <input 
                  type="text" 
                  value={selectedManageProject.duration || ''} 
                  onChange={(e) => setSelectedManageProject({ ...selectedManageProject, duration: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Description</label>
                <textarea 
                  rows={3}
                  value={selectedManageProject.description || ''} 
                  onChange={(e) => setSelectedManageProject({ ...selectedManageProject, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedManageProject(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {selectedProjectDetailView && (() => {
        const p = selectedProjectDetailView;
        const pAppCount = getProjectApplicantCount(p);
        const pProgPct = getProjectProgress(p);
        const acceptedProp = proposals.find(pr => (pr.projectId === p.id || (pr.projectTitle || pr.project) === p.title) && (pr.status === 'Accepted' || pr.status === 'Hired'));
        const hiredName = p.hiredFreelancer || p.freelancer || (acceptedProp ? acceptedProp.freelancer : 'Alex Mercer');
        const linkedContract = contracts.find(c => (c.projectName || c.project || '').toLowerCase().trim() === (p.title || '').toLowerCase().trim());
        const contractCode = p.contractId || (linkedContract ? (linkedContract.contractId || linkedContract.id) : 'CTR-9024');

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-[#2563eb] text-xs px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs">
                      {contractCode}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {p.status || 'In Progress'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    {formatTitle(p.title)}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProjectDetailView(null)} 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-700 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Grid 1: Project Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Project Overview</p>
                  <p className="text-slate-800 font-medium">Category: <span className="text-[#2563eb] font-bold">{p.category}</span></p>
                  <p className="text-slate-800 font-medium">Duration: <span className="font-bold">{p.duration || '3 Weeks'}</span></p>
                  <p className="text-slate-800 font-medium">Agreed Budget: <span className="text-slate-900 font-extrabold">{formatCurrency(p.budget)}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                  <p className="text-xs font-extrabold text-[#2563eb] uppercase tracking-wider">Hired Freelancer & Escrow</p>
                  <p className="text-slate-900 font-extrabold text-sm">{hiredName}</p>
                  <p className="text-slate-600 font-medium">Contract ID: <span className="text-emerald-600 font-bold">{contractCode}</span></p>
                  <p className="text-slate-600 font-medium">Escrow Funded: <span className="text-emerald-600 font-extrabold">{formatCurrency(p.budget)}</span></p>
                </div>
              </div>

              {/* Progress & Milestone Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Sprint Task Completion</span>
                  <span className="text-[#2563eb] font-extrabold">{pProgPct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${pProgPct === 100 ? 'bg-emerald-500' : 'bg-[#2563eb]'}`}
                    style={{ width: `${pProgPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 text-xs">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Synchronized Platform Activity</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">1. Proposal Accepted & Freelancer Hired</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">{hiredName} was assigned to project deliverables.</p>
                    </div>
                    <span className="text-emerald-600 font-bold text-xs">Completed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">2. Contract Created & Escrow Locked</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">Contract {contractCode} generated in database with funded escrow.</p>
                    </div>
                    <span className="text-emerald-600 font-bold text-xs">Completed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">3. Sprint Task Development</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">Active task development on Kanban Board ({pProgPct}% progress).</p>
                    </div>
                    <span className={`font-bold text-xs ${pProgPct === 100 ? 'text-emerald-600' : 'text-[#2563eb]'}`}>
                      {pProgPct === 100 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                {linkedContract && (
                  <button 
                    onClick={() => {
                      setSelectedProjectDetailView(null);
                      setSelectedContractDetail(linkedContract);
                    }}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <span>📄</span>
                    <span>View Contract Document</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedProjectDetailView(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 text-2xl font-bold flex items-center justify-center mx-auto border border-rose-100">
              🚪
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Are you sure you want to logout?</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">You will be signed out of your account session.</p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirmModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  if (onSignOut) onSignOut();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;
