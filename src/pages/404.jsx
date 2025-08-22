import React from 'react';
import { Result, Button, Input, Space, Typography, Row, Col, Divider } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, CustomerServiceOutlined, PartitionOutlined } from '@ant-design/icons';

export default function NotFound404(props) {
    const {
        homeHref = '/',
        supportHref = '/support',
        sitemapHref = '/sitemap',
        onSearch,
        subtitle,
    } = props || {};

    const handleSearch = (value) => {
        const v = (value || '').trim();
        if (!v) return;
        if (onSearch) return onSearch(v);
        window.location.href = `/search?q=${encodeURIComponent(v)}`;
    };

    return (
        <main
            role="main"
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                backgroundImage:
                    'radial-gradient(1000px 360px at 50% -20%, rgba(99,102,241,.12), transparent), linear-gradient(#f8fafc, #ffffff)',
            }}
        >
            <section style={{ width: '100%', maxWidth: 900, padding: 24 }}>
                <div style={{ marginBottom: 8, textAlign: 'center' }} aria-hidden>
                    <Typography.Title
                        level={1}
                        style={{
                            margin: 0,
                            fontSize: '6rem',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            backgroundImage: 'linear-gradient(180deg, #0f172a, #64748b)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            opacity: 0.9,
                        }}
                    >
                        404
                    </Typography.Title>
                </div>

                <Result
                    status="404"
                    title={<Typography.Title level={2} style={{ margin: 0 }}>Page not found</Typography.Title>}
                    subTitle={
                        <Typography.Paragraph style={{ margin: 0, color: 'rgba(0,0,0,0.45)' }}>
                            {subtitle || 'Sorry, we couldn’t find the page you’re looking for. It may have been moved, renamed, or never existed.'}
                        </Typography.Paragraph>
                    }
                    extra={
                        <div style={{ width: '100%' }}>
                            <Row gutter={[12, 12]} align="middle" justify="center" style={{ marginTop: 8 }}>
                                <Col xs={24} md={14}>
                                    <label htmlFor="site-search" style={{ position: 'absolute', left: -10000 }} aria-hidden>
                                        Search site
                                    </label>
                                    <Input.Search
                                        id="site-search"
                                        allowClear
                                        size="large"
                                        placeholder="Search the site…"
                                        onSearch={handleSearch}
                                        enterButton
                                    />
                                </Col>
                                <Col xs={24} md={5}>
                                    <Button size="large" block href={homeHref} icon={<HomeOutlined />}>
                                        Go home
                                    </Button>
                                </Col>
                                <Col xs={24} md={5}>
                                    <Button
                                        size="large"
                                        type="primary"
                                        block
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() =>
                                            window.history.length > 1 ? window.history.back() : (window.location.href = homeHref)
                                        }
                                    >
                                        Go back
                                    </Button>
                                </Col>
                            </Row>

                            <Space wrap size="small" style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}>
                                <Divider type="vertical" />
                                <Typography.Link href={homeHref}>Return to homepage</Typography.Link>
                            </Space>
                        </div>
                    }
                    style={{
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                        padding: 24,
                    }}
                />

                <Typography.Paragraph style={{ textAlign: 'center', marginTop: 12, color: 'rgba(0,0,0,0.35)' }}>
                    <span style={{ opacity: 0.8 }}>Error code</span> <Typography.Text strong>404</Typography.Text>
                </Typography.Paragraph>
            </section>
        </main>
    );
}