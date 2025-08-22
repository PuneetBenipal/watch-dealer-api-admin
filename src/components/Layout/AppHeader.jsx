import React from "react";
import { Typography, Layout, Avatar, Dropdown, Menu, Space, Button } from "antd";
import { UserOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";

const { Header } = Layout;

export default function AppHeader({ collapsed, isMobile, onToggle, onOpenSidebar }) {
    const { logout } = useAuth();
    const menu = (
        <Menu>
            {/* <Menu.Item key="profile">Profile</Menu.Item>
                <Menu.Item key="settings">Settings</Menu.Item>
                <Menu.Divider /> */}
            <Menu.Item onClick={() => logout()} key="logout">Logout</Menu.Item>
        </Menu>
    );

    return (
        <Header
            style={{
                height: 64,
                paddingInline: 12,
                background: "#fff",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
            }}
        >
            <Space>
                {isMobile ? (
                    <Button type="text" icon={<MenuOutlined />} onClick={onOpenSidebar} />
                ) : (
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={onToggle}
                    />
                )}
                <Typography.Title level={5} style={{ margin: 0 }}>
                    Admin
                </Typography.Title>
            </Space>

            {/* <Space size="middle">{rightContent}</Space> */}

            <Dropdown overlay={menu} placement="bottomRight">
                <Space style={{ cursor: "pointer" }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                </Space>
            </Dropdown>
        </Header>
    );
}
