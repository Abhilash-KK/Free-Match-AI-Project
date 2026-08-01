import React, { useState } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';

const FreelancerDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'jobs' | 'proposals' | 'tasks' | 'earnings' | 'profile' | 'settings'
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'job1',
        title: 'E-commerce UI Redesign',
        client: 'MetaVibe Solutions',
        budget: '$4,500 - $6,000',
        duration: '3 Weeks',
        posted: '2 hours ago',
        postedDate: 'Posted 2h ago',
        skills: ['Figma', 'React', 'Tailwind CSS'],
        description: 'Senior UI/UX Designer required to redesign our e-commerce platform checkout flows and mobile responsive screens.'
      },
      {
        id: 'job2',
        title: 'FinTech Data Visualization Dashboard',
        client: 'Zenith Capital',
        budget: '$3,200 Fixed',
        duration: '2 Weeks',
        posted: '5 hours ago',
        postedDate: 'Posted 5h ago',
        skills: ['D3.js', 'Tailwind CSS', 'React'],
        description: 'Build a high-performance crypto asset dashboard using D3.js charts and WebSockets.'
      }
    ];
  });

  // Re-sync jobs & proposals from LocalStorage whenever component mounts or window gains focus
  React.useEffect(() => {
    const syncData = () => {
      const savedJobs = localStorage.getItem('freematch_shared_projects');
      if (savedJobs) {
        try {
          const parsed = JSON.parse(savedJobs);
          if (Array.isArray(parsed) && parsed.length > 0) setJobs(parsed);
        } catch (e) {}
      }
      const savedProposals = localStorage.getItem('freematch_shared_proposals');
      if (savedProposals) {
        try {
          const parsedProps = JSON.parse(savedProposals);
          if (Array.isArray(parsedProps) && parsedProps.length > 0) setProposals(parsedProps);
        } catch (e) {}
      }
    };
    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('focus', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('focus', syncData);
    };
  }, []);

  const handleSubmitBid = (e) => {
    e.preventDefault();
    if (!coverLetter.trim() || !selectedJob) return;

    const newProposal = {
      id: `pr_${Date.now()}`,
      freelancer: userSession?.name || 'Alex Rivera',
      freelancerName: userSession?.name || 'Alex Rivera',
      title: 'Senior UX Designer & React Developer',
      avatar: userSession?.name ? userSession.name.charAt(0) : 'AR',
      rating: 4.9,
      skills: Array.isArray(selectedJob.skills) ? selectedJob.skills.join(', ') : (selectedJob.skills || 'React, Python'),
      project: selectedJob.title,
      projectTitle: selectedJob.title,
      client: selectedJob.client,
      bid: `$${Number(bidAmount).toLocaleString()}`,
      bidAmount: `$${Number(bidAmount).toLocaleString()}`,
      delivery: deliveryTime,
      deliveryTime: deliveryTime,
      proposalText: coverLetter,
      coverLetter: coverLetter,
      status: 'Pending',
      date: 'Just now'
    };

    setProposals(prev => [newProposal, ...prev]);

    // Save to shared proposals for Client Inbox
    const existingProposals = JSON.parse(localStorage.getItem('freematch_shared_proposals') || '[]');
    localStorage.setItem('freematch_shared_proposals', JSON.stringify([newProposal, ...existingProposals]));

    setCoverLetter('');
    setShowBidModal(false);
    setSelectedJob(null);
    setToast({ message: `Bid submitted for "${selectedJob.title}"! The Client will receive your proposal in their inbox.`, type: 'success' });
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
        status: 'To Do',
        assignee: flName,
        budget: bidVal,
        project: targetTitle
      };
      const updatedTasks = [newTask, ...currentTasks];
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updatedTasks));
    }

    setActiveTab('tasks');
    setToast({ message: `Navigating to Sprint Board for "${targetTitle}"!`, type: 'info' });
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* FREELANCER PRODUCTIVITY SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              ⚡
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-500">FreeMatch AI</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Freelancer Workspace</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'workspace', label: 'My Work & Productivity', icon: '📊' },
              { id: 'jobs', label: 'Browse Jobs Feed', icon: '🔍' },
              { id: 'proposals', label: 'My Submitted Bids', icon: '✈️', badge: proposals.length },
              { id: 'tasks', label: 'Personal Task Kanban', icon: '📌' },
              { id: 'earnings', label: 'Earnings & Wallet', icon: '💰' },
              { id: 'profile', label: 'Profile & Skills Portfolio', icon: '👤' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

      {/* FREELANCER MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 px-8 py-3 border-b flex items-center justify-between backdrop-blur-xl ${
          isDark ? 'bg-[#030712]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search available jobs, required skills, or clients..."
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

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-xs font-bold">{userSession?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">SENIOR UX DESIGNER</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                AR
              </div>
            </div>
          </div>
        </header>

        {/* TAB 4: KANBAN SPRINT TASKS BOARD */}
        {activeTab === 'tasks' && (
          <div className="p-8">
            <KanbanBoard role="freelancer" currentUserName={userSession?.name || 'Alex Mercer'} isDark={isDark} />
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

                  {/* Attached Abstract Document or Architecture Image */}
                  {job.attachedFile && (
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-blue-950/30 border-blue-500/30 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">
                          {job.attachedFile.isImage ? '🖼️' : '📄'}
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
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-xs cursor-pointer"
                      >
                        {job.attachedFile.isImage ? '🔍 View Diagram' : '📥 Download Abstract'}
                      </a>
                    </div>
                  )}

                  {job.abstract && (
                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                      <div className="flex items-center space-x-1.5 mb-1 text-blue-400 font-extrabold text-[11px] uppercase tracking-wider">
                        <span>🔗</span>
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      Submit Proposal / Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SUBMITTED BIDS & PROPOSALS */}
        {activeTab === 'proposals' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Submitted Proposals & Contracts</h2>
              <p className="text-xs text-slate-400">Track real-time client acceptance status, proposal bids, and milestone sprint triggers.</p>
            </div>

            <div className="space-y-4">
              {proposals.map(pr => {
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isAccepted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isAccepted ? '🎉 Contract Accepted / Hired' : pr.status}
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
                          <span>📌 View Sprint Task on Kanban Board</span>
                          <span>→</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">⏳ Awaiting Client Decision</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSPACE OVERVIEW TAB */}
        {activeTab === 'workspace' && (
          <div className="p-8 space-y-8">
            
            {/* Header Banner */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Freelancer Work & Earnings Workspace</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Track your active sprint tasks, wallet balance, and proposal status.
              </p>
            </div>

            {/* 4 FREELANCER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border border-emerald-500/40 ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">AVAILABLE WALLET BALANCE</p>
                <p className="text-2xl font-extrabold text-emerald-500 mt-1">$3,450</p>
                <p className="text-[11px] text-slate-400 mt-1">Ready for withdrawal</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">LIFETIME EARNINGS</p>
                <p className="text-2xl font-extrabold text-blue-500 mt-1">$28,900</p>
                <p className="text-[11px] text-slate-400 mt-1">Across 24 Completed Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">2 Ongoing Sprints</p>
                <p className="text-[11px] text-slate-400 mt-1">Next milestone due in 3 days</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CLIENT RATING</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">★ 4.9 / 5.0</p>
                <p className="text-[11px] text-slate-400 mt-1">Based on 18 verified reviews</p>
              </div>
            </div>

            {/* SECTION 1: SHARED ROLE-BASED KANBAN SPRINT BOARD */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <KanbanBoard role="freelancer" currentUserName={userSession?.name || 'Alex Mercer'} isDark={isDark} />
            </div>

            {/* SECTION 2: BROWSE AVAILABLE JOBS FEED */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">Recommended Marketplace Jobs</h3>
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className={`p-6 rounded-3xl border space-y-3 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{job.title}</h4>
                        <p className="text-xs text-slate-400">{job.client} • {job.posted}</p>
                      </div>
                      <span className="bg-blue-500/10 text-blue-400 font-extrabold text-xs px-3 py-1 rounded-xl">{job.budget}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : []).map((s, i) => (
                          <span key={i} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-semibold">{s}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setSelectedJob(job); setShowBidModal(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Submit Proposal / Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
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
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Submit Bid Now</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default FreelancerDashboard;
