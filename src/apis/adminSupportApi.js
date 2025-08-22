import http from "../services/http";

// List tickets (admin)
export const listTickets = (params) =>
    http.get("/superadmin/support/tickets", { params }).then(r => r.data);

// Get one ticket (+messages)
export const getTicket = (id) =>
    http.get(`/superadmin/support/tickets/${id}`).then(r => r.data);

// Update ticket fields
export const patchTicket = (id, payload) =>
    http.patch(`/superadmin/support/tickets/${id}`, payload).then(r => r.data);

// Add reply / internal note
export const addReply = (id, payload) =>
    http.post(`/superadmin/support/tickets/${id}/replies`, payload).then(r => r.data);

// Bulk actions
export const bulkTickets = (payload) =>
    http.post(`/superadmin/support/tickets/bulk`, payload).then(r => r.data);
