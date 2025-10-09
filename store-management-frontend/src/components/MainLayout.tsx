import { useAuth } from "@/context/AuthContext";
import {
  DashboardOutlined,
  GiftOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SubnodeOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Dropdown, Layout, Menu, theme } from "antd";
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
    },
    {
      key: "/stock-receipts",
      icon: <InboxOutlined />,
      label: "Nhập hàng",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng",
    },
    {
      key: "/customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
    },
    ...(isAdmin
      ? [
          {
            key: "/categories",
            icon: <TagsOutlined />,
            label: "Danh mục",
          },
          {
            key: "/suppliers",
            icon: <SubnodeOutlined />,
            label: "Nhà cung cấp",
          },
          {
            key: "/promotions",
            icon: <GiftOutlined />,
            label: "Khuyến mãi",
          },
          {
            key: "/users",
            icon: <UserOutlined />,
            label: "Tài Khoản",
          },
        ]
      : []),
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: user?.fullName,
      disabled: true,
    },
    {
      key: "role",
      label: `Role: ${user?.role}`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: collapsed ? 16 : 20,
            fontWeight: "bold",
            color: "#1890ff",
          }}
        >
          {collapsed ? "SM" : "Store Manager"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 18, cursor: "pointer" },
            }
          )}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
