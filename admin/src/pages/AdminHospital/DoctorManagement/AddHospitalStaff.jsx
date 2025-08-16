import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Row,
    Col,
    Button,
    Spin,
    DatePicker,
    message,
    ConfigProvider
} from 'antd';
import {
    UserAddOutlined,
    SaveOutlined,
    UserOutlined,
    BuildOutlined,
    ApartmentOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
import { getProvinces } from '../../../services/provinceService';
import { createUser } from '../../../services/userService';
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';

dayjs.locale('vi');

const { Option } = Select;
const { TextArea } = Input;

const AddHospitalStaff = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);

    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);
    const user = useSelector((state) => state.user.user);
    const hospitalId = user?.hospitals?.[0]?.id || 0;

    // Handle Redux messages
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    // Load provinces
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const data = await getProvinces();
                setProvinces(data.data || []);
            } catch (err) {
                console.error("Lỗi khi tải tỉnh thành:", err);
            }
        };
        loadProvinces();
    }, []);

    // ✅ Load departments when hospitalId is available
    useEffect(() => {
        const loadDepartments = async () => {
            if (!hospitalId) {
                console.warn('⚠️ Không có hospitalId, không thể tải departments');
                return;
            }

            setDepartmentsLoading(true);
            try {
                console.log('🔄 Đang tải departments cho hospitalId:', hospitalId);
                const response = await getDepartmentsByHospitalId(hospitalId);
                console.log('📥 Departments response:', response);

                let departmentList = [];
                if (response?.success && Array.isArray(response.result)) {
                    departmentList = response.result;
                } else if (Array.isArray(response)) {
                    departmentList = response;
                } else {
                    console.warn('⚠️ Định dạng response departments không mong đợi:', response);
                }

                console.log('✅ Departments đã tải:', departmentList);
                setDepartments(departmentList);

            } catch (error) {
                console.error('❌ Lỗi khi tải departments:', error);
                dispatch(setMessage({
                    type: 'warning',
                    content: 'Không thể tải danh sách khoa. Vui lòng thử lại sau.'
                }));
                setDepartments([]);
            } finally {
                setDepartmentsLoading(false);
            }
        };

        if (visible && hospitalId) {
            loadDepartments();
        }
    }, [visible, hospitalId, dispatch]);

    // Load wards when province changes
    useEffect(() => {
        if (selectedProvince && provinces.length > 0) {
            const provinceObj = provinces.find((p) => p.province === selectedProvince);
            setWards(provinceObj?.wards || []);
        } else {
            setWards([]);
        }
    }, [selectedProvince, provinces]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setSelectedProvince(null);
            setWards([]);
            setDepartments([]);
            setLoading(false);
            setDepartmentsLoading(false);
        }
    }, [visible, form]);

    // Handle form values change
    const onFormValuesChange = (changedValues) => {
        if ("province" in changedValues) {
            const newProvince = changedValues.province || null;
            setSelectedProvince(newProvince);
            if (newProvince !== selectedProvince) {
                form.setFieldsValue({ ward: undefined });
            }
        }
    };

    // ✅ Validate text only (Vietnamese and international characters)
    const validateTextOnly = (_, value) => {
        if (!value) {
            return Promise.resolve(); // Not required, so empty is OK
        }

        // Allow Vietnamese characters, spaces, and common job-related characters
        const textOnlyRegex = /^[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]+$/;

        if (!textOnlyRegex.test(value.trim())) {
            return Promise.reject(new Error('Chức vụ chỉ được nhập chữ cái và dấu cách'));
        }

        if (value.trim().length < 2) {
            return Promise.reject(new Error('Chức vụ phải có ít nhất 2 ký tự'));
        }

        if (value.trim().length > 100) {
            return Promise.reject(new Error('Chức vụ không được vượt quá 100 ký tự'));
        }

        return Promise.resolve();
    };

    // ✅ Updated CCCD/CMND Validation - CCCD can start with 0
    const validateCCCD = (_, value) => {
        // Check if value exists
        if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng nhập số CCCD/CMND'));
        }

        const cccdValue = value.trim();

        // Check if contains only numbers
        const numericOnly = cccdValue.replace(/\D/g, '');
        if (numericOnly !== cccdValue) {
            return Promise.reject(new Error('CCCD/CMND chỉ được chứa số'));
        }

        // Check length and format
        if (numericOnly.length === 12) {
            // ✅ CCCD format validation (12 digits) - Can start with 0
            const cccdRegex = /^[0-9]{12}$/;
            if (!cccdRegex.test(numericOnly)) {
                return Promise.reject(new Error('CCCD phải có đúng 12 chữ số'));
            }

            // ✅ Removed restriction about starting with 0
            // CCCD can legitimately start with 0 (e.g., 001234567890)

            // Optional: Basic location code validation for first 3 digits
            const firstThreeDigits = numericOnly.substring(0, 3);
            const locationCode = parseInt(firstThreeDigits, 10);
            
            // Vietnam province codes range from 001-096
            if (locationCode < 1 || locationCode > 96) {
                return Promise.reject(new Error('Mã tỉnh/thành trong CCCD không hợp lệ (001-096)'));
            }

            return Promise.resolve();

        } else if (numericOnly.length === 9) {
            // CMND format validation (9 digits)
            const cmndRegex = /^[0-9]{9}$/;
            if (!cmndRegex.test(numericOnly)) {
                return Promise.reject(new Error('CMND phải có đúng 9 chữ số'));
            }

            return Promise.resolve();

        } else {
            // Invalid length
            return Promise.reject(new Error('CCCD phải có 12 chữ số hoặc CMND phải có 9 chữ số'));
        }
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        console.log('📤 Submitting hospital staff form:', values);

        setLoading(true);

        dispatch(setMessage({
            type: 'loading',
            content: 'Đang tạo nhân viên bệnh viện...'
        }));

        try {
            // Format date
            let dobFormatted = null;
            if (values.dob) {
                dobFormatted = dayjs(values.dob).format('YYYY-MM-DD');
            }

            // ✅ Fixed roleType to 4 for Hospital Staff with department
            const userData = {
                fullname: values.fullname?.trim() || "",
                email: values.email?.trim() || "",
                password: values.password?.trim() || "",
                phoneNumber: values.phoneNumber?.trim() || "",
                dob: dobFormatted,
                gender: values.gender === 'male',
                job: values.job?.trim() || '', // ✅ Not required, can be empty
                cccd: values.cccd?.trim() || "", // ✅ Now required with validation
                province: values.province?.trim() || "",
                ward: values.ward?.trim() || "",
                streetAddress: values.streetAddress?.trim() || "",
                avatarUrl: values.avatarUrl?.trim() || "",
                description: values.description?.trim() || "",
                hospitalId: hospitalId,
                departmentId: values.departmentId || null,
                roleType: 3 // ✅ Fixed Hospital Staff Role Type
            };

            console.log('🔄 Hospital staff creation payload:', userData);

            const response = await createUser(userData);
            console.log('✅ Hospital staff creation response:', response);

            dispatch(setMessage({
                type: 'success',
                content: '✅ Tạo nhân viên bệnh viện thành công!'
            }));

            // ✅ Show department info if selected
            if (values.departmentId) {
                const selectedDepartment = departments.find(dept => dept.id === values.departmentId);
                setTimeout(() => {
                    dispatch(setMessage({
                        type: 'info',
                        content: `📋 Đã gán vào khoa: ${selectedDepartment?.name || 'Không xác định'}`
                    }));
                }, 1500);
            }

            handleCancel();

            if (typeof onSuccess === 'function') {
                onSuccess(response);
            }

        } catch (error) {
            console.error('❌ Lỗi khi tạo nhân viên bệnh viện:', error);

            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Tạo nhân viên bệnh viện thất bại';

            dispatch(setMessage({
                type: 'error',
                content: `❌ ${errorMessage}`
            }));

            if (error.response?.status) {
                setTimeout(() => {
                    dispatch(setMessage({
                        type: 'warning',
                        content: `🔍 Mã lỗi: ${error.response.status}`
                    }));
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        dispatch(setMessage({
            type: 'info',
            content: '🚫 Đã hủy tạo nhân viên bệnh viện'
        }));

        form.resetFields();
        setSelectedProvince(null);
        setWards([]);
        setDepartments([]);
        setLoading(false);
        setDepartmentsLoading(false);

        if (typeof onCancel === 'function') {
            onCancel();
        }
    };

    return (
        <>
            {contextHolder}

            <ConfigProvider locale={locale}>
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserAddOutlined style={{ color: '#722ed1', marginRight: 8, fontSize: '18px' }} />
                            <span style={{ fontSize: '16px', fontWeight: 600 }}>
                                Thêm Nhân viên Bệnh viện
                            </span>
                        </div>
                    }
                    open={visible}
                    onCancel={handleCancel}
                    footer={null}
                    width={900}
                    centered
                    destroyOnClose
                    maskClosable={false}
                >
                    <Spin spinning={loading} tip="Đang xử lý...">
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                onValuesChange={onFormValuesChange}
                                preserve={false}
                            >
                                {/* ✅ Role Information Display (Read-only) */}
                                <div style={{
                                    marginBottom: 24,
                                    padding: '16px 20px',
                                    background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                                    borderRadius: '8px',
                                    border: '1px solid #722ed1'
                                }}>
                                    <div style={{
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <BuildOutlined style={{ marginRight: 8, fontSize: '16px' }} />
                                            Vai trò: Nhân viên Bệnh viện (Hospital Admin)
                                        </div>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px'
                                        }}>
                                            Role Type: 4
                                        </div>
                                    </div>
                                    <div style={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '12px',
                                        marginTop: 4
                                    }}>
                                        Vai trò được tự động gán cho nhân viên bệnh viện mới
                                    </div>
                                </div>

                                {/* Thông tin cơ bản */}
                                <div style={{
                                    marginBottom: 24,
                                    padding: '20px',
                                    background: '#fafafa',
                                    borderRadius: '8px',
                                    border: '1px solid #e8e8e8'
                                }}>
                                    <h3 style={{
                                        color: '#722ed1',
                                        marginBottom: 16,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        Thông tin cơ bản
                                    </h3>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="fullname"
                                                label="Họ và tên"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập họ tên' },
                                                    { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                                                ]}
                                            >
                                                <Input placeholder="Nguyễn Văn A" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="email"
                                                label="Địa chỉ email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' }
                                                ]}
                                            >
                                                <Input placeholder="nhanvien@benhvien.com" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="password"
                                                label="Mật khẩu"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                                ]}
                                            >
                                                <Input.Password placeholder="Nhập mật khẩu" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="phoneNumber"
                                                label="Số điện thoại"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
                                                ]}
                                            >
                                                <Input placeholder="0123456789" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
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

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="dob"
                                                label="Ngày sinh"
                                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    placeholder="Chọn ngày sinh"
                                                    format="DD/MM/YYYY"
                                                    locale={locale.DatePicker}
                                                    disabledDate={(current) => {
                                                        return current && current > dayjs().endOf('day');
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            {/* ✅ Updated CCCD Field - Can start with 0 */}
                                            <Form.Item
                                                name="cccd"
                                                label={
                                                    <span>
                                                        <IdcardOutlined style={{ marginRight: 4 }} />
                                                        Số CCCD/CMND
                                                        <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                                                    </span>
                                                }
                                                rules={[
                                                    { validator: validateCCCD }
                                                ]}
                                                extra={
                                                    <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                        CCCD: 12 chữ số (có thể bắt đầu với 0) | CMND: 9 chữ số
                                                    </span>
                                                }
                                            >
                                                <Input
                                                    placeholder="Nhập 12 chữ số (CCCD) hoặc 9 chữ số (CMND)"
                                                    maxLength={12}
                                                    showCount
                                                    onInput={(e) => {
                                                        // Only allow numbers and limit input
                                                        const value = e.target.value;
                                                        const numericOnly = value.replace(/\D/g, '');
                                                        if (value !== numericOnly) {
                                                            form.setFieldsValue({ cccd: numericOnly });
                                                        }
                                                    }}
                                                    style={{
                                                        fontSize: '14px',
                                                        letterSpacing: '1px'
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="avatarUrl"
                                        label="URL ảnh đại diện"
                                    >
                                        <Input placeholder="https://example.com/photo.jpg" />
                                    </Form.Item>
                                </div>

                                {/* ✅ Thông tin nghề nghiệp với Department */}
                                <div style={{
                                    marginBottom: 24,
                                    padding: '20px',
                                    background: '#f6f6ff',
                                    borderRadius: '8px',
                                    border: '1px solid #d6d6ff'
                                }}>
                                    <h3 style={{
                                        color: '#722ed1',
                                        marginBottom: 16,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <BuildOutlined style={{ marginRight: 8 }} />
                                        Thông tin nghề nghiệp
                                    </h3>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            {/* ✅ Updated Job Field - Not Required, Text Only */}
                                            <Form.Item
                                                name="job"
                                                label={
                                                    <span>
                                                        Chức vụ
                                                        <span style={{
                                                            color: '#8c8c8c',
                                                            fontSize: '12px',
                                                            fontWeight: 'normal',
                                                            marginLeft: 8
                                                        }}>
                                                            (Không bắt buộc)
                                                        </span>
                                                    </span>
                                                }
                                                rules={[
                                                    { validator: validateTextOnly }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Nhân viên Hành chính, Kế toán, IT, Quản lý..."
                                                    maxLength={100}
                                                    showCount
                                                    onInput={(e) => {
                                                        // Remove numbers and special characters on input
                                                        const value = e.target.value;
                                                        const textOnly = value.replace(/[^a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ\s]/g, '');
                                                        if (value !== textOnly) {
                                                            form.setFieldsValue({ job: textOnly });
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            {/* ✅ Simplified Department Selection - Only Show Department Names */}
                                            <Form.Item
                                                name="departmentId"
                                                label={
                                                    <span>
                                                        <ApartmentOutlined style={{ marginRight: 4 }} />
                                                        Khoa/Phòng ban
                                                        <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                                                    </span>
                                                }
                                                rules={[{ required: true, message: 'Vui lòng chọn khoa/phòng ban' }]}
                                            >
                                                <Select
                                                    placeholder={departmentsLoading ? "Đang tải khoa..." : "Chọn khoa/phòng ban"}
                                                    loading={departmentsLoading}
                                                    showSearch
                                                    allowClear
                                                    disabled={departmentsLoading || departments.length === 0}
                                                    filterOption={(input, option) =>
                                                        (option?.children ?? "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                    notFoundContent={
                                                        departmentsLoading ? (
                                                            <div style={{ padding: '12px', textAlign: 'center' }}>
                                                                <Spin size="small" />
                                                                <span style={{ marginLeft: 8, color: '#1890ff' }}>Đang tải danh sách khoa...</span>
                                                            </div>
                                                        ) : departments.length === 0 ? (
                                                            <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                                                                <ApartmentOutlined style={{ fontSize: '16px', marginBottom: '4px' }} />
                                                                <div>Không có khoa/phòng ban nào</div>
                                                                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                                    Vui lòng liên hệ quản trị viên
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                                                                Không tìm thấy khoa phù hợp
                                                            </div>
                                                        )
                                                    }
                                                >
                                                    {departments.map((dept) => (
                                                        <Option key={dept.id} value={dept.id}>
                                                            {dept.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="description"
                                        label="Mô tả công việc"
                                    >
                                        <TextArea
                                            rows={3}
                                            placeholder="Mô tả ngắn gọn về công việc và trách nhiệm của nhân viên"
                                        />
                                    </Form.Item>
                                </div>

                                {/* Thông tin địa chỉ */}
                                <div style={{
                                    marginBottom: 24,
                                    padding: '20px',
                                    background: '#fff7e6',
                                    borderRadius: '8px',
                                    border: '1px solid #ffd591'
                                }}>
                                    <h3 style={{
                                        color: '#fa8c16',
                                        marginBottom: 16,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        📍 Thông tin địa chỉ
                                    </h3>

                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="province"
                                                label="Tỉnh/Thành phố"
                                                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn tỉnh/thành phố"
                                                    showSearch
                                                    allowClear
                                                    loading={provinces.length === 0}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                    options={provinces.map((p) => ({
                                                        label: p.province,
                                                        value: p.province,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="ward"
                                                label="Quận/Huyện"
                                                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn quận/huyện"
                                                    disabled={!selectedProvince}
                                                    showSearch
                                                    allowClear
                                                    loading={selectedProvince && wards.length === 0}
                                                    options={wards.map((w) => ({ label: w.name, value: w.name }))}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                name="streetAddress"
                                                label="Địa chỉ cụ thể"
                                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
                                            >
                                                <Input placeholder="123 Đường Nguyễn Huệ" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>

                                {/* ✅ Department Summary (if departments loaded) */}
                                {departments.length > 0 && (
                                    <div style={{
                                        marginBottom: 24,
                                        padding: '16px',
                                        background: '#f0f9ff',
                                        borderRadius: '8px',
                                        border: '1px solid #bae6fd'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#0369a1',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <ApartmentOutlined style={{ marginRight: 6 }} />
                                            Có <strong>{departments.length}</strong> khoa/phòng ban để lựa chọn trong bệnh viện
                                        </div>
                                    </div>
                                )}

                                {/* ✅ Updated Input Guidelines */}
                                <div style={{
                                    marginBottom: 24,
                                    padding: '12px 16px',
                                    background: '#fff1f0',
                                    borderRadius: '6px',
                                    border: '1px solid #ffccc7'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#cf1322',
                                        lineHeight: '18px'
                                    }}>
                                        <strong>📝 Lưu ý khi nhập:</strong>
                                        <div style={{ marginTop: 4 }}>
                                            • <strong>CCCD mới:</strong> 12 chữ số (có thể bắt đầu với 0, mã tỉnh 001-096)
                                        </div>
                                        <div>
                                            • <strong>CMND cũ:</strong> 9 chữ số
                                        </div>
                                        <div>• Chức vụ chỉ được nhập chữ cái và dấu cách (không bắt buộc)</div>
                                        <div>• Khoa/phòng ban là bắt buộc để phân công công việc</div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 12,
                                    paddingTop: 16,
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <Button onClick={handleCancel} size="large" disabled={loading}>
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        size="large"
                                        icon={<SaveOutlined />}
                                        style={{
                                            backgroundColor: '#722ed1',
                                            borderColor: '#722ed1'
                                        }}
                                    >
                                        {loading ? 'Đang tạo...' : 'Tạo Nhân viên'}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Spin>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default AddHospitalStaff;