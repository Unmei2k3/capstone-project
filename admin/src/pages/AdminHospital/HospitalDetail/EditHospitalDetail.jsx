import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Row,
    Col,
    Spin,
    TimePicker,
    message
} from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    BankOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { updateHospital, getHospitalById } from '../../../services/hospitalService';
import dayjs from 'dayjs';

const EditMyHospital = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingHospital, setLoadingHospital] = useState(false);

    // ✅ Message API hook và Redux state
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);
    const user = useSelector((state) => state.user?.user);

    // ✅ Hospital data state
    const [hospital, setHospital] = useState(null);
    const hospitalId = user?.hospitals?.[0]?.id;

    // ✅ Effect để hiển thị message từ Redux state
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
        }
    }, [messageState, messageApi]);

    // ✅ Load data when modal opens
    useEffect(() => {
        if (visible && hospitalId) {
            fetchHospitalData();
        }
    }, [visible, hospitalId]);

    // ✅ Effect to populate form when data is ready
    useEffect(() => {
        console.log('🔍 Checking populate conditions:', {
            hospital: hospital ? 'Available' : 'Not available',
            hospitalId: hospital?.id,
            visible
        });

        if (visible && hospital) {
            console.log('✅ All conditions met, populating form...');
            populateForm();
        }
    }, [visible, hospital]);

    // ✅ Fetch hospital data from API
    const fetchHospitalData = async () => {
        if (!hospitalId) {
            messageApi.error('Không tìm thấy ID bệnh viện!');
            return;
        }

        setLoadingHospital(true);
        try {
            console.log('🏥 Fetching hospital data for ID:', hospitalId);



            const response = await getHospitalById(hospitalId);
            console.log('📡 Full Hospital API response:', response);

            // ✅ Extract hospital data from API response based on your structure
            let hospitalData = null;
            if (response.result) {
                hospitalData = response.result;
            } else if (response.data) {
                hospitalData = response.data;
            } else {
                hospitalData = response;
            }

            console.log('🏥 Extracted hospital data:', hospitalData);

            if (!hospitalData || !hospitalData.id) {
                throw new Error('Invalid hospital data received');
            }

            setHospital(hospitalData);


        } catch (error) {
            console.error('❌ Error fetching hospital data:', error);

            messageApi.error('Không thể tải thông tin bệnh viện. Vui lòng thử lại.');

            // ✅ Show detailed error if available
            if (error.response?.data?.message) {
                setTimeout(() => {
                    messageApi.warning(`Chi tiết lỗi: ${error.response.data.message}`);
                }, 2000);
            }
        } finally {
            setLoadingHospital(false);
        }
    };

    // ✅ Simplified populate form function (removed province/ward logic)
    const populateForm = () => {
        console.log('🏥 Starting form population with hospital data:', hospital);



        try {
            // ✅ Prepare form data with robust parsing (removed province/ward)
            const formData = {
                name: hospital.name || "",
                address: hospital.address || "",
                phoneNumber: hospital.phoneNumber || "",
                email: hospital.email || "",
                openTime: null,
                closeTime: null
            };

            // ✅ Handle time fields - Parse ISO datetime to time only
            if (hospital.openTime) {
                try {
                    console.log('🕐 Raw openTime:', hospital.openTime);
                    // Parse ISO datetime and extract time
                    const openDateTime = dayjs(hospital.openTime);
                    formData.openTime = openDateTime.isValid() ? openDateTime : null;
                    console.log('✅ Parsed openTime:', formData.openTime?.format('HH:mm'));
                } catch (error) {
                    console.warn('⚠️ Could not parse openTime:', hospital.openTime, error);
                }
            }

            if (hospital.closeTime) {
                try {
                    console.log('🕕 Raw closeTime:', hospital.closeTime);
                    // Parse ISO datetime and extract time
                    const closeDateTime = dayjs(hospital.closeTime);
                    formData.closeTime = closeDateTime.isValid() ? closeDateTime : null;
                    console.log('✅ Parsed closeTime:', formData.closeTime?.format('HH:mm'));
                } catch (error) {
                    console.warn('⚠️ Could not parse closeTime:', hospital.closeTime, error);
                }
            }

            console.log('📋 Final form data to set:', formData);

            // ✅ Set form values
            form.setFieldsValue(formData);




        } catch (error) {
            console.error('❌ Error populating form:', error);
            messageApi.error('Có lỗi khi điền thông tin vào form');
        }
    };

    // ✅ Handle form submission với messageApi (removed province/ward logic)
    const handleSubmit = async () => {
        if (!hospital) {
            messageApi.error('Không có thông tin bệnh viện để cập nhật!');
            return;
        }

        try {
            setLoading(true);
            console.log('💾 Submitting hospital update...');

            // ✅ Show loading message
            const loadingMessage = messageApi.loading('Đang xử lý cập nhật thông tin bệnh viện...', 0);

            const values = await form.validateFields();
            console.log('📋 Form values:', values);

            // ✅ Build update payload - only include non-empty fields (removed province/ward)
            const updateData = {
                id: hospital.id
            };

            // Only add fields that have values (not empty/null/undefined)
            if (values.name && values.name.trim()) {
                updateData.name = values.name.trim();
            }

            if (values.address && values.address.trim()) {
                updateData.address = values.address.trim();
            }

            if (values.phoneNumber && values.phoneNumber.trim()) {
                updateData.phoneNumber = values.phoneNumber.trim();
            }

            if (values.email && values.email.trim()) {
                updateData.email = values.email.trim();
            }

            // ✅ Handle time fields properly - convert to ISO datetime format
            if (values.openTime && dayjs.isDayjs(values.openTime)) {
                // Create a datetime with today's date and the selected time
                const today = dayjs().format('YYYY-MM-DD');
                const timeStr = values.openTime.format('HH:mm:ss');
                updateData.openTime = `${today}T${timeStr}`;
            }

            if (values.closeTime && dayjs.isDayjs(values.closeTime)) {
                // Create a datetime with today's date and the selected time
                const today = dayjs().format('YYYY-MM-DD');
                const timeStr = values.closeTime.format('HH:mm:ss');
                updateData.closeTime = `${today}T${timeStr}`;
            }

            console.log('🔄 Final update payload:', updateData);

            // ✅ Check if at least one field is being updated
            const fieldsToUpdate = Object.keys(updateData).filter(k => k !== 'id');
            if (fieldsToUpdate.length === 0) {
                loadingMessage(); // Destroy loading message
                messageApi.warning('Vui lòng điền ít nhất một trường để cập nhật!');
                return;
            }

            console.log(`🚀 Updating ${fieldsToUpdate.length} fields:`, fieldsToUpdate);

            // ✅ Show fields being updated
            messageApi.info(`Đang cập nhật ${fieldsToUpdate.length} trường: ${fieldsToUpdate.join(', ')}`);

            const response = await updateHospital(updateData);
            console.log('✅ Hospital updated successfully:', response);

            // ✅ Destroy loading and show success
            loadingMessage();
            messageApi.success(`✅ Cập nhật thông tin bệnh viện thành công! Đã cập nhật ${fieldsToUpdate.length} trường.`);

            // ✅ Show updated fields detail
            setTimeout(() => {
                messageApi.info(`📋 Các trường đã cập nhật: ${fieldsToUpdate.join(', ')}`);
            }, 2000);

            // ✅ Update local hospital state with new data
            const updatedHospital = { ...hospital, ...updateData };
            setHospital(updatedHospital);

            onSuccess(response.result || updatedHospital);

        } catch (error) {
            console.error('❌ Error updating hospital:', error);

            if (error.errorFields) {
                // ✅ Form validation errors
                messageApi.error('❌ Vui lòng kiểm tra lại các trường bắt buộc!');

                console.log('📝 Form validation errors:', error.errorFields);

                // ✅ Show specific validation errors
                const errorMessages = error.errorFields.map(field =>
                    `${field.name.join('.')}: ${field.errors.join(', ')}`
                ).join('; ');

                setTimeout(() => {
                    messageApi.warning(`📝 Lỗi validation: ${errorMessages}`);
                }, 1000);

            } else {
                // ✅ API or network errors
                const errorMessage = error.response?.data?.message || error.message || 'Cập nhật thông tin thất bại!';

                messageApi.error(`❌ ${errorMessage}`);

                // ✅ Show additional error details if available
                if (error.response?.status) {
                    setTimeout(() => {
                        messageApi.warning(`🔍 Mã lỗi: ${error.response.status} - ${error.response.statusText}`);
                    }, 2000);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle modal cancel với message
    const handleCancel = () => {
        console.log('❌ Canceling hospital edit');



        // ✅ Reset form and states (simplified - removed province/ward states)
        form.resetFields();
        setHospital(null);

        onCancel();
    };



    // ✅ Manual refresh for debugging
    const handleManualRefresh = () => {
        messageApi.info('Đang làm mới dữ liệu...');
        if (hospital) {
            populateForm();
        } else {
            fetchHospitalData();
        }
    };

    // ✅ Simplified debug info (removed province/ward info)
    const renderDebugInfo = () => {
        if (process.env.NODE_ENV !== 'development') return null;

        return (
            <div style={{
                background: "#f0f0f0",
                padding: 12,
                borderRadius: 6,
                fontSize: '12px',
                marginTop: 16
            }}>
                <strong>🔍 Debug Info:</strong><br />
                Hospital ID: {hospitalId}<br />
                Hospital loaded: {hospital ? "Yes" : "No"}<br />
                {hospital && (
                    <>
                        Hospital Name: {hospital.name}<br />
                        Hospital Phone: {hospital.phoneNumber || "None"}<br />
                        Hospital Email: {hospital.email || "None"}<br />
                        Hospital OpenTime (raw): {hospital.openTime || "None"}<br />
                        Hospital CloseTime (raw): {hospital.closeTime || "None"}<br />
                        Hospital OpenTime (parsed): {hospital.openTime ? dayjs(hospital.openTime).format('HH:mm') : "None"}<br />
                        Hospital CloseTime (parsed): {hospital.closeTime ? dayjs(hospital.closeTime).format('HH:mm') : "None"}<br />
                    </>
                )}
                User ID: {user?.id}<br />
                Loading hospital: {loadingHospital ? "Yes" : "No"}<br />
                Current form values: <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
            </div>
        );
    };

    return (
        <>
            {contextHolder} {/* ✅ Context holder for message */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
                        <BankOutlined style={{ marginRight: 8, fontSize: '18px' }} />
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>
                            Chỉnh sửa thông tin bệnh viện
                        </span>
                        {/* ✅ Debug refresh button */}
                        {process.env.NODE_ENV === 'development' && (
                            <Button
                                size="small"
                                style={{ marginLeft: 'auto' }}
                                onClick={handleManualRefresh}
                                type="text"
                            >
                                🔄 Refresh
                            </Button>
                        )}
                    </div>
                }
                open={visible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                width={600} // ✅ Reduced width since we removed province/ward columns
                confirmLoading={loading}
                destroyOnClose={true} // ✅ Destroy form when modal closes
                okText="Lưu thay đổi"
                cancelText="Hủy"
                maskClosable={false}
                style={{ top: 50 }}
                afterClose={() => {
                    // ✅ Clean up after modal closes (simplified)
                    form.resetFields();
                    setHospital(null);
                }}
            >
                <Spin
                    spinning={loading || loadingHospital}

                >
                    {/* ✅ Show loading state or form */}
                    {loadingHospital ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#666'
                        }}>

                            <p style={{ fontSize: '12px', marginTop: '8px' }}>
                                Hospital ID: {hospitalId}
                            </p>
                        </div>
                    ) : !hospital ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#ff4d4f'
                        }}>
                            <p>❌ Không thể tải thông tin bệnh viện</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                                Vui lòng đóng modal và thử lại
                            </p>
                            <Button onClick={handleManualRefresh}>
                                Thử lại
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                padding: '20px 0',
                                background: '#fafafa',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    ℹ️ Chỉnh sửa tùy chọn - Chỉ cập nhật những trường bạn muốn thay đổi
                                </p>
                                <p style={{
                                    margin: '8px 0 0 0',
                                    color: '#1890ff',
                                    fontSize: '12px',
                                    fontWeight: 500
                                }}>
                                    🏥 {hospital.name} (ID: {hospital.id})
                                </p>
                            </div>

                            <Form
                                form={form}
                                layout="vertical"
                                preserve={false}

                                style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}
                            >
                                {/* ✅ Hospital Name */}
                                <Form.Item
                                    name="name"
                                    label={
                                        <span style={{ fontWeight: 600, color: '#262626' }}>
                                            🏥 Tên bệnh viện
                                        </span>
                                    }
                                    rules={[
                                        { min: 5, message: 'Tên bệnh viện phải có ít nhất 5 ký tự' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập tên bệnh viện"
                                        style={{ fontSize: '14px' }}
                                        onChange={(e) => {
                                            if (e.target.value.trim()) {
                                                messageApi.info(`🏥 Tên bệnh viện: ${e.target.value.trim()}`, 1);
                                            }
                                        }}
                                    />
                                </Form.Item>

                                {/* ✅ Address */}
                                <Form.Item
                                    name="address"
                                    label={
                                        <span style={{ fontWeight: 600, color: '#262626' }}>
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                                            Địa chỉ chi tiết
                                        </span>
                                    }
                                    rules={[
                                        { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập địa chỉ đầy đủ"
                                        style={{ fontSize: '14px' }}
                                    />
                                </Form.Item>

                                {/* ✅ Contact Information */}
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="phoneNumber"
                                            label={
                                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                                    <PhoneOutlined style={{ marginRight: 4 }} />
                                                    Số điện thoại
                                                </span>
                                            }
                                            rules={[
                                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Nhập số điện thoại (10-11 chữ số)"
                                                style={{ fontSize: '14px' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            name="email"
                                            label={
                                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                                    <MailOutlined style={{ marginRight: 4 }} />
                                                    Email
                                                </span>
                                            }
                                            rules={[
                                                { type: 'email', message: 'Email không hợp lệ' }
                                            ]}
                                        >
                                            <Input
                                                placeholder="Nhập địa chỉ email"
                                                style={{ fontSize: '14px' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* ✅ Operating Hours */}
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="openTime"
                                            label={
                                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                    Giờ mở cửa
                                                </span>
                                            }
                                        >
                                            <TimePicker
                                                placeholder="Chọn giờ mở cửa"
                                                style={{ width: '100%', fontSize: '14px' }}
                                                format="HH:mm"
                                                allowClear
                                                onChange={(time) => {
                                                    if (time) {
                                                        messageApi.success(`🕐 Giờ mở cửa: ${time.format('HH:mm')}`, 2);
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            name="closeTime"
                                            label={
                                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                    Giờ đóng cửa
                                                </span>
                                            }
                                            dependencies={['openTime']}
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        const openTime = getFieldValue('openTime');
                                                        if (!value || !openTime) {
                                                            return Promise.resolve();
                                                        }
                                                        if (value.isAfter(openTime)) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Giờ đóng cửa phải sau giờ mở cửa!'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <TimePicker
                                                placeholder="Chọn giờ đóng cửa"
                                                style={{ width: '100%', fontSize: '14px' }}
                                                format="HH:mm"
                                                allowClear
                                                onChange={(time) => {
                                                    if (time) {
                                                        messageApi.success(`🕕 Giờ đóng cửa: ${time.format('HH:mm')}`, 2);
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* ✅ Info notice */}
                                <div style={{
                                    background: '#e6f7ff',
                                    border: '1px solid #91d5ff',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    marginTop: '16px'
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#0050b3'
                                    }}>
                                        💡 <strong>Lưu ý:</strong> Tất cả các trường đều tùy chọn.
                                        Chỉ những trường được điền/thay đổi sẽ được cập nhật, các trường trống sẽ giữ nguyên giá trị cũ.
                                    </p>
                                </div>

                                {/* ✅ Simplified debug info */}
                                {renderDebugInfo()}
                            </Form>
                        </>
                    )}
                </Spin>
            </Modal>
        </>
    );
};

export default EditMyHospital;