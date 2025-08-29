import React, { useEffect, useState } from "react";
import {
    Table, Tag, Input, Space, Select, Button, Dropdown, Menu,
    Popconfirm, message, Grid, Drawer, Form, Modal, InputNumber
} from "antd";
import { MoreOutlined, FilterOutlined, SettingOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import PageContainer from "../components/common/PageContainer";
import {
    fetchUsers, setUserFilters, updateUser, inviteUser, deleteUser, impersonateUser
} from "../store/slices/users";
import InviteUserModal from "../components/users/InviteUserModal";
import UserDrawer from "../components/users/UserDrawer";
import useAuth from "../hooks/useAuth";

const { Option } = Select;
const { useBreakpoint } = Grid;

export default function Users() {
    const dispatch = useDispatch();
    const auth = useAuth();
    const { items, total, page, pageSize, status, filters, acting, error } = useSelector(s => s.users);

    const [inviteOpen, setInviteOpen] = useState(false);
    const [drawer, setDrawer] = useState({ open: false, rec: null });
    const [filterOpen, setFilterOpen] = useState(false);
    const [settingsModal, setSettingsModal] = useState({ open: false, user: null });
    const [settingsForm] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => { if (error) message.error(error); }, [error]);
    useEffect(() => {
        dispatch(fetchUsers({ page, pageSize, ...filters }));
    }, [dispatch, page, pageSize, filters.q, filters.status, filters.role]);

    const openEdit = (row) => setDrawer({ open: true, rec: row });
    const saveEdit = async (vals) => {
        const id = drawer.rec._id || drawer.rec.id;
        await dispatch(updateUser({ id, patch: vals }));
        setDrawer({ open: false, rec: null });
    };
    const removeUser = async () => {
        const id = drawer.rec._id || drawer.rec.id;
        await dispatch(deleteUser({ id }));
        setDrawer({ open: false, rec: null });
    };

    const suspend = (row) => dispatch(updateUser({ id: row._id || row.id, patch: { status: "suspended" } }));
    const reactivate = (row) => dispatch(updateUser({ id: row._id || row.id, patch: { status: "active" } }));
    const makeRole = (row, role) => dispatch(updateUser({ id: row._id || row.id, patch: { userKind: role } }));
    
    const openUserSettings = (user) => {
        setSettingsModal({ open: true, user });
        settingsForm.setFieldsValue({
            maxApiCalls: user.settings?.maxApiCalls || 1000,
            maxInventoryItems: user.settings?.maxInventoryItems || 500,
            enableWhatsApp: user.settings?.enableWhatsApp !== false,
            enableEscrow: user.settings?.enableEscrow !== false,
            customPricing: user.settings?.customPricing || false,
            discountPercentage: user.settings?.discountPercentage || 0
        });
    };

    const saveUserSettings = async (values) => {
        try {
            const userId = settingsModal.user._id || settingsModal.user.id;
            await dispatch(updateUser({ 
                id: userId, 
                patch: { settings: values }
            }));
            message.success('User settings updated successfully');
            setSettingsModal({ open: false, user: null });
            settingsForm.resetFields();
        } catch (error) {
            message.error('Failed to update user settings');
        }
    };

    const doImpersonate = async (row) => {
        const res = await dispatch(impersonateUser({ id: row._id || row.id }));
        if (res.meta.requestStatus === "fulfilled") {
            const { token, user } = res.payload;
            auth.login(user, token);
            message.success(`Impersonating ${user.email}`);
        }
    };

    const doInvite = async (vals) => {
        const res = await dispatch(inviteUser(vals));
        if (res.meta.requestStatus === "fulfilled") {
            message.success("Invitation created (mock)");
            setInviteOpen(false);
        }
    };

    const columns = [
        { title: "Name", dataIndex: "fullName", ellipsis: true },
        { title: "Email", dataIndex: "email", ellipsis: true, },
        { title: "Role", dataIndex: "userKind", render: r => <Tag>{r}</Tag>, },
        { title: "Company", dataIndex: "company", ellipsis: true, },
        {
            title: "Status",
            dataIndex: "status",
            render: s => <Tag color={s === "active" ? "green" : "red"}>{s}</Tag>,
        },
        {
            title: "Actions",
            width: 160,
            fixed: screens.lg ? undefined : undefined,
            render: (_, row) => {
                const id = row._id || row.id;
                const loading = !!acting[id];
                const menu = (
                    <Menu>
                        <Menu.Item onClick={() => openEdit(row)} icon={<SettingOutlined />}>
                            Edit Profile
                        </Menu.Item>
                        <Menu.Item onClick={() => openUserSettings(row)} icon={<SettingOutlined />}>
                            Override Settings
                        </Menu.Item>
                        <Menu.Item onClick={() => doImpersonate(row)} icon={<UserSwitchOutlined />}>
                            Impersonate User
                        </Menu.Item>

                        <Menu.Divider />
                        {row.status === "active" ? (
                            <Menu.Item>
                                <Popconfirm title="Suspend this account?" onConfirm={() => suspend(row)}>
                                    <Button type="link" size="small" loading={loading}>Suspend</Button>
                                </Popconfirm>
                            </Menu.Item>
                        ) : (
                            <Menu.Item>
                                <Button type="link" size="small" onClick={() => reactivate(row)} loading={loading}>Reactivate</Button>
                            </Menu.Item>
                        )}


                        <Menu.Divider />
                        <Menu.Item>
                            <Popconfirm title="Delete user?" onConfirm={() => dispatch(deleteUser({ id }))}>
                                <Button type="link" danger size="small" loading={loading}>Delete</Button>
                            </Popconfirm>
                        </Menu.Item>
                    </Menu>
                );
                return (
                    <Dropdown overlay={menu} trigger={["click"]}>
                        <Button size="small" icon={<MoreOutlined />}>
                            {screens.sm ? "Manage" : null}
                        </Button>
                    </Dropdown>
                );
            }
        }
    ];

    // Desktop filter bar (wraps nicely); Mobile shows Drawer
    const FiltersBar = (
        <Space wrap style={{ width: "100%", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
            {!isMobile && (
                <>
                    <Input.Search
                        placeholder="Search name/email"
                        allowClear
                        style={{ width: isMobile ? "100%" : 240 }}
                        defaultValue={filters.q}
                        onSearch={(q) => dispatch(setUserFilters({ q }))}
                    />
                    <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: isMobile ? "100%" : 140 }}
                        value={filters.status}
                        onChange={(v) => dispatch(setUserFilters({ status: v }))}
                    >
                        <Option value="active">active</Option>
                        <Option value="suspended">suspended</Option>
                    </Select>
                    <Select
                        placeholder="Role"
                        allowClear
                        style={{ width: isMobile ? "100%" : 130 }}
                        value={filters.role}
                        onChange={(v) => dispatch(setUserFilters({ role: v }))}
                    >
                        <Option value="owner">Owner</Option>
                        <Option value="member">Member</Option>
                    </Select>
                    {/* <Button type="primary" onClick={() => setInviteOpen(true)}>Invite User</Button> */}
                </>
            )}

            {isMobile && (
                <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
                    Filters
                </Button>
            )}
        </Space>
    );

    return (
        <PageContainer
            title="Users"
            extra={FiltersBar}
        >
            {/* Mobile Filters Drawer */}
            <Drawer
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                title="Filters"
                width="clamp(320px, 100%, 420px)"
                bodyStyle={{ paddingBottom: 16 }}
            >
                <Form
                    layout="vertical"
                    initialValues={{ q: filters.q, status: filters.status, role: filters.role }}
                    onFinish={(vals) => {
                        dispatch(setUserFilters(vals));
                        setFilterOpen(false);
                    }}
                >
                    <Form.Item name="q" label="Search">
                        <Input placeholder="Search name/email" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select allowClear placeholder="Select status">
                            <Option value="active">active</Option>
                            <Option value="suspended">suspended</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="role" label="Role">
                        <Select allowClear placeholder="Select role">
                            <Option value="owner">Owner</Option>
                            <Option value="member">Member</Option>
                        </Select>
                    </Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button onClick={() => {
                            dispatch(setUserFilters({ q: undefined, status: undefined, role: undefined }));
                            setFilterOpen(false);
                        }}>
                            Clear
                        </Button>
                        <Button type="primary" htmlType="submit">Apply</Button>
                    </Space>
                </Form>
            </Drawer>

            <Table
                rowKey={(r) => r._id || r.id}
                columns={columns}
                dataSource={items}
                loading={status === "loading"}
                size={isMobile ? "small" : "middle"}
                scroll={{ x: "max-content" }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    onChange: (p, ps) => dispatch(fetchUsers({ page: p, pageSize: ps, ...filters })),
                    responsive: true,
                }}
            />

            <InviteUserModal
                visible={inviteOpen}
                onCancel={() => setInviteOpen(false)}
                onOk={doInvite}
            />

            <UserDrawer
                visible={drawer.open}
                onClose={() => setDrawer({ open: false, rec: null })}
                record={drawer.rec}
                onSave={saveEdit}
                onDelete={removeUser}
            />

            {/* User Settings Override Modal */}
            <Modal
                title={`Override Settings - ${settingsModal.user?.email || ''}`}
                visible={settingsModal.open}
                onCancel={() => {
                    setSettingsModal({ open: false, user: null });
                    settingsForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={settingsForm}
                    layout="vertical"
                    onFinish={saveUserSettings}
                >
                    <Form.Item
                        label="Max API Calls per Month"
                        name="maxApiCalls"
                        rules={[{ required: true, type: 'number', min: 0 }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        label="Max Inventory Items"
                        name="maxInventoryItems"
                        rules={[{ required: true, type: 'number', min: 0 }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        label="Custom Discount Percentage"
                        name="discountPercentage"
                        rules={[{ required: true, type: 'number', min: 0, max: 100 }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} max={100} />
                    </Form.Item>

                    <Form.Item name="enableWhatsApp" valuePropName="checked">
                        <input type="checkbox" /> Enable WhatsApp Module
                    </Form.Item>

                    <Form.Item name="enableEscrow" valuePropName="checked">
                        <input type="checkbox" /> Enable Escrow Service
                    </Form.Item>

                    <Form.Item name="customPricing" valuePropName="checked">
                        <input type="checkbox" /> Custom Pricing Enabled
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Settings
                            </Button>
                            <Button onClick={() => {
                                setSettingsModal({ open: false, user: null });
                                settingsForm.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
}
