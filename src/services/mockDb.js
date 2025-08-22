const KEY_PREFIX = "mockdb_";

export function dbLoad(name, seed) {
    const key = KEY_PREFIX + name;
    try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    } catch { }
    localStorage.setItem(key, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
}

export function dbSave(name, data) {
    const key = KEY_PREFIX + name;
    localStorage.setItem(key, JSON.stringify(data));
}
