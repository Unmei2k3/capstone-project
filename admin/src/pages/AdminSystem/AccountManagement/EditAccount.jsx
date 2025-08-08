import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, notification, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { updateUser } from '../../../services/userService';

const { Option } = Select;

const EditAccount = ({ visible, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        if (record && visible) {
            form.setFieldsValue({
                ...record,
                role: record.role || 'user'
            });
        }
    }, [record, visible, form]);

    const handleSubmit = async (values) => {
        setSpinning(true);
        try {
            const response = await updateUser(record.id, values);
            setTimeout(() => {
                setSpinning(false);
                if (response) {
                    notification.success({
                        message: 'Success',
                        description: 'Account updated successfully!',
                    });
                    onSuccess();
                } else {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to update account.',
                    });
                }
            }, 1000);
        } catch (err) {
            setSpinning(false);
            notification.error({
                message: 'Error',
                description: 'Failed to update account.',
            });
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    Edit Account: {record?.fullname}
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Spin spinning={spinning}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
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
                                Update Account
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default EditAccount;