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
