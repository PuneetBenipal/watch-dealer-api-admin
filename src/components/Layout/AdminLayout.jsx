import React from "react";
import { Layout, Grid } from "antd";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../store/slices/ui";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const { Content } = Layout;
const { useBreakpoint } = Grid;


export default function AdminLayout() {
    const dispatch = useDispatch();
    const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AppSidebar
                collapsed={collapsed}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                onCloseDrawer={() => setDrawerOpen(false)}
                theme="dark"
            />
            <Layout>
                <AppHeader
                    collapsed={collapsed}
                    isMobile={isMobile}
                    onToggle={() => dispatch(toggleSidebar())} // desktop collapse/expand
                    onOpenSidebar={() => setDrawerOpen(true)}  
                />
                <Content style={{ margin: 16 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
