import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    message,
    Spin,
    TimePicker
} from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    BankOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { updateHospital } from '../../../services/hospitalService';
import dayjs from 'dayjs';

const { Option } = Select;

const EditMyHospital = ({ visible, onCancel, onSuccess, hospital }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // ✅ Add states for provinces and wards
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // ✅ Mock data for provinces and wards (replace with actual API calls)
    const mockProvinces = [
        {
            province: "Hà Nội", wards: [
                { name: "Quận Ba Đình" },
                { name: "Quận Hoàn Kiếm" },
                { name: "Quận Hai Bà Trưng" },
                { name: "Quận Đống Đa" },
                { name: "Quận Tây Hồ" },
                { name: "Quận Cầu Giấy" },
                { name: "Quận Thanh Xuân" },
            ]
        },
        {
            province: "TP.Hồ Chí Minh", wards: [
                { name: "Quận 1" },
                { name: "Quận 2" },
                { name: "Quận 3" },
                { name: "Quận 4" },
                { name: "Quận 5" },
                { name: "Quận Bình Thạnh" },
                { name: "Quận Tân Bình" },
            ]
        },
        {
            province: "Đà Nẵng", wards: [
                { name: "Quận Hải Châu" },
                { name: "Quận Thanh Khê" },
                { name: "Quận Sơn Trà" },
                { name: "Quận Ngũ Hành Sơn" },
                { name: "Quận Liên Chiểu" },
            ]
        },
        {
            province: "Hải Phòng", wards: [
                { name: "Quận Hồng Bàng" },
                { name: "Quận Lê Chân" },
                { name: "Quận Ngô Quyền" },
                { name: "Quận Kiến An" },
            ]
        },
        {
            province: "Cần Thơ", wards: [
                { name: "Quận Ninh Kiều" },
                { name: "Quận Ô Môn" },
                { name: "Quận Bình Thuỷ" },
                { name: "Quận Cái Răng" },
            ]
        },
    ];

    // ✅ Load provinces when modal opens
    useEffect(() => {
        if (visible) {
            setLoadingProvinces(true);
            // Simulate API call
            setTimeout(() => {
                setProvinces(mockProvinces);
                setLoadingProvinces(false);
            }, 500);
        }
    }, [visible]);

    // ✅ Populate form with hospital data
    useEffect(() => {
        if (visible && hospital) {
            console.log('🏥 Setting hospital data:', hospital);

            // Set initial form values
            form.setFieldsValue({
                name: hospital.name,
                address: hospital.address,
                province: hospital.province || hospital.state,
                ward: hospital.ward || hospital.city,
                phoneNumber: hospital.phoneNumber,
                email: hospital.email,
                openTime: hospital.openTime ? dayjs(hospital.openTime) : null,
                closeTime: hospital.closeTime ? dayjs(hospital.closeTime) : null
            });

            // Set selected province and load wards
            if (hospital.province || hospital.state) {
                const provinceName = hospital.province || hospital.state;
                setSelectedProvince(provinceName);
                handleProvinceChange(provinceName, false); // Don't reset ward field
            }
        }
    }, [visible, hospital, form]);

    // ✅ Handle province change and load wards
    const handleProvinceChange = (provinceName, shouldResetWard = true) => {
        console.log('📍 Province changed:', provinceName);

        setSelectedProvince(provinceName);

        if (shouldResetWard) {
            form.setFieldValue('ward', undefined);
        }

        setLoadingWards(true);

        // Find province and get its wards
        const selectedProvinceData = mockProvinces.find(p => p.province === provinceName);

        setTimeout(() => {
            if (selectedProvinceData) {
                setWards(selectedProvinceData.wards);
                console.log(`🏘️ Loaded ${selectedProvinceData.wards.length} wards for ${provinceName}`);
            } else {
                setWards([]);
            }
            setLoadingWards(false);
        }, 300);
    };

    // ✅ Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            console.log('💾 Submitting hospital update...');

            const values = await form.validateFields();
            console.log('📋 Form values:', values);
            console.log('🕒 Open time:', values.openTime?.format('HH:mm'));
            console.log('🕒 Close time:', values.closeTime?.format('HH:mm'));

            // ✅ Build update payload - only include non-empty fields
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

            if (values.province) {
                updateData.province = values.province;
            }

            if (values.ward) {
                updateData.ward = values.ward;
            }

            if (values.phoneNumber && values.phoneNumber.trim()) {
                updateData.phoneNumber = values.phoneNumber.trim();
            }

            if (values.email && values.email.trim()) {
                updateData.email = values.email.trim();
            }

            // ✅ Only add time fields if they are provided
            if (values.openTime) {
                updateData.openTime = values.openTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            }

            if (values.closeTime) {
                updateData.closeTime = values.closeTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            }

            console.log('🔄 Final update payload:', updateData);
            console.log('📊 Fields to update:', Object.keys(updateData).filter(k => k !== 'id'));

            // ✅ Check if at least one field is being updated
            const fieldsToUpdate = Object.keys(updateData).filter(k => k !== 'id');
            if (fieldsToUpdate.length === 0) {
                message.warning('Vui lòng điền ít nhất một trường để cập nhật!');
                return;
            }

            console.log(`🚀 Updating ${fieldsToUpdate.length} fields:`, fieldsToUpdate);

            const response = await updateHospital(updateData);
            console.log('✅ Hospital updated successfully:', response);

            message.success('Cập nhật thông tin bệnh viện thành công!');
            onSuccess(response.result || updateData);

        } catch (error) {
            console.error('❌ Error updating hospital:', error);

            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại các trường bắt buộc!');
                console.log('📝 Form validation errors:', error.errorFields);
            } else {
                message.error('Cập nhật thông tin thất bại!');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle modal cancel
    const handleCancel = () => {
        console.log('❌ Canceling hospital edit');
        form.resetFields();
        setSelectedProvince(null);
        setWards([]);
        onCancel();
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
                    <BankOutlined style={{ marginRight: 8, fontSize: '18px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>
                        Chỉnh sửa thông tin bệnh viện
                    </span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            width={700}
            confirmLoading={loading}
            destroyOnClose
            okText="Lưu thay đổi"
            cancelText="Hủy"
            maskClosable={false}
            style={{ top: 50 }}
        >
            <Spin spinning={loading} tip="Đang cập nhật thông tin...">
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
                            placeholder="Nhập địa chỉ đầy đủ (số nhà, tên đường, phường/xã)"
                            style={{ fontSize: '14px' }}
                        />
                    </Form.Item>

                    {/* ✅ Province and Ward */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="province"
                                label={
                                    <span style={{ fontWeight: 600, color: '#262626' }}>
                                        🏛️ Tỉnh/Thành phố
                                    </span>
                                }
                                rules={[
                                    // No required validation - optional field
                                ]}
                            >
                                <Select
                                    placeholder="Chọn tỉnh/thành phố"
                                    loading={loadingProvinces}
                                    showSearch
                                    allowClear
                                    onChange={handleProvinceChange}
                                    filterOption={(input, option) =>
                                        (option?.children ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    style={{ fontSize: '14px' }}
                                >
                                    {provinces.map((province) => (
                                        <Option key={province.province} value={province.province}>
                                            📍 {province.province}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="ward"
                                label={
                                    <span style={{ fontWeight: 600, color: '#262626' }}>
                                        🏘️ Quận/Huyện
                                    </span>
                                }
                                rules={[
                                    // No required validation - optional field
                                ]}
                            >
                                <Select
                                    placeholder="Chọn quận/huyện"
                                    loading={loadingWards}
                                    showSearch
                                    allowClear
                                    disabled={!selectedProvince}
                                    filterOption={(input, option) =>
                                        (option?.children ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    style={{ fontSize: '14px' }}
                                    notFoundContent={
                                        !selectedProvince
                                            ? "Vui lòng chọn tỉnh/thành phố trước"
                                            : loadingWards
                                                ? "Đang tải..."
                                                : "Không tìm thấy quận/huyện"
                                    }
                                >
                                    {wards.map((ward) => (
                                        <Option key={ward.name} value={ward.name}>
                                            🏛️ {ward.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

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
                </Form>
            </Spin>
        </Modal>
    );
};

export default EditMyHospital;