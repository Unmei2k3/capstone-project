import React, { useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Button, Spin, TimePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux'; // ✅ Add Redux import
import { setMessage } from '../../../redux/slices/messageSlice'; // ✅ Add message slice import
import { createHospital } from '../../../services/hospitalService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AddHospital = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false); // ✅ Fix: use 'loading' instead of 'spinning'
    const dispatch = useDispatch(); // ✅ Add Redux dispatch hook

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            // ✅ Get current date for time formatting
            const currentDate = new Date().toISOString().split('T')[0]; // "2025-07-23"

            // ✅ Transform data to match Swagger schema exactly
            const hospitalData = {
                code: values.code,
                name: values.name,
                address: values.address,
                image: values.image || "image1.img", // Default or from form
                googleMapUri: values.googleMapUri || "string",
                banner: values.banner || "string",
                type: parseInt(values.type) || 1,
                phoneNumber: values.phoneNumber,
                email: values.email,
                // ✅ Convert time to ISO datetime format
                openTime: values.openTime
                    ? `${currentDate}T${values.openTime.format('HH:mm:ss')}.000Z`
                    : `${currentDate}T08:00:00.000Z`,
                closeTime: values.closeTime
                    ? `${currentDate}T${values.closeTime.format('HH:mm:ss')}.000Z`
                    : `${currentDate}T18:00:00.000Z`
            };

            console.log('📤 Sending hospital data (Swagger format):', hospitalData);

            const response = await createHospital(hospitalData);

            if (response?.success || response?.result) {
                dispatch(setMessage({
                    type: 'success',
                    content: 'Hospital created successfully! 🎉',
                    duration: 4
                }));
                form.resetFields();
                onSuccess();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('❌ Error creating hospital:', error);

            let errorMessage = 'Failed to create hospital. Please try again.';

            // ✅ Handle specific error responses
            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.title) {
                    switch (errorData.title) {
                        case 'HOSPITAL_CODE_EXISTS':
                            errorMessage = 'Hospital code already exists. Please use a different code.';
                            break;
                        case 'HOSPITAL_NAME_EXISTS':
                            errorMessage = 'Hospital name already exists. Please use a different name.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = 'This email is already registered. Please use a different email.';
                            break;
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = 'This phone number is already registered. Please use a different phone number.';
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

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PlusOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    Add New Hospital
                </div>
            }
            open={visible} // ✅ Fix: use 'open' instead of 'visible' for newer Ant Design
            onCancel={onCancel}
            footer={null}
            width={900}
            destroyOnClose
        >
            <Spin spinning={loading}> {/* ✅ Fix: use 'loading' state */}
                <div className="hospital-form-container">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            type: 1, // Default to General Hospital
                            openTime: dayjs('08:00', 'HH:mm'),
                            closeTime: dayjs('18:00', 'HH:mm')
                        }}
                    >
                        {/* Basic Information */}
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="Hospital Name"
                                    rules={[{ required: true, message: 'Please enter hospital name' }]}
                                >
                                    <Input placeholder="City General Hospital" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="code"
                                    label="Hospital Code"
                                    rules={[{ required: true, message: 'Please enter hospital code' }]}
                                >
                                    <Input placeholder="CGH001" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Type and Contact */}
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="type"
                                    label="Hospital Type"
                                    rules={[{ required: true, message: 'Please select hospital type' }]}
                                >
                                    <Select placeholder="Select type">
                                        <Option value={1}>General Hospital</Option>
                                        <Option value={2}>Specialized Hospital</Option>
                                        <Option value={3}>Community Hospital</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Phone Number"
                                    rules={[{ required: true, message: 'Please enter phone number' }]}
                                >
                                    <Input placeholder="+84-123-456-789" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Please enter email' },
                                        { type: 'email', message: 'Please enter valid email' }
                                    ]}
                                >
                                    <Input placeholder="contact@hospital.com" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Address */}
                        <Form.Item
                            name="address"
                            label="Address"
                            rules={[{ required: true, message: 'Please enter address' }]}
                        >
                            <Input placeholder="123 Main Street, District 1, Ho Chi Minh City" />
                        </Form.Item>

                        {/* Operating Hours */}
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="openTime"
                                    label="Opening Time"
                                    rules={[{ required: true, message: 'Please select opening time' }]}
                                >
                                    <TimePicker
                                        style={{ width: '100%' }}
                                        format="HH:mm"
                                        placeholder="Select opening time"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="closeTime"
                                    label="Closing Time"
                                    rules={[{ required: true, message: 'Please select closing time' }]}
                                >
                                    <TimePicker
                                        style={{ width: '100%' }}
                                        format="HH:mm"
                                        placeholder="Select closing time"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Media URLs */}
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="image"
                                    label="Hospital Logo/Image URL"
                                >
                                    <Input placeholder="https://example.com/hospital-logo.png" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="banner"
                                    label="Banner Image URL"
                                >
                                    <Input placeholder="https://example.com/hospital-banner.png" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Google Maps */}
                        <Form.Item
                            name="googleMapUri"
                            label="Google Maps Embed URI"
                        >
                            <TextArea
                                rows={3}
                                placeholder="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
                            />
                        </Form.Item>

                        {/* Action Buttons */}
                        <Row justify="end" gutter={8}>
                            <Col>
                                <Button onClick={onCancel}>
                                    Cancel
                                </Button>
                            </Col>
                            <Col>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Create Hospital
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};

export default AddHospital;