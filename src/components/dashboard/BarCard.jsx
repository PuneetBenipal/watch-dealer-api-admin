import React from "react";
import { Card } from "antd";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function BarCard({ title, data = [], dataKey = "value", xKey = "date", loading }) {
    return (
        <Card title={title} loading={loading} bodyStyle={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xKey} minTickGap={16} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey={dataKey} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
