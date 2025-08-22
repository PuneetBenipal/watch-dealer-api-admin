import React, { useEffect, useMemo, useState } from "react";
import {
    Tabs, Table, Tag, Space, Input, Select, DatePicker,
    Button, Popconfirm, message, Grid, Drawer, Form
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import InvoiceModal from "../components/billing/InvoiceModal";
import {
    fetchInvoices, fetchPayments,
    setInvoiceFilters, setPaymentFilters,
    updateInvoiceStatus,
} from "../store/slices/billing";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

function useDateParams(range) {
    return useMemo(() => {
        if (!range || !range.length) return {};
        const [s, e] = range;
        return { start: s ? s.toISOString() : undefined, end: e ? e.toISOString() : undefined };
    }, [range]);
}

export default function Billing() {
    const dispatch = useDispatch();
    const inv = useSelector((s) => s.billing.invoices);
    const pay = useSelector((s) => s.billing.payments);

    const [invRange, setInvRange] = useState(null);
    const [payRange, setPayRange] = useState(null);
    const [selInv, setSelInv] = useState(null);
    const [invOpen, setInvOpen] = useState(false);

    // Mobile Filters Drawer state
    const [invFilterOpen, setInvFilterOpen] = useState(false);
    const [payFilterOpen, setPayFilterOpen] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const invDates = useDateParams(invRange);
    const payDates = useDateParams(payRange);

    useEffect(() => { if (inv.error) message.error(inv.error); }, [inv.error]);
    useEffect(() => { if (pay.error) message.error(pay.error); }, [pay.error]);

    useEffect(() => {
        dispatch(fetchInvoices({ page: inv.page, pageSize: inv.pageSize, ...inv.filters, ...invDates }));
    }, [dispatch, inv.page, inv.pageSize, inv.filters.q, inv.filters.status, inv.filters.companyId, invDates.start, invDates.end]);

    useEffect(() => {
        dispatch(fetchPayments({ page: pay.page, pageSize: pay.pageSize, ...pay.filters, ...payDates }));
    }, [dispatch, pay.page, pay.pageSize, pay.filters.q, pay.filters.status, pay.filters.method, pay.filters.companyId, payDates.start, payDates.end]);

    // Columns — responsive & compact
    const invoiceCols = [
        { title: "Invoice #", dataIndex: "invoiceNo", ellipsis: true },
        { title: "Company", dataIndex: "companyName", ellipsis: true, responsive: ["sm"] },
        {
            title: "Amount (£)",
            dataIndex: "total",
            render: (v, r) => (r.currency || "GBP") + " " + (v ?? 0),
            responsive: ["sm"]
        },
        // {
        //     title: "Status",
        //     dataIndex: "status",
        //     render: (s) => (
        //         <Tag color={s === "paid" ? "green" : s === "open" ? "blue" : s === "void" ? "default" : "volcano"}>
        //             {s}
        //         </Tag>
        //     ),
        // },
        { title: "Created", dataIndex: "issuedAt", ellipsis: true, responsive: ["md"] },
        { title: "Due", dataIndex: "dueDate", ellipsis: true, responsive: ["lg"] },
        {
            title: "Actions",
            fixed: screens.lg ? undefined : undefined,
            render: (_, row) => (
                <Space wrap>
                    {/* {!isMobile && (
                        <>
                            <Popconfirm
                                title="Mark as paid?"
                                onConfirm={() => dispatch(updateInvoiceStatus({ id: row._id || row.id, status: "paid" }))}
                            >
                                <Button size="small" type="primary">Mark Paid</Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Cancel invoice?"
                                onConfirm={() => dispatch(updateInvoiceStatus({ id: row._id || row.id, status: "void" }))}
                            >
                                <Button size="small">Void</Button>
                            </Popconfirm>
                        </>
                    )} */}
                    <Button size="small" onClick={() => { setSelInv(row); setInvOpen(true); }}>
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const paymentCols = [
        { title: "Company", dataIndex: "companyName", ellipsis: true },
        {
            title: "Amount (£)",
            dataIndex: "amount",
            render: (v, r) => (v ?? 0) + " " + (r.currency || "GBP"),
            responsive: ["sm"]
        },
        { title: "Method", dataIndex: "method", responsive: ["sm"] }, // card/wire/crypto/stripe
        {
            title: "Status",
            dataIndex: "status",
            render: (s) => (
                <Tag color={s === "succeeded" ? "green" : s === "pending" ? "blue" : "volcano"}>
                    {s}
                </Tag>
            ),
        },
        { title: "Created", dataIndex: "createdAt", ellipsis: true, responsive: ["md"] },
    ];

    // Desktop filter bars (wrap nicely). Mobile shows a Filters Drawer per tab.
    const InvoiceFiltersBar = (
        <Space wrap style={{ width: "100%", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
            {!isMobile ? (
                <>
                    <Input.Search
                        placeholder="Search #"
                        allowClear
                        style={{ width: 220 }}
                        defaultValue={inv.filters.q}
                        onSearch={(q) => dispatch(setInvoiceFilters({ q }))}
                    />
                    {/* <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: 160 }}
                        value={inv.filters.status}
                        onChange={(v) => dispatch(setInvoiceFilters({ status: v }))}
                    >
                        <Option value="open">Open</Option>
                        <Option value="paid">Paid</Option>
                        <Option value="past_due">Past Due</Option>
                        <Option value="void">Void</Option>
                    </Select> */}
                    <RangePicker value={invRange} onChange={setInvRange} />
                </>
            ) : (
                <Button icon={<FilterOutlined />} onClick={() => setInvFilterOpen(true)}>
                    Filters
                </Button>
            )}
        </Space>
    );

    const PaymentFiltersBar = (
        <Space wrap style={{ width: "100%", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
            {!isMobile ? (
                <>
                    <Input.Search
                        placeholder="Search payment"
                        allowClear
                        style={{ width: 240 }}
                        defaultValue={pay.filters.q}
                        onSearch={(q) => dispatch(setPaymentFilters({ q }))}
                    />
                    <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: 140 }}
                        value={pay.filters.status}
                        onChange={(v) => dispatch(setPaymentFilters({ status: v }))}
                    >
                        <Option value="succeeded">Succeeded</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="failed">Failed</Option>
                    </Select>
                    <Select
                        placeholder="Method"
                        allowClear
                        style={{ width: 140 }}
                        value={pay.filters.method}
                        onChange={(v) => dispatch(setPaymentFilters({ method: v }))}
                    >
                        <Option value="card">Card</Option>
                        <Option value="wire">Wire</Option>
                        <Option value="crypto">Crypto</Option>
                        <Option value="stripe">Stripe</Option>
                    </Select>
                    <RangePicker value={payRange} onChange={setPayRange} />
                </>
            ) : (
                <Button icon={<FilterOutlined />} onClick={() => setPayFilterOpen(true)}>
                    Filters
                </Button>
            )}
        </Space>
    );

    return (
        <PageContainer
            title="Billing"
            subTitle="Payments"
            extra={null}
        >
            {/* Mobile: Invoice Filters Drawer (AntD v4 uses `visible`) */}
            <Drawer
                visible={invFilterOpen}
                onClose={() => setInvFilterOpen(false)}
                title="Invoice Filters"
                width="100%"
                bodyStyle={{ paddingBottom: 16 }}
                destroyOnClose
                getContainer={false}
            >
                <Form
                    layout="vertical"
                    initialValues={{ q: inv.filters.q, status: inv.filters.status, range: invRange }}
                    onFinish={(vals) => {
                        dispatch(setInvoiceFilters({ q: vals.q, status: vals.status }));
                        setInvRange(vals.range || null);
                        setInvFilterOpen(false);
                    }}
                >
                    <Form.Item name="q" label="Search">
                        <Input placeholder="Search invoice #" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select allowClear placeholder="Select status">
                            <Option value="open">Open</Option>
                            <Option value="paid">Paid</Option>
                            <Option value="past_due">Past Due</Option>
                            <Option value="void">Void</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="range" label="Date range">
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button
                            onClick={() => {
                                dispatch(setInvoiceFilters({ q: undefined, status: undefined }));
                                setInvRange(null);
                                setInvFilterOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button type="primary" htmlType="submit">Apply</Button>
                    </Space>
                </Form>
            </Drawer>

            {/* Mobile: Payment Filters Drawer */}
            <Drawer
                visible={payFilterOpen}
                onClose={() => setPayFilterOpen(false)}
                title="Payment Filters"
                width="100%"
                bodyStyle={{ paddingBottom: 16 }}
                destroyOnClose
                getContainer={false}
            >
                <Form
                    layout="vertical"
                    initialValues={{
                        q: pay.filters.q,
                        status: pay.filters.status,
                        method: pay.filters.method,
                        range: payRange
                    }}
                    onFinish={(vals) => {
                        dispatch(setPaymentFilters({ q: vals.q, status: vals.status, method: vals.method }));
                        setPayRange(vals.range || null);
                        setPayFilterOpen(false);
                    }}
                >
                    <Form.Item name="q" label="Search">
                        <Input placeholder="Search payment" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select allowClear placeholder="Select status">
                            <Option value="succeeded">Succeeded</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="failed">Failed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="method" label="Method">
                        <Select allowClear placeholder="Select method">
                            <Option value="card">Card</Option>
                            <Option value="wire">Wire</Option>
                            <Option value="crypto">Crypto</Option>
                            <Option value="stripe">Stripe</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="range" label="Date range">
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button
                            onClick={() => {
                                dispatch(setPaymentFilters({ q: undefined, status: undefined, method: undefined }));
                                setPayRange(null);
                                setPayFilterOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button type="primary" htmlType="submit">Apply</Button>
                    </Space>
                </Form>
            </Drawer>

            <Tabs defaultActiveKey="payments">
                <TabPane
                    tab="Invoices"
                    key="invoices"
                >
                    {InvoiceFiltersBar}
                    <Table
                        rowKey={(r) => r._id || r.id}
                        columns={invoiceCols}
                        dataSource={inv.items}
                        loading={inv.status === "loading"}
                        size={isMobile ? "small" : "middle"}
                        scroll={{ x: "max-content" }}
                        pagination={{
                            current: inv.page,
                            pageSize: inv.pageSize,
                            total: inv.total,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            onChange: (p, ps) =>
                                dispatch(fetchInvoices({ page: p, pageSize: ps, ...inv.filters, ...invDates })),
                            responsive: true,
                        }}
                    />
                </TabPane>

                <TabPane
                    tab="Payments"
                    key="payments"
                >
                    {PaymentFiltersBar}
                    <Table
                        rowKey={(r) => r._id || r.id}
                        columns={paymentCols}
                        dataSource={pay.items}
                        loading={pay.status === "loading"}
                        size={isMobile ? "small" : "middle"}
                        scroll={{ x: "max-content" }}
                        pagination={{
                            current: pay.page,
                            pageSize: pay.pageSize,
                            total: pay.total,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            onChange: (p, ps) =>
                                dispatch(fetchPayments({ page: p, pageSize: ps, ...pay.filters, ...payDates })),
                            responsive: true,
                        }}
                    />
                </TabPane>
            </Tabs>

            {/* If your InvoiceModal uses AntD v4 Modal, change `open` to `visible` inside it */}
            <InvoiceModal open={invOpen} onClose={() => setInvOpen(false)} invoice={selInv} />
        </PageContainer>
    );
}
