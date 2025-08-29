import React, { useState } from "react";
import { Card, Tabs, Form, Input, Button, Space, Table, Tag, Modal, message } from "antd";
import { EditOutlined, SaveOutlined, ReloadOutlined, RobotOutlined } from "@ant-design/icons";
import PageContainer from "../components/common/PageContainer";

const { TabPane } = Tabs;
const { TextArea } = Input;

export default function AIServices() {
    const [form] = Form.useForm();
    const [pricingForm] = Form.useForm();
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Mock data for parsing prompts
    const [parsingPrompts, setParsingPrompts] = useState([
        {
            id: 1,
            name: "Watch Listing Parser",
            description: "Extracts watch details from WhatsApp messages",
            prompt: "Extract the following information from this watch listing: brand, model, reference number, price, condition, year, seller location...",
            active: true,
            lastUpdated: "2024-01-15T10:30:00Z"
        },
        {
            id: 2,
            name: "Price Validation",
            description: "Validates if listing prices are reasonable",
            prompt: "Analyze this watch listing price and determine if it's within market range...",
            active: true,
            lastUpdated: "2024-01-10T14:20:00Z"
        }
    ]);

    // Mock data for pricing engine settings
    const [pricingSettings, setPricingSettings] = useState({
        enabled: true,
        confidenceThreshold: 0.85,
        priceVarianceAlert: 20,
        marketDataSources: ["Chrono24", "WatchStation", "Crown & Caliber"],
        updateFrequency: "daily"
    });

    const promptColumns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Description", dataIndex: "description", key: "description", ellipsis: true },
        { 
            title: "Status", 
            dataIndex: "active", 
            key: "active",
            render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Tag>
        },
        { 
            title: "Last Updated", 
            dataIndex: "lastUpdated", 
            key: "lastUpdated",
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => editPrompt(record)}
                    >
                        Edit
                    </Button>
                </Space>
            )
        }
    ];

    const editPrompt = (prompt) => {
        setEditingPrompt(prompt);
        form.setFieldsValue(prompt);
        setModalVisible(true);
    };

    const savePrompt = async (values) => {
        try {
            if (editingPrompt) {
                setParsingPrompts(prev => 
                    prev.map(p => p.id === editingPrompt.id 
                        ? { ...p, ...values, lastUpdated: new Date().toISOString() }
                        : p
                    )
                );
                message.success("Prompt updated successfully");
            }
            setModalVisible(false);
            form.resetFields();
            setEditingPrompt(null);
        } catch (error) {
            message.error("Failed to save prompt");
        }
    };

    const savePricingSettings = async (values) => {
        try {
            setPricingSettings(values);
            message.success("Pricing engine settings updated");
        } catch (error) {
            message.error("Failed to update settings");
        }
    };

    return (
        <PageContainer title="AI Services Management">
            <Tabs defaultActiveKey="parsing">
                <TabPane tab="Parsing Prompts" key="parsing">
                    <Card 
                        title="WhatsApp Message Parsing Prompts"
                        extra={
                            <Button type="primary" icon={<RobotOutlined />}>
                                Test Parsing
                            </Button>
                        }
                    >
                        <Table
                            dataSource={parsingPrompts}
                            columns={promptColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Pricing Engine" key="pricing">
                    <Card title="AI Pricing Engine Configuration">
                        <Form
                            form={pricingForm}
                            layout="vertical"
                            initialValues={pricingSettings}
                            onFinish={savePricingSettings}
                            style={{ maxWidth: 600 }}
                        >
                            <Form.Item
                                label="Enable Pricing Engine"
                                name="enabled"
                                valuePropName="checked"
                            >
                                <input type="checkbox" />
                            </Form.Item>

                            <Form.Item
                                label="Confidence Threshold"
                                name="confidenceThreshold"
                                help="Minimum confidence level for price suggestions (0.0 - 1.0)"
                            >
                                <Input type="number" step="0.01" min="0" max="1" />
                            </Form.Item>

                            <Form.Item
                                label="Price Variance Alert (%)"
                                name="priceVarianceAlert"
                                help="Alert when price differs from market average by this percentage"
                            >
                                <Input type="number" min="1" max="100" />
                            </Form.Item>

                            <Form.Item
                                label="Market Data Sources"
                                name="marketDataSources"
                            >
                                <Input placeholder="Comma-separated list of sources" />
                            </Form.Item>

                            <Form.Item
                                label="Update Frequency"
                                name="updateFrequency"
                            >
                                <select>
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                        Save Settings
                                    </Button>
                                    <Button icon={<ReloadOutlined />}>
                                        Test Connection
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                <TabPane tab="Description Tool" key="descriptions">
                    <Card title="Watch Description AI Tool">
                        <p>Fine-tune the AI model for generating watch descriptions from images and basic information.</p>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button type="primary">Upload Training Data</Button>
                            <Button>View Model Performance</Button>
                            <Button>Retrain Model</Button>
                        </Space>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={`Edit ${editingPrompt?.name || 'Prompt'}`}
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingPrompt(null);
                }}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={savePrompt}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter prompt name" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Prompt"
                        name="prompt"
                        rules={[{ required: true, message: "Please enter prompt text" }]}
                    >
                        <TextArea rows={8} placeholder="Enter your AI prompt here..." />
                    </Form.Item>

                    <Form.Item name="active" valuePropName="checked">
                        <input type="checkbox" /> Active
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Prompt
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
