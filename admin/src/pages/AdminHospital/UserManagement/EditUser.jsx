import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker, ConfigProvider, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
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
    
    // ✅ Redux hooks for message handling
    const dispatch = useDispatch();
    const messageState = useSelector(state => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    // ✅ NEW: State for tracking current user role
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [isPatientRole, setIsPatientRole] = useState(false);

    // ✅ Updated roles data matching your system
    const roles = [
        { id: 1, name: 'Người dùng', roleType: 1 },
        
        { id: 4, name: 'Quản trị viên Bệnh viện', roleType: 4 },
        
        { id: 6, name: 'Bệnh nhân', roleType: 6 },
        { id: 7, name: 'Y tá', roleType: 7 }
    ];

    // ✅ Handle role change to check if Patient is selected
    const handleRoleChange = (roleId) => {
        console.log('🎭 Role changed to:', roleId);
        const role = roles.find(r => r.id === roleId);
        setCurrentUserRole(role);
        
        // ✅ Check if selected role is Patient (roleType: 6)
        const isPatient = role?.roleType === 6;
        setIsPatientRole(isPatient);
        
        console.log('🔍 Is Patient Role:', isPatient);
    };

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

    // ✅ Enhanced error message mapping
    const getErrorMessage = (title) => {
        const errorMessages = {
            'PHONE_ALREADY_EXISTS': '📱 Số điện thoại đã được sử dụng bởi người dùng khác. Vui lòng nhập số khác.',
            'EMAIL_ALREADY_EXISTS': '📧 Email đã được sử dụng bởi người dùng khác. Vui lòng nhập email khác.',
            'CCCD_ALREADY_EXISTS': '🆔 Số CCCD đã được sử dụng bởi người dùng khác. Vui lòng nhập số khác.',
            'VALIDATION_ERROR': '⚠️ Thông tin không hợp lệ. Vui lòng kiểm tra lại các trường.',
            'PERMISSION_DENIED': '🔒 Bạn không có quyền thực hiện thao tác này.',
            'INVALID_USER': '❌ Người dùng không tồn tại hoặc đã bị xóa.',
            'INVALID_PHONE_FORMAT': '📱 Định dạng số điện thoại không hợp lệ.',
            'INVALID_EMAIL_FORMAT': '📧 Định dạng email không hợp lệ.',
            'INVALID_CCCD_FORMAT': '🆔 Định dạng số CCCD không hợp lệ.',
            'WEAK_PASSWORD': '🔒 Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.',
            'SERVER_ERROR': '🔥 Lỗi máy chủ. Vui lòng thử lại sau.',
            'NETWORK_ERROR': '🌐 Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.'
        };

        return errorMessages[title] || `❌ ${title}. Vui lòng thử lại.`;
    };

    // ✅ Enhanced useEffect to fetch data when modal opens
    useEffect(() => {
        if (visible && record?.id) {
            console.log('👀 Modal opened for user ID:', record.id);
            dispatch(clearMessage());
            fetchUserDetails(record.id);
            fetchProvinces();
        } else if (!visible) {
            // ✅ Reset state when modal closes
            console.log('👁️ Modal closed - resetting state');
            setUserDetails(null);
            setCurrentUserRole(null);
            setIsPatientRole(false);
            setSelectedProvince(null);
            setWards([]);
            dispatch(clearMessage());
        }
    }, [visible, record, dispatch]);

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
            
            const processedProvinces = provincesData?.data || [];
            setProvinces(processedProvinces);
            
            if (processedProvinces.length > 0) {
                dispatch(setMessage({
                    type: 'success',
                    content: `✅ Đã tải ${processedProvinces.length} tỉnh thành`
                }));
            } else {
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy dữ liệu tỉnh thành'
                }));
            }

        } catch (error) {
            console.error('❌ Lỗi khi tải tỉnh thành:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách tỉnh/thành phố'
            }));
            setProvinces([]);
        } finally {
            setLoadingProvinces(false);
        }
    };

    // ✅ Enhanced fetchUserDetails with proper role mapping
    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
            console.log('🔄 Đang tải thông tin người dùng ID:', userId);
            
            const userData = await getUserById(userId);
            console.log('👤 Dữ liệu người dùng từ API:', userData);
            
            if (userData) {
                setUserDetails(userData);

                // ✅ NEW: Map current user role properly
                let mappedRoleId = roles[0].id; // Default role
                
                if (userData.role) {
                    console.log('🎭 Role từ API:', userData.role);
                    
                    // ✅ First try to find by roleType (more reliable)
                    const roleByType = roles.find(r => r.roleType === userData.role.roleType);
                    if (roleByType) {
                        mappedRoleId = roleByType.id;
                        console.log('✅ Mapped role by roleType:', roleByType);
                    } else {
                        // ✅ Fallback: try to find by id
                        const roleById = roles.find(r => r.id === userData.role.id);
                        if (roleById) {
                            mappedRoleId = roleById.id;
                            console.log('✅ Mapped role by ID:', roleById);
                        } else {
                            console.warn('⚠️ Không tìm thấy role phù hợp, sử dụng default');
                        }
                    }
                }

                // ✅ Set current role and check if Patient
                const currentRole = roles.find(r => r.id === mappedRoleId);
                setCurrentUserRole(currentRole);
                setIsPatientRole(currentRole?.roleType === 6);

                console.log('🎯 Current mapped role:', currentRole);
                console.log('👤 Is Patient:', currentRole?.roleType === 6);

                // ✅ Set selected province for ward loading
                if (userData.province) {
                    setSelectedProvince(userData.province);
                }

                // ✅ Set form values with proper role mapping
                const formValues = {
                    fullname: userData.fullname || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    roleId: mappedRoleId, // ✅ Use mapped role ID
                    gender: userData.gender ? 'male' : 'female',
                    dob: userData.dob && userData.dob !== '0001-01-01' ? dayjs(userData.dob) : null,
                    job: userData.job || '',
                    cccd: userData.cccd || '',
                    province: userData.province || '',
                    ward: userData.ward || '',
                    streetAddress: userData.streetAddress || '',
                    active: userData.active
                };

                console.log('📝 Setting form values:', formValues);
                form.setFieldsValue(formValues);

                dispatch(setMessage({
                    type: 'success',
                    content: `✅ Đã tải thông tin ${userData.fullname || 'người dùng'}`
                }));
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải thông tin người dùng:", error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải thông tin người dùng. Vui lòng thử lại.'
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

    // ✅ Enhanced submit handler with better error handling
    const handleSubmit = async (values) => {
        setLoading(true);
        dispatch(clearMessage());

        try {
            console.log('📤 Cập nhật người dùng với ID:', record.id);
            console.log('📝 Dữ liệu form:', values);

            dispatch(setMessage({
                type: 'info',
                content: '⏳ Đang cập nhật thông tin người dùng...'
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
                    content: `🎉 Cập nhật ${values.fullname} thành công!`
                }));
                
                // ✅ Reset state and close modal
                setTimeout(() => {
                    setUserDetails(null);
                    setCurrentUserRole(null);
                    setIsPatientRole(false);
                    setSelectedProvince(null);
                    setWards([]);
                    form.resetFields();
                    onSuccess();
                }, 1500);
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

            // ✅ Enhanced error handling for your API response format
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

    // ✅ Enhanced cancel handler
    const handleCancel = () => {
        dispatch(clearMessage());
        setUserDetails(null);
        setCurrentUserRole(null);
        setIsPatientRole(false);
        setSelectedProvince(null);
        setWards([]);
        form.resetFields();
        
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    };

    if (!userDetails && !loading) {
        return null;
    }

    return (
        <ConfigProvider locale={locale}>
            {contextHolder}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        Chỉnh sửa người dùng: {userDetails?.fullname || record?.fullname || 'Đang tải...'}
                        {currentUserRole && (
                            <span style={{
                                marginLeft: 12,
                                padding: '2px 8px',
                                background: isPatientRole ? '#fff7e6' : '#e6f7ff',
                                color: isPatientRole ? '#fa8c16' : '#1890ff',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'normal'
                            }}>
                                {currentUserRole.name}
                            </span>
                        )}
                    </div>
                }
                open={visible}
                onCancel={handleCancel}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
                maskClosable={false}
            >
                <Spin spinning={loading} tip="Đang xử lý...">
                    {/* ✅ Patient role notification */}
                    {isPatientRole && (
                        <div style={{
                            marginBottom: 16,
                            padding: '12px 16px',
                            background: '#fff7e6',
                            borderRadius: '6px',
                            border: '1px solid #ffd591',
                            fontSize: '13px'
                        }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                                👤 Đang chỉnh sửa tài khoản Bệnh nhân
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4' }}>
                                Tài khoản này có vai trò Bệnh nhân. Một số tính năng có thể bị hạn chế.
                            </div>
                        </div>
                    )}

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
                            <h4 style={{ color: '#1890ff', marginBottom: 16 }}>🔐 Thông tin tài khoản</h4>

                            <Row gutter={16}>
                                <Col span={12}>
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
                                        <Input placeholder="Nhập địa chỉ email" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="roleId"
                                        label="Vai trò"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                                        hasFeedback
                                    >
                                        <Select 
                                            placeholder="Chọn vai trò người dùng"
                                            onChange={handleRoleChange}
                                        >
                                            {roles.map(role => (
                                                <Option key={role.id} value={role.id}>
                                                    {role.name} (Type: {role.roleType})
                                                    {role.roleType === 6 && (
                                                        <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                                                            - Bệnh nhân
                                                        </span>
                                                    )}
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
                                        hasFeedback
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
                                        hasFeedback
                                    >
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="active"
                                label="Trạng thái tài khoản"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                                hasFeedback
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
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ tên' },
                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
                                    { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' }
                                ]}
                                hasFeedback
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
                                        hasFeedback
                                    >
                                        <Input placeholder="Nhập số điện thoại" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                                        hasFeedback
                                    >
                                        <Select placeholder="Chọn giới tính">
                                            <Option value="male">👨 Nam</Option>
                                            <Option value="female">👩 Nữ</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item 
                                        name="dob" 
                                        label="Ngày sinh"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (value && dayjs().diff(value, 'years') < 16) {
                                                        return Promise.reject(new Error('Tuổi phải từ 16 trở lên'));
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                        hasFeedback
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            placeholder="Chọn ngày sinh"
                                            format="DD/MM/YYYY"
                                            locale={locale.DatePicker}
                                            disabledDate={(current) => current && current > dayjs().endOf('day')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item 
                                        name="job" 
                                        label="Nghề nghiệp"
                                        rules={[
                                            { max: 50, message: 'Nghề nghiệp không được vượt quá 50 ký tự' }
                                        ]}
                                    >
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
                                        hasFeedback
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
                                    <Form.Item 
                                        name="province" 
                                        label="Tỉnh/Thành phố"
                                        rules={[
                                            { max: 50, message: 'Tỉnh/Thành phố không được vượt quá 50 ký tự' }
                                        ]}
                                    >
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
                                    <Form.Item 
                                        name="ward" 
                                        label="Quận/Huyện"
                                        rules={[
                                            { max: 50, message: 'Quận/Huyện không được vượt quá 50 ký tự' }
                                        ]}
                                    >
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
                                    <Form.Item 
                                        name="streetAddress" 
                                        label="Địa chỉ cụ thể"
                                        rules={[
                                            { max: 200, message: 'Địa chỉ không được vượt quá 200 ký tự' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập địa chỉ cụ thể" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* ✅ Enhanced debugging info */}
                            <div style={{ marginTop: 12, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: '12px' }}>
                                <strong>🔍 Thông tin debug:</strong><br />
                                User ID: {record?.id} | Current Role: {currentUserRole?.name} ({currentUserRole?.roleType})<br />
                                Original API Role: {userDetails?.role?.name} (Type: {userDetails?.role?.roleType})<br />
                                Provinces: {provinces.length} | Wards: {wards.length} | Is Patient: {isPatientRole ? 'Yes' : 'No'}
                            </div>
                        </div>

                        {/* Updated notes */}
                        <div style={{
                            marginBottom: 24,
                            padding: '12px 16px',
                            background: '#f6ffed',
                            borderRadius: '6px',
                            border: '1px solid #b7eb8f',
                            fontSize: '13px'
                        }}>
                            <div style={{ color: '#389e0d', fontWeight: 500, marginBottom: 4 }}>
                                💡 Lưu ý khi chỉnh sửa người dùng:
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4' }}>
                                • <strong>Vai trò hiện tại</strong> được hiển thị chính xác từ dữ liệu API<br />
                                • <strong>Mật khẩu</strong> để trống để giữ nguyên mật khẩu hiện tại<br />
                                • <strong>Email và SĐT</strong> phải là duy nhất trong hệ thống<br />
                                • <strong>Lỗi sẽ được hiển thị chi tiết</strong> để hỗ trợ khắc phục
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <Row justify="end" gutter={8} style={{ marginTop: 24 }}>
                            <Col>
                                <Button onClick={handleCancel} size="large" disabled={loading}>
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
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật người dùng'}
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