import { Outlet, Link } from "react-router-dom";
import { Button, Dropdown, Layout, message } from 'antd';
import "./style.scss";
import { UserOutlined, CaretDownOutlined, TikTokOutlined, FacebookOutlined, YoutubeOutlined, MenuOutlined, ProfileOutlined, LoginOutlined, BellOutlined, FileTextOutlined, LogoutOutlined, MessageOutlined, CalendarOutlined, KeyOutlined } from '@ant-design/icons';
import { Menu } from "antd";
import logo from "../../assets/images/dabs-logo.png"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import { useEffect } from "react";
import { clearMessage, setMessage } from "../../redux/slices/messageSlice";
const { SubMenu } = Menu;
const { Header, Footer } = Layout;
function LayoutCommon() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    console.log("User in LayoutCommon:", user);

    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,

            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);

    const handleLogout = () => {
        try {
            dispatch(logout());
            dispatch(setMessage({ type: 'success', content: 'Đăng xuất thành công!' }));
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: 'Đăng xuất thất bại. Vui lòng thử lại!' }));
        };
    }
    return <>
        {contextHolder}
        <Layout className="layout-default">
            <Header className="header">

                <div
                    className="header__logo"
                    onClick={() => navigate("/")}
                >
                    <img alt="logo" src={logo} />
                </div>

                <div className="header__content" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="header__content__top">
                        <div className="header__content__top__network">

                            <div className="header__content__top__network__tiktok">
                                <TikTokOutlined /> Tiktok
                            </div>
                            <div className="header__content__top__network__facebook">
                                <FacebookOutlined />   Facebook
                            </div>
                            <div className="header__content__top__network__youtube">
                                <YoutubeOutlined />  Youtube
                            </div>

                        </div>
                        <div className="header__content__top__wrapper">

                            <div className="header__content__top__wrapper__chat-button">
                                <Button
                                    type="primary"
                                    icon={<MessageOutlined />}
                                    onClick={() => navigate('/chat')}
                                >
                                    Trò chuyện với DABS Bot
                                </Button>
                            </div>

                            <div className="header__content__top__wrapper__account">
                                {user ? (
                                    <Dropdown
                                        overlay={
                                            <Menu>
                                                <Menu.Item key="greeting" disabled icon={<UserOutlined />}>
                                                    {user ? (user.fullname?.trim() || user.email || 'khách') : 'khách'}
                                                </Menu.Item>
                                                <Menu.Divider />
                                                {user ? (
                                                    <>
                                                        <Menu.Item key="booking-history" onClick={() => navigate('/booking-history')} icon={<CalendarOutlined />}>
                                                            Lịch sử đặt khám
                                                        </Menu.Item>
                                                        <Menu.Item key="profile" onClick={() => navigate('/profile')} icon={<UserOutlined />}>
                                                            Thông tin cá nhân
                                                        </Menu.Item>
                                                        <Menu.Item key="password" onClick={() => navigate('/account/change-password')} icon={<KeyOutlined />}>
                                                            Đổi mật khẩu
                                                        </Menu.Item>
                                                        <Menu.Item key="health-records" icon={<FileTextOutlined />} onClick={() => navigate('/health-records')}>
                                                            Hồ sơ bệnh nhân
                                                        </Menu.Item>
                                                        <Menu.Item key="records" icon={<FileTextOutlined />} onClick={() => navigate('/records')}>
                                                            Phiếu khám
                                                        </Menu.Item>
                                                        <Menu.Item key="notification" icon={<BellOutlined />} onClick={() => navigate('/notifications')}>
                                                            Thông báo
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                                                            Đăng xuất
                                                        </Menu.Item>
                                                    </>
                                                ) : (
                                                    <Menu.Item key="login" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                                                        Đăng nhập
                                                    </Menu.Item>
                                                )}
                                            </Menu>
                                        }
                                        placement="bottomRight"
                                        trigger={['click']}
                                    >
                                        <Button type="primary" icon={<UserOutlined />}>
                                            {user ? (user.fullname?.trim() || user.email) : 'Tài khoản'}
                                        </Button>
                                    </Dropdown>
                                ) : (
                                    <Button onClick={() => navigate('/login')} type="primary">
                                        <UserOutlined /> Đăng nhập
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>


                </div>

            </Header>
            <div className="nav-sticky-wrapper">
                <div className="header__content__bottom">
                    <Menu
                        mode="horizontal"
                        overflowedIndicator={<MenuOutlined />}
                    >
                        <Menu.Item key="support">
                            <a href="/">Hỗ trợ đặt khám</a>
                        </Menu.Item>

                        <SubMenu
                            key="medical-facilities"
                            title={
                                <span>
                                    Cơ sở y tế <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="facility-1">Cơ sở 1</Menu.Item>
                            <Menu.Item key="facility-2">Cơ sở 2</Menu.Item>
                        </SubMenu>

                        <SubMenu
                            key="medical-services"
                            title={
                                <span>
                                    Dịch vụ y tế <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="service-1">Dịch vụ 1</Menu.Item>
                            <Menu.Item key="service-2">Dịch vụ 2</Menu.Item>
                        </SubMenu>

                        <Menu.Item key="patient-records" onClick={() => navigate('/health-records')}>
                            Hồ sơ bệnh nhân
                        </Menu.Item>

                        <Menu.Item key="enterprise-health">
                            <a href="/">Khám sức khoẻ doanh nghiệp</a>
                        </Menu.Item>

                        <SubMenu
                            key="news"
                            title={
                                <span>
                                    Tin tức <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="news-1">Tin 1</Menu.Item>
                            <Menu.Item key="news-2">Tin 2</Menu.Item>
                        </SubMenu>

                        <SubMenu
                            key="guide"
                            title={
                                <span>
                                    Hướng dẫn <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="guide-1">Hướng dẫn 1</Menu.Item>
                            <Menu.Item key="guide-2">Hướng dẫn 2</Menu.Item>
                        </SubMenu>

                        <SubMenu
                            key="contact"
                            title={
                                <span>
                                    Liên hệ hợp tác <CaretDownOutlined />
                                </span>
                            }
                        >
                            <Menu.Item key="contact-1">Liên hệ 1</Menu.Item>
                            <Menu.Item key="contact-2">Liên hệ 2</Menu.Item>
                        </SubMenu>
                    </Menu>
                </div>
            </div>
            <main style={{ background: "#fff" }}>

                <div className="layout-default-main">
                    <Outlet />
                </div>

            </main>
            <Footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>DABS Medical Booking</h4>
                        <p>Hỗ trợ đặt khám trực tuyến 24/7</p>
                        <p>© {new Date().getFullYear()} Created by G81</p>
                    </div>
                    <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <p><strong>Hotline:</strong> 1900 1234</p>
                        <p><strong>Email:</strong> contact@dabs.com.vn</p>
                        <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM</p>
                    </div>
                    <div className="footer-section">
                        <h4>Kết nối với chúng tôi</h4>
                        <div className="footer-social">
                            <a href="#"><FacebookOutlined /></a>
                            <a href="#"><YoutubeOutlined /></a>
                            <a href="#"><TikTokOutlined /></a>
                        </div>
                    </div>
                </div>
            </Footer>
        </Layout>
    </>
}

export default LayoutCommon;