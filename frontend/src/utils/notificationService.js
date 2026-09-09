// Real-time Notification Service for FreeMatch AI
const API_BASE = 'http://localhost:8000/api/notifications';

export const fetchNotifications = async (userId = '') => {
  try {
    const url = userId ? `${API_BASE}/?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Notifications API fetch notice:', err);
    return [];
  }
};

export const createNotification = async (notifData) => {
  try {
    const res = await fetch(`${API_BASE}/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifData)
    });
    const data = await res.json();
    
    // Dispatch real-time cross-component event
    window.dispatchEvent(new CustomEvent('freematch_notification_event', {
      detail: data.notification || notifData
    }));
    
    return data;
  } catch (err) {
    console.warn('Create Notification notice:', err);
    // Fallback local dispatch
    window.dispatchEvent(new CustomEvent('freematch_notification_event', {
      detail: { ...notifData, id: Date.now(), is_read: false, created_at: new Date().toISOString() }
    }));
  }
};

export const markNotificationRead = async (id) => {
  try {
    await fetch(`${API_BASE}/${id}/read/`, { method: 'POST' });
    window.dispatchEvent(new CustomEvent('freematch_notification_event', { detail: { action: 'read', id } }));
  } catch (err) {
    console.warn('Mark read notice:', err);
  }
};

export const markAllNotificationsRead = async (userId = '') => {
  try {
    await fetch(`${API_BASE}/read-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    window.dispatchEvent(new CustomEvent('freematch_notification_event', { detail: { action: 'read_all' } }));
  } catch (err) {
    console.warn('Mark all read notice:', err);
  }
};

export const deleteNotification = async (id) => {
  try {
    await fetch(`${API_BASE}/${id}/delete/`, { method: 'POST' });
    window.dispatchEvent(new CustomEvent('freematch_notification_event', { detail: { action: 'delete', id } }));
  } catch (err) {
    console.warn('Delete notification notice:', err);
  }
};

export const clearAllNotifications = async (userId = '') => {
  try {
    await fetch(`${API_BASE}/clear-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    window.dispatchEvent(new CustomEvent('freematch_notification_event', { detail: { action: 'clear_all' } }));
  } catch (err) {
    console.warn('Clear all notifications notice:', err);
  }
};

// Format relative time string e.g. "2 mins ago", "1 hour ago", "Just now"
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
