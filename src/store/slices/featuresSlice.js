import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../services/http';

const pluckItems = (data) => (data?.items ? data.items : data || []);

export const fetchFeatures = createAsyncThunk('features/fetch', async () => {
    const { data } = await http.get('/superadmin/modules');
    return pluckItems(data).filter(
        (f) => f.isActive !== false && (f.status ?? 'active') !== 'archived'
    );
});

const featuresSlice = createSlice({
    name: 'features',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeatures.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchFeatures.fulfilled, (s, a) => {
                s.loading = false;
                // sort by sortOrder asc
                s.items = [...a.payload].sort(
                    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                );
            })
            .addCase(fetchFeatures.rejected, (s, a) => {
                s.loading = false;
                s.error = a.error?.message || 'Failed to fetch features';
            });
    },
});

export default featuresSlice.reducer;