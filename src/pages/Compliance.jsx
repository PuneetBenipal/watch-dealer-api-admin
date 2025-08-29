import React, { useState } from "react";
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, Tag, Upload, message } from "antd";
import { UploadOutlined, DownloadOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import PageContainer from "../components/common/PageContainer";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export default function Compliance() {
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);

    // Mock data for policies
    const [policies, setPolicies] = useState([
        {
            id: 1,
            name: "Terms of Service",
            type: "terms",
            version: "2.1",
            status: "active",
            lastUpdated: "2024-01-15T10:30:00Z",
            effectiveDate: "2024-02-01T00:00:00Z"
        },
        {
            id: 2,
            name: "Privacy Policy",
            type: "privacy",
            version: "1.8",
            status: "active",
            lastUpdated: "2024-01-10T14:20:00Z",
            effectiveDate: "2024-01-15T00:00:00Z"
        },
        {
            id: 3,
            name: "Cookie Policy",
            type: "cookies",
            version: "1.2",
            status: "draft",
            lastUpdated: "2024-01-20T09:15:00Z",
            effectiveDate: null
        }
    ]);

    // Mock data for GDPR requests
    const [gdprRequests, setGdprRequests] = useState([
        {
            id: 1,
            userId: "user_123",
            userEmail: "john@example.com",
            requestType: "data_export",
            status: "completed",
            requestDate: "2024-01-10T10:00:00Z",
            completedDate: "2024-01-12T15:30:00Z"
        },
        {
            id: 2,
            userId: "user_456",
            userEmail: "jane@example.com",
            requestType: "data_deletion",
            status: "pending",
            requestDate: "2024-01-15T14:20:00Z",
            completedDate: null
        },
        {
            id: 3,
            userId: "user_789",
            userEmail: "bob@example.com",
            requestType: "data_portability",
            status: "in_progress",
            requestDate: "2024-01-18T09:45:00Z",
            completedDate: null
        }
    ]);

    // Mock data for KYC reviews
    const [kycReviews, setKycReviews] = useState([
        {
            id: 1,
            userId: "user_101",
            companyName: "Luxury Watches Ltd",
            submissionDate: "2024-01-12T10:00:00Z",
            status: "approved",
            reviewedBy: "admin@watchdealerhub.com",
            reviewDate: "2024-01-14T16:30:00Z",
            documents: ["business_license.pdf", "tax_certificate.pdf"]
        },
        {
            id: 2,
            userId: "user_102",
            companyName: "TimeKeepers Inc",
            submissionDate: "2024-01-16T14:20:00Z",
            status: "pending_review",
            reviewedBy: null,
            reviewDate: null,
            documents: ["business_license.pdf", "bank_statement.pdf", "id_verification.pdf"]
        },
        {
            id: 3,
            userId: "user_103",
            companyName: "Watch Traders Co",
            submissionDate: "2024-01-18T09:15:00Z",
            status: "rejected",
            reviewedBy: "admin@watchdealerhub.com",
            reviewDate: "2024-01-19T11:45:00Z",
            documents: ["incomplete_docs.pdf"],
            rejectionReason: "Incomplete documentation provided"
        }
    ]);

    const policyColumns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Type", dataIndex: "type", key: "type", render: (type) => <Tag color="blue">{type}</Tag> },
        { title: "Version", dataIndex: "version", key: "version" },
        { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status}</Tag>
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
                    <Button size="small" icon={<EyeOutlined />} onClick={() => viewPolicy(record)}>
                        View
                    </Button>
                    <Button size="small">Edit</Button>
                    <Button size="small">Publish</Button>
                </Space>
            )
        }
    ];

    const gdprColumns = [
        { title: "User Email", dataIndex: "userEmail", key: "userEmail" },
        { 
            title: "Request Type", 
            dataIndex: "requestType", 
            key: "requestType",
            render: (type) => <Tag color="purple">{type.replace('_', ' ')}</Tag>
        },
        { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status) => {
                const color = status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'blue';
                return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
            }
        },
        { 
            title: "Request Date", 
            dataIndex: "requestDate", 
            key: "requestDate",
            render: (date) => new Date(date).toLocaleDateString()
        },
        { 
            title: "Completed Date", 
            dataIndex: "completedDate", 
            key: "completedDate",
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    {record.status === 'pending' && (
                        <Button size="small" type="primary">Process</Button>
                    )}
                    {record.status === 'completed' && (
                        <Button size="small" icon={<DownloadOutlined />}>Download</Button>
                    )}
                </Space>
            )
        }
    ];

    const kycColumns = [
        { title: "Company", dataIndex: "companyName", key: "companyName" },
        { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status) => {
                const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
                const icon = status === 'approved' ? <CheckCircleOutlined /> : status === 'rejected' ? <ExclamationCircleOutlined /> : null;
                return <Tag color={color} icon={icon}>{status.replace('_', ' ')}</Tag>;
            }
        },
        { 
            title: "Submission Date", 
            dataIndex: "submissionDate", 
            key: "submissionDate",
            render: (date) => new Date(date).toLocaleDateString()
        },
        { title: "Documents", dataIndex: "documents", key: "documents", render: (docs) => docs.length },
        { title: "Reviewed By", dataIndex: "reviewedBy", key: "reviewedBy", render: (by) => by || '-' },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />}>Review</Button>
                    {record.status === 'pending_review' && (
                        <>
                            <Button size="small" type="primary">Approve</Button>
                            <Button size="small" danger>Reject</Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const viewPolicy = (policy) => {
        setViewingPolicy(policy);
        setModalVisible(true);
    };

    return (
        <PageContainer title="Legal & Compliance">
            <Tabs defaultActiveKey="policies">
                <TabPane tab="Policies" key="policies">
                    <Card
                        title="Terms & Privacy Policy Editor"
                        extra={
                            <Button type="primary">
                                Create New Policy
                            </Button>
                        }
                    >
                        <Table
                            dataSource={policies}
                            columns={policyColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="GDPR Tools" key="gdpr">
                    <Card title="GDPR Data Requests">
                        <Table
                            dataSource={gdprRequests}
                            columns={gdprColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="KYC Review" key="kyc">
                    <Card
                        title="KYC Document Review for Escrow"
                        extra={
                            <Space>
                                <Button>Export KYC Report</Button>
                                <Button type="primary">Bulk Review</Button>
                            </Space>
                        }
                    >
                        <Table
                            dataSource={kycReviews}
                            columns={kycColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div style={{ padding: 16 }}>
                                        <h4>Documents Submitted:</h4>
                                        <ul>
                                            {record.documents.map((doc, index) => (
                                                <li key={index}>
                                                    {doc} 
                                                    <Button size="small" style={{ marginLeft: 8 }}>
                                                        Download
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        {record.rejectionReason && (
                                            <div>
                                                <h4>Rejection Reason:</h4>
                                                <p>{record.rejectionReason}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Audit Trail" key="audit">
                    <Card title="Compliance Audit Trail">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button type="primary" size="large">
                                Generate Compliance Report
                            </Button>
                            <Button size="large">
                                Export User Data Logs
                            </Button>
                            <Button size="large">
                                View Data Processing Activities
                            </Button>
                            <Button size="large">
                                Download GDPR Compliance Certificate
                            </Button>
                        </Space>
                    </Card>
                </TabPane>

                <TabPane tab="Data Retention" key="retention">
                    <Card title="Data Retention Policies">
                        <Form layout="vertical" style={{ maxWidth: 600 }}>
                            <Form.Item label="User Data Retention (days)">
                                <Input type="number" defaultValue="2555" placeholder="7 years default" />
                            </Form.Item>
                            <Form.Item label="Transaction Data Retention (days)">
                                <Input type="number" defaultValue="3650" placeholder="10 years default" />
                            </Form.Item>
                            <Form.Item label="Log Data Retention (days)">
                                <Input type="number" defaultValue="365" placeholder="1 year default" />
                            </Form.Item>
                            <Form.Item label="Backup Data Retention (days)">
                                <Input type="number" defaultValue="90" placeholder="3 months default" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary">Update Retention Policies</Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={`Policy: ${viewingPolicy?.name}`}
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setViewingPolicy(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Close
                    </Button>,
                    <Button key="edit" type="primary">
                        Edit Policy
                    </Button>
                ]}
                width={800}
            >
                {viewingPolicy && (
                    <div>
                        <p><strong>Type:</strong> {viewingPolicy.type}</p>
                        <p><strong>Version:</strong> {viewingPolicy.version}</p>
                        <p><strong>Status:</strong> <Tag color={viewingPolicy.status === 'active' ? 'green' : 'orange'}>{viewingPolicy.status}</Tag></p>
                        <p><strong>Last Updated:</strong> {new Date(viewingPolicy.lastUpdated).toLocaleString()}</p>
                        {viewingPolicy.effectiveDate && (
                            <p><strong>Effective Date:</strong> {new Date(viewingPolicy.effectiveDate).toLocaleString()}</p>
                        )}
                        <div style={{ marginTop: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                            <h4>Policy Content Preview</h4>
                            <p>Policy content would be displayed here...</p>
                        </div>
                    </div>
                )}
            </Modal>
        </PageContainer>
    );
}
