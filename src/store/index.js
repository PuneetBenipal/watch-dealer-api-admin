import { configureStore } from "@reduxjs/toolkit";
import ui from "./slices/ui";
import users from "./slices/users";
import companies from "./slices/companies";
import billing from "./slices/billing";
import logs from "./slices/logs";
import tickets from "./slices/tickets";
import dashboard from "./slices/dashboard";
import modules from "./slices/modules";
import discounts from "./slices/discountsSlice"
import features from "./slices/featuresSlice";
import plans from "./slices/planSlice";
import support from "./slices/SupportSlice";
import exchangeRates from "./slices/exchangeRates";


export default configureStore({
    reducer: {
        ui, users, companies, billing, logs,
        tickets, dashboard, modules, discounts,
        features, plans, support, exchangeRates,
    },
    middleware: (gDM) => gDM({ serializableCheck: false }),
    devTools: process.env.NODE_ENV !== "production",
});
