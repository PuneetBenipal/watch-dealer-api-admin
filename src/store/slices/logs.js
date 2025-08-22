import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

export const fetchLogs = createAsyncThunk(
    "logs/fetch",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, pageSize = 10, q, level, companyId, start, end } = params;
            const res = await http.get("/superadmin/logs", {
                params: { page, limit: pageSize, q, level, companyId, start, end },
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

const logs = createSlice({
    name: "logs",
    initialState: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        status: "idle",
        error: null,
        filters: { q: "", level: undefined, companyId: undefined, start: undefined, end: undefined },
    },
    reducers: {
        setLogFilters(s, a) { s.filters = { ...s.filters, ...a.payload }; },
    },
    extraReducers: (b) => {
        b.addCase(fetchLogs.pending, (s, a) => {
            const arg = a.meta.arg || {};
            if (arg.page) s.page = arg.page;
            if (arg.pageSize) s.pageSize = arg.pageSize;
            s.status = "loading"; s.error = null;
        });
        b.addCase(fetchLogs.fulfilled, (s, a) => {
            s.items = a.payload.items;
            s.total = a.payload.total;
            s.page = a.payload.page;
            s.pageSize = a.payload.pageSize;
            s.status = "succeeded";
        });
        b.addCase(fetchLogs.rejected, (s, a) => {
            s.status = "failed"; s.error = a.payload?.message || "Failed to load logs";
        });
    },
});

export const { setLogFilters } = logs.actions;
export default logs.reducer;
