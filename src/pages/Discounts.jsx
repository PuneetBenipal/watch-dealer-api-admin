import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDiscountItems, fetchDiscounts,
    createDiscount, updateDiscount, toggleDiscount
} from '../store/slices/discountsSlice';

import {
    Table, Button, Drawer, Form, Input, InputNumber, Switch,
    Select, DatePicker, Space, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, PoweroffOutlined, ReloadOutlined } from '@ant-design/icons';
import { CustomToast } from '../components/common/CustomToast';

const { RangePicker } = DatePicker;

const toISO = (v) => {
    if (!v) return null;
    // works with dayjs or moment objects; or a Date
    const d = v?.toDate?.() || v;
    return d?.toISOString?.() || null;
};

const ItemKeyColor = (key) => {
    switch (key) {
        case 'PERCENT_OFF_ONCE': return 'green';
        case 'PERCENT_OFF_FIRST_N_MONTHS': return 'blue';
        case 'AMOUNT_OFF_ONCE': return 'purple';
        case 'TRIAL_DAYS': return 'gold';
        default: return 'default';
    }
};

export default function DiscountsAdmin() {
    const dispatch = useDispatch();
    const { itemsCatalog, list, loading, saving } = useSelector(s => s.discounts);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchDiscountItems());
        dispatch(fetchDiscounts());
    }, [dispatch]);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({
            name: '',
            itemKey: undefined,
            autoApply: true,
            priority: 100,
            stackable: false,
            appliesToPriceIds: [],
            percentOff: null,
            amountOff: null,
            currency: 'usd',
            firstNMonths: null,
            trialDays: null,
            eligibility: {
                newCustomerOnly: false,
                companyAllowlistCsv: '',
                minQty: 1,
                maxQty: null
            },
            maxRedemptionsGlobal: null,
            maxRedemptionsPerCustomer: 1,
            active: true
        });
        setDrawerOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        const { eligibility = {} } = record;
        form.setFieldsValue({
            ...record,
            eligibility: {
                newCustomerOnly: eligibility.newCustomerOnly || false,
                companyAllowlistCsv: (eligibility.companyAllowlist || []).join(','), // comma CSV for simplicity
                minQty: eligibility.minQty ?? 1,
                maxQty: eligibility.maxQty ?? null
            },
            dateRange: [
                record.startsAt ? new Date(record.startsAt) : null,
                record.endsAt ? new Date(record.endsAt) : null
            ]
        });
        setDrawerOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const v = await form.validateFields();
            const payload = {
                name: v.name,
                itemKey: v.itemKey,
                autoApply: v.autoApply,
                priority: v.priority,
                stackable: v.stackable,
                appliesToPriceIds: v.appliesToPriceIds || [],
                percentOff: v.percentOff ?? null,
                amountOff: v.amountOff ?? null,
                currency: v.currency || null,
                firstNMonths: v.firstNMonths ?? null,
                trialDays: v.trialDays ?? null,
                eligibility: {
                    newCustomerOnly: v.eligibility?.newCustomerOnly || false,
                    companyAllowlist: (v.eligibility?.companyAllowlistCsv || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean),
                    minQty: v.eligibility?.minQty ?? 1,
                    maxQty: v.eligibility?.maxQty ?? null
                },
                maxRedemptionsGlobal: v.maxRedemptionsGlobal ?? null,
                maxRedemptionsPerCustomer: v.maxRedemptionsPerCustomer ?? 1,
                startsAt: v.dateRange?.[0] ? toISO(v.dateRange[0]) : null,
                endsAt: v.dateRange?.[1] ? toISO(v.dateRange[1]) : null,
                active: !!v.active
            };

            if (!editing) {
                await dispatch(createDiscount(payload)).unwrap();
                CustomToast.success('Discount created');
            } else {
                await dispatch(updateDiscount({ id: editing._id, data: payload })).unwrap();
                CustomToast.success('Discount updated');
            }
            setDrawerOpen(false);
            setEditing(null);
            form.resetFields();
        } catch (e) {
            if (e?.errorFields) return; // form errors
            CustomToast.error(e.message || 'Save failed');
        }
    };

    const columns = useMemo(() => ([
        { title: 'Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Type',
            dataIndex: 'itemKey',
            key: 'itemKey',
            render: (v) => <Tag color={ItemKeyColor(v)}>{v}</Tag>
        },
        {
            title: 'Math',
            key: 'math',
            render: (_, r) => {
                switch (r.itemKey) {
                    case 'PERCENT_OFF_ONCE': return <span>{r.percentOff}% once</span>;
                    case 'PERCENT_OFF_FIRST_N_MONTHS': return <span>{r.percentOff}% for {r.firstNMonths} mo</span>;
                    case 'AMOUNT_OFF_ONCE': return <span>{(r.amountOff / 100).toFixed(2)} {r.currency?.toUpperCase()} once</span>;
                    case 'TRIAL_DAYS': return <span>{r.trialDays} trial days</span>;
                    default: return '-';
                }
            }
        },
        {
            title: 'Targets',
            dataIndex: 'appliesToPriceIds',
            key: 'targets',
            render: (arr = []) => arr.length ? arr.map(p => <Tag key={p}>{p}</Tag>) : <span>Any</span>
        },
        {
            title: 'Eligibility',
            key: 'elig',
            render: (_, r) => {
                const e = r.eligibility || {};
                const chips = [];
                if (e.newCustomerOnly) chips.push(<Tag key="new">New customers</Tag>);
                if (e.minQty) chips.push(<Tag key="min">min {e.minQty}</Tag>);
                if (e.maxQty) chips.push(<Tag key="max">max {e.maxQty}</Tag>);
                if (e.companyAllowlist?.length) chips.push(<Tag key="allow">allowlist:{e.companyAllowlist.length}</Tag>);
                return chips.length ? <Space wrap>{chips}</Space> : '-';
            }
        },
        { title: 'Priority', dataIndex: 'priority', key: 'priority' },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
            render: (v) => v ? <Tag color="green">Active</Tag> : <Tag>Paused</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, r) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Edit</Button>
                    <Button
                        size="small"
                        icon={<PoweroffOutlined />}
                        onClick={async () => {
                            try {
                                await dispatch(toggleDiscount(r._id)).unwrap();
                                CustomToast.success(r.active ? 'Paused' : 'Activated');
                            } catch (e) { CustomToast.error(e.message); }
                        }}
                    >
                        {r.active ? 'Pause' : 'Activate'}
                    </Button>
                </Space>
            )
        }
    ]), [dispatch]);

    return (
        <div style={{ padding: 16 }}>
            <Space style={{ marginBottom: 12 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Discount</Button>
                <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchDiscounts())}>Refresh</Button>
            </Space>

            <Table
                size="middle"
                rowKey="_id"
                loading={loading}
                columns={columns}
                dataSource={list}
                pagination={{ pageSize: 10 }}
            />

            <Drawer
                title={editing ? 'Edit Discount' : 'Create Discount'}
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                destroyOnClose
                width="clamp(320px, 100%, 560px)"
                footer={
                    <Space style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" loading={saving} onClick={handleSubmit}>
                            {editing ? 'Update' : 'Create'}
                        </Button>
                    </Space>
                }
            >
                <DiscountForm form={form} itemsCatalog={itemsCatalog} />
            </Drawer>
        </div>
    );
}

