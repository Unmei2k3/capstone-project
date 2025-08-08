import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, Space, message } from "antd";
import { LockOutlined, HomeOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../../../assets/images/dabs-logo.png"
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import { loginUser } from "../../../redux/slices/userSlice";
const { Title } = Typography;

function Login() {
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
        try {
            console.log("Received values: ", values);

            const resultAction = await dispatch(loginUser({ email: values.email, password: values.password }));

            if (loginUser.fulfilled.match(resultAction)) {
                const tokenData = resultAction.payload;
                console.log("Token data in login: ", tokenData);
                console.log("Token data user in login: ", tokenData.user);
                if (tokenData?.user && tokenData.user.role.name === 'Patient') {

                    dispatch(setMessage({ type: 'success', content: 'Đăng nhập thành công!' }));

                    setTimeout(() => {
                        navigate('/');
                    }, 800);
                } else if (tokenData.user.role.name !== 'Patient') {
                    dispatch(setMessage({ type: 'error', content: 'Vui lòng dùng tài khoản bệnh nhân!' }));
                }

                else {
                    throw new Error("Dữ liệu token không hợp lệ.");
                }
            } else {
                throw new Error(resultAction.payload || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error("Login failed: ", error);
            dispatch(setMessage({ type: 'error', content: 'Đăng nhập thất bại. Vui lòng thử lại!' }));
        }
    };

    return (
        <>
            {contextHolder}
            <Card
                style={{
                    width: 400,
                    height: 500,
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
                        Đăng nhập DABS
                    </Title>
                    <div style={{ color: "#888" }}>Đăng nhập vào hệ thống bệnh viện</div>
                </div>
                <Form name="login" onFinish={onFinish} layout="vertical">
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
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
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
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Link to="/login/forget-password" style={{ color: "#1890ff" }}>Quên mật khẩu?</Link>
                        <Link to="/login/register" style={{ color: "#1890ff" }}>Đăng ký</Link>

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
            </Card></>


    );
}

export default Login;