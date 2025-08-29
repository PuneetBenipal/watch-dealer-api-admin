import React, { useState } from "react";
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, Switch, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, SendOutlined, BellOutlined } from "@ant-design/icons";
import PageContainer from "../components/common/PageContainer";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export default function Notifications() {
    const [form] = Form.useForm();
    const [templateForm] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Mock data for email templates
    const [emailTemplates, setEmailTemplates] = useState([
        {
            id: 1,
            name: "Welcome Email",
            subject: "Welcome to WatchDealerHub",
            type: "welcome",
            active: true,
            lastModified: "2024-01-15T10:30:00Z"
        },
        {
            id: 2,
            name: "Payment Reminder",
            subject: "Payment Due Reminder",
            type: "billing",
            active: true,
            lastModified: "2024-01-10T14:20:00Z"
        },
        {
            id: 3,
            name: "Account Suspended",
            subject: "Account Suspension Notice",
            type: "account",
            active: false,
            lastModified: "2024-01-05T09:15:00Z"
        }
    ]);

    // Mock data for in-app alerts
    const [inAppAlerts, setInAppAlerts] = useState([
        {
            id: 1,
            title: "System Maintenance",
            message: "Scheduled maintenance on Sunday 2AM-4AM EST",
            type: "info",
            active: true,
            startDate: "2024-02-01T00:00:00Z",
            endDate: "2024-02-02T00:00:00Z"
        },
        {
            id: 2,
            title: "New Feature Available",
            message: "AI Pricing Engine is now available for Pro users",
            type: "feature",
            active: true,
            startDate: "2024-01-20T00:00:00Z",
            endDate: null
        }
    ]);

    // Mock data for WhatsApp bot settings
    const [whatsAppSettings, setWhatsAppSettings] = useState({
        enabled: true,
        webhookUrl: "https://api.watchdealerhub.com/webhook/whatsapp",
        accessToken: "EAAG...",
        verifyToken: "verify_token_123",
        phoneNumberId: "123456789",
        businessAccountId: "987654321"
    });

    const templateColumns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Subject", dataIndex: "subject", key: "subject" },
        { 
            title: "Type", 
            dataIndex: "type", 
            key: "type",
            render: (type) => <Tag color="blue">{type}</Tag>
        },
        { 
            title: "Status", 
            dataIndex: "active", 
            key: "active",
            render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Tag>
        },
        { 
            title: "Last Modified", 
            dataIndex: "lastModified", 
            key: "lastModified",
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => editTemplate(record)}>
                        Edit
                    </Button>
                    <Button size="small" icon={<SendOutlined />}>
                        Test Send
                    </Button>
                </Space>
            )
        }
    ];

    const alertColumns = [
        { title: "Title", dataIndex: "title", key: "title" },
        { title: "Message", dataIndex: "message", key: "message", ellipsis: true },
        { 
            title: "Type", 
            dataIndex: "type", 
            key: "type",
            render: (type) => {
                const color = type === 'info' ? 'blue' : type === 'warning' ? 'orange' : 'green';
                return <Tag color={color}>{type}</Tag>;
            }
        },
        { 
            title: "Status", 
            dataIndex: "active", 
            key: "active",
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={(checked) => toggleAlert(record.id, checked)}
                />
            )
        },
        { 
            title: "Start Date", 
            dataIndex: "startDate", 
            key: "startDate",
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />}>
                        Edit
                    </Button>
                    <Button size="small" danger>
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    const editTemplate = (template) => {
        setEditingTemplate(template);
        templateForm.setFieldsValue(template);
        setTemplateModalVisible(true);
    };

    const toggleAlert = (id, active) => {
        setInAppAlerts(prev =>
            prev.map(alert =>
                alert.id === id ? { ...alert, active } : alert
            )
        );
        message.success(`Alert ${active ? 'activated' : 'deactivated'}`);
    };

    const saveTemplate = async (values) => {
        try {
            if (editingTemplate) {
                setEmailTemplates(prev =>
                    prev.map(template =>
                        template.id === editingTemplate.id 
                            ? { ...template, ...values, lastModified: new Date().toISOString() }
                            : template
                    )
                );
                message.success('Template updated');
            } else {
                const newTemplate = {
                    id: Date.now(),
                    ...values,
                    lastModified: new Date().toISOString()
                };
                setEmailTemplates(prev => [...prev, newTemplate]);
                message.success('Template created');
            }
            setTemplateModalVisible(false);
            templateForm.resetFields();
            setEditingTemplate(null);
        } catch (error) {
            message.error('Failed to save template');
        }
    };

    const saveWhatsAppSettings = async (values) => {
        try {
            setWhatsAppSettings(values);
            message.success('WhatsApp bot settings updated');
        } catch (error) {
            message.error('Failed to update settings');
        }
    };

    return (
        <PageContainer title="Notifications & Alerts">
            <Tabs defaultActiveKey="email-templates">
                <TabPane tab="Email Templates" key="email-templates">
                    <Card
                        title="Email Template Management"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingTemplate(null);
                                    templateForm.resetFields();
                                    setTemplateModalVisible(true);
                                }}
                            >
                                Add Template
                            </Button>
                        }
                    >
                        <Table
                            dataSource={emailTemplates}
                            columns={templateColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="In-App Alerts" key="in-app-alerts">
                    <Card
                        title="In-App Alert Management"
                        extra={
                            <Button type="primary" icon={<BellOutlined />}>
                                Create Alert
                            </Button>
                        }
                    >
                        <Table
                            dataSource={inAppAlerts}
                            columns={alertColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="WhatsApp Bot" key="whatsapp-bot">
                    <Card title="WhatsApp Bot Configuration">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={whatsAppSettings}
                            onFinish={saveWhatsAppSettings}
                            style={{ maxWidth: 600 }}
                        >
                            <Form.Item name="enabled" valuePropName="checked">
                                <Switch /> Enable WhatsApp Bot
                            </Form.Item>

                            <Form.Item
                                label="Webhook URL"
                                name="webhookUrl"
                                rules={[{ required: true, type: 'url', message: "Please enter valid webhook URL" }]}
                            >
                                <Input placeholder="https://api.watchdealerhub.com/webhook/whatsapp" />
                            </Form.Item>

                            <Form.Item
                                label="Access Token"
                                name="accessToken"
                                rules={[{ required: true, message: "Please enter access token" }]}
                            >
                                <Input.Password placeholder="EAAG..." />
                            </Form.Item>

                            <Form.Item
                                label="Verify Token"
                                name="verifyToken"
                                rules={[{ required: true, message: "Please enter verify token" }]}
                            >
                                <Input placeholder="verify_token_123" />
                            </Form.Item>

                            <Form.Item
                                label="Phone Number ID"
                                name="phoneNumberId"
                                rules={[{ required: true, message: "Please enter phone number ID" }]}
                            >
                                <Input placeholder="123456789" />
                            </Form.Item>

                            <Form.Item
                                label="Business Account ID"
                                name="businessAccountId"
                                rules={[{ required: true, message: "Please enter business account ID" }]}
                            >
                                <Input placeholder="987654321" />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Save Settings
                                    </Button>
                                    <Button>
                                        Test Connection
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                <TabPane tab="Broadcast" key="broadcast">
                    <Card title="Broadcast Notifications">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button type="primary" size="large">
                                Send System-Wide Announcement
                            </Button>
                            <Button size="large">
                                Schedule Maintenance Notice
                            </Button>
                            <Button size="large">
                                Send Feature Update Alert
                            </Button>
                        </Space>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={editingTemplate ? "Edit Email Template" : "Create Email Template"}
                visible={templateModalVisible}
                onCancel={() => {
                    setTemplateModalVisible(false);
                    templateForm.resetFields();
                    setEditingTemplate(null);
                }}
                footer={null}
                width={800}
            >
                <Form form={templateForm} layout="vertical" onFinish={saveTemplate}>
                    <Form.Item
                        label="Template Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter template name" }]}
                    >
                        <Input placeholder="Welcome Email" />
                    </Form.Item>

                    <Form.Item
                        label="Subject Line"
                        name="subject"
                        rules={[{ required: true, message: "Please enter subject line" }]}
                    >
                        <Input placeholder="Welcome to WatchDealerHub" />
                    </Form.Item>

                    <Form.Item
                        label="Template Type"
                        name="type"
                        rules={[{ required: true, message: "Please select template type" }]}
                    >
                        <Select placeholder="Select type">
                            <Option value="welcome">Welcome</Option>
                            <Option value="billing">Billing</Option>
                            <Option value="account">Account</Option>
                            <Option value="marketing">Marketing</Option>
                            <Option value="system">System</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Email Content"
                        name="content"
                        rules={[{ required: true, message: "Please enter email content" }]}
                    >
                        <TextArea rows={8} placeholder="Enter email HTML content..." />
                    </Form.Item>

                    <Form.Item name="active" valuePropName="checked">
                        <input type="checkbox" /> Active
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingTemplate ? "Update" : "Create"} Template
                            </Button>
                            <Button onClick={() => setTemplateModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
}
