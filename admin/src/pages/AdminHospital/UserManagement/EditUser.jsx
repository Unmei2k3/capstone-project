import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker, ConfigProvider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import { getUserById, updateUser } from '../../../services/userService';
import { getProvinces } from '../../../services/provinceService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';

// ✅ Set dayjs locale to Vietnamese
dayjs.locale('vi');

const { Option } = Select;

const EditUser = ({ visible, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const dispatch = useDispatch();

    // ✅ Roles data matching API
    const roles = [
        { id: 1, name: 'Default User', roleType: 1 },
        { id: 2, name: 'Doctor', roleType: 2 },
        { id: 3, name: 'Hospital Admin', roleType: 4 },
        { id: 4, name: 'System Admin', roleType: 5 },
        { id: 5, name: 'Patient', roleType: 6 },
        { id: 6, name: 'Nurse', roleType: 7 }
    ];

    // ✅ Enhanced error message mapping
    const getErrorMessage = (title) => {
        const errorMessages = {
            'PHONE_ALREADY_EXISTS': '❌ Số điện thoại đã được sử dụng bởi người dùng khác. Vui lòng nhập số khác.',
            'EMAIL_ALREADY_EXISTS': '❌ Email đã được sử dụng bởi người dùng khác. Vui lòng nhập email khác.',
            'CCCD_ALREADY_EXISTS': '❌ Số CCCD đã được sử dụng bởi người dùng khác. Vui lòng nhập số khác.',
            'VALIDATION_ERROR': '❌ Thông tin không hợp lệ. Vui lòng kiểm tra lại các trường.',
            'PERMISSION_DENIED': '❌ Bạn không có quyền thực hiện thao tác này.',
            'INVALID_USER': '❌ Người dùng không tồn tại hoặc đã bị xóa.',
            'INVALID_PHONE_FORMAT': '❌ Định dạng số điện thoại không hợp lệ.',
            'INVALID_EMAIL_FORMAT': '❌ Định dạng email không hợp lệ.',
            'INVALID_CCCD_FORMAT': '❌ Định dạng số CCCD không hợp lệ.',
            'WEAK_PASSWORD': '❌ Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.',
            'SERVER_ERROR': '❌ Lỗi máy chủ. Vui lòng thử lại sau.',
            'NETWORK_ERROR': '❌ Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.'
        };

        return errorMessages[title] || `❌ ${title}. Vui lòng thử lại.`;
    };

    useEffect(() => {
        if (visible && record?.id) {
            fetchUserDetails(record.id);
            fetchProvinces();
        }
    }, [visible, record]);

    useEffect(() => {
        if (selectedProvince && provinces.length > 0) {
            const provinceObj = provinces.find((p) => p.province === selectedProvince);
            const wardsList = provinceObj?.wards || [];
            setWards(wardsList);
        } else {
            setWards([]);
        }
    }, [selectedProvince, provinces]);

    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            console.log('🔄 Đang tải danh sách tỉnh thành...');
            
            const provincesData = await getProvinces();
            console.log('🌏 Đã tải tỉnh thành:', provincesData);
            
            setProvinces(provincesData.data || []);
            
            dispatch(setMessage({
                type: 'success',
                content: `✅ Đã tải ${provincesData.data?.length || 0} tỉnh thành`
            }));

        } catch (error) {
            console.error('❌ Lỗi khi tải tỉnh thành:', error);
            dispatch(setMessage({
                type: 'error',
                content: '❌ Không thể tải danh sách tỉnh thành. Vui lòng thử lại.'
            }));
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
            console.log('🔄 Đang tải thông tin người dùng ID:', userId);
            
            const userData = await getUserById(userId);
            console.log('👤 Dữ liệu người dùng:', userData);
            
            if (userData) {
                setUserDetails(userData);

                // ✅ Set selected province for ward loading
                if (userData.province) {
                    setSelectedProvince(userData.province);
                }

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

                dispatch(setMessage({
                    type: 'success',
                    content: '✅ Đã tải thông tin người dùng'
                }));
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải thông tin người dùng:", error);
            dispatch(setMessage({
                type: 'error',
                content: '❌ Không thể tải thông tin người dùng. Vui lòng thử lại.'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleFormValuesChange = (changedValues) => {
        if ("province" in changedValues) {
            const newProvince = changedValues.province || null;
            setSelectedProvince(newProvince);
            form.setFieldsValue({ ward: undefined });
            console.log('🔄 Tỉnh thành đã thay đổi thành:', newProvince);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            console.log('📤 Cập nhật người dùng với ID:', record.id);
            console.log('📝 Dữ liệu form:', values);

            dispatch(setMessage({
                type: 'loading',
                content: 'Đang cập nhật thông tin người dùng...'
            }));

            const selectedRole = roles.find(role => role.id === values.roleId);
            console.log('👥 Role được chọn:', selectedRole);

            // ✅ Transform data to match API schema
            const updateData = {
                fullname: values.fullname?.trim() || '',
                phoneNumber: values.phoneNumber?.trim() || '',
                email: values.email?.trim() || '',
                avatarUrl: userDetails?.avatarUrl || '',
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : '2025-08-15',
                gender: values.gender === 'male',
                job: values.job?.trim() || '',
                cccd: values.cccd?.trim() || '',
                province: values.province?.trim() || '',
                ward: values.ward?.trim() || '',
                streetAddress: values.streetAddress?.trim() || ''
            };

            // ✅ Add password if provided
            if (values.password && values.password.trim()) {
                updateData.password = values.password.trim();
            }

            console.log('📤 Dữ liệu cập nhật:', updateData);

            const response = await updateUser(record.id, updateData);
            console.log('📥 Phản hồi cập nhật:', response);

            // ✅ Enhanced success checking
            const isSuccess = (
                response === true ||
                response?.success === true ||
                (response?.status >= 200 && response?.status < 300) ||
                response?.result ||
                response?.data ||
                response?.id ||
                (response && !response.error && response.success !== false)
            );

            if (isSuccess) {
                console.log('✅ Cập nhật người dùng thành công');
                
                dispatch(setMessage({
                    type: 'success',
                    content: '🎉 Cập nhật người dùng thành công!'
                }));
                
                onSuccess();
            } else {
                // ✅ Handle API error responses
                const errorTitle = response?.title || response?.message || 'UPDATE_FAILED';
                console.error('❌ Cập nhật thất bại:', errorTitle);
                
                dispatch(setMessage({
                    type: 'error',
                    content: getErrorMessage(errorTitle)
                }));
            }

        } catch (error) {
            console.error('❌ Lỗi khi cập nhật người dùng:', error);

            let errorTitle = 'UNKNOWN_ERROR';

            // ✅ Enhanced error handling - prioritize title from response
            if (error.response?.data) {
                const responseData = error.response.data;
                console.log('📋 Error response data:', responseData);
                
                if (responseData.title) {
                    errorTitle = responseData.title;
                } else if (responseData.message) {
                    errorTitle = responseData.message;
                } else if (typeof responseData === 'string') {
                    errorTitle = responseData;
                } else if (responseData.errors) {
                    const validationErrors = Object.values(responseData.errors).flat();
                    errorTitle = 'VALIDATION_ERROR';
                    console.log('❌ Lỗi validation:', validationErrors.join(', '));
                }
            } else if (error.message) {
                errorTitle = error.message;
            }

            dispatch(setMessage({
                type: 'error',
                content: getErrorMessage(errorTitle)
            }));

        } finally {
            setLoading(false);
        }
    };

    if (!userDetails && !loading) {
        return null;
    }

    return (
        <ConfigProvider locale={locale}>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        Chỉnh sửa người dùng: {userDetails?.fullname || record?.fullname || 'Đang tải...'}
                    </div>
                }
                open={visible}
                onCancel={onCancel}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
                maskClosable={false}
            >
                <Spin spinning={loading} tip="Đang xử lý...">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        onValuesChange={handleFormValuesChange}
                        preserve={false}
                    >
                        {/* Account Information */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#f0f7ff', 
                            borderRadius: '8px',
                            border: '1px solid #d6e4ff'
                        }}>
                            <h4 style={{ color: '#1890ff', marginBottom: 16 }}>📧 Thông tin tài khoản</h4>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập địa chỉ email" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="roleId"
                                        label="Vai trò"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                                    >
                                        <Select placeholder="Chọn vai trò người dùng">
                                            {roles.map(role => (
                                                <Option key={role.id} value={role.id}>
                                                    {role.name} (Type: {role.roleType})
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
                                        label="Mật khẩu mới (Tùy chọn)"
                                        rules={[
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                        ]}
                                    >
                                        <Input.Password placeholder="Để trống để giữ mật khẩu hiện tại" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu"
                                        dependencies={['password']}
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!getFieldValue('password') || !value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="active"
                                label="Trạng thái tài khoản"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái tài khoản">
                                    <Option value={true}>✅ Hoạt động</Option>
                                    <Option value={false}>❌ Không hoạt động</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Personal Information */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#f6ffed', 
                            borderRadius: '8px',
                            border: '1px solid #b7eb8f'
                        }}>
                            <h4 style={{ color: '#52c41a', marginBottom: 16 }}>👤 Thông tin cá nhân</h4>

                            <Form.Item
                                name="fullname"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên đầy đủ" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            {
                                                pattern: /^[0-9]{10,11}$/,
                                                message: 'Số điện thoại phải có 10-11 chữ số'
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Nhập số điện thoại" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                                    >
                                        <Select placeholder="Chọn giới tính">
                                            <Option value="male">👨 Nam</Option>
                                            <Option value="female">👩 Nữ</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="dob" label="Ngày sinh">
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            placeholder="Chọn ngày sinh"
                                            format="DD/MM/YYYY"
                                            locale={locale.DatePicker}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="job" label="Nghề nghiệp">
                                        <Input placeholder="Nhập nghề nghiệp" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="cccd"
                                        label="CCCD/CMND"
                                        rules={[
                                            {
                                                pattern: /^[0-9]{9,12}$/,
                                                message: 'CCCD phải có 9-12 chữ số'
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Nhập số CCCD/CMND" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Address Information */}
                        <div style={{ 
                            marginBottom: 24, 
                            padding: '16px', 
                            background: '#fff7e6', 
                            borderRadius: '8px',
                            border: '1px solid #ffd591'
                        }}>
                            <h4 style={{ color: '#faad14', marginBottom: 16 }}>📍 Thông tin địa chỉ</h4>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="province" label="Tỉnh/Thành phố">
                                        <Select
                                            placeholder="Chọn tỉnh/thành phố"
                                            showSearch
                                            loading={loadingProvinces}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={provinces.map((p) => ({
                                                label: p.province,
                                                value: p.province,
                                            }))}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="ward" label="Quận/Huyện">
                                        <Select
                                            placeholder={selectedProvince ? "Chọn quận/huyện" : "Chọn tỉnh/thành phố trước"}
                                            showSearch
                                            disabled={!selectedProvince}
                                            options={wards.map((w) => ({
                                                label: w.name,
                                                value: w.name
                                            }))}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                            }
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="streetAddress" label="Địa chỉ cụ thể">
                                        <Input placeholder="Nhập địa chỉ cụ thể" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div style={{ marginTop: 12, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: '12px' }}>
                                <strong>📊 Thông tin hiện tại:</strong><br />
                                User ID: {record?.id}<br />
                                Tỉnh thành có sẵn: {provinces.length}<br />
                                Quận/huyện cho tỉnh được chọn: {wards.length}<br />
                                Province API: getProvinces() service
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <Row justify="end" gutter={8} style={{ marginTop: 24 }}>
                            <Col>
                                <Button onClick={onCancel} size="large" disabled={loading}>
                                    Hủy
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading} 
                                    icon={<EditOutlined />}
                                    size="large"
                                    style={{
                                        backgroundColor: '#1890ff',
                                        borderColor: '#1890ff'
                                    }}
                                >
                                    Cập nhật người dùng
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </ConfigProvider>
    );
};

export default EditUser;