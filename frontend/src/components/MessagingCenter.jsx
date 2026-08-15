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
    <div className={`w-full h-[calc(100vh-100px)] min-h-[580px] flex rounded-3xl border shadow-sm overflow-hidden ${
      isDark ? 'bg-[#060e22] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>

      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className={`w-full md:w-80 lg:w-96 flex-col border-r ${
        mobileShowChat ? 'hidden md:flex' : 'flex'
      } ${isDark ? 'border-slate-800 bg-[#081024]' : 'border-slate-100 bg-[#f8fafc]'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold tracking-tight">Conversations</h2>
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
              </span>
            )}
          </div>
          <button 
            type="button"
            title="Compose new message"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Conversation Search Bar */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 transition-all ${
                isDark ? 'bg-[#0d1733] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Conversation List Scroll Region */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
                💬
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No conversations found</p>
              <p className="text-[11px] text-slate-400 mt-1">Select a counterpart to start messaging.</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedCounterpart && selectedCounterpart.toLowerCase() === c.username.toLowerCase();
              return (
                <button
                  key={c.username}
                  onClick={() => handleSelectConversation(c.username)}
                  className={`w-full p-3.5 text-left flex items-start space-x-3 transition-all relative ${
                    isSelected
                      ? (isDark ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'bg-blue-50/80 border-l-4 border-blue-600')
                      : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                  }`}
                >
                  {/* Avatar + Online Badge */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-xs overflow-hidden">
                      {c.avatar_url || (c.avatar && (c.avatar.startsWith('data:') || c.avatar.startsWith('http'))) ? (
                        <img src={c.avatar_url || c.avatar} alt={c.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span>{c.avatar || c.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
                  </div>

                  {/* Conversation Card Text Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {c.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                        {c.lastMessageTime || 'Just now'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mb-1">
                      {c.title || c.role}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate max-w-[180px] ${
                        c.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {c.lastMessage}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full shrink-0 ml-2 shadow-xs">
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl font-bold">
              💬
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Conversations Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              When clients or team members message you regarding bids or contracts, your conversation threads will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* 1. CHAT HEADER */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0d1b3e] shadow-2xs">
              <div className="flex items-center space-x-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                >
                  ←
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-xs overflow-hidden">
                    {activeConversation.avatar_url || (activeConversation.avatar && (activeConversation.avatar.startsWith('data:') || activeConversation.avatar.startsWith('http'))) ? (
                      <img src={activeConversation.avatar_url || activeConversation.avatar} alt={activeConversation.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span>{activeConversation.avatar || activeConversation.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                      {activeConversation.name}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded-md border border-blue-200 dark:border-blue-700/50">
                      {activeConversation.role}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-500 font-extrabold flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5"></span>
                    Online <span className="text-slate-700 dark:text-slate-300 font-semibold ml-1.5">• {activeConversation.title}</span>
                  </p>
                </div>
              </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateToContract && onNavigateToContract(activeConversation.contractId)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all hidden sm:inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Contract Details</span>
            </button>
            <button 
              type="button" 
              title="More options"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              ⋮
            </button>
          </div>
        </div>

        {/* 2. PROJECT / CONTRACT CONTEXT BANNER */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-[#081226] border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3 truncate">
            <span className="text-slate-700 dark:text-slate-300 font-extrabold shrink-0">📁 Project:</span>
            <span className="font-black text-slate-900 dark:text-white truncate">
              {activeConversation.projectTitle || 'AI Automated Test Pipeline'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-700 dark:text-slate-300 font-extrabold shrink-0">Contract:</span>
            <span className="font-mono text-slate-900 dark:text-amber-400 font-extrabold shrink-0">
              {activeConversation.contractId || 'FMCT-2024-0156'}
            </span>
          </div>
          <button
            onClick={() => onNavigateToProject && onNavigateToProject(activeConversation.projectTitle)}
            className="text-blue-600 dark:text-blue-400 font-black hover:underline shrink-0 text-xs ml-3 hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 cursor-pointer"
          >
            View Project ↗
          </button>
        </div>

        {/* 3. CHAT MESSAGES FEED */}
        <div ref={chatFeedRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-[#060e22]">
          {/* Date Divider */}
          <div className="flex items-center justify-center my-2">
            <span className="px-3 py-1 bg-slate-200/60 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400 rounded-full">
              Today
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No messages yet in this conversation. Send a message to get started!
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMine = m.is_mine || (m.sender && m.sender.toLowerCase() === currentUserId);
              return (
                <div
                  key={m.id || idx}
                  className={`flex items-end space-x-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                      {activeConversation.avatar || 'FL'}
                    </div>
                  )}

                  <div className={`max-w-md lg:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative group ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : isDark
                        ? 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/50'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    <div className={`flex items-center justify-end space-x-1 text-[9px] mt-1.5 ${
                      isMine ? 'text-blue-100 opacity-90' : 'text-slate-400'
                    }`}>
                      <span>{m.timestamp}</span>
                      {isMine && (
                        <span className="text-[11px] font-bold ml-0.5">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. CHAT MESSAGE INPUT BAR */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#060e22]">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className={`flex items-center space-x-2 p-2 border rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/30 transition-all ${
              isDark ? 'bg-[#09142e] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              {/* Attachment Icon */}
              <button
                type="button"
                onClick={() => alert('Attachment picker: Select project file or image to send.')}
                title="Attach file"
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl"
              >
                📎
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Type your message to ${activeConversation.name}...`}
                className="flex-1 bg-transparent border-none text-xs focus:outline-none placeholder-slate-400 py-1"
              />

              {/* Emoji Icon */}
              <button
                type="button"
                onClick={() => setMessageInput(prev => prev + ' 👍')}
                title="Add emoji"
                className="p-2 text-slate-400 hover:text-amber-500 transition-colors rounded-xl text-sm"
              >
                😊
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending}
                className={`px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs ${
                  !messageInput.trim() || isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'
                }`}
              >
                <span>Send</span>
                <span className="text-sm">➤</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
              <span>Press Enter to send • Shift + Enter for new line</span>
              <span className="flex items-center text-emerald-500 font-semibold">
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
