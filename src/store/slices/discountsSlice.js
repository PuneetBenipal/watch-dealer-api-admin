import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DiscountsApi } from "../../apis/discountsApi";

export const fetchDiscountItems = createAsyncThunk("discounts/items", DiscountsApi.listItems);
export const fetchDiscounts = createAsyncThunk("discounts/list", DiscountsApi.list);
export const createDiscount = createAsyncThunk("discounts/create", DiscountsApi.create);
export const updateDiscount = createAsyncThunk("discounts/update", async ({ id, data }) => DiscountsApi.update);
export const toggleDiscount = createAsyncThunk("discounts/toggle", DiscountsApi.toggle);

const discountsSlice = createSlice({
    name: 'discounts',
    initialState: {
        itemsCatalog: [],
        list: [],
        loading: false,
        saving: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscountItems.fulfilled, (s, a) => {
                s.itemsCatalog = a.payload || [];
            })
            .addCase(fetchDiscounts.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchDiscounts.fulfilled, (s, a) => { s.loading = false; s.list = a.payload || []; })
            .addCase(fetchDiscounts.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

            .addCase(createDiscount.pending, (s) => { s.saving = true; s.error = null; })
            .addCase(createDiscount.fulfilled, (s, a) => { s.saving = false; s.list.unshift(a.payload); })
            .addCase(createDiscount.rejected, (s, a) => { s.saving = false; s.error = a.error.message; })

            .addCase(updateDiscount.pending, (s) => { s.saving = true; s.error = null; })
            .addCase(updateDiscount.fulfilled, (s, a) => {
                s.saving = false;
                const idx = s.list.findIndex(x => x._id === a.payload._id);
                if (idx >= 0) s.list[idx] = a.payload;
            })
            .addCase(updateDiscount.rejected, (s, a) => { s.saving = false; s.error = a.error.message; })

            .addCase(toggleDiscount.fulfilled, (s, a) => {
                const idx = s.list.findIndex(x => x._id === a.payload._id);
                if (idx >= 0) s.list[idx] = a.payload;
            });
    }
})

export default discountsSlice.reducer;