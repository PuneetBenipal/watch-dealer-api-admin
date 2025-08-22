import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: { sidebarCollapsed: false },
    reducers: {
        toggleSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed; },
        setSidebar(state, action) { state.sidebarCollapsed = !!action.payload; },
    },
});
export const { toggleSidebar, setSidebar } = uiSlice.actions;
export default uiSlice.reducer;
