import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../services/http";

// Fetch current exchange rates
export const fetchExchangeRates = createAsyncThunk(
    "exchangeRates/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await http.get("/superadmin/exchange-rates");
            return res.data.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

// Update rates from external API
export const updateRatesFromAPI = createAsyncThunk(
    "exchangeRates/updateFromAPI",
    async ({ provider = "exchangerate" }, { rejectWithValue }) => {
        try {
            const res = await http.post("/superadmin/exchange-rates/update-from-api", { provider });
            return res.data.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

// Set manual exchange rates
export const setManualRates = createAsyncThunk(
    "exchangeRates/setManual",
    async ({ rates, baseCurrency }, { rejectWithValue }) => {
        try {
            const res = await http.post("/superadmin/exchange-rates/manual", { rates, baseCurrency });
            return res.data.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

// Fetch rate change history
export const fetchRateHistory = createAsyncThunk(
    "exchangeRates/fetchHistory",
    async ({ limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await http.get("/superadmin/exchange-rates/history", { params: { limit } });
            return res.data.data;
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

const exchangeRatesSlice = createSlice({
    name: "exchangeRates",
    initialState: {
        rates: null,
        history: [],
        status: "idle",
        historyStatus: "idle",
        error: null,
        updating: false,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch exchange rates
        builder
            .addCase(fetchExchangeRates.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchExchangeRates.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.rates = action.payload;
            })
            .addCase(fetchExchangeRates.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload?.message || "Failed to fetch exchange rates";
            });

        // Update from API
        builder
            .addCase(updateRatesFromAPI.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateRatesFromAPI.fulfilled, (state, action) => {
                state.updating = false;
                state.rates = action.payload;
                state.status = "succeeded";
            })
            .addCase(updateRatesFromAPI.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to update rates from API";
            });

        // Set manual rates
        builder
            .addCase(setManualRates.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(setManualRates.fulfilled, (state, action) => {
                state.updating = false;
                state.rates = action.payload;
                state.status = "succeeded";
            })
            .addCase(setManualRates.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to set manual rates";
            });

        // Fetch history
        builder
            .addCase(fetchRateHistory.pending, (state) => {
                state.historyStatus = "loading";
            })
            .addCase(fetchRateHistory.fulfilled, (state, action) => {
                state.historyStatus = "succeeded";
                state.history = action.payload;
            })
            .addCase(fetchRateHistory.rejected, (state, action) => {
                state.historyStatus = "failed";
                state.error = action.payload?.message || "Failed to fetch rate history";
            });
    },
});

export const { clearError } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;
