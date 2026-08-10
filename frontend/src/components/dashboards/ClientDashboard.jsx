import React, { useState, useEffect } from 'react';
import Toast from '../Toast';
import KanbanBoard from '../KanbanBoard';

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
    { id: 'cp1', title: 'AI Pipeline Optimization', client: 'TechStream Corp', category: 'Data Science & AI', budget: '$12,000', duration: '4 Weeks', skills: 'Python, PyTorch', status: 'In Progress', postedDate: 'Aug 01, 2026', progress: 30, applicants: 8, description: 'Optimize deep learning model training pipelines and automate RESTful API inferences.' },
    { id: 'cp2', title: 'FinTech Dashboard v2', client: 'TechStream Corp', category: 'Software Development', budget: '$6,500', duration: '3 Weeks', skills: 'React, D3.js', status: 'In Progress', postedDate: 'Aug 02, 2026', progress: 30, applicants: 12, description: 'Implementation of a complex data visualization dashboard for crypto asset management.' },
    { id: 'cp3', title: 'Cybersecurity Audit & Shield', client: 'TechStream Corp', category: 'Cybersecurity', budget: '$4,200', duration: '2 Weeks', skills: 'PenTesting, Python', status: 'Completed', postedDate: 'Jul 28, 2026', progress: 100, applicants: 5, description: 'Penetration testing and security compliance audit.' },
    { id: 'cp4', title: 'AI Search Engine', client: 'TechStream Corp', category: 'Software Development', budget: '$8,000', duration: '3 Weeks', skills: 'React, Python, Vector DB', status: 'Open for Bids', postedDate: 'Aug 03, 2026', progress: 0, applicants: 4, description: 'Natural language search engine powered by embedding vector databases.' },
    { id: 'cp5', title: 'AI Customer Support Chatbot', client: 'TechStream Corp', category: 'Data Science & AI', budget: '$9,500', duration: '3 Weeks', skills: 'Python, LLM, LangChain, React', status: 'Open for Bids', postedDate: 'Just Now', progress: 0, applicants: 6, description: 'RAG-powered customer support assistant with automated document ingestion and vector search.' },
    { id: 'cp6', title: 'Mobile Banking iOS App', client: 'TechStream Corp', category: 'Software Development', budget: '$14,000', duration: '5 Weeks', skills: 'Swift, iOS, React Native, REST API', status: 'In Progress', postedDate: 'Aug 04, 2026', progress: 30, applicants: 14, description: 'Secure mobile banking application featuring biometric login, instant transfer, and push alerts.' }
  ];

  // Sync Client Projects with LocalStorage
  const [clientProjects, setClientProjects] = useState(() => {
    const saved = localStorage.getItem('freematch_shared_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = parsed.map(p => {
            if (!p.postedDate || p.postedDate.includes('2023')) {
              if (p.id === 'cp1') return { ...p, postedDate: 'Aug 01, 2026' };
              if (p.id === 'cp2') return { ...p, postedDate: 'Aug 02, 2026' };
              if (p.id === 'cp3') return { ...p, postedDate: 'Jul 28, 2026' };
              if (p.id === 'cp4') return { ...p, postedDate: 'Aug 03, 2026' };
              if (p.id === 'cp5') return { ...p, postedDate: 'Just Now' };
              if (p.id === 'cp6') return { ...p, postedDate: 'Aug 04, 2026' };
              return { ...p, postedDate: 'Aug 03, 2026' };
            }
            return p;
          });
          localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));
          return updated;
        }
      } catch (e) {}
    }
    localStorage.setItem('freematch_shared_projects', JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  });

  // Fetch projects live from Django REST Framework PostgreSQL database
  useEffect(() => {
    fetch('http://localhost:8000/api/projects/')
      .then(res => res.json())
      .then(dbProjects => {
        if (Array.isArray(dbProjects) && dbProjects.length > 0) {
          setClientProjects(prev => {
            const dbIds = new Set(dbProjects.map(p => p.id));
            const merged = [...dbProjects, ...prev.filter(p => !dbIds.has(p.id))];
            localStorage.setItem('freematch_shared_projects', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(err => console.warn('PostgreSQL fetch notice:', err));
  }, []);

  const validProjectTitles = new Set(clientProjects.map(p => (p.title || '').toLowerCase()));

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

  const validProposals = proposals.filter(p => validProjectTitles.has((p.projectTitle || p.project || '').toLowerCase()));

  // 3. DYNAMIC HIRED FREELANCERS ROSTER (Includes defaults + accepted proposals)
  const defaultHired = [
    { id: 'hf1', name: 'Alex Mercer', avatar: 'AM', title: 'Senior PyTorch & React Architect', project: 'AI Pipeline Optimization', rate: '$75/hr', status: 'Active', hiredDate: 'Oct 21, 2023' },
    { id: 'hf2', name: 'Sarah Chen', avatar: 'SC', title: 'Senior Data Scientist', project: 'FinTech Dashboard v2', rate: '$85/hr', status: 'Active', hiredDate: 'Oct 23, 2023' },
    { id: 'hf3', name: 'Lana Kim', avatar: 'LK', title: 'Cybersecurity Audit Specialist', project: 'Cybersecurity Audit & Shield', rate: '$90/hr', status: 'Completed', hiredDate: 'Oct 15, 2023' }
  ];

  const acceptedProposalsList = validProposals.filter(p => p.status === 'Accepted' || p.status === 'Hired');
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

  const rawHired = [...defaultHired];
  dynamicHiredFromProps.forEach(dh => {
    if (!rawHired.some(hf => hf.name.toLowerCase() === dh.name.toLowerCase() && hf.project.toLowerCase() === dh.project.toLowerCase())) {
      rawHired.push(dh);
    }
  });
  const hiredFreelancers = rawHired.filter(hf => validProjectTitles.has((hf.project || '').toLowerCase()));

  // 4. DYNAMIC CONTRACTS STATE & REMOVAL TRACKER
  const [removedContractIds, setRemovedContractIds] = useState(() => {
    const saved = localStorage.getItem('freematch_deleted_contracts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

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

  const rawContracts = [...defaultContracts];
  dynamicContracts.forEach(dc => {
    if (!rawContracts.some(c => c.freelancer.toLowerCase() === dc.freelancer.toLowerCase() && c.project.toLowerCase() === dc.project.toLowerCase())) {
      rawContracts.push(dc);
    }
  });

  // Filter out contracts for deleted projects AND manually removed contracts
  const contracts = rawContracts.filter(c => 
    validProjectTitles.has((c.project || '').toLowerCase()) && !removedContractIds.includes(c.id)
  );

  const handleDeleteContract = (contractId) => {
    const updated = [...removedContractIds, contractId];
    setRemovedContractIds(updated);
    localStorage.setItem('freematch_deleted_contracts', JSON.stringify(updated));
    setToast({ message: `Contract ${contractId} removed from agreements.`, type: 'info' });
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
    { id: 'INV-3041', date: 'Aug 01, 2026', project: 'AI Pipeline Optimization', milestone: 'Milestone 1: Model Setup', amount: '$4,000', type: 'Milestone Release', status: 'Paid' },
    { id: 'INV-3042', date: 'Aug 03, 2026', project: 'FinTech Dashboard v2', milestone: 'Milestone 1: Wireframes', amount: '$2,500', type: 'Escrow Lock', status: 'Pending' },
    { id: 'INV-3043', date: 'Jul 28, 2026', project: 'Cybersecurity Audit & Shield', milestone: 'Final Deliverable', amount: '$4,200', type: 'Milestone Release', status: 'Paid' }
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
      { id: 'r1', type: 'given', reviewer: 'TechStream Corp', reviewee: 'Lana Kim', projectTitle: 'Penetration Testing & OWASP Scan', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Lana completed the penetration audit ahead of schedule with zero security flaws left unpatched.', date: 'Aug 01, 2026' },
      { id: 'r2', type: 'given', reviewer: 'TechStream Corp', reviewee: 'Alex Mercer', projectTitle: 'AI Pipeline Optimization', rating: 5, comm: 5, code: 5, deadline: 4, comment: 'Exceptional PyTorch ML optimization. Delivered 4x speedup in API model inference.', date: 'Aug 03, 2026' },
      { id: 'r3', type: 'received', reviewer: 'Lana Kim', reviewee: 'TechStream Corp', projectTitle: 'Penetration Testing & OWASP Scan', rating: 5, comm: 5, code: 5, deadline: 5, comment: 'Great enterprise client to work with! Clear requirements and instantaneous escrow release.', date: 'Aug 02, 2026' }
    ];
  });

  const [selectedProfileFreelancer, setSelectedProfileFreelancer] = useState(null);

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
    window.dispatchEvent(new Event('storage'));

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

  // 9. CLIENT PROFILE & SETTINGS STATE
  const [clientProfile, setClientProfile] = useState(() => {
    const saved = localStorage.getItem('freematch_client_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      displayName: 'Abhilash K K',
      companyName: 'TechStream Corp',
      industry: 'Software Technology',
      website: 'https://techstream.io',
      location: 'San Francisco, CA (UTC-7)',
      joinedDate: 'Joined October 2023',
      description: 'TechStream Corp is an enterprise software solution provider specializing in PyTorch AI model training pipelines, high-frequency financial charts, and cloud microservices automation.',
      paymentVerified: true,
      paymentMethod: 'Visa ending in **** 4242',
      escrowLocked: '$6,500',
      totalSpent: '$42,500',
      projectsPosted: 6,
      activeHires: 3
    };
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(clientProfile.displayName);
  const [editCompanyName, setEditCompanyName] = useState(clientProfile.companyName);
  const [editIndustry, setEditIndustry] = useState(clientProfile.industry);
  const [editWebsite, setEditWebsite] = useState(clientProfile.website);
  const [editDescription, setEditDescription] = useState(clientProfile.description);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...clientProfile,
      displayName: editDisplayName,
      companyName: editCompanyName,
      industry: editIndustry,
      website: editWebsite,
      description: editDescription
    };
    setClientProfile(updated);
    localStorage.setItem('freematch_client_profile', JSON.stringify(updated));
    setShowEditProfileModal(false);
    setToast({ message: 'Client profile and settings updated successfully!', type: 'success' });
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
  const handlePostProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const formattedBudget = `$${parseInt(budget || 0).toLocaleString()}`;
    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectTitle,
      client: userSession?.name || 'TechStream Corp',
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
    localStorage.setItem('freematch_shared_projects', JSON.stringify(updated));

    // Persist project directly into Django PostgreSQL database
    try {
      await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          client: userSession?.name || 'TechStream Corp',
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

    // Reset Form
    setProjectTitle('');
    setDescription('');
    setProjectAbstract('');
    setAttachedFile(null);
    setShowPostProjectModal(false);
    setToast({ message: `Project "${formatTitle(newProj.title)}" posted & stored in database!`, type: 'success' });
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
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between p-6 relative z-20 shadow-xs">
        <div>
          {/* Logo Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#2563eb]">FreeMatch AI</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">CLIENT WORKSPACE</p>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '❖' },
              { id: 'post', label: 'Post Project', icon: '➕', action: () => setShowPostProjectModal(true) },
              { id: 'projects', label: 'My Projects', icon: '📜', badge: clientProjects.length },
              { id: 'applications', label: 'Project Applications', icon: '📥', badge: proposals.length },
              { id: 'freelancers', label: 'Hired Freelancers', icon: '👥' },
              { id: 'contracts', label: 'Contracts', icon: '📋' },
              { id: 'kanban', label: 'Sprint Task Board', icon: '🚩' },
              { id: 'messages', label: 'Messages', icon: '💬' },
              { id: 'payments', label: 'Payments & Escrow', icon: '🛡️' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' },
              { id: 'notifications', label: 'Notifications', icon: '🔔', badge: notifications.filter(n => n.unread).length }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  else setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === item.id 
                    ? 'bg-[#2563eb] text-white shadow-xs' 
                    : 'text-[#475569] hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Vector Graphic Illustration & Settings */}
        <div className="pt-4 space-y-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-center space-x-3">
            <svg className="w-10 h-10 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.8" />
              <path d="M8 21h8M12 17v4" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="10" r="2.5" strokeWidth="1.8" />
            </svg>
            <div>
              <p className="text-xs font-extrabold text-slate-900">AI Assistance</p>
              <p className="text-[10px] text-slate-500 font-medium">Smart NLP Auto-Match</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs font-bold">
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-[#2563eb] text-white shadow-xs' 
                : 'text-[#475569] hover:bg-slate-100'
            }`}>
              <span>⚙️</span><span>Settings</span>
            </button>
            <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer">
              <span>🚪</span><span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f4f7fc]">
        
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 px-8 py-4 border-b border-slate-200/80 bg-[#f4f7fc]/90 backdrop-blur-md flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search projects, candidates, or contracts..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#e2e8f0]/60 border-0 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('notifications')} className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs relative cursor-pointer hover:bg-slate-50">
              🔔
              {notifications.some(n => n.unread) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-300">
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-900">{userSession?.name || 'Abhilash Kk'}</p>
                <p className="text-[10px] text-[#2563eb] font-extrabold tracking-wider uppercase">ENTERPRISE CLIENT</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                {userSession?.name ? userSession.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'TC'}
              </div>
            </div>
          </div>
        </header>

        {/* TAB 1: CLIENT DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Header Banner Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Client Project & Hiring Hub</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                  Post projects, manage active milestone escrows, and inspect freelancer proposals.
                </p>
              </div>
              <button 
                onClick={() => setShowPostProjectModal(true)}
                className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all"
              >
                <span>+</span>
                <span>Post New Project</span>
              </button>
            </div>

            {/* 4 ESSENTIAL METRIC CARDS (Calculated dynamically from live project and contract data) */}
            {(() => {
              const parseCurrency = (val) => {
                if (!val) return 0;
                const cleaned = String(val).replace(/[^0-9.]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
              };

              const activeProjectsCount = clientProjects.filter(p => 
                p.status === 'Active' || p.status === 'In Progress' || p.status === 'Open for Bids' || (p.progress > 0 && p.progress < 100)
              ).length;

              const totalApplicants = Math.max(
                proposals.length,
                clientProjects.reduce((sum, p) => sum + (parseInt(p.applicants, 10) || 0), 0)
              );

              const totalBudgetSum = clientProjects.reduce((sum, p) => sum + parseCurrency(p.budget), 0);
              const formattedTotalBudget = `$${totalBudgetSum.toLocaleString()}`;

              const pendingEscrowSum = contracts
                .filter(c => c.status === 'Active')
                .reduce((sum, c) => sum + parseCurrency(c.escrow || c.amount), 0);
              const formattedPendingEscrow = `$${(pendingEscrowSum > 0 ? pendingEscrowSum : 6500).toLocaleString()}`;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Card 1: Active Projects */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center text-xl shrink-0">
                      📂
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">ACTIVE PROJECTS</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                        {activeProjectsCount}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">Currently in milestone sprint</p>
                    </div>
                  </div>

                  {/* Card 2: Pending Applications */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center text-xl shrink-0">
                      📋
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">PENDING APPLICATIONS</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                        {totalApplicants}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">Freelancer bids awaiting review</p>
                    </div>
                  </div>

                  {/* Card 3: Total Budget */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                      💲
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">TOTAL BUDGET</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-0.5">
                        {formattedTotalBudget}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">Across all project milestones</p>
                    </div>
                  </div>

                  {/* Card 4: Pending Escrow */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center text-xl shrink-0">
                      🔒
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">PENDING ESCROW</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-0.5">
                        {formattedPendingEscrow}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">Locked in active milestone hold</p>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* MY POSTED PROJECTS LIST CONTAINER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h3 className="font-extrabold text-xl text-slate-900">My Posted Projects</h3>

                {/* Filter Pills */}
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {['All', 'Hiring', 'In Progress', 'Completed'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setProjectFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        projectFilter === filter 
                          ? 'bg-[#2563eb] text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter} {filter === 'All' ? `(${clientProjects.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Cards List */}
              <div className="space-y-4">
                {filteredProjects.map(p => {
                  const isHiring = p.progress === 0 || p.status === 'Open for Bids' || p.status === 'Hiring';
                  const isCompleted = p.progress === 100 || p.status === 'Completed';
                  const isInProgress = !isHiring && !isCompleted;

                  return (
                    <div key={p.id} className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-extrabold text-base text-slate-900 truncate">{formatTitle(p.title)}</h4>
                          
                          {/* Status Pill */}
                          {isHiring && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200/80">
                              Hiring
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/80">
                              In Progress ({getProjectProgress(p)}%)
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200/80">
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                          Category: <span className="text-[#2563eb] font-bold hover:underline cursor-pointer">{p.category}</span> • Required Skills: {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}
                        </p>
                        
                        <p className="text-xs text-slate-400 mt-1">
                          Posted: {p.postedDate} • Duration: {p.duration} • Applicants: <span className="font-extrabold text-slate-800">{p.applicants}</span>
                        </p>

                        {/* Progress Bar Line */}
                        <div className="w-full max-w-lg bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-[#2563eb]' : 'bg-amber-500'}`} 
                            style={{ width: `${getProjectProgress(p)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Right Budget & Action Button */}
                      <div className="flex items-center space-x-5 shrink-0">
                        <div className="text-right">
                          <span className="font-extrabold text-[#2563eb] text-xl block">{p.budget}</span>
                          <span className="text-xs text-slate-400 block">{p.duration}</span>
                        </div>

                        {isHiring ? (
                          <button 
                            onClick={() => setActiveTab('applications')} 
                            className="px-5 py-2.5 bg-[#f59e0b] hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                          >
                            View Applications
                          </button>
                        ) : isCompleted ? (
                          <button 
                            onClick={() => setActiveTab('kanban')} 
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-300 cursor-pointer"
                          >
                            View Sprint
                          </button>
                        ) : (
                          <button 
                            onClick={() => setActiveTab('kanban')} 
                            className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
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
                        <h4 className={`font-bold text-base tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatTitle(p.title)}</h4>
                        
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

                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category: <span className="text-blue-400 font-semibold">{p.category}</span> • Required Skills: {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}</p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Posted: {p.postedDate} • Duration: {p.duration} • Applicants: <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{p.applicants || 4}</span></p>

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
              <p className="text-xs text-slate-400">Active contracts, performance tracking, and direct communication.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hiredFreelancers.map(hf => (
                <div key={hf.id} className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                        {hf.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{hf.name}</h4>
                        <p className="text-xs text-blue-400 font-semibold">{hf.title}</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 text-slate-400 pt-2 border-t border-slate-800/40">
                      <p>Active Project: <span className="text-slate-200 font-bold">{hf.project}</span></p>
                      <p>Hourly Rate: <span className="text-emerald-400 font-bold">{hf.rate}</span></p>
                      <p>Hired Date: <span className="text-slate-300">{hf.hiredDate}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-2">
                    <button 
                      onClick={() => setSelectedProfileFreelancer(hf)} 
                      className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center space-x-1"
                    >
                      <span>👤 View Profile & Reviews</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => { setSelectedChat(hf.name); setActiveTab('messages'); }} 
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        💬 Message
                      </button>
                      <button 
                        onClick={() => setActiveTab('kanban')} 
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        📌 View Sprint
                      </button>
                    </div>
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

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right mr-2">
                      <span className="font-extrabold text-blue-500 text-base block">{c.amount}</span>
                      <span className="text-[10px] text-slate-400 block">Total Agreed</span>
                    </div>

                    <button 
                      onClick={() => setToast({ message: `Downloading Contract Document ${c.id}.pdf...`, type: 'info' })}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      📄 Download Contract PDF
                    </button>
                    <button 
                      onClick={() => handleDeleteContract(c.id)}
                      className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      title="Remove contract agreement"
                    >
                      🗑️ Remove
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
                <p className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Stripe & Razorpay</p>
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
                        <td className={`py-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{py.type}</td>
                        <td className={`py-3 font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{py.amount}</td>
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
        {/* TAB 12: CLIENT PROFILE & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Client Profile & Settings</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage your enterprise public profile, company details, connected billing methods, and marketplace trust metrics.
              </p>
            </div>

            {/* 1. PROFILE HEADER CARD (TOP) */}
            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-blue-400/30">
                    TC
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-[#060e22] rounded-full flex items-center justify-center text-white text-xs font-bold" title="Online & Active">
                    ✓
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {clientProfile.displayName}
                    </h3>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span>🏷️</span>
                      <span>Enterprise Client</span>
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span>✓</span>
                      <span>Payment Verified (Stripe)</span>
                    </span>
                  </div>

                  <p className={`text-xs flex items-center space-x-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>📍 {clientProfile.location}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-semibold">{clientProfile.joinedDate}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditDisplayName(clientProfile.displayName);
                  setEditCompanyName(clientProfile.companyName);
                  setEditIndustry(clientProfile.industry);
                  setEditWebsite(clientProfile.website);
                  setEditDescription(clientProfile.description);
                  setShowEditProfileModal(true);
                }}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center space-x-2 shrink-0"
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </button>
            </div>

            {/* HIRING STATISTICS CARD */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 text-lg">
                  📈
                </div>
                <div>
                  <h3 className="font-bold text-base">Hiring Statistics</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Verified platform activity metrics and trust indicators.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Stat 1 */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">TOTAL SPENT</span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{clientProfile.totalSpent}</span>
                  <span className="text-xs text-slate-400 mt-1 block">Verified escrow payouts</span>
                </div>

                {/* Stat 2 */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">PROJECTS POSTED</span>
                  <span className="text-3xl font-extrabold text-blue-400 mt-1 block">{clientProjects.length || clientProfile.projectsPosted}</span>
                  <span className="text-xs text-slate-400 mt-1 block">100% hire rate on posted jobs</span>
                </div>

                {/* Stat 3 */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">ACTIVE HIRES</span>
                  <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{hiredFreelancers.length || clientProfile.activeHires}</span>
                  <span className="text-xs text-slate-400 mt-1 block">Currently assigned freelancers</span>
                </div>
              </div>
            </div>

            {/* 4. BILLING & ESCROW SETTINGS CARD */}
            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 text-lg">
                    💳
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Billing & Escrow Settings</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Connected escrow payment gateways & funding balance.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CURRENT ESCROW BALANCE</span>
                    <span className="text-lg font-extrabold text-amber-400">{clientProfile.escrowLocked}</span>
                    <span className="text-[10px] text-slate-400 block">Locked in active milestone hold</span>
                  </div>

                  <div className="border-l border-slate-800 pl-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CONNECTED METHOD</span>
                    <span className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>💳</span>
                      <span>{clientProfile.paymentMethod}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">Default Payment Method</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setToast({ message: 'Billing & Invoice Management portal opened.', type: 'info' })}
                className="w-full md:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Manage Billing & Invoices
              </button>
            </div>

            {/* 5. RECENT REVIEWS RECEIVED CARD */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 text-lg">
                    ⭐
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Recent Reviews Received</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ratings left by freelancers to build client reputation on FreeMatch AI.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-extrabold">
                  5.0 ★ Client Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        LK
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Lana Kim</h4>
                        <p className="text-[10px] text-blue-400 font-semibold">Cybersecurity Audit Specialist</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs font-bold">★★★★★ 5.0</span>
                  </div>
                  <p className={`text-xs italic p-3 rounded-xl border font-medium ${isDark ? 'bg-[#040919] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                    "Great enterprise client to work with! Clear requirements and instantaneous escrow release upon milestone verification."
                  </p>
                  <span className="text-[10px] text-slate-400 block">Oct 20, 2023 • Verified Milestone Release</span>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        AM
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Alex Mercer</h4>
                        <p className="text-[10px] text-blue-400 font-semibold">Senior PyTorch Architect</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs font-bold">★★★★★ 5.0</span>
                  </div>
                  <p className={`text-xs italic p-3 rounded-xl border font-medium ${isDark ? 'bg-[#040919] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                    "Clear sprint roadmap and fast feedback loops. Pleasure working with Abhilash K K on PyTorch model optimization."
                  </p>
                  <span className="text-[10px] text-slate-400 block">Oct 26, 2023 • Verified Milestone Release</span>
                </div>
              </div>
            </div>

          </div>
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
                <p className="text-xs text-slate-400 mt-0.5">Update public company profile and display credentials.</p>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Display Name</label>
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
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Company Name</label>
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
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Industry</label>
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
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Website</label>
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
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Company Description / About Us</label>
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* FREELANCER PUBLIC PROFILE & REVIEWS MODAL */}
      {selectedProfileFreelancer && (() => {
        const flName = selectedProfileFreelancer.name || selectedProfileFreelancer.freelancer || selectedProfileFreelancer.freelancerName || 'Alex Mercer';
        const flReviews = reviews.filter(r => {
          const revName = (r.reviewee || '').toLowerCase();
          const curName = flName.toLowerCase();
          const firstWord = curName.split(' ')[0];
          return revName.includes(curName) || revName.includes(firstWord) || curName.includes(revName);
        });
        const avgScore = flReviews.length > 0
          ? (flReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / flReviews.length).toFixed(1)
          : (selectedProfileFreelancer.rating || '4.9');

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`p-6 sm:p-8 rounded-3xl max-w-2xl w-full border shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 ${
              isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg">
                    {selectedProfileFreelancer.avatar || flName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold">{flName}</h3>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">✓ Verified Pro</span>
                    </div>
                    <p className="text-xs text-blue-400 font-semibold mt-0.5">{selectedProfileFreelancer.title || 'Senior Full Stack & AI Specialist'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedProfileFreelancer.rate || '$75/hr'} • Active Contract: {selectedProfileFreelancer.project || 'AI Pipeline Optimization'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProfileFreelancer(null)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-[#040919] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Overall Rating</p>
                  <p className="text-lg font-extrabold text-amber-400 mt-0.5">★ {avgScore} / 5.0</p>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-[#040919] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Verified Reviews</p>
                  <p className="text-lg font-extrabold text-blue-400 mt-0.5">{flReviews.length} Reviews</p>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1 ${isDark ? 'bg-[#040919] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Job Success</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-0.5">100% Score</p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm border-b border-slate-800/40 pb-2">Submitted Client Reviews ({flReviews.length})</h4>
                {flReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews submitted for {flName} yet.</p>
                ) : (
                  <div className="space-y-3">
                    {flReviews.map(rv => (
                      <div key={rv.id} className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-400">{rv.reviewer} <span className="text-slate-400 font-normal">(Project: {rv.projectTitle})</span></span>
                          <span className="text-amber-400 font-bold">{'★'.repeat(rv.rating || 5)} ({rv.rating}/5)</span>
                        </div>
                        <p className="text-xs italic text-slate-300 font-medium">"{rv.comment}"</p>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Date: {rv.date}</span>
                          <span>💬 Comm: {rv.comm || 5}★ • 💻 Quality: {rv.code || 5}★ • ⏱️ Deadline: {rv.deadline || 5}★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button onClick={() => setSelectedProfileFreelancer(null)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer">Close Profile</button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ClientDashboard;
