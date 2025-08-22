
import { dbLoad, dbSave } from "./mockDb";
import usersSeed from "../mock/users.json";
import companiesSeed from "../mock/companies.json";
import invoicesSeed from "../mock/invoices.json";
import paymentsSeed from "../mock/payments.json";
import ticketsSeed from "../mock/tickets.json";
import logsSeed from "../mock/logs.json";

// --- DB (in-memory + localStorage) ---
let users = dbLoad("users", usersSeed);
let companies = dbLoad("companies", companiesSeed);
let invoices = dbLoad("invoices", invoicesSeed);
let payments = dbLoad("payments", paymentsSeed);
let tickets = dbLoad("tickets", ticketsSeed);
let logs = dbLoad("logs", logsSeed);

const sync = () => {
    dbSave("users", users);
    dbSave("companies", companies);
    dbSave("invoices", invoices);
    dbSave("payments", payments);
    dbSave("tickets", tickets);
    dbSave("logs", logs);
};

// --- Helpers ---
const ok = (data) => Promise.resolve({ data });
const notFound = (msg = "Not found") => Promise.reject({ response: { status: 404, data: { message: msg } } });
const badReq = (msg = "Bad request") => Promise.reject({ response: { status: 400, data: { message: msg } } });
const matchQ = (q, ...f) => !q || f.some(v => (v || "").toString().toLowerCase().includes(q.toLowerCase()));
const sum = (arr, key) => arr.reduce((a, b) => a + (+b[key] || 0), 0);
function qp(opts) {
    const p = (opts && opts.params) || {};
    return {
        page: Number(p.page || 1),
        limit: Number(p.limit || p.pageSize || 10),
        q: p.q || "",
        status: p.status, role: p.role, plan: p.plan, method: p.method,
        companyId: p.companyId,
        start: p.start ? new Date(p.start).getTime() : undefined,
        end: p.end ? new Date(p.end).getTime() : undefined,
        level: p.level, priority: p.priority, assignee: p.assignee
    };
}
function paginate(list, page, limit) {
    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { data: items, total, page, pageSize: limit };
}
const byDateDesc = (a, b, key = "createdAt") => new Date(b[key] || 0) - new Date(a[key] || 0);

