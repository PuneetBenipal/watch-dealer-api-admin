import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Card, Divider, Space, message } from "antd";
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined, GithubOutlined, SafetyOutlined } from "@ant-design/icons";
import useAuth from "../hooks/useAuth";

const { Title, Text, Link } = Typography;

export default function Login() {
    const { login } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await login(values.email, values.password);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Login failed";
            message.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-wrap">
            <Card className="login-card" bordered={false}>
                <Space direction="vertical" size={8} style={{ width: "100%", textAlign: "center" }}>
                    <div className="brand">
                        <div className="logo">SA</div>
                        <Title level={3} style={{ margin: 0 }}>Super Admin Panel</Title>
                        <Text type="secondary">Sign in to continue</Text>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        validateTrigger={["onBlur", "onSubmit"]}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required." },
                                { type: "email", message: "Please enter a valid email address." },
                            ]}
                        >
                            <Input
                                size="large"
                                autoComplete="email"
                                prefix={<MailOutlined />}
                                placeholder="name@example.com"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Password is required." }]}
                        >
                            <Input.Password
                                size="large"
                                autoComplete="current-password"
                                prefix={<LockOutlined />}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                placeholder="••••••••"
                            />
                        </Form.Item>

                        <div className="row-between">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            {/* <Link href="/forgot-password">Forgot password?</Link> */}
                        </div>

                        <Form.Item style={{ marginTop: 8 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={submitting}
                                icon={<SafetyOutlined />}
                            >
                                Sign in
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
            </Card>

            <style>{`
        .login-wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #fff; /* keep page white to match your app */
          padding: 24px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 24px;
        }
        .brand { margin-bottom: 8px; }
        .logo {
          width: 48px; height: 48px; border-radius: 12px;
          display: grid; place-items: center; font-weight: 700; color: #1677ff;
          background: linear-gradient(180deg, #f0f5ff, #ffffff);
          border: 1px solid #eef3ff; margin: 0 auto 8px;
        }
        .row-between {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
      `}</style>
        </div>
    );
}
