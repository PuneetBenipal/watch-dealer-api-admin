import React, { useEffect, useMemo } from "react";
import {
    Row, Col, Table, Button, Drawer, Form, Input, InputNumber, Select,
    Switch, Tag, Space, Popconfirm, message, Typography, Upload, Tooltip
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DollarOutlined, SearchOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchModules, createModule, updateModule, deleteModule, togglePublish,
    selectModulesState, selectModulesFiltered, setQuery, setType, setStatus
} from "../store/slices/modules";
import { CustomToast } from "../components/common/CustomToast";

const { Title, Text } = Typography;

const typeOptions = [
    { value: "core", label: "Core" },
    { value: "add_on", label: "Add-on" },
];
const statusOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "hidden", label: "Hidden" },
];
const categoryOptions = [
    { value: "general", label: "General" },
    { value: "analytics", label: "Analytics" },
    { value: "communication", label: "Communication" },
    { value: "security", label: "Security" },
    { value: "integration", label: "Integration" },
]
const currencies = ["USD", "EUR", "GBP", "AED", "HKD", "JPY"].map((c) => ({ value: c, label: c }));
const statusColor = (s) => (s === "published" ? "green" : s === "draft" ? "orange" : "default");
const slugify = (s = "") =>
    s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function ModulesCMS() {
    const dispatch = useDispatch();
    const { loading, q, type, status } = useSelector(selectModulesState);
    const data = useSelector(selectModulesFiltered);

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchModules());
    }, [dispatch]);

    // const openCreate = () => {
    //     setEditing(null);
    //     form.resetFields();
    //     setDrawerOpen(true);
    // };
    const openEdit = (record) => {
        form.resetFields();
        setEditing(record);
        form.setFieldsValue(record);
        setDrawerOpen(true);
    };

    const onFinish = async (values) => {
        const payload = {
            ...values,
            slug: values.slug || slugify(values.name),
        };

        try {
            if (editing) {
                await dispatch(updateModule({ id: editing?._id, patch: payload })).unwrap();
                CustomToast.success("Module updated");
            } else {
                // await dispatch(createModule(payload)).unwrap();
                // CustomToast.success("Module created");
            }
            setDrawerOpen(false);
            form.resetFields();
        } catch (e) {
            CustomToast.error(String(e));
        }
    };

    // const onDelete = async (record) => {
    //     try {
    //         await dispatch(deleteModule(record._id)).unwrap();
    //         CustomToast.success("Module deleted");
    //     } catch (e) {
    //         CustomToast.error(String(e));
    //     }
    // };

    const handlePublish = async (record, next) => {
        try {
            await dispatch(togglePublish({ id: record._id, publish: next })).unwrap();
            CustomToast.success(next ? "Published" : "Unpublished");
        } catch (e) {
            CustomToast.error(String(e));
        }
    };

    const columns = useMemo(() => ([
        {
            title: "Module",
            dataIndex: "name",
            key: "name",
            render: (text, row) => (
                <Space direction="vertical" size={0} style={{ maxWidth: 520 }}>
                    <Space wrap>
                        <Text strong>{text}</Text>
                        <Tag color={row.type === "core" ? "blue" : "purple"}>{row.type === "core" ? "Core" : "Add-on"}</Tag>
                        {row.featured ? <Tag color="gold">Featured</Tag> : null}
                    </Space>
                    <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                        {row.shortDesc || "-"}
                    </Typography.Paragraph>
                </Space>
            ),
            responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
        },
        {
            title: "Pricing",
            key: "pricing",
            render: (_, r) => (
                <Space wrap>
                    <DollarOutlined />
                    <Text strong>{r.currency} {r.priceMonthly}/mo</Text>
                    <Text type="secondary">· {r.currency} {r.priceYearly}/yr</Text>
                </Space>
            ),
            responsive: ["sm"],
        },
        {
            title: "Trial",
            dataIndex: "trialDays",
            key: "trialDays",
            width: 110,
            render: (d) => (d ? `${d} days` : "-"),
            responsive: ["md"],
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
            responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
        },
        {
            title: "Updated",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 170,
            responsive: ["lg"],
        },
        {
            title: "Actions",
            key: "actions",
            width: 170,
            render: (_, row) => (
                <Space wrap>
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                    </Tooltip>
                    <Tooltip title={row.status === "published" ? "Unpublish" : "Publish"}>
                        <Switch size="small" checked={row.status === "published"} onChange={(v) => handlePublish(row, v)} />
                    </Tooltip>
                    {/* <Popconfirm title="Delete this module?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(row)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm> */}
                </Space>
            ),
            fixed: "right",
            responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
        },
    ]), [handlePublish]);

    return (
        <>
            {/* Toolbar — responsive with Row/Col */}
            <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 12 }}>
                <Col xs={24} md={12}>
                    <Title level={3} style={{ margin: 0 }}>Modules CMS</Title>
                </Col>
                <Col xs={24} md="auto">
                    <Row gutter={[8, 8]} justify="end">
                        <Col xs={24} sm={12} md={12} lg={8} style={{ minWidth: 240 }}>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                placeholder="Search modules…"
                                value={q}
                                onChange={(e) => dispatch(setQuery(e.target.value))}
                            />
                        </Col>
                        <Col xs={12} sm={6} md={6} lg={6}>
                            <Select
                                allowClear
                                placeholder="Type"
                                value={type}
                                onChange={(v) => dispatch(setType(v))}
                                options={typeOptions}
                                style={{ width: "100%", minWidth: 120 }}
                            />
                        </Col>
                        <Col xs={12} sm={6} md={6} lg={6}>
                            <Select
                                allowClear
                                placeholder="Status"
                                value={status}
                                onChange={(v) => dispatch(setStatus(v))}
                                options={statusOptions}
                                style={{ width: "100%", minWidth: 120 }}
                            />
                        </Col>
                        {/* <Col xs={24} sm={24} md="auto" lg={4}>
                            <Button type="primary" icon={<PlusOutlined />} block onClick={openCreate}>
                                New Module
                            </Button>
                        </Col> */}
                    </Row>
                </Col>
            </Row>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 720 }}
            />

            <Drawer
                title={editing ? `Edit Module — ${editing.name}` : "Create Module"}
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width="clamp(320px, 100%, 420px)"
                destroyOnClose
                footer={
                    <Space style={{ float: "right" }}>
                        <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()}>
                            {editing ? "Save Changes" : "Create Module"}
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        type: "add_on",
                        status: "draft",
                        currency: "USD",
                        featured: false,
                        sortOrder: 999,
                    }}
                >
                    <Form.Item name="name" label="Module Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g., WhatsApp Engine" onBlur={(e) => {
                            const name = e.target.value;
                            if (!editing) form.setFieldsValue({ slug: slugify(name) });
                        }} />
                    </Form.Item>

                    <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                        <Input placeholder="whatsapp-engine" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                                <Select options={typeOptions} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                <Select options={categoryOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="shortDesc" label="Short Description" rules={[{ required: true, max: 140 }]}>
                        <Input.TextArea rows={2} showCount maxLength={140} placeholder="One-liner used in cards and lists." />
                    </Form.Item>

                    <Form.Item name="description" label="Full Description" rules={[{ required: true }]}>
                        <Input.TextArea rows={5} placeholder="Detailed description for landing/detail pages." />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="priceMonthly" label="Monthly Price" rules={[{ required: true }]}>
                                <InputNumber min={0} step={1} style={{ width: "100%" }} prefix={<DollarOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="limitMonthly" label="Monthly Limit" rules={[{ required: true }]}>
                                <InputNumber min={0} step={1} style={{ width: "100%" }} prefix={<DollarOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                                <Select options={currencies} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="priceYearly" label="Yearly Price">
                                <InputNumber min={0} step={1} style={{ width: "100%" }} prefix={<DollarOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="limitYearly" label="Yearly Limit">
                                <InputNumber min={0} step={1} style={{ width: "100%" }} prefix={<DollarOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="trialDays" label="Trial (days)">
                                <InputNumber min={0} max={60} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="sortOrder" label="Sort Order">
                                <InputNumber min={0} max={9999} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="status" label="Status">
                                <Select options={statusOptions} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="featured" label="Featured" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </>
    );
}
