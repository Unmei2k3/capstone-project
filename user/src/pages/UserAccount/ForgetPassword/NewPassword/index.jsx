
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Card, Space, message } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";

import { useLocation, useNavigate } from 'react-router-dom';

import { resetPassword } from "../../../../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../../redux/slices/messageSlice";
import logo from "../../../../assets/images/dabs-logo.png";
const { Title } = Typography;
function NewPassword() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { token, email } = location.state || {};
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
        if (!token || !email) {
            navigate('/login');
            return;
        }
        const payload = {
            email: email,
            resetToken: token,
            newPassword: values.password,
        };
        console.log("Received values: ", payload);
        try {
            const messageText = await resetPassword(payload);

            if (messageText === "Đặt lại mật khẩu thành công!") {
                dispatch(setMessage({ type: 'success', content: messageText }));
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                dispatch(setMessage({ type: 'error', content: messageText }));
            }
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: "Có lỗi xảy ra vui lòng thử lại sau!" }));
        }
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
                <Form name="newPassword" onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
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
                        <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item name="email" initialValue={email} hidden>
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item name="resetToken" initialValue={token} hidden>
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            style={{ borderRadius: 6, background: "#1890ff" }}
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>
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

export default NewPassword;