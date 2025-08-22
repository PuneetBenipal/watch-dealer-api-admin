import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../services/http';

// Helpers
const pluckItems = (data) => (data?.items ? data.items : data || []);
const byId = (arr, id) => arr.findIndex((x) => (x._id || x.id) === id);

// Thunks
export const fetchPlans = createAsyncThunk('plans/fetch', async () => {
    const { data } = await http.get('/superadmin/plans');
    return data;
});

export const createPlan = createAsyncThunk('plans/create', async (payload) => {
    const { data } = await http.post('/superadmin/plans', payload);
    return data;
});

export const updatePlan = createAsyncThunk(
    'plans/update',
    async ({ id, data: payload }) => {
        const { data } = await http.put(`/superadmin/plans/${id}`, payload);
        return data;
    }
);

export const deletePlan = createAsyncThunk('plans/delete', async (id) => {
    await http.delete(`/superadmin/plans/${id}`);
    return id;
});

// Slice
const plansSlice = createSlice({
    name: 'plans',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchPlans.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchPlans.fulfilled, (s, a) => {
                s.loading = false;  
                s.items = a.payload || [];
            })
            .addCase(fetchPlans.rejected, (s, a) => {
                s.loading = false;
                s.error = a.error?.message || 'Failed to fetch plans';
            })

            // create
            .addCase(createPlan.pending, (s) => {
                s.error = null;
            })
            .addCase(createPlan.fulfilled, (s, a) => {
                s.items.unshift(a.payload);
            })
            .addCase(createPlan.rejected, (s, a) => {
                s.error = a.error?.message || 'Failed to create plan';
            })

            // update
            .addCase(updatePlan.fulfilled, (s, a) => {
                const id = a.payload._id || a.payload.id;
                const idx = byId(s.items, id);
                if (idx >= 0) s.items[idx] = a.payload;
            })
            .addCase(updatePlan.rejected, (s, a) => {
                s.error = a.error?.message || 'Failed to update plan';
            })

            // delete
            .addCase(deletePlan.fulfilled, (s, a) => {
                const id = a.payload;
                s.items = s.items.filter((p) => (p._id || p.id) !== id);
            })
            // .addCase(deletePlanRejected, (s, a) => {
            //     s.error = a.error?.message || 'Failed to delete plan';
            // });
    },
});

// export reducer & selectors
export default plansSlice.reducer;