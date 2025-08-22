import React from "react";
import { PageHeader, Typography } from "antd";

export default function PageContainer({ title, extra, children, subTitle }) {
    return (
        <div style={{ padding: 16 }}>
            <PageHeader title={title} subTitle={subTitle} extra={extra} style={{ padding: 0, marginBottom: 16 }} />
            <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>{children}</div>
        </div>
    );
}
