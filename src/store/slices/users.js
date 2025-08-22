import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

export const fetchUsers = createAsyncThunk("users/fetch", async (params = {}, { rejectWithValue }) => {
    try {
        const { page = 1, pageSize = 10, q, status, role } = params;
        const res = await http.get("/superadmin/users", { params: { page, limit: pageSize, q, status, role } });
        const p = res.data || {};
        const items = p.data || p.items || [];
        return { items, total: p.total ?? items.length, page: p.page ?? page, pageSize: p.pageSize ?? pageSize };
    } catch (e) { return rejectWithValue(e?.response?.data || { message: e.message }); }
});

export const updateUser = createAsyncThunk("users/update", async ({ id, patch }, { rejectWithValue }) => {
    console.log("sdfjasjkdfhasldkfj", id,'><><',patch)
    try { const r = await http.patch(`/superadmin/users/${id}`, patch); console.log(r, 'r =='); return r.data; }
    catch (e) { return rejectWithValue(e?.response?.data || { message: e.message }); }
});

export const inviteUser = createAsyncThunk("users/invite", async (payload, { rejectWithValue }) => {
    try { const r = await http.post(`/superadmin/users/invite`, payload); return r.data; }
    catch (e) { return rejectWithValue(e?.response?.data || { message: e.message }); }
});

export const deleteUser = createAsyncThunk("users/delete", async ({ id }, { rejectWithValue }) => {
    try { const r = await http.delete(`/superadmin/users/${id}`); return { id, ...r.data }; }
    catch (e) { return rejectWithValue(e?.response?.data || { message: e.message }); }
});

export const impersonateUser = createAsyncThunk("users/impersonate", async ({ id }, { rejectWithValue }) => {
    try { const r = await http.post(`/superadmin/users/${id}/impersonate`); return r.data; }
    catch (e) { return rejectWithValue(e?.response?.data || { message: e.message }); }
});

const slice = createSlice({
    name: "users",
    initialState: {
        items: [], total: 0, page: 1, pageSize: 10,
        status: "idle", error: null,
        filters: { q: "", status: undefined, role: undefined },
        acting: {},
    },
    reducers: {
        setUserFilters(s, a) { s.filters = { ...s.filters, ...a.payload }; },
        hydrateUsers(s, a) {                       // <— NEW
            const items = a.payload || [];
            s.items = items;
            s.total = items.length;
            s.page = 1;
            s.pageSize = Math.max(10, items.length);
            s.status = "succeeded";
            s.error = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchUsers.pending, (s, a) => { const p = a.meta.arg || {}; if (p.page) s.page = p.page; if (p.pageSize) s.pageSize = p.pageSize; s.status = "loading"; s.error = null; });
        b.addCase(fetchUsers.fulfilled, (s, a) => {
            console.log('s a =?>', s, a)
            Object.assign(s, { items: a.payload.items, total: a.payload.total, page: a.payload.page, pageSize: a.payload.pageSize, status: "succeeded" });
        });
        b.addCase(fetchUsers.rejected, (s, a) => { s.status = "failed"; s.error = a.payload?.message || "Failed to load users"; });

        const start = (s, a) => { const id = (a.meta.arg || {}).id; if (id) s.acting[id] = true; };
        const stop = (s, a) => { const id = (a.meta.arg || {}).id; if (id) s.acting[id] = false; };

        b.addCase(updateUser.pending, start);
        b.addCase(updateUser.fulfilled, (s, a) => { stop(s, a); const u = a.payload; const id = u._id || u.id; const i = s.items.findIndex(x => (x._id || x.id) === id); if (i >= 0) s.items[i] = { ...s.items[i], ...u }; });
        b.addCase(updateUser.rejected, stop);

        b.addCase(inviteUser.fulfilled, (s, a) => { s.items.unshift(a.payload); s.total += 1; });

        b.addCase(deleteUser.pending, start);
        b.addCase(deleteUser.fulfilled, (s, a) => { stop(s, a); const id = a.meta.arg.id; s.items = s.items.filter(x => (x._id || x.id) !== id); s.total = Math.max(0, s.total - 1); });
        b.addCase(deleteUser.rejected, stop);
    }
});

export const { setUserFilters, hydrateUsers } = slice.actions;
export default slice.reducer;