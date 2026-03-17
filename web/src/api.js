// web/src/api.js
const API_BASE = 'http://localhost:5000'; 

export const authApi = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Signup failed');
    return data;
  },

  signin: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Invalid email or password');
    return data;
  }
};

