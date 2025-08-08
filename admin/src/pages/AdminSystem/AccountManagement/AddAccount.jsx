import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, notification, Row, Col } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { createUser } from '../../../services/userService';

const { Option } = Select;

const AddAccount = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Success',
            description: 'Account added successfully!',
            placement: 'topRight',
        });
    };

    const error = () => {
        notification.error({
            message: 'Error',
            description: 'Failed to add account. Please try again.',
            placement: 'topRight',
        });
    };

    const handleSubmit = async (values) => {
        setSpinning(true);
        try {
            const response = await createUser(values);
            setTimeout(() => {
                setSpinning(false);
                if (response) {
                    form.resetFields();
                    success();
                    onSuccess();
                } else {
                    error();
                }
            }, 1000);
        } catch (err) {
            setSpinning(false);
            error();
            console.error("Error creating account:", err);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserAddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    Add New Account
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            className="custom-modal"
        >
            <Spin spinning={spinning}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        active: true,
                        role: 'user'
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="fullname"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter full name' }]}
                            >
                                <Input placeholder="John Doe" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="userName"
                                label="Username"
                                rules={[{ required: true, message: 'Please enter username' }]}
                            >
                                <Input placeholder="john.doe" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input placeholder="john.doe@example.com" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input placeholder="+1234567890" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: 'Please enter password' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="confirmPassword"
                                label="Confirm Password"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Please confirm password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirm password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please select role' }]}
                            >
                                <Select placeholder="Select role">
                                    <Option value="user">User</Option>
                                    <Option value="admin">Admin</Option>
                                    <Option value="doctor">Doctor</Option>
                                    <Option value="staff">Staff</Option>
                                    <Option value="nurse">Nurse</Option>
                                    <Option value="hospitalAdmin">Hospital Admin</Option>
                                    <Option value="systemAdmin">System Admin</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="active"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Select placeholder="Select status">
                                    <Option value={true}>Active</Option>
                                    <Option value={false}>Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Create Account
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AddAccount;