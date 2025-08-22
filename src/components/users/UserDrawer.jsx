import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Space, Button } from "antd";
const { Option } = Select;

export default function UserDrawer({ visible, onClose, record, onSave, onDelete }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (record) form.setFieldsValue({ fullName: record.fullName, role: record.role, status: record.status, company: record.company });
    }, [record, form]);

    if (!record) return null;

    return (
        <Drawer
            title={record.email}
            visible={visible}
            onClose={onClose}
            destroyOnClose
            width="clamp(320px, 100%, 420px)"
        >
            <Form form={form} layout="vertical" onFinish={onSave}>
                <Form.Item label="Full Name" name="fullName"><Input /></Form.Item>
                <Form.Item label="Company" name="company"><Input /></Form.Item>
                <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                    <Select>
                        <Option value="owner">Owner</Option>
                        <Option value="member">member</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                    <Select>
                        <Option value="active">active</Option>
                        <Option value="suspended">suspended</Option>
                    </Select>
                </Form.Item>
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button danger onClick={() => onDelete?.()}>Delete</Button>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Space>
            </Form>
        </Drawer>
    );
}
