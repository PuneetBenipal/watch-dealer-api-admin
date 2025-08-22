import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

/** List companies (server pagination) */
export const fetchCompanies = createAsyncThunk(
    "companies/fetch",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, pageSize = 10, q, status, plan } = params;
            const res = await http.get("/superadmin/companies", {
                params: { page, limit: pageSize, q, status, plan },
            });
            const payload = res.data || {};
            const items = payload.data || payload.items || [];
            return {
                items,
                total: payload.total ?? payload.count ?? items.length,
                page: payload.page ?? page,
                pageSize: payload.pageSize ?? payload.limit ?? pageSize,
            };
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

/** Update billing (plan/renewal/status) */
export const updateCompanyBilling = createAsyncThunk(
    "companies/updateBilling",
    async ({ id, patch }, { rejectWithValue }) => {
        try {
            const res = await http.patch(`/superadmin/companies/${id}/billing`, patch);
            return res.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

/** Toggle one module flag (e.g., inventory, rolex_verification) */
export const toggleCompanyModule = createAsyncThunk(
    "companies/toggleModule",
    async ({ id, key, enabled }, { rejectWithValue }) => {
        try {
            const res = await http.patch(`/superadmin/companies/${id}/modules`, { [key]: enabled });
            return { id, key, enabled, updated: res.data };
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

const companiesSlice = createSlice({
    name: "companies",
    initialState: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        status: "idle",
        error: null,
        filters: { q: "", status: undefined, plan: undefined },
        // track pending toggle to avoid double clicks
        toggling: {},
    },
    reducers: {
        setCompanyFilters(state, action) { state.filters = { ...state.filters, ...action.payload }; },
        hydrateCompanies(s, a) {                      // <— NEW
            const items = a.payload || [];
            s.items = items;
            s.total = items.length;
            s.page = 1; s.pageSize = Math.max(10, items.length);
            s.status = "succeeded"; s.error = null;
        },
    },

    extraReducers: (b) => {
        b.addCase(fetchCompanies.pending, (s, a) => {
            const arg = a.meta.arg || {};
            if (arg.page) s.page = arg.page;
            if (arg.pageSize) s.pageSize = arg.pageSize;
            s.status = "loading";
            s.error = null;
        });
        b.addCase(fetchCompanies.fulfilled, (s, a) => {
            s.items = a.payload.items;
            s.total = a.payload.total;
            s.page = a.payload.page;
            s.pageSize = a.payload.pageSize;
            s.status = "succeeded";
        });
        b.addCase(fetchCompanies.rejected, (s, a) => {
            s.status = "failed";
            s.error = a.payload?.message || "Failed to load companies";
        });

        b.addCase(toggleCompanyModule.pending, (s, a) => {
            const { id, key } = a.meta.arg;
            s.toggling[`${id}:${key}`] = true;
        });
        b.addCase(toggleCompanyModule.fulfilled, (s, a) => {
            const { id, key, enabled } = a.payload;
            const row = s.items.find((x) => (x._id || x.id) === id);
            if (row) {
                row.featureFlags = row.featureFlags || {};
                row.featureFlags[key] = enabled;
            }
            s.toggling[`${id}:${key}`] = false;
        });
        b.addCase(toggleCompanyModule.rejected, (s, a) => {
            const { id, key } = a.meta.arg;
            s.toggling[`${id}:${key}`] = false;
            s.error = a.payload?.message || "Toggle failed";
        });

        b.addCase(updateCompanyBilling.fulfilled, (s, a) => {
            const updated = a.payload;
            const id = updated._id || updated.id;
            const idx = s.items.findIndex((x) => (x._id || x.id) === id);
            if (idx >= 0) s.items[idx] = { ...s.items[idx], ...updated };
        });
    },
});

export const { setCompanyFilters, hydrateCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;
