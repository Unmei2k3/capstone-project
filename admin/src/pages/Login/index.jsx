import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, Space, message } from "antd";
import { LockOutlined, HomeOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../redux/slices/messageSlice";
import { loginUser, setIsLoggedOut } from "../../redux/slices/userSlice";
import {
    DOCTOR,
    NURSE,
    PATIENT,
    HOSPITALADMIN,
    HOSPITALSTAFF,
    SYSTEMADMIN
} from "../../constants/roles/role";
const { Title } = Typography;

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoggedOut } = useSelector((state) => state.user);
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

    // useEffect(() => {
    //     if (user && user.role?.name) {
    //         const role = user.role.name;

    //         const isInternal =
    //             role === NURSE ||
    //             role === DOCTOR ||
    //             role === HOSPITALSTAFF ||
    //             role === HOSPITALADMIN ||
    //             role === SYSTEMADMIN;

    //         if (isInternal) {
    //             if (role === NURSE) {
    //                 navigate('/nurse');
    //             } else if (role === DOCTOR) {
    //                 navigate('/doctor');
    //             } else if (role === HOSPITALSTAFF) {
    //                 navigate('/staff');
    //             } else if (role === HOSPITALADMIN) {
    //                 navigate('/admin-hospital');
    //             } else if (role === SYSTEMADMIN) {
    //                 navigate('/admin-system');
    //             }
    //         } else {
    //             dispatch(setMessage({ type: 'error', content: 'Vui lòng dùng tài khoản nội bộ!' }));
    //         }
    //     }
    // }, [user, navigate, dispatch]);

    const onFinish = async (values) => {
        try {
            console.log("Received values: ", values);

            const resultAction = await dispatch(loginUser({ email: values.email, password: values.password }));

            if (loginUser.fulfilled.match(resultAction)) {
                const tokenData = resultAction.payload;
                console.log("Token data in login: ", tokenData.user.role);

                if (tokenData?.user && tokenData.user.role.name !== PATIENT) {
                    const role = tokenData.user.role.name;

                    const isInternal =
                        role === NURSE ||
                        role === DOCTOR ||
                        role === HOSPITALSTAFF ||
                        role === HOSPITALADMIN ||
                        role === SYSTEMADMIN;

                    if (isInternal) {
                        dispatch(setMessage({ type: 'success', content: 'Đăng nhập thành công!' }));

                        setTimeout(() => {
                            if (role === NURSE) {
                                navigate('/nurse');
                            } else if (role === DOCTOR) {
                                navigate('/doctor');
                            } else if (role === HOSPITALSTAFF) {
                                navigate('/staff');
                            } else if (role === HOSPITALADMIN) {
                                navigate('/admin-hospital');
                            } else if (role === SYSTEMADMIN) {
                                navigate('/admin-system');
                            }
                        }, 800);
                    } else {
                        dispatch(setMessage({ type: 'error', content: 'Vui lòng dùng tài khoản nội bộ!' }));
                    }

                } else if (tokenData?.user && tokenData.user.role.name === PATIENT) {
                    dispatch(setMessage({ type: 'error', content: 'Vui lòng dùng tài khoản nội bộ!' }));
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

                    <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                        Đăng nhập DABS
                    </Title>
                    <div style={{ color: "#888" }}>Trang dành cho nội bộ</div>
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
                        label={<span>Địa chỉ Email </span>}
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
                            style={{ borderRadius: 6, background: "#1890ff", marginTop: 20 }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
                        <Link to="/login/forget-password" style={{ color: "#1890ff" }}>Quên mật khẩu?</Link>
                        <Link to="/login/register" style={{ color: "#1890ff" }}>Đăng ký</Link>

                    </div>
                </Form>

            </Card></>


    );
}

export default Login;