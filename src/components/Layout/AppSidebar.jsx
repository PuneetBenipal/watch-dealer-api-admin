import React from "react";
import { Layout, Menu, Drawer, Avatar, Typography } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    ApartmentOutlined,
    DollarCircleOutlined,
    CustomerServiceOutlined,
    AlertOutlined,
    SettingOutlined,
    AppstoreAddOutlined,
    TagOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate, Link } from "react-router-dom";

const { Sider } = Layout;
const { Title } = Typography;

const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
    { key: "users", label: "Users", icon: <UserOutlined />, path: "/users" },
    { key: "companies", label: "Companies", icon: <ApartmentOutlined />, path: "/companies" },
    { key: "billing", label: "Billing", icon: <DollarCircleOutlined />, path: "/billing" },
    { key: "modules", label: "Modules", icon: <AppstoreAddOutlined />, path: "/modules" },
    { key: "plancard", label: "Plan Cards", icon: <FileTextOutlined />, path: "/plancards" },
    { key: "discounts", label: "Discounts", icon: <TagOutlined />, path: "/discounts" },
    { key: "support", label: "Support", icon: <CustomerServiceOutlined />, path: "/support" },
    { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/settings" },
    // { key: "logs", label: "Logs", icon: <AlertOutlined />, path: "/logs" },
];

export default function AppSidebar({
    collapsed,
    isMobile,
    drawerOpen,
    onCloseDrawer,
    theme = "light",
}) {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const isDark = theme === "dark";

    const selectedKey = React.useMemo(() => {
        const hit = navItems.find((n) => pathname === n.path || pathname.startsWith(n.path + "/"));
        return [hit ? hit.key : "dashboard"];
    }, [pathname]);

    const menu = (
        <Menu
            mode="inline"
            theme={isDark ? "dark" : "light"}       // ← NEW
            selectedKeys={selectedKey}
            onClick={({ key }) => {
                const item = navItems.find((n) => n.key === key);
                if (item) nav(item.path);
                if (isMobile) onCloseDrawer?.();
            }}
            style={{ borderRight: 0 }}
        >
            {navItems.map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                    <Link to={item.key}>{item.label}</Link>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <>
            {/* Desktop Sider */}
            {!isMobile && (
                <Sider
                    width={256}
                    collapsed={collapsed}
                    collapsedWidth={64}
                    theme={isDark ? "dark" : "light"}         // ← NEW
                    style={{
                        background: isDark ? "#001529" : "#fff", // ← NEW
                        borderRight: isDark ? "none" : "1px solid #f0f0f0",
                    }}
                >
                    <div
                        style={{
                            height: 64,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            paddingInline: 16,
                            borderBottom: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #f0f0f0",
                            color: isDark ? "rgba(255,255,255,0.85)" : "inherit",  // ← NEW
                        }}
                    >
                        <Avatar shape="square" size={32} src="/logo.svg" />
                        {!collapsed && (
                            <Title level={5} style={{ margin: 0, color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>
                                YourApp
                            </Title>
                        )}
                    </div>
                    {menu}
                </Sider>
            )}

            {/* Mobile Drawer (AntD v4 uses `visible`) */}
            {isMobile && (
                <Drawer
                    visible={drawerOpen}
                    onClose={onCloseDrawer}
                    placement="left"
                    width={280}
                    bodyStyle={{ padding: 0, background: isDark ? "#001529" : "#fff" }}  // ← NEW
                    destroyOnClose
                    getContainer={false}
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 12, color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>
                            <Avatar shape="square" size={28} src="/logo.svg" />
                            <span>Menu</span>
                        </div>
                    }
                >
                    {menu}
                </Drawer>
            )}
        </>
    );
}
