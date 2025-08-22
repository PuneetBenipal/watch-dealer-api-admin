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


import React, { useEffect } from "react";
import { Form, Input, Button, Card, Space, Grid } from "antd";
import PageContainer from "../components/common/PageContainer";
import { toast } from "../services/notify"; // or use your CustomToast

const { useBreakpoint } = Grid;
const KEY = "admin_settings";

export default function Settings() {
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        if (raw) form.setFieldsValue(JSON.parse(raw));
    }, [form]);

    const save = (vals) => {
        localStorage.setItem(KEY, JSON.stringify(vals));
        toast("success", "Saved", "Settings stored locally");
    };

    const reset = () => {
        localStorage.removeItem(KEY);
        form.resetFields();
        toast("success", "Reset", "Settings cleared");
    };

    return (
        <PageContainer title="Settings">
            <Card
                style={{ maxWidth: 720, margin: "0 auto" }}
                bodyStyle={{ padding: isMobile ? 16 : 24 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={save}
                    style={{ maxWidth: 560, marginInline: "auto" }}
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
                        <Space
                            wrap
                            style={{ width: "100%", justifyContent: isMobile ? "stretch" : "flex-start" }}
                        >
                            <Button onClick={reset}>Reset</Button>
                            <Button type="primary" htmlType="submit" block={isMobile}>
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </PageContainer>
    );
}
