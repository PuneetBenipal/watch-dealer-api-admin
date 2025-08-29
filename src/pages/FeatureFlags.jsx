import React, { useState } from "react";
import { Card, Tabs, Table, Switch, Button, Space, Modal, Form, Input, Select, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined } from "@ant-design/icons";
import PageContainer from "../components/common/PageContainer";

const { TabPane } = Tabs;
const { Option } = Select;

export default function FeatureFlags() {
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFlag, setEditingFlag] = useState(null);

    // Mock data for feature flags
    const [featureFlags, setFeatureFlags] = useState([
        {
            id: 1,
            name: "whatsapp_automation",
            displayName: "WhatsApp Automation",
            description: "Enable automated WhatsApp message parsing",
            enabled: true,
            rolloutPercentage: 100,
            environment: "production",
            createdAt: "2024-01-10T10:00:00Z"
        },
        {
            id: 2,
            name: "ai_pricing_engine",
            displayName: "AI Pricing Engine",
            description: "Enable AI-powered pricing suggestions",
            enabled: false,
            rolloutPercentage: 25,
            environment: "staging",
            createdAt: "2024-01-15T14:30:00Z"
        },
        {
            id: 3,
            name: "escrow_service",
            displayName: "Escrow Service",
            description: "Enable escrow transaction features",
            enabled: true,
            rolloutPercentage: 50,
            environment: "production",
            createdAt: "2024-01-20T09:15:00Z"
        }
    ]);

    // Mock data for A/B experiments
    const [experiments, setExperiments] = useState([
        {
            id: 1,
            name: "dashboard_layout_v2",
            displayName: "Dashboard Layout V2",
            description: "Test new dashboard layout with improved metrics",
            status: "running",
            trafficSplit: { control: 50, variant: 50 },
            startDate: "2024-01-15T00:00:00Z",
            endDate: "2024-02-15T00:00:00Z",
            metrics: {
                conversions: { control: 245, variant: 289 },
                engagement: { control: 78.5, variant: 82.3 }
            }
        },
        {
            id: 2,
            name: "pricing_display_format",
            displayName: "Pricing Display Format",
            description: "Test different price formatting options",
            status: "completed",
            trafficSplit: { control: 33, variantA: 33, variantB: 34 },
            startDate: "2024-01-01T00:00:00Z",
            endDate: "2024-01-31T00:00:00Z",
            winner: "variantA"
        }
    ]);

    const flagColumns = [
        { title: "Name", dataIndex: "displayName", key: "displayName" },
        { title: "Key", dataIndex: "name", key: "name", render: (text) => <code>{text}</code> },
        { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
        { 
            title: "Environment", 
            dataIndex: "environment", 
            key: "environment",
            render: (env) => <Tag color={env === 'production' ? 'green' : 'orange'}>{env}</Tag>
        },
        { 
            title: "Rollout %", 
            dataIndex: "rolloutPercentage", 
            key: "rolloutPercentage",
            render: (pct) => `${pct}%`
        },
        {
            title: "Status",
            dataIndex: "enabled",
            key: "enabled",
            render: (enabled, record) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => toggleFlag(record.id, checked)}
                />
            )
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => editFlag(record)}>
                        Edit
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteFlag(record.id)}>
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    const experimentColumns = [
        { title: "Name", dataIndex: "displayName", key: "displayName" },
        { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
        { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status) => {
                const color = status === 'running' ? 'blue' : status === 'completed' ? 'green' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        { 
            title: "Traffic Split", 
            dataIndex: "trafficSplit", 
            key: "trafficSplit",
            render: (split) => Object.entries(split).map(([key, value]) => `${key}: ${value}%`).join(', ')
        },
        { 
            title: "Start Date", 
            dataIndex: "startDate", 
            key: "startDate",
            render: (date) => new Date(date).toLocaleDateString()
        },
        { 
            title: "End Date", 
            dataIndex: "endDate", 
            key: "endDate",
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small">View Results</Button>
                    {record.status === 'running' && (
                        <Button size="small" danger>Stop</Button>
                    )}
                </Space>
            )
        }
    ];

    const toggleFlag = (id, enabled) => {
        setFeatureFlags(prev =>
            prev.map(flag =>
                flag.id === id ? { ...flag, enabled } : flag
            )
        );
        message.success(`Feature flag ${enabled ? 'enabled' : 'disabled'}`);
    };

    const editFlag = (flag) => {
        setEditingFlag(flag);
        form.setFieldsValue(flag);
        setModalVisible(true);
    };

    const deleteFlag = (id) => {
        Modal.confirm({
            title: 'Delete Feature Flag',
            content: 'Are you sure you want to delete this feature flag?',
            onOk: () => {
                setFeatureFlags(prev => prev.filter(flag => flag.id !== id));
                message.success('Feature flag deleted');
            }
        });
    };

    const saveFlag = async (values) => {
        try {
            if (editingFlag) {
                setFeatureFlags(prev =>
                    prev.map(flag =>
                        flag.id === editingFlag.id ? { ...flag, ...values } : flag
                    )
                );
                message.success('Feature flag updated');
            } else {
                const newFlag = {
                    id: Date.now(),
                    ...values,
                    createdAt: new Date().toISOString()
                };
                setFeatureFlags(prev => [...prev, newFlag]);
                message.success('Feature flag created');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingFlag(null);
        } catch (error) {
            message.error('Failed to save feature flag');
        }
    };

    return (
        <PageContainer title="Feature Flags & Experiments">
            <Tabs defaultActiveKey="flags">
                <TabPane tab="Feature Flags" key="flags">
                    <Card
                        title="Feature Flag Management"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingFlag(null);
                                    form.resetFields();
                                    setModalVisible(true);
                                }}
                            >
                                Add Feature Flag
                            </Button>
                        }
                    >
                        <Table
                            dataSource={featureFlags}
                            columns={flagColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="A/B Experiments" key="experiments">
                    <Card
                        title="A/B Test Experiments"
                        extra={
                            <Button type="primary" icon={<ExperimentOutlined />}>
                                Create Experiment
                            </Button>
                        }
                    >
                        <Table
                            dataSource={experiments}
                            columns={experimentColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div style={{ padding: 16 }}>
                                        <h4>Experiment Results</h4>
                                        {record.metrics && (
                                            <div>
                                                <p><strong>Conversions:</strong> Control: {record.metrics.conversions?.control}, Variant: {record.metrics.conversions?.variant}</p>
                                                <p><strong>Engagement:</strong> Control: {record.metrics.engagement?.control}%, Variant: {record.metrics.engagement?.variant}%</p>
                                            </div>
                                        )}
                                        {record.winner && (
                                            <Tag color="green">Winner: {record.winner}</Tag>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Rollout Rules" key="rules">
                    <Card title="Feature Rollout Rules">
                        <p>Configure rules for gradual feature rollouts based on user segments, geographic regions, or other criteria.</p>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button type="primary">Add Rollout Rule</Button>
                            <Button>Import Rules from File</Button>
                            <Button>Export Current Rules</Button>
                        </Space>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={editingFlag ? "Edit Feature Flag" : "Create Feature Flag"}
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingFlag(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={saveFlag}>
                    <Form.Item
                        label="Display Name"
                        name="displayName"
                        rules={[{ required: true, message: "Please enter display name" }]}
                    >
                        <Input placeholder="Human-readable name" />
                    </Form.Item>

                    <Form.Item
                        label="Key"
                        name="name"
                        rules={[{ required: true, message: "Please enter flag key" }]}
                    >
                        <Input placeholder="snake_case_key" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Describe what this flag controls" />
                    </Form.Item>

                    <Form.Item
                        label="Environment"
                        name="environment"
                        rules={[{ required: true, message: "Please select environment" }]}
                    >
                        <Select placeholder="Select environment">
                            <Option value="development">Development</Option>
                            <Option value="staging">Staging</Option>
                            <Option value="production">Production</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Rollout Percentage"
                        name="rolloutPercentage"
                        rules={[{ required: true, message: "Please enter rollout percentage" }]}
                    >
                        <Input type="number" min="0" max="100" placeholder="0-100" />
                    </Form.Item>

                    <Form.Item name="enabled" valuePropName="checked">
                        <input type="checkbox" /> Enabled
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingFlag ? "Update" : "Create"} Flag
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
}
