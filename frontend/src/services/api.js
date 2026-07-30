const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    if (response.ok) {
      const data = await response.json();
      return { online: true, data };
    }
    return { online: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

export const apiLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const apiRegister = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