// --- GET ---
function get(path, opts) {
    // USERS
    if (path === "/superadmin/users") {
        const { page, limit, q, status, role } = qp(opts);
        let list = users.filter(u => matchQ(q, u.name, u.email, u.company));
        if (status) list = list.filter(u => u.status === status);
        if (role) list = list.filter(u => u.role === role);
        return ok(paginate(list, page, limit));
    }

    // COMPANIES
    if (path === "/superadmin/companies") {
        const { page, limit, q, status, plan } = qp(opts);
        let list = companies.filter(c => matchQ(q, c.name, c.planId, c.planStatus));
        if (status) list = list.filter(c => c.planStatus === status);
        if (plan) list = list.filter(c => c.planId === plan);
        list.sort((a, b) => byDateDesc(a, b, "createdAt"));
        return ok(paginate(list, page, limit));
    }

    // BILLING: invoices
    if (path === "/superadmin/billing/invoices") {
        const { page, limit, q, status, companyId, start, end } = qp(opts);
        let list = invoices.filter(i => matchQ(q, i.number, i.companyName));
        if (status) list = list.filter(i => i.status === status);
        if (companyId) list = list.filter(i => (i.companyId || i.company_id) === companyId);
        if (start) list = list.filter(i => new Date(i.createdAt).getTime() >= start);
        if (end) list = list.filter(i => new Date(i.createdAt).getTime() <= end);
        list.sort((a, b) => byDateDesc(a, b, "createdAt"));
        return ok(paginate(list, page, limit));
    }

    // BILLING: payments
    if (path === "/superadmin/billing/payments") {
        const { page, limit, q, status, method, companyId, start, end } = qp(opts);
        let list = payments.filter(p => matchQ(q, p.id, p.companyName, p.reference));
        if (status) list = list.filter(p => p.status === status);
        if (method) list = list.filter(p => p.method === method);
        if (companyId) list = list.filter(p => p.companyId === companyId);
        if (start) list = list.filter(p => new Date(p.createdAt).getTime() >= start);
        if (end) list = list.filter(p => new Date(p.createdAt).getTime() <= end);
        list.sort((a, b) => byDateDesc(a, b, "createdAt"));
        return ok(paginate(list, page, limit));
    }

    // SUPPORT: tickets
    if (path === "/superadmin/support/tickets") {
        const { page, limit, q, status, priority, assignee, companyId, start, end } = qp(opts);
        let list = tickets.filter(t => matchQ(q, t.subject, t.companyName, t.assignee));
        if (status) list = list.filter(t => t.status === status);
        if (priority) list = list.filter(t => t.priority === priority);
        if (assignee) list = list.filter(t => (t.assignee || "") === assignee);
        if (companyId) list = list.filter(t => t.companyId === companyId);
        if (start) list = list.filter(t => new Date(t.createdAt).getTime() >= start);
        if (end) list = list.filter(t => new Date(t.createdAt).getTime() <= end);
        list.sort((a, b) => byDateDesc(a, b, "updatedAt"));
        return ok(paginate(list, page, limit));
    }

    // LOGS
    if (path === "/superadmin/logs") {
        const { page, limit, q, level, companyId, start, end } = qp(opts);
        let list = logs.filter(l => matchQ(q, l.action, l.message, l.actor, l.target));
        if (level) list = list.filter(l => l.level === level);
        if (companyId) list = list.filter(l => l.companyId === companyId);
        if (start) list = list.filter(l => new Date(l.ts).getTime() >= start);
        if (end) list = list.filter(l => new Date(l.ts).getTime() <= end);
        list.sort((a, b) => byDateDesc(a, b, "ts"));
        return ok(paginate(list, page, limit));
    }

    // METRICS (dashboard)
    if (path === "/superadmin/metrics") {
        const range = (opts?.params?.range || "30d").toLowerCase();
        const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

        // KPIs
        const kCompanies = companies.length;
        const kUsersActive = users.filter(u => u.status === "active" || u.status === "online" || !u.status).length;
        const now = new Date();
        const since = new Date(now); since.setDate(now.getDate() - days);
        const invWindow = invoices.filter(i => new Date(i.createdAt) >= since);
        const kMRR = sum(invWindow.filter(i => i.status === "paid"), "amount");
        const kPastDue = invoices.filter(i => i.status === "past_due" || (i.status === "open" && i.dueDate && new Date(i.dueDate) < now)).length;

        // Timeseries minimal
        const base = []; const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        for (let i = days - 1; i >= 0; i--) { const d = new Date(d0); d.setDate(d0.getDate() - i); base.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, value: 0 }); }
        const add = (series, dateStr, v = 1) => {
            const idx = series.findIndex(x => x.date === dateStr);
            if (idx >= 0) series[idx].value += v;
        };
        const mrrDaily = base.map(x => ({ ...x }));
        invWindow.filter(i => i.status === "paid").forEach(i => {
            const d = new Date(i.createdAt); add(mrrDaily, `${d.getMonth() + 1}/${d.getDate()}`, +i.amount || 0);
        });
        const newUsersDaily = base.map(x => ({ ...x }));
        users.forEach(u => { const d = u.createdAt && new Date(u.createdAt); if (!d) return; if (d >= since) add(newUsersDaily, `${d.getMonth() + 1}/${d.getDate()}`, 1); });

        // Tables
        const recentInvoices = [...invoices].sort((a, b) => byDateDesc(a, b, "createdAt")).slice(0, 5).map(i => {
            const c = companies.find(c => (c._id || c.id) === (i.companyId || i.company_id));
            return { ...i, companyName: i.companyName || c?.name || "—" };
        });
        const topCompanies = [...companies].sort((a, b) => (b.seats?.used || 0) - (a.seats?.used || 0)).slice(0, 5);

        return ok({
            kpi: { companies: kCompanies, usersActive: kUsersActive, mrr: kMRR, invoicesPastDue: kPastDue, companiesDelta: 0, usersDelta: 0, mrrDelta: 0, invoicesDelta: 0 },
            timeseries: { mrrDaily, newUsersDaily },
            tables: { recentInvoices, topCompanies }
        });
    }

    return notFound();
}

