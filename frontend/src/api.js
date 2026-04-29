const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

let accessToken = "";

export function setAccessToken(token) {
  accessToken = token;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  health: () => request("/health", { headers: { Authorization: "" } }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  listCourts: () => request("/courts", { headers: { Authorization: "" } }),
  getCourt: (courtId) => request(`/courts/${courtId}`, { headers: { Authorization: "" } })
};