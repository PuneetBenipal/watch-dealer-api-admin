import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { listTickets, getTicket, patchTicket, addReply, bulkTickets } from "../../apis/adminSupportApi";

export const fetchTickets = createAsyncThunk(
    "adminSupport/fetchTickets",
    async (params, { rejectWithValue }) => {
        try { return await listTickets(params); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "fetch_failed" }); }
    }
);

export const fetchTicket = createAsyncThunk(
    "adminSupport/fetchTicket",
    async (id, { rejectWithValue }) => {
        try { return await getTicket(id); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "fetch_failed" }); }
    }
);

export const updateTicket = createAsyncThunk(
    "adminSupport/updateTicket",
    async ({ id, payload }, { rejectWithValue }) => {
        try { return await patchTicket(id, payload); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "update_failed" }); }
    }
);

export const sendReply = createAsyncThunk(
    "adminSupport/sendReply",
    async ({ id, payload }, { dispatch, rejectWithValue }) => {
        try {
            await addReply(id, payload);
            // refresh the ticket after sending
            const data = await getTicket(id);
            return data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { error: "reply_failed" });
        }
    }
);

export const bulkAction = createAsyncThunk(
    "adminSupport/bulkAction",
    async (payload, { rejectWithValue }) => {
        try { return await bulkTickets(payload); }
        catch (e) { return rejectWithValue(e?.response?.data || { error: "bulk_failed" }); }
    }
);

const initialState = {
    // list
    items: [],
    total: 0,
    loading: false,
    error: null,
    // query state (kept in slice for easy persistence)
    q: "",
    status: undefined,
    priority: undefined,
    assignee: undefined,
    category: undefined,
    page: 1,
    limit: 20,
    sort: "updatedAt:-1",

    // drawer
    ticket: null,
    ticketLoading: false,
    sending: false,
    selectedRowKeys: [],
};

const adminSupportSlice = createSlice({
    name: "adminSupport",
    initialState,
    reducers: {
        setFilters(state, { payload }) {
            Object.assign(state, payload);
            // when filters change, reset to page 1 unless explicitly provided
            if (payload.page === undefined) state.page = 1;
        },
        setSelected(state, { payload }) { state.selectedRowKeys = payload; },
        clearTicket(state) { state.ticket = null; },
        setQuery(state, { payload }) { state.q = payload; state.page = 1; },
    },
    extraReducers: (b) => {
        b.addCase(fetchTickets.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchTickets.fulfilled, (s, { payload }) => {
            s.loading = false;
            s.items = payload.items || [];
            s.total = payload.total || 0;
        });
        b.addCase(fetchTickets.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

        b.addCase(fetchTicket.pending, (s) => { s.ticketLoading = true; s.ticket = s.ticket || null; });
        b.addCase(fetchTicket.fulfilled, (s, { payload }) => { s.ticketLoading = false; s.ticket = payload; });
        b.addCase(fetchTicket.rejected, (s, { payload }) => { s.ticketLoading = false; s.error = payload; });

        b.addCase(updateTicket.fulfilled, (s, { payload }) => {
            // update row in list
            const idx = s.items.findIndex(r => r._id === payload._id);
            if (idx !== -1) s.items[idx] = { ...s.items[idx], ...payload };
            // also patch opened ticket
            if (s.ticket?._id === payload._id) s.ticket = { ...s.ticket, ...payload };
        });

        b.addCase(sendReply.pending, (s) => { s.sending = true; });
        b.addCase(sendReply.fulfilled, (s, { payload }) => {
            s.sending = false;
            s.ticket = payload; // refreshed ticket with messages
        });
        b.addCase(sendReply.rejected, (s) => { s.sending = false; });

        b.addCase(bulkAction.fulfilled, (s) => { s.selectedRowKeys = []; });
    }
});

export const { setFilters, setSelected, clearTicket, setQuery } = adminSupportSlice.actions;
export default adminSupportSlice.reducer;
