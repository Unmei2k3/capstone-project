import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, Space, message } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined,MailOutlined } from "@ant-design/icons";
import logo from "../../../assets/images/dabs-logo.png"
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from "../../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
const { Title } = Typography;

function ForgetPassword() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message)
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,

            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);
    const onFinish = async (values) => {
         const payload = {
                   emailAddress: values.email,
                };
                const messageText = await forgotPassword(payload);
                if (messageText === "Vui lòng kiểm tra email để đặt lại mật khẩu!") {
                    dispatch(setMessage({ type: 'success', content: messageText }));
                    setTimeout(() => {
                         navigate('/auth/reset-password/verify-email-notice');
                    }, 1000);
        
                }  else {
                    dispatch(setMessage({ type: 'error', content: messageText }));
                }
                console.log("Received values: ", payload);
    };

    return (
        <>
            {contextHolder}
            <Card
                style={{
                    width: 400,
                    minHeight: 500,
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    marginRight: 0,
                    zIndex: 2,
                    background: "rgba(255,255,255,0.97)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <img src={logo} alt="logo" style={{ width: 100, marginBottom: -20 }} />
                    <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                        Quên mật khẩu
                    </Title>
                    <div style={{ color: "#888" }}>Nhập email để lấy lại mật khẩu</div>
                </div>
                <Form name="forget-password" onFinish={onFinish} layout="vertical">
                      <Form.Item
                        name="email"
                        label={<span>Địa chỉ Email</span>}
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            style={{ borderRadius: 6, background: "#1890ff" }}
                        >
                            Gửi yêu cầu đặt lại mật khẩu
                        </Button>
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Link to="/login" style={{ color: "#1890ff" }}>Đăng nhập</Link>
                        <Link to="/login/register" style={{ color: "#1890ff" }}>Đăng ký</Link>
                    </div>
                </Form>
                <Button
                    type="link"
                    onClick={() => {
                        navigate('/');
                        messageApi.open({
                            type: 'success',
                            content: 'This is a success message',
                        });
                    }

                    }
                    icon={<HomeOutlined />}
                    style={{ marginTop: 24, color: "#1890ff", paddingLeft: 0 }}
                    block
                >
                    Quay về trang chính
                </Button>
            </Card>
        </>

    );
}

export default ForgetPassword;