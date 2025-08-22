import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

export const fetchTickets = createAsyncThunk(
    "tickets/fetch",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, pageSize = 10, q, status, priority, assignee, companyId, start, end } = params;
            const res = await http.get("/superadmin/support/tickets", {
                params: { page, limit: pageSize, q, status, priority, assignee, companyId, start, end },
            });
            const p = res.data || {};
            const items = p.data || p.items || [];
            return {
                items,
                total: p.total ?? p.count ?? items.length,
                page: p.page ?? page,
                pageSize: p.pageSize ?? p.limit ?? pageSize,
            };
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

export const updateTicket = createAsyncThunk(
    "tickets/update",
    async ({ id, patch }, { rejectWithValue }) => {
        try {
            const res = await http.patch(`/superadmin/support/tickets/${id}`, patch);
            return res.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

const tickets = createSlice({
    name: "tickets",
    initialState: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        status: "idle",
        error: null,
        filters: { q: "", status: undefined, priority: undefined, assignee: undefined, companyId: undefined },
        updating: {},
    },
    reducers: {
        setTicketFilters(s, a) { s.filters = { ...s.filters, ...a.payload }; },
    },
    extraReducers: (b) => {
        b.addCase(fetchTickets.pending, (s, a) => {
            const arg = a.meta.arg || {};
            if (arg.page) s.page = arg.page;
            if (arg.pageSize) s.pageSize = arg.pageSize;
            s.status = "loading"; s.error = null;
        });
        b.addCase(fetchTickets.fulfilled, (s, a) => {
            s.items = a.payload.items;
            s.total = a.payload.total;
            s.page = a.payload.page;
            s.pageSize = a.payload.pageSize;
            s.status = "succeeded";
        });
        b.addCase(fetchTickets.rejected, (s, a) => {
            s.status = "failed"; s.error = a.payload?.message || "Failed to load tickets";
        });

        b.addCase(updateTicket.pending, (s, a) => {
            const { id } = a.meta.arg;
            s.updating[id] = true;
        });
        b.addCase(updateTicket.fulfilled, (s, a) => {
            const updated = a.payload;
            const id = updated._id || updated.id;
            const i = s.items.findIndex((x) => (x._id || x.id) === id);
            if (i >= 0) s.items[i] = { ...s.items[i], ...updated };
            s.updating[id] = false;
        });
        b.addCase(updateTicket.rejected, (s, a) => {
            const { id } = a.meta.arg;
            s.updating[id] = false;
            s.error = a.payload?.message || "Failed to update ticket";
        });
    },
});

export const { setTicketFilters } = tickets.actions;
export default tickets.reducer;
