
import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, Space, Row, Col, message } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../../../assets/images/dabs-logo.png"
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from "../../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
const { Title } = Typography;
function Register() {
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
            username: values.email,
            email: values.email,
            fullName: values.fullName,
            password: values.password,
        };
        const messageText = await registerUser(payload);
        if (messageText === "Đăng ký thành công!") {
            dispatch(setMessage({ type: 'success', content: messageText }));
            setTimeout(() => {
                 navigate('/auth/verify-email-notice');
            }, 800);

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
                    width: 500,
                    minHeight: 550,
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    marginRight: 0,
                    zIndex: 2,
                    background: "rgba(255,255,255,0.97)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <img src={logo} alt="logo" style={{ width: 100, marginBottom: -20, marginTop: -40 }} />
                    <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                        Đăng ký DABS
                    </Title>
                    <div style={{ color: "#888" }}>Tạo tài khoản mới cho hệ thống bệnh viện</div>
                </div>
                <Form name="register" onFinish={onFinish} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}></Col>
                    </Row>
                    {/* <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            { pattern: /^0[0-9]{9}$/, message: "Số điện thoại không hợp lệ!" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập số điện thoại"
                            size="large"
                        />
                    </Form.Item> */}

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
                    <Form.Item
                        name="fullName"
                        label={<span >Họ và tên (có dấu)</span>}
                        rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },

                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirm"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            style={{ borderRadius: 6, background: "#1890ff" }}
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Link to="/login/forget-password" style={{ color: "#1890ff" }}>Quên mật khẩu?</Link>
                        <Link to="/login" style={{ color: "#1890ff" }}>Đã có tài khoản? Đăng nhập</Link>

                    </div>
                </Form>
                <Button
                    type="link"
                    onClick={() => navigate('/')}
                    icon={<HomeOutlined />}
                    style={{ marginTop: 24, color: "#1890ff", paddingLeft: 0 }}
                    block
                >
                    Quay về trang chính
                </Button>
            </Card>
        </>
    )
}

export default Register;