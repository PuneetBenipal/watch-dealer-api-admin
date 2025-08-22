import React, { useEffect, useMemo, useState } from "react";
import { Table, Space, Input, Select, Button, Badge, Tag, Typography, Drawer, Radio, message } from "antd";
import { SearchOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTickets, fetchTicket, updateTicket, sendReply, bulkAction,
    setFilters, setSelected, clearTicket, setQuery
} from "../store/slices/SupportSlice";


const { Text } = Typography;
const { Option } = Select;
const STATUS_BADGE = { open: "processing", pending: "warning", on_hold: "default", solved: "success", closed: "default" };
const PRIORITY_COLOR = { low: "", medium: "processing", high: "warning", urgent: "error" };

export default function AdminSupportPage() {
    const d = useDispatch()
    const dispatch = useDispatch()

    const {
        items, total, loading,
        q, status, priority, assignee, category, page, limit,
        ticket, ticketLoading, selectedRowKeys
    } = useSelector(s => s.support);

    const [visible, setVisible] = useState(false);
    const [replyType, setReplyType] = useState("public");
    const [replyBody, setReplyBody] = useState("");

    // fetch list
    useEffect(() => {
        dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" }));
    }, [q, status, priority, assignee, category, page, limit, d]);

    const openTicket = async (id) => {
        await dispatch(fetchTicket(id));
        setReplyType("public"); setReplyBody("");
        setVisible(true);
    };

    const columns = [
        { title: "ID", dataIndex: "_id", width: 140, render: (v) => <Text code ellipsis={{ tooltip: v }}>{v}</Text> },
        { title: "Subject", dataIndex: "subject", ellipsis: true, render: (v, r) => (<Space direction="vertical" size={2}><Text strong ellipsis={{ tooltip: v }}>{v}</Text><Text type="secondary">{r.requester?.email}</Text></Space>) },
        { title: "Status", dataIndex: "status", width: 120, render: (s) => <Badge status={STATUS_BADGE[s]} text={s} /> },
        { title: "Priority", dataIndex: "priority", width: 110, render: (p) => <Tag color={PRIORITY_COLOR[p]}>{p}</Tag> },
        { title: "Assignee", dataIndex: ["assignee", "name"], width: 160, render: (_, r) => r.assignee?.name || <Text type="secondary">Unassigned</Text> },
        { title: "Updated", dataIndex: "updatedAt", width: 170, render: (t) => new Date(t).toLocaleString() },
        { title: "", width: 90, fixed: "right", render: (_, r) => <Button size="small" onClick={() => openTicket(r._id)}>Open</Button> },
    ];

    // debounce search input locally → dispatch setQuery
    const [localQ, setLocalQ] = useState(q || "");
    useEffect(() => {
        const t = setTimeout(() => dispatch(setQuery(localQ)), 350);
        return () => clearTimeout(t);
    }, [localQ, d]);

    const send = async () => {
        if (!replyBody.trim()) return;
        await dispatch(sendReply({ id: ticket._id, payload: { type: replyType, body: replyBody } }));
        setReplyBody("");
        // refresh list after reply
        dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" }));
    };

    return (
        <div style={{ padding: 16 }}>
            <Space style={{ marginBottom: 12 }} wrap>
                <Input allowClear prefix={<SearchOutlined />} placeholder="Search subject, id, email…"
                    value={localQ} onChange={(e) => setLocalQ(e.target.value)} style={{ width: 280 }} />
                <Select allowClear placeholder="Status" value={status} onChange={(v) => dispatch(setFilters({ status: v }))} style={{ width: 140 }}>
                    {["open", "pending", "on_hold", "solved", "closed"].map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
                <Select allowClear placeholder="Priority" value={priority} onChange={(v) => dispatch(setFilters({ priority: v }))} style={{ width: 140 }}>
                    {["low", "medium", "high", "urgent"].map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
                <Select allowClear placeholder="Assignee" value={assignee} onChange={(v) => dispatch(setFilters({ assignee: v }))} style={{ width: 180 }}>
                    <Option value="me">Me</Option>
                </Select>
                <Select allowClear placeholder="Category" value={category} onChange={(v) => dispatch(setFilters({ category: v }))} style={{ width: 180 }}>
                    {["Billing", "API", "Security", "Integrations", "General"].map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" }))}>Refresh</Button>
            </Space>

            <Space style={{ marginBottom: 8 }} wrap>
                <Button disabled={!selectedRowKeys.length}
                    onClick={() => dispatch(bulkAction({ ids: selectedRowKeys, action: "status", payload: { status: "solved" } }))
                        .then(() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" })))}>Bulk: Solve</Button>
                <Button disabled={!selectedRowKeys.length}
                    onClick={() => dispatch(bulkAction({ ids: selectedRowKeys, action: "assignee", payload: { assigneeId: "me" } }))
                        .then(() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" })))}>Bulk: Assign to me</Button>
                <Button danger disabled={!selectedRowKeys.length}
                    onClick={() => dispatch(bulkAction({ ids: selectedRowKeys, action: "close", payload: {} }))
                        .then(() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" })))}>Bulk: Close</Button>
            </Space>

            <Table
                rowKey="_id"
                loading={loading}
                dataSource={items}
                columns={columns}
                rowSelection={{ selectedRowKeys, onChange: (keys) => dispatch(setSelected(keys)) }}
                pagination={{
                    current: page, pageSize: limit, total,
                    showSizeChanger: true,
                    onChange: (p, s) => dispatch(setFilters({ page: p, limit: s })),
                }}
                scroll={{ x: 1000 }}
            />

            <Drawer
                title={ticket ? ticket.subject : "Ticket"}
                visible={visible}
                onClose={() => { setVisible(false); dispatch(clearTicket()); }}
                width="clamp(360px, 90vw, 980px)"
                bodyStyle={{ paddingBottom: 80 }}
                extra={ticket && (
                    <Space>
                        <Select size="small" value={ticket.status}
                            onChange={(v) => dispatch(updateTicket({ id: ticket._id, payload: { status: v } }))
                                .then(() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" })))} style={{ width: 130 }}>
                            {["open", "pending", "on_hold", "solved", "closed"].map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                        <Select size="small" value={ticket.priority}
                            onChange={(v) => dispatch(updateTicket({ id: ticket._id, payload: { priority: v } }))
                                .then(() => dispatch(fetchTickets({ q, status, priority, assignee, category, page, limit, sort: "updatedAt:-1" })))} style={{ width: 120 }}>
                            {["low", "medium", "high", "urgent"].map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                        <Select size="small" value={ticket.assignee?.id}
                            onChange={(v) => dispatch(updateTicket({ id: ticket._id, payload: { assigneeId: v } }))
                                .then(() => dispatch(fetchTicket(ticket._id)))} style={{ width: 160 }} placeholder="Assign">
                            <Option value="me">Me</Option>
                        </Select>
                    </Space>
                )}
            >
                {ticketLoading ? "Loading..." : ticket && (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Space split="•" wrap>
                            <Badge status={STATUS_BADGE[ticket.status]} text={ticket.status} />
                            <Tag color={PRIORITY_COLOR[ticket.priority]}>{ticket.priority}</Tag>
                            {ticket.tags?.map(t => <Tag key={t}>{t}</Tag>)}
                            <Text type="secondary">{ticket.requester?.email}</Text>
                            <Text type="secondary">Updated: {new Date(ticket.updatedAt).toLocaleString()}</Text>
                        </Space>

                        <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                            {(ticket.messages || []).map(m => (
                                <div key={m._id} style={{ marginBottom: 12 }}>
                                    <Space split="•" wrap>
                                        <Text strong>{m.author?.name}</Text>
                                        <Text type="secondary">{new Date(m.createdAt).toLocaleString()}</Text>
                                        {m.type === "internal" && <Tag>Internal</Tag>}
                                    </Space>
                                    <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{m.body}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: "sticky", bottom: 0, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                            <Radio.Group value={replyType} onChange={(e) => setReplyType(e.target.value)} style={{ marginBottom: 8 }}>
                                <Radio value="public">Public reply</Radio>
                                <Radio value="internal">Internal note</Radio>
                            </Radio.Group>
                            <Input.TextArea rows={4}
                                placeholder={replyType === "public" ? "Write a reply…" : "Internal note…"}
                                value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                            <Space style={{ marginTop: 8 }}>
                                <Button onClick={() => setReplyBody((p) => p + "\n\nThanks,\nSupport Team")}>Canned: Thanks</Button>
                                <Button type="primary" icon={<SendOutlined />} loading={false} onClick={send}>Send</Button>
                            </Space>
                        </div>
                    </Space>
                )}
            </Drawer>
        </div>
    );
}
