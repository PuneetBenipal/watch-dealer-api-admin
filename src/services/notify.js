// src/services/notify.js
import { notification } from "antd";

const TYPES = new Set(["success", "info", "warning", "error", "warn"]); // warn alias of warning

export function toast(type, message, description, options = {}) {
    const fn = TYPES.has(type) && notification[type] ? notification[type] : notification.open;
    const key = options.key || `n_${Date.now()}`;

    fn({
        key,
        message,
        description,
        placement: options.placement || "topRight",
        duration: options.duration != null ? options.duration : 3,
        onClick:
            options.onClick ||
            (() => {
                notification.close(key);
            }),
        ...options, // allow btn, icon, etc.
    });
}
