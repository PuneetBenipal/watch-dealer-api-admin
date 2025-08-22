import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

/** Accept multiple response shapes gracefully */
const extractItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.data?.items) return payload.data.items;
    if (payload?.items) return payload.items;
    if (payload?.data) return Array.isArray(payload.data) ? payload.data : [payload.data];
    return [];
};
const extractTotal = (payload, fallbackLen) => {
    if (typeof payload?.data?.total === "number") return payload.data.total;
    if (typeof payload?.total === "number") return payload.total;
    return fallbackLen ?? 0;
};

/** Thunks */
export const fetchModules = createAsyncThunk(
    "modules/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            // Supports server pagination if you add ?page, ?limit, ?q, etc.
            const res = await http.get("/superadmin/modules", { params });
            return res.data;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createModule = createAsyncThunk(
    "modules/create",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await http.post("/superadmin/modules", payload);
            return res.data;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateModule = createAsyncThunk(
    "modules/update",
    async ({ id, patch }, { rejectWithValue }) => {
        try {
            const res = await http.patch(`/superadmin/modules/${id}`, patch);
            return { id, data: res.data.status };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteModule = createAsyncThunk(
    "modules/delete",
    async (id, { rejectWithValue }) => {
        try {
            await http.delete(`/superadmin/modules/${id}`);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const togglePublish = createAsyncThunk(
    "modules/togglePublish",
    async ({ id, publish }, { rejectWithValue }) => {
        try {
            // Adjust if your API uses different field names
            const res = await http.patch(`/superadmin/modules/${id}`, {
                status: publish ? "published" : "Unpublished",
            });

            return { id, data: res.data };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

/** Slice */
const modulesSlice = createSlice({
    name: "modules",
    initialState: {
        items: [],
        total: 0,
        loading: false,
        error: null,
        // client-side filters (optional)
        q: "",
        type: undefined, // "core" | "add_on"
        status: undefined, // "published" | "draft" | "hidden"
    },
    reducers: {
        setQuery(state, action) { state.q = action.payload || ""; },
        setType(state, action) { state.type = action.payload; },
        setStatus(state, action) { state.status = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchModules.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchModules.fulfilled, (s, { payload }) => {
                const items = extractItems(payload);
                s.items = items;
                s.total = extractTotal(payload, items.length);
                s.loading = false;
            })
            .addCase(fetchModules.rejected, (s, { payload }) => {
                s.loading = false; s.error = payload || "Failed to load modules";
            })

            .addCase(createModule.fulfilled, (s, { payload }) => {
                const created = Array.isArray(payload) ? payload[0] : payload?.data || payload;
                if (created) s.items.unshift(created);
                s.total += 1;
            })

            .addCase(updateModule.fulfilled, (s, { payload }) => {
                const updated = payload?.data?.data || payload?.data; // tolerate wrappers
                const id = payload.id || updated?.id;
                if (!id) return;
                s.items = s.items.map((m) => (m._id === id ? { ...m, ...updated } : m));
            })
            
            .addCase(deleteModule.fulfilled, (s, { payload: id }) => {
                s.items = s.items.filter((m) => m._id !== id);
                s.total = Math.max(0, s.total - 1);
            })
            
            .addCase(togglePublish.fulfilled, (s, { payload }) => {
                const updated = payload?.data?.data || payload?.data;
                const id = payload.id || updated?.id;
                console.log("payload", id, updated)
                if (!id) return;
                s.items = s.items.map((m) => (m._id === id ? { ...m, ...updated } : m));
            });
    },
});

export const { setQuery, setType, setStatus } = modulesSlice.actions;
export default modulesSlice.reducer;

/** Selectors */
export const selectModulesState = (s) => s.modules;
export const selectModulesFiltered = (s) => {
    const { items, q, type, status } = s.modules;
    return items
        .filter((r) =>
            q
                ? (
                    (r.name || "") +
                    " " +
                    (r.shortDesc || "") +
                    " " +
                    (r.description || "")
                ).toLowerCase().includes(q.toLowerCase())
                : true
        )
        .filter((r) => (type ? r.type === type : true))
        .filter((r) => (status ? r.status === status : true))
        .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
};
