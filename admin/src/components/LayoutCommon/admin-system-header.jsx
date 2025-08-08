import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Sider from "antd/es/layout/Sider";
import { DashboardOutlined, HomeOutlined, UserOutlined,ReadOutlined } from '@ant-design/icons';
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title"; // sửa từ Skeleton thành Typography
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
const AdminSystemHeader = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("Logout clicked");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.3)" }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
        >
          <Menu.Item key="/admin-system" icon={<DashboardOutlined />}>
            <NavLink to="/admin-system">Dashboard</NavLink>
          </Menu.Item>,
          <Menu.Item key="/admin-system/hospitals" icon={<HomeOutlined />}>
            <NavLink to="/admin-system/hospitals">Quản lý bệnh viện</NavLink>
          </Menu.Item>
          <Menu.Item key="/admin-system/users" icon={<UserOutlined />}>
            <NavLink to="/admin-system/users">Quản lý người dùng</NavLink>
          </Menu.Item>
            <Menu.Item key="/admin-system/specialist-management" icon={<ReadOutlined />}>
            <NavLink to="/admin-system/specialist-management">Quản lý chuyên khoa</NavLink>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản trị hệ thống bệnh viện
          </Title>

          <div>
            <span style={{ marginRight: 16 }}>Xin chào, {user?.fullName || "Người dùng"}</span>
            <Button type="primary" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </Header>

        <Content style={{ margin: 24, background: "#fff", minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminSystemHeader;
