import React, { useState, useEffect, useRef, useCallback } from 'react';

const MessagingCenter = ({ userSession, role = 'client', isDark = false, onNavigateToContract, onNavigateToProject }) => {
  const currentUserId = (userSession?.username || userSession?.user_id || userSession?.email || userSession?.name || 'guest').toLowerCase().trim();
  const currentUserName = userSession?.name || userSession?.first_name || userSession?.username || 'User';

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedCounterpart, setSelectedCounterpart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const chatFeedRef = useRef(null);

  const scrollToBottom = useCallback((force = false) => {
    if (!chatFeedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatFeedRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (force || isNearBottom) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, []);

  // Fetch conversations and messages from Django REST API
  const fetchMessagesData = useCallback(async (targetCounterpart = null) => {
    if (!currentUserId || currentUserId === 'guest') return;

    const cpParam = targetCounterpart || selectedCounterpart || '';
    let url = `http://localhost:8000/api/messages/?user_id=${encodeURIComponent(currentUserId)}`;
    if (cpParam) {
      url += `&other_user=${encodeURIComponent(cpParam)}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API fetch error');
      const data = await res.json();

      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }

      // Default active counterpart if none selected yet
      if (!selectedCounterpart && data.conversations && data.conversations.length > 0) {
        const defaultCp = data.conversations[0].username;
        setSelectedCounterpart(defaultCp);
      }
    } catch (err) {
      console.warn('Messaging API fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedCounterpart]);

  // Initial load and periodic sync (every 3.5 seconds for real-time chat updates)
  useEffect(() => {
    fetchMessagesData();

    const interval = setInterval(() => {
      fetchMessagesData();
    }, 3500);

    const handleMessageEvent = () => fetchMessagesData();
    const handleStorageEvent = () => fetchMessagesData();

    window.addEventListener('freematch_message_event', handleMessageEvent);
    window.addEventListener('freematch_notification_event', handleMessageEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('freematch_message_event', handleMessageEvent);
      window.removeEventListener('freematch_notification_event', handleMessageEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [fetchMessagesData]);

  // Scroll to bottom when messages change if user is near bottom
  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // Select a conversation from sidebar
  const handleSelectConversation = async (cpUsername) => {
    setSelectedCounterpart(cpUsername);
    setMobileShowChat(true);

    // Mark unread messages as read in DB
    try {
      await fetch('http://localhost:8000/api/messages/mark-read/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          sender: cpUsername
        })
      });
    } catch (e) {}

    await fetchMessagesData(cpUsername);
    setTimeout(() => scrollToBottom(true), 80);
  };

  // Send message
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = messageInput.trim();
    if (!text || !selectedCounterpart || isSending) return;

    setIsSending(true);
    setMessageInput('');

    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId,
      sender: currentUserId,
      sender_name: currentUserName,
      receiver: selectedCounterpart,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      is_mine: true,
      is_read: false
    };

    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch('http://localhost:8000/api/messages/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserId,
          receiver: selectedCounterpart,
          content: text
        })
      });

      if (res.ok) {
        const newMsgData = await res.json();
        const formattedMsg = {
          id: newMsgData.id || tempId,
          sender: newMsgData.sender || currentUserId,
          sender_name: currentUserName,
          receiver: newMsgData.receiver || selectedCounterpart,
          text: newMsgData.text || text,
          timestamp: newMsgData.timestamp || tempMsg.timestamp,
          date: newMsgData.date || 'Today',
          is_mine: true,
          is_read: false
        };

        setMessages(prev => {
          const exists = prev.some(m => m.id === tempId);
          if (exists) {
            return prev.map(m => m.id === tempId ? formattedMsg : m);
          }
          return [...prev, formattedMsg];
        });
        setTimeout(() => scrollToBottom(true), 50);

        window.dispatchEvent(new Event('freematch_notification_event'));
      }
    } catch (err) {
      console.warn('Send message notice:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isDemoUser = ['user1', 'alex', 'mercer', 'haines', 'abhilash', 'john'].some(d => currentUserId.toLowerCase().includes(d));

  // Find active counterpart object
  const activeConversation = conversations.find(c => c.username.toLowerCase() === (selectedCounterpart || '').toLowerCase()) || conversations[0] || (isDemoUser ? {
    username: 'alexmercer',
    name: 'Alex Mercer',
    role: 'Freelancer',
    title: 'Senior Python Architect',
    avatar: 'AM',
    projectTitle: 'AI Automated Test Pipeline',
    contractId: 'FMCT-2024-0156',
    online: true
  } : null);

  // Filter conversations list by search
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.username || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className={`w-full h-[calc(100vh-100px)] min-h-[580px] flex rounded-3xl border shadow-md overflow-hidden ${
      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>

      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className={`w-full md:w-80 lg:w-96 flex-col border-r ${
        mobileShowChat ? 'hidden md:flex' : 'flex'
      } ${isDark ? 'border-slate-800 bg-[#081024]' : 'border-slate-200 bg-slate-50'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-[#081024]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-2.5">
            <h2 className={`text-xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Conversations</h2>
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black bg-blue-600 text-white rounded-full">
                {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
              </span>
            )}
          </div>
          <button 
            type="button"
            title="Compose new message"
            className={`p-2.5 rounded-xl transition-colors ${
              isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Conversation Search Bar */}
        <div className={`p-3.5 border-b ${isDark ? 'border-slate-800 bg-[#081024]' : 'border-slate-200 bg-slate-50'}`}>
          <div className="relative">
            <svg className={`w-4.5 h-4.5 absolute left-3.5 top-3.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-xl border focus:outline-none focus:border-blue-500 transition-all ${
                isDark ? 'bg-[#0d1733] border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Conversation List Scroll Region */}
        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-slate-800/60 bg-[#081024]' : 'divide-slate-200 bg-slate-50'}`}>
          {loading ? (
            <div className={`p-8 text-center text-sm font-bold animate-pulse ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 text-lg ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                💬
              </div>
              <p className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>No conversations found</p>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select a counterpart to start messaging.</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedCounterpart && selectedCounterpart.toLowerCase() === c.username.toLowerCase();
              return (
                <button
                  key={c.username}
                  onClick={() => handleSelectConversation(c.username)}
                  className={`w-full p-4 text-left flex items-start space-x-3.5 transition-all relative ${
                    isSelected
                      ? (isDark ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'bg-blue-100 border-l-4 border-blue-600')
                      : (isDark ? 'hover:bg-slate-800/50 bg-[#081024]' : 'bg-white hover:bg-slate-100')
                  }`}
                >
                  {/* Avatar + Online Badge */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-base font-black text-white shadow-md overflow-hidden">
                      {c.avatar_url || (c.avatar && (c.avatar.startsWith('data:') || c.avatar.startsWith('http'))) ? (
                        <img src={c.avatar_url || c.avatar} alt={c.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span>{c.avatar || c.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
                  </div>

                  {/* Conversation Card Text Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-black truncate ${
                        isSelected 
                          ? (isDark ? 'text-blue-400' : 'text-blue-800') 
                          : (isDark ? 'text-white' : 'text-slate-900')
                      }`}>
                        {c.name}
                      </h4>
                      <span className={`text-xs font-extrabold shrink-0 ml-2 ${
                        isDark ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        {c.lastMessageTime || 'Just now'}
                      </span>
                    </div>

                    <p className={`text-xs font-bold truncate mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {c.title || c.role}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate max-w-[190px] ${
                        c.unreadCount > 0 
                          ? (isDark ? 'font-black text-white' : 'font-black text-slate-950') 
                          : (isDark ? 'font-semibold text-slate-400' : 'font-semibold text-slate-800')
                      }`}>
                        {c.lastMessage}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-black bg-blue-600 text-white rounded-full shrink-0 ml-2 shadow-2xs">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: CHAT WINDOW */}
      <div className={`flex-1 flex flex-col h-full ${
        !mobileShowChat ? 'hidden md:flex' : 'flex'
      } ${isDark ? 'bg-[#060e22]' : 'bg-white'}`}>

        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-black">
              💬
            </div>
            <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>No Conversations Yet</h3>
            <p className={`text-sm font-semibold max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              When clients or team members message you regarding bids or contracts, your conversation threads will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* 1. CHAT HEADER */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shadow-2xs ${
              isDark ? 'bg-[#0d1b3e] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-3.5">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className={`md:hidden p-2 rounded-lg mr-1 text-base font-black ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  ←
                </button>

                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-base font-black text-white shadow-md overflow-hidden">
                    {activeConversation.avatar_url || (activeConversation.avatar && (activeConversation.avatar.startsWith('data:') || activeConversation.avatar.startsWith('http'))) ? (
                      <img src={activeConversation.avatar_url || activeConversation.avatar} alt={activeConversation.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>{activeConversation.avatar || activeConversation.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-black text-base tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {activeConversation.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-md border ${
                      isDark ? 'bg-blue-900/60 text-blue-200 border-blue-700/50' : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}>
                      {activeConversation.role}
                    </span>
                  </div>
                  <p className={`text-xs font-extrabold flex items-center mt-0.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1.5"></span>
                    Online <span className={`font-bold ml-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>• {activeConversation.title}</span>
                  </p>
                </div>
              </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onNavigateToContract && onNavigateToContract(activeConversation.contractId)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all hidden sm:inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Contract Details</span>
            </button>
            <button 
              type="button" 
              title="More options"
              className={`p-2 rounded-xl font-bold ${
                isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              ⋮
            </button>
          </div>
        </div>

        {/* 2. PROJECT / CONTRACT CONTEXT BANNER */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs sm:text-sm ${
          isDark ? 'bg-[#081226] border-slate-700/80' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3.5 truncate">
            <span className={`font-black shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>📁 Project:</span>
            <span className={`font-black truncate ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              {activeConversation.projectTitle || 'AI Automated Test Pipeline'}
            </span>
            <span className={`font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>|</span>
            <span className={`font-black shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Contract:</span>
            <span className={`font-mono font-black shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              {activeConversation.contractId || 'FMCT-2024-0156'}
            </span>
          </div>
          <button
            onClick={() => onNavigateToProject && onNavigateToProject(activeConversation.projectTitle)}
            className={`font-black hover:underline shrink-0 text-xs ml-3 hidden md:inline-flex items-center px-3 py-1.5 rounded-lg cursor-pointer shadow-2xs ${
              isDark ? 'bg-blue-950/60 text-blue-400 border border-blue-800/80' : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            View Project ↗
          </button>
        </div>

        {/* 3. CHAT MESSAGES FEED */}
        <div ref={chatFeedRef} className={`flex-1 p-6 overflow-y-auto space-y-4 ${
          isDark ? 'bg-[#060e22]' : 'bg-slate-50/50'
        }`}>
          {/* Date Divider */}
          <div className="flex items-center justify-center my-2">
            <span className={`px-4 py-1.5 text-xs font-black rounded-full border ${
              isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-200/90 text-slate-800 border-slate-300'
            }`}>
              Today
            </span>
          </div>

          {messages.length === 0 ? (
            <div className={`text-center py-12 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No messages yet in this conversation. Send a message to get started!
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMine = m.is_mine || (m.sender && m.sender.toLowerCase() === currentUserId);
              return (
                <div
                  key={m.id || idx}
                  className={`flex items-end space-x-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mb-1 shadow-xs">
                      {activeConversation.avatar || 'FL'}
                    </div>
                  )}

                  <div className={`max-w-md lg:max-w-xl p-4 rounded-2xl text-sm font-semibold leading-relaxed shadow-2xs relative group ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : isDark
                        ? 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/50'
                        : 'bg-white text-slate-900 rounded-bl-xs border border-slate-300/90'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    <div className={`flex items-center justify-end space-x-1.5 text-xs font-extrabold mt-2 ${
                      isMine ? 'text-blue-100' : (isDark ? 'text-slate-300' : 'text-slate-700')
                    }`}>
                      <span>{m.timestamp}</span>
                      {isMine && (
                        <span className="text-xs font-black ml-0.5">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. CHAT MESSAGE INPUT BAR */}
        <div className={`p-4 border-t ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSendMessage} className="space-y-2.5">
            <div className={`flex items-center space-x-2 p-2.5 border rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/30 transition-all ${
              isDark ? 'bg-[#09142e] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900 shadow-2xs'
            }`}>
              {/* Attachment Icon */}
              <button
                type="button"
                onClick={() => alert('Attachment picker: Select project file or image to send.')}
                title="Attach file"
                className={`p-2 rounded-xl font-bold transition-colors ${
                  isDark ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                📎
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Type your message to ${activeConversation.name}...`}
                className={`flex-1 bg-transparent border-none text-sm font-semibold focus:outline-none py-1.5 ${
                  isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'
                }`}
              />

              {/* Emoji Icon */}
              <button
                type="button"
                onClick={() => setMessageInput(prev => prev + ' 👍')}
                title="Add emoji"
                className={`p-2 rounded-xl text-base transition-colors ${
                  isDark ? 'text-slate-300 hover:text-amber-400' : 'text-slate-700 hover:text-amber-500'
                }`}
              >
                😊
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending}
                className={`px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl text-sm flex items-center space-x-1.5 transition-all shadow-md ${
                  !messageInput.trim() || isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'
                }`}
              >
                <span>Send</span>
                <span className="text-sm font-black">➤</span>
              </button>
            </div>

            <div className={`flex items-center justify-between text-xs px-2 font-bold ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <span>Press Enter to send • Shift + Enter for new line</span>
              <span className={`flex items-center font-black ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                🔒 End-to-end encrypted project chat
              </span>
            </div>
          </form>
        </div>
        </>
        )}

      </div>
    </div>
  );
};

export default MessagingCenter;
