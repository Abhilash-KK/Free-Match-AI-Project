import React, { useState } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';
import NotificationCenter from '../NotificationCenter';
import MessagingCenter from '../MessagingCenter';
import FreelancerProfileView from '../FreelancerProfileView';
import FreelancerSettingsView from '../FreelancerSettingsView';
import ClientReviewsView from '../ClientReviewsView';
import FreelancerEarningsView from '../FreelancerEarningsView';
import { fetchNotifications, createNotification } from '../../utils/notificationService';
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
  AlertTriangle,
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
  const [messagesCount, setMessagesCount] = useState(2);

  // Proposal Form State
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('4500');
  const [deliveryTime, setDeliveryTime] = useState('2 Weeks');

  // Freelancer Personal Kanban Task Board
  const [myTasks] = useState([
    { id: 't1', title: 'Implement Django JWT Auth API', project: 'AI Pipeline Optimization', status: 'In Progress', due: 'In 2 days' },
    { id: 't2', title: 'Design Figma Component Library', project: 'E-commerce UI Redesign', status: 'To Do', due: 'In 4 days' },
    { id: 't3', title: 'Setup PostgreSQL Database Schema', project: 'AI Pipeline Optimization', status: 'Completed', due: 'Done' }
  ]);

  // Submitted Proposals List (Synced with Client Inbox)
  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_proposals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'pr1', project: 'AI Pipeline Optimization', projectTitle: 'AI Pipeline Optimization', client: 'TechStream Corp', bid: '₹11,500', bidAmount: '₹11,500', delivery: '2 Weeks', status: 'Accepted', date: 'Oct 24, 2023' },
      { id: 'pr2', project: 'E-commerce UI Redesign', projectTitle: 'E-commerce UI Redesign', client: 'MetaVibe Solutions', bid: '₹5,000', bidAmount: '₹5,000', delivery: '3 Weeks', status: 'Shortlisted', date: 'Oct 26, 2023' }
    ];
  });

  // Sync Available Jobs & Submitted Proposals with LocalStorage
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p, idx) => ({
            id: p.id || `job_${idx}`,
            title: p.title || 'AI Project',
            client: p.clientName || p.client || 'Enterprise Client',
            budget: p.budget || '₹4,500',
            description: p.description || 'AI model fine-tuning and API integration.',
            skills: p.requiredSkills || p.skills || ['Python', 'PyTorch', 'Django'],
            posted: p.postedDate || 'Just now',
            attachedFile: p.attachedFile || null,
            abstract: p.abstract || null
          }));
        }
      } catch (e) {}
    }
    return [
      {
        id: 'job_1',
        title: 'PyTorch Deep Learning Inference Server & TensorRT Optimization',
        client: 'Apex AI Labs',
        budget: '₹8,500',
        description: 'Construct a high-throughput deep learning model inference server using PyTorch, FastAPI, and TensorRT bindings.',
        skills: ['PyTorch', 'FastAPI', 'TensorRT', 'CUDA', 'Python'],
        posted: '2 hours ago',
        attachedFile: { name: 'PyTorch_Architecture_Spec.png', size: '2.4 MB', isImage: true, url: '#' },
        abstract: 'https://github.com/apex-ai-labs/pytorch-inference-server-spec\nArchitecture diagram shows 4x GPU worker nodes behind NGINX load balancer.'
      },
      {
        id: 'job_2',
        title: 'React & Tailwind Real-Time Analytics Dashboard with D3.js',
        client: 'DataPulse Systems',
        budget: '₹5,200',
        description: 'Build a dark-mode real-time telemetry dashboard in React with WebSocket streaming graphs.',
        skills: ['React.js', 'Tailwind CSS', 'D3.js', 'WebSockets', 'TypeScript'],
        posted: '5 hours ago',
        attachedFile: { name: 'Dashboard_Design_System_Doc.pdf', size: '4.1 MB', isImage: false, url: '#' }
      }
    ];
  });

  const [notifications, setNotifications] = useState([]);
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

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
            setJobs(parsed.map((p, idx) => ({
              id: p.id || `job_${idx}`,
              title: p.title || 'AI Project',
              client: p.clientName || p.client || 'Enterprise Client',
              budget: p.budget || '₹4,500',
              description: p.description || 'AI model fine-tuning and API integration.',
              skills: p.requiredSkills || p.skills || ['Python', 'PyTorch', 'Django'],
              posted: p.postedDate || 'Just now',
              attachedFile: p.attachedFile || null,
              abstract: p.abstract || null
            })));
          }
        } catch (e) {}
      }
    };

    const loadBackendNotifs = async () => {
      if (userSession?.username || userSession?.user_id) {
        const notifs = await fetchNotifications(userSession?.username || userSession?.user_id);
        if (notifs) setNotifications(notifs);
      }
    };

    handleSync();
    loadBackendNotifs();

    const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || 'alexmercer').toLowerCase().trim();
    const loadFreelancerContracts = () => {
      fetch(`http://localhost:8000/api/contracts/?user_id=${encodeURIComponent(currentFlId)}`)
        .then(res => res.json())
        .then(apiContracts => {
          if (Array.isArray(apiContracts)) {
            setFreelancerDbContracts(apiContracts);
          }
        })
        .catch(() => {});
    };

    const loadMessagesCount = () => {
      fetch(`http://localhost:8000/api/messages/?user_id=${encodeURIComponent(currentFlId)}`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.conversations)) {
            setMessagesCount(data.conversations.length);
          }
        })
        .catch(() => {});
    };

    handleSync();
    loadBackendNotifs();
    loadFreelancerContracts();
    loadMessagesCount();

    window.addEventListener('storage', handleSync);
    window.addEventListener('freematch_shared_event', handleSync);
    window.addEventListener('freematch_shared_event', loadFreelancerContracts);
    window.addEventListener('freematch_shared_event', loadMessagesCount);
    window.addEventListener('freematch_notification_event', loadBackendNotifs);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('freematch_shared_event', handleSync);
      window.removeEventListener('freematch_shared_event', loadFreelancerContracts);
      window.removeEventListener('freematch_notification_event', loadBackendNotifs);
    };
  }, [userSession]);

  const handleDownloadContractPDF = (contract) => {
    const cId = contract.contractId || contract.id || 'CTR-9024';
    const cProject = contract.projectName || contract.project || 'AI System Architecture';
    const cClient = contract.clientName || contract.client || 'Enterprise Client';
    const cFreelancer = contract.freelancerName || contract.freelancer || userSession?.name || 'Alex Mercer';
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

  const handleSubmitBid = (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const flName = userSession?.name || userSession?.user_id || 'Alex Mercer';
    const newProposal = {
      id: `pr_${Date.now()}`,
      projectId: selectedJob.id,
      projectTitle: selectedJob.title,
      clientName: selectedJob.client,
      client: selectedJob.client,
      freelancerName: flName,
      freelancerRole: 'Senior React, PyTorch & Django Architect',
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
    setProposals(updatedProposals);

    createNotification(
      'techstream_client',
      'proposal',
      `New Proposal Received from ${flName}`,
      `${flName} submitted a bid of ₹${bidAmount} for project "${selectedJob.title}".`
    );

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

  const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || userSession?.name || '').toLowerCase().trim();

  const myProposalsCount = (() => {
    const defaultProposalsList = [
      { id: 'pr1', project: 'AI Pipeline Optimization', projectTitle: 'AI Pipeline Optimization', client: 'Abhilash K K', bid: '₹2,25,000', bidAmount: '₹2,25,000', delivery: '2 Weeks', status: 'Accepted', date: 'Aug 10, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' },
      { id: 'pr2', project: 'AI Automated Test Pipeline', projectTitle: 'AI Automated Test Pipeline', client: 'Abhilash K K', bid: '₹1,50,000', bidAmount: '₹1,50,000', delivery: '3 Weeks', status: 'Accepted', date: 'Aug 11, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' },
      { id: 'pr3', project: 'Cybersecurity Audit & Shield', projectTitle: 'Cybersecurity Audit & Shield', client: 'MetaVibe Solutions', bid: '₹5,000', bidAmount: '₹5,000', delivery: '3 Weeks', status: 'Submitted / Under Review', date: 'Aug 14, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' }
    ];

    const allProps = [...(proposals || [])];
    defaultProposalsList.forEach(dp => {
      if (!allProps.some(p => (p.project || p.projectTitle || '').toLowerCase().trim() === dp.project.toLowerCase().trim())) {
        allProps.push(dp);
      }
    });

    return allProps.filter(pr => {
      const f = (pr.freelancer || pr.freelancerName || pr.user_id || '').toLowerCase().trim();
      if (!f) return true;
      return f.includes(currentFlId) || currentFlId.includes(f) ||
        (currentFlId.includes('alex') && f.includes('alex')) ||
        (currentFlId.includes('sarah') && f.includes('sarah')) ||
        (currentFlId.includes('haines') && f.includes('haines'));
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
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600 dark:text-slate-300">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search available jobs, required skills, or clients..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
            />
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
                  <p className="text-sm font-black text-slate-900">{userSession?.name || userSession?.user_id || 'Haines'}</p>
                  <p className="text-xs text-[#2563eb] font-extrabold tracking-wider uppercase">SENIOR PYTORCH ARCHITECT</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-xs shadow-md shrink-0 overflow-hidden">
                  {(() => {
                    const uid = (userSession?.user_id || userSession?.username || userSession?.name || '').toLowerCase();
                    let avatarUrl = userSession?.avatar_url || '';
                    if (!avatarUrl && uid) {
                      try {
                        const cached = JSON.parse(localStorage.getItem(`freematch_profile_${uid}`) || '{}');
                        avatarUrl = cached.avatar_url || '';
                      } catch (e) {}
                    }
                    const name = userSession?.name || userSession?.user_id || 'Freelancer';
                    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FL';
                    return avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>{initials}</span>
                    );
                  })()}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900">{userSession?.name || 'Alex Mercer'}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{userSession?.email || 'alex.mercer@freematch.ai'}</p>
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
          const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || '').toLowerCase().trim();
          const flDisplayName = userSession?.name || userSession?.user_id || userSession?.username || (
            currentFlId.includes('haines') ? 'Haines JP' :
            currentFlId.includes('sarah') ? 'Sarah Chen' : 'Alex Mercer'
          );
          return (
            <div className="p-8">
              <KanbanBoard 
                role="freelancer" 
                currentUserName={flDisplayName} 
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
              {jobs.map(job => (
                <div key={job.id} className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base">{job.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{job.client} • {job.posted || job.postedDate}</p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-400 font-extrabold text-xs px-3 py-1 rounded-xl">{job.budget}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

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
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUBMITTED BIDS / PROPOSALS */}
        {activeTab === 'proposals' && (() => {
          const currentFlId = (userSession?.user_id || userSession?.email || userSession?.name || 'alexmercer').toLowerCase().trim();
          const isDemo = ['user1', 'alex', 'mercer', 'haines', 'abhilash', 'john'].some(d => currentFlId.includes(d));

          // Default accepted & pending proposals for demo account fallback
          const defaultProposalsList = [
            { id: 'pr1', project: 'AI Pipeline Optimization', projectTitle: 'AI Pipeline Optimization', client: 'Abhilash K K', bid: '₹2,25,000', bidAmount: '₹2,25,000', delivery: '2 Weeks', status: 'Accepted', date: 'Aug 10, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' },
            { id: 'pr2', project: 'AI Automated Test Pipeline', projectTitle: 'AI Automated Test Pipeline', client: 'Abhilash K K', bid: '₹1,50,000', bidAmount: '₹1,50,000', delivery: '3 Weeks', status: 'Accepted', date: 'Aug 11, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' },
            { id: 'pr3', project: 'Cybersecurity Audit & Shield', projectTitle: 'Cybersecurity Audit & Shield', client: 'MetaVibe Solutions', bid: '₹5,000', bidAmount: '₹5,000', delivery: '3 Weeks', status: 'Submitted / Under Review', date: 'Aug 14, 2026', freelancer: 'Alex Mercer', freelancerName: 'Alex Mercer' }
          ];

          const allProposals = [...proposals];
          defaultProposalsList.forEach(dp => {
            if (!allProposals.some(p => (p.project || p.projectTitle || '').toLowerCase().trim() === dp.project.toLowerCase().trim())) {
              allProposals.push(dp);
            }
          });

          const myProposals = allProposals.filter(pr => {
            const f = (pr.freelancer || pr.freelancerName || pr.user_id || '').toLowerCase().trim();
            if (!f) return true;
            return f.includes(currentFlId) || currentFlId.includes(f) ||
              (currentFlId.includes('alex') && f.includes('alex')) ||
              (currentFlId.includes('sarah') && f.includes('sarah')) ||
              (currentFlId.includes('haines') && f.includes('haines'));
          });

          // Account-level fallback contract list for demo users
          let defaultFreelancerContractsList = [];
          if (currentFlId.includes('alex')) {
            defaultFreelancerContractsList = [
              { projectName: 'AI Pipeline Optimization', project: 'AI Pipeline Optimization', freelancerName: 'Alex Mercer' },
              { projectName: 'AI Automated Test Pipeline', project: 'AI Automated Test Pipeline', freelancerName: 'Alex Mercer' }
            ];
          } else if (currentFlId.includes('sarah')) {
            defaultFreelancerContractsList = [
              { projectName: 'FinTech Dashboard v2', project: 'FinTech Dashboard v2', freelancerName: 'Sarah Chen' },
              { projectName: 'AI Medical Imaging Diagnostic Suite', project: 'AI Medical Imaging Diagnostic Suite', freelancerName: 'Sarah Chen' }
            ];
          } else if (currentFlId.includes('haines')) {
            defaultFreelancerContractsList = [
              { projectName: 'NextGen Autonomous Trading Engine', project: 'NextGen Autonomous Trading Engine', freelancerName: 'Haines Jose Paulson' },
              { projectName: 'Autonomous Supply Chain Freight Router', project: 'Autonomous Supply Chain Freight Router', freelancerName: 'Haines Jose Paulson' }
            ];
          }

          const combinedContractsList = [...(freelancerDbContracts || [])];
          defaultFreelancerContractsList.forEach(dc => {
            const dcTitle = (dc.projectName || dc.project || '').toLowerCase().trim();
            if (!combinedContractsList.some(c => (c.projectName || c.project || '').toLowerCase().trim() === dcTitle)) {
              combinedContractsList.push(dc);
            }
          });

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
                      const cFl = (c.freelancerName || c.freelancer || c.freelancerId || '').toLowerCase().trim();
                      const isProjMatch = cProj && prTitle && (cProj === prTitle || cProj.includes(prTitle) || prTitle.includes(cProj));
                      const isFlMatch = cFl && (cFl.includes(currentFlId) || currentFlId.includes(cFl) ||
                        (currentFlId.includes('alex') && cFl.includes('alex')) ||
                        (currentFlId.includes('sarah') && cFl.includes('sarah')) ||
                        (currentFlId.includes('haines') && cFl.includes('haines')));
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
          const currentFlName = userSession?.name || userSession?.user_id || 'Alex Mercer';
          const myProfileData = {
            name: currentFlName,
            user_id: userSession?.user_id || userSession?.username || 'alexmercer'
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
        {activeTab === 'profile' && (() => {
          const currentFlId = (userSession?.user_id || userSession?.username || userSession?.email || 'alexmercer').toLowerCase().trim();
          const currentFlName = userSession?.name || userSession?.user_id || userSession?.username || 'Alex Mercer';
          
          let myProfileData = {
            name: currentFlName,
            user_id: userSession?.user_id || userSession?.username || 'freelancer',
            title: 'Senior Full Stack & AI Specialist',
            headline: 'Senior Full Stack & AI Specialist',
            location: 'San Francisco, CA',
            hourlyRate: '₹4,000 / hr',
            availabilityStatus: 'Available for Work',
            availableHours: '40 hrs/week',
            yearsExperience: '5+',
            projectsCompleted: '12',
            jobSuccessRate: '100%',
            onTimeDelivery: '98%',
            lifetimeEarnings: '₹1,50,000',
            bio: 'Senior Full Stack & Artificial Intelligence Engineer specializing in robust REST APIs, deep learning models, and real-time React applications.',
            skills: ['React.js', 'Python', 'Django', 'PostgreSQL', 'Tailwind CSS'],
            completenessPercentage: 90
          };

          if (currentFlId.includes('alex')) {
            myProfileData = {
              name: 'Alex Mercer',
              user_id: 'alexmercer',
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
          } else if (currentFlId.includes('sarah')) {
            myProfileData = {
              name: 'Sarah Chen',
              user_id: 'sarahchen',
              title: 'Senior Data Scientist & Frontend Lead',
              headline: 'Senior Data Scientist & Frontend Lead',
              location: 'Seattle, WA',
              hourlyRate: '₹3,800 / hr',
              availabilityStatus: 'Available for Work',
              availableHours: '35 hrs/week',
              yearsExperience: '6+',
              projectsCompleted: '18',
              jobSuccessRate: '100%',
              onTimeDelivery: '100%',
              lifetimeEarnings: '₹3,00,000',
              bio: 'Specialist in DICOM PACS imaging systems, UNet lesion detection pipelines, Neo4j Knowledge Graphs, and high-frequency React D3.js telemetry components.',
              skills: ['React.js', 'D3.js', 'Python', 'Neo4j', 'FastAPI', 'PyTorch', 'DICOM Imaging'],
              completenessPercentage: 90
            };
          } else if (currentFlId.includes('haines')) {
            myProfileData = {
              name: 'Haines Jose Paulson',
              user_id: 'hainesjosepaulson',
              title: 'Senior High-Frequency Trading & Systems Architect',
              headline: 'Senior High-Frequency Trading & Systems Architect',
              location: 'Austin, TX',
              hourlyRate: '₹4,500 / hr',
              availabilityStatus: 'Available for Work',
              availableHours: '40 hrs/week',
              yearsExperience: '8+',
              projectsCompleted: '20',
              jobSuccessRate: '99%',
              onTimeDelivery: '97%',
              lifetimeEarnings: '₹3,45,000',
              bio: 'High-frequency trading engine developer specializing in low-latency Rust order execution cores, OR-Tools vehicle routing optimization, and WebSocket telemetry.',
              skills: ['Rust', 'Python', 'C++', 'Google OR-Tools', 'WebSockets', 'React.js', 'PostgreSQL'],
              completenessPercentage: 92
            };
          }

          return (
            <FreelancerProfileView
              userSession={userSession}
              initialFreelancerData={myProfileData}
              reviews={reviews}
              viewMode="freelancer"
              isDark={isDark}
              showToast={(msg, type = 'info') => setToast({ message: msg, type })}
            />
          );
        })()}

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
            const currentFlId = (userSession?.user_id || userSession?.email || userSession?.name || '').toLowerCase().trim();
            const isDemo = ['user1', 'alex', 'mercer', 'haines', 'abhilash', 'john'].some(d => currentFlId.includes(d));

            let kanbanTasks = [];
            try {
              const savedTasks = localStorage.getItem(`freematch_user_${currentFlId}_tasks`) || localStorage.getItem('freematch_kanban_tasks');
              if (savedTasks) kanbanTasks = JSON.parse(savedTasks);
            } catch (e) {}

            if ((!Array.isArray(kanbanTasks) || kanbanTasks.length === 0) && isDemo) {
              kanbanTasks = [
                { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', project: 'AI Automated Test Pipeline', client: 'Haines JP', deadline: 'Aug 30, 2026' },
                { id: 't2', title: 'Design D3.js Financial Chart Widgets', status: 'In Progress', assignee: 'Alex Mercer', project: 'AI Automated Test Pipeline', client: 'Haines JP', deadline: 'Aug 30, 2026' },
                { id: 't3', title: 'Restructure REST API Inference Endpoints', status: 'Under Review', assignee: 'Alex Mercer', project: 'AI Pipeline Optimization', client: 'Haines JP', deadline: 'Aug 30, 2026' },
                { id: 't4', title: 'OWASP Security Audit & Vulnerability Report', status: 'Done', assignee: 'Alex Mercer', project: 'AI Pipeline Optimization', client: 'Haines JP', deadline: 'Aug 30, 2026' },
                { id: 't5', title: 'Implement JWT Refresh Middleware', status: 'In Progress', assignee: 'Alex Mercer', project: 'AI Pipeline Optimization', client: 'Haines JP', deadline: 'Aug 30, 2026' }
              ];
            } else if (!Array.isArray(kanbanTasks)) {
              kanbanTasks = [];
            }

            const myTasks = isDemo ? kanbanTasks : kanbanTasks.filter(t => {
              const a = (t.assignee || '').toLowerCase();
              return a && (a.includes(currentFlId) || currentFlId.includes(a));
            });

            const projectMap = {};
            myTasks.forEach(t => {
              const projName = t.project || t.projectTitle || 'AI Project';
              if (!projectMap[projName]) {
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
              projectMap[projName].total += 1;
              if (t.status === 'Done' || t.status === 'Completed') projectMap[projName].done += 1;
              else if (t.status === 'Under Review') projectMap[projName].underReview += 1;
              else if (t.status === 'In Progress') projectMap[projName].inProgress += 1;
              else projectMap[projName].pending += 1;
            });

            let projList = Object.values(projectMap).map(p => {
              const weightedScore = (p.done * 100) + (p.underReview * 60) + (p.inProgress * 30);
              return {
                ...p,
                progress: p.total > 0 ? Math.round(weightedScore / p.total) : 0
              };
            });

            if (projList.length === 0 && isDemo) {
              projList = [
                { name: 'AI Automated Test Pipeline', client: 'Haines JP', deadline: 'Aug 30, 2026', progress: 10, total: 3, done: 0, inProgress: 1, pending: 2 },
                { name: 'AI Pipeline Optimization', client: 'Haines JP', deadline: 'Aug 30, 2026', progress: 65, total: 4, done: 2, inProgress: 1, pending: 1 }
              ];
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
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.includes('reviews') || k.includes('freematch'))) {
                  try {
                    const parsed = JSON.parse(localStorage.getItem(k));
                    if (Array.isArray(parsed)) allRevs.push(...parsed);
                  } catch (e) {}
                }
              }
              const flName = (userSession?.name || userSession?.user_id || '').toLowerCase().trim();
              if (flName) {
                const matched = allRevs.filter(r => r && r.reviewee && String(r.reviewee).toLowerCase().includes(flName.split(' ')[0]));
                if (matched.length > 0) {
                  const avg = matched.reduce((a, b) => a + Number(b.rating || 5), 0) / matched.length;
                  calculatedRatingStr = `${avg.toFixed(1)} / 5.0`;
                }
              }
            } catch (e) {}

            return {
              assignedProjects: projList,
              totalTasksCount: tot,
              doneTasksCount: dn,
              inProgressCount: inp,
              pendingCount: pnd >= 0 ? pnd : 0,
              overallProgressPercent: overallPct,
              walletBalanceStr: isDemo ? '₹3,450' : '₹0.00',
              lifetimeEarningsStr: isDemo ? '₹2,89,000' : '₹0.00',
              activeContractsStr: isDemo ? '2' : '0',
              clientRatingStr: calculatedRatingStr,
              completedProjectsCount: isDemo ? '24' : '0'
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
                              onClick={() => setActiveTab('tasks')}
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
                    onClick={() => setActiveTab('tasks')}
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
                  {jobs.slice(0, 3).map(job => (
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
                          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{job.client || 'Abhilash K K'}</span>
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
                  ))}
                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB: FREELANCER EARNINGS & WALLET DASHBOARD */}
        {activeTab === 'earnings' && (() => {
          const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || '').toLowerCase().trim();
          const currentFlName = userSession?.name || userSession?.user_id || 'Freelancer';

          let defaultContracts = [];
          if (currentFlId.includes('alex') || currentFlName.toLowerCase().includes('alex')) {
            defaultContracts = [
              { id: 'CTR-9024', contractId: 'CTR-9024', projectName: 'AI Pipeline Optimization', project: 'AI Pipeline Optimization', clientName: 'Abhilash K K', freelancerName: 'Alex Mercer', amount: '₹2,25,000', agreedAmount: '₹2,25,000', status: 'Active', milestonesDone: 0, milestonesTotal: 4, startDate: 'Aug 10, 2026' },
              { id: 'CTR-9438', contractId: 'CTR-9438', projectName: 'AI Automated Test Pipeline', project: 'AI Automated Test Pipeline', clientName: 'Abhilash K K', freelancerName: 'Alex Mercer', amount: '₹1,50,000', agreedAmount: '₹1,50,000', status: 'Active', milestonesDone: 0, milestonesTotal: 3, startDate: 'Aug 11, 2026' }
            ];
          } else if (currentFlId.includes('sarah') || currentFlName.toLowerCase().includes('sarah')) {
            defaultContracts = [
              { id: 'CTR-8812', contractId: 'CTR-8812', projectName: 'FinTech Dashboard v2', project: 'FinTech Dashboard v2', clientName: 'Abhilash K K', freelancerName: 'Sarah Chen', amount: '₹1,20,000', agreedAmount: '₹1,20,000', status: 'Completed', milestonesDone: 3, milestonesTotal: 3, startDate: 'Aug 08, 2026' },
              { id: 'CNT-8901', contractId: 'CNT-8901', projectName: 'AI Medical Imaging Diagnostic Suite', project: 'AI Medical Imaging Diagnostic Suite', clientName: 'Abhilash K K', freelancerName: 'Sarah Chen', amount: '₹1,80,000', agreedAmount: '₹1,80,000', status: 'Active', milestonesDone: 2, milestonesTotal: 3, startDate: 'Aug 12, 2026' }
            ];
          } else if (currentFlId.includes('haines') || currentFlName.toLowerCase().includes('haines')) {
            defaultContracts = [
              { id: 'CNT-8902', contractId: 'CNT-8902', projectName: 'Autonomous Supply Chain Freight Router', project: 'Autonomous Supply Chain Freight Router', clientName: 'Abhilash K K', freelancerName: 'Haines Jose Paulson', amount: '₹12,000', agreedAmount: '₹12,000', status: 'Active', milestonesDone: 1, milestonesTotal: 4, startDate: 'Aug 03, 2026' },
              { id: 'CTR-9918', contractId: 'CTR-9918', projectName: 'AI Medical Imaging Diagnostic Suite', project: 'AI Medical Imaging Diagnostic Suite', clientName: 'Abhilash K K', freelancerName: 'Haines jp', amount: '₹4,500', agreedAmount: '₹4,500', status: 'Active', milestonesDone: 1, milestonesTotal: 3, startDate: 'Aug 10, 2026' },
              { id: 'CTR-9176', contractId: 'CTR-9176', projectName: 'NextGen Autonomous Trading Engine', project: 'NextGen Autonomous Trading Engine', clientName: 'Abhilash K K', freelancerName: 'Haines Jose Paulson', amount: '₹22,500', agreedAmount: '₹22,500', status: 'Active', milestonesDone: 1, milestonesTotal: 3, startDate: 'Aug 10, 2026' }
            ];
          }

          const combinedList = [...(freelancerDbContracts || [])];
          defaultContracts.forEach(dc => {
            const dcTitle = (dc.projectName || dc.project || '').toLowerCase().trim();
            if (!combinedList.some(c => (c.projectName || c.project || '').toLowerCase().trim() === dcTitle)) {
              combinedList.push(dc);
            }
          });

          return (
            <FreelancerEarningsView
              userSession={userSession}
              contracts={combinedList}
              isDark={isDark}
              showToast={(msg, type) => setToast({ message: msg, type })}
            />
          );
        })()}

        {/* TAB: FREELANCER CONTRACTS & AGREEMENTS */}
        {activeTab === 'contracts' && (() => {
          const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || 'alexmercer').toLowerCase().trim();
          const currentFlName = userSession?.name || userSession?.user_id || 'Alex Mercer';

          // Strict account-level contract mapping for default demo fallback if DB query is pending
          let defaultFreelancerContractsList = [];
          if (currentFlId.includes('alex') || currentFlName.toLowerCase().includes('alex')) {
            defaultFreelancerContractsList = [
              {
                id: 'CTR-9024',
                contractId: 'CTR-9024',
                projectName: 'AI Pipeline Optimization',
                project: 'AI Pipeline Optimization',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Alex Mercer',
                freelancer: 'Alex Mercer',
                startDate: 'Aug 10, 2026',
                deadline: 'Sep 05, 2026',
                amount: '₹2,25,000',
                agreedAmount: '₹2,25,000',
                status: 'Active',
                milestonesDone: 0,
                milestonesTotal: 4,
                milestoneProgress: 0,
                paymentType: 'Fixed Price',
                escrowBalance: '₹2,25,000'
              },
              {
                id: 'CTR-9438',
                contractId: 'CTR-9438',
                projectName: 'AI Automated Test Pipeline',
                project: 'AI Automated Test Pipeline',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Alex Mercer',
                freelancer: 'Alex Mercer',
                startDate: 'Aug 11, 2026',
                deadline: 'Aug 30, 2026',
                amount: '₹1,50,000',
                agreedAmount: '₹1,50,000',
                status: 'Active',
                milestonesDone: 0,
                milestonesTotal: 3,
                milestoneProgress: 0,
                paymentType: 'Fixed Price',
                escrowBalance: '₹1,50,000'
              }
            ];
          } else if (currentFlId.includes('sarah') || currentFlName.toLowerCase().includes('sarah')) {
            defaultFreelancerContractsList = [
              {
                id: 'CTR-8812',
                contractId: 'CTR-8812',
                projectName: 'FinTech Dashboard v2',
                project: 'FinTech Dashboard v2',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Sarah Chen',
                freelancer: 'Sarah Chen',
                startDate: 'Aug 08, 2026',
                deadline: 'Aug 25, 2026',
                amount: '₹1,20,000',
                agreedAmount: '₹1,20,000',
                status: 'Completed',
                milestonesDone: 3,
                milestonesTotal: 3,
                milestoneProgress: 100,
                paymentType: 'Fixed Price',
                escrowBalance: '₹1,20,000'
              },
              {
                id: 'CNT-8901',
                contractId: 'CNT-8901',
                projectName: 'AI Medical Imaging Diagnostic Suite',
                project: 'AI Medical Imaging Diagnostic Suite',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Sarah Chen',
                freelancer: 'Sarah Chen',
                startDate: 'Aug 12, 2026',
                deadline: 'Sep 10, 2026',
                amount: '₹1,80,000',
                agreedAmount: '₹1,80,000',
                status: 'Active',
                milestonesDone: 2,
                milestonesTotal: 3,
                milestoneProgress: 66,
                paymentType: 'Fixed Price',
                escrowBalance: '₹1,80,000'
              }
            ];
          } else if (currentFlId.includes('haines') || currentFlName.toLowerCase().includes('haines')) {
            defaultFreelancerContractsList = [
              {
                id: 'CNT-8902',
                contractId: 'CNT-8902',
                projectName: 'Autonomous Supply Chain Freight Router',
                project: 'Autonomous Supply Chain Freight Router',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Haines Jose Paulson',
                freelancer: 'Haines Jose Paulson',
                startDate: 'Aug 03, 2026',
                deadline: 'Aug 30, 2026',
                amount: '₹12,000',
                agreedAmount: '₹12,000',
                status: 'Active',
                milestonesDone: 1,
                milestonesTotal: 4,
                milestoneProgress: 25,
                paymentType: 'Fixed Price',
                escrowBalance: '₹12,000'
              },
              {
                id: 'CTR-9918',
                contractId: 'CTR-9918',
                projectName: 'AI Medical Imaging Diagnostic Suite',
                project: 'AI Medical Imaging Diagnostic Suite',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Haines jp',
                freelancer: 'Haines jp',
                startDate: 'Aug 10, 2026',
                deadline: 'Sep 01, 2026',
                amount: '₹4,500',
                agreedAmount: '₹4,500',
                status: 'Active',
                milestonesDone: 1,
                milestonesTotal: 3,
                milestoneProgress: 33,
                paymentType: 'Fixed Price',
                escrowBalance: '₹4,500'
              },
              {
                id: 'CTR-9176',
                contractId: 'CTR-9176',
                projectName: 'NextGen Autonomous Trading Engine',
                project: 'NextGen Autonomous Trading Engine',
                clientName: 'Abhilash K K',
                client: 'Abhilash K K',
                freelancerName: 'Haines Jose Paulson',
                freelancer: 'Haines Jose Paulson',
                startDate: 'Aug 10, 2026',
                deadline: 'Sep 20, 2026',
                amount: '₹22,500',
                agreedAmount: '₹22,500',
                status: 'Active',
                milestonesDone: 1,
                milestonesTotal: 3,
                milestoneProgress: 33,
                paymentType: 'Fixed Price',
                escrowBalance: '₹22,500'
              }
            ];
          }

          const baseContracts = freelancerDbContracts.length > 0 ? freelancerDbContracts : defaultFreelancerContractsList;

          const allContracts = baseContracts.filter(c => {
            const fName = (c.freelancerName || c.freelancer || c.freelancerId || '').toLowerCase();
            const flMatch = fName.includes(currentFlId) || currentFlId.includes(fName) || 
              (currentFlId.includes('alex') && fName.includes('alex')) ||
              (currentFlId.includes('sarah') && fName.includes('sarah')) ||
              (currentFlId.includes('haines') && fName.includes('haines'));
            return flMatch;
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
                    <h3 className="text-2xl font-black text-[#2563eb] mt-1">₹6,42,500</h3>
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
                            <p className="text-xs text-slate-500 font-medium pt-0.5">
                              Start Date: <strong className="text-slate-700">{c.startDate || 'Aug 11, 2026'}</strong>
                              <span className="mx-1 text-slate-300">•</span>
                              Deadline: <strong className="text-slate-700">{c.deadline || 'Aug 30, 2026'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Middle: Contract Value & Milestones Progress */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">CONTRACT VALUE</span>
                            <span className="text-lg font-black text-slate-900">{String(c.amount || c.agreedAmount || '₹1,50,000').replace(/\$/g, '₹')}</span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
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
            currentUserId={userSession?.username || userSession?.user_id || userSession?.email || 'haines'}
            currentUserName={userSession?.name || userSession?.user_id || 'Haines JP'}
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
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">CLIENT</span>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedContractDetail.clientName || selectedContractDetail.client || 'Enterprise Client'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">CONTRACT VALUE (₹)</span>
                  <p className="font-extrabold text-[#2563eb] text-sm">{selectedContractDetail.amount || selectedContractDetail.agreedAmount || '₹1,50,000'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">START DATE</span>
                  <p className="font-extrabold text-slate-900">{selectedContractDetail.startDate || 'Aug 11, 2026'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">ESCROW STATUS</span>
                  <p className="font-extrabold text-emerald-600">Funded & Protected</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Agreed Milestone Breakdown</h4>
                <div className="space-y-2">
                  {(selectedContractDetail.milestones && selectedContractDetail.milestones.length > 0) ? (
                    selectedContractDetail.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 text-sm">
                            {m.title || `Phase ${idx + 1}: Milestone Task`}
                          </h5>
                          {m.description && (
                            <p className="text-xs text-slate-500 font-medium">{m.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-600 text-sm block">{m.amount || '₹750'}</span>
                          <span className={`text-[10px] font-extrabold uppercase ${
                            (m.status || '').toLowerCase() === 'approved' || (m.status || '').toLowerCase() === 'completed'
                              ? 'text-emerald-600'
                              : (m.status || '').toLowerCase() === 'in progress'
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          }`}>
                            {m.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 text-sm">Phase 1: Model Setup & Data Ingestion</h5>
                          <p className="text-xs text-slate-500 font-medium">PyTorch model pipeline architecture</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-600 text-sm block">₹750</span>
                          <span className="text-[10px] font-extrabold uppercase text-emerald-600">Approved</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 text-sm">Phase 2: Inference Optimization & Benchmarking</h5>
                          <p className="text-xs text-slate-500 font-medium">REST API acceleration and low-latency benchmark</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-600 text-sm block">₹750</span>
                          <span className="text-[10px] font-extrabold uppercase text-blue-600">In Progress</span>
                        </div>
                      </div>
                    </>
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
