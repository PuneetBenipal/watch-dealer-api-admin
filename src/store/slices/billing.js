import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

/** Invoices */
export const fetchInvoices = createAsyncThunk(
    "billing/fetchInvoices",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, pageSize = 10, q, status, companyId, start, end } = params;
            const res = await http.get("/superadmin/billing/invoices", {
                params: { page, limit: pageSize, q, status, companyId, start, end },
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

/** Payments */
export const fetchPayments = createAsyncThunk(
    "billing/fetchPayments",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, pageSize = 10, q, method, status, companyId, start, end } = params;
            const res = await http.get("/superadmin/billing/payments", {
                params: { page, limit: pageSize, q, method, status, companyId, start, end },
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

/** Update invoice status (e.g., mark paid/canceled/refunded) */
export const updateInvoiceStatus = createAsyncThunk(
    "billing/updateInvoiceStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await http.patch(`/superadmin/billing/invoices/${id}`, { status });
            return res.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

const billing = createSlice({
    name: "billing",
    initialState: {
        invoices: { items: [], total: 0, page: 1, pageSize: 10, status: "idle", error: null, filters: {} },
        payments: { items: [], total: 0, page: 1, pageSize: 10, status: "idle", error: null, filters: {} },
    },
    reducers: {
        setInvoiceFilters(s, a) { s.invoices.filters = { ...s.invoices.filters, ...a.payload }; },
        setPaymentFilters(s, a) { s.payments.filters = { ...s.payments.filters, ...a.payload }; },
        hydrateInvoices(s, a) {                         // <— NEW
            const items = a.payload || [];
            s.invoices.items = items;
            s.invoices.total = items.length;
            s.invoices.page = 1;
            s.invoices.pageSize = Math.max(10, items.length);
            s.invoices.status = "succeeded"; s.invoices.error = null;
        },
        hydratePayments(s, a) {                         // <— NEW
            const items = a.payload || [];
            s.payments.items = items;
            s.payments.total = items.length;
            s.payments.page = 1;
            s.payments.pageSize = Math.max(10, items.length);
            s.payments.status = "succeeded"; s.payments.error = null;
        },
    },
    extraReducers: (b) => {
        // invoices
        b.addCase(fetchInvoices.pending, (s, a) => {
            const st = s.invoices; const arg = a.meta.arg || {};
            if (arg.page) st.page = arg.page; if (arg.pageSize) st.pageSize = arg.pageSize;
            st.status = "loading"; st.error = null;
        });
        b.addCase(fetchInvoices.fulfilled, (s, a) => {
            s.invoices = { ...s.invoices, ...a.payload, status: "succeeded", error: null };
        });
        b.addCase(fetchInvoices.rejected, (s, a) => {
            s.invoices.status = "failed"; s.invoices.error = a.payload?.message || "Failed to load invoices";
        });

        // payments
        b.addCase(fetchPayments.pending, (s, a) => {
            const st = s.payments; const arg = a.meta.arg || {};
            if (arg.page) st.page = arg.page; if (arg.pageSize) st.pageSize = arg.pageSize;
            st.status = "loading"; st.error = null;
        });
        b.addCase(fetchPayments.fulfilled, (s, a) => {
            s.payments = { ...s.payments, ...a.payload, status: "succeeded", error: null };
        });
        b.addCase(fetchPayments.rejected, (s, a) => {
            s.payments.status = "failed"; s.payments.error = a.payload?.message || "Failed to load payments";
        });

        // invoice update merge
        b.addCase(updateInvoiceStatus.fulfilled, (s, a) => {
            const updated = a.payload || {};
            const id = updated._id || updated.id;
            const idx = s.invoices.items.findIndex(x => (x._id || x.id) === id);
            if (idx >= 0) s.invoices.items[idx] = { ...s.invoices.items[idx], ...updated };
        });
    },
});

export const { setInvoiceFilters, setPaymentFilters, hydrateInvoices, hydratePayments } = billing.actions;
export default billing.reducer;
