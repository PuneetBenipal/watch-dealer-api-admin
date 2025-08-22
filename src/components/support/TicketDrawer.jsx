import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Space, Button } from "antd";
import { useDispatch } from "react-redux";
import { updateTicket, fetchTickets } from "../../store/slices/tickets";

const { TextArea } = Input;
const { Option } = Select;

export default function TicketDrawer({ open, onClose, record }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!record) return;
        form.setFieldsValue({
            subject: record.subject,
            status: record.status,
            priority: record.priority,
            assignee: record.assignee || "",
            description: record.description || "",
        });
    }, [record, form]);

    if (!record) return null;

    const submit = async (vals) => {
        await dispatch(updateTicket({
            id: record._id || record.id,
            patch: {
                subject: vals.subject,
                status: vals.status,
                priority: vals.priority,
                assignee: vals.assignee || null,
                description: vals.description,
            }
        }));
        dispatch(fetchTickets());
        onClose?.();
    };

    return (
        <Drawer
            title={`Ticket ${record._id || record.id}`}
            visible={open}
            onClose={onClose}
            width="clamp(320px, 100%, 520px)"
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={submit}>
                <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select>
                        <Option value="open">Open</Option>
                        <Option value="in_progress">In Progress</Option>
                        <Option value="resolved">Resolved</Option>
                        <Option value="closed">Closed</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="priority" label="Priority">
                    <Select>
                        <Option value="high">High</Option>
                        <Option value="normal">Normal</Option>
                        <Option value="low">Low</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="assignee" label="Assignee (email)">
                    <Input placeholder="me@yourco.com" />
                </Form.Item>
                <Form.Item name="description" label="Description"><TextArea rows={4} /></Form.Item>
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Space>
            </Form>
        </Drawer>
    );
}
