import React, { useState } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';

const ClientDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
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
    { id: 'cp1', title: 'AI Pipeline Optimization', client: 'TechStream Corp', category: 'Data Science & AI', budget: '$12,000', duration: '4 Weeks', skills: 'Python, PyTorch', status: 'In Progress', postedDate: 'Oct 20, 2023', progress: 30, applicants: 8, description: 'Optimize deep learning model training pipelines and automate RESTful API inferences.' },
    { id: 'cp2', title: 'FinTech Dashboard v2', client: 'TechStream Corp', category: 'Software Development', budget: '$6,500', duration: '3 Weeks', skills: 'React, D3.js', status: 'In Progress', postedDate: 'Oct 22, 2023', progress: 30, applicants: 12, description: 'Implementation of a complex data visualization dashboard for crypto asset management.' },
    { id: 'cp3', title: 'Cybersecurity Audit & Shield', client: 'TechStream Corp', category: 'Cybersecurity', budget: '$4,200', duration: '2 Weeks', skills: 'PenTesting, Python', status: 'Completed', postedDate: 'Oct 15, 2023', progress: 100, applicants: 5, description: 'Penetration testing and security compliance audit.' },
    { id: 'cp4', title: 'AI Search Engine', client: 'TechStream Corp', category: 'Software Development', budget: '$8,000', duration: '3 Weeks', skills: 'React, Python, Vector DB', status: 'Open for Bids', postedDate: 'Oct 28, 2023', progress: 0, applicants: 4, description: 'Natural language search engine powered by embedding vector databases.' },
    { id: 'cp5', title: 'AI Customer Support Chatbot', client: 'TechStream Corp', category: 'Data Science & AI', budget: '$9,500', duration: '3 Weeks', skills: 'Python, LLM, LangChain, React', status: 'Open for Bids', postedDate: 'Just Now', progress: 0, applicants: 6, description: 'RAG-powered customer support assistant with automated document ingestion and vector search.' },
    { id: 'cp6', title: 'Mobile Banking iOS App', client: 'TechStream Corp', category: 'Software Development', budget: '$14,000', duration: '5 Weeks', skills: 'Swift, iOS, React Native, REST API', status: 'In Progress', postedDate: 'Oct 29, 2023', progress: 30, applicants: 14, description: 'Secure mobile banking application featuring biometric login, instant transfer, and push alerts.' }
  ];

  // Sync Client Projects with LocalStorage
  const [clientProjects, setClientProjects] = useState(() => {
    localStorage.setItem('freematch_shared_projects', JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  });

  // 2. APPLICATIONS STATE
  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_proposals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'prop_1', projectId: 'cp1', projectTitle: 'AI Pipeline Optimization', freelancer: 'Alex Mercer', avatar: 'AM', title: 'Senior PyTorch & React Architect', rating: 4.9, bid: '$11,500', delivery: '3 Weeks', coverLetter: 'I have 7+ years optimizing PyTorch inference models for enterprise SaaS backends. Ready to start immediately with daily GitHub syncs.', status: 'Accepted' },
      { id: 'prop_2', projectId: 'cp2', projectTitle: 'FinTech Dashboard v2', freelancer: 'Sarah Chen', avatar: 'SC', title: 'Senior Data Scientist & Frontend Engineer', rating: 5.0, bid: '$6,200', delivery: '2.5 Weeks', coverLetter: 'Ex-Stripe UI engineer specializing in high-frequency financial charts and D3.js real-time websockets.', status: 'Pending' },
      { id: 'prop_3', projectId: 'cp4', projectTitle: 'AI Search Engine', freelancer: 'Lana Kim', avatar: 'LK', title: 'LLM & Search Systems Specialist', rating: 4.8, bid: '$7,800', delivery: '2 Weeks', coverLetter: 'Built vector similarity pipelines using Pinecone and spaCy. Can deliver clean code with 100% test coverage.', status: 'Pending' }
    ];
  });

  // 3. DYNAMIC HIRED FREELANCERS ROSTER (Includes defaults + accepted proposals like Haines Jp)
  const defaultHired = [
    { id: 'hf1', name: 'Alex Mercer', avatar: 'AM', title: 'Senior PyTorch & React Architect', project: 'AI Pipeline Optimization', rate: '$75/hr', status: 'Active', hiredDate: 'Oct 21, 2023' },
    { id: 'hf2', name: 'Sarah Chen', avatar: 'SC', title: 'Senior Data Scientist', project: 'FinTech Dashboard v2', rate: '$85/hr', status: 'Active', hiredDate: 'Oct 23, 2023' },
    { id: 'hf3', name: 'Lana Kim', avatar: 'LK', title: 'Cybersecurity Audit Specialist', project: 'Cybersecurity Audit & Shield', rate: '$90/hr', status: 'Completed', hiredDate: 'Oct 15, 2023' }
  ];

  const acceptedProposalsList = proposals.filter(p => p.status === 'Accepted' || p.status === 'Hired');
  const dynamicHiredFromProps = acceptedProposalsList.map((p, idx) => {
    const name = p.freelancer || p.freelancerName || 'Haines Jp';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HJ';
    return {
      id: `hired_${p.id || idx}`,
      name: name,
      avatar: p.avatar || initials,
      title: p.title || 'Senior Full Stack & AI Specialist',
      project: p.project || p.projectTitle || 'AI Search Engine',
      rate: p.bid || p.bidAmount || '$85/hr',
      status: 'Active',
      hiredDate: p.date || 'Just Now'
    };
  });

  const hiredFreelancers = [...defaultHired];
  dynamicHiredFromProps.forEach(dh => {
    if (!hiredFreelancers.some(hf => hf.name.toLowerCase() === dh.name.toLowerCase() && hf.project.toLowerCase() === dh.project.toLowerCase())) {
      hiredFreelancers.push(dh);
    }
  });

  // 4. DYNAMIC CONTRACTS STATE
  const defaultContracts = [
    { id: 'CTR-9024', freelancer: 'Alex Mercer', project: 'AI Pipeline Optimization', amount: '$11,500', escrow: '$11,500', startDate: 'Oct 21, 2023', status: 'Active' },
    { id: 'CTR-8812', freelancer: 'Sarah Chen', project: 'FinTech Dashboard v2', amount: '$6,200', escrow: '$6,200', startDate: 'Oct 23, 2023', status: 'Active' },
    { id: 'CTR-7401', freelancer: 'Lana Kim', project: 'Cybersecurity Audit & Shield', amount: '$4,200', escrow: '$0', startDate: 'Oct 15, 2023', status: 'Completed' }
  ];

  const dynamicContracts = acceptedProposalsList.map((p, idx) => ({
    id: `CTR-${8000 + idx}`,
    freelancer: p.freelancer || p.freelancerName || 'Haines Jp',
    project: p.project || p.projectTitle || 'AI Search Engine',
    amount: p.bid || p.bidAmount || '$8,500',
    escrow: p.bid || p.bidAmount || '$8,500',
    startDate: p.date || 'Just Now',
    status: 'Active'
  }));

  const contracts = [...defaultContracts];
  dynamicContracts.forEach(dc => {
    if (!contracts.some(c => c.freelancer.toLowerCase() === dc.freelancer.toLowerCase() && c.project.toLowerCase() === dc.project.toLowerCase())) {
      contracts.push(dc);
    }
  });

  // 5. KANBAN TASKS STATE (4 Columns: To-Do, In Progress, Under Review, Done)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('freematch_kanban_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', budget: '$2,500' },
      { id: 't2', title: 'Design D3.js Financial Chart Widgets', status: 'In Progress', assignee: 'Sarah Chen', budget: '$1,800' },
      { id: 't3', title: 'Restructure REST API Inference Endpoints', status: 'Under Review', assignee: 'Alex Mercer', budget: '$4,000' },
      { id: 't4', title: 'OWASP Security Audit & Vulnerability Report', status: 'Done', assignee: 'Lana Kim', budget: '$4,200' }
    ];
  });

  // 6. MESSAGES STATE
  const [selectedChat, setSelectedChat] = useState('Alex Mercer');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'Alex Mercer', text: 'Hi TechStream team! I submitted the milestone 1 code to the GitHub repo.', timestamp: '10:14 AM' },
    { id: 'm2', sender: 'You', text: 'Awesome Alex! We verified the build logs. Escrow payment for $4,000 released.', timestamp: '10:18 AM' },
    { id: 'm3', sender: 'Alex Mercer', text: 'Thank you! Proceeding with phase 2 model optimization today.', timestamp: '10:22 AM' }
  ]);

  // 7. PAYMENTS & ESCROW STATE
  const [payments] = useState([
    { id: 'INV-3041', date: 'Oct 25, 2023', project: 'AI Pipeline Optimization', milestone: 'Milestone 1: Model Setup', amount: '$4,000', type: 'Milestone Release', status: 'Paid' },
    { id: 'INV-3042', date: 'Oct 28, 2023', project: 'FinTech Dashboard v2', milestone: 'Milestone 1: Wireframes', amount: '$2,500', type: 'Escrow Lock', status: 'Pending' },
    { id: 'INV-3043', date: 'Oct 18, 2023', project: 'Cybersecurity Audit & Shield', milestone: 'Final Deliverable', amount: '$4,200', type: 'Milestone Release', status: 'Paid' }
  ]);

  // 8. DYNAMIC REVIEWS STATE & CANDIDATES
  const REVIEWABLE_CANDIDATES = hiredFreelancers.map((hf, idx) => ({
    id: `cand_${hf.id || idx}`,
    freelancer: hf.name,
    avatar: hf.avatar,
    projectTitle: hf.project,
    rate: hf.rate
  }));

  const [selectedCandidate, setSelectedCandidate] = useState(REVIEWABLE_CANDIDATES[0] || {
    id: 'cand_0', freelancer: 'Haines Jp', avatar: 'HJ', projectTitle: 'AI Search Engine', rate: '$85/hr'
  });
  const [commRating, setCommRating] = useState(5);
  const [codeRating, setCodeRating] = useState(5);
  const [deadlineRating, setDeadlineRating] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewTab, setReviewTab] = useState('given'); // 'given' | 'received'

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'r1', type: 'given', reviewer: 'TechStream Corp', reviewee: 'Lana Kim', projectTitle: 'Penetration Testing & OWASP Scan', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Lana completed the penetration audit ahead of schedule with zero security flaws left unpatched.', date: 'Oct 19, 2023' },
      { id: 'r2', type: 'given', reviewer: 'TechStream Corp', reviewee: 'Alex Mercer', projectTitle: 'AI Pipeline Optimization', rating: 5, comm: 5, code: 5, deadline: 4, comment: 'Exceptional PyTorch ML optimization. Delivered 4x speedup in API model inference.', date: 'Oct 26, 2023' },
      { id: 'r3', type: 'received', reviewer: 'Lana Kim', reviewee: 'TechStream Corp', projectTitle: 'Penetration Testing & OWASP Scan', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Great enterprise client to work with! Clear requirements and instantaneous escrow release.', date: 'Oct 20, 2023' }
    ];
  });

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const avgRating = Math.round((commRating + codeRating + deadlineRating) / 3.0);
    const newRev = {
      id: `r_${Date.now()}`,
      type: 'given',
      reviewer: userSession?.name || 'TechStream Corp',
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
    localStorage.setItem('freematch_shared_reviews', JSON.stringify(updated));

    // Try posting to Python Django backend REST API
    try {
      await fetch('http://localhost:8000/api/reviews/submit/', {
        method: 'POST',
        headers: { 'Content-Content': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: newRev.reviewer,
          reviewee: newRev.reviewee,
          rating: avgRating,
          comment: commentInput,
          project_title: selectedCandidate.projectTitle
        })
      });
    } catch (err) {}

    setCommentInput('');
    setToast({ 
      message: `Review for ${selectedCandidate.freelancer} submitted! Rating updated in database and AI match score boosted.`, 
      type: 'success' 
    });
  };


  // 9. NOTIFICATIONS STATE
  const [notifications] = useState([
    { id: 'n1', text: 'New proposal received for AI Search Engine from Lana Kim', time: '10 mins ago', icon: '📩', unread: true },
    { id: 'n2', text: 'Freelancer Alex Mercer submitted Milestone 1 for review', time: '1 hour ago', icon: '📌', unread: true },
    { id: 'n3', text: 'Escrow payment of $4,000 released successfully to Alex Mercer', time: '2 hours ago', icon: '💰', unread: false }
  ]);

  // List Filter State
  const [projectFilter, setProjectFilter] = useState('All');

  // Title formatting helper
  const formatTitle = (str) => {
    if (!str) return '';
    return str
      .replace(/\bai\b/gi, 'AI')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Dynamic Progress Percentage Calculation strictly snapped to stage weights:
  // To Do = 0%, In Progress = 30%, Under Review = 60%, Done = 100%
  const getProjectProgress = (p) => {
    if (!p) return 0;
    if (p.status === 'Open for Bids' || p.status === 'Hiring' || p.progress === 0) return 0;
    if (p.status === 'Completed' || p.progress === 100) return 100;
    
    // Check sprint tasks linked to this project on Kanban Board
    const currentTasks = JSON.parse(localStorage.getItem('freematch_kanban_tasks') || '[]');
    const projectTasks = currentTasks.filter(t => 
      (t.project && p.title && t.project.toLowerCase().includes(p.title.toLowerCase())) ||
      (t.title && p.title && t.title.toLowerCase().includes(p.title.toLowerCase()))
    );

    if (projectTasks.length > 0) {
      const hasDone = projectTasks.every(t => t.status === 'Done' || t.status === 'Completed');
      const hasUnderReview = projectTasks.some(t => t.status === 'Under Review');
      const hasInProgress = projectTasks.some(t => t.status === 'In Progress');

      if (hasDone) return 100;
      if (hasUnderReview) return 60;
      if (hasInProgress) return 30;
      return 0;
    }
    return 30;
  };

  // Handlers
  const handlePostProject = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectTitle,
      client: userSession?.name || 'TechStream Corp',
      category: category,
      budget: `$${parseInt(budget || 0).toLocaleString()}`,
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
    localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));

    // Reset Form
    setProjectTitle('');
    setDescription('');
    setProjectAbstract('');
    setAttachedFile(null);
    setShowPostProjectModal(false);
    setToast({ message: `Project "${formatTitle(newProj.title)}" posted with attachments!`, type: 'success' });
  };

  const handleAcceptProposal = (propId) => {
    const acceptedProp = proposals.find(p => p.id === propId);
    const updatedProps = proposals.map(p => p.id === propId ? { ...p, status: 'Accepted' } : p);
    setProposals(updatedProps);
    localStorage.setItem('freematch_shared_proposals', JSON.stringify(updatedProps));

    if (acceptedProp) {
      const targetProjTitle = acceptedProp.project || acceptedProp.projectTitle || 'AI Project Deliverable';
      const flName = acceptedProp.freelancer || acceptedProp.freelancerName || 'Alex Mercer';
      const bidVal = acceptedProp.bid || acceptedProp.bidAmount || '$5,000';

      // 1. Update project status to 'In Progress' with 15% progress
      const updatedProjects = clientProjects.map(p => 
        (p.title === targetProjTitle || p.id === acceptedProp.projectId) 
          ? { ...p, status: 'In Progress', progress: 15 } 
          : p
      );
      setClientProjects(updatedProjects);
      localStorage.setItem('freematch_shared_projects', JSON.stringify(updatedProjects));

      // 2. Automatically create a Sprint Task in Kanban Board!
      const currentTasks = JSON.parse(localStorage.getItem('freematch_kanban_tasks') || '[]');
      const newTask = {
        id: `t_${Date.now()}`,
        title: `Deliverable: ${targetProjTitle}`,
        status: 'To Do',
        assignee: flName,
        budget: bidVal,
        project: targetProjTitle
      };
      const updatedTasks = [newTask, ...currentTasks];
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updatedTasks));
    }

    setToast({ message: 'Proposal accepted! Contract activated and task added to Kanban Board.', type: 'success' });
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

  const filteredProjects = clientProjects.filter((p) => {
    const isHiring = p.progress === 0 || p.status === 'Open for Bids' || p.status === 'Hiring';
    const isCompleted = p.progress === 100 || p.status === 'Completed';
    const isInProgress = !isHiring && !isCompleted;

    if (projectFilter === 'Hiring') return isHiring;
    if (projectFilter === 'In Progress') return isInProgress;
    if (projectFilter === 'Completed') return isCompleted;
    // Default 'All' filter hides completed projects from active workspace
    return !isCompleted;
  });

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* 13 SIDEBAR NAVIGATION ITEMS */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-600">FreeMatch AI</h1>
              <p className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">CLIENT WORKSPACE</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'post', label: 'Post Project', icon: '➕', action: () => setShowPostProjectModal(true) },
              { id: 'projects', label: 'My Projects', icon: '📋', badge: clientProjects.length },
              { id: 'applications', label: 'Project Applications', icon: '📩', badge: proposals.length },
              { id: 'freelancers', label: 'Hired Freelancers', icon: '👥' },
              { id: 'contracts', label: 'Contracts', icon: '📜' },
              { id: 'kanban', label: 'Project Progress (Kanban)', icon: '📌' },
              { id: 'messages', label: 'Messages', icon: '💬' },
              { id: 'payments', label: 'Payments & Escrow', icon: '💰' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' },
              { id: 'notifications', label: 'Notifications', icon: '🔔', badge: notifications.filter(n => n.unread).length }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  else setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/40 space-y-1 text-xs font-semibold">
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>
            <span>⚙️</span><span>Settings</span>
          </button>
          <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className={`sticky top-0 z-30 px-8 py-4 border-b flex items-center justify-between backdrop-blur-xl ${
          isDark ? 'bg-[#030712]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search projects, candidates, or contracts..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
            />
          </div>

          <div className="flex items-center space-x-4">
            {toggleTheme && (
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#081024] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                {isDark ? '☀️' : '🌙'}
              </button>
            )}
            <button onClick={() => setActiveTab('notifications')} className={`p-2.5 rounded-xl border relative ${isDark ? 'bg-[#081024] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              🔔
            </button>

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-xs font-bold">{userSession?.name || 'TechStream Corp'}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase">ENTERPRISE CLIENT</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                TC
              </div>
            </div>
          </div>
        </header>

        {/* TAB 1: CLIENT DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Client Project & Hiring Hub</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Post projects, manage active milestone escrows, and inspect freelancer proposals.
                </p>
              </div>
              <button 
                onClick={() => setShowPostProjectModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <span>+</span>
                <span>Post New Project</span>
              </button>
            </div>

            {/* SINGLE ROW OF 4 ESSENTIAL METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border border-blue-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">ACTIVE PROJECTS</p>
                <p className="text-2xl font-extrabold text-blue-500 mt-1">
                  {clientProjects.filter(p => (p.progress > 0 && p.progress < 100) || p.status === 'Active' || p.status === 'In Progress').length || 4}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Currently in milestone sprint</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">PENDING APPLICATIONS</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {proposals.filter(pr => pr.status !== 'Accepted').length || 27}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Freelancer bids awaiting review</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">TOTAL BUDGET</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">$42,500</p>
                <p className="text-[11px] text-slate-400 mt-1">Across all project milestones</p>
              </div>

              <div className={`p-5 rounded-2xl border border-amber-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">PENDING ESCROW</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">$6,500</p>
                <p className="text-[11px] text-slate-400 mt-1">Locked in active milestone hold</p>
              </div>
            </div>

            {/* MY POSTED PROJECTS LIST */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h3 className="font-bold text-sm">My Posted Projects</h3>

                {/* List Filters */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {['All', 'Hiring', 'In Progress', 'Completed'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setProjectFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        projectFilter === filter 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter} {filter === 'All' ? `(${clientProjects.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredProjects.map(p => {
                  const isHiring = p.progress === 0 || p.status === 'Open for Bids' || p.status === 'Hiring';
                  const isCompleted = p.progress === 100 || p.status === 'Completed';
                  const isInProgress = !isHiring && !isCompleted;

                  return (
                      /* Project Row Item */
                      <div key={p.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isDark ? 'bg-[#081024] border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-bold text-sm text-slate-100 truncate">{formatTitle(p.title)}</h4>
                            
                            {/* Dynamic State Pill */}
                            {isHiring && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Hiring
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                In Progress ({getProjectProgress(p)}%)
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Completed
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400">
                            Category: <span className="text-blue-400 font-semibold">{p.category}</span> • Required Skills: {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Posted: {p.postedDate} • Duration: {p.duration} • Applicants: <span className="font-bold text-slate-300">{p.applicants}</span>
                          </p>

                          {/* Dynamic Progress Bar */}
                          <div className="w-full max-w-md bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-amber-500'}`} 
                              style={{ width: `${getProjectProgress(p)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          <div className="text-right">
                            <span className="font-extrabold text-blue-500 text-sm block">{p.budget}</span>
                            <span className="text-[10px] text-slate-400 block">{p.duration}</span>
                          </div>

                          {/* Dynamic Action Buttons */}
                          {isHiring ? (
                            <button 
                              onClick={() => setActiveTab('applications')} 
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              View Applications
                            </button>
                          ) : isCompleted ? (
                            <button 
                              onClick={() => setActiveTab('kanban')} 
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                            >
                              View Sprint
                            </button>
                          ) : (
                            <button 
                              onClick={() => setActiveTab('kanban')} 
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Track Progress
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Posted Projects ({clientProjects.length})</h2>
                <p className="text-xs text-slate-400">View and manage all projects posted by your enterprise account.</p>
              </div>
              <button 
                onClick={() => setShowPostProjectModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                + Post New Project
              </button>
            </div>

            <div className="space-y-4">
              {clientProjects.map(p => {
                const isHiring = p.progress === 0 || p.status === 'Open for Bids' || p.status === 'Hiring';
                const isCompleted = p.progress === 100 || p.status === 'Completed';
                const isInProgress = !isHiring && !isCompleted;

                return (
                  <div key={p.id} className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <h4 className="font-bold text-base tracking-tight text-slate-100">{formatTitle(p.title)}</h4>
                        
                        {/* Status Badges */}
                        {isHiring && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Hiring
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            In Progress ({p.progress}%)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Completed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">Category: <span className="text-blue-400 font-semibold">{p.category}</span> • Required Skills: {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}</p>
                      <p className="text-[11px] text-slate-500">Posted: {p.postedDate} • Duration: {p.duration} • Applicants: <span className="text-slate-300 font-bold">{p.applicants || 4}</span></p>

                      {/* Progress Bar */}
                      <div className="w-full max-w-md bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-amber-500'}`} 
                          style={{ width: `${p.progress || (isCompleted ? 100 : 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-blue-500 text-sm block">{p.budget}</span>
                        <span className="text-[10px] text-slate-400 block">{p.duration}</span>
                      </div>

                      {/* Dynamic Action Buttons */}
                      {isHiring ? (
                        <button onClick={() => setActiveTab('applications')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                          View Applications
                        </button>
                      ) : isCompleted ? (
                        <button onClick={() => setActiveTab('kanban')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer">
                          View Sprint
                        </button>
                      ) : (
                        <button onClick={() => setActiveTab('kanban')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                          Track Progress
                        </button>
                      )}

                      <button onClick={() => setClientProjects(prev => prev.filter(item => item.id !== p.id))} className="px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold cursor-pointer">
                        Close Posting
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECT APPLICATIONS (Proposals Inbox) */}
        {activeTab === 'applications' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Project Applications ({proposals.length})</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Review incoming freelancer bids, inspect cover letters, and hire candidates.</p>
            </div>

            <div className="space-y-4">
              {proposals.map(pr => (
                <div key={pr.id} className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {pr.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{pr.freelancer}</h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pr.title} • <span className="text-amber-500 font-bold">★ {pr.rating}</span></p>
                        <p className="text-[11px] text-blue-500 font-semibold mt-0.5">Applied for: {pr.projectTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-blue-600 block">{pr.bid}</span>
                      <span className={`text-xs font-medium block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pr.delivery} Delivery</span>
                    </div>
                  </div>

                  <p className={`text-xs italic p-4 rounded-2xl border leading-relaxed font-medium ${
                    isDark ? 'bg-[#040919] border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    "{pr.coverLetter}"
                  </p>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button 
                      onClick={() => { setSelectedChat(pr.freelancer); setActiveTab('messages'); }} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                      }`}
                    >
                      Send Message
                    </button>
                    <button 
                      onClick={() => {
                        setProposals(prev => prev.filter(item => item.id !== pr.id));
                        setToast({ message: `Proposal from ${pr.freelancer} rejected.`, type: 'info' });
                      }} 
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reject Proposal
                    </button>
                    <button 
                      onClick={() => handleAcceptProposal(pr.id)} 
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        pr.status === 'Accepted' ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {pr.status === 'Accepted' ? '✓ Hired & Contract Active' : 'Hire Freelancer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HIRED FREELANCERS ROSTER */}
        {activeTab === 'freelancers' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Hired Freelancers Roster ({hiredFreelancers.length})</h2>
              <p className="text-xs text-slate-400">Freelancers assigned to active project contracts or past completed deliverables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hiredFreelancers.map(hf => (
                <div key={hf.id} className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {hf.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{hf.name}</h4>
                      <p className="text-xs text-slate-400">{hf.title}</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        hf.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {hf.status} Contract
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 border-t border-b border-slate-800/60 py-3">
                    <p>Assigned: <span className="text-slate-200 font-semibold">{hf.project}</span></p>
                    <p>Agreed Rate: <span className="text-blue-400 font-bold">{hf.rate}</span></p>
                    <p>Hired: <span className="text-slate-400">{hf.hiredDate}</span></p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => { setSelectedChat(hf.name); setActiveTab('messages'); }} 
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => setActiveTab('contracts')} 
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer text-center"
                    >
                      View Contract
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CONTRACTS AGREEMENT HUB */}
        {activeTab === 'contracts' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Contracts & Milestone Agreements ({contracts.length})</h2>
              <p className="text-xs text-slate-400">Legal escrow hold agreements, terms of service, and freelancer contract documents.</p>
            </div>

            <div className="space-y-4">
              {contracts.map(c => (
                <div key={c.id} className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-blue-400 text-xs px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">{c.id}</span>
                      <h4 className="font-bold text-base">{c.project}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Freelancer: <span className="text-slate-200 font-semibold">{c.freelancer}</span> • Start Date: {c.startDate}</p>
                    <p className="text-[11px] text-slate-400">Escrow Funded Balance: <span className="text-emerald-400 font-bold">{c.escrow}</span></p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold text-blue-500 text-base block">{c.amount}</span>
                      <span className="text-[10px] text-slate-400 block">Total Agreed</span>
                    </div>

                    <button 
                      onClick={() => setToast({ message: `Downloading Contract Document ${c.id}.pdf...`, type: 'info' })}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      📄 Download Contract PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROJECT PROGRESS (4 KANBAN COLUMNS: To-Do, In Progress, Under Review, Done) */}
        {activeTab === 'kanban' && (
          <div className="p-8">
            <KanbanBoard role="client" isDark={isDark} />
          </div>
        )}

        {/* TAB 8: MESSAGES CHAT WORKSPACE */}
        {activeTab === 'messages' && (
          <div className="p-8 h-[calc(100vh-80px)] flex gap-6">
            {/* Left Chat Sidebar */}
            <div className={`w-72 border rounded-3xl p-4 flex flex-col ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-sm mb-3">Conversations</h3>
              <div className="space-y-2">
                {['Alex Mercer', 'Sarah Chen', 'Lana Kim'].map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedChat(name)}
                    className={`w-full p-3 rounded-2xl text-left flex items-center space-x-3 transition-all ${
                      selectedChat === name ? 'bg-blue-600 text-white font-bold' : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs">{name}</p>
                      <p className="text-[10px] opacity-70">Active contract sync</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Chat Panel */}
            <div className={`flex-1 border rounded-3xl p-6 flex flex-col justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{selectedChat}</h3>
                  <p className="text-[10px] text-emerald-400 font-semibold">● Online • AI Progress Tracker Synced</p>
                </div>
                <button onClick={() => setActiveTab('contracts')} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20">
                  View Contract Details
                </button>
              </div>

              <div className="flex-1 my-4 space-y-3 overflow-y-auto pr-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs ${
                      m.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : isDark ? 'bg-slate-800 text-slate-100 rounded-bl-none' : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p>{m.text}</p>
                      <span className="text-[9px] opacity-60 mt-1 block text-right">{m.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setToast({ message: 'Attachment file picker opened.', type: 'info' })} className="p-2.5 text-slate-400 hover:text-white text-lg">📎</button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedChat}...`}
                  className={`flex-1 p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                />
                <button type="submit" className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs">Send</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: PAYMENTS & ESCROW HUB */}
        {activeTab === 'payments' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Payments & Escrow Management</h2>
              <p className="text-xs text-slate-400">Track milestone deposits, release funds to freelancers, and download tax invoices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border border-amber-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">ESCROW LOCKED BALANCE</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">$6,500.00</p>
                <p className="text-xs text-slate-400 mt-2">Held securely in milestone escrow</p>
              </div>

              <div className={`p-6 rounded-3xl border border-emerald-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">TOTAL RELEASED PAYMENTS</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">$36,000.00</p>
                <p className="text-xs text-slate-400 mt-2">Successfully paid to freelancers</p>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">CONNECTED GATEWAY</p>
                <p className="text-xl font-bold text-white mt-2">Stripe & Razorpay</p>
                <p className="text-xs text-slate-400 mt-2">Auto-escrow verification active</p>
              </div>
            </div>

            {/* Transaction Invoice Table */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <h3 className="font-bold text-sm mb-4">Milestone Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
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
                        <td className="py-3 text-slate-400">{py.date}</td>
                        <td className="py-3">
                          <p className="font-bold">{py.project}</p>
                          <p className="text-[10px] text-slate-400">{py.milestone}</p>
                        </td>
                        <td className="py-3 text-slate-300 font-semibold">{py.type}</td>
                        <td className="py-3 font-extrabold text-white">{py.amount}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
              <h2 className="text-2xl font-bold">Reviews & Performance Feedback</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rate completed freelancer deliverables, update database performance metrics, and inspect review history.</p>
            </div>

            {/* 1. Review Submission Form with Target Candidate Selector */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                <div>
                  <h3 className="font-bold text-base">Leave Performance Rating for Completed Contract</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Submitted ratings feed into freelancer public profiles and AI matching algorithms.</p>
                </div>

                <div className="w-full sm:w-auto">
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>SELECT COMPLETED FREELANCER / PROJECT</label>
                  <select
                    value={selectedCandidate.id}
                    onChange={(e) => {
                      const found = REVIEWABLE_CANDIDATES.find(c => c.id === e.target.value);
                      if (found) setSelectedCandidate(found);
                    }}
                    className={`w-full sm:w-auto p-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
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
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-blue-950/20 border-blue-500/30' : 'bg-blue-50/80 border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCandidate.freelancer}</h4>
                    <p className="text-xs text-blue-600 font-bold">Project: {selectedCandidate.projectTitle}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Agreed Rate: {selectedCandidate.rate}</span>
              </div>

              <form onSubmit={handleAddReview} className="space-y-5">
                
                {/* 4. Granular Category Ratings */}
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border ${
                  isDark ? 'bg-[#040919] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  
                  {/* Communication */}
                  <div className="space-y-1">
                    <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>💬 Communication</label>
                    <div className="flex items-center space-x-1 text-amber-500 text-base">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setCommRating(s)}
                          className={`cursor-pointer ${commRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{commRating}/5</span>
                    </div>
                  </div>

                  {/* Code Quality */}
                  <div className="space-y-1">
                    <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>💻 Code Quality</label>
                    <div className="flex items-center space-x-1 text-amber-500 text-base">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setCodeRating(s)}
                          className={`cursor-pointer ${codeRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{codeRating}/5</span>
                    </div>
                  </div>

                  {/* Deadline Adherence */}
                  <div className="space-y-1">
                    <label className={`text-xs font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>⏱️ Deadline Adherence</label>
                    <div className="flex items-center space-x-1 text-amber-500 text-base">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          type="button" 
                          key={s} 
                          onClick={() => setDeadlineRating(s)}
                          className={`cursor-pointer ${deadlineRating >= s ? 'opacity-100' : 'opacity-30'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{deadlineRating}/5</span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600">
                    Overall Computed Score: {Math.round((commRating + codeRating + deadlineRating) / 3.0)} / 5 Stars ★
                  </span>
                </div>

                <textarea
                  rows="3"
                  required
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={`Write detailed evaluation for ${selectedCandidate.freelancer} regarding sprint deliverables, unit testing, and communication...`}
                  className={`w-full p-3.5 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300 placeholder:text-slate-400'
                  }`}
                ></textarea>

                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
                  Submit Review & Boost AI Match Score
                </button>
              </form>
            </div>

            {/* 3. Separate Given vs Received Filter Tabs */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <h3 className="font-bold text-base">Review History</h3>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReviewTab('given')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === 'given' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Reviews Given ({reviews.filter(r => r.type === 'given').length})
                  </button>
                  <button
                    onClick={() => setReviewTab('received')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === 'received' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Reviews Received ({reviews.filter(r => r.type === 'received').length})
                  </button>
                </div>
              </div>

              {/* 2. Review History Cards with Project Context */}
              <div className="space-y-3">
                {reviews.filter(r => r.type === reviewTab).map(rv => (
                  <div key={rv.id} className={`p-5 rounded-2xl border space-y-2.5 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{rv.reviewer}</span>
                        <span className="text-slate-400 text-xs">➔</span>
                        <span className="text-blue-600 text-xs font-bold">{rv.reviewee}</span>
                        {/* Project Context */}
                        <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          (Project: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{rv.projectTitle}</span>)
                        </span>
                      </div>
                      <div className="text-amber-500 text-xs font-bold flex items-center space-x-1">
                        <span>{'★'.repeat(rv.rating)}</span>
                        <span className={`font-mono text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>({rv.rating}/5)</span>
                      </div>
                    </div>

                    <p className={`text-xs italic p-3 rounded-xl border font-medium ${
                      isDark ? 'bg-[#040919] border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      "{rv.comment}"
                    </p>

                    <div className={`flex items-center justify-between text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      <span>Posted: {rv.date}</span>
                      {rv.comm && (
                        <span className={isDark ? 'text-slate-400' : 'text-slate-700'}>
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
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Activity Notifications & Log</h2>
              <p className="text-xs text-slate-400">Real-time system events, bid arrivals, and milestone release alerts.</p>
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                  n.unread 
                    ? isDark ? 'bg-blue-950/20 border-blue-500/40' : 'bg-blue-50/50 border-blue-200' 
                    : isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{n.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* SECTION 2: POST PROJECT STEP-BY-STEP MODAL */}
      {showPostProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl max-w-xl w-full border shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold">Post New Marketplace Project</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define project scope, skills, budget, and payment milestones.</p>
              </div>
              <button onClick={() => setShowPostProjectModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handlePostProject} className="space-y-5">
              
              {/* Title & Category */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Project Title</label>
                <input 
                  type="text" 
                  required 
                  value={projectTitle} 
                  onChange={(e) => setProjectTitle(e.target.value)} 
                  placeholder="e.g. Full Stack Web App / AI Search Engine" 
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="UI/UX & Visual Design">UI/UX & Visual Design</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Required Skills</label>
                  <input 
                    type="text" 
                    value={skillsReq} 
                    onChange={(e) => setSkillsReq(e.target.value)} 
                    placeholder="React, Django, Python" 
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`} 
                  />
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Total Budget ($ USD)</label>
                  <input 
                    type="number" 
                    required 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                    placeholder="5000" 
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Estimated Duration</label>
                  <input 
                    type="text" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    placeholder="3 Weeks" 
                    className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`} 
                  />
                </div>
              </div>

              {/* Milestone Breakdown */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Payment Milestone Breakdown</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMilestoneItems([...milestoneItems, { id: Date.now(), title: `Phase ${milestoneItems.length + 1}: Sprint Deliverable`, amount: '1000' }]);
                    }}
                    className="text-[10px] text-blue-400 font-bold hover:underline"
                  >
                    + Add Milestone Phase
                  </button>
                </div>
                {milestoneItems.map((ms, idx) => (
                  <div key={ms.id} className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={ms.title} 
                      onChange={(e) => {
                        const updated = [...milestoneItems];
                        updated[idx].title = e.target.value;
                        setMilestoneItems(updated);
                      }}
                      className={`flex-1 p-2.5 border rounded-xl text-xs ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-slate-50 border-slate-200'}`} 
                    />
                    <input 
                      type="number" 
                      value={ms.amount} 
                      onChange={(e) => {
                        const updated = [...milestoneItems];
                        updated[idx].amount = e.target.value;
                        setMilestoneItems(updated);
                      }}
                      className={`w-24 p-2.5 border rounded-xl text-xs ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-slate-50 border-slate-200'}`} 
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Project Scope & Description</label>
                <textarea 
                  rows="3" 
                  required 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Outline core project requirements, deliverables, and expectations..." 
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                ></textarea>
              </div>

              {/* File & Image Attachment Upload Box */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Attach Abstract Document or Image Specs (Optional)</label>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Optional</span>
                </div>

                {attachedFile ? (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-blue-950/40 border-blue-500/40 text-white' : 'bg-blue-50 border-blue-200 text-slate-900'}`}>
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl shadow-inner shrink-0">
                        {attachedFile.isImage ? '🖼️' : '📄'}
                      </div>
                      <div>
                        <p className="font-bold text-xs">{attachedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{attachedFile.size} • Attached for Freelancers</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl cursor-pointer transition-all"
                    >
                      ✕ Remove File
                    </button>
                  </div>
                ) : (
                  <label className={`w-full p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDark ? 'border-slate-800 hover:border-blue-500 bg-[#060e22]' : 'border-slate-300 hover:border-blue-500 bg-slate-50'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg mb-2">
                      📁
                    </div>
                    <span className="text-xs font-bold text-blue-400">Click or Drag & Drop to Upload File / Image Specs</span>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, PNG, JPG, Architecture Diagrams (Max 25MB)</span>
                    <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Optional Text Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Additional Technical Notes / GitHub Link (Optional)</label>
                <input 
                  type="text"
                  value={projectAbstract} 
                  onChange={(e) => setProjectAbstract(e.target.value)} 
                  placeholder="e.g., https://github.com/techstream/ai-pipeline or notes on PyTorch 2.0 specs..." 
                  className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowPostProjectModal(false)} className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg">Publish Project to Marketplace</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;
