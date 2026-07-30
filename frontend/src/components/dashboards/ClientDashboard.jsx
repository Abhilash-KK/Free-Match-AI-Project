import React, { useState } from 'react';

const ClientDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPostProjectModal, setShowPostProjectModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [budget, setBudget] = useState('$5,000');
  const [skillsReq, setSkillsReq] = useState('React, Python');
  const [description, setDescription] = useState('');

  // Sample Client Projects
  const [clientProjects, setClientProjects] = useState([
    { id: 'cp1', title: 'AI Pipeline Optimization', budget: '$12,000', status: 'Active', applicants: 8, freelancer: 'Alex Mercer' },
    { id: 'cp2', title: 'FinTech Dashboard v2', budget: '$6,500', status: 'In Review', applicants: 14, freelancer: 'Sarah Chen' },
    { id: 'cp3', title: 'Security Audit & Shield', budget: '$4,200', status: 'Completed', applicants: 5, freelancer: 'Lana Kim' }
  ]);

  // Sample Freelancers to Hire
  const freelancersList = [
    { id: 'f1', name: 'Alex Mercer', title: 'Full Stack Engineer & Python Lead', rating: 4.9, exp: '6 Yrs Exp', avatar: 'AM', skills: ['React', 'Python', 'Django', 'PostgreSQL'], color: 'bg-blue-600' },
    { id: 'f2', name: 'Sarah Chen', title: 'Senior UI/UX Designer & Systems Architect', rating: 5.0, exp: '8 Yrs Exp', avatar: 'SC', skills: ['Figma', 'Tailwind', 'System Design'], color: 'bg-purple-600' },
    { id: 'f3', name: 'David Wright', title: 'Data Scientist & ML Engineer', rating: 4.8, exp: '5 Yrs Exp', avatar: 'DW', skills: ['PyTorch', 'Data Pipeline', 'Docker'], color: 'bg-emerald-600' },
    { id: 'f4', name: 'Lana Kim', title: 'Cybersecurity Analyst & Penetration Tester', rating: 4.9, exp: '7 Yrs Exp', avatar: 'LK', skills: ['Security Audit', 'PenTesting', 'Python'], color: 'bg-amber-600' }
  ];

  const handlePostProject = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    setClientProjects(prev => [
      {
        id: `cp_${Date.now()}`,
        title: projectTitle,
        budget: budget,
        status: 'Open',
        applicants: 0,
        freelancer: 'Unassigned'
      },
      ...prev
    ]);
    setProjectTitle('');
    setDescription('');
    setShowPostProjectModal(false);
    alert('Project posted successfully to FreeMatch AI marketplace!');
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-600">Freematch AI</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Client Hub</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1 text-sm font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'post', label: 'Post Project', icon: '➕' },
              { id: 'projects', label: 'My Projects', icon: '📋' },
              { id: 'freelancers', label: 'Browse Freelancers', icon: '👥' },
              { id: 'messages', label: 'Messages', icon: '💬' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'post') {
                    setShowPostProjectModal(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800/40 space-y-1 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
          <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className={`sticky top-0 z-30 px-8 py-4 border-b flex items-center justify-between backdrop-blur-xl ${
          isDark ? 'bg-[#030712]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search active projects or hired freelancers..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 ${
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
                <p className="text-xs font-bold">{userSession?.name || 'TechStream Corp'}</p>
                <p className="text-[10px] text-blue-400 uppercase font-semibold">VERIFIED CLIENT</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                TC
              </div>
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8">
            
            {/* Header + Post Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Client Dashboard</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage your posted projects, inspect applicants, and hire verified freelancers.
                </p>
              </div>
              <button 
                onClick={() => setShowPostProjectModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <span>+</span>
                <span>Post New Project</span>
              </button>
            </div>

            {/* 4 OVERVIEW METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-2xl font-extrabold">18</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Projects Posted</p>
              </div>
              <div className={`p-5 rounded-2xl border border-blue-500/40 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50/50 shadow-xs'}`}>
                <p className="text-2xl font-extrabold text-blue-500">4</p>
                <p className="text-[11px] font-bold text-blue-400 uppercase mt-1">Active Projects</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-2xl font-extrabold">14</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Completed Projects</p>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-2xl font-extrabold text-indigo-400">42</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Applications Received</p>
              </div>
            </div>

            {/* MY PROJECTS TABLE */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base">My Posted Projects</h3>
                <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'}`}>
                    <tr>
                      <th className="py-3 px-2">Project Title</th>
                      <th className="py-3 px-2">Budget</th>
                      <th className="py-3 px-2">Applicants</th>
                      <th className="py-3 px-2">Assigned Freelancer</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-medium">
                    {clientProjects.map(proj => (
                      <tr key={proj.id} className="hover:bg-blue-500/5 transition-colors">
                        <td className="py-3.5 px-2 font-bold">{proj.title}</td>
                        <td className="py-3.5 px-2 text-blue-500 font-extrabold">{proj.budget}</td>
                        <td className="py-3.5 px-2">
                          <span className="bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full">{proj.applicants} Applicants</span>
                        </td>
                        <td className="py-3.5 px-2 text-slate-300">{proj.freelancer}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            proj.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                            proj.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right space-x-2">
                          <button className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold cursor-pointer">
                            View Applicants
                          </button>
                          <button 
                            onClick={() => setClientProjects(prev => prev.filter(p => p.id !== proj.id))}
                            className="px-2 py-1 text-rose-500 hover:bg-rose-500/10 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BROWSE FREELANCERS GRID */}
            <div className="space-y-4">
              <h3 className="font-bold text-base">Recommended Freelancers to Hire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {freelancersList.map(fl => (
                  <div key={fl.id} className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-full ${fl.color} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                          {fl.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{fl.name}</h4>
                          <span className="text-[11px] text-amber-400 font-bold">★ {fl.rating} ({fl.exp})</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{fl.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fl.skills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedFreelancer(fl)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Hire Freelancer
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* POST PROJECT MODAL */}
      {showPostProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-lg w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-xl font-bold mb-4">Post a New Project</h3>
            <form onSubmit={handlePostProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Next.js Mobile-Responsive Dashboard"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border rounded-xl text-xs bg-transparent"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Budget ($ USD)</label>
                  <input
                    type="text"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="$5,000"
                    className="w-full p-3 border rounded-xl text-xs bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsReq}
                  onChange={(e) => setSkillsReq(e.target.value)}
                  placeholder="React, Python, PostgreSQL"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Project Description</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project scope, requirements, and deliverables..."
                  className="w-full p-3 border rounded-xl text-xs bg-transparent"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowPostProjectModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">Post Project Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIRE FREELANCER MODAL */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-xl font-bold mb-2">Hire {selectedFreelancer.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedFreelancer.title} • {selectedFreelancer.exp}</p>
            <p className="text-xs leading-relaxed mb-6">Send an offer letter with project terms directly to {selectedFreelancer.name}.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setSelectedFreelancer(null)} className="px-4 py-2 text-xs">Cancel</button>
              <button onClick={() => { alert(`Offer sent to ${selectedFreelancer.name}!`); setSelectedFreelancer(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Send Offer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;
