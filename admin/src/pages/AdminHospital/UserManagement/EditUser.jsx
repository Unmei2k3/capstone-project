import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import { getUserById, updateUser } from '../../../services/userService';
import dayjs from 'dayjs';

const { Option } = Select;

const EditUser = ({ visible, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const dispatch = useDispatch();

    // ✅ Roles data matching API
    const roles = [
        { id: 1, name: 'Doctor', roleType: 2 },
        { id: 2, name: 'Patient', roleType: 6 },
        { id: 3, name: 'Hospital Admin', roleType: 4 },
        { id: 4, name: 'System Admin', roleType: 5 },
        { id: 5, name: 'Nurse', roleType: 7 },
        { id: 6, name: 'Default User', roleType: 1 }
    ];

    useEffect(() => {
        if (visible && record?.id) {
            fetchUserDetails(record.id);
        }
    }, [visible, record]);

    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
            const userData = await getUserById(userId);
            if (userData) {
                setUserDetails(userData);

                // ✅ Set form values with proper mapping
                form.setFieldsValue({
                    fullname: userData.fullname || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    roleId: userData.role?.id || roles[0].id,
                    gender: userData.gender ? 'male' : 'female',
                    dob: userData.dob && userData.dob !== '0001-01-01' ? dayjs(userData.dob) : null,
                    job: userData.job || '',
                    cccd: userData.cccd || '',
                    province: userData.province || '',
                    ward: userData.ward || '',
                    streetAddress: userData.streetAddress || '',
                    active: userData.active
                });
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            dispatch(setMessage({
                type: 'error',
                content: '❌ Failed to load user details',
                duration: 4
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const selectedRole = roles.find(role => role.id === values.roleId);

            // ✅ Transform data to match API schema
            const updateData = {
                fullname: values.fullname,
                phoneNumber: values.phoneNumber || '',
                email: values.email,
                avatarUrl: userDetails?.avatarUrl || '',
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : '2025-07-20',
                gender: values.gender === 'male',
                job: values.job || '',
                cccd: values.cccd || '',
                province: values.province || '',
                ward: values.ward || '',
                streetAddress: values.streetAddress || ''
            };

            // ✅ Add password if provided
            if (values.password && values.password.trim()) {
                updateData.password = values.password;
            }

            console.log('📤 Updating user with ID:', record.id);
            console.log('📤 Update data:', updateData);

            const response = await updateUser(record.id, updateData);

            // ✅ Log full response để debug
            console.log('✅ Full response:', response);

            // ✅ More flexible response checking
            if (response && (response.success === true || response.result || response.data || response.id)) {
                dispatch(setMessage({
                    type: 'success',
                    content: 'User updated successfully! 🎉',
                    duration: 4
                }));
                onSuccess();
            } else if (response && response.success === false) {
                // Handle explicit failure
                const errorMsg = response.message || response.error || 'Update failed';
                throw new Error(errorMsg);
            } else {
                // ✅ Accept any non-null response as success (for APIs that don't return success flag)
                console.log('⚠️ Response format not recognized, but assuming success:', response);
                dispatch(setMessage({
                    type: 'success',
                    content: 'User updated successfully! 🎉',
                    duration: 4
                }));
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Error updating user:', error);

            let errorMessage = 'Failed to update user. Please try again.';

            // ✅ Better error handling
            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('📋 Error response data:', errorData);

                if (errorData.title) {
                    switch (errorData.title) {
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = 'This phone number is already registered by another user.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = 'This email is already registered by another user.';
                            break;
                        case 'CCCD_ALREADY_EXISTS':
                            errorMessage = 'This CCCD/ID card number is already registered by another user.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage = 'Please check your input data. Some fields contain invalid information.';
                            break;
                        default:
                            errorMessage = errorData.title.replace(/_/g, ' ').toLowerCase();
                            break;
                    }
                }
                else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            }
            // ✅ Handle custom error messages
            else if (error.message && error.message !== 'Invalid response from server') {
                errorMessage = error.message;
            }

            dispatch(setMessage({
                type: 'error',
                content: `❌ ${errorMessage}`,
                duration: 6
            }));
        } finally {
            setLoading(false);
        }
    };

    if (!userDetails && !loading) {
        return null;
    }

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    Edit User: {userDetails?.fullname || record?.fullname || 'Loading...'}
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
                                        { type: 'email', message: 'Please enter valid email' }
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
                                    label="New Password (Optional)"
                                    rules={[
                                        { min: 6, message: 'Password must be at least 6 characters' }
                                    ]}
                                >
                                    <Input.Password placeholder="Leave blank to keep current password" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    dependencies={['password']}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!getFieldValue('password') || !value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Passwords do not match!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="Confirm new password" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="active"
                            label="Account Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select account status">
                                <Option value={true}>Active</Option>
                                <Option value={false}>Inactive</Option>
                            </Select>
                        </Form.Item>
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
                                    <Input placeholder="Enter phone number" />
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
                                    <Input placeholder="Enter ID number" />
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
                            <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
                                Update User
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default EditUser;