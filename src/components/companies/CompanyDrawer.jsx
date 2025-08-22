import React, { useEffect } from "react";
import { Drawer, Form, InputNumber, Select, DatePicker, Switch, Space, Button, Divider, Card } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateCompanyBilling, toggleCompanyModule, fetchCompanies } from "../../store/slices/companies";

const { Option } = Select;

export default function CompanyDrawer({ open, onClose, record }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!record) return;
        form.setFieldsValue({
            planId: record.planId,
            planStatus: record.planStatus,
            renewalDate: record.renewalDate ? moment(record.renewalDate) : null,
            seatsPurchased: record?.seats?.purchased || 0,
            createdAt: record.createdAt
        });
    }, [record, form]);

    if (!record) return null;

    const submit = async (vals) => {
        await dispatch(updateCompanyBilling({
            id: record._id || record.id,
            patch: {
                planId: vals.planId,
                planStatus: vals.planStatus,
                seatsPurchased: vals.seatsPurchased,
                renewalDate: vals.renewalDate ? vals.renewalDate.format("YYYY-MM-DD") : null,
                // seatsPurchased is UI-only for now (no endpoint yet) — keep in UI
            }
        }));
        // refresh list quickly
        dispatch(fetchCompanies());
        onClose?.();
    };

    const toggle = (key, enabled) =>
        dispatch(toggleCompanyModule({ id: record._id || record.id, key, enabled }));

    const ff = record.featureFlags || {};

    return (
        <Drawer
            title={record.name}
            placement="right"
            width="clamp(320px, 100%, 420px)"
            onClose={onClose}
            visible={open}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={submit}>
                <Form.Item label="Plan" name="planId" rules={[{ required: true }]}>
                    <Select>
                        <Option value="basic">Basic</Option>
                        <Option value="pro">Pro</Option>
                        <Option value="enterprise">Enterprise</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Plan Status" name="planStatus" rules={[{ required: true }]}>
                    <Select>
                        <Option value="active">Active</Option>
                        <Option value="past_due">Past Due</Option>
                        <Option value="canceled">Canceled</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Renewal Date" name="renewalDate">
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Seats (Purchased)" name="seatsPurchased">
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                {/* <Divider>Modules</Divider>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>WhatsApp Search</span>
                        <Switch checked={!!ff.whatsapp_search} onChange={(v) => toggle("whatsapp_search", v)} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Inventory</span>
                        <Switch checked={!!ff.inventory} onChange={(v) => toggle("inventory", v)} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Rolex Verification</span>
                        <Switch checked={!!ff.rolex_verification} onChange={(v) => toggle("rolex_verification", v)} />
                    </div>
                </Space> */}

                <Divider />
                <p>Company Members: </p>
                {
                    record?.teamMates?.length > 0 && record.teamMates.map((teamMate, idx) => {
                        return (
                            <div> <span>{idx + 1}.</span>&nbsp; &nbsp; &nbsp; {teamMate.fullName} / {teamMate.email} ( { teamMate.role } )</div>
                        )
                    })
                }
                <Divider />

                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Space>
            </Form>
        </Drawer>
    );
}
