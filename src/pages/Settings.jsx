// import React, { useEffect } from "react";
// import { Form, Input, Button, Card } from "antd";
// import PageContainer from "../components/common/PageContainer";
// import { toast } from "../services/notify"; // or use your CustomToast

// const KEY = "admin_settings";

// export default function Settings() {
//     const [form] = Form.useForm();

//     useEffect(() => {
//         const raw = localStorage.getItem(KEY);
//         if (raw) form.setFieldsValue(JSON.parse(raw));
//     }, [form]);

//     const save = (vals) => {
//         localStorage.setItem(KEY, JSON.stringify(vals));
//         toast("success", "Saved", "Settings stored locally");
//     };

//     return (
//         <PageContainer title="Settings">
//             <Card>
//                 <Form form={form} layout="vertical" onFinish={save} style={{ maxWidth: 560 }}>
//                     <Form.Item label="Support Email" name="supportEmail" rules={[{ type: "email", required: true }]}>
//                         <Input placeholder="support@domain.com" />
//                     </Form.Item>
//                     <Form.Item label="Stripe Webhook Secret" name="stripeWebhookSecret">
//                         <Input.Password placeholder="whsec_..." />
//                     </Form.Item>
//                     <Form.Item label="Stripe Publishable Key" name="stripePublishableKey">
//                         <Input placeholder="pk_live_..." />
//                     </Form.Item>
//                     <Form.Item>
//                         <Button type="primary" htmlType="submit">Save</Button>
//                     </Form.Item>
//                 </Form>
//             </Card>
//         </PageContainer>
//     );
// }


