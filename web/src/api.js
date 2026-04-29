<<<<<<< HEAD
 createCourt: (payload) => request("/courts", { method: "POST", body: JSON.stringify(payload) }),
  updateCourt: (courtId, payload) => request(`/courts/${courtId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteCourt: (courtId) => request(`/courts/${courtId}`, { method: "DELETE" }),
  getAvailability: (courtId, start) =>
    request(`/courts/${courtId}/availability?start=${encodeURIComponent(start)}`, {
      headers: { Authorization: "" }
    }),
  holdBooking: (payload) => request("/bookings/hold", { method: "POST", body: JSON.stringify(payload) }),
  confirmBooking: (payload) => request("/bookings/confirm", { method: "POST", body: JSON.stringify(payload) }),
  cancelBooking: (bookingId, payload) =>
    request(`/bookings/${bookingId}/cancel`, { method: "POST", body: JSON.stringify(payload) }),
  listFavorites: () => request("/me/favorites"),
  addFavorite: (payload) => request("/me/favorites", { method: "POST", body: JSON.stringify(payload) }),
  removeFavorite: (courtId) => request(`/me/favorites/${courtId}`, { method: "DELETE" }),
  createReview: (payload) => request("/me/reviews", { method: "POST", body: JSON.stringify(payload) }),
  messageModerator: (payload) => request("/me/moderator-message", { method: "POST", body: JSON.stringify(payload) }),
  listPublicReviews: (courtId) => request(`/me/reviews/public/${courtId}`, { headers: { Authorization: "" } }),
  listBookings: () => request("/admin/bookings"),
  sendNotification: (payload) =>
    request("/dashboard/notifications/email", { method: "POST", body: JSON.stringify(payload) }),
  replayEventLog: () => request("/admin/event-log/replay", { method: "POST", body: "{}" })
=======
// web/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

>>>>>>> 5dcc5ae929c43ff8e45a09faf6b0ee8136799419
