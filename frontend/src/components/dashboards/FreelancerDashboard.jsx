import React, { useState } from 'react';

const FreelancerDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [hasAppliedMap, setHasAppliedMap] = useState({});
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Sample Projects
  const [projects] = useState([
    {
      id: 'fp1',
      title: 'E-commerce UI Redesign',
      client: 'MetaVibe Solutions',
      posted: 'Posted 2h ago',
      budget: '$4,500 - $6,000',
      description: "We're looking for a Senior UI/UX Designer to lead the redesign of our flagship e-commerce platform. Focus on accessibility and high-conversion checkout flows.",
      tags: ['Figma', 'React Architecture', 'A/B Testing'],
      paymentVerified: true
    },
    {
      id: 'fp2',
      title: 'FinTech Dashboard Development',
      client: 'Zenith Capital',
      posted: 'Posted 5h ago',
      budget: '$3,200 Fixed',
      description: 'Implementation of a complex data visualization dashboard for a crypto asset management tool. Requires expertise in D3.js and Tailwind CSS.',
      tags: ['D3.js', 'Tailwind CSS', 'Dashboard UI'],
      paymentVerified: true
    },
    {
      id: 'fp3',
      title: 'AI Mobile Assistant Integration',
      client: 'NeuralFlow Inc',
      posted: 'Posted 1d ago',
      budget: '$8,000 Fixed',
      description: 'Build native iOS/Android screens integrated with speech-to-text API services and automated offline caching.',
      tags: ['React Native', 'TypeScript', 'Rest API'],
      paymentVerified: true
    }
  ]);

  const handleApply = (projId) => {
    setHasAppliedMap(prev => ({ ...prev, [projId]: true }));
    alert(`Application submitted for project #${projId}!`);
    setSelectedProject(null);
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-600">Freematch AI</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Precision Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'profile', label: 'My Profile', icon: '👤' },
              { id: 'skills', label: 'Skills', icon: '🎯' },
              { id: 'portfolio', label: 'Portfolio', icon: '📁' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-4 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3">
              MARKETPLACE
            </div>
            <button
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'browse' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🔍</span>
              <span>Browse Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'applied' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>✈️</span>
              <span>Applied Projects</span>
            </button>

            <div className="pt-4 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3">
              MANAGEMENT
            </div>
            <button
              onClick={() => setActiveTab('active')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'active' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>📋</span>
              <span>Active Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'completed' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>✅</span>
              <span>Completed Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'messages' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>💬</span>
              <span>Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'reviews' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>⭐</span>
              <span>Reviews</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Upgrade Card */}
        <div className="pt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-2 shadow-lg">
            <h4 className="font-bold text-xs">Upgrade to Pro</h4>
            <p className="text-[11px] text-blue-100 leading-snug">Unlock deeper analytics and priority project matching.</p>
            <button className="w-full py-2 bg-white text-blue-700 font-extrabold rounded-xl text-xs shadow-xs hover:bg-blue-50 cursor-pointer mt-1">
              Upgrade Now
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/40 space-y-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-colors ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-3.5 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
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
              placeholder="Search for projects, clients, or skills..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all ${
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
            <button className={`p-2.5 rounded-xl border relative ${isDark ? 'bg-[#081024] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              🔔
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-xs font-bold">{userSession?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">SENIOR UX DESIGNER</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                AR
              </div>
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8">
            
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Freelancer Dashboard</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Welcome back, Alex. You have 2 active projects requiring attention.
              </p>
            </div>

            {/* 5 OVERVIEW METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 mb-3 flex items-center justify-center">🔍</div>
                <p className="text-2xl font-extrabold">45</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Available Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 mb-3 flex items-center justify-center">✈️</div>
                <p className="text-2xl font-extrabold">12</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Applied Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border border-blue-500/50 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50/50 shadow-xs'}`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-blue-600 text-white mb-3 flex items-center justify-center">📋</div>
                <p className="text-2xl font-extrabold text-blue-500">2</p>
                <p className="text-[11px] font-bold text-blue-400 uppercase mt-1">Ongoing Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 mb-3 flex items-center justify-center">✅</div>
                <p className="text-2xl font-extrabold">24</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Completed Projects</p>
              </div>

              {/* Profile Completion Card */}
              <div className="p-5 rounded-2xl bg-blue-600 text-white flex flex-col justify-between shadow-lg">
                <div>
                  <p className="text-3xl font-extrabold">85%</p>
                  <p className="text-[11px] font-bold uppercase text-blue-100 mt-1">Profile Completion</p>
                  <div className="w-full bg-blue-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white h-full w-[85%] rounded-full"></div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResumeModal(true)}
                  className="mt-3 w-full py-1.5 bg-white text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 cursor-pointer"
                >
                  Resume Upload
                </button>
              </div>
            </div>

            {/* TWO COLUMN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Browse Projects Feed */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Browse Projects</h3>
                  <div className="flex items-center space-x-2">
                    <button className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>Filter</button>
                    <button className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>Relevance</button>
                  </div>
                </div>

                {/* Projects Feed Cards */}
                <div className="space-y-4">
                  {projects.map(proj => (
                    <div key={proj.id} className={`p-6 rounded-3xl border space-y-4 transition-all hover:border-blue-500/50 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base">{proj.title}</h4>
                          <p className="text-xs text-slate-400">{proj.client} • {proj.posted}</p>
                        </div>
                        <span className="bg-blue-500/10 text-blue-400 font-extrabold text-xs px-3 py-1 rounded-xl">{proj.budget}</span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {proj.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {proj.tags.map((t, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                            isDark ? 'bg-[#081024] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                          <span>✔</span> <span>Payment Verified</span>
                        </span>
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {hasAppliedMap[proj.id] ? 'Applied ✔' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Active Projects & Profile Progress */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Active Projects Widget */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Active Projects</h3>
                    <button className="text-xs font-bold text-blue-500 hover:underline">View All</button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span>SaaS Mobile App</span>
                        <span className="text-[10px] text-blue-400">Phase 3/5</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-blue-500 h-full w-[60%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Next: Final Prototype</span>
                        <span className="text-amber-400 font-bold">Due in 3 days</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-800/20 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span>Brand Guidelines</span>
                        <span className="text-[10px] text-slate-400">Phase 1/3</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-blue-500 h-full w-[33%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Next: Moodboard</span>
                        <span>Starts tomorrow</span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-4 w-full py-2.5 border border-blue-500/40 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/10 cursor-pointer">
                    Project Management Hub
                  </button>
                </div>

                {/* Complete Your Profile Widget */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">COMPLETE YOUR PROFILE</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <span>✔</span> <span>Link Portfolio</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <span>✔</span> <span>Verified Skills</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="w-4 h-4 rounded-full border border-slate-500 inline-block"></span>
                      <span>Upload Professional Resume</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="w-4 h-4 rounded-full border border-slate-500 inline-block"></span>
                      <span>Add Testimonials (3+)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowResumeModal(true)}
                    className="mt-5 w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Resume Upload
                  </button>
                </div>

                {/* Recent Feedback Card */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">RECENT FEEDBACK</span>
                    <span className="text-xs text-amber-400 font-bold">★ 4.9/5.0</span>
                  </div>
                  <p className="text-xs text-slate-300 italic mb-3">
                    "Alex delivered the prototypes ahead of schedule. Exceptional eye for detail and understood our brand voice immediately."
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">Sarah J., CTO at MetaVibe</p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">My Freelancer Profile</h2>
            <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input type="text" defaultValue={userSession?.name || 'Alex Rivera'} className="w-full p-3 border rounded-xl bg-transparent" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Title</label>
                  <input type="text" defaultValue="Senior UX Designer & React Frontend Engineer" className="w-full p-3 border rounded-xl bg-transparent" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Skills (comma separated)</label>
                  <input type="text" defaultValue="UI/UX Design, React.js, Tailwind CSS, Figma, D3.js" className="w-full p-3 border rounded-xl bg-transparent" />
                </div>
              </div>
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Save Profile</button>
            </div>
          </div>
        )}

      </main>

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-lg w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-xl font-bold mb-2">{selectedProject.title}</h3>
            <p className="text-xs text-blue-500 font-bold mb-4">{selectedProject.client} • {selectedProject.budget}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{selectedProject.description}</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 text-xs">Close</button>
              <button 
                onClick={() => handleApply(selectedProject.id)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Apply for Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUME UPLOAD MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-lg font-bold mb-2">Upload Professional Resume</h3>
            <p className="text-xs text-slate-400 mb-4">Supported formats: PDF, DOCX (Max 10MB)</p>
            <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl text-center mb-6">
              <span className="text-3xl">📄</span>
              <p className="text-xs font-bold mt-2">Drag & Drop or Click to Browse</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowResumeModal(false)} className="px-4 py-2 text-xs">Cancel</button>
              <button onClick={() => { alert('Resume uploaded!'); setShowResumeModal(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Upload</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FreelancerDashboard;
