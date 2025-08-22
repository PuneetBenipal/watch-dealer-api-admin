// ModuleTogglesCell.jsx (AntD v4)
import React, { useMemo, useState } from "react";
import { Drawer, Input, Switch, Tag, Tooltip, Button, Divider } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleCompanyModule } from "../../store/slices/companies"; // adjust path


// Define the full catalog (key → label & group)
const MODULE_CATALOG = [
    { key: "whatsapp", label: "WhatsApp Engine", group: "Core" },
    { key: "inventory", label: "Inventory", group: "Core" },
    { key: "invoicing", label: "Invoicing", group: "Core" },
    { key: "ai_insights", label: "AI Insights", group: "AI" },
    { key: "ai_pricing", label: "AI Pricing", group: "AI" },
    { key: "escrow", label: "Escrow", group: "Premium" },
    { key: "disputes", label: "Disputes", group: "Premium" },
    { key: "rolex_verification", label: "Rolex Check", group: "Premium" },
    { key: "custom_domain", label: "Custom Domain", group: "Branding" },
    { key: "branded_invoices", label: "Branded Invoices", group: "Branding" },
    // { key: "api_access", label: "API Access", group: "Integrations" },
    // { key: "integrations_chrono24", label: "Chrono24 Sync", group: "Integrations" },
    // { key: "integrations_shopify", label: "Shopify Sync", group: "Integrations" },
];

const GROUP_ORDER = ["Core", "AI", "Premium", "Branding", "Integrations"];

export default function ModuleTogglesCell({ company }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const flags = company.featureFlags || {};
    const enabledKeys = Object.keys(flags).filter(k => flags[k]);

    // compact preview: first 3 enabled (or important) as tiny tags
    const preview = useMemo(() => {
        const important = ["whatsapp", "inventory", "rolex_verification"];
        const sorted = [
            ...important.filter(k => flags[k]),
            ...enabledKeys.filter(k => !important.includes(k)),
        ];
        return sorted.slice(0, 3);
    }, [flags, enabledKeys]);

    const moreCount = Math.max(0, enabledKeys.length - preview.length);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return MODULE_CATALOG.filter(m =>
            !needle ||
            m.label.toLowerCase().includes(needle) ||
            m.group.toLowerCase().includes(needle) ||
            m.key.includes(needle)
        );
    }, [q]);

    const onToggle = (key, enabled) => {
        dispatch(toggleCompanyModule({ id: company._id || company.id, key, enabled }));
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                {preview.map(k => (
                    <Tag key={k} color={flags[k] ? "blue" : ""} style={{ marginRight: 4 }}>
                        {MODULE_CATALOG.find(m => m.key === k)?.label.split(" ")[0]}
                    </Tag>
                ))}
                {moreCount > 0 && (
                    <Tag style={{ cursor: "pointer" }} onClick={() => setOpen(true)}>+{moreCount} more</Tag>
                )}
                <Tooltip title="Manage modules">
                    <Button size="small" icon={<SettingOutlined />} onClick={() => setOpen(true)} />
                </Tooltip>
            </div>

            <Drawer
                title={`Manage Modules — ${company.name || company.companyName || ""}`}
                placement="right"
                width="clamp(320px, 100%, 420px)"
                onClose={() => setOpen(false)}
                visible={open}
            >
                <Input.Search
                    placeholder="Search modules…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ marginBottom: 12 }}
                    allowClear
                />

                {/* Presets (optional) */}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <Button onClick={() => {
                        // Core preset: enable core, disable others
                        const core = new Set(["whatsapp", "inventory", "invoicing"]);
                        MODULE_CATALOG.forEach(m => onToggle(m.key, core.has(m.key)));
                    }}>Core</Button>
                    <Button onClick={() => {
                        // Core + Billing
                        const coreBilling = new Set(["whatsapp", "inventory", "invoicing"]);
                        MODULE_CATALOG.forEach(m => onToggle(m.key, coreBilling.has(m.key)));
                    }}>Core + Billing</Button>
                    <Button onClick={() => {
                        // All Premium
                        const premium = new Set(["whatsapp", "inventory", "invoicing", "ai_insights", "ai_pricing", "escrow", "disputes", "rolex_verification", "custom_domain", "branded_invoices"]);
                        MODULE_CATALOG.forEach(m => onToggle(m.key, premium.has(m.key)));
                    }}>All Premium</Button>
                </div>

                {GROUP_ORDER.map(group => {
                    const items = filtered.filter(m => m.group === group);
                    if (!items.length) return null;
                    return (
                        <div key={group} style={{ marginTop: 12 }}>
                            <Divider orientation="left">{group}</Divider>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    rowGap: 8,
                                    columnGap: 8,
                                }}
                            >
                                {items.map(m => (
                                    <React.Fragment key={m.key}>
                                        <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {m.label}
                                        </div>
                                        <Switch
                                            checked={!!flags[m.key]}
                                            onChange={(val) => onToggle(m.key, val)}
                                            size="small"
                                        />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </Drawer>
        </>
    );
}
