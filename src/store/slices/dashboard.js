import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helpers
function parseRange(range = "30d") {
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const end = new Date();                      // now
    const start = new Date(end); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
    return { days, start, end };
}
const dayKey = (d) => {
    const x = new Date(d); return `${x.getMonth() + 1}/${x.getDate()}`;
};
const makeZeroSeries = (days, start) => {
    const arr = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        arr.push({ date: dayKey(d), value: 0 });
    }
    return arr;
};
const mergeSeries = (base, map) => base.map(pt => ({ ...pt, value: map.get(pt.date) ?? 0 }));
const pctDelta = (curr, prev) => !prev ? (curr ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

export const fetchDashboard = createAsyncThunk(
    "dashboard/fetchLocal",
    async ({ range = "30d" } = {}, { getState, rejectWithValue }) => {
        try {
            const { users, companies, billing } = getState();
            console.log("====", users, companies, billing)
            const userItems = users.items || [];
            const companyItems = companies.items || [];
            const invoices = billing.invoices.items || [];
            // const payments = billing.payments.items || []; // not used yet

            const { days, start, end } = parseRange(range);

            // KPIs
            const companiesTotal = companyItems.length;
            const usersActiveTotal = userItems.filter(u => (u.status === "active" || u.status === "online" || u.status == null)).length;

            const invPastDue = invoices.filter(i => {
                if (i.status === "past_due") return true;
                if (i.status === "open" && i.dueDate) return new Date(i.dueDate) < new Date();
                return false;
            }).length;

            const paidInWindow = invoices.filter(i => i.status === "paid" && new Date(i.createdAt) >= start && new Date(i.createdAt) <= end);
            const mrrCurr = paidInWindow.reduce((a, b) => a + (+b.amount || 0), 0);

            // Simple period-over-period deltas
            const prevStart = new Date(start); prevStart.setDate(start.getDate() - days);
            const prevEnd = new Date(start); prevEnd.setDate(start.getDate() - 1);

            const companiesPrev = companyItems.filter(c => c.createdAt && new Date(c.createdAt) >= prevStart && new Date(c.createdAt) <= prevEnd).length;
            const usersPrev = userItems.filter(u => u.createdAt && new Date(u.createdAt) >= prevStart && new Date(u.createdAt) <= prevEnd).length;

            const companiesCurr = companyItems.filter(c => c.createdAt && new Date(c.createdAt) >= start && new Date(c.createdAt) <= end).length;
            const usersCurr = userItems.filter(u => u.createdAt && new Date(u.createdAt) >= start && new Date(u.createdAt) <= end).length;

            // Time series
            const base = makeZeroSeries(days, start);

            const mrrMap = new Map();
            for (const i of paidInWindow) {
                const k = dayKey(i.createdAt);
                mrrMap.set(k, (mrrMap.get(k) || 0) + (+i.amount || 0));
            }
            const mrrDaily = mergeSeries(base, mrrMap);

            const newUsersMap = new Map();
            for (const u of userItems) {
                const d = u.createdAt && new Date(u.createdAt);
                if (!d || d < start || d > end) continue;
                const k = dayKey(d);
                newUsersMap.set(k, (newUsersMap.get(k) || 0) + 1);
            }
            const newUsersDaily = mergeSeries(base, newUsersMap);

            // Tables
            const recentInvoices = [...invoices]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(i => {
                    const company =
                        companyItems.find(c => (c._id || c.id) === (i.companyId || i.company_id)) || null;
                    return { ...i, companyName: i.companyName || company?.name || "—" };
                });

            const topCompanies = [...companyItems]
                .map(c => ({ ...c, _seatsUsed: c?.seats?.used || 0 }))
                .sort((a, b) => b._seatsUsed - a._seatsUsed)
                .slice(0, 5);

            return {
                kpi: {
                    companies: companiesTotal,
                    usersActive: usersActiveTotal,
                    mrr: mrrCurr,
                    invoicesPastDue: invPastDue,
                    companiesDelta: pctDelta(companiesCurr, companiesPrev),
                    usersDelta: pctDelta(usersCurr, usersPrev),
                    mrrDelta: 0,        // could compute prev window sum similar to above if needed
                    invoicesDelta: 0,
                },
                timeseries: { mrrDaily, newUsersDaily },
                tables: { recentInvoices, topCompanies },
            };
        } catch (e) {
            return rejectWithValue({ message: e.message });
        }
    }
);

const slice = createSlice({
    name: "dashboard",
    initialState: { loading: false, error: null, range: "30d", data: null },
    reducers: {
        setRange(s, a) { s.range = a.payload || "30d"; }
    },
    extraReducers: (b) => {
        b.addCase(fetchDashboard.pending, (s) => { s.loading = true; s.error = null; });
        b.addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; });
        b.addCase(fetchDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || "Failed to load metrics"; });
    }
});

export const { setRange } = slice.actions;
export default slice.reducer;
