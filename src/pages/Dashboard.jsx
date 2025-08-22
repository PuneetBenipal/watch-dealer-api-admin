import React, { useEffect } from "react";
import { Row, Col, Radio, Space, Button, Table, Tag, Skeleton, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import { fetchDashboard, setRange } from "../store/slices/dashboard";
import KPIStatCard from "../components/dashboard/KPIStatCard";
import TrendAreaCard from "../components/dashboard/TrendAreaCard";
import BarCard from "../components/dashboard/BarCard";
import numeral from "numeral";
import { fetchUsers } from "../store/slices/users";
import { fetchCompanies } from "../store/slices/companies";
import { fetchPayments } from "../store/slices/billing";
import Loading from "../components/common/Loading";

export default function Dashboard() {
    const dispatch = useDispatch();
    const { data, loading, error, range } = useSelector(s => s.dashboard);
    // const { items, total, page, pageSize, status, filters, toggling } = useSelector((s) => s.companies);
    const [booted, setBooted] = React.useState(false);

    useEffect(() => {
        (async () => {
            await Promise.all([
                dispatch(fetchUsers({ page: 1, pageSize: 200 })),
                dispatch(fetchCompanies({ page: 1, pageSize: 200 })),
                dispatch(fetchPayments({ page: 1, pageSize: 200 })),
            ]);
            dispatch(fetchDashboard({ range }));
            setBooted(true);
        })();
    }, [dispatch]);

    useEffect(() => { if (error) message.error(error); }, [error]);

    const refresh = () => dispatch(fetchDashboard({ range }));


    const kpi = data?.kpi || {};
    const timeseries = data?.timeseries || {};
    const tables = data?.tables || {};

    const invCols = [
        { title: "Invoice #", dataIndex: "number" },
        { title: "Company", dataIndex: "companyName" },
        { title: "Amount", dataIndex: "amount", render: (v, r) => `${r.currency || "GBP"} ${numeral(v).format("0,0.00")}` },
        { title: "Status", dataIndex: "status", render: (s) => <Tag color={s === "paid" ? "green" : s === "open" ? "blue" : s === "past_due" ? "volcano" : "default"}>{s}</Tag> },
        { title: "Created", dataIndex: "createdAt" }
    ];

    const compCols = [
        { title: "Company", dataIndex: "name" },
        { title: "Plan", dataIndex: "planId" },
        { title: "Seats", dataIndex: "seats" },
        { title: "Status", dataIndex: "planStatus", render: (s) => <Tag color={s === "active" ? "green" : "volcano"}>{s}</Tag> },
    ];
    if (!booted) return <Loading />;

    return (
        <PageContainer
            title="Dashboard"
            subTitle="Platform overview"
            extra={
                <Space>
                    <Radio.Group
                        value={range}
                        onChange={(e) => dispatch(setRange(e.target.value))}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="7d">7d</Radio.Button>
                        <Radio.Button value="30d">30d</Radio.Button>
                        <Radio.Button value="90d">90d</Radio.Button>
                    </Radio.Group>
                    <Button icon={<ReloadOutlined />} onClick={refresh}>Refresh</Button>
                </Space>
            }
        >
            {/* KPIs */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                    <KPIStatCard
                        loading={loading}
                        title="Companies"
                        value={kpi?.companies ?? 0}
                        delta={kpi?.companiesDelta}
                        tip="Total tenant accounts"
                    />
                </Col>
                <Col xs={24} md={6}>
                    <KPIStatCard
                        loading={loading}
                        title="Active Users"
                        value={kpi?.usersActive ?? 0}
                        delta={kpi?.usersDelta}
                        tip="Users with active status"
                    />
                </Col>
                <Col xs={24} md={6}>
                    <KPIStatCard
                        loading={loading}
                        title="MRR"
                        value={numeral(kpi?.mrr ?? 0).format("0,0.00")}
                        suffix=" GBP"
                        delta={kpi?.mrrDelta}
                        tip="Monthly recurring revenue (approx)"
                    />
                </Col>
                <Col xs={24} md={6}>
                    <KPIStatCard
                        loading={loading}
                        title="Invoices Past Due"
                        value={kpi?.invoicesPastDue ?? 0}
                        delta={kpi?.invoicesDelta}
                        tip="Open invoices beyond due date"
                    />
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col xs={24} lg={16}>
                    <TrendAreaCard
                        title="MRR trend"
                        loading={loading}
                        data={timeseries?.mrrDaily || []}
                        dataKey="value"
                        xKey="date"
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <BarCard
                        title="New users"
                        loading={loading}
                        data={timeseries?.newUsersDaily || []}
                        dataKey="value"
                        xKey="date"
                    />
                </Col>
            </Row>

            {/* Tables */}
            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col xs={24} lg={12}>
                    {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
                        <Table
                            title={() => "Recent invoices"}
                            rowKey={(r) => r._id || r.id}
                            columns={invCols}
                            dataSource={tables?.recentInvoices || []}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            size="small"
                        />
                    )}
                </Col>
                <Col xs={24} lg={12}>
                    {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
                        <Table
                            title={() => "Top companies by seats"}
                            rowKey={(r) => r._id || r.id}
                            columns={compCols}
                            dataSource={(tables?.topCompanies || []).map(c => ({
                                ...c,
                                seats: c?.seats ? `${c.seats.used || 0}/${c.seats.purchased || 0}` : "—"
                            }))}
                            scroll={{ x: 'max-content' }}
                            pagination={false}
                            size="small"
                        />
                    )}
                </Col>
            </Row>
        </PageContainer>
    );
}
