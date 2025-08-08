import { Button, Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import "./LayoutDefault.css";
import logo from "../common/logo/logo.png";
import logo_fold from "../common/logo/logo-fold.png";
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useState } from "react";
import Notify from "../Notify";
import MenuSider from "../MenuSider";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, logoutHand } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
function LayoutCommon() {
    const [collapsed, setCallapsed] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        dispatch(logoutHand());
        navigate("/login");
    };
    return (
        <>
            <Layout className="layout-default">
                <header className="header">
                    <div className={"header__logo " + (collapsed &&
                        "header__logo--collapsed")}>
                        <img src={collapsed ? logo_fold : logo} alt="Logo" />
                    </div>
                    <div className="header__nav">
                        <div className="header__nav-left">
                            <div onClick={() => setCallapsed(!collapsed)} className="header__collapse">
                                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </div>
                        </div>
                        <div className="header__nav-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <Notify />
                            <Button danger onClick={handleLogout}>Đăng xuất</Button>
                        </div>
                    </div>
                </header>
                <Layout>
                    <Sider theme="light" className="sider" collapsed={collapsed}>
                        <MenuSider />
                    </Sider>

                    <Content className="content">
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default LayoutCommon;