import React, { useState, useEffect, useMemo, useRef } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';
import NotificationCenter from '../NotificationCenter';
import MessagingCenter from '../MessagingCenter';
import FreelancerProfileView from '../FreelancerProfileView';
import FreelancerSettingsView from '../FreelancerSettingsView';
import ClientReviewsView from '../ClientReviewsView';
import FreelancerEarningsView from '../FreelancerEarningsView';
import { calculateFreelancerFinancials } from '../../utils/freelancerFinancials';
import { fetchNotifications } from '../../utils/notificationService';
import { 
  Zap, 
  LayoutDashboard, 
  Search, 
  Send, 
  Kanban, 
  MessageCircle, 
  Wallet, 
  UserCircle, 
  Bell, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Briefcase, 
  Star, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Link as LinkIcon, 
  ArrowRight,
  Clock,
  CheckCircle2,
  FolderKanban,
  Building2,
  Calendar,
  ShieldCheck,
  CheckSquare,
  X,
  Eye,
  MoreVertical,
  Filter
} from 'lucide-react';

const FreelancerDashboard = ({ userSession, reviews = [], onSignOut }) => {
  const isDark = false;
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'jobs' | 'proposals' | 'tasks' | 'earnings' | 'contracts' | 'profile' | 'settings' | 'notifications'
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // Freelancer Contracts State
  const [contractTabFilter, setContractTabFilter] = useState('All');
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [selectedContractDetail, setSelectedContractDetail] = useState(null);
  const [freelancerDbContracts, setFreelancerDbContracts] = useState([]);
  const [freelancerFinancials, setFreelancerFinancials] = useState(null);
  const [freelancerDbTasks, setFreelancerDbTasks] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);

  // Proposal Form State
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('4500');
  const [deliveryTime, setDeliveryTime] = useState('2 Weeks');

  // Submitted Proposals List (Synced with Client Inbox)
  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_proposals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Sync Available Jobs & Submitted Proposals with LocalStorage & Django API
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const activeProjects = parsed.filter(p => {
            const st = (p.status || '').toLowerCase().trim();
            return st !== 'closed' && st !== 'cancelled' && st !== 'completed';
          });
          if (activeProjects.length > 0) {
            return activeProjects.map((p, idx) => ({
              id: p.id || `job_${idx}`,
              title: p.title || 'AI Project',
              client: p.clientName || p.client || 'Enterprise Client',
              clientId: p.clientId || p.client_id || p.client || 'client',
              client_id: p.clientId || p.client_id || p.client || 'client',
              budget: p.budget || '₹4,500',
              duration: p.duration || '3 Weeks',
              category: p.category || 'Software Development',
              status: p.status || 'Open for Bids',
              description: p.description || 'AI model fine-tuning and API integration.',
              skills: p.requiredSkills || p.skills || ['Python', 'PyTorch', 'Django'],
              posted: p.postedDate || p.posted || 'Just now',
              attachedFile: p.attachedFile || null,
              abstract: p.abstract || null,
              milestones: p.milestones || p.milestoneItems || []
            }));
          }
        }
      } catch (e) {}
    }
    return [];
  });

  const [notifications, setNotifications] = useState([]);
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || '').toLowerCase().trim();
  const currentFlName = userSession?.name || userSession?.user_id || userSession?.username || 'Freelancer';
  const isDemo = currentFlId === 'demo_freelancer';

  // Global Workspace Search State
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
      fetch(`http://localhost:8000/api/search/?role=freelancer&user_id=${encodeURIComponent(currentFlId)}&q=${encodeURIComponent(q)}`)
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
  }, [debouncedSearchQuery, currentFlId]);

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

  const myProfileData = useMemo(() => {
    if (isDemo) {
      return {
        name: 'Alex Mercer',
        user_id: 'demo_freelancer',
        title: 'Senior React, PyTorch & Django Architect',
        headline: 'Senior React, PyTorch & Django Architect',
        location: 'San Francisco, CA',
        hourlyRate: '₹4,000 / hr',
        availabilityStatus: 'Available for Work',
        availableHours: '40 hrs/week',
        yearsExperience: '7+',
        projectsCompleted: '24',
        jobSuccessRate: '100%',
        onTimeDelivery: '98%',
        lifetimeEarnings: '₹2,89,000',
        bio: 'Senior Full Stack & Artificial Intelligence Engineer with 7+ years of experience constructing high-performance RESTful APIs, deep learning inference pipelines, and real-time React web applications.',
        skills: ['React.js', 'Python Django', 'PyTorch ML', 'PostgreSQL', 'Tailwind CSS', 'D3.js', 'REST API Architecture', 'OWASP Security', 'FastAPI'],
        completenessPercentage: 95
      };
    }
    return {
      name: currentFlName,
      user_id: currentFlId,
      title: '',
      headline: '',
      location: '',
      hourlyRate: '₹0 / hr',
      availabilityStatus: 'Available for Work',
      availableHours: '40 hrs/week',
      yearsExperience: '0',
      projectsCompleted: '0',
      jobSuccessRate: '100%',
      onTimeDelivery: '100%',
      lifetimeEarnings: '₹0',
      bio: '',
      skills: [],
      completenessPercentage: 20
    };
  }, [currentFlId, currentFlName, isDemo]);

  const [headerAvatar, setHeaderAvatar] = useState(() => {
    let av = userSession?.avatar_url || '';
    if (!av && currentFlId) {
      try {
        const cached = JSON.parse(localStorage.getItem(`freematch_profile_${currentFlId}`) || '{}');
        av = cached.avatar_url || '';
      } catch (e) {}
    }
    return av;
  });

  useEffect(() => {
    const handleAvatarUpdate = (e) => {
      const newAv = e?.detail?.avatar_url;
      if (typeof newAv === 'string') {
        setHeaderAvatar(newAv);
      } else if (currentFlId) {
        try {
          const cached = JSON.parse(localStorage.getItem(`freematch_profile_${currentFlId}`) || '{}');
          if (cached.avatar_url !== undefined) setHeaderAvatar(cached.avatar_url);
        } catch (err) {}
      }
    };
    window.addEventListener('freematch_user_avatar_event', handleAvatarUpdate);
    return () => {
      window.removeEventListener('freematch_user_avatar_event', handleAvatarUpdate);
    };
  }, [currentFlId]);

  const loadFreelancerContracts = React.useCallback(() => {
    if (!currentFlId) {
      setFreelancerDbContracts([]);
      return;
    }
    fetch(`http://localhost:8000/api/contracts/?freelancer_id=${encodeURIComponent(currentFlId)}`)
      .then(res => res.json())
      .then(apiContracts => {
        if (Array.isArray(apiContracts)) {
          setFreelancerDbContracts(apiContracts);
        }
      })
      .catch(() => {});
  }, [currentFlId]);

  const loadFreelancerFinancials = React.useCallback(() => {
    if (!currentFlId) {
      setFreelancerFinancials(null);
      return;
    }
    fetch(`http://localhost:8000/api/freelancer-financials/?freelancer_id=${encodeURIComponent(currentFlId)}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.available_balance !== 'undefined') {
          setFreelancerFinancials(data);
        }
      })
      .catch(() => {});
  }, [currentFlId]);

  const loadFreelancerTasks = React.useCallback(() => {
    if (!currentFlId) {
      setFreelancerDbTasks([]);
      return;
    }
    fetch(`http://localhost:8000/api/sprint-tasks/?freelancer=${encodeURIComponent(currentFlId)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(t => ({
            ...t,
            project: t.project || t.projectTitle || 'Enterprise Project',
            assignee: t.assignee || 'Assigned Freelancer'
          }));
          setFreelancerDbTasks(mapped);
        }
      })
      .catch(() => {});
  }, [currentFlId]);

  const loadFreelancerProposals = React.useCallback(() => {
    if (!currentFlId) {
      setProposals([]);
      return;
    }
    fetch(`http://localhost:8000/api/proposals/?freelancer_id=${encodeURIComponent(currentFlId)}`)
      .then(res => res.json())
      .then(apiProps => {
        if (Array.isArray(apiProps)) {
          setProposals(apiProps);
          try {
            localStorage.setItem('freematch_shared_proposals', JSON.stringify(apiProps));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, [currentFlId]);

  // Sync proposals and jobs across components via storage events
  React.useEffect(() => {
    const handleSync = () => {
      const savedProposals = localStorage.getItem('freematch_shared_proposals');
      if (savedProposals) {
        try {
          const parsed = JSON.parse(savedProposals);
          if (Array.isArray(parsed)) setProposals(parsed);
        } catch (e) {}
      }
      const savedProjects = localStorage.getItem('freematch_shared_projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed)) {
            const activeProjects = parsed.filter(p => {
              const st = (p.status || '').toLowerCase().trim();
              const isClosedOrDone = st === 'closed' || st === 'cancelled' || st === 'completed' || st === 'in progress';
              const isAssigned = Boolean(p.hiredFreelancer || p.freelancer || p.assigned_freelancer);
              return !isClosedOrDone && !isAssigned;
            });
            setJobs(activeProjects.map((p, idx) => ({
              id: p.id || `job_${idx}`,
              title: p.title || 'AI Project',
              client: p.clientName || p.client || 'Enterprise Client',
              clientId: p.clientId || p.client_id || p.client || 'client',
              client_id: p.clientId || p.client_id || p.client || 'client',
              budget: p.budget || '₹4,500',
              duration: p.duration || '3 Weeks',
              category: p.category || 'Software Development',
              status: p.status || 'Open for Bids',
              description: p.description || 'AI model fine-tuning and API integration.',
              skills: p.requiredSkills || p.skills || ['Python', 'PyTorch', 'Django'],
              posted: p.postedDate || p.posted || 'Just now',
              attachedFile: p.attachedFile || null,
              abstract: p.abstract || null,
              milestones: p.milestones || p.milestoneItems || []
            })));
          }
        } catch (e) {}
      }
    };

    const loadMarketplaceProjects = () => {
      fetch('http://localhost:8000/api/projects/')
        .then(res => res.json())
        .then(apiProjects => {
          if (Array.isArray(apiProjects)) {
            const activeOnly = apiProjects.filter(p => {
              const st = (p.status || '').toLowerCase().trim();
              const isClosedOrDone = st === 'closed' || st === 'cancelled' || st === 'completed' || st === 'in progress';
              const isAssigned = Boolean(p.hiredFreelancer || p.freelancer || p.assigned_freelancer);
              return !isClosedOrDone && !isAssigned;
            });
            const mapped = activeOnly.map((p, idx) => ({
              id: p.id || `job_${idx}`,
              title: p.title || 'AI Project',
              client: p.client || p.client_name || p.clientName || 'Enterprise Client',
              clientId: p.client_id || p.clientId || p.client || 'client',
              client_id: p.client_id || p.clientId || p.client || 'client',
              budget: p.budget || '₹4,500',
              duration: p.duration || '3 Weeks',
              category: p.category || 'Software Development',
              status: p.status || 'Open for Bids',
              description: p.description || 'AI model fine-tuning and API integration.',
              skills: Array.isArray(p.skills) ? p.skills : (typeof p.skills === 'string' ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : ['Python', 'Django']),
              posted: p.postedDate || p.posted || 'Just now',
              attachedFile: p.attachedFile || null,
              abstract: p.abstract || null,
              milestones: p.milestones || p.milestoneItems || []
            }));
            setJobs(mapped);
            try {
              localStorage.setItem('freematch_shared_projects', JSON.stringify(mapped));
            } catch (e) {}
          }
        })
        .catch(() => {});
    };

    const loadBackendNotifs = async () => {
      const cUserId = (userSession?.user_id || userSession?.username || userSession?.email || userSession?.id || '').toString().trim();
      if (cUserId) {
        const notifs = await fetchNotifications(cUserId);
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } else {
        setNotifications([]);
      }
    };

    handleSync();
    loadMarketplaceProjects();
    loadBackendNotifs();

    const loadMessagesCount = () => {
      if (!currentFlId) {
        setMessagesCount(0);
        return;
      }
      fetch(`http://localhost:8000/api/messages/?user_id=${encodeURIComponent(currentFlId)}`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.conversations)) {
            setMessagesCount(data.conversations.length);
            setLiveConversations(data.conversations);
          }
        })
        .catch(() => {});
    };

    loadFreelancerProposals();
    loadFreelancerContracts();
    loadFreelancerFinancials();
    loadFreelancerTasks();
    loadMessagesCount();

    window.addEventListener('storage', handleSync);
    window.addEventListener('storage', loadFreelancerProposals);
    window.addEventListener('freematch_shared_event', handleSync);
    window.addEventListener('freematch_shared_event', loadMarketplaceProjects);
    window.addEventListener('freematch_shared_event', loadFreelancerProposals);
    window.addEventListener('freematch_shared_event', loadFreelancerContracts);
    window.addEventListener('freematch_shared_event', loadFreelancerFinancials);
    window.addEventListener('freematch_shared_event', loadFreelancerTasks);
    window.addEventListener('freematch_shared_event', loadMessagesCount);
    window.addEventListener('freematch_kanban_event', loadFreelancerTasks);
    window.addEventListener('freematch_notification_event', loadBackendNotifs);
    window.addEventListener('focus', loadMarketplaceProjects);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('storage', loadFreelancerProposals);
      window.removeEventListener('freematch_shared_event', handleSync);
      window.removeEventListener('freematch_shared_event', loadMarketplaceProjects);
      window.removeEventListener('freematch_shared_event', loadFreelancerProposals);
      window.removeEventListener('freematch_shared_event', loadFreelancerContracts);
      window.removeEventListener('freematch_shared_event', loadFreelancerFinancials);
      window.removeEventListener('freematch_shared_event', loadFreelancerTasks);
      window.removeEventListener('freematch_shared_event', loadMessagesCount);
      window.removeEventListener('freematch_kanban_event', loadFreelancerTasks);
      window.removeEventListener('freematch_notification_event', loadBackendNotifs);
      window.removeEventListener('focus', loadMarketplaceProjects);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSession]);

  const handleDownloadContractPDF = (contract) => {
    const cId = contract.contractId || contract.id || 'CTR-9024';
    const cProject = contract.projectName || contract.project || 'AI System Architecture';
    const cClient = contract.clientName || contract.client || 'Enterprise Client';
    const cFreelancer = contract.freelancerName || contract.freelancer || userSession?.name || userSession?.username || 'Freelancer';
    const cAmount = contract.agreedAmount || contract.amount || '₹1,50,000';
    const cStartDate = contract.startDate || 'Aug 11, 2026';
    const cDeadline = contract.deadline || 'Aug 30, 2026';
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
            <div class="box-title">CLIENT NAME</div>
            <div class="box-val">${cClient}</div>
          </div>
          <div class="box">
            <div class="box-title">FREELANCER NAME</div>
            <div class="box-val">${cFreelancer}</div>
          </div>
        </div>

        <div class="box" style="margin-bottom: 30px;">
          <div class="box-title">PROJECT DETAILS & FINANCIAL AGREEMENT</div>
          <table class="table" style="margin-top: 10px; margin-bottom: 0;">
            <tr><th>Project Title</th><td>${cProject}</td></tr>
            <tr><th>Contract Status</th><td><strong style="color: #2563eb;">${cStatus}</strong></td></tr>
            <tr><th>Agreed Total Budget</th><td><strong>${cAmount}</strong></td></tr>
            <tr><th>Start Date</th><td>${cStartDate}</td></tr>
            <tr><th>Target Deadline</th><td>${cDeadline}</td></tr>
            <tr><th>Escrow Protection</th><td>Funded & Encrypted via FreeMatch AI Escrow</td></tr>
          </table>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color:#0f172a; margin-top: 25px; margin-bottom: 10px;">Agreed Milestone Deliverables (Sprint Tasks)</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Sprint Task Deliverable</th>
              <th>Agreed Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(contract.milestones && contract.milestones.length > 0) ? contract.milestones.map((m, i) => `
              <tr>
                <td>Phase ${m.number || i + 1}</td>
                <td>${m.title}</td>
                <td><strong style="color:#0f172a;">${m.amount || '₹2,500'}</strong></td>
                <td><span style="color:${(m.status || '').toLowerCase() === 'approved' || (m.status || '').toLowerCase() === 'completed' ? '#16a34a' : (m.status || '').toLowerCase() === 'under review' ? '#d97706' : '#2563eb'}; font-weight:bold;">${m.status || 'Pending'}</span></td>
              </tr>
            `).join('') : `
              <tr>
                <td>Phase 1</td>
                <td>PyTorch Model Optimization & TensorRT Quantization</td>
                <td><strong style="color:#0f172a;">₹2,500</strong></td>
                <td><span style="color:#d97706; font-weight:bold;">Under Review</span></td>
              </tr>
              <tr>
                <td>Phase 2</td>
                <td>CUDA Parallel Execution & vLLM Memory Profiling</td>
                <td><strong style="color:#0f172a;">₹2,500</strong></td>
                <td><span style="color:#2563eb; font-weight:bold;">In Progress</span></td>
              </tr>
            `}
          </tbody>
        </table>

        <div style="margin-top: 40px; font-size: 12px; color: #475569;">
          <p><strong>Legal Binding Declaration:</strong> This digital agreement represents an authenticated contract between the Client and Freelancer on the FreeMatch AI platform. Terms and milestones are synchronized directly with active Sprint Task Board deliverables under encrypted platform governance.</p>
        </div>

        <div class="footer">
          FreeMatch AI Platform • Digitally Signed & Verified Document • ${new Date().toLocaleDateString()}
        </div>

        <script>window.print();</script>
      </body>
      </html>
    `);
    pdfWindow.document.close();
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || '').toLowerCase().trim();
    const flName = userSession?.name || userSession?.username || userSession?.user_id || 'Freelancer';
    const targetClientId = selectedJob.clientId || selectedJob.client_id || selectedJob.client || 'client';

    let proposalDbId = null;
    try {
      const res = await fetch('http://localhost:8000/api/proposals/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedJob.id,
          project_title: selectedJob.title,
          freelancer_id: currentFlId || flName,
          freelancer: flName,
          bid_amount: `₹${bidAmount}`,
          delivery_time: deliveryTime,
          cover_letter: coverLetter
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          proposalDbId = data.id;
        }
      }
    } catch (e) {
      console.warn('Backend proposal submission note:', e);
    }

    const newProposal = {
      id: proposalDbId || `pr_${Date.now()}`,
      db_id: proposalDbId ? String(proposalDbId).replace('prop_', '') : null,
      projectId: selectedJob.id,
      projectTitle: selectedJob.title,
      clientName: selectedJob.client,
      client: selectedJob.client,
      clientId: targetClientId,
      client_id: targetClientId,
      freelancerName: flName,
      freelancer: flName,
      user_id: currentFlId,
      freelancer_id: currentFlId,
      freelancerRole: 'Freelancer Specialist',
      bidAmount: `₹${bidAmount}`,
      bid: `₹${bidAmount}`,
      deliveryTime: deliveryTime,
      delivery: deliveryTime,
      coverLetter: coverLetter,
      status: 'Submitted / Under Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const currentShared = JSON.parse(localStorage.getItem('freematch_shared_proposals') || '[]');
    const updatedProposals = [newProposal, ...currentShared];
    localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProposals));
    if (currentFlId) {
      const userKey = `freematch_user_${currentFlId}_proposals`;
      const currentScoped = JSON.parse(localStorage.getItem(userKey) || '[]');
      localStorage.setItem(userKey, JSON.stringify([newProposal, ...currentScoped]));
    }
    setProposals(updatedProposals);

    setShowBidModal(false);
    setCoverLetter('');
    setToast({ message: `Proposal submitted successfully for "${selectedJob.title}"!`, type: 'success' });
    setActiveTab('proposals');

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_notification_event'));
  };

  const [selectedSprintProjectFilter, setSelectedSprintProjectFilter] = useState('All Assigned Projects');

  const handleViewSprintTask = (pr) => {
    const targetTitle = pr.project || pr.projectTitle;
    if (targetTitle) {
      setSelectedSprintProjectFilter(targetTitle);
    }
    setActiveTab('tasks');
    setToast({ message: `Opening Sprint Board for "${targetTitle}"`, type: 'info' });
  };

  const currentFlNameLower = (userSession?.name || '').toLowerCase().trim();

  const myProposalsCount = (() => {
    if (!currentFlId && !currentFlNameLower) return 0;
    return (proposals || []).filter(pr => {
      const fid = (pr.user_id || pr.freelancer_id || '').toLowerCase().trim();
      const fname = (pr.freelancer || pr.freelancerName || '').toLowerCase().trim();
      return (currentFlId && (fid === currentFlId || fname === currentFlId || fname.includes(currentFlId))) ||
             (currentFlNameLower && (fname === currentFlNameLower || fname.includes(currentFlNameLower)));
    }).length;
  })();

  return (
    <div className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* Background Glowing Orbs */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0 ${
        isDark ? 'bg-blue-600/10' : 'bg-blue-400/15'
      }`}></div>

      {/* FREELANCER PRODUCTIVITY SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors relative z-20 backdrop-blur-xl ${
        isDark ? 'bg-[#060e22]/90 border-slate-800/80' : 'bg-white/90 border-slate-200/90 shadow-xs'
      }`}>
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-500">FreeMatch AI</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold tracking-wider uppercase">Freelancer Workspace</p>
            </div>
          </div>

          <nav className="space-y-4 text-xs font-semibold">
            
            {/* 1. WORKSPACE */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">WORKSPACE</p>
              {[
                { id: 'workspace', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'jobs', label: 'Browse Jobs Feed', icon: Search },
                { id: 'proposals', label: 'My Submitted Bids', icon: Send, badge: myProposalsCount }
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
                { id: 'tasks', label: 'Sprint Task Board', icon: Kanban },
                { id: 'earnings', label: 'Earnings & Wallet', icon: Wallet },
                { id: 'contracts', label: 'Contracts', icon: FileText }
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
                  </button>
                );
              })}
            </div>

            {/* 3. COMMUNICATION */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">COMMUNICATION</p>
              {[
                { id: 'messages', label: 'Messages', icon: MessageCircle, badge: messagesCount },
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 4. ACCOUNT */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="px-3 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">ACCOUNT</p>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'profile' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <UserCircle className="w-4 h-4" />
                <span>View Profile</span>
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'reviews' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Client Reviews & Ratings</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

          </nav>
        </div>
      </aside>

      {/* FREELANCER MAIN WORKSPACE */}
      <main id="freelancer-dashboard-main" className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f4f7fc]">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-30 px-8 py-3 border-b border-slate-200/80 bg-[#f4f7fc]/90 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full max-w-md" ref={searchContainerRef}>
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 dark:text-slate-300">
              <Search className="w-4 h-4" />
            </span>
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
              placeholder="Search available jobs, required skills, or clients..."
              className={`w-full pl-10 pr-8 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
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

                  // 1. AVAILABLE JOBS
                  const localJobs = jobs.filter(j => {
                    const title = (j.title || '').toLowerCase();
                    const cat = (j.category || '').toLowerCase();
                    const skills = (Array.isArray(j.skills) ? j.skills.join(' ') : (j.skills || '')).toLowerCase();
                    const client = (j.client || j.clientName || '').toLowerCase();
                    const desc = (j.description || '').toLowerCase();
                    return title.includes(q) || cat.includes(q) || skills.includes(q) || client.includes(q) || desc.includes(q);
                  });
                  const apiJobs = apiSearchResults?.jobs || [];
                  const seenJobKeys = new Set();
                  const matchingJobs = [];
                  [...localJobs, ...apiJobs].forEach(j => {
                    const k = (j.title || j.id || '').toLowerCase().trim();
                    if (!seenJobKeys.has(k)) {
                      seenJobKeys.add(k);
                      matchingJobs.push(j);
                    }
                  });

                  // 2. MY SUBMITTED BIDS
                  const localProps = proposals.filter(pr => {
                    const pTitle = (pr.projectTitle || pr.project || '').toLowerCase();
                    const cl = (pr.client || pr.clientName || '').toLowerCase();
                    const stat = (pr.status || '').toLowerCase();
                    return pTitle.includes(q) || cl.includes(q) || stat.includes(q);
                  });
                  const apiProps = apiSearchResults?.proposals || [];
                  const seenPropKeys = new Set();
                  const matchingProposals = [];
                  [...localProps, ...apiProps].forEach(pr => {
                    const k = (pr.projectTitle || pr.project || pr.id || '').toLowerCase().trim();
                    if (!seenPropKeys.has(k)) {
                      seenPropKeys.add(k);
                      matchingProposals.push(pr);
                    }
                  });

                  // 3. ASSIGNED / ACTIVE PROJECTS
                  const activeContracts = freelancerDbContracts.filter(c => (c.status || '').toLowerCase() === 'active');
                  const apiAssigned = apiSearchResults?.assigned_projects || [];
                  const seenAssignedKeys = new Set();
                  const matchingAssigned = [];
                  [...activeContracts, ...apiAssigned].forEach(c => {
                    const pName = (c.projectName || c.project || c.title || '').toLowerCase();
                    const cl = (c.clientName || c.client || '').toLowerCase();
                    if (pName.includes(q) || cl.includes(q)) {
                      const k = (c.projectName || c.project || c.id || '').toLowerCase().trim();
                      if (!seenAssignedKeys.has(k)) {
                        seenAssignedKeys.add(k);
                        matchingAssigned.push(c);
                      }
                    }
                  });

                  // 4. CONTRACTS
                  const localContracts = freelancerDbContracts.filter(c => {
                    const cid = (c.id || c.contractId || '').toLowerCase();
                    const pName = (c.projectName || c.project || c.title || '').toLowerCase();
                    const cl = (c.clientName || c.client || '').toLowerCase();
                    const stat = (c.status || '').toLowerCase();
                    return cid.includes(q) || pName.includes(q) || cl.includes(q) || stat.includes(q);
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

                  // 5. SPRINT TASKS
                  const localTasks = freelancerDbTasks.filter(t => {
                    const title = (t.title || t.name || '').toLowerCase();
                    const pName = (t.projectName || t.project || '').toLowerCase();
                    const stat = (t.status || '').toLowerCase();
                    return title.includes(q) || pName.includes(q) || stat.includes(q);
                  });
                  const apiTasks = apiSearchResults?.tasks || [];
                  const seenTaskKeys = new Set();
                  const matchingTasks = [];
                  [...localTasks, ...apiTasks].forEach(t => {
                    const k = (t.title || t.name || t.id || '').toLowerCase().trim();
                    if (!seenTaskKeys.has(k)) {
                      seenTaskKeys.add(k);
                      matchingTasks.push(t);
                    }
                  });

                  // 6. EARNINGS & WALLET
                  const allEarnings = [
                    ...(freelancerFinancials?.transactions || []),
                    ...(apiSearchResults?.earnings || [])
                  ];
                  const seenEarnKeys = new Set();
                  const matchingEarnings = [];
                  allEarnings.forEach(pm => {
                    const pName = (pm.project || pm.projectName || '').toLowerCase();
                    const cid = (pm.contractId || pm.contract || '').toLowerCase();
                    const txId = (pm.transactionId || pm.id || '').toLowerCase();
                    const typeStr = (pm.type || pm.paymentType || pm.type_label || pm.milestone || '').toLowerCase();
                    if (pName.includes(q) || cid.includes(q) || txId.includes(q) || typeStr.includes(q)) {
                      const k = (pm.transactionId || pm.id || `${pm.project}_${pm.amount}`).toLowerCase().trim();
                      if (!seenEarnKeys.has(k)) {
                        seenEarnKeys.add(k);
                        matchingEarnings.push(pm);
                      }
                    }
                  });

                  // 7. MESSAGES
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

                  const totalMatches = matchingJobs.length + matchingProposals.length + matchingAssigned.length + matchingContracts.length + matchingTasks.length + matchingEarnings.length + matchingMessages.length;

                  if (totalMatches === 0) {
                    return (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center py-4">No matching results found for "{searchQuery}"</p>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {/* AVAILABLE JOBS GROUP */}
                      {matchingJobs.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>AVAILABLE JOBS</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{matchingJobs.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingJobs.slice(0, 4).map(j => (
                              <div
                                key={j.id || j.title}
                                onClick={() => {
                                  setSelectedJob(j);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="Open Job Details & Submit Proposal"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{j.title}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{j.client || 'Client'} • {j.budget || 'Budget TBD'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">Apply</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ASSIGNED PROJECTS GROUP */}
                      {matchingAssigned.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>ASSIGNED PROJECTS</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">{matchingAssigned.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingAssigned.slice(0, 3).map(ap => (
                              <div
                                key={ap.id || ap.contractId}
                                onClick={() => {
                                  setActiveTab('contracts');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="View in Contracts Tab"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{ap.projectName || ap.project || ap.title}</p>
                                  <p className="text-[11px] text-slate-500 truncate">Client: {ap.clientName || ap.client || 'Enterprise'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Active</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUBMITTED BIDS GROUP */}
                      {matchingProposals.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>MY SUBMITTED BIDS</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{matchingProposals.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingProposals.slice(0, 3).map(pr => (
                              <div
                                key={pr.id || pr.projectTitle}
                                onClick={() => {
                                  setActiveTab('proposals');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="View in Proposals Tab"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{pr.projectTitle || pr.project}</p>
                                  <p className="text-[11px] text-slate-500 truncate">Bid: {pr.bid || pr.bidAmount || 'N/A'} • {pr.client || 'Client'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">{pr.status || 'Pending'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CONTRACTS GROUP */}
                      {matchingContracts.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-teal-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>CONTRACTS</span>
                            <span className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">{matchingContracts.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingContracts.slice(0, 3).map(c => (
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
                                  <p className="text-[11px] text-slate-500 truncate">Client: {c.clientName || c.client || 'Client'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full shrink-0">{c.status || 'Active'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SPRINT TASKS GROUP */}
                      {matchingTasks.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-violet-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>SPRINT TASKS</span>
                            <span className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">{matchingTasks.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingTasks.slice(0, 3).map(t => (
                              <div
                                key={t.id || t.title}
                                onClick={() => {
                                  setActiveTab('tasks');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="Open in Sprint Workspace"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{t.title || t.name}</p>
                                  <p className="text-[11px] text-slate-500 truncate">Project: {t.projectName || t.project || 'Sprint'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full shrink-0">{t.status || 'To Do'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* EARNINGS & WALLET GROUP */}
                      {matchingEarnings.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>EARNINGS & WALLET</span>
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">{matchingEarnings.length}</span>
                          </p>
                          <div className="space-y-1">
                            {matchingEarnings.slice(0, 3).map((pm, idx) => (
                              <div
                                key={pm.transactionId || pm.id || idx}
                                onClick={() => {
                                  setActiveTab('earnings');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center text-xs transition-colors"
                                title="Open in Earnings & Wallet"
                              >
                                <div className="truncate pr-2">
                                  <p className="font-extrabold text-slate-900 truncate">{pm.project || pm.projectName || 'Milestone Payment'} — {pm.amount || '₹0'}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{pm.type || pm.paymentType || pm.type_label || 'Milestone Release'} • Ref: {pm.contractId || pm.transactionId || pm.id || 'N/A'}</p>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Wallet</span>
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
            <button onClick={() => setActiveTab('notifications')} className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs relative cursor-pointer hover:bg-slate-50">
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-xs px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Top-Right Profile Dropdown Section */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-200/60 transition-all cursor-pointer text-left"
              >
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{userSession?.name || userSession?.username || userSession?.user_id || 'Freelancer'}</p>
                  <p className="text-xs text-[#2563eb] font-extrabold tracking-wider uppercase">{userSession?.headline || userSession?.title || userSession?.role_title || 'FREELANCER SPECIALIST'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-xs shadow-md shrink-0 overflow-hidden">
                  {headerAvatar ? (
                    <img src={headerAvatar} alt={currentFlName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span>{currentFlName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL'}</span>
                  )}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900">{userSession?.name || userSession?.username || 'Freelancer'}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{userSession?.email || ''}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false); }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-extrabold text-[#1e3a8a] hover:bg-blue-50 transition-colors cursor-pointer text-left"
                  >
                    <UserCircle className="w-4 h-4 text-blue-600" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('settings'); setShowProfileDropdown(false); }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-extrabold text-[#1e3a8a] hover:bg-blue-50 transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); setShowLogoutConfirm(true); }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB 4: KANBAN SPRINT TASKS BOARD */}
        {activeTab === 'tasks' && (() => {
          const flDisplayName = userSession?.name || userSession?.user_id || userSession?.username || 'Freelancer';
          return (
            <div className="p-8">
              <KanbanBoard 
                role="freelancer" 
                currentUserName={flDisplayName} 
                currentUserId={userSession?.username || userSession?.user_id || userSession?.email || ''}
                initialProjectFilter={selectedSprintProjectFilter} 
                isDark={isDark} 
              />
            </div>
          );
        })()}

        {/* TAB: BROWSE JOBS FEED */}
        {activeTab === 'jobs' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Marketplace Jobs Feed</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">Discover active client project postings matched to your AI skills profile.</p>
            </div>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border border-dashed ${isDark ? 'border-slate-800 bg-[#060e22]' : 'border-slate-300 bg-white'} space-y-3`}>
                  <Briefcase className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Active Job Postings</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    There are currently no open client projects in the marketplace. When clients post new projects, they will appear here in real-time.
                  </p>
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{job.title}</h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>{job.client} • {job.posted || job.postedDate}</p>
                      </div>
                      <span className="bg-blue-500/10 text-blue-400 font-extrabold text-xs px-3 py-1 rounded-xl">{job.budget}</span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>{job.description}</p>

                    {/* Attached Document or Architecture Image */}
                    {job.attachedFile && (
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-blue-950/30 border-blue-500/30 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            {job.attachedFile.isImage ? <ImageIcon className="w-5 h-5 text-blue-400" /> : <FileText className="w-5 h-5 text-blue-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{job.attachedFile.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{job.attachedFile.size} • Client Technical Attachment</p>
                          </div>
                        </div>
                        <a
                          href={job.attachedFile.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                        >
                          {job.attachedFile.isImage ? <Search className="w-3.5 h-3.5 mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                          <span>{job.attachedFile.isImage ? 'View Diagram' : 'Download Abstract'}</span>
                        </a>
                      </div>
                    )}

                    {job.abstract && (
                      <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        <div className="flex items-center space-x-1.5 mb-1 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Technical Notes & GitHub Link:</span>
                        </div>
                        <p className="whitespace-pre-line text-xs font-mono bg-black/20 p-2.5 rounded-xl border border-slate-800">{job.abstract}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : []).map((s, i) => (
                          <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-semibold">{s}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setSelectedJob(job); setShowBidModal(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Proposal / Bid</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBMITTED BIDS / PROPOSALS */}
        {activeTab === 'proposals' && (() => {
          const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || '').toLowerCase().trim();
          const currentFlName = (userSession?.name || '').toLowerCase().trim();

          const myProposals = (!currentFlId && !currentFlName) ? [] : (proposals || []).filter(pr => {
            const fid = (pr.user_id || pr.freelancer_id || '').toLowerCase().trim();
            const fname = (pr.freelancer || pr.freelancerName || '').toLowerCase().trim();
            return (currentFlId && (fid === currentFlId || fname === currentFlId || fname.includes(currentFlId))) ||
                   (currentFlName && (fname === currentFlName || fname.includes(currentFlName)));
          });

          const combinedContractsList = freelancerDbContracts || [];

          return (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Submitted Proposals & Contracts</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">Track real-time client acceptance status, proposal bids, and milestone sprint triggers.</p>
              </div>

              {myProposals.length > 0 ? (
                <div className="space-y-4">
                  {myProposals.map(pr => {
                    const prTitle = (pr.project || pr.projectTitle || '').toLowerCase().trim();

                    // Strictly check if a valid contract/assignment exists for THIS authenticated freelancer
                    const hasValidAssignment = combinedContractsList.some(c => {
                      const cProj = (c.projectName || c.project || '').toLowerCase().trim();
                      const cFl = (c.freelancerName || c.freelancer || c.freelancerId || c.freelancer_id || '').toLowerCase().trim();
                      const isProjMatch = cProj && prTitle && (cProj === prTitle || cProj.includes(prTitle) || prTitle.includes(cProj));
                      const isFlMatch = cFl && (
                        (currentFlId && (cFl === currentFlId || cFl.includes(currentFlId))) ||
                        (currentFlName && (cFl === currentFlName || cFl.includes(currentFlName)))
                      );
                      return isProjMatch && isFlMatch;
                    });

                    // Real Status Determination: Genuine assignment takes precedence
                    const isGenuinelyAcceptedAndAssigned = hasValidAssignment;

                    // Improved contrast & typography styles
                    const cardBgStyle = isGenuinelyAcceptedAndAssigned
                      ? 'border-emerald-500/40 bg-emerald-950/20 shadow-xs'
                      : isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs';

                    return (
                      <div key={pr.id} className={`p-6 rounded-3xl border space-y-3.5 transition-all ${cardBgStyle}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h4 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'} leading-snug`}>
                                {pr.project || pr.projectTitle}
                              </h4>
                              {isGenuinelyAcceptedAndAssigned ? (
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase flex items-center bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  <span>Contract Accepted / Hired</span>
                                </span>
                              ) : pr.status === 'Rejected' ? (
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase flex items-center bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  <span>Rejected</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase flex items-center bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  <span>Submitted / Under Review</span>
                                </span>
                              )}
                            </div>

                            {/* High-contrast metadata text line */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1.5">
                              <span>Client: <strong className="font-extrabold text-slate-900 dark:text-white">{pr.client}</strong></span>
                              <span className="text-slate-400">•</span>
                              <span>Bid: <strong className="font-extrabold text-blue-600 dark:text-blue-400">{String(pr.bid || pr.bidAmount || '').replace(/\$/g, '₹')}</strong></span>
                              <span className="text-slate-400">•</span>
                              <span>Timeline: <strong className="font-extrabold text-slate-800 dark:text-slate-100">{pr.delivery || pr.deliveryTime}</strong></span>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 self-start sm:self-center shrink-0">
                            {pr.date}
                          </span>
                        </div>

                        {/* Proposal Cover Letter / Description with crisp typography */}
                        {pr.coverLetter && (
                          <p className={`text-xs p-3.5 rounded-xl border font-medium leading-relaxed ${
                            isDark ? 'bg-[#040919] border-slate-800/90 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            "{pr.coverLetter}"
                          </p>
                        )}

                        {/* Action / Status footer */}
                        <div className="flex justify-end pt-1">
                          {isGenuinelyAcceptedAndAssigned ? (
                            <button
                              onClick={() => handleViewSprintTask(pr)}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center space-x-2"
                            >
                              <Kanban className="w-4 h-4" />
                              <span>View Sprint Task Board</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 py-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Awaiting Client Decision</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#060e22] space-y-3">
                  <Send className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Submitted Bids Yet</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
                    Browse available marketplace jobs and submit your first proposal to start working with clients.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 1: DEDICATED CLIENT REVIEWS & RATINGS PAGE */}
        {activeTab === 'reviews' && (() => {
          const currentFlName = userSession?.name || userSession?.username || userSession?.user_id || 'Freelancer';
          const myProfileData = {
            name: currentFlName,
            user_id: userSession?.user_id || userSession?.username || ''
          };
          return (
            <ClientReviewsView
              userSession={userSession}
              freelancerData={myProfileData}
              reviews={reviews}
              isDark={isDark}
              onNavigateToProjects={() => setActiveTab('workspace')}
            />
          );
        })()}

        {/* TAB 2: FREELANCER PROFILE & SKILLS PORTFOLIO */}
        {activeTab === 'profile' && (
          <FreelancerProfileView
            userSession={userSession}
            initialFreelancerData={myProfileData}
            reviews={reviews}
            viewMode="freelancer"
            isDark={isDark}
            showToast={(msg, type = 'info') => setToast({ message: msg, type })}
          />
        )}

        {/* WORKSPACE OVERVIEW TAB */}
        {activeTab === 'workspace' && (() => {
          const {
            assignedProjects,
            totalTasksCount,
            doneTasksCount,
            inProgressCount,
            pendingCount,
            overallProgressPercent,
            walletBalanceStr,
            lifetimeEarningsStr,
            activeContractsStr,
            clientRatingStr,
            completedProjectsCount
          } = (() => {
            const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || '').toLowerCase().trim();
            const currentFlName = (userSession?.name || '').toLowerCase().trim();
            const isDemo = currentFlId === 'demo_freelancer';

            let myTasks = [];
            if (Array.isArray(freelancerDbTasks) && freelancerDbTasks.length > 0) {
              myTasks = freelancerDbTasks;
            } else {
              let kanbanTasks = [];
              try {
                const savedTasks = localStorage.getItem(`freematch_user_${currentFlId}_tasks`);
                if (savedTasks) kanbanTasks = JSON.parse(savedTasks);
              } catch (e) {}

              if ((!Array.isArray(kanbanTasks) || kanbanTasks.length === 0) && isDemo) {
                kanbanTasks = [
                  { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', project: 'AI Automated Test Pipeline', client: 'Haines JP', deadline: 'Aug 30, 2026' }
                ];
              } else if (!Array.isArray(kanbanTasks)) {
                kanbanTasks = [];
              }

              myTasks = isDemo ? kanbanTasks : kanbanTasks.filter(t => {
                const a = (t.assignee || '').toLowerCase();
                return a && (
                  (currentFlId && (a === currentFlId || a.includes(currentFlId) || currentFlId.includes(a))) ||
                  (currentFlName && (a === currentFlName || a.includes(currentFlName) || currentFlName.includes(a)))
                );
              });
            }

            // Build assigned projects from active contracts and actual tasks
            const activeContracts = (freelancerDbContracts || []).filter(c => {
              const st = (c.status || '').toLowerCase().trim();
              return st === 'active' || st === 'in progress' || st === 'pending';
            });

            const projectMap = {};
            activeContracts.forEach(c => {
              const pName = c.projectName || c.project || 'Assigned Project';
              projectMap[pName] = {
                name: pName,
                client: c.clientName || c.client || 'Enterprise Client',
                deadline: c.deadline || 'Aug 30, 2026',
                total: 0,
                done: 0,
                inProgress: 0,
                underReview: 0,
                pending: 0
              };
            });

            myTasks.forEach(t => {
              const projName = t.project || t.projectTitle || 'AI Project';
              if (!projectMap[projName]) {
                if (isDemo || activeContracts.length === 0) {
                  projectMap[projName] = {
                    name: projName,
                    client: t.client || t.clientName || 'Enterprise Client',
                    deadline: t.deadline || t.due || 'Aug 30, 2026',
                    total: 0,
                    done: 0,
                    inProgress: 0,
                    underReview: 0,
                    pending: 0
                  };
                }
              }
              if (projectMap[projName]) {
                projectMap[projName].total += 1;
                if (t.status === 'Done' || t.status === 'Completed') projectMap[projName].done += 1;
                else if (t.status === 'Under Review') projectMap[projName].underReview += 1;
                else if (t.status === 'In Progress') projectMap[projName].inProgress += 1;
                else projectMap[projName].pending += 1;
              }
            });

            let projList = Object.values(projectMap).map(p => {
              const weightedScore = (p.done * 100) + (p.underReview * 60) + (p.inProgress * 30);
              return {
                ...p,
                progress: p.total > 0 ? Math.round(weightedScore / p.total) : 0
              };
            });

            if (!isDemo && activeContracts.length === 0 && myTasks.length === 0) {
              projList = [];
            }

            const tot = myTasks.length;
            const dn = myTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
            const ur = myTasks.filter(t => t.status === 'Under Review').length;
            const inp = myTasks.filter(t => t.status === 'In Progress').length;
            const pnd = tot - dn - ur - inp;

            const totalWeighted = (dn * 100) + (ur * 60) + (inp * 30);
            const overallPct = tot > 0 ? Math.round(totalWeighted / tot) : 0;

            let calculatedRatingStr = isDemo ? '4.9 / 5.0' : 'No ratings yet';
            try {
              let allRevs = Array.isArray(reviews) ? [...reviews] : [];
              const flName = (userSession?.name || userSession?.user_id || '').toLowerCase().trim();
              if (flName) {
                const matched = allRevs.filter(r => r && r.reviewee && String(r.reviewee).toLowerCase().includes(flName.split(' ')[0]));
                if (matched.length > 0) {
                  const avg = matched.reduce((a, b) => a + Number(b.rating || 5), 0) / matched.length;
                  calculatedRatingStr = `${avg.toFixed(1)} / 5.0`;
                }
              }
            } catch (e) {}

            // Unified, single source-of-truth financial calculation
            const fin = calculateFreelancerFinancials({
              userSession,
              contracts: freelancerDbContracts || [],
              apiFinancials: freelancerFinancials
            });

            return {
              assignedProjects: projList,
              totalTasksCount: tot,
              doneTasksCount: dn,
              inProgressCount: inp,
              pendingCount: pnd >= 0 ? pnd : 0,
              overallProgressPercent: overallPct,
              walletBalanceStr: fin.availableBalanceStr,
              lifetimeEarningsStr: fin.lifetimeEarningsStr,
              activeContractsStr: fin.activeContractsCount,
              clientRatingStr: calculatedRatingStr,
              completedProjectsCount: fin.completedProjectsCount
            };
          })();

          return (
            <div className="p-8 space-y-8">
              
              {/* PAGE HEADER */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Freelancer Work & Earnings Workspace</h2>
                <p className={`text-xs ${isDark ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300'} mt-1 font-medium`}>
                  Track your active projects, earnings, and current work progress.
                </p>
              </div>

              {/* 4 PRIMARY SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Wallet Balance */}
                <div className={`p-5 rounded-2xl border border-emerald-500/40 flex items-start justify-between ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-2xs'}`}>
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">AVAILABLE WALLET BALANCE</p>
                    <p className="text-2xl font-extrabold text-emerald-500 mt-1">{walletBalanceStr}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Ready for withdrawal</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 2: Lifetime Earnings */}
                <div className={`p-5 rounded-2xl border flex items-start justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">LIFETIME EARNINGS</p>
                    <p className="text-2xl font-extrabold text-blue-500 mt-1">{lifetimeEarningsStr}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Across {completedProjectsCount} Completed Projects</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 3: Active Contracts */}
                <div className={`p-5 rounded-2xl border flex items-start justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                    <p className="text-2xl font-extrabold text-indigo-400 mt-1">{activeContractsStr}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Ongoing Sprints</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 4: Client Rating */}
                <div 
                  onClick={() => setActiveTab('reviews')} 
                  title="Click to view Client Reviews & Performance Feedback"
                  className={`p-5 rounded-2xl border flex items-start justify-between cursor-pointer transition-all hover:border-amber-400/60 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'}`}
                >
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">CLIENT RATING</p>
                    <p className="text-2xl font-extrabold text-amber-500 mt-1">{clientRatingStr}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center space-x-1 font-medium">
                      <span>Based on verified reviews</span>
                      <span className="text-xs text-blue-600 font-bold underline ml-1">View Reviews &rarr;</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                </div>
              </div>

              {/* ASSIGNED PROJECTS & WORK SUMMARY ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* MY ASSIGNED PROJECTS (2 COLS) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-emerald-500" />
                      <span>MY ASSIGNED PROJECTS</span>
                    </h3>
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {assignedProjects.length} Active
                    </span>
                  </div>

                  {assignedProjects.length > 0 ? (
                    <div className="space-y-3">
                      {assignedProjects.map(proj => (
                        <div 
                          key={proj.name} 
                          className={`p-5 rounded-2xl border transition-all ${
                            isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                              <h4 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'} leading-snug`}>
                                {proj.name}
                              </h4>
                              <div className={`flex flex-wrap items-center gap-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-1 font-medium`}>
                                <span className="flex items-center space-x-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                                  <span>Client: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{proj.client}</strong></span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                                  <span>Deadline: <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{proj.deadline}</strong></span>
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (proj.name) setSelectedSprintProjectFilter(proj.name);
                                setActiveTab('tasks');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5 shrink-0 self-start sm:self-center cursor-pointer"
                            >
                              <span>View Tasks</span>
                            </button>
                          </div>

                          {/* Progress Bar & Status breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Sprint Progress</span>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{proj.progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: `${proj.progress}%` }} 
                              />
                            </div>

                            <div className={`flex items-center gap-3 pt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>
                              <span>✓ <strong className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{proj.done}</strong> Done</span>
                              <span>•</span>
                              <span>⚡ <strong className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{proj.inProgress}</strong> In Progress</span>
                              <span>•</span>
                              <span>⏳ <strong className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{proj.pending}</strong> Pending</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#060e22]">
                      <FolderKanban className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
                      <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Assigned Projects Yet</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                        When a client accepts your bid or assigns a project to you, your active sprint projects will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* MY WORK SUMMARY (1 COL) */}
                <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                  isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        MY WORK SUMMARY
                      </h3>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {totalTasksCount} Tasks
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <div className="text-sm font-black">{doneTasksCount}</div>
                        <div className="text-xs uppercase tracking-wider">Completed</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <div className="text-sm font-black">{inProgressCount}</div>
                        <div className="text-xs uppercase tracking-wider">In Progress</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <div className="text-sm font-black">{pendingCount}</div>
                        <div className="text-xs uppercase tracking-wider">Pending</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Overall Project Progress</span>
                        <span className="text-emerald-500 font-black">{overallProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${overallProgressPercent}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSprintProjectFilter(assignedProjects[0]?.name || 'All Assigned Projects');
                      setActiveTab('tasks');
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 mt-4"
                  >
                    <Kanban className="w-4 h-4" />
                    <span>View Sprint Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* RECOMMENDED MARKETPLACE JOBS SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    RECOMMENDED MARKETPLACE JOBS
                  </h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs font-extrabold text-[#2563eb] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Browse All Jobs Feed</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {jobs.length === 0 ? (
                    <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800 text-slate-400' : 'bg-white border-slate-200/90 text-slate-500'}`}>
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-bold text-sm">No open marketplace jobs available at this moment.</p>
                    </div>
                  ) : (
                    jobs.slice(0, 3).map(job => (
                      <div 
                        key={job.id} 
                      className={`p-4.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
                          <h4 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {job.title}
                          </h4>
                          <span className="bg-blue-50 text-[#2563eb] font-extrabold text-xs px-2.5 py-0.5 rounded-lg border border-blue-200">
                            {job.budget}
                          </span>
                        </div>

                        <div className={`flex flex-wrap items-center gap-3 text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{job.client || 'Client Organization'}</span>
                          <span>•</span>
                          <span>{job.posted || 'Aug 11, 2026'}</span>
                          <span>•</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : []).slice(0, 4).map((s, i) => (
                              <span key={i} className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-200/80'}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => { setSelectedJob(job); setShowBidModal(true); }}
                        className="px-4.5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-center flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Proposal / Bid</span>
                      </button>
                    </div>
                  )))}
                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB: FREELANCER EARNINGS & WALLET DASHBOARD */}
        {activeTab === 'earnings' && (() => {
          return (
            <FreelancerEarningsView
              userSession={userSession}
              contracts={freelancerDbContracts || []}
              apiFinancials={freelancerFinancials}
              onFinancialsChange={loadFreelancerFinancials}
              isDark={isDark}
              showToast={(msg, type) => setToast({ message: msg, type })}
            />
          );
        })()}

        {/* TAB: FREELANCER CONTRACTS & AGREEMENTS */}
        {activeTab === 'contracts' && (() => {
          const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || '').toLowerCase().trim();
          const currentFlName = (userSession?.name || '').toLowerCase().trim();

          const allContracts = (freelancerDbContracts || []).filter(c => {
            const fName = (c.freelancerName || c.freelancer || c.freelancerId || c.freelancer_id || '').toLowerCase().trim();
            if (!fName) return false;
            return (currentFlId && (fName === currentFlId || fName.includes(currentFlId) || currentFlId.includes(fName))) ||
                   (currentFlName && (fName === currentFlName || fName.includes(currentFlName) || currentFlName.includes(fName)));
          });

          const filteredContracts = allContracts.filter(c => {
            const matchesTab = contractTabFilter === 'All' ? true : (c.status || '').toLowerCase() === contractTabFilter.toLowerCase();
            const q = contractSearchQuery.toLowerCase();
            const matchesSearch = !q || (c.projectName || c.project || '').toLowerCase().includes(q) || (c.clientName || c.client || '').toLowerCase().includes(q) || (c.contractId || c.id || '').toLowerCase().includes(q);
            return matchesTab && matchesSearch;
          });

          const totalCount = allContracts.length;
          const activeCount = allContracts.filter(c => c.status === 'Active').length;
          const pendingCount = allContracts.filter(c => c.status === 'Pending').length;
          const completedCount = allContracts.filter(c => c.status === 'Completed').length;
          const totalContractValue = allContracts.reduce((sum, c) => {
            const amt = parseInt((c.amount || c.agreedAmount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
            return sum + amt;
          }, 0);

          return (
            <div className="p-8 space-y-6">
              {/* HEADER AREA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <span>My Contracts & Agreements</span>
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    View and manage all your project contracts, agreements, and milestone terms.
                  </p>
                </div>
                <div className="bg-blue-50 text-[#2563eb] border border-blue-200 px-4 py-2 rounded-full text-xs font-extrabold flex items-center space-x-2 shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
                  <span>All contracts are legally binding and protected.</span>
                </div>
              </div>

              {/* TOP 5 STAT SUMMARY CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. TOTAL CONTRACTS */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">TOTAL CONTRACTS</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">All time</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100">
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 2. ACTIVE CONTRACTS */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">ACTIVE CONTRACTS</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Ongoing projects</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckSquare className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 3. PENDING APPROVAL */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">PENDING APPROVAL</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Awaiting your action</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 4. COMPLETED CONTRACTS */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">COMPLETED CONTRACTS</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{completedCount}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Successfully finished</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* 5. TOTAL CONTRACT VALUE */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">TOTAL CONTRACT VALUE</span>
                    <h3 className="text-2xl font-black text-[#2563eb] mt-1">{totalContractValue > 0 ? `₹${totalContractValue.toLocaleString('en-IN')}` : '₹0'}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Across all contracts</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100">
                    <Wallet className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* FILTER TABS & SEARCH BAR */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center space-x-1 overflow-x-auto">
                  {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setContractTabFilter(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        contractTabFilter === tab
                          ? 'bg-blue-50 text-[#2563eb] border border-blue-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tab === 'All' ? 'All Contracts' : tab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search contracts..."
                      value={contractSearchQuery}
                      onChange={(e) => setContractSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 w-full sm:w-56"
                    />
                  </div>
                  <button className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 flex items-center space-x-1.5 cursor-pointer">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* CONTRACTS CARDS LIST */}
              <div className="space-y-4">
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((c) => {
                    const status = c.status || 'Active';
                    const isCompleted = status === 'Completed';
                    const isPending = status === 'Pending';
                    const progress = c.milestoneProgress ?? (isCompleted ? 100 : isPending ? 0 : 50);

                    return (
                      <div
                        key={c.id || c.contractId}
                        className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        {/* Left: Badge & Contract Metadata */}
                        <div className="flex items-start space-x-4 max-w-xl">
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className={`p-3 rounded-2xl ${
                              isCompleted ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                              isPending ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-blue-50 text-[#2563eb] border border-blue-200'
                            }`}>
                              <FileText className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isCompleted ? 'bg-purple-100 text-purple-700' :
                              isPending ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                              {c.projectName || c.project || 'AI System Project'}
                            </h4>
                            <p className="text-xs font-bold text-slate-600">
                              Client: <span className="text-slate-900 font-extrabold">{c.clientName || c.client || 'Enterprise Client'}</span>
                            </p>
                            <p className="text-xs text-slate-700 font-semibold pt-0.5">
                              Start Date: <strong className="text-slate-900">{c.startDate || 'Aug 11, 2026'}</strong>
                              <span className="mx-1 text-slate-400">•</span>
                              Deadline: <strong className="text-slate-900">{c.deadline || 'Aug 30, 2026'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Middle: Contract Value & Milestones Progress */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block mb-0.5">CONTRACT VALUE</span>
                            <span className="text-lg font-black text-slate-900">{String(c.amount || c.agreedAmount || '₹1,50,000').replace(/\$/g, '₹')}</span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                              <span>MILESTONES</span>
                              <span className="text-slate-700 font-black">{c.milestonesDone ?? (isCompleted ? 3 : isPending ? 0 : 2)} / {c.milestonesTotal ?? (isCompleted ? 3 : isPending ? 3 : 4)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-slate-700">{progress}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions (Download PDF & View Details) */}
                        <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-center">
                          <button
                            onClick={() => handleDownloadContractPDF(c)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-xs font-extrabold cursor-pointer flex items-center space-x-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Download PDF</span>
                          </button>

                          <button
                            onClick={() => setSelectedContractDetail(c)}
                            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-extrabold cursor-pointer flex items-center space-x-1.5 transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>View Details</span>
                          </button>

                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 bg-white space-y-3">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="font-extrabold text-base text-slate-900">No Contracts Found</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Contracts assigned by clients will automatically appear here once accepted.
                    </p>
                  </div>
                )}
              </div>

              {/* BOTTOM INFORMATIONAL SHIELD BANNER */}
              <div className="p-4.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center space-x-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#2563eb] shrink-0" />
                <div>
                  <strong className="font-bold text-slate-900">Secure & Legally Protected</strong>
                  <span className="text-slate-600 font-medium ml-2">
                    All contracts are digitally signed, legally binding, and encrypted for your protection. You can download and keep a copy for your records.
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB: MESSAGES CHAT WORKSPACE */}
        {activeTab === 'messages' && (
          <div className="p-8">
            <MessagingCenter
              userSession={userSession}
              role="freelancer"
              isDark={isDark}
              onNavigateToProject={() => setActiveTab('jobs')}
              onNavigateToContract={() => setActiveTab('tasks')}
            />
          </div>
        )}

        {/* TAB: NOTIFICATIONS CENTER */}
        {activeTab === 'notifications' && (
          <div className="p-8">
            <NotificationCenter userSession={userSession} onNavigateTab={setActiveTab} />
          </div>
        )}

        {/* TAB: FREELANCER ACCOUNT & SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <FreelancerSettingsView
            userSession={userSession}
            currentUserId={userSession?.username || userSession?.user_id || userSession?.email || ''}
            currentUserName={userSession?.name || userSession?.username || 'Freelancer'}
            isDark={isDark}
            onNavigateTab={setActiveTab}
            showToastMessage={(msg, type) => setToast({ message: msg, type })}
          />
        )}

        {/* MODAL: SUBMIT BID */}
        {showBidModal && selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`p-6 rounded-3xl max-w-lg w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h3 className="text-xl font-bold mb-2">Submit Proposal for {selectedJob.title}</h3>
              <p className="text-xs text-blue-500 font-bold mb-4">Client: {selectedJob.client} • Budget: {selectedJob.budget}</p>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Your Bid Amount (₹ INR)</label>
                  <input type="number" required value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full p-3 border rounded-xl text-xs bg-transparent" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Estimated Delivery Time</label>
                  <input type="text" required value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full p-3 border rounded-xl text-xs bg-transparent" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Cover Letter & Proposal</label>
                  <textarea rows="4" required value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Explain why your experience matches this project..." className="w-full p-3 border rounded-xl text-xs bg-transparent"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowBidModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Bid Now</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONTRACT DETAILS MODAL */}
        {selectedContractDetail && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl max-w-xl w-full bg-white border border-slate-200 text-slate-900 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-200">
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedContractDetail.projectName || selectedContractDetail.project}</h3>
                    <p className="text-xs font-bold text-blue-600">Contract ID: {selectedContractDetail.contractId || selectedContractDetail.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContractDetail(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-700">CLIENT</span>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedContractDetail.clientName || selectedContractDetail.client || 'Enterprise Client'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-700">CONTRACT VALUE (₹)</span>
                  <p className="font-extrabold text-[#2563eb] text-sm">{selectedContractDetail.amount || selectedContractDetail.agreedAmount || '₹1,50,000'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-700">START DATE</span>
                  <p className="font-extrabold text-slate-900">{selectedContractDetail.startDate || 'Aug 11, 2026'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-700">ESCROW STATUS</span>
                  <p className="font-extrabold text-emerald-600">Funded & Protected</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Agreed Milestone Breakdown</h4>
                <div className="space-y-2">
                  {(selectedContractDetail.milestones && selectedContractDetail.milestones.length > 0) ? (
                    selectedContractDetail.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 text-sm">
                            {m.title || `Phase ${idx + 1}: Milestone Task`}
                          </h5>
                          {m.description && (
                            <p className="text-xs text-slate-700 font-medium">{m.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-600 text-sm block">{m.amount || '₹750'}</span>
                          <span className={`text-[10px] font-extrabold uppercase ${
                            (m.status || '').toLowerCase() === 'approved' || (m.status || '').toLowerCase() === 'completed'
                              ? 'text-emerald-600'
                              : (m.status || '').toLowerCase() === 'in progress'
                              ? 'text-blue-600'
                              : 'text-slate-600 font-bold'
                          }`}>
                            {m.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <h5 className="font-extrabold text-slate-900 text-sm">Phase 1: Project Deliverable</h5>
                        <p className="text-xs text-slate-700 font-medium">Core deliverable under active contract agreement</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-emerald-600 text-sm block">{selectedContractDetail.agreedAmount || selectedContractDetail.amount || '₹0'}</span>
                        <span className="text-[10px] font-extrabold uppercase text-blue-600">Active</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownloadContractPDF(selectedContractDetail)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Contract PDF</span>
                </button>
                <button
                  onClick={() => setSelectedContractDetail(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: LOGOUT CONFIRMATION */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto font-bold">
                <LogOut className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Are you sure you want to logout?</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">You will be redirected back to the FreeMatch AI login screen.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLogoutConfirm(false); if (onSignOut) onSignOut(); }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default FreelancerDashboard;
