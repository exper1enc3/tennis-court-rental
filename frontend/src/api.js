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
  getCourt: (courtId) => request(`/courts/${courtId}`, { headers: { Authorization: "" } }),
  listMyBookings: () => request("/me/bookings"),
  getMyBooking: (bookingId) => request(`/me/bookings/${bookingId}`),
  getProfile: () => request("/me/profile"),
  updateProfile: (payload) => request("/me/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  requestDataDeletion: () => request("/me/profile/request-data-deletion", { method: "POST", body: "{}" }),
  listAdminUsers: () => request("/admin/users"),
  createAdminUser: (payload) => request("/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  updateAdminUser: (userId, payload) => request(`/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAdminUser: (userId) => request(`/admin/users/${userId}`, { method: "DELETE" }),
  listRoles: () => request("/admin/roles"),
  createRole: (payload) => request("/admin/roles", { method: "POST", body: JSON.stringify(payload) }),
  deleteRole: (roleId) => request(`/admin/roles/${roleId}`, { method: "DELETE" }),
  listPolicies: () => request("/admin/policies"),
  createPolicy: (payload) => request("/admin/policies", { method: "POST", body: JSON.stringify(payload) }),
  updatePolicy: (policyId, payload) => request(`/admin/policies/${policyId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deletePolicy: (policyId) => request(`/admin/policies/${policyId}`, { method: "DELETE" })
};