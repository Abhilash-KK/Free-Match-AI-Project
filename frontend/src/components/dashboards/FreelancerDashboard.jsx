import React, { useState } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';
import NotificationCenter from '../NotificationCenter';
import MessagingCenter from '../MessagingCenter';
import FreelancerProfileView from '../FreelancerProfileView';
import FreelancerSettingsView from '../FreelancerSettingsView';
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
  Calendar
} from 'lucide-react';

const FreelancerDashboard = ({ userSession, reviews = [], onSignOut }) => {
  const isDark = false;
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'jobs' | 'proposals' | 'tasks' | 'earnings' | 'profile' | 'settings' | 'notifications'
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

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
      { id: 'pr1', project: 'AI Pipeline Optimization', projectTitle: 'AI Pipeline Optimization', client: 'TechStream Corp', bid: '$11,500', bidAmount: '$11,500', delivery: '2 Weeks', status: 'Accepted', date: 'Oct 24, 2023' },
      { id: 'pr2', project: 'E-commerce UI Redesign', projectTitle: 'E-commerce UI Redesign', client: 'MetaVibe Solutions', bid: '$5,000', bidAmount: '$5,000', delivery: '3 Weeks', status: 'Shortlisted', date: 'Oct 26, 2023' }
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
            budget: p.budget || '$4,500',
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
        budget: '$8,500',
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
        budget: '$5,200',
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
              budget: p.budget || '$4,500',
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

    window.addEventListener('storage', handleSync);
    window.addEventListener('freematch_shared_event', handleSync);
    window.addEventListener('freematch_notification_event', loadBackendNotifs);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('freematch_shared_event', handleSync);
      window.removeEventListener('freematch_notification_event', loadBackendNotifs);
    };
  }, [userSession]);

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
      bidAmount: `$${bidAmount}`,
      bid: `$${bidAmount}`,
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
      `${flName} submitted a bid of $${bidAmount} for project "${selectedJob.title}".`
    );

    setShowBidModal(false);
    setCoverLetter('');
    setToast({ message: `Proposal submitted successfully for "${selectedJob.title}"!`, type: 'success' });
    setActiveTab('proposals');

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_notification_event'));
  };

  const handleViewSprintTask = (pr) => {
    const targetTitle = pr.project || pr.projectTitle || 'AI Customer Support Chatbot';
    const flName = userSession?.name || 'Alex Mercer';
    const bidVal = pr.bid || pr.bidAmount || '$8,999';

    const currentTasks = JSON.parse(localStorage.getItem('freematch_kanban_tasks') || '[]');
    const exists = currentTasks.some(t => 
      (t.title && t.title.toLowerCase().includes(targetTitle.toLowerCase())) || 
      (t.project && t.project.toLowerCase() === targetTitle.toLowerCase())
    );

    if (!exists) {
      const newTask = {
        id: `t_${Date.now()}`,
        title: `Deliverable: ${targetTitle}`,
        status: 'In Progress',
        assignee: flName,
        budget: bidVal,
        project: targetTitle
      };
      const updatedTasks = [newTask, ...currentTasks];
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updatedTasks));
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));

    setActiveTab('tasks');
    setToast({ message: `Navigating to Sprint Board for "${targetTitle}"!`, type: 'info' });
  };

  const currentFlId = (userSession?.user_id || userSession?.email || userSession?.name || '').toLowerCase().trim();
  const isDemoUser = ['user1', 'alex', 'mercer', 'haines', 'abhilash', 'john'].some(d => currentFlId.includes(d));

  const myProposalsCount = isDemoUser ? proposals.length : proposals.filter(pr => {
    const f = (pr.freelancer || pr.freelancerName || pr.user_id || '').toLowerCase();
    return f && (f.includes(currentFlId) || currentFlId.includes(f));
  }).length;

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
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Freelancer Workspace</p>
            </div>
          </div>

          <nav className="space-y-4 text-xs font-semibold">
            
            {/* 1. WORKSPACE */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">WORKSPACE</p>
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 2. MANAGEMENT */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">MANAGEMENT</p>
              {[
                { id: 'tasks', label: 'Sprint Task Board', icon: Kanban },
                { id: 'earnings', label: 'Earnings & Wallet', icon: Wallet }
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
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">COMMUNICATION</p>
              {[
                { id: 'messages', label: 'Messages', icon: MessageCircle, badge: 3 },
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                      }`}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 4. ACCOUNT */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">ACCOUNT</p>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === 'profile' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <UserCircle className="w-4 h-4" />
                <span>View Profile</span>
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
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-[10px] px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
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
                  <p className="text-xs font-bold text-slate-900">{userSession?.name || userSession?.user_id || 'Alex Mercer'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SENIOR PYTORCH ARCHITECT</p>
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
                    <p className="text-[11px] text-slate-500 font-medium truncate">{userSession?.email || 'alex.mercer@freematch.ai'}</p>
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
        {activeTab === 'tasks' && (
          <div className="p-8">
            <KanbanBoard role="freelancer" currentUserName={userSession?.name || userSession?.user_id || 'Haines Jose Paulson'} isDark={isDark} />
          </div>
        )}

        {/* TAB: BROWSE JOBS FEED */}
        {activeTab === 'jobs' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Marketplace Jobs Feed</h2>
              <p className="text-xs text-slate-400">Discover active client project postings matched to your AI skills profile.</p>
            </div>

            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.client} • {job.posted || job.postedDate}</p>
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
                          <p className="text-[10px] text-slate-400">{job.attachedFile.size} • Client Technical Attachment</p>
                        </div>
                      </div>
                      <a
                        href={job.attachedFile.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        {job.attachedFile.isImage ? <Search className="w-3.5 h-3.5 mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                        <span>{job.attachedFile.isImage ? 'View Diagram' : 'Download Abstract'}</span>
                      </a>
                    </div>
                  )}

                  {job.abstract && (
                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                      <div className="flex items-center space-x-1.5 mb-1 text-blue-400 font-extrabold text-[11px] uppercase tracking-wider">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Technical Notes & GitHub Link:</span>
                      </div>
                      <p className="whitespace-pre-line text-xs font-mono bg-black/20 p-2.5 rounded-xl border border-slate-800">{job.abstract}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : []).map((s, i) => (
                        <span key={i} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-semibold">{s}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => { setSelectedJob(job); setShowBidModal(true); }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
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

        {/* TAB: SUBMITTED BIDS & PROPOSALS */}
        {activeTab === 'proposals' && (() => {
          const currentFlId = (userSession?.user_id || userSession?.email || userSession?.name || '').toLowerCase().trim();
          const isDemo = ['user1', 'alex', 'mercer', 'haines', 'abhilash', 'john'].some(d => currentFlId.includes(d));

          const myProposals = isDemo ? proposals : proposals.filter(pr => {
            const f = (pr.freelancer || pr.freelancerName || pr.user_id || '').toLowerCase();
            return f && (f.includes(currentFlId) || currentFlId.includes(f));
          });

          return (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Submitted Proposals & Contracts</h2>
                <p className="text-xs text-slate-400">Track real-time client acceptance status, proposal bids, and milestone sprint triggers.</p>
              </div>

              {myProposals.length > 0 ? (
                <div className="space-y-4">
                  {myProposals.map(pr => {
                    const isAccepted = pr.status === 'Accepted' || pr.status === 'Hired';
                    return (
                      <div key={pr.id} className={`p-6 rounded-3xl border space-y-3 ${
                        isAccepted
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-base">{pr.project || pr.projectTitle}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center space-x-1 ${
                                isAccepted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {isAccepted ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                <span>{isAccepted ? 'Contract Accepted / Hired' : pr.status}</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Client: <span className="font-semibold text-slate-200">{pr.client}</span> • Bid: {pr.bid || pr.bidAmount} • Timeline: {pr.delivery || pr.deliveryTime}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">{pr.date}</span>
                        </div>

                        {pr.coverLetter && (
                          <p className={`text-xs italic p-3.5 rounded-xl border font-medium ${
                            isDark ? 'bg-[#040919] border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                          }`}>
                            "{pr.coverLetter}"
                          </p>
                        )}

                        <div className="flex justify-end pt-2">
                          {isAccepted ? (
                            <button
                              onClick={() => handleViewSprintTask(pr)}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2"
                            >
                              <Kanban className="w-4 h-4" />
                              <span>View Sprint Task Board</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
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
                  <Send className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Submitted Bids Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse available marketplace jobs and submit your first proposal to start working with clients.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB: FREELANCER PROFILE & VERIFIED CLIENT REVIEWS */}
        {activeTab === 'profile' && (() => {
          const currentFlName = userSession?.name || userSession?.user_id || 'Alex Mercer';
          const myProfileData = {
            name: currentFlName,
            user_id: userSession?.user_id || userSession?.username || 'alexmercer',
            title: 'Senior React, PyTorch & Django Architect',
            headline: 'Senior React, PyTorch & Django Architect',
            location: 'San Francisco, CA',
            hourlyRate: '$75.00 / hr',
            availabilityStatus: 'Available for Work',
            availableHours: '40 hrs/week',
            yearsExperience: '7+',
            projectsCompleted: '24',
            jobSuccessRate: '100%',
            onTimeDelivery: '98%',
            lifetimeEarnings: '$28,900',
            bio: 'Senior Full Stack & Artificial Intelligence Engineer with 7+ years of experience constructing high-performance RESTful APIs, deep learning inference pipelines, and real-time React web applications. Proven track record delivering 100% on-time milestone completions for global enterprise clients.',
            skills: ['React.js', 'Python Django', 'PyTorch ML', 'PostgreSQL', 'Tailwind CSS', 'D3.js', 'REST API Architecture', 'OWASP Security', 'FastAPI'],
            completenessPercentage: 85
          };

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

            return {
              assignedProjects: projList,
              totalTasksCount: tot,
              doneTasksCount: dn,
              inProgressCount: inp,
              pendingCount: pnd >= 0 ? pnd : 0,
              overallProgressPercent: overallPct,
              walletBalanceStr: isDemo ? '$3,450' : '$0.00',
              lifetimeEarningsStr: isDemo ? '$28,900' : '$0.00',
              activeContractsStr: isDemo ? '2' : '0',
              clientRatingStr: isDemo ? '4.9 / 5.0' : 'No ratings yet',
              completedProjectsCount: isDemo ? '24' : '0'
            };
          })();

          return (
            <div className="p-8 space-y-8">
              
              {/* PAGE HEADER */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Freelancer Work & Earnings Workspace</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>
                  Track your active projects, earnings, and current work progress.
                </p>
              </div>

              {/* 4 PRIMARY SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Wallet Balance */}
                <div className={`p-5 rounded-2xl border border-emerald-500/40 flex items-start justify-between ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-2xs'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">AVAILABLE WALLET BALANCE</p>
                    <p className="text-2xl font-extrabold text-emerald-500 mt-1">{walletBalanceStr}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Ready for withdrawal</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 2: Lifetime Earnings */}
                <div className={`p-5 rounded-2xl border flex items-start justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">LIFETIME EARNINGS</p>
                    <p className="text-2xl font-extrabold text-blue-500 mt-1">{lifetimeEarningsStr}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Across {completedProjectsCount} Completed Projects</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 3: Active Contracts */}
                <div className={`p-5 rounded-2xl border flex items-start justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                    <p className="text-2xl font-extrabold text-indigo-400 mt-1">{activeContractsStr}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Ongoing Sprints</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 4: Client Rating */}
                <div className={`p-5 rounded-2xl border flex items-start justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CLIENT RATING</p>
                    <p className="text-2xl font-extrabold text-amber-400 mt-1">{clientRatingStr}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Based on verified reviews</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>
              </div>

              {/* ASSIGNED PROJECTS & WORK SUMMARY ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* MY ASSIGNED PROJECTS (2 COLS) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-emerald-500" />
                      <span>MY ASSIGNED PROJECTS</span>
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                                {proj.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                <span className="flex items-center space-x-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                                  <span>Client: <strong className="text-slate-800 dark:text-white font-bold">{proj.client}</strong></span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1 text-slate-400">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                                  <span>Deadline: <strong className="text-slate-800 dark:text-white font-bold">{proj.deadline}</strong></span>
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setActiveTab('tasks')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5 shrink-0 self-start sm:self-center"
                            >
                              <span>View Tasks</span>
                            </button>
                          </div>

                          {/* Progress Bar & Status breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-600 dark:text-slate-300">Sprint Progress</span>
                              <span className="font-extrabold text-emerald-500">{proj.progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: `${proj.progress}%` }} 
                              />
                            </div>

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <span>✓ <strong className="text-slate-700 dark:text-slate-200">{proj.done}</strong> Done</span>
                              <span>•</span>
                              <span>⚡ <strong className="text-slate-700 dark:text-slate-200">{proj.inProgress}</strong> In Progress</span>
                              <span>•</span>
                              <span>⏳ <strong className="text-slate-700 dark:text-slate-200">{proj.pending}</strong> Pending</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#060e22]">
                      <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Assigned Projects Yet</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        MY WORK SUMMARY
                      </h3>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {totalTasksCount} Tasks
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <div className="text-sm font-black">{doneTasksCount}</div>
                        <div className="text-[9px] uppercase tracking-wider">Completed</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <div className="text-sm font-black">{inProgressCount}</div>
                        <div className="text-[9px] uppercase tracking-wider">In Progress</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <div className="text-sm font-black">{pendingCount}</div>
                        <div className="text-[9px] uppercase tracking-wider">Pending</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
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
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    RECOMMENDED MARKETPLACE JOBS
                  </h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Browse All Jobs Feed</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {jobs.slice(0, 3).map(job => (
                    <div 
                      key={job.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {job.title}
                          </h4>
                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs px-2.5 py-0.5 rounded-md border border-blue-500/20">
                            {job.budget}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                          <span>{job.client || 'Abhilash K K'}</span>
                          <span>•</span>
                          <span>{job.posted || 'Aug 11, 2026'}</span>
                          <span>•</span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : []).slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => { setSelectedJob(job); setShowBidModal(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center flex items-center space-x-1.5"
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
                  <label className="text-xs font-bold block mb-1">Your Bid Amount ($ USD)</label>
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
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Bid Now</span>
                  </button>
                </div>
              </form>
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
                <p className="text-xs text-slate-500 font-medium mt-1">You will be redirected back to the FreeMatch AI login screen.</p>
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
