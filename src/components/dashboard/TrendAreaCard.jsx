import React from "react";
import { Card } from "antd";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function TrendAreaCard({ title, data = [], dataKey = "value", xKey = "date", loading }) {
    return (
        <Card title={title} loading={loading} bodyStyle={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1890ff" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#1890ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xKey} minTickGap={16} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey={dataKey} stroke="#1890ff" fill="url(#grad)" />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
