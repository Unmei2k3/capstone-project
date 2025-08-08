import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice'; // ✅ Sử dụng path đúng
import { createUser } from '../../../services/userService';
import dayjs from 'dayjs';

const { Option } = Select;

const AddUser = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // ✅ Simplified roles data
    const roles = [
        { id: 1, name: 'Doctor', roleType: 2 },
        { id: 2, name: 'Patient', roleType: 6 },
        { id: 3, name: 'Hospital Admin', roleType: 4 },
        { id: 4, name: 'System Admin', roleType: 5 },
        { id: 5, name: 'Nurse', roleType: 7 },
        { id: 6, name: 'Default User', roleType: 1 }
    ];

    const handleSubmit = async (values) => {
        setLoading(true);
        
        try {
            const selectedRole = roles.find(role => role.id === values.roleId);
            
            const userData = {
                hospitalId: 0,
                roleType: selectedRole?.roleType || 1,
                fullname: values.fullname,
                phoneNumber: values.phoneNumber || '',
                email: values.email,
                password: values.password,
                avatarUrl: '',
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : '2025-07-18',
                gender: values.gender === 'male',
                job: values.job || '',
                cccd: values.cccd || '',
                province: values.province || '',
                ward: values.ward || '',
                streetAddress: values.streetAddress || ''
            };

            console.log('📤 Creating user:', userData);

            const response = await createUser(userData);
            
            if (response?.success || response?.result) {
                // ✅ Success message sử dụng Redux messageSlice có sẵn
                dispatch(setMessage({
                    type: 'success',
                    content: 'User created successfully! 🎉',
                    duration: 4
                }));
                
                form.resetFields();
                onSuccess();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('❌ Error creating user:', error);
            
            let errorMessage = 'Failed to create user. Please try again.';
            
            // ✅ Handle specific error responses
            if (error.response?.data) {
                const errorData = error.response.data;
                
                if (errorData.title) {
                    switch (errorData.title) {
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = 'This phone number is already registered. Please use a different phone number.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = 'This email is already registered. Please use a different email address.';
                            break;
                        case 'CCCD_ALREADY_EXISTS':
                            errorMessage = 'This CCCD/ID card number is already registered. Please check your ID number.';
                            break;
                        case 'USERNAME_ALREADY_EXISTS':
                            errorMessage = 'This username is already taken. Please choose a different username.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage = 'Please check your input data. Some fields contain invalid information.';
                            break;
                        default:
                            errorMessage = errorData.title.replace(/_/g, ' ').toLowerCase();
                            break;
                    }
                }
                else if (errorData.errors) {
                    const validationErrors = [];
                    Object.keys(errorData.errors).forEach(field => {
                        const fieldErrors = errorData.errors[field];
                        if (Array.isArray(fieldErrors)) {
                            validationErrors.push(...fieldErrors.filter(err => typeof err === 'string'));
                        } else if (typeof fieldErrors === 'string') {
                            validationErrors.push(fieldErrors);
                        }
                    });
                    if (validationErrors.length > 0) {
                        errorMessage = validationErrors.join('. ');
                    }
                }
                else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            
            // ✅ Error message sử dụng Redux messageSlice có sẵn
            dispatch(setMessage({
                type: 'error',
                content: `❌ ${errorMessage}`,
                duration: 6
            }));
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserAddOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Add New User
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={900}
            destroyOnClose
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        gender: 'female',
                        dob: dayjs('1990-01-01')
                    }}
                >
                    {/* Account Information */}
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ color: '#1890ff', marginBottom: 16 }}>Account Information</h4>
                        
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Please enter email' },
                                        { type: 'email', message: 'Please enter valid email' },
                                        { max: 100, message: 'Email must not exceed 100 characters' }
                                    ]}
                                >
                                    <Input placeholder="Enter email address" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="roleId"
                                    label="Role"
                                    rules={[{ required: true, message: 'Please select role' }]}
                                >
                                    <Select placeholder="Select user role">
                                        {roles.map(role => (
                                            <Option key={role.id} value={role.id}>
                                                {role.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
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
                            <Col span={12}>
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
                    </div>

                    {/* Personal Information */}
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ color: '#1890ff', marginBottom: 16 }}>Personal Information</h4>
                        
                        <Form.Item
                            name="fullname"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter full name' }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item 
                                    name="phoneNumber" 
                                    label="Phone Number"
                                    rules={[
                                        { 
                                            pattern: /^[0-9]{10,11}$/, 
                                            message: 'Phone number must be 10-11 digits' 
                                        }
                                    ]}
                                >
                                    <Input placeholder="Enter phone number (10-11 digits)" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="gender"
                                    label="Gender"
                                    rules={[{ required: true, message: 'Please select gender' }]}
                                >
                                    <Select placeholder="Select gender">
                                        <Option value="male">Male</Option>
                                        <Option value="female">Female</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="dob" label="Date of Birth">
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder="Select date"
                                        format="YYYY-MM-DD"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="job" label="Job/Occupation">
                                    <Input placeholder="Enter job" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    name="cccd" 
                                    label="CCCD/ID Card"
                                    rules={[
                                        { 
                                            pattern: /^[0-9]{9,12}$/, 
                                            message: 'CCCD must be 9-12 digits' 
                                        }
                                    ]}
                                >
                                    <Input placeholder="Enter ID number (9-12 digits)" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {/* Address Information */}
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ color: '#1890ff', marginBottom: 16 }}>Address Information</h4>
                        
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="province" label="Province">
                                    <Input placeholder="Enter province" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="ward" label="Ward">
                                    <Input placeholder="Enter ward" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="streetAddress" label="Street Address">
                                    <Input placeholder="Enter street address" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {/* Action Buttons */}
                    <Row justify="end" gutter={8}>
                        <Col>
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Create User
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AddUser;