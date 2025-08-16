import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Button, Spin, TimePicker, message } from 'antd';
import { PlusOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
import { createHospital } from '../../../services/hospitalService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AddHospital = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    
    // ✅ Redux hooks for message handling
    const dispatch = useDispatch();
    const messageState = useSelector(state => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    // ✅ Message handler using Redux pattern
    useEffect(() => {
        if (messageState && messageState.content) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    // ✅ Clear message when modal opens/closes
    useEffect(() => {
        if (visible) {
            dispatch(clearMessage());
            form.resetFields();
        } else {
            dispatch(clearMessage());
        }
    }, [visible, dispatch, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        dispatch(clearMessage());

        try {
            dispatch(setMessage({
                type: 'info',
                content: '⏳ Đang tạo bệnh viện mới...'
            }));

            // ✅ Get current date for time formatting
            const currentDate = new Date().toISOString().split('T')[0];

            // ✅ Transform data to match exact API schema
            const hospitalData = {
                code: values.code?.trim() || "",
                name: values.name?.trim() || "",
                address: values.address?.trim() || "",
                image: values.image?.trim() || "",
                googleMapUri: values.googleMapUri?.trim() || "",
                banner: values.banner?.trim() || "",
                type: parseInt(values.type) || 0,
                phoneNumber: values.phoneNumber?.trim() || "",
                email: values.email?.trim() || "",
                // ✅ Convert time to ISO datetime format matching API
                openTime: values.openTime
                    ? `${currentDate}T${values.openTime.format('HH:mm:ss')}.988Z`
                    : `2025-08-16T08:00:00.988Z`,
                closeTime: values.closeTime
                    ? `${currentDate}T${values.closeTime.format('HH:mm:ss')}.988Z`
                    : `2025-08-16T18:00:00.988Z`
            };

            console.log('📤 Dữ liệu bệnh viện gửi đi:', hospitalData);

            const response = await createHospital(hospitalData);
            console.log('📥 Phản hồi từ API:', response);

            // ✅ Enhanced success validation
            if (response?.success || response?.result || response?.id) {
                dispatch(setMessage({
                    type: 'success',
                    content: `🎉 Tạo bệnh viện "${hospitalData.name}" thành công!`
                }));

                form.resetFields();
                
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response);
                }

                setTimeout(() => {
                    handleCancel();
                }, 1500);
            } else {
                throw new Error('Phản hồi không hợp lệ từ server');
            }

        } catch (error) {
            console.error('❌ Lỗi khi tạo bệnh viện:', error);

            let errorMessage = 'Không thể tạo bệnh viện. Vui lòng thử lại.';

            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('🔍 Error response data:', errorData);

                if (errorData.title) {
                    switch (errorData.title) {
                        case 'HOSPITAL_CODE_EXISTS':
                            errorMessage = '🏥 Mã bệnh viện đã tồn tại! Vui lòng sử dụng mã khác.';
                            break;
                        case 'HOSPITAL_NAME_EXISTS':
                            errorMessage = '🏥 Tên bệnh viện đã tồn tại! Vui lòng sử dụng tên khác.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = '📧 Email này đã được đăng ký! Vui lòng sử dụng email khác.';
                            break;
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = '📱 Số điện thoại này đã được đăng ký! Vui lòng sử dụng số điện thoại khác.';
                            break;
                        default:
                            errorMessage = `❌ ${errorData.title.replace(/_/g, ' ')} - Vui lòng thử lại.`;
                            break;
                    }
                } else if (errorData.message) {
                    errorMessage = `❌ ${errorData.message}`;
                }
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }

            if (error.code === 'NETWORK_ERROR' || !error.response) {
                errorMessage = '🌐 Lỗi kết nối mạng! Vui lòng kiểm tra kết nối internet và thử lại.';
            }

            dispatch(setMessage({
                type: 'error',
                content: errorMessage
            }));

        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        dispatch(clearMessage());
        form.resetFields();
        
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <MedicineBoxOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        Thêm Bệnh viện mới
                    </div>
                }
                open={visible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                destroyOnClose
                maskClosable={false}
                style={{ top: 20 }}
            >
                <Spin spinning={loading} tip="Đang tạo bệnh viện...">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            type: 0,
                            openTime: dayjs('08:00', 'HH:mm'),
                            closeTime: dayjs('18:00', 'HH:mm')
                        }}
                        scrollToFirstError
                    >
                        {/* ✅ Thông tin bắt buộc */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#f0f7ff', 
                            borderRadius: '8px',
                            border: '1px solid #d6e4ff'
                        }}>
                            <h4 style={{ color: '#1890ff', marginBottom: 16 }}>🏥 Thông tin bệnh viện</h4>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="name"
                                        label="Tên bệnh viện"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên bệnh viện' },
                                            { min: 3, message: 'Tên bệnh viện phải có ít nhất 3 ký tự' },
                                            { max: 200, message: 'Tên bệnh viện không được vượt quá 200 ký tự' }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input 
                                            placeholder="Bệnh viện Đa khoa Thành phố" 
                                            showCount
                                            maxLength={200}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="code"
                                        label="Mã bệnh viện"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mã bệnh viện' },
                                            { min: 2, message: 'Mã bệnh viện phải có ít nhất 2 ký tự' },
                                            { max: 20, message: 'Mã bệnh viện không được vượt quá 20 ký tự' }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input 
                                            placeholder="BV001" 
                                            showCount
                                            maxLength={20}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="address"
                                label="Địa chỉ bệnh viện"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập địa chỉ' },
                                    { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự' },
                                    { max: 500, message: 'Địa chỉ không được vượt quá 500 ký tự' }
                                ]}
                                hasFeedback
                            >
                                <Input 
                                    placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" 
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="type"
                                        label="Loại hình"
                                        rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}
                                        hasFeedback
                                    >
                                        <Select placeholder="Chọn loại hình">
                                            <Option value={0}>🏥 Bệnh viện Tổng hợp</Option>
                                            <Option value={1}>🩺 Bệnh viện Chuyên khoa</Option>
                                            <Option value={2}>🏘️ Bệnh viện Cộng đồng</Option>
                                            <Option value={3}>🏢 Bệnh viện Tư nhân</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                                            { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' },
                                            { min: 10, message: 'Số điện thoại phải có ít nhất 10 ký tự' }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input placeholder="0123-456-789" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Vui lòng nhập email hợp lệ' },
                                            { max: 100, message: 'Email không được vượt quá 100 ký tự' }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input placeholder="lienhe@benhvien.com" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* ✅ Giờ hoạt động */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#f6ffed', 
                            borderRadius: '8px',
                            border: '1px solid #b7eb8f'
                        }}>
                            <h4 style={{ color: '#52c41a', marginBottom: 16 }}>⏰ Giờ hoạt động</h4>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="openTime"
                                        label="Giờ mở cửa"
                                        rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
                                        hasFeedback
                                    >
                                        <TimePicker
                                            style={{ width: '100%' }}
                                            format="HH:mm"
                                            placeholder="Chọn giờ mở cửa"
                                            showNow={false}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="closeTime"
                                        label="Giờ đóng cửa"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn giờ đóng cửa' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const openTime = getFieldValue('openTime');
                                                    if (!value || !openTime || value.isAfter(openTime)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Giờ đóng cửa phải sau giờ mở cửa!'));
                                                },
                                            }),
                                        ]}
                                        hasFeedback
                                    >
                                        <TimePicker
                                            style={{ width: '100%' }}
                                            format="HH:mm"
                                            placeholder="Chọn giờ đóng cửa"
                                            showNow={false}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* ✅ Hình ảnh và liên kết (Tùy chọn) */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#fff7e6', 
                            borderRadius: '8px',
                            border: '1px solid #ffd591'
                        }}>
                            <h4 style={{ color: '#faad14', marginBottom: 16 }}>🖼️ Hình ảnh (Tùy chọn)</h4>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="image"
                                        label="URL Logo/Hình ảnh"
                                        rules={[
                                            { type: 'url', message: 'Vui lòng nhập URL hợp lệ' }
                                        ]}
                                    >
                                        <Input placeholder="https://example.com/logo.png" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="banner"
                                        label="URL Banner"
                                        rules={[
                                            { type: 'url', message: 'Vui lòng nhập URL hợp lệ' }
                                        ]}
                                    >
                                        <Input placeholder="https://example.com/banner.png" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="googleMapUri"
                                label="Liên kết Google Maps"
                                rules={[
                                    { type: 'url', message: 'Vui lòng nhập URL hợp lệ' }
                                ]}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    showCount
                                    maxLength={1000}
                                />
                            </Form.Item>
                        </div>

                        {/* ✅ Lưu ý ngắn gọn */}
                        <div style={{
                            marginBottom: 24,
                            padding: '12px 16px',
                            background: '#f6ffed',
                            borderRadius: '6px',
                            border: '1px solid #b7eb8f',
                            fontSize: '13px'
                        }}>
                            <div style={{ color: '#389e0d', fontWeight: 500, marginBottom: 4 }}>
                                💡 Lưu ý:
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4' }}>
                                • <strong>Mã bệnh viện</strong> và <strong>Email</strong> phải là duy nhất<br />
                                • <strong>Hình ảnh</strong> có thể bổ sung sau khi tạo bệnh viện
                            </div>
                        </div>

                        {/* ✅ Nút hành động */}
                        <Row justify="end" gutter={8}>
                            <Col>
                                <Button onClick={handleCancel} disabled={loading}>
                                    Hủy
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    icon={<PlusOutlined />}
                                    size="large"
                                    style={{
                                        backgroundColor: '#1890ff',
                                        borderColor: '#1890ff'
                                    }}
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo Bệnh viện'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default AddHospital;