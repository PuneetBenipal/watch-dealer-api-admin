import React, { useEffect, useState } from "react";
import {
    Table, Tag, Space, Input, Select, message, Grid, Drawer, Form, Button
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import CompanyDrawer from "../components/companies/CompanyDrawer";
import ModuleTogglesCell from "../components/companies/ModuleTogglesCell";
import {
    fetchCompanies,
    setCompanyFilters,
    toggleCompanyModule,
} from "../store/slices/companies";

const { Option } = Select;
const { useBreakpoint } = Grid;

export default function Companies() {
    const dispatch = useDispatch();
    const { items, total, page, pageSize, status, filters, toggling, error } =
        useSelector((s) => s.companies);

    const [drawer, setDrawer] = useState({ open: false, rec: null });
    const [filterOpen, setFilterOpen] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => { if (error) message.error(error); }, [error]);

    useEffect(() => {
        dispatch(fetchCompanies({ page, pageSize, ...filters }));
    }, [dispatch, page, pageSize, filters.q, filters.status, filters.plan]);

    const onToggle = (row, key, value) => {
        dispatch(toggleCompanyModule({ id: row._id || row.id, key, enabled: value }));
    };

    const openEdit = (row) => setDrawer({ open: true, rec: row });

    const columns = [
        { title: "Company", dataIndex: "name", ellipsis: true },
        { title: "Plan", dataIndex: "planId", ellipsis: true },
        { title: "Renewal", dataIndex: "renewalDate", render: (d) => (d ? d : "—")},
        {
            title: "Seats",
            dataIndex: "seats",
            render: (s) => (s ? `${s.used || 0}/${s.purchased || 0}` : "—")
        },
        {
            title: "Status",
            dataIndex: "planStatus",
            render: (s) => <Tag color={s === "active" ? "green" : "volcano"}>{s || "—"}</Tag>,
        },
        {
            title: "Modules",
            render: (_, row) => <ModuleTogglesCell company={row} onToggle={onToggle} />,
        },
        { title: "Date", dataIndex: "createdAt", ellipsis: true },
    ];

    const FiltersBar = (
        <Space wrap style={{ width: "100%", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
            {!isMobile && (
                <>
                    <Input.Search
                        placeholder="Search company"
                        allowClear
                        style={{ width: 240 }}
                        defaultValue={filters.q}
                        onSearch={(q) => dispatch(setCompanyFilters({ q }))}
                    />
                    <Select
                        placeholder="Plan"
                        allowClear
                        style={{ width: 160 }}
                        value={filters.plan}
                        onChange={(v) => dispatch(setCompanyFilters({ plan: v }))}
                    >
                        <Option value="basic">Basic</Option>
                        <Option value="pro">Pro</Option>
                        <Option value="enterprise">Enterprise</Option>
                    </Select>
                    <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: 140 }}
                        value={filters.status}
                        onChange={(v) => dispatch(setCompanyFilters({ status: v }))}
                    >
                        <Option value="active">Active</Option>
                        <Option value="past_due">Past Due</Option>
                        <Option value="canceled">Canceled</Option>
                    </Select>
                </>
            )}
            {isMobile && (
                <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
                    Filters
                </Button>
            )}
        </Space>
    );

    return (
        <PageContainer title="Companies" extra={FiltersBar}>
            {/* Mobile Filters Drawer (AntD v4 uses `visible`) */}
            <Drawer
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                title="Filters"
                width="clamp(320px, 100%, 420px)"
                bodyStyle={{ paddingBottom: 16 }}
                destroyOnClose
                getContainer={false}
            >
                <Form
                    layout="vertical"
                    initialValues={{ q: filters.q, plan: filters.plan, status: filters.status }}
                    onFinish={(vals) => {
                        dispatch(setCompanyFilters(vals));
                        setFilterOpen(false);
                    }}
                >
                    <Form.Item name="q" label="Search">
                        <Input placeholder="Search company" allowClear />
                    </Form.Item>
                    <Form.Item name="plan" label="Plan">
                        <Select allowClear placeholder="Select plan">
                            <Option value="basic">Basic</Option>
                            <Option value="pro">Pro</Option>
                            <Option value="enterprise">Enterprise</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select allowClear placeholder="Select status">
                            <Option value="active">Active</Option>
                            <Option value="past_due">Past Due</Option>
                            <Option value="canceled">Canceled</Option>
                        </Select>
                    </Form.Item>

                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button
                            onClick={() => {
                                dispatch(setCompanyFilters({ q: undefined, plan: undefined, status: undefined }));
                                setFilterOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button type="primary" htmlType="submit">Apply</Button>
                    </Space>
                </Form>
            </Drawer>

            <Table
                rowKey={(r) => r._id || r.id}
                columns={columns}
                dataSource={items}
                loading={status === "loading"}
                size={isMobile ? "small" : "middle"}
                onRow={(row) => ({ onDoubleClick: () => openEdit(row) })}
                scroll={{ x: "max-content" }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    onChange: (p, ps) => dispatch(fetchCompanies({ page: p, pageSize: ps, ...filters })),
                }}
            />

            {/* Keep your Company Drawer (note: if your app is AntD v4, ensure CompanyDrawer uses `visible` internally) */}
            <CompanyDrawer
                open={drawer.open}              // if this doesn't open, change to `visible={drawer.open}`
                onClose={() => setDrawer({ open: false, rec: null })}
                record={drawer.rec}
            />
        </PageContainer>
    );
}
