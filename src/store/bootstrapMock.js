import users from "../mock/users.json";
import companies from "../mock/companies.json";
import invoices from "../mock/invoices.json";
import payments from "../mock/payments.json";

import { hydrateUsers } from "./slices/users";
import { hydrateCompanies } from "./slices/companies";
import { hydrateInvoices, hydratePayments } from "./slices/billing";

// Optional: add tickets/logs later if needed for the dashboard

export function bootstrapMock() {
    return async (dispatch) => {
        // Make sure dates exist for timeseries:
        // (If your JSON lacks createdAt/dueDate, add them there.)
        dispatch(hydrateUsers(users));
        dispatch(hydrateCompanies(companies));
        dispatch(hydrateInvoices(invoices));
        dispatch(hydratePayments(payments));
    };
}
