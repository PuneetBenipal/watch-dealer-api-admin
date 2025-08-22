import React, { useEffect, useMemo, useState } from "react";
// Ant Design v4 components (no Flex)
import {
    Button,
    Card,
    Collapse,
    Drawer,
    Empty,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Col,
    Select,
    Space,
    Spin,
    Switch,
    Tag,
    Tooltip,
    Typography,
    Divider,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    DollarOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
// Redux
import { useDispatch, useSelector } from "react-redux";
// Expect these thunks/selectors from your store
// plans: fetchPlans, createPlan, updatePlan, deletePlan
// features: fetchFeatures
import {
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from "../store/slices/planSlice";
import { fetchFeatures } from "../store/slices/featuresSlice";
import { CustomToast } from "../components/common/CustomToast";

const { Title, Text } = Typography;
const { Panel } = Collapse;

/** Feature shape (from your FeaturesSchema)
 * {
 *  _id, name, slug, type, category, shortDesc, description,
 *  priceMonthly, priceYearly, limitMonthly, limitYearly,
 *  currency, trialDays, featured, status, sortOrder, isActive
 * }
 */

/** Plan shape expected by this UI
 * {
 *   _id?, name, code, description, currency,
 *   priceMonthly, priceYearly, stripePriceIdMonthly?, stripePriceIdYearly?,
 *   status: 'active'|'hidden'|'archived', isPublic: boolean, sortOrder?, trialDays?,
 *   modules: Array<{ slug, included, addonPriceMonthly?, addonPriceYearly?, limitMonthly?, limitYearly? }>
 * }
 */

const currencyOptions = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "JPY", label: "JPY" },
    { value: "AUD", label: "AUD" },
    { value: "CAD", label: "CAD" },
];

function groupByCategory(features) {
    const out = {};
    for (const f of features) {
        const key = f.category || "Other";
        if (!out[key]) out[key] = [];
        out[key].push(f);
    }
    return out;
}

function modulesToMap(modules = []) {
    return modules.reduce((acc, m) => {
        acc[m.slug] = {
            included: !!m.included,
            addonPriceMonthly: m.addonPriceMonthly ?? null,
            addonPriceYearly: m.addonPriceYearly ?? null,
            limitMonthly: m.limitMonthly ?? null,
            limitYearly: m.limitYearly ?? null,
        };
        return acc;
    }, {});
}

function mapToModules(map = {}) {
    return Object.entries(map).map(([slug, v]) => ({ slug, ...v }));
}

export default function PlanManagerCards() {
    const dispatch = useDispatch();
    const plans = useSelector((s) => s.plans?.items || []);
    const plansLoading = useSelector((s) => s.plans?.loading);
    const features = useSelector((s) => s.features?.items || []);
    const featuresLoading = useSelector((s) => s.features?.loading);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        dispatch(fetchPlans());
        dispatch(fetchFeatures());
    }, [dispatch]);

    const openCreate = () => { setEditing(null); setDrawerOpen(true); };
    const openEdit = (plan) => { setEditing(plan); setDrawerOpen(true); };

    const onSaved = () => {
        setDrawerOpen(false);
        setEditing(null);
        dispatch(fetchPlans());
    };

    const deleteOne = (plan) => {
        Modal.confirm({
            title: `Delete plan “${plan.title}”?`,
            okText: "Delete",
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deletePlan(plan._id));
                    CustomToast.success("Plan deleted");
                } catch (e) {
                    CustomToast.error("Delete failed");
                }
            },
        });
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Title level={3} style={{ margin: 0 }}>Plan Management</Title>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => { dispatch(fetchPlans()); dispatch(fetchFeatures()); }}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Plan</Button>
                </Space>
            </div>

            <Spin spinning={!!plansLoading || !!featuresLoading}>
                <Row gutter={[16, 16]}>
                    {/* New Plan card */}
                    <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                        <Card
                            style={{ height: "100%", borderStyle: "dashed" }}
                            hoverable
                            onClick={openCreate}
                        >
                            <div style={{ display: "flex", height: 140, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                <PlusOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                                <Text strong>Create a plan</Text>
                            </div>
                        </Card>
                    </Col>

                    {plans && plans.length ? (
                        plans.map((p) => (
                            <Col key={p._id || p.code} xs={24} sm={12} md={12} lg={8} xl={6}>
                                <Card
                                    title={<PlanTitle p={p} />}
                                    actions={[
                                        <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(p)} key="edit">Edit</Button>,
                                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteOne(p)} key="del">Delete</Button>,
                                    ]}
                                >
                                    <PlanSummaryCard p={p} />
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <Empty description="No plans yet" />
                        </Col>
                    )}
                </Row>
            </Spin>

            <PlanDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                initialValues={editing}
                features={features}
                onSaved={onSaved}
            />
        </div>
    );
}

function PlanTitle({ p }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <Text strong>{p.title}</Text>
                <div style={{ fontSize: 12, color: "#888" }}>{p.code}</div>
            </div>
            <Tag color={p.status === "active" ? "green" : p.status === "hidden" ? "orange" : "default"}>
                {p.status || "active"}
            </Tag>
        </div>
    );
}

