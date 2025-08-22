import React, { useEffect, useMemo, useState } from "react";
import {
    Table, Tag, Space, Input, Select, DatePicker, message, Button,
    Grid, Drawer, Form
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import { fetchLogs, setLogFilters } from "../store/slices/logs";
import { downloadCSV } from "../services/csv";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

function useDateParams(range) {
    return useMemo(() => {
        if (!range || !range.length) return {};
        const [s, e] = range;
        return { start: s ? s.toISOString() : undefined, end: e ? e.toISOString() : undefined };
    }, [range]);
}

export default function Logs() {
    const dispatch = useDispatch();
    const { items, total, page, pageSize, status, error, filters } = useSelector((s) => s.logs);

    const [range, setRange] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const dates = useDateParams(range);

    useEffect(() => { if (error) message.error(error); }, [error]);
    useEffect(() => {
        dispatch(fetchLogs({ page, pageSize, ...filters, ...dates }));
    }, [dispatch, page, pageSize, filters.q, filters.level, filters.companyId, dates.start, dates.end]);

    const columns = [
        { title: "Time", dataIndex: "ts", ellipsis: true },
        {
            title: "Level",
            dataIndex: "level",
            render: (l) => <Tag color={l === "error" ? "red" : l === "warn" ? "orange" : "blue"}>{l}</Tag>
        },
        { title: "Actor", dataIndex: "actor", ellipsis: true, responsive: ["md"] },
        { title: "Company", dataIndex: "companyName", ellipsis: true, responsive: ["lg"] },
        { title: "Action", dataIndex: "action", ellipsis: true, responsive: ["sm"] },
        { title: "Target", dataIndex: "target", ellipsis: true, responsive: ["lg"] },
        { title: "Message", dataIndex: "message", ellipsis: true },
    ];

    const FiltersBar = (
        <Space wrap style={{ width: "100%", justifyContent: isMobile ? "space-between" : "flex-start" }}>
            {!isMobile ? (
                <>
                    <Input.Search
                        placeholder="Search"
                        allowClear
                        style={{ width: 240 }}
                        defaultValue={filters.q}
                        onSearch={(q) => dispatch(setLogFilters({ q }))}
                    />
                    <Select
                        placeholder="Level"
                        allowClear
                        style={{ width: 160 }}
                        value={filters.level}
                        onChange={(v) => dispatch(setLogFilters({ level: v }))}
                    >
                        <Option value="info">Info</Option>
                        <Option value="warn">Warn</Option>
                        <Option value="error">Error</Option>
                    </Select>
                    <RangePicker value={range} onChange={setRange} />
                    <Button onClick={() => downloadCSV("logs.csv", items)}>Export CSV</Button>
                </>
            ) : (
                <>
                    <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filters</Button>
                    <Button onClick={() => downloadCSV("logs.csv", items)}>Export</Button>
                </>
            )}
        </Space>
    );

    return (
        <PageContainer title="Logs" extra={FiltersBar}>
            {/* Mobile Filters Drawer (AntD v4 → visible) */}
            <Drawer
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                title="Filters"
                width="100%"
                bodyStyle={{ paddingBottom: 16 }}
                destroyOnClose
                getContainer={false}
            >
                <Form
                    layout="vertical"
                    initialValues={{ q: filters.q, level: filters.level, range }}
                    onFinish={(vals) => {
                        dispatch(setLogFilters({ q: vals.q, level: vals.level }));
                        setRange(vals.range || null);
                        setFilterOpen(false);
                    }}
                >
                    <Form.Item name="q" label="Search">
                        <Input placeholder="Search logs" allowClear />
                    </Form.Item>
                    <Form.Item name="level" label="Level">
                        <Select allowClear placeholder="Select level">
                            <Option value="info">Info</Option>
                            <Option value="warn">Warn</Option>
                            <Option value="error">Error</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="range" label="Date range">
                        <RangePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button
                            onClick={() => {
                                dispatch(setLogFilters({ q: undefined, level: undefined }));
                                setRange(null);
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
                scroll={{ x: "max-content" }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    onChange: (p, ps) =>
                        dispatch(fetchLogs({ page: p, pageSize: ps, ...filters, ...dates })),
                    responsive: true,
                }}
            />
        </PageContainer>
    );
}