import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Space, Grid, Tabs, InputNumber, Select, Table, Tag, Spin, message } from "antd";
import { ReloadOutlined, ApiOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import { toast } from "../services/notify";
import { 
    fetchExchangeRates, 
    updateRatesFromAPI, 
    setManualRates, 
    fetchRateHistory,
    clearError 
} from "../store/slices/exchangeRates";

const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const { Option } = Select;
const KEY = "admin_settings";

export default function Settings() {
    const dispatch = useDispatch();
    const { rates, history, status, updating, error } = useSelector(state => state.exchangeRates);
    
    const [form] = Form.useForm();
    const [ratesForm] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        if (raw) form.setFieldsValue(JSON.parse(raw));
        
        // Load exchange rates on component mount
        dispatch(fetchExchangeRates());
    }, [form, dispatch]);

    useEffect(() => {
        if (rates?.rates) {
            ratesForm.setFieldsValue(rates.rates);
        }
    }, [rates, ratesForm]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const save = (vals) => {
        localStorage.setItem(KEY, JSON.stringify(vals));
        toast("success", "Saved", "Settings stored locally");
    };

    const reset = () => {
        localStorage.removeItem(KEY);
        form.resetFields();
        toast("success", "Reset", "Settings cleared");
    };

    const updateFromAPI = async (provider) => {
        try {
            await dispatch(updateRatesFromAPI({ provider })).unwrap();
            toast("success", "Updated", `Exchange rates updated from ${provider} API`);
            dispatch(fetchRateHistory());
        } catch (err) {
            message.error(err.message || "Failed to update rates");
        }
    };

    const saveManualRates = async (values) => {
        try {
            await dispatch(setManualRates({ rates: values, baseCurrency: 'USD' })).unwrap();
            toast("success", "Updated", "Exchange rates updated manually");
            dispatch(fetchRateHistory());
        } catch (err) {
            message.error(err.message || "Failed to save rates");
        }
    };

    const loadHistory = () => {
        dispatch(fetchRateHistory());
    };

    const currencyColumns = [
        { title: "Currency", dataIndex: "currency", key: "currency", width: 100 },
        { title: "Rate", dataIndex: "rate", key: "rate", render: (rate) => rate?.toFixed(4) },
    ];

    const historyColumns = [
        { title: "Date", dataIndex: "timestamp", key: "timestamp", width: 180, render: (ts) => new Date(ts).toLocaleString() },
        { title: "Action", dataIndex: "action", key: "action", width: 120, render: (action) => <Tag color={action === 'api_update' ? 'blue' : 'green'}>{action}</Tag> },
        { title: "Updated By", dataIndex: "updatedBy", key: "updatedBy", width: 150 },
        { title: "Provider", dataIndex: "provider", key: "provider", width: 100 },
    ];

    const currencyData = rates?.rates ? Object.entries(rates.rates).map(([currency, rate]) => ({ currency, rate, key: currency })) : [];

    return (
        <PageContainer title="Global Settings">
            <Card style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Tabs defaultActiveKey="general" size={isMobile ? "small" : "default"}>
                    <TabPane tab="General Settings" key="general">
                        <div style={{ maxWidth: 560, margin: "0 auto" }}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={save}
                            >
                                <Form.Item
                                    label="Support Email"
                                    name="supportEmail"
                                    rules={[{ type: "email", required: true, message: "Enter a valid email" }]}
                                >
                                    <Input placeholder="support@domain.com" inputMode="email" />
                                </Form.Item>

                                <Form.Item label="Stripe Webhook Secret" name="stripeWebhookSecret">
                                    <Input.Password placeholder="whsec_..." autoComplete="new-password" />
                                </Form.Item>

                                <Form.Item label="Stripe Publishable Key" name="stripePublishableKey">
                                    <Input placeholder="pk_live_..." />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Space wrap style={{ width: "100%", justifyContent: isMobile ? "stretch" : "flex-start" }}>
                                        <Button onClick={reset}>Reset</Button>
                                        <Button type="primary" htmlType="submit" block={isMobile}>Save</Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    </TabPane>

                    <TabPane tab="Exchange Rates" key="exchange-rates">
                        <Space direction="vertical" style={{ width: "100%" }} size="large">
                            <Card title="Current Exchange Rates" size="small" extra={
                                <Space>
                                    <Button 
                                        icon={<ReloadOutlined />} 
                                        onClick={() => dispatch(fetchExchangeRates())}
                                        loading={status === 'loading'}
                                        size="small"
                                    >
                                        Refresh
                                    </Button>
                                    <Select
                                        placeholder="Update from API"
                                        style={{ width: 140 }}
                                        size="small"
                                        onSelect={updateFromAPI}
                                        loading={updating}
                                    >
                                        <Option value="exchangerate">ExchangeRate API</Option>
                                        <Option value="fixer">Fixer.io</Option>
                                    </Select>
                                </Space>
                            }>
                                {status === 'loading' ? (
                                    <div style={{ textAlign: 'center', padding: 20 }}>
                                        <Spin />
                                    </div>
                                ) : (
                                    <div>
                                        <Space style={{ marginBottom: 16 }}>
                                            <Tag color="blue">Base: {rates?.baseCurrency || 'USD'}</Tag>
                                            <Tag>Last Updated: {rates?.lastUpdated ? new Date(rates.lastUpdated).toLocaleString() : 'Never'}</Tag>
                                            <Tag color="green">Source: {rates?.source || 'Unknown'}</Tag>
                                        </Space>
                                        <Table
                                            dataSource={currencyData}
                                            columns={currencyColumns}
                                            pagination={false}
                                            size="small"
                                            style={{ marginBottom: 16 }}
                                        />
                                    </div>
                                )}
                            </Card>

                            <Card title="Manual Rate Override" size="small">
                                <Form
                                    form={ratesForm}
                                    layout="vertical"
                                    onFinish={saveManualRates}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
                                        <Form.Item label="USD" name="USD" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="GBP" name="GBP" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="EUR" name="EUR" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="AED" name="AED" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="HKD" name="HKD" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="JPY" name="JPY" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.01} precision={2} />
                                        </Form.Item>
                                        <Form.Item label="CHF" name="CHF" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                        <Form.Item label="CAD" name="CAD" rules={[{ required: true, type: 'number', min: 0 }]}>
                                            <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            icon={<EditOutlined />}
                                            loading={updating}
                                        >
                                            Update Rates Manually
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>

                            <Card title="Rate Change History" size="small" extra={
                                <Button icon={<ReloadOutlined />} onClick={loadHistory} size="small">
                                    Load History
                                </Button>
                            }>
                                <Table
                                    dataSource={history}
                                    columns={historyColumns}
                                    pagination={{ pageSize: 10, showSizeChanger: false }}
                                    size="small"
                                    scroll={{ x: 600 }}
                                />
                            </Card>
                        </Space>
                    </TabPane>
                </Tabs>
            </Card>
        </PageContainer>
    );
}
