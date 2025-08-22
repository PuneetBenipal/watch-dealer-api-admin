import React from "react";
import { Modal, Form, Input, Select } from "antd";
const { Option } = Select;

export default function InviteUserModal({ visible, onCancel, onOk }) {
    const [form] = Form.useForm();
    const submit = () => form.validateFields().then(vals => onOk?.(vals)).then(() => form.resetFields());

    return (
        <Modal title="Invite User" visible={visible} onCancel={onCancel} onOk={submit} destroyOnClose>
            <Form form={form} layout="vertical">
                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="user@company.com" />
                </Form.Item>
                <Form.Item label="Name" name="name"><Input placeholder="Optional" /></Form.Item>
                <Form.Item label="Company" name="company"><Input placeholder="Acme Watches" /></Form.Item>
                <Form.Item label="Role" name="role" initialValue="agent">
                    <Select>
                        <Option value="admin">admin</Option>
                        <Option value="agent">agent</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