function PlanSummaryCard({ p }) {
    const currency = p.currency || "USD";
    const included = (p.modules || []).filter((m) => m.included);
    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <Text type="secondary">Base price</Text>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {currency} {Number(p.priceMonthly ?? 0).toLocaleString()} <span style={{ color: "#888", fontSize: 12 }}>/mo</span>
                </div>
                <div>
                    <Text type="secondary">{currency} {Number(p.priceYearly ?? 0).toLocaleString()} /yr</Text>
                </div>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div>
                <Text type="secondary">Included modules</Text>
                <div style={{ marginTop: 8 }}>
                    {included.length ? (
                        <Space size={[4, 8]} wrap>
                            {included.slice(0, 6).map((m) => (
                                <Tag key={m.slug}>{m.slug}</Tag>
                            ))}
                            {included.length > 6 && <Tag>+{included.length - 6}</Tag>}
                        </Space>
                    ) : (
                        <Text type="secondary">None</Text>
                    )}
                </div>
            </div>
        </div>
    );
}

function PlanDrawer({ open, onClose, initialValues, features, onSaved }) {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                modulesMap: modulesToMap(initialValues.modules),
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                currency: "USD",
                status: "active",
                isPublic: true,
                priceMonthly: 0,
                priceYearly: 0,
                modulesMap: {},
            });
        }
    }, [open, initialValues, form]);

    const grouped = useMemo(() => groupByCategory(features || []), [features]);

    const submit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const payload = { ...values, modules: mapToModules(values.modulesMap || {}) };
            delete payload.modulesMap;
            if (initialValues?._id) {
                await dispatch(updatePlan({ id: initialValues._id, data: payload }));
                CustomToast.success("Plan updated");
            } else {
                await dispatch(createPlan(payload));
                CustomToast.success("Plan created");
            }
            onSaved?.();
        } catch (e) {
            if (e?.errorFields) return;
            CustomToast.error("Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer
            title={initialValues ? "Edit Plan" : "New Plan"}
            width="clamp(320px, 100%, 580px)"
            visible={open}
            onClose={onClose}
            destroyOnClose
            footer={
                <div style={{ marginTop: 16, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" loading={saving} onClick={submit}>Save</Button>
                    </Space>
                </div>
            }
        >
            <Form form={form} layout="vertical">
                <Card size="small" style={{ marginBottom: 12 }}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={10}>
                            <Form.Item label="Name" name="title" rules={[{ required: true }]}>
                                <Input placeholder="Free / Basic / Pro / Premium" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label="Code" name="code" rules={[{ required: true, pattern: /^[A-Z0-9_\-]+$/, message: 'Use uppercase letters/numbers/_-' }]}>
                                <Input placeholder="FREE" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item label="Currency" name="currency" rules={[{ required: true }]}>
                                <Select options={currencyOptions} showSearch optionFilterProp="label" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item label="Public" name="isPublic" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Description" name="description">
                                <Input.TextArea rows={2} placeholder="Short description for marketing page" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card size="small" title={<Space><DollarOutlined /> <span>Base Pricing</span></Space>} style={{ marginBottom: 12 }}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Monthly" name="priceMonthly" rules={[{ required: true }]}>
                                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Stripe Price (Monthly)" name="stripePriceIdMonthly">
                                <Input placeholder="price_..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Yearly" name="priceYearly" rules={[{ required: true }]}>
                                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Stripe Price (Yearly)" name="stripePriceIdYearly">
                                <Input placeholder="price_..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Trial Days" name="trialDays">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Status" name="status">
                                <Select
                                    options={[
                                        { value: "active", label: "active" },
                                        { value: "hidden", label: "hidden" },
                                        { value: "archived", label: "archived" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Sort Order" name="sortOrder">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card size="small">
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={24}>
                            <Form.Item label="WhatsApp Query Limitaion Per Month" name="whatsapp_queries_per_month" rules={[{ required: true }]}>
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card size="small" title={<Space><SafetyCertificateOutlined /> <span>Modules & Add‑ons</span></Space>}>
                    {features?.length ? (
                        <Collapse bordered={false}>
                            {Object.entries(grouped).map(([cat, items]) => (
                                <Panel header={<span style={{ fontWeight: 600 }}>{cat}</span>} key={cat}>
                                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                        {items.map((f) => (
                                            <ModuleRow key={f.slug} feature={f} />
                                        ))}
                                    </Space>
                                </Panel>
                            ))}
                        </Collapse>
                    ) : (
                        <Empty description="No features configured" />)
                    }
                </Card>
            </Form>
        </Drawer>
    );
}

function ModuleRow({ feature }) {
    return (
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.modulesMap !== cur.modulesMap}>
            {({ getFieldValue }) => {
                const path = ["modulesMap", feature.slug];
                const included = getFieldValue(["modulesMap", feature.slug, "included"]) ?? false;
                return (
                    <Card size="small" bodyStyle={{ padding: 12 }}>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} md={18}>
                                <div>
                                    <Text strong>{feature.title}</Text>
                                    {feature.shortDesc && (
                                        <div style={{ color: "#888", fontSize: 12 }}>{feature.shortDesc}</div>
                                    )}
                                </div>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Item label="Included" name={[...path, "included"]} valuePropName="checked" style={{ marginBottom: 0 }}>
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                );
            }}
        </Form.Item>
    );
}
