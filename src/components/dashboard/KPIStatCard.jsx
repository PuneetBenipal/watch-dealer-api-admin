import React from "react";
import { Card, Statistic, Tooltip } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from "@ant-design/icons";

export default function KPIStatCard({ title, value, suffix, delta, tip, loading }) {
    const up = typeof delta === "number" && delta >= 0;
    const down = typeof delta === "number" && delta < 0;

    return (
        <Card loading={loading} bodyStyle={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{title}</span>
                {tip ? <Tooltip title={tip}><InfoCircleOutlined /></Tooltip> : null}
            </div>
            <Statistic
                value={value}
                suffix={suffix}
                valueStyle={{ fontWeight: 700 }}
            />
            {typeof delta === "number" && (
                <div style={{ marginTop: 6, fontSize: 12, color: up ? "#3f8600" : "#cf1322" }}>
                    {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(delta)}%
                    <span style={{ color: "#999", marginLeft: 6 }}>vs prev period</span>
                </div>
            )}
        </Card>
    );
}
