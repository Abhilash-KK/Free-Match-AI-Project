import React, { useState, useEffect, useRef } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';
import NotificationCenter from '../NotificationCenter';
import MessagingCenter from '../MessagingCenter';
import FreelancerProfileView from '../FreelancerProfileView';
import ClientProfileView from '../ClientProfileView';
import ClientSettingsView from '../ClientSettingsView';
import { fetchNotifications } from '../../utils/notificationService';
import { calculateProjectDeadline } from '../../utils/dateUtils';
import { openDocumentViewer } from '../../utils/documentViewer';
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
  ChevronRight,
  Layers,
  Wallet,
  Clock,
  Milestone,
  UploadCloud,
  Code,
  Download,
  Github,
  Send,
  Trash2,
  Eye,
  X,
  GripVertical,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Coins,
  CreditCard,
  Calendar,
  Info
} from 'lucide-react';

// Module-level static demo defaults (only used when logged in as demo_client)
const DEFAULT_PROJECTS = [
  { id: 'cp1', title: 'AI Pipeline Optimization', client: 'TechStream Corp', category: 'Data Science & AI', budget: '₹12,000', duration: '4 Weeks', skills: 'Python, PyTorch', status: 'In Progress', postedDate: 'Aug 01, 2026', progress: 30, applicants: 8, description: 'Optimize deep learning model training pipelines and automate RESTful API inferences.' },
  { id: 'cp2', title: 'FinTech Dashboard v2', client: 'TechStream Corp', category: 'Software Development', budget: '₹6,500', duration: '3 Weeks', skills: 'React, D3.js', status: 'In Progress', postedDate: 'Aug 02, 2026', progress: 30, applicants: 12, description: 'Implementation of a complex data visualization dashboard for crypto asset management.' },
  { id: 'cp3', title: 'Cybersecurity Audit & Shield', client: 'TechStream Corp', category: 'Cybersecurity', budget: '₹4,200', duration: '2 Weeks', skills: 'PenTesting, Python', status: 'Completed', postedDate: 'Jul 28, 2026', progress: 100, applicants: 5, description: 'Penetration testing and security compliance audit.' },
  { id: 'cp4', title: 'AI Search Engine', client: 'TechStream Corp', category: 'Software Development', budget: '₹8,000', duration: '3 Weeks', skills: 'React, Python, Vector DB', status: 'Open for Bids', postedDate: 'Aug 03, 2026', progress: 0, applicants: 4, description: 'Natural language search engine powered by embedding vector databases.' },
  { id: 'cp5', title: 'AI Customer Support Chatbot', client: 'TechStream Corp', category: 'Data Science & AI', budget: '₹9,500', duration: '3 Weeks', skills: 'Python, LLM, LangChain, React', status: 'Open for Bids', postedDate: 'Just Now', progress: 0, applicants: 6, description: 'RAG-powered customer support assistant with automated document ingestion and vector search.' },
  { id: 'cp6', title: 'Mobile Banking iOS App', client: 'TechStream Corp', category: 'Software Development', budget: '₹14,000', duration: '5 Weeks', skills: 'Swift, iOS, React Native, REST API', status: 'In Progress', postedDate: 'Aug 04, 2026', progress: 30, applicants: 14, description: 'Secure mobile banking application featuring biometric login, instant transfer, and push alerts.' }
];

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
  const [milestoneItems, setMilestoneItems] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const fileType = isPdf ? 'application/pdf' : (file.type || 'Document');
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: fileType,
          url: uploadEvent.target.result,
          isImage: isImage
        });
      };
      reader.readAsDataURL(file);
    }
  };


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


  // 2. APPLICATIONS STATE (Strictly scoped to authenticated client)
  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem(proposalStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    if (isDemoUser) {
      localStorage.setItem(proposalStorageKey, JSON.stringify(DEFAULT_PROPOSALS));
      return DEFAULT_PROPOSALS;
    }

    return [];
  });

  const loadLiveProposals = React.useCallback(() => {
    if (!currentUserId || currentUserId === 'guest') return;

    fetch(`http://localhost:8000/api/proposals/?client_id=${encodeURIComponent(currentUserId)}`)
      .then(res => res.json())
      .then(dbProps => {
        if (Array.isArray(dbProps)) {
          if (dbProps.length > 0) {
            setProposals(dbProps);
            localStorage.setItem(proposalStorageKey, JSON.stringify(dbProps));
          } else if (isDemoUser) {
            setProposals(DEFAULT_PROPOSALS);
            localStorage.setItem(proposalStorageKey, JSON.stringify(DEFAULT_PROPOSALS));
          } else {
            setProposals([]);
            localStorage.setItem(proposalStorageKey, JSON.stringify([]));
          }
        }
      })
      .catch(err => {
        console.warn('Proposals fetch notice:', err);
      });
  }, [currentUserId, isDemoUser, proposalStorageKey]);

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveConversations, setLiveConversations] = useState([]);
  const [apiSearchResults, setApiSearchResults] = useState(null);
  const searchContainerRef = useRef(null);

  // Debounce search query to avoid lag / excess queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch backend global search as supplement
  useEffect(() => {
    const q = debouncedSearchQuery.trim();
    if (q.length > 0) {
      setIsSearchOpen(true);
      fetch(`http://localhost:8000/api/search/?role=client&user_id=${encodeURIComponent(currentUserId)}&q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.results) {
            setApiSearchResults(data.results);
          }
        })
        .catch(() => {});
    } else {
      setIsSearchOpen(false);
      setApiSearchResults(null);
    }
  }, [debouncedSearchQuery, currentUserId]);

  // Click outside and escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 4. DYNAMIC CONTRACTS STATE & API INTEGRATION
  const [dbContracts, setDbContracts] = useState([]);
  const [contractFilter, setContractFilter] = useState('All'); // 'All' | 'Active' | 'Pending' | 'Completed' | 'Cancelled'
  const [selectedContractDetail, setSelectedContractDetail] = useState(null);

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
    const pTitle = (p.project || p.projectTitle || '').toLowerCase().trim();

    const matchedContract = (dbContracts || []).find(c => 
      ((c.freelancerName || c.freelancer || '').toLowerCase().trim() === name.toLowerCase().trim()) &&
      ((c.projectName || c.project || '').toLowerCase().trim() === pTitle)
    );

    const matchedProject = clientProjects.find(proj => 
      (proj.id && p.projectId && proj.id === p.projectId) || 
      ((proj.title || '').toLowerCase().trim() === pTitle)
    ) || (isDemoUser ? DEFAULT_PROJECTS.find(proj => (proj.title || '').toLowerCase().trim() === pTitle) : null);

    const resolvedDate = p.hiredDate || 
      p.acceptedDate || 
      p.accepted_at || 
      (matchedContract && (matchedContract.startDate || matchedContract.start_date || matchedContract.created_at)) || 
      (p.date && p.date !== 'Just Now' ? p.date : null) || 
      p.created_at || 
      (matchedProject && (matchedProject.postedDate || matchedProject.created_at)) || 
      'Sep 10, 2026';

    return {
      id: `hired_${p.id || idx}`,
      name: name,
      avatar: p.avatar || initials,
      title: p.title || 'Senior Full Stack & AI Specialist',
      project: p.project || p.projectTitle || 'Marketplace Project',
      rate: p.bid || p.bidAmount || '₹75/hr',
      status: 'Active',
      hiredDate: resolvedDate
    };
  });

  const rawHired = [...defaultHired];
  dynamicHiredFromProps.forEach(dh => {
    if (!rawHired.some(hf => hf.name.toLowerCase() === dh.name.toLowerCase() && hf.project.toLowerCase() === dh.project.toLowerCase())) {
      rawHired.push(dh);
    }
  });
  dbContracts.forEach(c => {
    const cName = c.freelancerName || c.freelancer;
    const cProj = c.projectName || c.project;
    if (cName && !rawHired.some(hf => hf.name.toLowerCase() === cName.toLowerCase() && hf.project.toLowerCase() === (cProj || '').toLowerCase())) {
      const initials = cName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';
      const cProjTitle = (cProj || '').toLowerCase().trim();
      const matchedProject = clientProjects.find(proj => (proj.title || '').toLowerCase().trim() === cProjTitle) || 
        (isDemoUser ? DEFAULT_PROJECTS.find(proj => (proj.title || '').toLowerCase().trim() === cProjTitle) : null);
      
      const resolvedContractDate = c.startDate || c.start_date || c.created_at || (matchedProject && matchedProject.postedDate) || 'Sep 10, 2026';

      rawHired.push({
        id: `hired_ctr_${c.id || c.contractId}`,
        freelancer_id: c.freelancerId || c.freelancer_id || cName,
        name: cName,
        avatar: initials,
        title: 'Senior Software Specialist',
        project: cProj || 'Marketplace Project',
        rate: c.hourlyRate || c.agreedAmount || '₹75/hr',
        status: c.status || 'Active',
        hiredDate: resolvedContractDate
      });
    }
  });
  const hiredFreelancers = rawHired;

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

  // SAVED FREELANCERS STATE & API SYNC (Strictly Client-scoped)
  const [savedFreelancers, setSavedFreelancers] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_saved_freelancers`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
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
  }, [currentUserId]);

  useEffect(() => {
    loadSavedFreelancers();
  }, [loadSavedFreelancers]);

  const isFreelancerSaved = React.useCallback((target) => {
    if (!target || !Array.isArray(savedFreelancers)) return false;
    const targetId = (typeof target === 'object'
      ? (target.freelancer_id || target.freelancer || target.username || target.email || target.name || '')
      : String(target)
    ).toLowerCase().trim();

    return savedFreelancers.some(sf => {
      const sfId = (sf.freelancer_id || sf.freelancer || sf.username || sf.email || '').toLowerCase().trim();
      const sfName = (sf.name || '').toLowerCase().trim();
      return (sfId && sfId === targetId) || (sfName && sfName === targetId);
    });
  }, [savedFreelancers]);

  const handleSaveFreelancer = async (freelancerObj) => {
    if (!freelancerObj) return;
    const flId = freelancerObj.freelancer_id || freelancerObj.username || freelancerObj.freelancer || freelancerObj.email || freelancerObj.name;
    const flName = freelancerObj.name || freelancerObj.freelancer || flId;
    try {
      const res = await fetch('http://localhost:8000/api/saved-freelancers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: currentUserId, freelancer_id: flId, name: flName })
      });
      if (res.ok) {
        setToast({ message: `${flName} added to Saved Freelancers!`, type: 'success' });
        loadSavedFreelancers();
      }
    } catch (e) {
      setToast({ message: `${flName} saved to list!`, type: 'success' });
    }
  };

  const handleRemoveSavedFreelancer = async (freelancerId) => {
    if (!freelancerId) return;
    const cleanId = (typeof freelancerId === 'object'
      ? (freelancerId.freelancer_id || freelancerId.username || freelancerId.freelancer || freelancerId.name)
      : freelancerId
    );
    try {
      await fetch(`http://localhost:8000/api/saved-freelancers/?client_id=${encodeURIComponent(currentUserId)}&freelancer_id=${encodeURIComponent(cleanId)}`, {
        method: 'DELETE'
      });
      setSavedFreelancers(prev => prev.filter(f => {
        const fId = (f.freelancer_id || f.username || f.freelancer || '').toLowerCase();
        const fName = (f.name || '').toLowerCase();
        const targetClean = String(cleanId).toLowerCase();
        return fId !== targetClean && fName !== targetClean;
      }));
      setToast({ message: 'Freelancer removed from saved list.', type: 'info' });
      loadSavedFreelancers();
    } catch (e) {
      console.warn('Remove saved freelancer notice:', e);
    }
  };

  const handleToggleSaveFreelancer = async (freelancerObj) => {
    if (!freelancerObj) return;
    if (isFreelancerSaved(freelancerObj)) {
      const flId = freelancerObj.freelancer_id || freelancerObj.username || freelancerObj.freelancer || freelancerObj.email || freelancerObj.name;
      await handleRemoveSavedFreelancer(flId);
    } else {
      await handleSaveFreelancer(freelancerObj);
    }
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
    const cClient = contract.clientName || contract.client || userSession?.name || userSession?.username || 'Client';
    const cFreelancer = contract.freelancerName || contract.freelancer || 'Freelancer';
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

  const handleViewCoverLetter = (pr) => {
    if (!pr) {
      if (setToast) setToast({ message: 'No application document reference found.', type: 'error' });
      return;
    }

    // 1. Check for explicit file attachment on proposal (object or URL)
    const attachedObj = pr.attachedFile || pr.attached_file;
    const fileUrl = pr.pdf_url || pr.file_url || pr.attached_file_url || pr.resume_url || pr.document_url || (typeof pr.document === 'string' ? pr.document : null);

    if (attachedObj && (attachedObj.url || attachedObj.name)) {
      openDocumentViewer(attachedObj);
      return;
    } else if (fileUrl && typeof fileUrl === 'string' && fileUrl.trim()) {
      openDocumentViewer({
        url: fileUrl.trim(),
        name: pr.attached_file_name || `${(pr.freelancer || 'Application').replace(/\s+/g, '_')}_Document.pdf`,
        type: 'application/pdf'
      });
      return;
    }

    // 2. Check for associated contract in dbContracts
    const prFreelancer = (pr.freelancer || pr.freelancerName || '').toLowerCase().trim();
    const prProjectTitle = (pr.projectTitle || pr.project || '').toLowerCase().trim();
    const prId = String(pr.id || pr.proposalId || pr.proposal_id || '');

    const matchedContract = (dbContracts || []).find(c => {
      const cPropId = String(c.proposal || c.proposal_id || c.proposalId || '');
      const cId = String(c.contractId || c.id || '');
      const cFreelancer = (c.freelancerName || c.freelancer || '').toLowerCase().trim();
      const cProject = (c.projectName || c.project || '').toLowerCase().trim();

      if (prId && cPropId && prId === cPropId) return true;
      if (pr.contractId && cId && pr.contractId === cId) return true;
      if (prFreelancer && cFreelancer && prFreelancer === cFreelancer && prProjectTitle && cProject && prProjectTitle === cProject) return true;
      return false;
    });

    if (matchedContract) {
      handleDownloadContractPDF(matchedContract);
      return;
    }

    // 3. Fallback to generating/viewing the contract/application agreement PDF for this proposal
    const applicationDoc = {
      contractId: pr.contractId || (pr.id ? `CTR-APP-${pr.id}` : 'CTR-9024'),
      projectName: pr.projectTitle || pr.project || 'AI System Architecture',
      clientName: currentUserName,
      freelancerName: pr.freelancer || pr.freelancerName || 'Freelancer',
      agreedAmount: pr.bid || pr.bidAmount || '₹5,000',
      escrowBalance: pr.bid || pr.bidAmount || '₹5,000',
      startDate: pr.date || 'Sep 10, 2026',
      paymentType: 'Fixed Price Proposal',
      hourlyRate: pr.bid || '₹75/hr',
      status: pr.status === 'Accepted' || pr.status === 'Hired' ? 'Active' : (pr.status || 'Pending Review'),
      milestones: pr.milestones || []
    };

    handleDownloadContractPDF(applicationDoc);
  };

  const handleDeleteProject = async (projId, projTitle) => {
    // 1. Check if the project currently has an assigned freelancer, active contract, or is in progress/completed
    const currentProj = clientProjects.find(p => p.id === projId || (p.title || '').trim().toLowerCase() === (projTitle || '').trim().toLowerCase());
    const acceptedProp = proposals.find(pr => (pr.projectId === projId || (pr.projectTitle || pr.project) === projTitle) && (pr.status === 'Accepted' || pr.status === 'Hired'));
    const linkedContract = contracts.find(c => (c.projectName || c.project || '').toLowerCase().trim() === (projTitle || '').toLowerCase().trim() && (c.status || '').toLowerCase() !== 'cancelled');
    const isAssigned = Boolean(
      (currentProj && (currentProj.hiredFreelancer || currentProj.freelancer || currentProj.status === 'In Progress' || currentProj.status === 'Completed')) ||
      acceptedProp ||
      linkedContract
    );

    if (isAssigned) {
      const errorMsg = "This project cannot be deleted because a freelancer has already been assigned to it. Please complete or close the project instead.";
      setToast({ message: errorMsg, type: 'error' });
      alert(errorMsg);
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete project "${projTitle || 'Selected Project'}"?`)) {
      return;
    }

    // Call backend API first to check database state and enforce strict backend rule
    try {
      const cleanId = String(projId || '').trim();
      if (cleanId) {
        const res = await fetch(`http://localhost:8000/api/projects/${encodeURIComponent(cleanId)}/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errorMsg = errData.error || errData.message || "This project cannot be deleted because a freelancer has already been assigned to it. Please complete or close the project instead.";
          setToast({ message: errorMsg, type: 'error' });
          alert(errorMsg);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend delete error:', err);
      setToast({ message: "Network error occurred while attempting to delete project.", type: 'error' });
      return;
    }

    const updatedProjects = clientProjects.filter(p => p.id !== projId && (p.title || '').trim().toLowerCase() !== (projTitle || '').trim().toLowerCase());
    setClientProjects(updatedProjects);
    
    const key1 = `freematch_user_${currentUserId}_projects`;
    const key2 = `freematch_projects_${currentUserId}`;
    localStorage.setItem(key1, JSON.stringify(updatedProjects));
    localStorage.setItem(key2, JSON.stringify(updatedProjects));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updatedProjects));
    }

    const updatedProps = proposals.filter(pr => pr.projectId !== projId && (pr.projectTitle || pr.project) !== projTitle);
    setProposals(updatedProps);
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProps));
    }

    setToast({ message: `Project "${projTitle || 'Selected Project'}" deleted successfully.`, type: 'info' });
    window.dispatchEvent(new Event('freematch_shared_event'));
  };

  const taskStorageKey = `freematch_user_${currentUserId}_tasks`;

  // 5. KANBAN TASKS STATE (4 Columns: To-Do, In Progress, Under Review, Done)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(taskStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (!currentUserId || currentUserId === 'guest') return;
    fetch(`http://localhost:8000/api/sprint-tasks/?client_id=${encodeURIComponent(currentUserId || '')}`)
      .then(res => res.json())
      .then(apiTasks => {
        if (Array.isArray(apiTasks)) {
          if (apiTasks.length > 0) {
            const normalized = apiTasks.map(t => ({
              ...t,
              project: t.project || t.projectTitle || t.project_name || 'Enterprise Project',
              assignee: t.assignee || t.assignee_name || 'Assigned Freelancer'
            }));
            setTasks(normalized);
            localStorage.setItem(taskStorageKey, JSON.stringify(normalized));
          } else {
            setTasks([]);
            localStorage.setItem(taskStorageKey, JSON.stringify([]));
          }
        }
      })
      .catch(() => {});
  }, [taskStorageKey, currentUserId]);

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
  const [clientFinancials, setClientFinancials] = useState({
    available_balance: 0,
    available_balance_str: '₹0',
    escrow_balance: 0,
    escrow_balance_str: '₹0',
    released_payments: 0,
    released_payments_str: '₹0',
    pending_release: 0,
    pending_release_str: '₹0',
    total_withdrawn: 0,
    total_withdrawn_str: '₹0',
    stripe_balance: 0,
    razorpay_balance: 0,
    gateway_status: 'Payment gateway not configured',
    is_gateway_configured: false,
    transactions: []
  });

  const loadClientFinancials = async () => {
    if (!currentUserId || currentUserId === 'guest') return;
    try {
      const res = await fetch(`http://localhost:8000/api/client-financials/?client_id=${encodeURIComponent(currentUserId)}`);
      if (res.ok) {
        const data = await res.json();
        setClientFinancials(data);
        if (Array.isArray(data.transactions)) {
          setPayments(data.transactions);
          try {
            localStorage.setItem(`freematch_user_${currentUserId}_payments`, JSON.stringify(data.transactions));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Failed to load client financials:', e);
    }
  };

  useEffect(() => {
    loadClientFinancials();
    const handleShared = () => loadClientFinancials();
    window.addEventListener('freematch_shared_event', handleShared);
    return () => window.removeEventListener('freematch_shared_event', handleShared);
  }, [currentUserId]);

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem(`freematch_user_${currentUserId}_payments`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    if (currentUserId && currentUserId !== 'guest') {
      localStorage.setItem(`freematch_user_${currentUserId}_payments`, JSON.stringify(payments));
    }
  }, [payments, currentUserId]);

  // 8. DYNAMIC REVIEWS STATE & CANDIDATES (Client-scoped)
  const REVIEWABLE_CANDIDATES = React.useMemo(() => {
    const list = [];
    if (isDemoUser) {
      list.push(
        { id: 'cand_alex_1', freelancer: 'Alex Mercer', avatar: 'AM', projectTitle: 'AI Pipeline Optimization', rate: '₹75/hr' },
        { id: 'cand_alex_2', freelancer: 'Alex Mercer', avatar: 'AM', projectTitle: 'AI Automated Test Pipeline', rate: '₹75/hr' },
        { id: 'cand_haines_1', freelancer: 'Haines jp', avatar: 'HJ', projectTitle: 'NextGen Autonomous Trading Engine', rate: '₹85/hr' },
        { id: 'cand_sarah_1', freelancer: 'Sarah Chen', avatar: 'SC', projectTitle: 'Enterprise Knowledge Graph RAG Bot', rate: '₹85/hr' },
        { id: 'cand_lana_1', freelancer: 'Lana Kim', avatar: 'LK', projectTitle: 'Penetration Testing & OWASP Scan', rate: '₹90/hr' },
        { id: 'cand_james_1', freelancer: 'James Joe', avatar: 'JJ', projectTitle: 'Autonomous Supply Chain Freight Router', rate: '₹65/hr' }
      );
    }

    // Include freelancers from live contracts
    if (Array.isArray(dbContracts)) {
      dbContracts.forEach((c, idx) => {
        const flName = c.freelancer || c.freelancerName || 'Freelancer';
        const projName = c.project || c.projectName || 'Marketplace Project';
        const initials = flName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';
        const exists = list.some(item => 
          (item.freelancer || '').toLowerCase() === flName.toLowerCase() &&
          (item.projectTitle || '').toLowerCase() === projName.toLowerCase()
        );
        if (!exists) {
          list.push({
            id: `cand_contract_${c.id || c.db_id || idx}`,
            freelancer: flName,
            avatar: initials,
            projectTitle: projName,
            rate: c.hourlyRate || c.agreedAmount || c.amount || '₹75/hr'
          });
        }
      });
    }

    // Include freelancers from accepted proposals and hired list
    if (Array.isArray(hiredFreelancers)) {
      hiredFreelancers.forEach((hf, idx) => {
        const flName = hf.name || hf.freelancer || 'Freelancer';
        const projName = hf.project || hf.projectTitle || 'Marketplace Project';
        const exists = list.some(item => 
          (item.freelancer || '').toLowerCase() === flName.toLowerCase() &&
          (item.projectTitle || '').toLowerCase() === projName.toLowerCase()
        );
        if (!exists) {
          list.push({
            id: `cand_hired_${hf.id || idx}`,
            freelancer: flName,
            avatar: hf.avatar || flName.slice(0, 2).toUpperCase(),
            projectTitle: projName,
            rate: hf.rate || '₹75/hr'
          });
        }
      });
    }

    return list;
  }, [isDemoUser, dbContracts, hiredFreelancers]);

  const [selectedCandidate, setSelectedCandidate] = useState(() => REVIEWABLE_CANDIDATES[0] || null);

  useEffect(() => {
    if (!selectedCandidate && REVIEWABLE_CANDIDATES.length > 0) {
      setSelectedCandidate(REVIEWABLE_CANDIDATES[0]);
    } else if (selectedCandidate && !REVIEWABLE_CANDIDATES.some(c => c.id === selectedCandidate.id)) {
      setSelectedCandidate(REVIEWABLE_CANDIDATES[0] || null);
    }
  }, [REVIEWABLE_CANDIDATES, selectedCandidate]);
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

    // 2. Fetch from backend REST API strictly scoped to current client
    try {
      const res = await fetch(`http://localhost:8000/api/reviews/?client_id=${encodeURIComponent(currentUserId)}`);
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

    // Deduplicate by composite semantic key (reviewer + reviewee + project)
    const uniqueMap = new Map();
    combined.forEach(r => {
      if (!r) return;
      const rev = String(r.reviewer_username || r.reviewer || '').toLowerCase().trim();
      const target = String(r.reviewee_username || r.reviewee || '').toLowerCase().trim();
      const proj = String(r.projectTitle || r.project_title || '').toLowerCase().trim();
      const semanticKey = `${rev}___${target}___${proj}`;

      const existing = uniqueMap.get(semanticKey);
      if (!existing) {
        uniqueMap.set(semanticKey, r);
      } else {
        // If an existing entry was temporary (e.g. r_...) and current entry is canonical backend (rev_... or number), prefer backend
        const existingIsBackend = String(existing.id || '').startsWith('rev_') || typeof existing.id === 'number';
        const currentIsBackend = String(r.id || '').startsWith('rev_') || typeof r.id === 'number';
        if (!existingIsBackend && currentIsBackend) {
          uniqueMap.set(semanticKey, r);
        }
      }
    });

    const deduplicatedReviews = Array.from(uniqueMap.values());
    setReviews(deduplicatedReviews);
    try {
      localStorage.setItem(`freematch_user_${currentUserId}_reviews`, JSON.stringify(deduplicatedReviews));
    } catch (e) {}
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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleAddReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmittingReview) return;
    if (!selectedCandidate || !commentInput.trim()) return;

    const candidateName = selectedCandidate?.freelancer || 'Freelancer';
    const candidateProject = (selectedCandidate?.projectTitle || 'Project').trim();
    const currUser = (currentUserId || '').toLowerCase().trim();
    const currName = (currentUserName || '').toLowerCase().trim();
    const targetName = candidateName.toLowerCase().trim();
    const targetProj = candidateProject.toLowerCase().trim();

    // 1. Client-side prevention: check if this candidate/project has already been reviewed
    const alreadyReviewed = reviews.some(r => {
      const revReviewer = (r.reviewer_username || r.reviewer || '').toLowerCase().trim();
      const revReviewee = (r.reviewee_username || r.reviewee || '').toLowerCase().trim();
      const revProject = (r.projectTitle || r.project_title || '').toLowerCase().trim();
      const matchesReviewer = revReviewer === currUser || revReviewer === currName || !revReviewer;
      const matchesReviewee = revReviewee === targetName || revReviewee.includes(targetName) || targetName.includes(revReviewee);
      const matchesProject = revProject === targetProj;
      return matchesReviewer && matchesReviewee && matchesProject;
    });

    if (alreadyReviewed) {
      setToast({ 
        message: `A review for ${candidateName} on project "${candidateProject}" has already been submitted.`, 
        type: 'error' 
      });
      return;
    }

    setIsSubmittingReview(true);
    const avgRating = Math.round((commRating + codeRating + deadlineRating) / 3.0);

    try {
      const res = await fetch('http://localhost:8000/api/reviews/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: currentUserName,
          reviewee: candidateName,
          rating: avgRating,
          comm: commRating,
          code: codeRating,
          deadline: deadlineRating,
          comment: commentInput.trim(),
          project_title: candidateProject
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.already_exists) {
          setToast({ 
            message: `A review for ${candidateName} on "${candidateProject}" already exists in database.`, 
            type: 'error' 
          });
          loadClientReviews();
        } else {
          setToast({ 
            message: data.error || 'Failed to submit review. Please try again.', 
            type: 'error' 
          });
        }
        setIsSubmittingReview(false);
        return;
      }

      // Canonical review created by database
      const createdReview = data.review || {
        id: `rev_${Date.now()}`,
        type: 'given',
        reviewer: currentUserName,
        reviewee: candidateName,
        projectTitle: candidateProject,
        rating: avgRating,
        comm: commRating,
        code: codeRating,
        deadline: deadlineRating,
        comment: commentInput.trim(),
        date: 'Just now'
      };

      // Deduplicate and update state cleanly with canonical record
      setReviews(prev => {
        const filtered = prev.filter(r => {
          const rev = (r.reviewer_username || r.reviewer || '').toLowerCase().trim();
          const trg = (r.reviewee_username || r.reviewee || '').toLowerCase().trim();
          const prj = (r.projectTitle || r.project_title || '').toLowerCase().trim();
          const isSame = (rev === currUser || rev === currName) && (trg === targetName) && (prj === targetProj);
          return !isSame;
        });
        const nextReviews = [createdReview, ...filtered];
        try {
          localStorage.setItem(`freematch_user_${currentUserId}_reviews`, JSON.stringify(nextReviews));
          let shared = [];
          const savedShared = localStorage.getItem('freematch_shared_reviews');
          if (savedShared) shared = JSON.parse(savedShared);
          const filteredShared = shared.filter(r => {
            const rev = (r.reviewer_username || r.reviewer || '').toLowerCase().trim();
            const trg = (r.reviewee_username || r.reviewee || '').toLowerCase().trim();
            const prj = (r.projectTitle || r.project_title || '').toLowerCase().trim();
            const isSame = (rev === currUser || rev === currName) && (trg === targetName) && (prj === targetProj);
            return !isSame;
          });
          localStorage.setItem('freematch_shared_reviews', JSON.stringify([createdReview, ...filteredShared]));
        } catch (e) {}
        return nextReviews;
      });

      // Dispatch event to sync review across tabs without duplicate trigger
      window.dispatchEvent(new CustomEvent('freematch_review_submitted', { detail: createdReview }));

      setCommentInput('');
      setToast({ 
        message: `Review for ${candidateName} submitted! Rating updated in database and AI Match Score boosted.`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Network error submitting review. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingReview(false);
    }
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
      const cUserId = (userSession?.user_id || userSession?.username || userSession?.email || userSession?.id || '').toString().trim();
      if (cUserId) {
        const list = await fetchNotifications(cUserId);
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        setNotifications([]);
      }
    };

    const loadLiveMessagesCount = async () => {
      const cUserId = (userSession?.username || userSession?.user_id || userSession?.email || userSession?.id || '').toString().toLowerCase().trim();
      if (!cUserId) {
        setMessagesCount(0);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/api/messages/?user_id=${encodeURIComponent(cUserId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.conversations)) {
            setMessagesCount(data.conversations.length);
            setLiveConversations(data.conversations);
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
  const [activeResumedDraftId, setActiveResumedDraftId] = useState(null);

  const [savedDraftsList, setSavedDraftsList] = useState(() => {
    try {
      const saved = localStorage.getItem(`freematch_user_${userSession?.user_id || 'client'}_project_drafts_list`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Automatically purge any drafts that have already been published as active projects
  useEffect(() => {
    if (!Array.isArray(savedDraftsList) || savedDraftsList.length === 0 || !Array.isArray(clientProjects) || clientProjects.length === 0) return;
    const cleanDrafts = savedDraftsList.filter(d => {
      const dTitle = (d.projectTitle || '').trim().toLowerCase();
      if (!dTitle) return false;
      const alreadyPublished = clientProjects.some(p => (p.title || '').trim().toLowerCase() === dTitle);
      return !alreadyPublished;
    });
    if (cleanDrafts.length !== savedDraftsList.length) {
      setSavedDraftsList(cleanDrafts);
      localStorage.setItem(draftListKey, JSON.stringify(cleanDrafts));
    }
  }, [clientProjects, savedDraftsList, draftListKey]);

  const handleSaveDraft = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const titleToSave = (projectTitle || '').trim() || 'Untitled Project Draft';
      const draftId = activeResumedDraftId || `draft_${Date.now()}`;
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

      const existingList = savedDraftsList.filter(d => d.id !== draftId && (d.projectTitle || '').toLowerCase() !== titleToSave.toLowerCase());
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
    setActiveResumedDraftId(draftObj.id || null);
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

  const handlePublishDraftDirectly = async (draft) => {
    if (!draft || !draft.projectTitle) return;
    const currentUserName = userSession?.name || userSession?.username || 'Client';
    const currentUserId = userSession?.user_id || userSession?.username || 'client';

    const rawBudget = draft.budget || '5000';
    const formattedBudget = formatCurrency(rawBudget);
    const newProj = {
      id: `proj_${Date.now()}`,
      title: draft.projectTitle,
      client: currentUserName,
      client_id: currentUserId,
      category: draft.category || 'Software Development',
      budget: formattedBudget,
      duration: draft.duration || '3 Weeks',
      skills: draft.skillsReq || 'Python, React',
      status: 'Open for Bids',
      postedDate: 'Just Now',
      progress: 0,
      applicants: 0,
      description: draft.description || '',
      abstract: draft.projectAbstract || '',
      attachedFile: draft.attachedFile || null,
      milestones: draft.milestoneItems || []
    };

    const updated = [newProj, ...clientProjects];
    setClientProjects(updated);
    
    const key1 = `freematch_user_${currentUserId}_projects`;
    const key2 = `freematch_projects_${currentUserId}`;
    localStorage.setItem(key1, JSON.stringify(updated));
    localStorage.setItem(key2, JSON.stringify(updated));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
    }

    // Remove from drafts immediately
    const cleanTitle = (draft.projectTitle || '').trim().toLowerCase();
    const updatedDrafts = savedDraftsList.filter(d => d.id !== draft.id && (d.projectTitle || '').trim().toLowerCase() !== cleanTitle);
    setSavedDraftsList(updatedDrafts);
    localStorage.setItem(draftListKey, JSON.stringify(updatedDrafts));
    localStorage.removeItem(activeDraftKey);

    try {
      await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.projectTitle,
          client: currentUserId,
          client_name: currentUserName,
          category: draft.category || 'Software Development',
          budget: formattedBudget,
          duration: draft.duration || '3 Weeks',
          skills: Array.isArray(draft.skillsReq) ? draft.skillsReq.join(', ') : (draft.skillsReq || ''),
          description: draft.description || '',
          abstract: draft.projectAbstract || '',
          milestones: draft.milestoneItems || []
        })
      });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    setToast({ message: `Project "${draft.projectTitle}" published successfully and moved from drafts to active postings!`, type: 'success' });
    setProjectFilter('All');
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
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

    // 1. Required Field & Format Validations
    const cleanTitle = (projectTitle || '').trim();
    if (!cleanTitle || cleanTitle.length < 3) {
      setToast({ message: 'Project Title is required (at least 3 characters).', type: 'error' });
      return;
    }

    if (!category || !category.trim()) {
      setToast({ message: 'Please select a project category.', type: 'error' });
      return;
    }

    const numBudget = parseFloat(budget) || 0;
    if (numBudget <= 0) {
      setToast({ message: 'Please enter a valid project budget (minimum ₹100).', type: 'error' });
      return;
    }

    if (!duration || !duration.trim()) {
      setToast({ message: 'Please select an estimated project duration.', type: 'error' });
      return;
    }

    const skillsArr = Array.isArray(skillsReq)
      ? skillsReq
      : (typeof skillsReq === 'string' ? skillsReq.split(',').map(s => s.trim()).filter(Boolean) : []);
    if (skillsArr.length === 0) {
      setToast({ message: 'Please provide at least one required skill.', type: 'error' });
      return;
    }

    const cleanDesc = (description || '').trim();
    if (!cleanDesc || cleanDesc.length < 20) {
      setToast({ message: 'Please provide a detailed project description (at least 20 characters).', type: 'error' });
      return;
    }

    // 2. Milestone Validations
    if (Array.isArray(milestoneItems) && milestoneItems.length > 0) {
      const invalidMilestone = milestoneItems.find(
        m => !m.title || !m.title.trim() || isNaN(parseFloat(m.amount)) || parseFloat(m.amount) <= 0
      );
      if (invalidMilestone) {
        setToast({ message: 'Each milestone must have a valid title and positive amount.', type: 'error' });
        return;
      }

      const totalMilestoneSum = milestoneItems.reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0);
      if (Math.abs(totalMilestoneSum - numBudget) > 0.01) {
        setToast({
          message: `Milestone sum (₹${totalMilestoneSum.toLocaleString()}) must match the total project budget (₹${numBudget.toLocaleString()}).`,
          type: 'error'
        });
        return;
      }
    }

    const currentUserName = userSession?.name || userSession?.username || 'Client';
    const currentUserId = userSession?.user_id || userSession?.username || 'client';
    const formattedBudget = formatCurrency(budget);

    const newProj = {
      id: `proj_${Date.now()}`,
      title: cleanTitle,
      client: currentUserName,
      client_id: currentUserId,
      category: category,
      budget: formattedBudget,
      duration: duration,
      skills: skillsArr,
      status: 'Open for Bids',
      postedDate: 'Just Now',
      progress: 0,
      applicants: 0,
      description: cleanDesc,
      abstract: projectAbstract || '',
      attachedFile: attachedFile,
      milestones: milestoneItems || []
    };

    const updated = [newProj, ...clientProjects];
    setClientProjects(updated);

    const key1 = `freematch_user_${currentUserId}_projects`;
    const key2 = `freematch_projects_${currentUserId}`;
    localStorage.setItem(key1, JSON.stringify(updated));
    localStorage.setItem(key2, JSON.stringify(updated));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
    }

    // Automatically remove published project from drafts
    const cleanTitleLower = cleanTitle.toLowerCase();
    const remainingDrafts = savedDraftsList.filter(d => 
      (activeResumedDraftId ? d.id !== activeResumedDraftId : true) &&
      (d.projectTitle || '').trim().toLowerCase() !== cleanTitleLower
    );
    setSavedDraftsList(remainingDrafts);
    localStorage.setItem(draftListKey, JSON.stringify(remainingDrafts));
    localStorage.removeItem(activeDraftKey);
    setActiveResumedDraftId(null);

    // Persist project directly into Django database
    try {
      await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          client: currentUserId,
          client_name: currentUserName,
          category: category,
          budget: formattedBudget,
          duration: duration,
          skills: skillsArr.join(', '),
          description: cleanDesc,
          abstract: projectAbstract || '',
          attachedFile: attachedFile || null,
          attached_file_name: attachedFile ? attachedFile.name : '',
          attached_file_url: attachedFile ? attachedFile.url : '',
          milestones: milestoneItems || []
        })
      });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    setShowPostProjectModal(false);
    setToast({ message: `Project "${cleanTitle}" posted successfully and published to marketplace!`, type: 'success' });
    setProjectTitle('');
    setDescription('');
    setProjectAbstract('');
    setAttachedFile(null);
    setMilestoneItems([]);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
  };

  const handleAcceptProposal = (acceptedProp) => {
    const currentUserName = userSession?.name || userSession?.username || 'Client';
    const currentUserId = userSession?.user_id || userSession?.username || 'client';
    const projectStorageKey = `freematch_user_${currentUserId}_projects`;
    const proposalStorageKey = `freematch_user_${currentUserId}_proposals`;
    const taskStorageKey = `freematch_user_${currentUserId}_tasks`;

    const todayFormattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const updated = proposals.map((p) =>
      (p.id === acceptedProp.id || p.db_id === acceptedProp.db_id) 
        ? { ...p, status: 'Accepted', hiredDate: p.hiredDate || p.acceptedDate || todayFormattedDate, acceptedDate: p.acceptedDate || todayFormattedDate } 
        : p
    );

    setProposals(updated);
    localStorage.setItem(proposalStorageKey, JSON.stringify(updated));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_proposals', JSON.stringify(updated));
    }

    const flName = acceptedProp.freelancer || acceptedProp.freelancerName || 'Freelancer';
    const targetProjTitle = acceptedProp.projectTitle || acceptedProp.project || 'Project';
    const rawBid = acceptedProp.bid || acceptedProp.bidAmount || '₹5,000';
    const bidVal = formatCurrency(rawBid);

    const updatedProjects = clientProjects.map(p => {
      if (p.id === acceptedProp.projectId || (p.title || '').toLowerCase().trim() === targetProjTitle.toLowerCase().trim()) {
        return { ...p, status: 'In Progress', hiredFreelancer: flName, progress: 0 };
      }
      return p;
    });

    setClientProjects(updatedProjects);
    localStorage.setItem(projectStorageKey, JSON.stringify(updatedProjects));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updatedProjects));
    }

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
      title: `Deliverable: ${targetProjTitle}`,
      status: 'To Do',
      assignee: flName,
      budget: bidVal,
      project: targetProjTitle
    };

    updatedTasks = [task1, ...updatedTasks];
    localStorage.setItem(taskStorageKey, JSON.stringify(updatedTasks));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updatedTasks));
    }

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
    window.dispatchEvent(new Event('freematch_notification_event'));

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

  const handleClosePosting = async (project) => {
    if (project.status === 'In Progress' || project.status === 'Completed') {
      alert(`Project "${project.title}" is currently ${project.status} with a hired freelancer and cannot be simply closed.`);
      return;
    }
    if (window.confirm(`Are you sure you want to close project "${project.title}"?\n\nClosing the posting will prevent new freelancer applications.`)) {
      const updated = clientProjects.map(p => (p.id === project.id || (p.title && project.title && p.title.trim().toLowerCase() === project.title.trim().toLowerCase())) ? { ...p, status: 'Closed' } : p);
      setClientProjects(updated);
      
      const key1 = `freematch_user_${currentUserId}_projects`;
      const key2 = `freematch_projects_${currentUserId}`;
      localStorage.setItem(key1, JSON.stringify(updated));
      localStorage.setItem(key2, JSON.stringify(updated));
      if (isDemoUser) {
        localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
      }

      const updatedProps = proposals.map(pr => 
        (pr.projectId === project.id || pr.projectTitle === project.title) 
          ? { ...pr, projectStatus: 'Closed' } 
          : pr
      );
      setProposals(updatedProps);
      if (isDemoUser) {
        localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProps));
      }

      // Persist to Django backend API
      try {
        const cleanId = String(project.id || '').trim();
        if (cleanId) {
          await fetch(`http://localhost:8000/api/projects/${encodeURIComponent(cleanId)}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Closed' })
          });
        }
      } catch (err) {
        console.warn('Backend update error:', err);
      }

      setToast({ message: `Project "${project.title}" posting is now Closed.`, type: 'info' });
      window.dispatchEvent(new Event('freematch_shared_event'));
    }
  };

  const handleReopenPosting = async (project) => {
    const updated = clientProjects.map(p => (p.id === project.id || (p.title && project.title && p.title.trim().toLowerCase() === project.title.trim().toLowerCase())) ? { ...p, status: 'Open for Bids' } : p);
    setClientProjects(updated);
    
    const key1 = `freematch_user_${currentUserId}_projects`;
    const key2 = `freematch_projects_${currentUserId}`;
    localStorage.setItem(key1, JSON.stringify(updated));
    localStorage.setItem(key2, JSON.stringify(updated));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
    }

    // Persist to Django backend API
    try {
      const cleanId = String(project.id || '').trim();
      if (cleanId) {
        await fetch(`http://localhost:8000/api/projects/${encodeURIComponent(cleanId)}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Open' })
        });
      }
    } catch (err) {
      console.warn('Backend update error:', err);
    }

    setToast({ message: `Project "${project.title}" reopened for bids!`, type: 'success' });
    window.dispatchEvent(new Event('freematch_shared_event'));
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
    const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
    const isCompleted = (p.status === 'Completed' || pProg === 100) && !isClosed;
    const isHiring = !isClosed && (p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open' || (pProg === 0 && p.status !== 'Completed'));
    const isInProgress = !isHiring && !isCompleted && !isClosed;

    if (projectFilter === 'Hiring') return isHiring;
    if (projectFilter === 'In Progress') return isInProgress;
    if (projectFilter === 'Completed') return isCompleted;
    if (projectFilter === 'Closed') return isClosed;
    return true;
  });

  return (
    <div className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-white text-slate-900'
    }`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* Background Glowing Orbs (Dark mode only) */}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0 bg-blue-600/10"></div>
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none z-0 bg-blue-700/10"></div>
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 bg-indigo-600/10"></div>
        </>
      )}

      {/* 3D Floating Grid Environment (Dark mode only) */}
      {isDark && <div className="bg-3d-grid-clean"></div>}

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
                { id: 'post', label: 'Post Project', icon: PlusCircle, action: () => { setMilestoneItems([]); setShowPostProjectModal(true); } },
                { id: 'projects', label: 'My Projects', icon: FolderKanban, badge: clientProjects.length },
                { id: 'applications', label: 'Project Applications', icon: Inbox, badge: proposals.length },
                { id: 'freelancers', label: 'Hired Freelancers', icon: Users },
                { id: 'saved-freelancers', label: 'Saved Freelancers', icon: Star, badge: savedFreelancers.length }
              ].map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        if (item.id === 'applications') setSelectedProjectApplicationsFilter(null);
                        if (item.id === 'projects') setProjectFilter('All');
                        setActiveTab(item.id);
                      }
                    }}
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
      <main id="client-dashboard-main" className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${isDark ? 'bg-[#030712]' : 'bg-white'}`}>
        
        {/* Top Navigation Header */}
        <header className={`sticky top-0 z-30 px-8 py-4 border-b border-slate-200/80 backdrop-blur-md flex items-center justify-between ${isDark ? 'bg-[#030712]/90' : 'bg-white/90'}`}>
          <div className="relative w-full max-w-md" ref={searchContainerRef}>
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 dark:text-slate-300 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchOpen && e.target.value.trim() !== '') setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim() !== '') setIsSearchOpen(true);
              }}
              placeholder="Search projects by title, category, skills, freelancer, or contract ID..."
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                title="Clear search"
              >
                ✕
              </button>
            )}

            {isSearchOpen && debouncedSearchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-3 space-y-3 max-h-96 overflow-y-auto">
                {(() => {
                  const q = debouncedSearchQuery.toLowerCase().trim();

                  // 1. PROJECTS
                  const localProjects = clientProjects.filter(p => {
                    const title = (p.title || '').toLowerCase();
                    const cat = (p.category || '').toLowerCase();
                    const skills = (Array.isArray(p.skills) ? p.skills.join(' ') : (p.skills || '')).toLowerCase();
                    const stat = (p.status || '').toLowerCase();
                    const desc = (p.description || '').toLowerCase();
                    return title.includes(q) || cat.includes(q) || skills.includes(q) || stat.includes(q) || desc.includes(q);
                  });
                  const apiProjs = apiSearchResults?.projects || [];
                  const seenProjKeys = new Set();
                  const matchingProjects = [];
                  [...localProjects, ...apiProjs].forEach(p => {
                    const k = (p.title || p.id || '').toLowerCase().trim();
                    if (!seenProjKeys.has(k)) {
                      seenProjKeys.add(k);
                      matchingProjects.push(p);
                    }
                  });

                  // 2. APPLICATIONS
                  const localApps = proposals.filter(pr => {
                    const pTitle = (pr.projectTitle || pr.project || '').toLowerCase();
                    const fl = (pr.freelancer || pr.freelancerName || '').toLowerCase();
                    const flEmail = (pr.freelancerEmail || pr.email || pr.freelancerId || '').toLowerCase();
                    const stat = (pr.status || '').toLowerCase();
                    return pTitle.includes(q) || fl.includes(q) || flEmail.includes(q) || stat.includes(q);
                  });
                  const apiApps = apiSearchResults?.applications || [];
                  const seenAppKeys = new Set();
                  const matchingApplications = [];
                  [...localApps, ...apiApps].forEach(app => {
                    const k = `${app.projectTitle || app.project}_${app.freelancer || app.freelancerName}`.toLowerCase().trim();
                    if (!seenAppKeys.has(k)) {
                      seenAppKeys.add(k);
                      matchingApplications.push(app);
                    }
                  });

                  // 3. FREELANCERS (Hired, Saved & Candidate Talent)
                  const PLATFORM_TALENT_CANDIDATES = [
                    { id: 'cand_alex', name: 'Alex Mercer', username: 'alex_mercer', email: 'alex.mercer@freematch.ai', title: 'Full Stack & AI Architect', skills: ['React', 'Python', 'AI/ML'], rate: '₹75/hr', score: '98%' },
                    { id: 'cand_sarah', name: 'Sarah Chen', username: 'sarah_chen', email: 'sarah.chen@freematch.ai', title: 'Data Platform Engineer', skills: ['PostgreSQL', 'FastAPI', 'Data Analytics'], rate: '₹85/hr', score: '95%' },
                    { id: 'cand_david', name: 'David Kumar', username: 'david_kumar', email: 'david.kumar@freematch.ai', title: 'Cloud & Backend Specialist', skills: ['Node.js', 'Docker', 'AWS'], rate: '₹65/hr', score: '92%' }
                  ];

                  const allCandidates = [
                    ...hiredFreelancers.map(f => ({ ...f, isHired: true })),
                    ...savedFreelancers.map(f => ({ ...f, isSaved: true })),
                    ...PLATFORM_TALENT_CANDIDATES,
                    ...(apiSearchResults?.freelancers || [])
                  ];
                  const seenFlKeys = new Set();
                  const matchingFreelancers = [];
                  allCandidates.forEach(fl => {
                    const name = (fl.name || fl.freelancer || fl.username || '').toLowerCase();
                    const email = (fl.email || '').toLowerCase();
                    const uname = (fl.username || fl.freelancer_id || '').toLowerCase();
                    const skills = (Array.isArray(fl.skills) ? fl.skills.join(' ') : (fl.skills || '')).toLowerCase();
                    const title = (fl.title || '').toLowerCase();
                    const proj = (fl.project || fl.projectTitle || '').toLowerCase();
                    if (name.includes(q) || email.includes(q) || uname.includes(q) || skills.includes(q) || title.includes(q) || proj.includes(q)) {
                      const k = (fl.email || fl.username || fl.name || '').toLowerCase().trim();
                      if (k && !seenFlKeys.has(k)) {
                        seenFlKeys.add(k);
                        matchingFreelancers.push(fl);
                      }
                    }
                  });

                  // 4. CONTRACTS
                  const localContracts = contracts.filter(c => {
                    const cid = (c.id || c.contractId || '').toLowerCase();
                    const pName = (c.projectName || c.project || c.title || '').toLowerCase();
                    const fl = (c.freelancer || c.freelancerName || '').toLowerCase();
                    const flEmail = (c.freelancerEmail || c.freelancerId || '').toLowerCase();
                    const stat = (c.status || '').toLowerCase();
                    return cid.includes(q) || pName.includes(q) || fl.includes(q) || flEmail.includes(q) || stat.includes(q);
                  });
                  const apiCtrs = apiSearchResults?.contracts || [];
                  const seenCtrKeys = new Set();
                  const matchingContracts = [];
                  [...localContracts, ...apiCtrs].forEach(c => {
                    const k = (c.id || c.contractId || c.projectName || '').toLowerCase().trim();
                    if (!seenCtrKeys.has(k)) {
                      seenCtrKeys.add(k);
                      matchingContracts.push(c);
                    }
                  });

                  // 5. PAYMENTS & ESCROW
                  const allPayments = [
                    ...(clientFinancials?.transactions || []),
                    ...(payments || []),
                    ...(apiSearchResults?.payments || [])
                  ];
                  const seenPayKeys = new Set();
                  const matchingPayments = [];
                  allPayments.forEach(pm => {
                    const pName = (pm.project || pm.projectName || '').toLowerCase();
                    const cid = (pm.contractId || pm.contract || '').toLowerCase();
                    const txId = (pm.transactionId || pm.id || '').toLowerCase();
                    const typeStr = (pm.type || pm.paymentType || pm.type_label || pm.milestone || '').toLowerCase();
                    if (pName.includes(q) || cid.includes(q) || txId.includes(q) || typeStr.includes(q)) {
                      const k = (pm.transactionId || pm.id || `${pm.project}_${pm.amount}`).toLowerCase().trim();
                      if (!seenPayKeys.has(k)) {
                        seenPayKeys.add(k);
                        matchingPayments.push(pm);
                      }
                    }
                  });

                  // 6. MESSAGES
                  const allMessages = [
                    ...(liveConversations || []),
                    ...(apiSearchResults?.messages || [])
                  ];
                  const seenMsgKeys = new Set();
                  const matchingMessages = [];
                  allMessages.forEach(msg => {
                    const cp = (msg.counterpart || msg.name || msg.username || '').toLowerCase();
                    const cpId = (msg.counterpartId || msg.email || '').toLowerCase();
                    const snip = (msg.snippet || msg.last_message || msg.content || '').toLowerCase();
                    if (cp.includes(q) || cpId.includes(q) || snip.includes(q)) {
                      const k = (msg.counterpartId || msg.username || msg.counterpart || msg.name || '').toLowerCase().trim();
                      if (k && !seenMsgKeys.has(k)) {
                        seenMsgKeys.add(k);
                        matchingMessages.push(msg);
                      }
                    }
                  });

                  const totalMatches = matchingProjects.length + matchingApplications.length + matchingFreelancers.length + matchingContracts.length + matchingPayments.length + matchingMessages.length;

                  if (totalMatches === 0) {
                    return (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center py-4">No matching results found for "{searchQuery}"</p>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {/* PROJECTS GROUP */}
                      {matchingProjects.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>MY PROJECTS</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{matchingProjects.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingProjects.slice(0, 4).map(p => (
                              <div
                                key={p.id || p.title}
                                onClick={() => {
                                  setSelectedProjectDetailView(p);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="Open Project Details"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{p.title}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{p.category || 'General'} • {p.budget || 'Budget TBD'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">{p.status || 'Active'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* APPLICATIONS GROUP */}
                      {matchingApplications.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>PROJECT APPLICATIONS</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{matchingApplications.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingApplications.slice(0, 4).map(app => (
                              <div
                                key={app.id || `${app.projectTitle}_${app.freelancer}`}
                                onClick={() => {
                                  setSelectedProjectApplicationsFilter(app.projectTitle || app.project);
                                  setApplicationFilter('All');
                                  setActiveTab('applications');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="View Application in Applications Tab"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{app.freelancer || app.freelancerName}</p>
                                  <p className="text-[11px] text-slate-500 truncate">For: {app.projectTitle || app.project}</p>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">{app.status || 'Pending'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FREELANCERS GROUP */}
                      {matchingFreelancers.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-purple-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>FREELANCERS</span>
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">{matchingFreelancers.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingFreelancers.slice(0, 4).map(fl => {
                              const displayName = fl.name || fl.freelancer || fl.username;
                              const displayRole = fl.title || 'Freelancer Specialist';
                              return (
                                <div
                                  key={fl.id || displayName}
                                  onClick={() => {
                                    setSelectedProfileFreelancer(fl);
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                  title="Open Freelancer Profile"
                                >
                                  <div className="truncate pr-2">
                                    <p className="font-extrabold text-slate-900 truncate">{displayName}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{displayRole} {fl.email ? `• ${fl.email}` : ''}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
                                    {fl.isHired ? 'Hired' : (fl.isSaved ? 'Saved' : 'Candidate')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CONTRACTS GROUP */}
                      {matchingContracts.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>CONTRACTS</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">{matchingContracts.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingContracts.slice(0, 4).map(c => (
                              <div
                                key={c.id || c.contractId}
                                onClick={() => {
                                  setSelectedContractDetail(c);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="Open Contract Details"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{c.id || c.contractId} — {c.projectName || c.project || c.title}</p>
                                  <p className="text-[11px] text-slate-500 truncate">With: {c.freelancer || c.freelancerName} {c.freelancerEmail ? `(${c.freelancerEmail})` : ''}</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">{c.status || 'Active'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PAYMENTS & ESCROW GROUP */}
                      {matchingPayments.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>PAYMENTS & ESCROW</span>
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">{matchingPayments.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingPayments.slice(0, 4).map((pm, idx) => (
                              <div
                                key={pm.transactionId || pm.id || idx}
                                onClick={() => {
                                  setActiveTab('payments');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="View in Payments & Escrow"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{pm.project || pm.projectName || 'Milestone Escrow'} — {pm.amount || '₹0'}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{pm.type || pm.paymentType || pm.type_label || 'Payment'} • Ref: {pm.contractId || pm.transactionId || pm.id || 'N/A'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Ledger</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MESSAGES GROUP */}
                      {matchingMessages.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-sky-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>MESSAGES</span>
                            <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-full">{matchingMessages.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingMessages.slice(0, 3).map((msg, idx) => {
                              const cpName = msg.counterpart || msg.name || msg.username || 'Chat User';
                              return (
                                <div
                                  key={msg.id || idx}
                                  onClick={() => {
                                    setActiveTab('messages');
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                  title="Open Chat in Messages"
                                >
                                  <div className="truncate pr-2">
                                    <p className="font-extrabold text-slate-900 truncate">{cpName}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{msg.snippet || msg.last_message || msg.content || 'Active conversation'}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full shrink-0">Chat</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
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
          const pendingAppsList = proposals.filter(p => {
            const st = (p.status || '').toLowerCase();
            return st === 'pending' || st === 'under review';
          });
          const pendingContractsList = contracts.filter(c => (c.status || '').toLowerCase() === 'pending');
          const pendingMilestonesList = contracts.filter(c => 
            Array.isArray(c.milestones) && c.milestones.some(m => {
              const mst = (m.status || '').toLowerCase();
              return mst === 'pending_approval' || mst === 'under review' || mst === 'review';
            })
          );
          const hasActionRequired = pendingAppsList.length > 0 || pendingContractsList.length > 0 || pendingMilestonesList.length > 0;
          const pendingAppsCount = pendingAppsList.length;
          const pendingReviewCount = pendingAppsList.length;

          const totalBudgetSum = clientProjects.reduce((sum, p) => sum + parseCurrency(p.budget), 0);
          const formattedTotalBudget = `₹${totalBudgetSum.toLocaleString('en-IN')}`;

          const activeContracts = contracts.filter(c => c.status === 'Active');
          const pendingEscrowSum = activeContracts.reduce((sum, c) => sum + parseCurrency(c.escrow || c.escrowBalance || c.amount || c.agreedAmount || c.agreed_amount), 0);
          const formattedPendingEscrow = `₹${pendingEscrowSum.toLocaleString('en-IN')}`;

          return (
            <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
              
              {/* WELCOME BANNER SECTION */}
              <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 rounded-3xl p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Decorative background glow shape */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="space-y-1 z-10">
                  <p className="text-xs font-bold text-slate-500">Good evening,</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{userSession?.email || `${currentUserId}@gmail.com`}</span>
                    <span>👋</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Here's an overview of your projects, hiring activity, and payments.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 z-10">
                  <p className="text-xs font-semibold text-slate-500 italic hidden lg:block max-w-[220px] text-right">
                    “Turn your ideas into reality with the right talent.”
                  </p>
                  <button 
                    onClick={() => { setMilestoneItems([]); setShowPostProjectModal(true); }}
                    className="bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                  >
                    <span className="text-base font-normal">+</span>
                    <span>Post New Project</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Card 1: ACTIVE PROJECTS */}
                  <div 
                    onClick={() => { setProjectFilter('All'); setActiveTab('projects'); }}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group space-y-4"
                    title="View My Projects"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                        <FolderKanban className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
                        {activeProjectsCount > 0 ? `${activeProjectsCount} active` : '0 active'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">ACTIVE PROJECTS</p>
                      <p className="text-3xl font-black text-slate-900">{activeProjectsCount}</p>
                      <p className="text-xs text-slate-500 font-medium">{inProgressCount} in progress</p>
                    </div>
                  </div>

                  {/* Card 2: PENDING APPLICATIONS */}
                  <div 
                    onClick={() => { setApplicationFilter('Pending Review'); setActiveTab('applications'); }}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group space-y-4"
                    title="View Project Applications"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/80">
                        {pendingAppsCount > 0 ? `${pendingAppsCount} pending` : '0 pending'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wider">PENDING APPLICATIONS</p>
                      <p className="text-3xl font-black text-slate-900">{pendingAppsCount}</p>
                      <p className="text-xs text-slate-500 font-medium">{pendingReviewCount} require your review</p>
                    </div>
                  </div>

                  {/* Card 3: TOTAL PROJECT VALUE */}
                  <div 
                    onClick={() => { setProjectFilter('All'); setActiveTab('projects'); }}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group space-y-4"
                    title="View Projects Budget"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60 font-black text-xl">
                        ₹
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/80">
                        Active Budget
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">TOTAL PROJECT VALUE</p>
                      <p className="text-3xl font-black text-slate-900">{formattedTotalBudget}</p>
                      <p className="text-xs text-slate-500 font-medium">Across all active projects</p>
                    </div>
                  </div>

                  {/* Card 4: AVAILABLE WALLET & ESCROW BALANCE */}
                  <div 
                    onClick={() => setActiveTab('payments')}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group space-y-4"
                    title="Open Payments & Escrow Hub"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
                        <Wallet className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/80">
                        Active Escrow
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">AVAILABLE WALLET BALANCE</p>
                      <p className="text-3xl font-black text-slate-900">{clientFinancials?.available_balance_str || '₹0'}</p>
                      <p className="text-xs text-slate-500 font-medium">Escrow Locked: {clientFinancials?.escrow_balance_str || (pendingEscrowSum > 0 ? formattedPendingEscrow : '₹45,000')}</p>
                    </div>
                  </div>

                </div>

            {/* ROW 1: ACTIVE PROJECTS (6 COLS) + ACTION REQUIRED (3 COLS) + HIRING ACTIVITY (3 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 1. ACTIVE PROJECTS PANEL */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">Active Projects</h3>
                  <button 
                    onClick={() => { setProjectFilter('All'); setActiveTab('projects'); }}
                    className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>View All Projects</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {clientProjects.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto">
                        <FolderKanban className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">No projects yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                        Start by posting your first project to receive freelancer applications and AI matches.
                      </p>
                      <button 
                        onClick={() => { setMilestoneItems([]); setShowPostProjectModal(true); }}
                        className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Post New Project</span>
                      </button>
                    </div>
                  ) : (
                    clientProjects.slice(0, 2).map((p, idx) => {
                      const pProgress = getProjectProgress(p);
                      const isHiring = p.status === 'Open for Bids' || p.status === 'Hiring';
                      return (
                        <div key={p.id || idx} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4 hover:border-blue-200 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <Code className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 
                                    onClick={() => setSelectedProjectDetailView(p)}
                                    className="font-extrabold text-slate-900 text-base hover:text-[#2563eb] cursor-pointer transition-colors"
                                    title="View project details"
                                  >
                                    {formatTitle(p.title)}
                                  </h4>
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">
                                    {p.status || 'In Progress'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                  {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-black text-slate-900">{formatCurrency(p.budget)}</p>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">BUDGET</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-[#2563eb] transition-all duration-500" 
                                style={{ width: `${pProgress || 15}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-black text-slate-700">{pProgress || 15}%</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-slate-200/60 text-slate-600 font-medium">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>Posted: {p.postedDate || 'Sep 08, 2026'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>🏳️</span>
                                <span>Milestones <strong>ACTIVE</strong></span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>⏳</span>
                                <span>{p.duration || '1 Month'} <strong>REMAINING</strong></span>
                              </span>
                            </div>

                            <button 
                              onClick={() => setSelectedManageProject(p)}
                              className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                            >
                              Manage Project
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. ACTION REQUIRED PANEL */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">Action Required</h3>
                  <button onClick={() => setActiveTab('applications')} className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-center items-center text-center p-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 border border-blue-100 relative">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold border-2 border-white">✓</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">You're all caught up!</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                    No actions currently require your review.
                  </p>
                </div>
              </div>

              {/* 3. HIRING ACTIVITY PANEL */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">Hiring Activity</h3>
                  <button onClick={() => setActiveTab('applications')} className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  {proposals.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-black text-xs">
                          J
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-900">James123@gmail.com</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[110px]">Ai powered docu...</p>
                          <p className="text-xs font-black text-[#2563eb]">₹45000</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700">Accepted</span>
                    </div>
                  ) : (
                    proposals.slice(0, 3).map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        onClick={() => setActiveTab('applications')}
                        className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between hover:border-blue-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-black text-xs shrink-0">
                            {(item.freelancer || item.freelancerName || 'C')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-900 truncate">{item.freelancer || item.freelancerName || 'Freelancer'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.projectTitle || item.project || 'Proposal'}</p>
                            <p className="text-xs font-black text-[#2563eb]">{item.bid || item.bidAmount || '₹45,000'}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 shrink-0">
                          {item.status === 'Accepted' || item.status === 'Hired' ? 'Accepted' : 'Under Review'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* ROW 2: MILESTONE PROGRESS (4 COLS) + FINANCIAL OVERVIEW (4 COLS) + TOP HIRED FREELANCERS (4 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 1. MILESTONE PROGRESS (DONUT CHART) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Milestone Progress</h3>
                  <button onClick={() => setActiveTab('contracts')} className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                    View All Milestones →
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  {/* SVG DONUT CHART */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#2563eb]"
                        strokeDasharray="15, 100"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-black text-slate-900 text-lg">15%</span>
                  </div>

                  {/* LEGEND */}
                  <div className="space-y-2.5 flex-1 text-xs font-extrabold">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>Completed</span>
                      </span>
                      <span className="text-slate-900">0</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                        <span>In Progress</span>
                      </span>
                      <span className="text-slate-900">1</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        <span>Pending</span>
                      </span>
                      <span className="text-slate-900">5</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-black text-slate-900">
                      <span>Total</span>
                      <span>6</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. FINANCIAL OVERVIEW */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Financial Overview</h3>
                  <button onClick={() => setActiveTab('payments')} className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                    View All Payments →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                      ₹
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">{formattedTotalBudget}</p>
                      <p className="text-xs font-bold text-slate-500">Total Project Value</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">₹45,000</p>
                      <p className="text-xs font-bold text-slate-500">Escrow Locked</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. TOP HIRED FREELANCERS */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Top Hired Freelancers</h3>
                  <button onClick={() => setActiveTab('freelancers')} className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer">
                    View All Freelancers →
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div 
                    onClick={() => setActiveTab('freelancers')}
                    className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between hover:border-blue-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-black text-sm">
                        J
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">James123@gmail.com</p>
                        <div className="flex items-center space-x-1 text-xs text-amber-500 mt-0.5">
                          <span>★★★★★</span>
                          <span className="text-slate-600 font-extrabold ml-1">4.8</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-base">›</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

        {/* TAB 2: MY PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
            
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
                  <span>🏠</span>
                  <span>Projects</span>
                  <span>›</span>
                  <span className="text-slate-900 font-extrabold">My Projects</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Posted Projects ({clientProjects.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Manage your active postings, applications, hired freelancers, contracts, and milestone progress.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button 
                  onClick={() => { setMilestoneItems([]); setShowPostProjectModal(true); }}
                  className="bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span className="text-base font-normal">+</span>
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
                  const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
                  return !isClosed && (p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open' || (pProg === 0 && p.status !== 'Completed'));
                }).length,
                inProgress: clientProjects.filter(p => {
                  const pProg = getProjectProgress(p);
                  const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
                  const isComp = p.status === 'Completed' || pProg === 100;
                  const isHir = !isClosed && (p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open' || (pProg === 0 && p.status !== 'Completed'));
                  return !isClosed && !isComp && !isHir;
                }).length,
                completed: clientProjects.filter(p => {
                  const pProg = getProjectProgress(p);
                  const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
                  return !isClosed && (p.status === 'Completed' || pProg === 100);
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
                    { label: 'Saved Drafts 📄', key: 'Drafts', count: counts.drafts }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setProjectFilter(f.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        projectFilter === f.key 
                          ? 'bg-[#2563eb] text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-medium">
                        When you click "Save Draft" while creating a project in the Post New Marketplace Project modal, your saved drafts will appear here so you can edit and publish them anytime.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setMilestoneItems([]); setShowPostProjectModal(true); }}
                      className="px-5 py-2.5 bg-[#2563eb] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      + Create & Save Draft
                    </button>
                  </div>
                ) : (
                  savedDraftsList.map(draft => (
                    <div 
                      key={draft.id} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-slate-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                              {formatTitle(draft.projectTitle)}
                            </h3>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
                              📄 Saved Draft
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                              {draft.category || 'Software Development'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                            {draft.description || 'No detailed scope written yet for this project draft.'}
                          </p>

                          <div className="flex items-center space-x-4 pt-1 text-xs text-slate-600 font-semibold flex-wrap gap-y-1">
                            <span>Budget: <strong className="text-slate-900">${draft.budget || '0'}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong className="text-slate-900">{draft.duration || '3 Weeks'}</strong></span>
                            <span>•</span>
                            <span>Milestones: <strong className="text-slate-900">{draft.milestoneItems?.length || 0} Phases</strong></span>
                            <span>•</span>
                            <span className="text-slate-500">Saved: {draft.savedAt || 'Recently'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-2">
                          <button
                            onClick={() => handlePublishDraftDirectly(draft)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            title="Instantly publish this draft to the marketplace"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish Now</span>
                          </button>
                          <button
                            onClick={() => handleResumeDraft(draft)}
                            className="px-4 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            title="Review and modify draft details before posting"
                          >
                            <span>Resume & Edit</span>
                            <span>→</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                    <p className="text-xs text-slate-500 mt-1">No marketplace projects match your selected filter or search query.</p>
                  </div>
                  <button 
                    onClick={() => { setMilestoneItems([]); setShowPostProjectModal(true); }}
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

                  const isClosed = p.status === 'Closed' || p.status === 'Cancelled';
                  const isCompleted = (p.status === 'Completed' || pProgressPct === 100) && !isClosed;
                  const isHiring = !isClosed && !hiredName && !linkedContract && (p.status === 'Open for Bids' || p.status === 'Hiring' || p.status === 'Open');
                  const isInProgress = !isHiring && !isCompleted && !isClosed;
                  const isProjectAssigned = Boolean(
                    hiredName || 
                    (linkedContract && (linkedContract.status || '').toLowerCase() !== 'cancelled') || 
                    isInProgress || 
                    isCompleted ||
                    p.status === 'In Progress' ||
                    p.status === 'Completed'
                  );

                  return (
                    <div 
                      key={p.id} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 hover:border-slate-300 transition-all"
                    >
                      {/* Top Row: Title, Status, Category, Skills + Right Agreed Budget */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start space-x-4 min-w-0 flex-1">
                          {/* Icon Box */}
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-[#2563eb]" />
                          </div>

                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                              <h3 
                                onClick={() => setSelectedProjectDetailView(p)}
                                className="font-black text-lg sm:text-xl text-slate-900 tracking-tight hover:text-[#2563eb] cursor-pointer transition-colors"
                                title="View project details"
                              >
                                {formatTitle(p.title)}
                              </h3>

                              {/* Status Badges */}
                              {isHiring && (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-100">
                                  Hiring
                                </span>
                              )}
                              {isInProgress && (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#2563eb] border border-blue-100">
                                  In Progress ({pProgressPct || 15}%)
                                </span>
                              )}
                              {isCompleted && (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Completed
                                </span>
                              )}
                              {isClosed && (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-100">
                                  Closed
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-slate-500">
                              Category: <span className="text-[#2563eb] font-bold">{p.category}</span>
                            </p>

                            {/* Required Skills Chips */}
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1 pt-1">
                              {(Array.isArray(p.skills) ? p.skills : (p.skills || '').split(',')).map((sk, idx) => (
                                <span key={idx} className="bg-blue-50/80 text-[#2563eb] font-extrabold text-xs px-3 py-1 rounded-full border border-blue-100/70">
                                  {sk.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Agreed Budget Box */}
                        <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-3.5 px-5 flex items-center space-x-3 text-right shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5 text-[#2563eb]" />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-2xl sm:text-3xl block leading-none">{formatCurrency(p.budget)}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mt-1">AGREED BUDGET</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Info Bar Row (6 Columns) */}
                      <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-xs font-medium">
                        {/* 1. Posted */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Posted</p>
                            <p className="font-black text-slate-900">{p.postedDate || 'Sep 08, 2026'}</p>
                          </div>
                        </div>

                        {/* 2. Duration */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Duration</p>
                            <p className="font-black text-slate-900">{p.duration || '1 Month'}</p>
                          </div>
                        </div>

                        {/* 3. Deadline */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <Milestone className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Deadline</p>
                            <p className="font-black text-[#2563eb]">{p.deadline || calculateProjectDeadline(p.postedDate || p.created_at, p.duration)}</p>
                          </div>
                        </div>

                        {/* 4. Applicants */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Applicants</p>
                            <p className="font-black text-slate-900">{pApplicantCount}</p>
                          </div>
                        </div>

                        {/* 5. Hired Freelancer */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <UserCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Hired Freelancer</p>
                            {hiredName ? (
                              <p 
                                onClick={() => {
                                  const targetFl = hiredFreelancers.find(f => f.name.toLowerCase() === hiredName.toLowerCase());
                                  setSelectedProfileFreelancer(targetFl || { name: hiredName, title: 'Hired Freelancer' });
                                }}
                                className="font-black text-[#2563eb] truncate hover:underline cursor-pointer"
                              >
                                {hiredName}
                              </p>
                            ) : (
                              <p className="font-extrabold text-slate-400">None yet</p>
                            )}
                          </div>
                        </div>

                        {/* 6. Contract */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 font-extrabold uppercase">Contract</p>
                            {contractCode ? (
                              <span 
                                onClick={() => linkedContract && setSelectedContractDetail(linkedContract)}
                                className="font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs hover:opacity-80 cursor-pointer inline-block mt-0.5"
                              >
                                {contractCode}
                              </span>
                            ) : (
                              <p className="font-extrabold text-slate-400">N/A</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons Row */}
                      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <button 
                            onClick={() => setSelectedProjectDetailView(p)}
                            className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Project Details</span>
                          </button>

                          {linkedContract && (
                            <button 
                              onClick={() => setSelectedContractDetail(linkedContract)}
                              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Contract ({contractCode})</span>
                            </button>
                          )}

                          <button 
                            onClick={() => { setSelectedKanbanProject(p.title); setActiveTab('kanban'); }}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2"
                          >
                            <Kanban className="w-4 h-4" />
                            <span>Sprint Task Board</span>
                          </button>
                        </div>

                        <div>
                          {isProjectAssigned ? (
                            <button 
                              onClick={() => {
                                const blockedMsg = "This project cannot be deleted because a freelancer has already been assigned to it. Please complete or close the project instead.";
                                setToast({ message: blockedMsg, type: 'error' });
                                alert(blockedMsg);
                              }}
                              className="px-4 py-2.5 bg-rose-50/50 text-rose-300 border border-rose-100 rounded-xl text-xs font-extrabold cursor-not-allowed flex items-center space-x-1.5"
                              title="This project cannot be deleted because a freelancer has already been assigned to it. Please complete or close the project instead."
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Project</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDeleteProject(p.id, p.title)}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Project</span>
                            </button>
                          )}
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
          <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
            
            {/* Header Title Section with Top-Right Filter Pills */}
            {(() => {
              const allCount = proposals.length;
              const pendingCount = proposals.filter(pr => pr.status !== 'Accepted' && pr.status !== 'Hired').length;
              const hiredCount = proposals.filter(pr => pr.status === 'Accepted' || pr.status === 'Hired').length;

              return (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
                      <span>«</span>
                      <span>Home</span>
                      <span>›</span>
                      <span className="text-slate-900 font-extrabold">Project Applications</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Project Applications ({proposals.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Review incoming freelancer bids, inspect cover letters, and hire candidates.
                    </p>
                  </div>

                  {/* Filter Tabs for Applications on Top-Right */}
                  <div className="flex items-center space-x-2 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs shrink-0">
                    {[
                      { label: 'All', key: 'All', count: allCount },
                      { label: 'Pending Review', key: 'Pending Review', count: pendingCount },
                      { label: 'Hired / Active', key: 'Hired / Active', count: hiredCount }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setApplicationFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          applicationFilter === f.key 
                            ? 'bg-[#2563eb] text-white shadow-xs' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-5">
              {selectedProjectApplicationsFilter && (
                <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-[#2563eb] text-white text-xs rounded-lg font-extrabold">Project Filter</span>
                    <span>Showing applications for: <strong className="text-blue-700 font-extrabold">{selectedProjectApplicationsFilter}</strong></span>
                  </div>
                  <button 
                    onClick={() => setSelectedProjectApplicationsFilter(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-extrabold cursor-pointer"
                  >
                    Show All Applications ✕
                  </button>
                </div>
              )}

              {proposals.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    👥
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">No pending applications</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                    Applications submitted by freelancers for your posted projects will appear here for review.
                  </p>
                </div>
              ) : (() => {
                const filteredProposals = proposals.filter(pr => {
                  if (selectedProjectApplicationsFilter) {
                    const pTitle = (pr.projectTitle || pr.project || '').toLowerCase().trim();
                    const filterTarget = selectedProjectApplicationsFilter.toLowerCase().trim();
                    const pId = String(pr.projectId || pr.project_id || '');
                    if (pTitle !== filterTarget && pId !== filterTarget) return false;
                  }
                  const isAccepted = pr.status === 'Accepted' || pr.status === 'Hired';
                  if (applicationFilter === 'Pending Review') return !isAccepted;
                  if (applicationFilter === 'Hired / Active') return isAccepted;
                  return true;
                });

                if (filteredProposals.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                        🔍
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">No matching applications</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                        No proposals matched {selectedProjectApplicationsFilter ? `"${selectedProjectApplicationsFilter}"` : `the "${applicationFilter}" filter`}.
                      </p>
                      <button 
                        onClick={() => { setSelectedProjectApplicationsFilter(null); setApplicationFilter('All'); }}
                        className="px-4 py-2 bg-blue-50 text-[#2563eb] hover:bg-blue-100 rounded-xl text-xs font-bold cursor-pointer transition-colors inline-block"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                return filteredProposals.map(pr => {
                  const isAccepted = pr.status === 'Accepted' || pr.status === 'Hired';
                  const initials = (pr.freelancer || pr.freelancerName || 'Candidate').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';

                  return (
                    <div 
                      key={pr.id} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 hover:border-slate-300 transition-all"
                    >
                      {/* Top Row: Avatar, Username, Badge, Role/Rating, Applied Project + Right Budget */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start space-x-4 min-w-0 flex-1">
                          {/* Avatar Circle */}
                          <div className="w-12 h-12 rounded-full bg-[#2563eb] text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                            {pr.avatar || initials}
                          </div>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                              <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                                {pr.freelancer || pr.freelancerName || 'Freelancer Candidate'}
                              </h3>

                              {/* Status Badges */}
                              {isAccepted ? (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  ✓ Hired & Active Contract
                                </span>
                              ) : (
                                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-100">
                                  Pending Review
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-[#2563eb]">
                              {pr.title || 'Senior Full Stack & AI Specialist'} • <span className="text-amber-500 font-extrabold">⭐ {pr.rating || 4.9}</span>
                            </p>
                            <p className="text-xs font-medium text-slate-600">
                              Applied for: <span className="text-slate-900 font-black">{pr.projectTitle || pr.project || 'AI Powered Document Analysis System'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right Budget & Delivery Sub-Card */}
                        <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-3 px-5 text-right shrink-0">
                          <span className="font-black text-slate-900 text-2xl sm:text-3xl block leading-none">{formatCurrency(pr.bid || pr.bidAmount)}</span>
                          <span className="text-xs font-extrabold text-slate-500 block mt-1">🕒 {pr.delivery || pr.deliveryTime || '3 weeks'} Delivery</span>
                        </div>
                      </div>

                      {/* Cover Letter Block */}
                      <div className="bg-blue-50/40 border border-blue-100/70 rounded-2xl p-4 text-xs font-medium text-slate-700 leading-relaxed">
                        "{pr.coverLetter || pr.proposalText || 'done'}"
                      </div>

                      {/* Bottom Info & Action Buttons Row */}
                      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                        
                        {/* Left Metadata Items */}
                        <div className="flex items-center space-x-6 text-slate-500 font-medium">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">📅</span>
                            <div>
                              <p className="text-[10px] uppercase font-extrabold text-slate-400">Applied On</p>
                              <p className="font-black text-slate-900">{pr.date || 'Sep 10, 2026'}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-base">📄</span>
                            <div>
                              <p className="text-[10px] uppercase font-extrabold text-slate-400">Cover Letter</p>
                              <p onClick={() => handleViewCoverLetter(pr)} className="font-extrabold text-[#2563eb] hover:underline cursor-pointer">View Cover Letter</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                          <button
                            onClick={() => setSelectedProfileFreelancer({
                              name: pr.freelancer,
                              freelancer: pr.freelancer,
                              title: pr.title,
                              rate: pr.bid,
                              rating: pr.rating,
                              avatar: pr.avatar
                            })}
                            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <UserCircle className="w-4 h-4 text-[#2563eb]" />
                            <span>View Profile</span>
                          </button>

                          <button 
                            onClick={() => { setSelectedChat(pr.freelancer); setActiveTab('messages'); }} 
                            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <MessageSquare className="w-4 h-4 text-[#2563eb]" />
                            <span>Send Message</span>
                          </button>

                          <button
                            onClick={() => handleToggleSaveFreelancer({
                              freelancer_id: pr.freelancerId || pr.freelancer,
                              name: pr.freelancer,
                              title: pr.title,
                              hourly_rate: pr.bid,
                              rating: pr.rating,
                              avatar: pr.avatar
                            })}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                              isFreelancerSaved(pr.freelancerId || pr.freelancer)
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                                : 'bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200'
                            }`}
                            title={isFreelancerSaved(pr.freelancerId || pr.freelancer) ? 'Click to Unsave' : 'Click to Save / Bookmark'}
                          >
                            {isFreelancerSaved(pr.freelancerId || pr.freelancer) ? (
                              <>
                                <BookmarkCheck className="w-4 h-4 text-amber-600" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-4 h-4 text-[#2563eb]" />
                                <span>Save</span>
                              </>
                            )}
                          </button>

                          {isAccepted ? (
                            <>
                              <button 
                                onClick={() => setActiveTab('freelancers')}
                                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5"
                              >
                                <Users className="w-4 h-4 text-[#2563eb]" />
                                <span>View in Hired Roster →</span>
                              </button>

                              <button 
                                onClick={() => { 
                                  setSelectedKanbanProject(pr.projectTitle || pr.project || 'All'); 
                                  setActiveTab('kanban'); 
                                  window.dispatchEvent(new Event('freematch_kanban_event'));
                                }}
                                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
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
                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                              >
                                Reject Proposal
                              </button>

                              <button 
                                onClick={() => handleAcceptProposal(pr)} 
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                              >
                                <Check className="w-4 h-4" />
                                <span>Hire Freelancer Now</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* TAB 5: HIRED FREELANCERS ROSTER */}
        {activeTab === 'freelancers' && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
              <span className="hover:text-slate-700 cursor-pointer" onClick={() => setActiveTab('overview')}>🏠 Home</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
              <span className="text-slate-800 font-bold">Hired Freelancers</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Hired Freelancers Roster ({hiredFreelancers.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Active contracts, performance tracking, and direct communication.
                </p>

                {/* Sub-Navigation Switch between Hired and Saved Freelancers */}
                <div className="flex items-center space-x-2 bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs w-fit mt-4">
                  <button
                    onClick={() => setActiveTab('freelancers')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all bg-[#2563eb] text-white shadow-xs flex items-center space-x-1.5"
                  >
                    <span>👥</span>
                    <span>Hired Freelancers ({hiredFreelancers.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved-freelancers')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-[#2563eb] hover:bg-slate-100 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>⭐</span>
                    <span>Saved Freelancers ({savedFreelancers.length})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-center">
                <button
                  onClick={() => setActiveTab('saved-freelancers')}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 shadow-2xs"
                  title="View your saved / bookmarked freelancers"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Saved Freelancers ({savedFreelancers.length}) →</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hiredFreelancers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 col-span-full">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    💼
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">No freelancers hired yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      When you accept a freelancer proposal, your hired talent roster will be displayed here.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <button 
                      onClick={() => { setSelectedProjectApplicationsFilter(null); setActiveTab('applications'); }}
                      className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-2"
                    >
                      <span>View Applications →</span>
                    </button>

                    {savedFreelancers.length > 0 && (
                      <button 
                        onClick={() => setActiveTab('saved-freelancers')}
                        className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-2"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Saved Freelancers ({savedFreelancers.length}) →</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                hiredFreelancers.map(hf => (
                  <div 
                    key={hf.id} 
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="space-y-4">
                      {/* Header: Avatar + Info + Active Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                            {hf.avatar}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
                              {hf.name}
                            </h3>
                            <p className="text-xs font-bold text-[#2563eb] mt-0.5">
                              {hf.title}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-amber-400 text-xs">★</span>
                              <span className="text-xs font-extrabold text-slate-800">{hf.rating || '4.0'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center space-x-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          <span>Active Contract</span>
                        </span>
                      </div>

                      {/* Info Sub-Card: Active Project, Hourly Rate, Hired Date */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Active Project
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 text-right truncate max-w-[170px]" title={hf.project}>
                            {hf.project}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Hourly Rate
                          </span>
                          <span className="text-xs font-extrabold text-emerald-600">
                            {formatHourlyRate(hf.rate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Hired Date
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {hf.hiredDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Buttons 2x2 Grid */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setSelectedProfileFreelancer(hf)} 
                          className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-2xs"
                        >
                          <span>👤</span>
                          <span>Profile & Reviews</span>
                        </button>

                        <button
                          onClick={() => handleToggleSaveFreelancer(hf)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border ${
                            isFreelancerSaved(hf)
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={isFreelancerSaved(hf) ? 'Remove from Saved Freelancers' : 'Bookmark to Saved Freelancers'}
                        >
                          {isFreelancerSaved(hf) ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setSelectedChat(hf.name); setActiveTab('messages'); }} 
                          className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center shadow-xs flex items-center justify-center space-x-1.5"
                        >
                          <span>💬 Chat</span>
                        </button>

                        <button 
                          onClick={() => { setSelectedKanbanProject(hf.project || 'All'); setActiveTab('kanban'); }} 
                          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center border border-slate-200 flex items-center justify-center space-x-1.5"
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
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
              <span className="hover:text-slate-700 cursor-pointer" onClick={() => setActiveTab('overview')}>🏠 Home</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
              <span className="text-slate-800 font-bold">Contracts</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Contracts & Milestone Agreements ({contracts.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Legal escrow hold agreements, terms of service, and freelancer contract documents.
                </p>
              </div>

              {/* Status Filter Pills with dynamic counts */}
              <div className="flex items-center space-x-1.5 bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex-wrap gap-y-1 self-start lg:self-center">
                {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map(f => {
                  let fCount = 0;
                  if (f === 'All') {
                    fCount = rawContracts.filter(c => !removedContractIds.includes(c.contractId || c.id) && c.status !== 'Cancelled' && c.status !== 'Archived').length;
                  } else if (f === 'Active') {
                    fCount = rawContracts.filter(c => !removedContractIds.includes(c.contractId || c.id) && c.status === 'Active').length;
                  } else if (f === 'Pending') {
                    fCount = rawContracts.filter(c => !removedContractIds.includes(c.contractId || c.id) && c.status === 'Pending').length;
                  } else if (f === 'Completed') {
                    fCount = rawContracts.filter(c => !removedContractIds.includes(c.contractId || c.id) && c.status === 'Completed').length;
                  } else if (f === 'Cancelled') {
                    fCount = rawContracts.filter(c => removedContractIds.includes(c.contractId || c.id) || c.status === 'Cancelled' || c.status === 'Archived').length;
                  }

                  return (
                    <button
                      key={f}
                      onClick={() => setContractFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        contractFilter === f 
                          ? 'bg-[#2563eb] text-white shadow-xs' 
                          : 'text-slate-600 hover:text-[#2563eb] hover:bg-slate-100'
                      }`}
                    >
                      {f} ({fCount})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {contracts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto font-bold">
                    📋
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">No active contracts yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                    Contracts are automatically created when you accept a freelancer's proposal.
                  </p>
                </div>
              ) : (
                contracts.map(c => {
                  const cId = c.contractId || c.id;
                  const cProject = c.projectName || c.project;
                  const cFreelancer = c.freelancerName || c.freelancer;
                  const initials = cFreelancer.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';
                  const cAmount = formatCurrency(c.agreedAmount || c.agreed_amount || c.amount);
                  const cEscrow = formatCurrency(c.escrowBalance || c.escrow || c.amount);
                  const cDate = c.startDate || 'Sep 8, 2026';

                  return (
                    <div 
                      key={c.id || cId} 
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      {/* Left Info Column */}
                      <div className="space-y-3 flex-1">
                        {/* Header Badges: Contract ID & Status */}
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <span className="font-extrabold text-[#2563eb] text-xs px-3 py-1 rounded-xl bg-blue-50 border border-blue-200/80 shadow-2xs">
                            {cId}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 border ${
                            c.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                              : c.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${c.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
                            <span>{c.status}</span>
                          </span>
                        </div>

                        {/* Project Name */}
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-snug">
                          {cProject}
                        </h3>

                        {/* Freelancer Line with Avatar */}
                        <div className="flex items-center space-x-2.5 pt-0.5">
                          <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Freelancer: <span className="font-extrabold text-[#2563eb]">{cFreelancer}</span>
                          </span>
                        </div>

                        {/* Metadata Rows: Start Date & Escrow Balance */}
                        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 pt-1 flex-wrap gap-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span>📅</span>
                            <span>Start Date: <span className="text-slate-900 font-extrabold">{cDate}</span></span>
                          </div>
                          <span className="text-slate-300">|</span>
                          <div className="flex items-center space-x-1.5">
                            <span>🪙</span>
                            <span>Escrow Funded Balance: <span className="text-emerald-600 font-extrabold">{cEscrow}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Agreed Budget Sub-Card & Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                        {/* Agreed Budget Sub-Card */}
                        <div className="bg-blue-50/60 rounded-2xl p-4 px-5 border border-blue-100/80 flex items-center space-x-3.5 shadow-2xs">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2563eb] font-black text-lg flex items-center justify-center shrink-0">
                            ₹
                          </div>
                          <div>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block leading-tight">
                              {cAmount}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                              AGREED BUDGET
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 min-w-[190px]">
                          <button 
                            onClick={() => handleDownloadContractPDF(c)}
                            className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Download className="w-4 h-4 text-white" />
                            <span>Download Contract PDF</span>
                          </button>

                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setSelectedContractDetail(c)}
                              className="w-1/2 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                            >
                              <span>👁️</span>
                              <span>View Contract</span>
                            </button>

                            <button 
                              onClick={() => handleRemoveContract(c)}
                              className="w-1/2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                              title="Remove contract agreement"
                            >
                              <span>🗑️</span>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
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
          <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
              <span className="hover:text-slate-700 cursor-pointer" onClick={() => setActiveTab('overview')}>🏠 Home</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400" />
              <span className="text-slate-800 font-bold">Saved Freelancers</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Saved Freelancers ({savedFreelancers.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Manage your bookmarked talent, view candidate profiles, and hire freelancers directly into active projects.
                </p>

                {/* Sub-Navigation Switch between Hired and Saved Freelancers */}
                <div className="flex items-center space-x-2 bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs w-fit mt-4">
                  <button
                    onClick={() => setActiveTab('freelancers')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-[#2563eb] hover:bg-slate-100 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>👥</span>
                    <span>Hired Freelancers ({hiredFreelancers.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved-freelancers')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all bg-[#2563eb] text-white shadow-xs flex items-center space-x-1.5"
                  >
                    <span>⭐</span>
                    <span>Saved Freelancers ({savedFreelancers.length})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-center">
                <button
                  onClick={() => setActiveTab('applications')}
                  className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200/80 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 shadow-2xs shrink-0"
                >
                  <span>🧭</span>
                  <span>Explore Candidates →</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedFreelancers.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl mx-auto font-bold">⭐</div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">No Saved Freelancers Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mt-1">
                      Bookmark top talent from proposals, candidate search, or profiles to quickly access and hire them for future projects.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                  >
                    <span>Explore Candidates / Applications →</span>
                  </button>
                </div>
              ) : (
                savedFreelancers.map((sf, idx) => (
                  <div key={sf.id || idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:border-slate-300 hover:shadow-sm">
                    <div className="space-y-3.5">
                      {/* Top Header: Avatar + Info + Rate Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                            {sf.avatar || (sf.name ? sf.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FL')}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">{sf.name}</h3>
                            <p className="text-xs font-bold text-[#2563eb] mt-0.5">{sf.title || 'Senior Full Stack & AI Specialist'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shrink-0">
                          {formatHourlyRate(sf.rate || sf.hourly_rate)}
                        </span>
                      </div>

                      {/* Rating & Job Success */}
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 pt-0.5">
                        <span className="text-amber-500 font-extrabold flex items-center space-x-1">
                          <span>★</span>
                          <span>{sf.rating || '4.0'} / 5.0</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 font-extrabold">{sf.jobSuccess || '100% Job Success'}</span>
                      </div>

                      {/* Skills Sub-card */}
                      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          ⚙️ SKILLS & EXPERTISE
                        </span>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">
                          {sf.skills || 'Python, React, Docker, MySQL, AI/ML'}
                        </p>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleRemoveSavedFreelancer(sf.freelancer_id || sf.name)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>🗑️ Remove</span>
                      </button>
                      <button
                        onClick={() => handleHireSavedFreelancer(sf)}
                        className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>🚀 Hire Freelancer</span>
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
            <KanbanBoard role="client" currentUserName={userSession?.name || userSession?.username || 'Client'} initialProjectFilter={selectedKanbanProject} isDark={isDark} />
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
          <div className="p-6 sm:p-8 space-y-6">
            {/* BREADCRUMB */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-slate-700 flex items-center gap-1">
                <span>🏠</span> Home
              </span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Payments & Escrow</span>
            </div>

            {/* PAGE HEADER ROW WITH BANNER CARD */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                  Payments & Escrow Management
                </h2>
                <p className="text-sm font-semibold text-[#334155] mt-1">
                  Track milestone deposits, release funds to freelancers, and download tax invoices.
                </p>
              </div>

              {/* Top Right Security Banner Card */}
              <div className="p-3.5 px-4.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center space-x-3.5 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5.5 h-5.5 text-[#2563eb]" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 block">Secure. Transparent. Hassle-Free.</span>
                  <span className="text-slate-600 font-semibold">Your payments are protected with escrow.</span>
                </div>
              </div>
            </div>

            {/* TOP 4 FINANCIAL SUMMARY CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Available Wallet Balance */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-blue-100 text-[#2563eb]">
                      <Wallet className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <span className="text-xs font-black text-[#2563eb] uppercase tracking-wider">AVAILABLE WALLET BALANCE</span>
                  </div>
                  <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-600">ⓘ</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#2563eb] tracking-tight">
                    {clientFinancials?.available_balance_str || '₹0'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Ready for projects and milestone funding</p>
                </div>
              </div>

              {/* Card 2: Escrow Locked Balance */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-amber-100 text-[#d97706]">
                      <Lock className="w-5 h-5 text-[#d97706]" />
                    </div>
                    <span className="text-xs font-black text-[#d97706] uppercase tracking-wider">ESCROW LOCKED BALANCE</span>
                  </div>
                  <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-600">ⓘ</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#d97706] tracking-tight">
                    {clientFinancials?.escrow_balance_str && clientFinancials?.escrow_balance_str !== '₹0'
                      ? clientFinancials.escrow_balance_str
                      : (clientFinancials?.pending_release_str && clientFinancials?.pending_release_str !== '₹0' ? clientFinancials.pending_release_str : '₹45,000')}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Held securely in milestone escrow</p>
                </div>
              </div>

              {/* Card 3: Total Released Payments */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 text-[#059669]">
                      <Coins className="w-5 h-5 text-[#059669]" />
                    </div>
                    <span className="text-xs font-black text-[#059669] uppercase tracking-wider">TOTAL RELEASED PAYMENTS</span>
                  </div>
                  <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-600">ⓘ</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#059669] tracking-tight">
                    {clientFinancials?.released_payments_str || '₹0'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Successfully paid to freelancers</p>
                </div>
              </div>

              {/* Card 4: Connected Gateway */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50/70 via-white to-white border border-purple-200/80 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-black text-purple-600 uppercase tracking-wider">CONNECTED GATEWAY</span>
                  </div>
                  <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-600">⚙️</span>
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900 tracking-tight">
                    {clientFinancials?.gateway_status || 'Payment gateway not configured'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Razorpay & Stripe inactive • ₹0</p>
                </div>
              </div>
            </div>

            {/* SECONDARY SUMMARY ROW */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                <Calendar className="w-4.5 h-4.5 text-[#2563eb] shrink-0" />
                <span>Pending Milestone Release:</span>
                <span className="text-sm font-black text-slate-900">
                  {clientFinancials?.pending_release_str && clientFinancials?.pending_release_str !== '₹0'
                    ? clientFinancials.pending_release_str
                    : (clientFinancials?.escrow_balance_str && clientFinancials?.escrow_balance_str !== '₹0' ? clientFinancials.escrow_balance_str : '₹45,000')}
                </span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                <Coins className="w-4.5 h-4.5 text-[#2563eb] shrink-0" />
                <span>Total Completed Withdrawals:</span>
                <span className="text-sm font-black text-slate-900">
                  {clientFinancials?.total_withdrawn_str || '₹0'}
                </span>
              </div>
            </div>

            {/* MILESTONE TRANSACTION HISTORY TABLE CARD */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563eb]">
                    <Clock className="w-4.5 h-4.5 text-[#2563eb]" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Milestone Transaction History</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer">
                    <option value="all">All Transactions</option>
                    <option value="deposit">Escrow Deposits</option>
                    <option value="release">Milestone Releases</option>
                    <option value="refund">Refunds</option>
                  </select>
                  <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {payments.length} {payments.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200/90 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto border border-blue-100">
                    <ShieldCheck className="w-7 h-7 text-[#2563eb]" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900">No Payment Transactions Yet</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                    Milestone releases, escrow deposits, and invoices will appear here once payment transactions occur.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 px-2">Date</th>
                        <th className="pb-3 px-2">Type</th>
                        <th className="pb-3 px-2">Project / Milestone</th>
                        <th className="pb-3 px-2">Amount</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Transaction ID</th>
                        <th className="pb-3 px-2">Invoice</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {payments.map(py => (
                        <tr key={py.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-2 font-medium text-slate-600">{py.date || 'Sep 10, 2026'}</td>
                          <td className="py-3.5 px-2">
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                              {py.type || 'Escrow Hold'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold text-slate-900">{py.project || 'AI powered document analysis system'}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{py.milestone || 'Milestone 1 — Core Infrastructure'}</p>
                          </td>
                          <td className="py-3.5 px-2 font-black text-slate-900 text-sm">{formatCurrency(py.amount || 45000)}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                              py.status === 'Paid' || py.status === 'Released'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {py.status || 'Escrow Locked'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-xs text-blue-600 font-bold">{py.id || 'TXN-9938'}</td>
                          <td className="py-3.5 px-2">
                            <button className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer flex items-center space-x-1">
                              <span>📄 PDF</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ABOUT PAYMENTS & ESCROW BOTTOM INFO CARD */}
            <div className="p-4.5 rounded-2xl bg-blue-50/70 border border-blue-100/90 flex items-start space-x-3.5 text-xs font-medium text-slate-700 relative overflow-hidden">
              <div className="p-2.5 rounded-xl bg-[#2563eb] text-white shrink-0 mt-0.5 shadow-2xs">
                <Info className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <strong className="text-slate-900 font-extrabold block text-sm">About Payments & Escrow</strong>
                <p className="text-slate-600 font-semibold leading-relaxed">
                  Funds are held securely in escrow and released based on milestone completion. Download invoices for your records and track all transactions here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: REVIEWS & PERFORMANCE FEEDBACK */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* BREADCRUMB */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-slate-700 flex items-center gap-1">
                <span>🏠</span> Home
              </span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Reviews</span>
            </div>

            {/* PAGE HEADER ROW WITH BANNER DECORATION */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                  Reviews & Performance Feedback
                </h2>
                <p className="text-sm font-semibold text-[#334155] mt-1">
                  Rate completed freelancer deliverables, update database performance metrics, and inspect review history.
                </p>
              </div>

              {/* Right Star Decoration Graphic Card */}
              <div className="p-3.5 px-4.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center space-x-3.5 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                  <Star className="w-5.5 h-5.5 text-[#2563eb] fill-[#2563eb]" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 block">AI Match Rating System</span>
                  <span className="text-slate-600 font-semibold">Granular metrics update algorithm match scores.</span>
                </div>
              </div>
            </div>

            {/* 1. Review Submission Form Card */}
            {(!selectedCandidate || REVIEWABLE_CANDIDATES.length === 0) ? (
              <div className="p-8 sm:p-12 rounded-3xl border border-slate-200 bg-white shadow-xs text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-blue-600 fill-blue-600/20" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-slate-900">No Reviewable Freelancers Yet</h3>
                  <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto">
                    Once you accept a freelancer's proposal and award an active contract, you can leave granular performance feedback, code ratings, and communication scores here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-6">
                {/* Form Header & Candidate Select */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100">
                      <MessageSquare className="w-5.5 h-5.5 text-[#2563eb]" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 tracking-tight">Leave Performance Rating for Completed Contract</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Submit ratings and feedback to help maintain a trusted freelancer ecosystem.</p>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">SELECT COMPLETED FREELANCER / PROJECT</label>
                    <select
                      value={selectedCandidate?.id || ''}
                      onChange={(e) => {
                        const found = REVIEWABLE_CANDIDATES.find(c => c.id === e.target.value);
                        if (found) setSelectedCandidate(found);
                      }}
                      className="w-full lg:w-auto p-2.5 px-3.5 border rounded-xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-300 text-slate-900 cursor-pointer shadow-2xs"
                    >
                      {REVIEWABLE_CANDIDATES.map(cand => (
                        <option key={cand.id} value={cand.id}>
                          {cand.freelancer} — {cand.projectTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Candidate Banner */}
                <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-blue-50/60 border-blue-100 shadow-2xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0">
                      {selectedCandidate?.avatar || 'FL'}
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900">{selectedCandidate?.freelancer || 'Freelancer'}</h4>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        Project: <span className="text-[#2563eb] font-extrabold">{selectedCandidate?.projectTitle || 'Project'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#1e40af] bg-white px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs shrink-0">
                    Agreed Rate: {formatHourlyRate(selectedCandidate?.rate)}
                  </span>
                </div>

                {/* Form Inputs & Rating Cards */}
                <form onSubmit={handleAddReview} className="space-y-6">
                  
                  {/* 3 Rating Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Communication Card */}
                    <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200/80 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">💬</span>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-900">Communication</label>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xl">
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
                        <span className="text-xs font-black text-slate-900 ml-2">{commRating}/5</span>
                      </div>
                    </div>

                    {/* Code Quality Card */}
                    <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200/80 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">💻</span>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-900">Code Quality</label>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xl">
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
                        <span className="text-xs font-black text-slate-900 ml-2">{codeRating}/5</span>
                      </div>
                    </div>

                    {/* Deadline Adherence Card */}
                    <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200/80 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">⏱️</span>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-900">Deadline Adherence</label>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xl">
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
                        <span className="text-xs font-black text-slate-900 ml-2">{deadlineRating}/5</span>
                      </div>
                    </div>

                  </div>

                  {/* Computed Score Badge */}
                  <div>
                    <span className="inline-flex items-center space-x-2 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl shadow-2xs">
                      <span>🏆</span>
                      <span>Overall Computed Score: {Math.round((commRating + codeRating + deadlineRating) / 3.0)} / 5 Stars ›</span>
                    </span>
                  </div>

                  {/* Review Textarea */}
                  <div className="space-y-1 relative">
                    <textarea
                      rows="3"
                      required
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={`Write detailed evaluation for ${selectedCandidate?.freelancer || 'freelancer'} regarding sprint deliverables, unit testing, and communication...`}
                      className="w-full p-4 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-400 shadow-2xs"
                    ></textarea>
                    <div className="text-right text-[11px] font-semibold text-slate-400 pr-1">
                      {commentInput.length}/1000
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmittingReview}
                    className={`px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-sm hover:shadow-md transition-all flex items-center space-x-2 ${
                      isSubmittingReview ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Review & Boosting Score...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Review & Boost AI Match Score</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 2. Review History Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2563eb]">
                    <Clock className="w-4.5 h-4.5 text-[#2563eb]" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Review History</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReviewTab('given')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      reviewTab === 'given' 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Reviews Given ({reviews.filter(r => r.type === 'given').length})
                  </button>
                  <button
                    onClick={() => setReviewTab('received')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      reviewTab === 'received' 
                        ? 'bg-[#2563eb] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Reviews Received ({reviews.filter(r => r.type === 'received').length})
                  </button>
                </div>
              </div>

              {/* Review Items */}
              <div className="space-y-3.5">
                {reviews.filter(r => r.type === reviewTab).length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200/90 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Star className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      No {reviewTab === 'given' ? 'Submitted' : 'Received'} Reviews Yet
                    </h4>
                    <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                      {reviewTab === 'given' 
                        ? "You haven't submitted any performance reviews for freelancers yet." 
                        : "You haven't received any reviews from freelancers yet."}
                    </p>
                  </div>
                ) : (
                  reviews.filter(r => r.type === reviewTab).map(rv => (
                    <div key={rv.id} className="p-5 rounded-2xl border space-y-3 bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-black text-sm text-slate-900">{rv.reviewer}</span>
                          <span className="text-slate-400 font-bold text-xs mx-0.5">➔</span>
                          <span className="text-[#2563eb] text-sm font-black">{rv.reviewee}</span>
                          <span className="text-xs font-semibold text-slate-500">
                            (Project: <span className="font-bold text-slate-800">{rv.projectTitle}</span>)
                          </span>
                        </div>
                        <div className="text-amber-400 text-sm font-black flex items-center space-x-1 shrink-0">
                          <span>{'★'.repeat(rv.rating)}</span>
                          <span className="font-mono text-xs font-bold text-slate-700">({rv.rating}/5)</span>
                        </div>
                      </div>

                      <p className="text-xs font-medium italic p-3.5 rounded-xl border bg-slate-50 border-slate-200/70 text-slate-800 leading-relaxed">
                        "{rv.comment}"
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-500 pt-1">
                        <span>📅 Posted: {rv.date}</span>
                        {rv.comm && (
                          <div className="flex items-center space-x-3 text-slate-700 font-bold text-[11px]">
                            <span>💬 Comm: {rv.comm}★</span>
                            <span>•</span>
                            <span>💻 Quality: {rv.code}★</span>
                            <span>•</span>
                            <span>⏱️ Deadline: {rv.deadline}★</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
          <div className={`w-full min-h-screen relative z-10 ${isDark ? 'bg-[#030712]' : 'bg-white'}`}>
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
          </div>
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
                    onClick={() => { setShowPostProjectModal(false); setMilestoneItems([]); setActiveResumedDraftId(null); }}
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
                            <p className="text-xs text-slate-700 font-semibold">Break down your project into milestone phases</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMilestoneItems([
                              ...milestoneItems, 
                              { id: `${Date.now()}_${milestoneItems.length}`, title: '', amount: '' }
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
                                setMilestoneItems(milestoneItems.filter((_, i) => i !== idx));
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
                    onClick={() => { setShowPostProjectModal(false); setMilestoneItems([]); setActiveResumedDraftId(null); }}
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
                isSaved={isFreelancerSaved(targetProfileData)}
                onToggleSave={() => handleToggleSaveFreelancer(targetProfileData)}
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
                <p className="font-extrabold text-slate-900 text-base">{selectedContractDetail.clientName || selectedContractDetail.client || userSession?.name || userSession?.username || 'Client'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Account ID: {selectedContractDetail.clientId || userSession?.user_id || 'client'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Freelancer Information</p>
                <p className="font-extrabold text-[#2563eb] text-base">{selectedContractDetail.freelancerName || selectedContractDetail.freelancer || 'Freelancer'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Account ID: {selectedContractDetail.freelancerId || 'freelancer'}</p>
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

            <form onSubmit={async (e) => {
              e.preventDefault();
              const updated = clientProjects.map(p => p.id === selectedManageProject.id ? selectedManageProject : p);
              setClientProjects(updated);
              localStorage.setItem(projectStorageKey, JSON.stringify(updated));
              if (isDemoUser) {
                localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
              }

              // Sync to Django API using PUT for existing project
              const cleanId = String(selectedManageProject.id || '').replace(/^proj_/, '');
              const url = cleanId ? `http://localhost:8000/api/projects/${cleanId}/` : 'http://localhost:8000/api/projects/';
              const method = cleanId ? 'PUT' : 'POST';
              try {
                await fetch(url, {
                  method: method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: selectedManageProject.title,
                    category: selectedManageProject.category,
                    budget: selectedManageProject.budget,
                    duration: selectedManageProject.duration,
                    skills: Array.isArray(selectedManageProject.skills) ? selectedManageProject.skills.join(', ') : selectedManageProject.skills,
                    description: selectedManageProject.description
                  })
                });
                if (typeof loadLiveProjects === 'function') {
                  loadLiveProjects();
                }
              } catch (err) {
                console.error("Error updating project:", err);
              }

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
                  <p className="text-slate-800 font-medium">Target Deadline: <span className="text-[#2563eb] font-extrabold">{p.deadline || calculateProjectDeadline(p.postedDate || p.created_at, p.duration)}</span></p>
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
