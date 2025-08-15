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
    InputNumber,
    Upload,
    Alert,
    Steps,
    message,
    ConfigProvider
} from 'antd';
import {
    UserAddOutlined,
    SaveOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    HeartOutlined,
    UploadOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearMessage, setMessage } from '../../../redux/slices/messageSlice';
import { createDoctor } from '../../../services/doctorService';
import { getHospitalById, getSpecializationsByHospitalId } from '../../../services/hospitalService';
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import { getProvinces } from '../../../services/provinceService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';

// ✅ Set dayjs locale to Vietnamese
dayjs.locale('vi');

const { Option } = Select;
const { Step } = Steps;

const AddStaff = ({ visible, onCancel, onSuccess, staffType = 'doctor', departments, specializations }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [fileList, setFileList] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentHospital, setCurrentHospital] = useState(null);
    const [hospitalSpecializations, setHospitalSpecializations] = useState([]);
    const [hospitalDepartments, setHospitalDepartments] = useState([]);

    // States for provinces and wards
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const messageState = useSelector((state) => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    // ✅ Handle Redux messages
    useEffect(() => {
        if (messageState && messageState.content) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    console.log("🔍 Dữ liệu user hiện tại:", JSON.stringify(user));

    // Fetch provinces on component mount
    useEffect(() => {
        if (visible) {
            fetchProvinces();
        }
    }, [visible]);

    // Function to fetch provinces
    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            console.log("🌏 Đang tải danh sách tỉnh thành...");
            const data = await getProvinces();
            console.log("📍 Đã tải tỉnh thành:", data.data);
            setProvinces(data.data || []);
        } catch (error) {
            console.error("❌ Lỗi khi tải tỉnh thành:", error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách tỉnh/thành phố'
            }));
        } finally {
            setLoadingProvinces(false);
        }
    };

    // Update wards when province changes
    useEffect(() => {
        if (selectedProvince && provinces.length > 0) {
            const provinceObj = provinces.find((p) => p.province === selectedProvince);
            const wardsList = provinceObj?.wards || [];
            setWards(wardsList);
            console.log("🏘️ Phường/xã của", selectedProvince, ":", wardsList);
        } else {
            setWards([]);
        }
    }, [selectedProvince, provinces]);

    // Handle form value changes
    const onFormValuesChange = (changedValues) => {
        if ("province" in changedValues) {
            const newProvince = changedValues.province || null;
            setSelectedProvince(newProvince);
            // Reset ward when province changes
            form.setFieldsValue({ ward: undefined });
            console.log("🔄 Tỉnh thành đã thay đổi thành:", newProvince);
        }
    };

    useEffect(() => {
        if (visible) {
            form.resetFields();
            setCurrentStep(0);
            setFileList([]);
            setFormData({});
            setSelectedProvince(null);
            setWards([]);

            fetchHospitalData();
        }
    }, [visible, form, user]);

    const fetchHospitalData = async () => {
        setLoading(true);
        try {
            console.log('🔄 Đang tải dữ liệu bệnh viện...');

            const hospitalId = user?.hospitals?.[0]?.id;
            console.log('🏥 ID bệnh viện từ user.hospitals[0].id:', hospitalId);

            if (!hospitalId) {
                throw new Error('Không tìm thấy ID bệnh viện trong dữ liệu user.hospitals');
            }

            const [hospital, specs, departments] = await Promise.all([
                getHospitalById(hospitalId),
                getSpecializationsByHospitalId(hospitalId),
                getDepartmentsByHospitalId(hospitalId)
            ]);

            setCurrentHospital(hospital);
            setHospitalSpecializations(specs);
            setHospitalDepartments(departments);

            console.log('🏥 Bệnh viện hiện tại đã được thiết lập:', hospital);
            console.log('🩺 Chuyên khoa bệnh viện đã được thiết lập:', specs);
            console.log('🏢 Khoa bệnh viện đã được thiết lập:', departments);

        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu bệnh viện:', error);

            const fallbackHospitalId = user?.hospitals?.[0]?.id || 105;
            setCurrentHospital({
                id: fallbackHospitalId,
                name: user?.hospitals?.[0]?.name || 'Bệnh viện mặc định',
                address: 'Không rõ'
            });

            setHospitalSpecializations(specializations || []);
            setHospitalDepartments(departments || []);

            dispatch(setMessage({
                type: 'warning',
                content: 'Không thể tải dữ liệu bệnh viện. Đang sử dụng giá trị mặc định.'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        console.log('🚀 handleSubmit được gọi');
        setLoading(true);

        try {
            console.log('🔄 Bắt đầu gửi form...');

            const currentStepValues = form.getFieldsValue();
            const allValues = { ...formData, ...currentStepValues };

            console.log('📝 Giá trị bước hiện tại:', currentStepValues);
            console.log('💾 Dữ liệu form đã lưu:', formData);
            console.log('🔄 Giá trị đã hợp nhất:', allValues);

            dispatch(clearMessage());

            // Enhanced validation
            const missingFields = [];

            if (!allValues.fullname) missingFields.push('fullname');
            if (!allValues.phoneNumber) missingFields.push('phoneNumber');
            if (!allValues.password) missingFields.push('password');
            if (!allValues.cccd) missingFields.push('cccd');
            if (!allValues.gender) missingFields.push('gender');
            if (!allValues.dob) missingFields.push('dob');
            if (!allValues.province) missingFields.push('province');
            if (!allValues.ward) missingFields.push('ward');
            if (!allValues.streetAddress) missingFields.push('streetAddress');
            if (!allValues.description) missingFields.push('description');
            if (!allValues.position) missingFields.push('position');
            if (!allValues.departmentId) missingFields.push('departmentId');

            // Fix specialization validation
            if (allValues.specialization === undefined || allValues.specialization === null || allValues.specialization === '') {
                missingFields.push('specialization');
            }

            console.log('🔍 Specialization validation:', {
                value: allValues.specialization,
                type: typeof allValues.specialization,
                isUndefined: allValues.specialization === undefined,
                isNull: allValues.specialization === null,
                isEmpty: allValues.specialization === '',
                isZero: allValues.specialization === 0,
                isMissing: allValues.specialization === undefined || allValues.specialization === null || allValues.specialization === ''
            });

            if (missingFields.length > 0) {
                console.error('❌ Thiếu các trường bắt buộc:', missingFields);
                const errorMsg = `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`;

                dispatch(setMessage({
                    type: 'error',
                    content: errorMsg
                }));

                throw new Error(errorMsg);
            }

            if (staffType === 'doctor') {
                // Get hospital ID
                const hospitalId = user?.hospitals?.[0]?.id || currentHospital?.id;

                if (!hospitalId) {
                    const errorMsg = 'Không tìm thấy ID bệnh viện. Vui lòng liên hệ quản trị viên.';
                    dispatch(setMessage({
                        type: 'error',
                        content: errorMsg
                    }));
                    throw new Error(errorMsg);
                }

                // Enhanced specialization processing
                let specializationIds = [];

                // Primary specialization
                console.log('🩺 Processing primary specialization:', allValues.specialization);
                
                if (allValues.specialization !== undefined && allValues.specialization !== null && allValues.specialization !== '') {
                    let specId;
                    
                    if (hospitalSpecializations && hospitalSpecializations.length > 0) {
                        // Handle both index-based and direct ID scenarios
                        const selectedSpec = hospitalSpecializations[allValues.specialization];
                        
                        if (selectedSpec) {
                            // If it's an object with id property
                            specId = selectedSpec.id || allValues.specialization;
                        } else {
                            // If allValues.specialization is already an ID
                            specId = parseInt(allValues.specialization);
                        }

                        console.log('🩺 Chuyên khoa chính:', {
                            selectedIndex: allValues.specialization,
                            selectedSpec: selectedSpec,
                            finalId: specId,
                            hospitalSpecializations: hospitalSpecializations
                        });
                    } else {
                        specId = parseInt(allValues.specialization);
                    }

                    // Add to array if valid (including 0 and 1)
                    if (specId !== undefined && specId !== null && !isNaN(specId)) {
                        specializationIds.push(specId);
                    }
                }

                // Additional specializations
                if (allValues.specializationIds && allValues.specializationIds.length > 0) {
                    const additionalIds = allValues.specializationIds.map(id => {
                        if (hospitalSpecializations && hospitalSpecializations.length > 0) {
                            const hospitalSpec = hospitalSpecializations[id];
                            return hospitalSpec?.id || parseInt(id);
                        }
                        return parseInt(id);
                    }).filter(id => id !== undefined && id !== null && !isNaN(id) && !specializationIds.includes(id));

                    specializationIds = [...specializationIds, ...additionalIds];
                }

                console.log('🩺 ID chuyên khoa cuối cùng:', specializationIds);

                // Enhanced default specializations logic
                if (specializationIds.length === 0) {
                    console.warn('⚠️ Không có chuyên khoa nào được chọn');
                    
                    // Try to get first available specialization
                    if (hospitalSpecializations && hospitalSpecializations.length > 0) {
                        const firstSpec = hospitalSpecializations[0];
                        const defaultId = firstSpec.id || 1;
                        specializationIds = [defaultId];
                        console.log('📋 Sử dụng chuyên khoa đầu tiên:', defaultId);
                    } else {
                        specializationIds = [1]; // Fallback
                        console.log('📋 Sử dụng chuyên khoa mặc định: [1]');
                    }
                }

                // Format date properly
                const dobFormatted = allValues.dob
                    ? (typeof allValues.dob === 'string'
                        ? allValues.dob
                        : allValues.dob.format('YYYY-MM-DD'))
                    : null;

                // Prepare doctor data
                const doctorData = {
                    id: 0,
                    hospitalAffiliations: [
                        {
                            hospitalId: parseInt(hospitalId),
                            departmentId: parseInt(allValues.departmentId),
                            contractStart: new Date().toISOString(),
                            contractEnd: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(),
                            position: allValues.position?.trim() || "Bác sĩ"
                        }
                    ],
                    user: {
                        id: 0,
                        fullname: allValues.fullname?.trim() || "",
                        phoneNumber: allValues.phoneNumber?.trim() || "",
                        email: allValues.email?.trim() || `${allValues.phoneNumber}@hospital.com`,
                        avatarUrl: allValues.avatarUrl?.trim() || "",
                        dob: dobFormatted,
                        gender: allValues.gender === 'male',
                        job: "Bác sĩ",
                        cccd: allValues.cccd?.trim() || "",
                        province: allValues.province?.trim() || "",
                        ward: allValues.ward?.trim() || "",
                        streetAddress: allValues.streetAddress?.trim() || ""
                    },
                    description: allValues.description?.trim() || "",
                    practicingFrom: new Date().toISOString(),
                    specializationIds: specializationIds
                };

                console.log('🏥 Payload bác sĩ cuối cùng:', JSON.stringify(doctorData, null, 2));

                // Enhanced validation with better error messages
                if (!doctorData.user.fullname) {
                    const errorMsg = 'Họ tên là bắt buộc';
                    dispatch(setMessage({ type: 'error', content: errorMsg }));
                    throw new Error(errorMsg);
                }
                if (!doctorData.user.phoneNumber) {
                    const errorMsg = 'Số điện thoại là bắt buộc';
                    dispatch(setMessage({ type: 'error', content: errorMsg }));
                    throw new Error(errorMsg);
                }
                if (!doctorData.hospitalAffiliations[0].hospitalId) {
                    const errorMsg = 'ID bệnh viện là bắt buộc';
                    dispatch(setMessage({ type: 'error', content: errorMsg }));
                    throw new Error(errorMsg);
                }
                if (!doctorData.hospitalAffiliations[0].departmentId) {
                    const errorMsg = 'ID khoa là bắt buộc';
                    dispatch(setMessage({ type: 'error', content: errorMsg }));
                    throw new Error(errorMsg);
                }
                if (!doctorData.specializationIds.length) {
                    const errorMsg = 'Ít nhất một chuyên khoa là bắt buộc';
                    dispatch(setMessage({ type: 'error', content: errorMsg }));
                    throw new Error(errorMsg);
                }

                console.log('✅ Tất cả xác thực đã thành công, đang gọi API...');

                // Show loading message
                dispatch(setMessage({
                    type: 'loading',
                    content: 'Đang tạo tài khoản bác sĩ...'
                }));

                // Call API với enhanced logging
                let response;
                try {
                    console.log('🌐 Chuẩn bị gọi API createDoctor...');
                    response = await createDoctor(doctorData);
                    console.log('📥 createDoctor trả về:', response);
                } catch (apiError) {
                    console.error('🔥 Lỗi API đã được bắt:', apiError);
                    console.error('🔥 Chi tiết lỗi API:', {
                        message: apiError.message,
                        status: apiError.response?.status,
                        data: apiError.response?.data,
                        headers: apiError.response?.headers
                    });

                    throw apiError; // Re-throw để handle ở catch bên ngoài
                }

                // Check response với logging chi tiết
                console.log('🔍 Đang kiểm tra phản hồi thành công...');
                console.log('- response:', response);
                console.log('- response === true:', response === true);
                console.log('- response?.success:', response?.success);
                console.log('- response?.status:', response?.status);

                const isSuccess = (
                    response === true ||
                    response?.success === true ||
                    response?.success !== false ||
                    (response?.status >= 200 && response?.status < 300) ||
                    response?.message?.toLowerCase().includes('success') ||
                    response?.result ||
                    (!response?.error && response !== false && response !== null)
                );

                console.log('🎯 isSuccess được xác định là:', isSuccess);

                if (isSuccess) {
                    console.log('✅ Tạo bác sĩ thành công');

                    // Show success message
                    dispatch(setMessage({
                        type: 'success',
                        content: '🎉 Tạo bác sĩ thành công!'
                    }));

                    // Reset form
                    form.resetFields();
                    setFileList([]);
                    setCurrentStep(0);
                    setFormData({});
                    setSelectedProvince(null);
                    setWards([]);

                    // Close modal sau một chút delay để user thấy success message
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);

                } else {
                    const errorMessage = response?.message || response?.error || response?.title || 'Tạo bác sĩ thất bại';
                    console.error('❌ Tạo thất bại với thông báo:', errorMessage);

                    // Show error message
                    dispatch(setMessage({
                        type: 'error',
                        content: `❌ ${errorMessage}`
                    }));

                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            console.error('❌ Lỗi trong handleSubmit:', error);
            console.error('🔍 Error stack:', error.stack);

            let errorMessage = `Không thể tạo ${staffType === 'doctor' ? 'bác sĩ' : 'điều dưỡng'}. Vui lòng thử lại.`;

            if (error.response?.data) {
                console.log('🔍 Chi tiết lỗi API:', error.response.data);

                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                } else if (error.response.data.errors) {
                    const validationErrors = Object.values(error.response.data.errors).flat();
                    errorMessage = validationErrors.join(', ');
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.log('📤 Hiển thị thông báo lỗi:', errorMessage);

            // Show error message
            dispatch(setMessage({
                type: 'error',
                content: `❌ ${errorMessage}`
            }));

        } finally {
            console.log('🏁 handleSubmit finally block');
            setLoading(false);
        }
    };

    const nextStep = async () => {
        try {
            let fieldsToValidate = [];

            switch (currentStep) {
                case 0:
                    fieldsToValidate = [
                        'fullname', 'phoneNumber', 'gender', 'dob', 'cccd',
                        'password', 'confirmPassword', 'province', 'ward', 'streetAddress'
                    ];
                    break;
                case 1:
                    fieldsToValidate = [
                        'description', 'position', 'departmentId', 'specialization'
                    ];
                    break;
                default:
                    break;
            }

            if (fieldsToValidate.length > 0) {
                const values = await form.validateFields(fieldsToValidate);
                console.log(`✅ Bước ${currentStep} đã xác thực giá trị:`, values);

                // Enhanced debug logging for specialization
                if (values.specialization !== undefined) {
                    console.log('🔍 Specialization validation in nextStep:', {
                        value: values.specialization,
                        type: typeof values.specialization,
                        isValid: values.specialization !== undefined && values.specialization !== null && values.specialization !== ''
                    });
                }

                setFormData(prev => ({
                    ...prev,
                    ...values
                }));

                console.log('💾 Dữ liệu form state đã cập nhật:', { ...formData, ...values });
            }

            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.log('❌ Xác thực bước thất bại:', error);

            const errorFields = error.errorFields || [];
            if (errorFields.length > 0) {
                const missingFields = errorFields.map(field => field.name[0]).join(', ');

                // Show validation error message
                dispatch(setMessage({
                    type: 'error',
                    content: `Vui lòng hoàn thành các trường sau: ${missingFields}`
                }));
            }
        }
    };

    const prevStep = () => {
        const currentValues = form.getFieldsValue();
        setFormData(prev => ({
            ...prev,
            ...currentValues
        }));

        setCurrentStep(currentStep - 1);
    };

    const handleUpload = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const steps = [
        {
            title: 'Thông tin cơ bản',
            description: 'Thông tin cá nhân',
            icon: <UserOutlined />
        },
        {
            title: 'Thông tin chuyên môn',
            description: 'Chi tiết công việc',
            icon: staffType === 'doctor' ? <MedicineBoxOutlined /> : <HeartOutlined />
        },
        {
            title: 'Xem lại',
            description: 'Xác nhận thông tin',
            icon: <CheckCircleOutlined />
        }
    ];

    const renderProfessionalStep = () => {
        const availableSpecializations = hospitalSpecializations && hospitalSpecializations.length > 0
            ? hospitalSpecializations
            : specializations || [];

        const availableDepartments = hospitalDepartments && hospitalDepartments.length > 0
            ? hospitalDepartments
            : departments || [];

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
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Thông tin chuyên môn
                </h3>

                <Alert
                    message={`Phân công bệnh viện: ${currentHospital?.name || user?.hospitals?.[0]?.name || 'Đang tải...'}`}
                    description={`Bác sĩ sẽ được tự động liên kết với ${currentHospital?.name || user?.hospitals?.[0]?.name || 'bệnh viện hiện tại'} (ID: ${user?.hospitals?.[0]?.id || currentHospital?.id || 'Đang tải...'}) và được phân công vào khoa đã chọn. Số khoa có sẵn: ${availableDepartments.length}`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="description"
                            label="Mô tả chuyên môn"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                        >
                            <Input.TextArea
                                placeholder="Bác sĩ tim mạch có kinh nghiệm 10+ năm trong y học cấp cứu..."
                                rows={3}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="position"
                            label="Chức vụ"
                            rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
                            initialValue="Bác sĩ"
                        >
                            <Select placeholder="Chọn chức vụ">
                                <Option value="Bác sĩ">👨‍⚕️ Bác sĩ</Option>
                                <Option value="Bác sĩ chính">👨‍⚕️ Bác sĩ chính</Option>
                                <Option value="Trưởng khoa">👨‍⚕️ Trưởng khoa</Option>
                                <Option value="Bác sĩ tư vấn">👨‍⚕️ Bác sĩ tư vấn</Option>
                                <Option value="Chuyên gia">👨‍⚕️ Chuyên gia</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="departmentId"
                            label="Khoa"
                            rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                        >
                            <Select placeholder="Chọn khoa" showSearch>
                                {availableDepartments?.map(dept => (
                                    <Option key={dept.id} value={dept.id}>
                                        🏥 {dept.name} (ID: {dept.id})
                                        {dept.description && ` - ${dept.description}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="specialization"
                            label="Chuyên khoa chính"
                            rules={[
                                { required: true, message: 'Vui lòng chọn chuyên khoa' },
                                // Custom validator to handle edge cases
                                {
                                    validator: (_, value) => {
                                        if (value === undefined || value === null || value === '') {
                                            return Promise.reject(new Error('Vui lòng chọn chuyên khoa'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Select placeholder="Chọn chuyên khoa" showSearch>
                                {availableSpecializations.map((spec, index) => (
                                    <Option key={index} value={index}>
                                        🩺 {typeof spec === 'string' ? spec : spec.name || spec.title}
                                        {typeof spec === 'object' && spec.id && ` (ID: ${spec.id})`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="specializationIds"
                            label="Chuyên khoa phụ (Tùy chọn)"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn chuyên khoa phụ"
                                showSearch
                            >
                                {availableSpecializations.map((spec, index) => (
                                    <Option key={index} value={index}>
                                        🩺 {typeof spec === 'string' ? spec : spec.name || spec.title}
                                        {typeof spec === 'object' && spec.id && ` (ID: ${spec.id})`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="contractDuration"
                            label="Thời hạn hợp đồng (Năm)"
                            initialValue={1}
                        >
                            <Select placeholder="Chọn thời hạn hợp đồng">
                                <Option value={1}>1 Năm</Option>
                                <Option value={2}>2 Năm</Option>
                                <Option value={3}>3 Năm</Option>
                                <Option value={5}>5 Năm</Option>
                                <Option value={10}>10 Năm</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 16, padding: 8, background: '#f0f0f0', fontSize: '12px' }}>
                    <strong>Thông tin Debug:</strong>
                    <br />ID Bệnh viện của User: {user?.hospitals?.[0]?.id || 'Không tìm thấy'}
                    <br />Tên Bệnh viện của User: {user?.hospitals?.[0]?.name || 'Không tìm thấy'}
                    <br />Khoa Bệnh viện: {hospitalDepartments?.length || 0} mục
                    <br />Chuyên khoa Bệnh viện: {hospitalSpecializations?.length || 0} mục
                    <br />Khoa dự phòng: {departments?.length || 0} mục
                    <br />Chuyên khoa dự phòng: {specializations?.length || 0} mục
                    <br />Đang sử dụng Khoa: {availableDepartments === hospitalDepartments ? 'Khoa bệnh viện' : 'Khoa dự phòng'}
                    <br />Đang sử dụng Chuyên khoa: {availableSpecializations === hospitalSpecializations ? 'Chuyên khoa bệnh viện' : 'Chuyên khoa dự phòng'}
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const currentValues = form.getFieldsValue();
        const allData = { ...formData, ...currentValues };

        console.log('📋 Dữ liệu xem lại:', allData);

        const availableDepartments = hospitalDepartments && hospitalDepartments.length > 0
            ? hospitalDepartments
            : departments || [];

        const selectedDepartment = availableDepartments?.find(d => d.id === allData.departmentId);

        const availableSpecializations = hospitalSpecializations && hospitalSpecializations.length > 0
            ? hospitalSpecializations
            : specializations || [];

        const primarySpecialization = availableSpecializations[allData.specialization];
        const primarySpecName = typeof primarySpecialization === 'string'
            ? primarySpecialization
            : primarySpecialization?.name || primarySpecialization?.title || 'Không rõ';

        const additionalSpecs = allData.specializationIds?.map(id => {
            const spec = availableSpecializations[id];
            return typeof spec === 'string' ? spec : spec?.name || spec?.title || 'Không rõ';
        }).filter(Boolean) || [];

        // Enhanced missing fields detection for review step
        const missingFields = [];
        if (!allData.fullname) missingFields.push('fullname');
        if (!allData.phoneNumber) missingFields.push('phoneNumber');
        if (!allData.password) missingFields.push('password');
        if (!allData.cccd) missingFields.push('cccd');
        if (!allData.gender) missingFields.push('gender');
        if (!allData.dob) missingFields.push('dob');
        if (!allData.province) missingFields.push('province');
        if (!allData.ward) missingFields.push('ward');
        if (!allData.streetAddress) missingFields.push('streetAddress');
        if (!allData.description) missingFields.push('description');
        if (!allData.position) missingFields.push('position');
        if (!allData.departmentId) missingFields.push('departmentId');
        
        // Fix specialization check in review step
        if (allData.specialization === undefined || allData.specialization === null || allData.specialization === '') {
            missingFields.push('specialization');
        }

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
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Xem lại thông tin
                </h3>

                <Alert
                    message="Vui lòng xem lại tất cả thông tin trước khi tạo tài khoản"
                    description="Đảm bảo tất cả thông tin đều chính xác vì một số thông tin không thể thay đổi sau này."
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                />

                <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <Row gutter={32}>
                            <Col span={12}>
                                <h4 style={{ color: '#1890ff', marginBottom: 12 }}>👤 Thông tin cá nhân</h4>
                                <p><strong>Họ tên:</strong> {allData.fullname || 'Chưa cung cấp'}</p>
                                <p><strong>Điện thoại:</strong> {allData.phoneNumber || 'Chưa cung cấp'}</p>
                                <p><strong>Giới tính:</strong> {allData.gender === 'male' ? '👨 Nam' : allData.gender === 'female' ? '👩 Nữ' : 'Chưa chọn'}</p>
                                <p><strong>CCCD:</strong> {allData.cccd || 'Chưa cung cấp'}</p>
                                <p><strong>Ngày sinh:</strong> {allData.dob ? (typeof allData.dob === 'string' ? allData.dob : allData.dob.format('DD/MM/YYYY')) : 'Chưa cung cấp'}</p>
                                <p><strong>Địa chỉ:</strong> {[allData.streetAddress, allData.ward, allData.province].filter(Boolean).join(', ') || 'Chưa cung cấp'}</p>
                            </Col>
                            <Col span={12}>
                                <h4 style={{ color: '#1890ff', marginBottom: 12 }}>🏥 Thông tin chuyên môn</h4>
                                <p><strong>Bệnh viện:</strong> {currentHospital?.name || user?.hospitals?.[0]?.name || 'Đang tải...'} (ID: {user?.hospitals?.[0]?.id || currentHospital?.id || 'N/A'})</p>
                                <p><strong>Khoa:</strong> {selectedDepartment?.name || 'Chưa chọn'} (ID: {allData.departmentId || 'N/A'})</p>
                                <p><strong>Chức vụ:</strong> {allData.position || 'Chưa chọn'}</p>
                                <p><strong>Chuyên khoa chính:</strong> {primarySpecName}</p>
                                {additionalSpecs.length > 0 && (
                                    <p><strong>Chuyên khoa phụ:</strong> {additionalSpecs.join(', ')}</p>
                                )}
                                <p><strong>Mô tả:</strong> {allData.description ? `${allData.description.substring(0, 100)}...` : 'Chưa cung cấp'}</p>

                                <div style={{ marginTop: 16, padding: 8, background: '#f0f0f0', fontSize: '12px' }}>
                                    <strong>Xem trước API Payload:</strong>
                                    <br />ID Bệnh viện: {user?.hospitals?.[0]?.id || currentHospital?.id || 105}
                                    <br />ID Khoa: {allData.departmentId || 'Chưa chọn'}
                                    <br />Tên Khoa: {selectedDepartment?.name || 'Không tìm thấy'}
                                    <br />ID Chuyên khoa: {(() => {
                                        const primaryId = allData.specialization !== undefined ? 
                                            (availableSpecializations[allData.specialization]?.id || allData.specialization) : undefined;
                                        const additionalIds = (allData.specializationIds || []).map(id => 
                                            availableSpecializations[id]?.id || id
                                        );
                                        const allIds = [primaryId, ...additionalIds].filter(id => id !== undefined);
                                        return allIds.join(', ') || 'Không có';
                                    })()}
                                    <br />Thiếu bắt buộc: {missingFields.join(', ') || 'Không có'}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div style={{
                        marginBottom: 32,
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e8e8e8'
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
                                    <Input placeholder="BS. Nguyễn Văn A" />
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
                                    {/* ✅ Enhanced DatePicker with Vietnamese locale */}
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder="Chọn ngày sinh"
                                        format="DD/MM/YYYY"  // ✅ Vietnamese date format
                                        locale={locale.DatePicker}
                                        disabledDate={(current) => {
                                            return current && current > dayjs().endOf('day');
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
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="avatarUrl"
                                    label="URL ảnh đại diện"
                                >
                                    <Input placeholder="https://example.com/photo.jpg" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="job"
                                    label="Chức danh nghề nghiệp"
                                    initialValue="Bác sĩ"
                                >
                                    <Input placeholder="Bác sĩ" disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Updated Province and Ward selection */}
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="province"
                                    label="Tỉnh/Thành phố"
                                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                                >
                                    <Select
                                        placeholder="Chọn tỉnh/thành phố"
                                        showSearch
                                        loading={loadingProvinces}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={provinces.map((p) => ({
                                            label: p.province,
                                            value: p.province,
                                        }))}
                                        allowClear
                                        onSelect={(value) => {
                                            console.log("🏙️ Đã chọn tỉnh:", value);
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="ward"
                                    label="Quận/Huyện"
                                    rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                                >
                                    <Select
                                        placeholder={
                                            selectedProvince
                                                ? "Chọn quận/huyện"
                                                : "Chọn tỉnh/thành phố trước"
                                        }
                                        showSearch
                                        disabled={!selectedProvince}
                                        loading={selectedProvince && wards.length === 0}
                                        options={wards.map((w) => ({
                                            label: w.name,
                                            value: w.name
                                        }))}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        allowClear
                                        onSelect={(value) => {
                                            console.log("🏘️ Đã chọn quận/huyện:", value);
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="streetAddress"
                                    label="Số nhà, đường"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                >
                                    <Input placeholder="123 Đường Nguyễn Huệ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Debug info for provinces (remove in production) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div style={{
                                background: "#f0f0f0",
                                padding: 12,
                                borderRadius: 6,
                                fontSize: '12px',
                                marginTop: 16
                            }}>
                                <strong>🔍 Thông tin Debug Tỉnh thành:</strong><br />
                                Đã tải tỉnh thành: {provinces.length}<br />
                                Tỉnh được chọn: {selectedProvince || "Không có"}<br />
                                Quận/huyện có sẵn: {wards.length}<br />
                                Đang tải tỉnh thành: {loadingProvinces ? "Có" : "Không"}
                            </div>
                        )}
                    </div>
                );

            case 1:
                return renderProfessionalStep();

            case 2:
                return renderReviewStep();

            default:
                return null;
        }
    };

    return (
        <>
            {contextHolder}
            
            {/* ✅ ConfigProvider with Vietnamese locale */}
            <ConfigProvider locale={locale}>
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserAddOutlined style={{
                                color: staffType === 'doctor' ? '#1890ff' : '#52c41a',
                                marginRight: 8,
                                fontSize: '20px'
                            }} />
                            <span style={{ fontSize: '18px', fontWeight: 600 }}>
                                Thêm {staffType === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'} mới
                            </span>
                        </div>
                    }
                    open={visible}
                    onCancel={onCancel}
                    footer={null}
                    width={1100}
                    destroyOnClose
                    style={{ top: 20 }}
                >
                    <Spin spinning={loading}>
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
                                onValuesChange={onFormValuesChange}
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
                                            <Button onClick={prevStep} size="large">
                                                Quay lại
                                            </Button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <Button onClick={onCancel} size="large">
                                            Hủy
                                        </Button>

                                        {currentStep < steps.length - 1 ? (
                                            <Button
                                                type="primary"
                                                onClick={nextStep}
                                                size="large"
                                                style={{
                                                    backgroundColor: staffType === 'doctor' ? '#1890ff' : '#52c41a',
                                                    borderColor: staffType === 'doctor' ? '#1890ff' : '#52c41a'
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
                                                    backgroundColor: staffType === 'doctor' ? '#1890ff' : '#52c41a',
                                                    borderColor: staffType === 'doctor' ? '#1890ff' : '#52c41a'
                                                }}
                                            >
                                                Tạo {staffType === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'}
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

export default AddStaff;