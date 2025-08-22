import http from "../services/http";

export const DiscountsApi = {
    async listItems() {
        const r = await http.get('/superadmin/discounts/items');
        console.log('listitems', !r.ok)
        // if (!r.ok) throw new Error('Failed to load items');
        return r.data;
    },

    async list() {
        const r = await http.get('/superadmin/discounts');
        // if (!r.ok) throw new Error('Failed to load discounts');
        return r.data;
    },

    async create(data) {
        const r = await http.post('/superadmin/discounts', data);
        // if (!r.ok) throw new Error((await r.data).error || 'Create failed');
        return r.data;
    },

    async update(id, data) {
        const r = await http.patch(`/superadmin/discounts/${id}`, data);
        // if (!r.ok) throw new Error((await r.data).error || 'Update failed');
        return r.data;
    },

    async toggle(id) {
        const r = await http.post(`/superadmin/discounts/${id}/toggle`);
        // if (!r.ok) throw new Error((await r.data).error || 'Toggle failed');
        return r.data;
    }
};
