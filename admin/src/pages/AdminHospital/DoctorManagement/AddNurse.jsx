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
    Alert,
    Steps,
    message,
    ConfigProvider
} from 'antd';
import {
    UserAddOutlined,
    SaveOutlined,
    UserOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearMessage, setMessage } from '../../../redux/slices/messageSlice';
import { createUser } from '../../../services/userService';
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import { getProvinces } from '../../../services/provinceService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';

// ✅ Set dayjs locale to Vietnamese
dayjs.locale('vi');

const { Option } = Select;
const { Step } = Steps;

const AddNurse = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [departments, setDepartments] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const messageState = useSelector((state) => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    const hospitalId = user?.hospitals?.[0]?.id || 0;

    // ✅ Handle Redux messages
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    useEffect(() => {
        if (visible && hospitalId) {
            fetchInitialData();
            resetForm();
        }
    }, [visible, hospitalId]);

    useEffect(() => {
        if (selectedProvince && provinces.length > 0) {
            const provinceObj = provinces.find((p) => p.province === selectedProvince);
            const wardsList = provinceObj?.wards || [];
            setWards(wardsList);
        } else {
            setWards([]);
        }
    }, [selectedProvince, provinces]);

    const resetForm = () => {
        form.resetFields();
        setCurrentStep(0);
        setFormData({});
        setSelectedProvince(null);
        setWards([]);

        // ✅ Set default values based on API schema
        form.setFieldsValue({
            roleType: 7, // Fixed role type for nurse
            hospitalId: hospitalId,
            departmentId: 0,
            fullname: "",
            phoneNumber: "",
            email: "",
            password: "",
            avatarUrl: "",
            dob: null,
            gender: "male", // Default to male
            job: "Điều dưỡng", // ✅ Fixed job title
            cccd: "",
            province: "",
            ward: "",
            streetAddress: ""
        });
    };

    const fetchInitialData = async () => {
        try {
            setLoadingDepartments(true);
            setLoadingProvinces(true);

            console.log('🔄 Đang tải dữ liệu ban đầu cho bệnh viện ID:', hospitalId);

            dispatch(setMessage({
                type: 'info',
                content: 'Đang tải dữ liệu khoa và địa danh...'
            }));

            const [departmentsData, provincesData] = await Promise.all([
                getDepartmentsByHospitalId(hospitalId),
                getProvinces()
            ]);

            console.log('🏢 Đã tải khoa:', departmentsData);
            console.log('🌏 Đã tải tỉnh thành:', provincesData);

            setDepartments(departmentsData || []);
            setProvinces(provincesData.data || []);

            dispatch(setMessage({
                type: 'success',
                content: `Đã tải ${departmentsData?.length || 0} khoa và ${provincesData.data?.length || 0} tỉnh thành`
            }));

        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu ban đầu:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải dữ liệu ban đầu. Vui lòng thử lại.'
            }));
        } finally {
            setLoadingDepartments(false);
            setLoadingProvinces(false);
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

    // ✅ Enhanced error message mapping function
    const getErrorMessage = (title) => {
        const errorMessages = {
            'PHONE_ALREADY_EXISTS': '❌ Số điện thoại đã được sử dụng. Vui lòng nhập số điện thoại khác và thử lại.',
            'EMAIL_ALREADY_EXISTS': '❌ Email đã được sử dụng. Vui lòng nhập email khác và thử lại.',
            'CCCD_ALREADY_EXISTS': '❌ Số CCCD đã được sử dụng. Vui lòng nhập số CCCD khác và thử lại.',
            'INVALID_DEPARTMENT': '❌ Khoa không hợp lệ. Vui lòng chọn khoa khác và thử lại.',
            'INVALID_HOSPITAL': '❌ Bệnh viện không hợp lệ. Vui lòng thử đăng nhập lại.',
            'VALIDATION_ERROR': '❌ Thông tin không hợp lệ. Vui lòng kiểm tra lại các trường và thử lại.',
            'PERMISSION_DENIED': '❌ Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên.',
            'DEPARTMENT_FULL': '❌ Khoa đã đủ người. Vui lòng chọn khoa khác hoặc liên hệ quản trị viên.',
            'WEAK_PASSWORD': '❌ Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn (ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt).',
            'INVALID_DATE': '❌ Ngày sinh không hợp lệ. Vui lòng chọn ngày sinh phù hợp (trên 18 tuổi).',
            'INVALID_PHONE_FORMAT': '❌ Định dạng số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (10-11 chữ số).',
            'INVALID_EMAIL_FORMAT': '❌ Định dạng email không hợp lệ. Vui lòng nhập email đúng định dạng.',
            'INVALID_CCCD_FORMAT': '❌ Định dạng số CCCD không hợp lệ. Vui lòng nhập số CCCD/CMND hợp lệ (9-12 chữ số).',
            'SERVER_ERROR': '❌ Lỗi máy chủ. Vui lòng thử lại sau ít phút.',
            'DATABASE_ERROR': '❌ Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.',
            'NETWORK_ERROR': '❌ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
            'Network Error': '❌ Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.',
            'Request failed': '❌ Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.',
            'Request timeout': '❌ Kết nối quá chậm. Vui lòng thử lại sau.'
        };

        return errorMessages[title] || `❌ ${title}. Vui lòng kiểm tra lại thông tin và thử lại.`;
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            console.log('🔄 Bắt đầu tạo tài khoản điều dưỡng...');

            const currentStepValues = form.getFieldsValue();
            const allValues = { ...formData, ...currentStepValues };

            console.log('📝 Giá trị form:', allValues);

            dispatch(setMessage({
                type: 'loading',
                content: 'Đang xử lý thông tin điều dưỡng...'
            }));

            // ✅ Validation based on API schema
            const requiredFields = [
                'fullname', 'phoneNumber', 'email', 'password', 
                'dob', 'gender', 'cccd', 
                'province', 'ward', 'streetAddress', 'departmentId'
            ];

            const missingFields = requiredFields.filter(field => {
                const value = allValues[field];
                return value === undefined || value === null || value === '';
            });

            if (missingFields.length > 0) {
                const errorMsg = `Thiếu trường bắt buộc: ${missingFields.join(', ')}`;
                
                dispatch(setMessage({
                    type: 'error',
                    content: `❌ ${errorMsg}. Vui lòng hoàn thành thông tin và thử lại.`
                }));
                
                return;
            }

            // ✅ Prepare payload exactly matching API schema
            const nursePayload = {
                hospitalId: parseInt(hospitalId) || 0,
                departmentId: parseInt(allValues.departmentId) || 0,
                roleType: 7, // ✅ Fixed role type for nurse
                fullname: (allValues.fullname || "").trim(),
                phoneNumber: (allValues.phoneNumber || "").trim(),
                email: (allValues.email || "").trim(),
                password: (allValues.password || "").trim(),
                avatarUrl: (allValues.avatarUrl || "").trim(),
                dob: allValues.dob ? 
                    (typeof allValues.dob === 'string' ? allValues.dob : allValues.dob.format('YYYY-MM-DD')) 
                    : "2025-08-14", // Default date if not provided
                gender: allValues.gender === 'male', // Convert to boolean
                job: "Điều dưỡng", // ✅ Fixed job title
                cccd: (allValues.cccd || "").trim(),
                province: (allValues.province || "").trim(),
                ward: (allValues.ward || "").trim(),
                streetAddress: (allValues.streetAddress || "").trim()
            };

            console.log('🏥 Payload điều dưỡng cuối cùng:', JSON.stringify(nursePayload, null, 2));

            // ✅ Final validation
            if (nursePayload.hospitalId === 0) {
                dispatch(setMessage({
                    type: 'error',
                    content: '❌ Hospital ID không hợp lệ. Vui lòng thử đăng nhập lại.'
                }));
                return;
            }
            if (nursePayload.departmentId === 0) {
                dispatch(setMessage({
                    type: 'error',
                    content: '❌ Vui lòng chọn khoa làm việc.'
                }));
                return;
            }

            // Call API
            const response = await createUser(nursePayload);
            console.log('📥 Phản hồi createUser:', response);

            // Check success
            const isSuccess = (
                response === true ||
                response?.success === true ||
                (response?.status >= 200 && response?.status < 300)
            );

            if (isSuccess) {
                console.log('✅ Tạo điều dưỡng thành công');

                dispatch(setMessage({
                    type: 'success',
                    content: '🎉 Tạo điều dưỡng thành công!'
                }));

                // Reset form
                resetForm();

                setTimeout(() => {
                    onSuccess();
                }, 1500);

            } else {
                // ✅ Enhanced error handling with title from response
                const errorTitle = response?.title || response?.message || 'UNKNOWN_ERROR';
                const errorStatus = response?.status || 400;
                
                console.error('❌ Tạo thất bại:', { title: errorTitle, status: errorStatus, response });

                dispatch(setMessage({
                    type: 'error',
                    content: getErrorMessage(errorTitle)
                }));

                return;
            }

        } catch (error) {
            console.error('❌ Lỗi khi tạo điều dưỡng:', error);

            let errorTitle = 'UNKNOWN_ERROR';

            // ✅ Enhanced error handling - prioritize title from response
            if (error.response?.data) {
                const responseData = error.response.data;
                
                // ✅ First, check for title (priority)
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

    const nextStep = async () => {
        try {
            let fieldsToValidate = [];

            switch (currentStep) {
                case 0:
                    fieldsToValidate = [
                        'fullname', 'phoneNumber', 'email', 'password', 'confirmPassword',
                        'gender', 'dob', 'cccd'
                    ];
                    break;
                case 1:
                    fieldsToValidate = ['departmentId', 'province', 'ward', 'streetAddress'];
                    break;
                default:
                    break;
            }

            if (fieldsToValidate.length > 0) {
                const values = await form.validateFields(fieldsToValidate);
                setFormData(prev => ({ ...prev, ...values }));
                
                // ✅ Clear any previous error messages when validation passes
                dispatch(setMessage({
                    type: 'success',
                    content: `✅ Bước ${currentStep + 1} hoàn thành. Tiến tới bước tiếp theo.`
                }));
            }

            setCurrentStep(currentStep + 1);
        } catch (error) {
            const errorFields = error.errorFields || [];
            if (errorFields.length > 0) {
                const missingFields = errorFields.map(field => field.name[0]).join(', ');
                
                dispatch(setMessage({
                    type: 'error',
                    content: `❌ Vui lòng hoàn thành các trường: ${missingFields}. Kiểm tra lại và thử lại.`
                }));
            }
        }
    };

    const prevStep = () => {
        const currentValues = form.getFieldsValue();
        setFormData(prev => ({ ...prev, ...currentValues }));
        setCurrentStep(currentStep - 1);
        
        // ✅ Clear any error messages when going back
        dispatch(setMessage({
            type: 'info',
            content: `⬅️ Đã quay lại bước ${currentStep}.`
        }));
    };

    // ✅ Updated steps - removed work info step
    const steps = [
        {
            title: 'Thông tin cá nhân',
            description: 'Thông tin cơ bản',
            icon: <UserOutlined />
        },
        {
            title: 'Địa chỉ & Khoa',
            description: 'Địa chỉ và phân công',
            icon: <EnvironmentOutlined />
        },
        {
            title: 'Xem lại',
            description: 'Xác nhận thông tin',
            icon: <CheckCircleOutlined />
        }
    ];

    const renderPersonalInfoStep = () => {
        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#f0f7ff',
                borderRadius: '8px',
                border: '1px solid #d6e4ff'
            }}>
                <h3 style={{
                    color: '#1890ff',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Thông tin cá nhân
                </h3>

                <Alert
                    message={`Bệnh viện: ${user?.hospitals?.[0]?.name || 'Đang tải...'}`}
                    description={`Đang tạo tài khoản điều dưỡng cho bệnh viện ID: ${hospitalId}. Vai trò: Điều dưỡng (roleType: 7).`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

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
                            <Input placeholder="Nguyễn Thị Lan" />
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
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                            ]}
                        >
                            <Input placeholder="dieuduong@benhvien.com" />
                        </Form.Item>
                    </Col>

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
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Xác nhận mật khẩu" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="avatarUrl"
                            label="URL ảnh đại diện"
                        >
                            <Input placeholder="https://example.com/photo.jpg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            initialValue="male"
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
                                    return current && current > dayjs().subtract(18, 'year');
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="cccd"
                            label="Số CCCD/CMND"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số CCCD' },
                                { pattern: /^[0-9]{9,12}$/, message: 'CCCD phải có 9-12 chữ số' }
                            ]}
                        >
                            <Input placeholder="Nhập số CCCD" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* ✅ Hidden job field with fixed value */}
                <Form.Item name="job" hidden initialValue="Điều dưỡng">
                    <Input />
                </Form.Item>
            </div>
        );
    };

    const renderAddressAndDepartmentStep = () => {
        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#f6ffed',
                borderRadius: '8px',
                border: '1px solid #b7eb8f'
            }}>
                <h3 style={{
                    color: '#52c41a',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    Địa chỉ & Phân công khoa
                </h3>

                <Alert
                    message="Thông tin địa chỉ và phân công khoa"
                    description={`Bệnh viện ID: ${hospitalId}. Vai trò: Điều dưỡng (roleType: 7 - cố định). Khoa có sẵn: ${departments.length}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                {/* ✅ Fixed Role and Hospital Info - Display only */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="roleType"
                            label="Vai trò"
                            initialValue={7}
                        >
                            <Select disabled>
                                <Option value={7}>🩺 Điều dưỡng (roleType: 7)</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="hospitalId"
                            label="ID Bệnh viện"
                            initialValue={hospitalId}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Chức danh"
                            initialValue="Điều dưỡng"
                        >
                            <Input disabled value="Điều dưỡng" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Department Selection */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={24}>
                        <Form.Item
                            name="departmentId"
                            label="Khoa"
                            rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                        >
                            <Select 
                                placeholder="Chọn khoa làm việc" 
                                showSearch
                                loading={loadingDepartments}
                                filterOption={(input, option) =>
                                    (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {departments.map(dept => (
                                    <Option key={dept.id} value={dept.id}>
                                        🏥 {dept.name} (ID: {dept.id})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address Information */}
                <h4 style={{ color: '#722ed1', marginBottom: 16 }}>📍 Thông tin địa chỉ</h4>
                
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="province"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
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

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="ward"
                            label="Quận/Huyện"
                            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
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
                </Row>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item
                            name="streetAddress"
                            label="Địa chỉ cụ thể"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
                        >
                            <Input placeholder="123 Đường ABC, Phường XYZ" />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 6, fontSize: '12px' }}>
                    <strong>Thông tin API Schema:</strong><br />
                    hospitalId: {hospitalId} (từ user data)<br />
                    departmentId: (người dùng chọn)<br />
                    roleType: 7 (cố định - Điều dưỡng)<br />
                    job: "Điều dưỡng" (cố định)<br />
                    Service: createUser<br />
                    Schema: hospitalId, departmentId, roleType, fullname, phoneNumber, email, password, avatarUrl, dob, gender, job, cccd, province, ward, streetAddress
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const currentValues = form.getFieldsValue();
        const allData = { ...formData, ...currentValues };

        const selectedDepartment = departments.find(d => d.id === allData.departmentId);

        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#fff7e6',
                borderRadius: '8px',
                border: '1px solid #ffd591'
            }}>
                <h3 style={{
                    color: '#faad14',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Xem lại thông tin điều dưỡng
                </h3>

                <Alert
                    message="Vui lòng xem lại tất cả thông tin trước khi tạo tài khoản điều dưỡng"
                    description="Đảm bảo tất cả thông tin đều chính xác. Chức danh sẽ được tự động gán là 'Điều dưỡng'."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 20 }}
                />

                <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
                    <Row gutter={32}>
                        <Col span={12}>
                            <h4 style={{ color: '#1890ff', marginBottom: 12 }}>👤 Thông tin cá nhân</h4>
                            <p><strong>Họ tên:</strong> {allData.fullname || 'Chưa cung cấp'}</p>
                            <p><strong>Điện thoại:</strong> {allData.phoneNumber || 'Chưa cung cấp'}</p>
                            <p><strong>Email:</strong> {allData.email || 'Chưa cung cấp'}</p>
                            <p><strong>Giới tính:</strong> {allData.gender === 'male' ? '👨 Nam (true)' : '👩 Nữ (false)'}</p>
                            <p><strong>Ngày sinh:</strong> {allData.dob ? (typeof allData.dob === 'string' ? allData.dob : allData.dob.format('DD/MM/YYYY')) : 'Chưa cung cấp'}</p>
                            <p><strong>CCCD:</strong> {allData.cccd || 'Chưa cung cấp'}</p>
                            <p><strong>Avatar URL:</strong> {allData.avatarUrl || 'Không có'}</p>
                        </Col>
                        <Col span={12}>
                            <h4 style={{ color: '#52c41a', marginBottom: 12 }}>🏥 Thông tin công việc</h4>
                            <p><strong>Bệnh viện:</strong> {user?.hospitals?.[0]?.name || 'Đang tải...'}</p>
                            <p><strong>Hospital ID:</strong> {hospitalId}</p>
                            <p><strong>Department ID:</strong> {allData.departmentId}</p>
                            <p><strong>Khoa:</strong> {selectedDepartment?.name || 'Chưa chọn'}</p>
                            <p><strong>Role Type:</strong> 7 (Điều dưỡng - cố định)</p>
                            <p><strong>Chức danh:</strong> Điều dưỡng (cố định)</p>
                            
                            <h4 style={{ color: '#722ed1', marginBottom: 12, marginTop: 16 }}>📍 Địa chỉ</h4>
                            <p><strong>Tỉnh/TP:</strong> {allData.province || 'Chưa chọn'}</p>
                            <p><strong>Quận/Huyện:</strong> {allData.ward || 'Chưa chọn'}</p>
                            <p><strong>Địa chỉ cụ thể:</strong> {allData.streetAddress || 'Chưa cung cấp'}</p>

                            <div style={{ marginTop: 16, padding: 8, background: '#e6fffb', borderRadius: 4, fontSize: '12px' }}>
                                <strong>✅ API Payload Preview:</strong><br />
                                hospitalId: {hospitalId}<br />
                                departmentId: {allData.departmentId || 0}<br />
                                roleType: 7<br />
                                job: "Điều dưỡng" (cố định)<br />
                                gender: {allData.gender === 'male' ? 'true' : 'false'}<br />
                                dob: {allData.dob ? (typeof allData.dob === 'string' ? allData.dob : allData.dob.format('YYYY-MM-DD')) : '2025-08-14'}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderPersonalInfoStep();
            case 1:
                return renderAddressAndDepartmentStep();
            case 2:
                return renderReviewStep();
            default:
                return null;
        }
    };

    const handleCancel = () => {
        resetForm();
        
        dispatch(setMessage({
            type: 'info',
            content: 'Đã hủy tạo tài khoản điều dưỡng'
        }));
        
        onCancel();
    };

    return (
        <>
            {contextHolder}
            
            <ConfigProvider locale={locale}>
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserAddOutlined style={{
                                color: '#52c41a',
                                marginRight: 8,
                                fontSize: '20px'
                            }} />
                            <span style={{ fontSize: '18px', fontWeight: 600 }}>
                                Thêm điều dưỡng mới
                            </span>
                        </div>
                    }
                    open={visible}
                    onCancel={handleCancel}
                    footer={null}
                    width={1100}
                    destroyOnClose
                    style={{ top: 20 }}
                    maskClosable={false}
                >
                    <Spin spinning={loading} tip={loading ? "Đang xử lý..." : undefined}>
                        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 4px' }}>
                            <div style={{ marginBottom: 32 }}>
                                <Steps current={currentStep} size="small">
                                    {steps.map((step, index) => (
                                        <Step
                                            key={index}
                                            title={step.title}
                                            description={step.description}
                                            icon={step.icon}
                                        />
                                    ))}
                                </Steps>
                            </div>

                            <Form
                                form={form}
                                layout="vertical"
                                preserve={true}
                                onValuesChange={handleFormValuesChange}
                            >
                                {renderStepContent()}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    paddingTop: 16,
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <div>
                                        {currentStep > 0 && (
                                            <Button onClick={prevStep} size="large" disabled={loading}>
                                                Quay lại
                                            </Button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <Button onClick={handleCancel} size="large" disabled={loading}>
                                            Hủy
                                        </Button>

                                        {currentStep < steps.length - 1 ? (
                                            <Button
                                                type="primary"
                                                onClick={nextStep}
                                                size="large"
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: '#52c41a',
                                                    borderColor: '#52c41a'
                                                }}
                                            >
                                                Tiếp theo
                                            </Button>
                                        ) : (
                                            <Button
                                                type="primary"
                                                onClick={handleSubmit}
                                                loading={loading}
                                                size="large"
                                                icon={<SaveOutlined />}
                                                style={{
                                                    backgroundColor: '#52c41a',
                                                    borderColor: '#52c41a'
                                                }}
                                            >
                                                Tạo điều dưỡng
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </Spin>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default AddNurse;