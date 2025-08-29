import React, { useState } from "react";
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, Tag, Statistic, Row, Col, message } from "antd";
import { ApiOutlined, BugOutlined, DatabaseOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import PageContainer from "../components/common/PageContainer";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export default function DeveloperTools() {
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // Mock data for API usage logs
    const [apiLogs, setApiLogs] = useState([
        {
            id: 1,
            endpoint: "/api/superadmin/users",
            method: "GET",
            statusCode: 200,
            responseTime: 145,
            timestamp: "2024-01-20T10:30:00Z",
            userAgent: "Mozilla/5.0...",
            ipAddress: "192.168.1.100"
        },
        {
            id: 2,
            endpoint: "/api/superadmin/companies",
            method: "POST",
            statusCode: 201,
            responseTime: 289,
            timestamp: "2024-01-20T10:25:00Z",
            userAgent: "PostmanRuntime/7.32.3",
            ipAddress: "10.0.0.50"
        },
        {
            id: 3,
            endpoint: "/api/superadmin/billing/invoices",
            method: "GET",
            statusCode: 500,
            responseTime: 5000,
            timestamp: "2024-01-20T10:20:00Z",
            userAgent: "axios/1.6.0",
            ipAddress: "172.16.0.25"
        }
    ]);

    // Mock data for webhook delivery logs
    const [webhookLogs, setWebhookLogs] = useState([
        {
            id: 1,
            url: "https://client.example.com/webhook/payment",
            event: "payment.completed",
            status: "success",
            attempts: 1,
            lastAttempt: "2024-01-20T10:30:00Z",
            nextRetry: null,
            payload: { invoiceId: "inv_123", amount: 1500 }
        },
        {
            id: 2,
            url: "https://partner.example.com/webhook/user",
            event: "user.created",
            status: "failed",
            attempts: 3,
            lastAttempt: "2024-01-20T10:25:00Z",
            nextRetry: "2024-01-20T11:25:00Z",
            payload: { userId: "user_456", email: "test@example.com" }
        },
        {
            id: 3,
            url: "https://integration.example.com/webhook/inventory",
            event: "inventory.updated",
            status: "pending",
            attempts: 1,
            lastAttempt: "2024-01-20T10:20:00Z",
            nextRetry: "2024-01-20T10:22:00Z",
            payload: { watchId: "watch_789", status: "sold" }
        }
    ]);

    // Mock data for database inspector
    const [dbTables, setDbTables] = useState([
        { name: "users", rowCount: 1247, size: "2.3 MB", lastModified: "2024-01-20T09:45:00Z" },
        { name: "companies", rowCount: 89, size: "156 KB", lastModified: "2024-01-20T08:30:00Z" },
        { name: "invoices", rowCount: 3456, size: "5.7 MB", lastModified: "2024-01-20T10:15:00Z" },
        { name: "inventory", rowCount: 12890, size: "15.2 MB", lastModified: "2024-01-20T10:30:00Z" },
        { name: "payments", rowCount: 2134, size: "3.1 MB", lastModified: "2024-01-20T09:20:00Z" }
    ]);

    // Mock data for manual jobs
    const [availableJobs, setAvailableJobs] = useState([
        { id: "sync_exchange_rates", name: "Sync Exchange Rates", description: "Update currency exchange rates from external API" },
        { id: "process_whatsapp_messages", name: "Process WhatsApp Messages", description: "Parse pending WhatsApp messages" },
        { id: "generate_daily_reports", name: "Generate Daily Reports", description: "Create daily analytics reports" },
        { id: "cleanup_temp_files", name: "Cleanup Temp Files", description: "Remove temporary files older than 7 days" },
        { id: "backup_database", name: "Backup Database", description: "Create full database backup" }
    ]);

    const apiColumns = [
        { title: "Endpoint", dataIndex: "endpoint", key: "endpoint", width: 250 },
        { 
            title: "Method", 
            dataIndex: "method", 
            key: "method", 
            width: 80,
            render: (method) => <Tag color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : 'orange'}>{method}</Tag>
        },
        { 
            title: "Status", 
            dataIndex: "statusCode", 
            key: "statusCode", 
            width: 80,
            render: (code) => <Tag color={code < 300 ? 'green' : code < 500 ? 'orange' : 'red'}>{code}</Tag>
        },
        { title: "Response Time", dataIndex: "responseTime", key: "responseTime", width: 120, render: (time) => `${time}ms` },
        { title: "Timestamp", dataIndex: "timestamp", key: "timestamp", width: 180, render: (ts) => new Date(ts).toLocaleString() },
        { title: "IP Address", dataIndex: "ipAddress", key: "ipAddress", width: 120 },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_, record) => (
                <Button size="small" onClick={() => viewLogDetails(record)}>
                    Details
                </Button>
            )
        }
    ];

    const webhookColumns = [
        { title: "URL", dataIndex: "url", key: "url", ellipsis: true },
        { title: "Event", dataIndex: "event", key: "event", render: (event) => <Tag color="purple">{event}</Tag> },
        { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status) => <Tag color={status === 'success' ? 'green' : status === 'failed' ? 'red' : 'orange'}>{status}</Tag>
        },
        { title: "Attempts", dataIndex: "attempts", key: "attempts" },
        { title: "Last Attempt", dataIndex: "lastAttempt", key: "lastAttempt", render: (ts) => new Date(ts).toLocaleString() },
        { title: "Next Retry", dataIndex: "nextRetry", key: "nextRetry", render: (ts) => ts ? new Date(ts).toLocaleString() : '-' },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small">View Payload</Button>
                    {record.status === 'failed' && <Button size="small" type="primary">Retry</Button>}
                </Space>
            )
        }
    ];

    const dbColumns = [
        { title: "Table Name", dataIndex: "name", key: "name" },
        { title: "Row Count", dataIndex: "rowCount", key: "rowCount", render: (count) => count.toLocaleString() },
        { title: "Size", dataIndex: "size", key: "size" },
        { title: "Last Modified", dataIndex: "lastModified", key: "lastModified", render: (ts) => new Date(ts).toLocaleString() },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small">Query</Button>
                    <Button size="small">Export</Button>
                    <Button size="small">Analyze</Button>
                </Space>
            )
        }
    ];

    const viewLogDetails = (log) => {
        setSelectedLog(log);
        setModalVisible(true);
    };

    const runJob = async (jobId) => {
        try {
            message.loading(`Running job: ${jobId}...`);
            // Simulate job execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            message.success(`Job ${jobId} completed successfully`);
        } catch (error) {
            message.error(`Job ${jobId} failed`);
        }
    };

    return (
        <PageContainer title="Developer Tools">
            <Tabs defaultActiveKey="api-usage">
                <TabPane tab="API Usage Logs" key="api-usage">
                    <Card title="API Request Monitoring">
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={6}>
                                <Statistic title="Total Requests (24h)" value={1247} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="Success Rate" value={98.2} suffix="%" />
                            </Col>
                            <Col span={6}>
                                <Statistic title="Avg Response Time" value={245} suffix="ms" />
                            </Col>
                            <Col span={6}>
                                <Statistic title="Error Rate" value={1.8} suffix="%" />
                            </Col>
                        </Row>
                        <Table
                            dataSource={apiLogs}
                            columns={apiColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1000 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Webhook Delivery" key="webhooks">
                    <Card 
                        title="Webhook Delivery Logs"
                        extra={
                            <Button icon={<ReloadOutlined />}>
                                Refresh
                            </Button>
                        }
                    >
                        <Table
                            dataSource={webhookLogs}
                            columns={webhookColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1000 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Database Inspector" key="database">
                    <Card title="Database Table Inspector">
                        <Table
                            dataSource={dbTables}
                            columns={dbColumns}
                            rowKey="name"
                            pagination={false}
                        />
                        
                        <div style={{ marginTop: 24 }}>
                            <h3>Quick Query</h3>
                            <Form layout="vertical">
                                <Form.Item label="SQL Query">
                                    <TextArea 
                                        rows={4} 
                                        placeholder="SELECT * FROM users WHERE created_at > '2024-01-01' LIMIT 10;"
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Space>
                                        <Button type="primary" icon={<PlayCircleOutlined />}>
                                            Execute Query
                                        </Button>
                                        <Button>
                                            Explain Query
                                        </Button>
                                        <Button danger>
                                            Validate Only
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    </Card>
                </TabPane>

                <TabPane tab="Manual Jobs" key="jobs">
                    <Card title="Manual Job Trigger">
                        <div style={{ display: 'grid', gap: 16 }}>
                            {availableJobs.map(job => (
                                <Card key={job.id} size="small">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{job.name}</h4>
                                            <p style={{ margin: 0, color: '#666' }}>{job.description}</p>
                                        </div>
                                        <Button 
                                            type="primary" 
                                            onClick={() => runJob(job.id)}
                                            icon={<PlayCircleOutlined />}
                                        >
                                            Run Job
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </Card>
                </TabPane>

                <TabPane tab="System Health" key="health">
                    <Card title="System Health Monitoring">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Card>
                                    <Statistic title="CPU Usage" value={23.4} suffix="%" />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic title="Memory Usage" value={67.8} suffix="%" />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic title="Disk Usage" value={45.2} suffix="%" />
                                </Card>
                            </Col>
                        </Row>
                        
                        <div style={{ marginTop: 24 }}>
                            <h3>Service Status</h3>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Database Connection</span>
                                    <Tag color="green">Healthy</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Redis Cache</span>
                                    <Tag color="green">Healthy</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>WhatsApp API</span>
                                    <Tag color="orange">Warning</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Email Service</span>
                                    <Tag color="green">Healthy</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>File Storage</span>
                                    <Tag color="green">Healthy</Tag>
                                </div>
                            </Space>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title="API Request Details"
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedLog(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedLog && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>Endpoint:</strong> {selectedLog.endpoint}</p>
                                <p><strong>Method:</strong> <Tag color="blue">{selectedLog.method}</Tag></p>
                                <p><strong>Status Code:</strong> <Tag color="green">{selectedLog.statusCode}</Tag></p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Response Time:</strong> {selectedLog.responseTime}ms</p>
                                <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
                                <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                            </Col>
                        </Row>
                        <div style={{ marginTop: 16 }}>
                            <h4>User Agent</h4>
                            <code style={{ display: 'block', padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                {selectedLog.userAgent}
                            </code>
                        </div>
                    </div>
                )}
            </Modal>
        </PageContainer>
    );
}