/** --- Inline component for brevity --- */
function DiscountForm({ form, itemsCatalog }) {
    // const itemKey = Form.useWatch('itemKey', form);
    const [itemKey, setItemKey] = React.useState(form.getFieldValue('itemKey'));

    return (
        <Form layout="vertical" form={form} onValuesChange={(_, all) => setItemKey(all.itemKey)}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Admin label" />
            </Form.Item>

            <Form.Item name="itemKey" label="Type" rules={[{ required: true }]}>
                <Select placeholder="Choose discount type">
                    {itemsCatalog.map(it => (
                        <Select.Option key={it.key} value={it.key}>{it.label} ({it.key})</Select.Option>
                    ))}
                    {/* fallback in case you don't call /items; hardcode keys if needed */}
                </Select>
            </Form.Item>

            <Form.Item label="Targets (Stripe price IDs)" name="appliesToPriceIds">
                <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="price_xxx, price_yyy" />
            </Form.Item>

            {/* Math by type */}
            {itemKey === 'PERCENT_OFF_ONCE' && (
                <Form.Item name="percentOff" label="Percent off" rules={[{ required: true, type: 'number', min: 1, max: 100 }]}>
                    <InputNumber style={{ width: '100%' }} addonAfter="%" />
                </Form.Item>
            )}

            {itemKey === 'PERCENT_OFF_FIRST_N_MONTHS' && (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="percentOff" label="Percent off" rules={[{ required: true, type: 'number', min: 1, max: 100 }]}>
                        <InputNumber style={{ width: '100%' }} addonAfter="%" />
                    </Form.Item>
                    <Form.Item name="firstNMonths" label="First N months" rules={[{ required: true, type: 'number', min: 1, max: 36 }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Space>
            )}

            {itemKey === 'AMOUNT_OFF_ONCE' && (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="amountOff" label="Amount off (minor units)" rules={[{ required: true, type: 'number', min: 1 }]}>
                        <InputNumber style={{ width: '100%' }} placeholder="e.g., 5000 = $50.00" />
                    </Form.Item>
                    <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="usd">USD</Select.Option>
                            <Select.Option value="eur">EUR</Select.Option>
                            <Select.Option value="gbp">GBP</Select.Option>
                        </Select>
                    </Form.Item>
                </Space>
            )}

            {itemKey === 'TRIAL_DAYS' && (
                <Form.Item name="trialDays" label="Trial days" rules={[{ required: true, type: 'number', min: 1, max: 60 }]}>
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
            )}

            <Space size="large" style={{ display: 'flex' }}>
                <Form.Item name="autoApply" label="Auto-apply" valuePropName="checked" tooltip="Apply automatically at checkout">
                    <Switch defaultChecked />
                </Form.Item>
                <Form.Item name="stackable" label="Stackable" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item name="priority" label="Priority" tooltip="Lower wins when equal savings">
                    <InputNumber min={0} style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="active" label="Active" valuePropName="checked">
                    <Switch defaultChecked />
                </Form.Item>
            </Space>

            <Form.Item label="Eligibility">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name={['eligibility', 'newCustomerOnly']} valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch /> <span style={{ marginLeft: 8 }}>New customers only</span>
                    </Form.Item>
                    <Form.Item name={['eligibility', 'companyAllowlistCsv']} label="Allowlist (comma-separated IDs)">
                        <Input.TextArea placeholder="66cfa8f2..., 66cfa8f2..." autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <Space>
                        <Form.Item name={['eligibility', 'minQty']} label="Min qty" style={{ marginBottom: 0 }}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item name={['eligibility', 'maxQty']} label="Max qty" style={{ marginBottom: 0 }}>
                            <InputNumber min={1} placeholder="Optional" />
                        </Form.Item>
                    </Space>
                </Space>
            </Form.Item>

            <Form.Item name="dateRange" label="Active window">
                <RangePicker showTime />
            </Form.Item>
        </Form>
    );
}