// --- POST ---
function post(path, body = {}) {
    // USERS
    if (path === "/superadmin/users/invite") {
        const { name, email, role = "agent", company = "Unassigned" } = body;
        if (!email) return badReq("email required");
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return badReq("email already exists");
        const id = "u_" + Date.now();
        const nu = { _id: id, name: name || email.split("@")[0], email, role, company, status: "active", createdAt: new Date().toISOString() };
        users.unshift(nu); sync();
        return ok(nu);
    }
    let m = path.match(/^\/superadmin\/users\/([^/]+)\/impersonate$/);
    if (m) {
        const u = users.find(x => (x._id || x.id) === m[1]); if (!u) return notFound("User not found");
        return ok({ token: `impersonated-${u._id}`, user: u });
    }
    m = path.match(/^\/superadmin\/users\/([^/]+)\/reset-password$/);
    if (m) {
        const u = users.find(x => (x._id || x.id) === m[1]); if (!u) return notFound("User not found");
        return ok({ ok: true });
    }

    // SUPPORT: create ticket
    if (path === "/superadmin/support/tickets") {
        const { companyId, subject, description, priority = "normal", assignee } = body;
        if (!companyId || !subject) return badReq("companyId and subject required");
        const id = "t_" + Date.now();
        const c = companies.find(c => (c._id || c.id) === companyId);
        const t = {
            _id: id, companyId, companyName: c?.name || "—",
            subject, description: description || "", status: "open", priority, assignee: assignee || null,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        tickets.unshift(t); sync();
        return ok(t);
    }

    // SUPPORT: reply (no messages timeline UI yet; safe no-op)
    m = path.match(/^\/superadmin\/support\/tickets\/([^/]+)\/reply$/);
    if (m) {
        const t = tickets.find(x => (x._id || x.id) === m[1]); if (!t) return notFound("Ticket not found");
        t.updatedAt = new Date().toISOString(); sync();
        return ok({ ...t });
    }

    return notFound();
}

// --- PATCH ---
function patch(path, body = {}) {
    // USERS unified update
    let m = path.match(/^\/superadmin\/users\/([^/]+)$/);
    if (m) {
        const id = m[1];
        const u = users.find(x => (x._id || x.id) === id);
        if (!u) return notFound("User not found");
        try {
            ["name", "company", "role", "status"].forEach(k => { if (body[k] != null) u[k] = body[k]; });
        } catch (err) {
            console.log("error", err);
            console.log("error", err.message);
        }
        sync();
        return ok({ ...u });
    }

    // COMPANIES billing
    m = path.match(/^\/superadmin\/companies\/([^/]+)\/billing$/);
    if (m) {
        const id = m[1];
        const c = companies.find(x => (x._id || x.id) === id); if (!c) return notFound("Company not found");
        const { planId, planStatus, renewalDate, seatsPurchased } = body;
        if (planId != null) c.planId = String(planId);
        if (planStatus != null) c.planStatus = String(planStatus);
        if (renewalDate !== undefined) c.renewalDate = renewalDate || null;
        if (seatsPurchased != null) {
            c.seats = c.seats || {};
            c.seats.purchased = Number(seatsPurchased);
        }
        sync();
        return ok({ ...c });
    }

    // COMPANIES modules
    m = path.match(/^\/superadmin\/companies\/([^/]+)\/modules$/);
    if (m) {
        const id = m[1];
        const c = companies.find(x => (x._id || x.id) === id); if (!c) return notFound("Company not found");
        c.featureFlags = c.featureFlags || {};
        Object.assign(c.featureFlags, body || {});
        sync();
        return ok({ ...c });
    }

    // BILLING: invoice status
    m = path.match(/^\/superadmin\/billing\/invoices\/([^/]+)$/);
    if (m) {
        const id = m[1];
        const inv = invoices.find(x => (x._id || x.id) === id); if (!inv) return notFound("Invoice not found");
        if (body.status) inv.status = body.status;
        sync();
        return ok({ ...inv });
    }

    // SUPPORT: update ticket
    m = path.match(/^\/superadmin\/support\/tickets\/([^/]+)$/);
    if (m) {
        const id = m[1];
        const t = tickets.find(x => (x._id || x.id) === id); if (!t) return notFound("Ticket not found");
        ["subject", "description", "status", "priority", "assignee"].forEach(k => { if (body[k] !== undefined) t[k] = body[k]; });
        t.updatedAt = new Date().toISOString(); sync();
        return ok({ ...t });
    }

    return notFound();
}

// --- DELETE ---
function del(path) {
    let m = path.match(/^\/superadmin\/users\/([^/]+)$/);
    if (m) {
        const id = m[1];
        const i = users.findIndex(x => (x._id || x.id) === id); if (i < 0) return notFound("User not found");
        users.splice(i, 1); sync(); return ok({ ok: true, id });
    }
    m = path.match(/^\/superadmin\/support\/tickets\/([^/]+)$/);
    if (m) {
        const id = m[1];
        const i = tickets.findIndex(x => (x._id || x.id) === id); if (i < 0) return notFound("Ticket not found");
        tickets.splice(i, 1); sync(); return ok({ ok: true, id });
    }
    return notFound();
}

const mock = {
    get, post, patch, delete: del,
    defaults: { headers: { common: {} } },
    interceptors: { response: { use: () => { } } },
};

export default mock;
