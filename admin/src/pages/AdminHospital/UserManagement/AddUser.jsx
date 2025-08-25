import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker, message } from 'antd';
import { UserAddOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
import { createUser } from '../../../services/userService';
import { getProvinces, getDistricts, getWards } from '../../../services/provinceService';
import { getAllHospitals } from '../../../services/hospitalService';
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import dayjs from 'dayjs';

const { Option } = Select;

const AddUser = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    // ✅ Redux hooks
    const dispatch = useDispatch();
    const messageState = useSelector(state => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    // ✅ State cho dropdown options
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // ✅ NEW: State to track selected role
    const [selectedRole, setSelectedRole] = useState(null);
    const [isPatientRole, setIsPatientRole] = useState(false);

    // ✅ Cập nhật danh sách vai trò theo roleType từ API
    const roles = [
        { id: 1, name: 'Người dùng', roleType: 1 },

        { id: 4, name: 'Quản trị viên Bệnh viện', roleType: 4 },

        { id: 6, name: 'Bệnh nhân', roleType: 6 }, // ✅ Patient role
        { id: 7, name: 'Y tá', roleType: 7 }
    ];

    // ✅ NEW: Handle role change to check if Patient is selected
    const handleRoleChange = (roleId) => {
        console.log('🎭 Role selected:', roleId);
        const role = roles.find(r => r.id === roleId);
        setSelectedRole(role);

        // ✅ Check if selected role is Patient (roleType: 6)
        const isPatient = role?.roleType === 6;
        setIsPatientRole(isPatient);

        if (isPatient) {
            console.log('👤 Patient role detected - clearing hospital/department data');
            // ✅ Clear hospital and department fields when Patient is selected
            form.setFieldsValue({
                hospitalId: undefined,
                departmentId: undefined
            });
            setSelectedHospitalId(null);
            setDepartments([]);
        }

        console.log('🔍 Is Patient Role:', isPatient);
    };

    // ✅ Updated message handler using messageApi pattern
    useEffect(() => {
        if (messageState && messageState.content) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    // ✅ Helper function để tạo unique key
    const createUniqueKey = (item, index, prefix = 'item') => {
        if (item?.id && item.id !== null && item.id !== undefined) {
            return `${prefix}-${item.id}`;
        }
        if (item?.code && item.code !== null && item.code !== undefined) {
            return `${prefix}-${item.code}`;
        }
        if (item?.province || item?.name) {
            const name = item.province || item.name;
            return `${prefix}-${name.replace(/\s+/g, '-')}-${index}`;
        }
        return `${prefix}-${index}`;
    };

    // ✅ Debug useEffect để kiểm tra location state
    useEffect(() => {
        console.log('🔍 AddUser location state updated:', {
            provincesCount: provinces.length,
            districtsCount: districts.length,
            wardsCount: wards.length,
            selectedProvince,
            selectedDistrict,
            selectedRole: selectedRole?.name,
            isPatientRole,
            loadingStates: {
                provinces: loadingProvinces,
                districts: loadingDistricts,
                wards: loadingWards
            }
        });
    }, [provinces, districts, wards, selectedProvince, selectedDistrict, selectedRole, isPatientRole, loadingProvinces, loadingDistricts, loadingWards]);

    // ✅ Fetch provinces và reset data khi modal mở
    useEffect(() => {
        if (visible) {
            console.log('👀 Modal opened, starting to fetch data...');
            dispatch(clearMessage());

            fetchProvinces();
            fetchHospitals();

            // Reset form when modal opens
            form.resetFields();
            setSelectedHospitalId(null);
            setDepartments([]);
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setDistricts([]);
            setWards([]);
            setSelectedRole(null);
            setIsPatientRole(false);
        } else {
            console.log('👁️ Modal closed');
            dispatch(clearMessage());
        }
    }, [visible, dispatch, form]);

    // ✅ Fetch provinces using your actual service - Enhanced error handling
    const fetchProvinces = async () => {
        setLoadingProvinces(true);
        try {
            console.log('🔄 Fetching provinces using your API service...');
            const provincesData = await getProvinces();
            console.log('🌏 Raw provinces data from your API:', provincesData);

            // ✅ Handle your API response format
            let processedProvinces = [];

            if (Array.isArray(provincesData)) {
                processedProvinces = provincesData;
                console.log('✅ Using direct array format');
            } else if (provincesData?.data && Array.isArray(provincesData.data)) {
                processedProvinces = provincesData.data;
                console.log('✅ Using data array format');
            } else if (provincesData?.results && Array.isArray(provincesData.results)) {
                processedProvinces = provincesData.results;
                console.log('✅ Using results array format');
            } else {
                console.warn('⚠️ Unexpected provinces data format:', provincesData);
                processedProvinces = [];
            }

            // ✅ Filter và clean data để tránh duplicate keys
            const cleanedProvinces = processedProvinces
                .filter((province, index) => {
                    if (!province) {
                        console.warn(`⚠️ Null province at index ${index}`);
                        return false;
                    }
                    if (!province.province && !province.name && !province.id) {
                        console.warn(`⚠️ Province missing required fields at index ${index}:`, province);
                        return false;
                    }
                    return true;
                })
                .map((province, index) => ({
                    ...province,
                    id: province.id || `province-${index}`,
                    code: province.id || `province-${index}`,
                    name: province.province || province.name || `Province ${index + 1}`,
                    province: province.province || province.name || `Province ${index + 1}`,
                    uniqueKey: createUniqueKey(province, index, 'province')
                }));

            console.log('📋 Processed provinces:', cleanedProvinces);
            setProvinces(cleanedProvinces);

            if (cleanedProvinces.length > 0) {
                console.log('🎉 Provinces loaded successfully!', cleanedProvinces.length, 'provinces');
            } else {
                console.warn('⚠️ No provinces found after processing');
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy dữ liệu tỉnh/thành phố'
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching provinces:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách tỉnh/thành phố'
            }));
            setProvinces([]);
        } finally {
            setLoadingProvinces(false);
        }
    };

    // ✅ Fetch districts by province code - Enhanced error handling
    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) {
            setDistricts([]);
            return;
        }

        setLoadingDistricts(true);
        try {
            console.log('🔄 Fetching districts for province code:', provinceCode);
            const districtsData = await getDistricts(provinceCode);
            console.log('🏘️ Raw districts data from your API:', districtsData);

            const rawDistricts = Array.isArray(districtsData) ? districtsData : [];

            const cleanedDistricts = rawDistricts
                .filter((district, index) => {
                    if (!district) {
                        console.warn(`⚠️ Null district at index ${index}`);
                        return false;
                    }
                    if (!district.district && !district.name && !district.id) {
                        console.warn(`⚠️ District missing required fields at index ${index}:`, district);
                        return false;
                    }
                    return true;
                })
                .map((district, index) => ({
                    ...district,
                    id: district.id || `district-${index}`,
                    code: district.id || `district-${index}`,
                    name: district.district || district.name || `District ${index + 1}`,
                    district: district.district || district.name || `District ${index + 1}`,
                    uniqueKey: createUniqueKey(district, index, 'district')
                }));

            console.log('📋 Processed districts:', cleanedDistricts);
            setDistricts(cleanedDistricts);

            if (cleanedDistricts.length === 0) {
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy quận/huyện cho tỉnh này'
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching districts:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách quận/huyện'
            }));
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // ✅ Fetch wards by district code - Enhanced error handling
    const fetchWards = async (districtCode) => {
        if (!districtCode) {
            setWards([]);
            return;
        }

        setLoadingWards(true);
        try {
            console.log('🔄 Fetching wards for district code:', districtCode);
            const wardsData = await getWards(districtCode);
            console.log('🏠 Raw wards data from your API:', wardsData);

            const rawWards = Array.isArray(wardsData) ? wardsData : [];

            const cleanedWards = rawWards
                .filter((ward, index) => {
                    if (!ward) {
                        console.warn(`⚠️ Null ward at index ${index}`);
                        return false;
                    }
                    if (!ward.ward && !ward.name && !ward.id) {
                        console.warn(`⚠️ Ward missing required fields at index ${index}:`, ward);
                        return false;
                    }
                    return true;
                })
                .map((ward, index) => ({
                    ...ward,
                    id: ward.id || `ward-${index}`,
                    code: ward.id || `ward-${index}`,
                    name: ward.ward || ward.name || `Ward ${index + 1}`,
                    ward: ward.ward || ward.name || `Ward ${index + 1}`,
                    uniqueKey: createUniqueKey(ward, index, 'ward')
                }));

            console.log('📋 Processed wards:', cleanedWards);
            setWards(cleanedWards);

            if (cleanedWards.length === 0) {
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy phường/xã cho quận/huyện này'
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching wards:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách phường/xã'
            }));
            setWards([]);
        } finally {
            setLoadingWards(false);
        }
    };

    // ✅ Fetch hospitals - Enhanced error handling
    const fetchHospitals = async () => {
        setLoadingHospitals(true);
        try {
            const hospitalsData = await getAllHospitals();
            console.log('🏥 Hospitals data:', hospitalsData);

            let processedHospitals = [];
            if (Array.isArray(hospitalsData)) {
                processedHospitals = hospitalsData;
            } else if (hospitalsData?.result && Array.isArray(hospitalsData.result)) {
                processedHospitals = hospitalsData.result;
            } else {
                console.warn('Unexpected hospitals data format:', hospitalsData);
                processedHospitals = [];
            }

            setHospitals(processedHospitals);

            if (processedHospitals.length === 0) {
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy dữ liệu bệnh viện'
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching hospitals:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách bệnh viện'
            }));
            setHospitals([]);
        } finally {
            setLoadingHospitals(false);
        }
    };

    // ✅ Fetch departments - Enhanced error handling
    const fetchDepartments = async (hospitalId) => {
        if (!hospitalId) {
            setDepartments([]);
            return;
        }

        setLoadingDepartments(true);
        try {
            const departmentsData = await getDepartmentsByHospitalId(hospitalId);
            console.log(`🏭 Departments data for hospital ${hospitalId}:`, departmentsData);

            let processedDepartments = [];
            if (Array.isArray(departmentsData)) {
                processedDepartments = departmentsData;
            } else if (departmentsData?.result && Array.isArray(departmentsData.result)) {
                processedDepartments = departmentsData.result;
            } else {
                console.warn('Unexpected departments data format:', departmentsData);
                processedDepartments = [];
            }

            setDepartments(processedDepartments);

            if (processedDepartments.length === 0) {
                dispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Bệnh viện này chưa có khoa/phòng ban nào'
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching departments:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải danh sách khoa'
            }));
            setDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    };

    // ✅ Handle hospital selection change
    const handleHospitalChange = (hospitalId) => {
        console.log('🏥 Hospital selected:', hospitalId);
        setSelectedHospitalId(hospitalId);
        form.setFieldsValue({ departmentId: undefined });
        fetchDepartments(hospitalId);
    };

    // ✅ Enhanced province change handler with districts fetching
    const handleProvinceChange = (provinceId) => {
        console.log('🌏 Province selected:', provinceId);
        setSelectedProvince(provinceId);

        form.setFieldsValue({
            district: undefined,
            ward: undefined
        });
        setSelectedDistrict(null);
        setWards([]);

        fetchDistricts(provinceId);
    };

    // ✅ Enhanced district change handler with wards fetching  
    const handleDistrictChange = (districtId) => {
        console.log('🏘️ District selected:', districtId);
        setSelectedDistrict(districtId);

        form.setFieldsValue({ ward: undefined });

        fetchWards(districtId);
    };

    // ✅ Handle ward selection
    const handleWardChange = (wardId) => {
        console.log('🏠 Ward selected:', wardId);
    };

    // ✅ Enhanced submit handler with improved error handling for API response format
    const handleSubmit = async (values) => {
        setLoading(true);
        dispatch(clearMessage());

        try {
            dispatch(setMessage({
                type: 'info',
                content: '⏳ Đang xử lý thông tin người dùng...'
            }));

            const currentSelectedRole = roles.find(role => role.id === values.roleId);

            // ✅ Get selected location names for payload
            const selectedProvinceObj = provinces.find(p => p.id === values.province || p.code === values.province);
            const selectedDistrictObj = districts.find(d => d.id === values.district || d.code === values.district);
            const selectedWardObj = wards.find(w => w.id === values.ward || w.code === values.ward);

            // ✅ Validation before API call
            if (!currentSelectedRole) {
                throw new Error('Vai trò được chọn không hợp lệ');
            }

            // ✅ Only validate hospital/department if NOT Patient role
            const isCurrentPatient = currentSelectedRole?.roleType === 6;
            if (!isCurrentPatient && !values.hospitalId) {
                throw new Error('Vui lòng chọn bệnh viện');
            }

            // ✅ Create payload with different logic for Patient
            const userData = {
                roleType: currentSelectedRole?.roleType || 1,
                fullname: values.fullname.trim(),
                phoneNumber: values.phoneNumber?.trim() || "",
                email: values.email.trim(),
                password: values.password,
                avatarUrl: "",
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                gender: values.gender === 'male',
                job: values.job?.trim() || "",
                cccd: values.cccd?.trim() || "",
                province: selectedProvinceObj?.name || selectedProvinceObj?.province || values.province || "",
                district: selectedDistrictObj?.name || selectedDistrictObj?.district || values.district || "",
                ward: selectedWardObj?.name || selectedWardObj?.ward || values.ward || "",
                streetAddress: values.streetAddress?.trim() || ""
            };

            // ✅ Only add hospital/department data if NOT Patient role
            if (!isCurrentPatient) {
                userData.hospitalId = values.hospitalId || 0;
                userData.departmentId = values.departmentId || 0;
            } else {
                console.log('👤 Creating Patient - omitting hospital/department data');
                userData.hospitalId = 0;
                userData.departmentId = 0;
            }

            console.log('📤 Payload gửi đến API:', userData);
            console.log('🎭 Role Type:', currentSelectedRole?.roleType, '- Is Patient:', isCurrentPatient);

            const response = await createUser(userData);
            console.log('📥 Phản hồi từ API:', response);

            // ✅ Enhanced success validation
            if (response?.success || response?.result || response?.id) {
                const roleText = isCurrentPatient ? 'Bệnh nhân' : currentSelectedRole.name;
                dispatch(setMessage({
                    type: 'success',
                    content: `🎉 Tạo ${roleText.toLowerCase()} "${userData.fullname}" thành công!`
                }));

                // ✅ Reset form và state
                form.resetFields();
                setSelectedHospitalId(null);
                setDepartments([]);
                setSelectedProvince(null);
                setSelectedDistrict(null);
                setDistricts([]);
                setWards([]);
                setSelectedRole(null);
                setIsPatientRole(false);

                // ✅ Call parent success callback
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response, { shouldReload: true });
                }

                // ✅ Auto close modal after success
                setTimeout(() => {
                    handleCancel();
                }, 1500);
            } else {
                throw new Error('Phản hồi không hợp lệ từ server');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tạo người dùng:', error);

            let errorMessage = 'Không thể tạo người dùng. Vui lòng thử lại.';

            // ✅ Enhanced error handling for your API response format
            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('🔍 Error response data:', errorData);

                // ✅ Handle specific error titles from your API
                if (errorData.title) {
                    switch (errorData.title) {
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = '📱 Số điện thoại này đã được đăng ký!\nVui lòng sử dụng số điện thoại khác.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = '📧 Email này đã được đăng ký!\nVui lòng sử dụng email khác.';
                            break;
                        case 'CCCD_ALREADY_EXISTS':
                            errorMessage = '🆔 Số CCCD này đã được đăng ký!\nVui lòng kiểm tra lại số CCCD.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage = '⚠️ Dữ liệu không hợp lệ!\nVui lòng kiểm tra lại thông tin đã nhập.';
                            break;
                        case 'UNAUTHORIZED':
                            errorMessage = '🔒 Không có quyền thực hiện thao tác này!\nVui lòng đăng nhập lại.';
                            break;
                        case 'SERVER_ERROR':
                            errorMessage = '🔥 Lỗi hệ thống!\nVui lòng thử lại sau ít phút.';
                            break;
                        default:
                            errorMessage = `❌ ${errorData.title.replace(/_/g, ' ')}\n${errorData.message || 'Vui lòng thử lại.'}`;
                            break;
                    }
                } else if (errorData.message) {
                    errorMessage = `❌ ${errorData.message}`;
                }

                // ✅ Handle validation errors object
                if (errorData.errors && typeof errorData.errors === 'object') {
                    const errorFields = Object.keys(errorData.errors);
                    if (errorFields.length > 0) {
                        const fieldErrors = errorFields.map(field =>
                            `• ${field}: ${errorData.errors[field]}`
                        ).join('\n');
                        errorMessage += `\n\nChi tiết lỗi:\n${fieldErrors}`;
                    }
                }

                // ✅ Add status code if available
                if (errorData.status) {
                    errorMessage += `\n\nMã lỗi: ${errorData.status}`;
                }
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }

            // ✅ Network errors
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                errorMessage = '🌐 Lỗi kết nối mạng!\nVui lòng kiểm tra kết nối internet và thử lại.';
            }

            // ✅ Display error message using Redux
            dispatch(setMessage({
                type: 'error',
                content: errorMessage
            }));

        } finally {
            setLoading(false);
        }
    };

    // ✅ Enhanced cancel handler
    const handleCancel = () => {
        dispatch(clearMessage());

        form.resetFields();
        setSelectedHospitalId(null);
        setDepartments([]);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setDistricts([]);
        setWards([]);
        setSelectedRole(null);
        setIsPatientRole(false);

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
                        <UserAddOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Thêm Người dùng mới
                        {selectedRole && (
                            <span style={{
                                marginLeft: 12,
                                padding: '2px 8px',
                                background: isPatientRole ? '#fff7e6' : '#e6f7ff',
                                color: isPatientRole ? '#fa8c16' : '#1890ff',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'normal'
                            }}>
                                {selectedRole.name}
                            </span>
                        )}
                    </div>
                }
                open={visible}
                onCancel={handleCancel}
                footer={null}
                width={1000}
                destroyOnClose
                maskClosable={false}
            >
                <Spin spinning={loading} tip="Đang tạo người dùng...">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            gender: 'female',
                            dob: dayjs().subtract(25, 'years')
                        }}
                        scrollToFirstError
                    >
                        {/* ✅ Patient role notification */}
                        {isPatientRole && (
                            <div style={{
                                marginBottom: 24,
                                padding: '12px 16px',
                                background: '#fff7e6',
                                borderRadius: '6px',
                                border: '1px solid #ffd591',
                                fontSize: '13px'
                            }}>
                                <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                                    👤 Tạo tài khoản Bệnh nhân
                                </div>
                                <div style={{ color: '#666', lineHeight: '1.4' }}>
                                    Bệnh nhân không cần thông tin bệnh viện và khoa/phòng ban. Các trường này sẽ được ẩn và không gửi lên server.
                                </div>
                            </div>
                        )}

                        {/* ✅ Thông tin tài khoản */}
                        <div style={{ marginBottom: 24 }}>
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
                                                            - Không cần thông tin BV
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
                                        label="Mật khẩu"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input.Password placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
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
                                        hasFeedback
                                    >
                                        <Input.Password placeholder="Xác nhận mật khẩu" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* ✅ Conditionally render hospital info section */}
                        {!isPatientRole && (
                            <div style={{ marginBottom: 24 }}>
                                <h4 style={{ color: '#1890ff', marginBottom: 16 }}>🏥 Thông tin cơ quan</h4>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="hospitalId"
                                            label="Bệnh viện"
                                            rules={[{ required: true, message: 'Vui lòng chọn bệnh viện' }]}
                                            hasFeedback
                                        >
                                            <Select
                                                placeholder="Chọn bệnh viện"
                                                loading={loadingHospitals}
                                                onChange={handleHospitalChange}
                                                showSearch
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {hospitals.map(hospital => (
                                                    <Option key={hospital.id} value={hospital.id}>
                                                        {hospital.name} - {hospital.address || 'Không có địa chỉ'}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="departmentId"
                                            label="Khoa/Phòng ban"
                                            rules={[{ required: false, message: 'Vui lòng chọn khoa' }]}
                                            hasFeedback
                                        >
                                            <Select
                                                placeholder={selectedHospitalId ? "Chọn khoa/phòng ban" : "Vui lòng chọn bệnh viện trước"}
                                                loading={loadingDepartments}
                                                disabled={!selectedHospitalId}
                                                showSearch
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                <Option value={0}>Chưa phân khoa</Option>
                                                {departments.map(department => (
                                                    <Option key={department.id} value={department.id}>
                                                        {department.name} {department.description && `- ${department.description}`}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {/* ✅ Thông tin cá nhân */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ color: '#1890ff', marginBottom: 16 }}>👤 Thông tin cá nhân</h4>

                            <Form.Item
                                name="fullname"
                                label="Họ và tên"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên' },
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
                                                required: true,
                                                pattern: /^[0-9]{10,11}$/,
                                                message: 'Số điện thoại phải có 10-11 chữ số'
                                            }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input placeholder="Nhập số điện thoại (10-11 chữ số)" />
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
                                            <Option value="male">Nam (true)</Option>
                                            <Option value="female">Nữ (false)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="dob"
                                        label="Ngày sinh"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày sinh' },
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
                                        label="Số CCCD/CMND"
                                        rules={[
                                            {
                                                required: true,
                                                pattern: /^[0-9]{9,12}$/,
                                                message: 'CCCD phải có 9-12 chữ số'
                                            }
                                        ]}
                                        hasFeedback
                                    >
                                        <Input placeholder="Nhập số CCCD/CMND (9-12 chữ số)" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* ✅ Thông tin địa chỉ */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ color: '#1890ff', marginBottom: 16 }}>📍 Thông tin địa chỉ</h4>

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
                                            placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                                            loading={loadingProvinces}
                                            onChange={handleProvinceChange}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            allowClear
                                            notFoundContent={
                                                loadingProvinces ?
                                                    "Đang tải..." :
                                                    provinces.length === 0 ?
                                                        "Không có dữ liệu tỉnh thành" :
                                                        "Không tìm thấy"
                                            }
                                        >
                                            {provinces.map((province, index) => (
                                                <Option
                                                    key={province.uniqueKey || createUniqueKey(province, index, 'province')}
                                                    value={province.id || province.code}
                                                >
                                                    {province.name || province.province}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="district"
                                        label="Quận/Huyện"
                                        rules={[
                                            { max: 50, message: 'Quận/Huyện không được vượt quá 50 ký tự' }
                                        ]}
                                    >
                                        <Select
                                            placeholder={
                                                selectedProvince ?
                                                    (loadingDistricts ? "Đang tải..." : "Chọn quận/huyện") :
                                                    "Vui lòng chọn tỉnh/thành phố trước"
                                            }
                                            loading={loadingDistricts}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            allowClear
                                            notFoundContent={
                                                loadingDistricts ?
                                                    "Đang tải..." :
                                                    !selectedProvince ?
                                                        "Vui lòng chọn tỉnh/thành phố trước" :
                                                        districts.length === 0 ?
                                                            "Không có dữ liệu quận/huyện" :
                                                            "Không tìm thấy"
                                            }
                                        >
                                            {districts.map((district, index) => (
                                                <Option
                                                    key={district.uniqueKey || createUniqueKey(district, index, 'district')}
                                                    value={district.id || district.code}
                                                >
                                                    {district.name || district.district}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="ward"
                                        label="Phường/Xã"
                                        rules={[
                                            { max: 50, message: 'Phường/Xã không được vượt quá 50 ký tự' }
                                        ]}
                                    >
                                        <Select
                                            placeholder={
                                                selectedDistrict ?
                                                    (loadingWards ? "Đang tải..." : "Chọn phường/xã") :
                                                    "Vui lòng chọn quận/huyện trước"
                                            }
                                            loading={loadingWards}
                                            onChange={handleWardChange}
                                            disabled={!selectedDistrict}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            allowClear
                                            notFoundContent={
                                                loadingWards ?
                                                    "Đang tải..." :
                                                    !selectedDistrict ?
                                                        "Vui lòng chọn quận/huyện trước" :
                                                        wards.length === 0 ?
                                                            "Không có dữ liệu phường/xã" :
                                                            "Không tìm thấy"
                                            }
                                        >
                                            {wards.map((ward, index) => (
                                                <Option
                                                    key={ward.uniqueKey || createUniqueKey(ward, index, 'ward')}
                                                    value={ward.id || ward.code}
                                                >
                                                    {ward.name || ward.ward}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="streetAddress"
                                        label="Địa chỉ cụ thể"
                                        rules={[
                                            { max: 200, message: 'Địa chỉ không được vượt quá 200 ký tự' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập số nhà, tên đường..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* ✅ Updated notes with Patient info */}
                        <div style={{
                            marginBottom: 24,
                            padding: '12px 16px',
                            background: '#f6ffed',
                            borderRadius: '6px',
                            border: '1px solid #b7eb8f',
                            fontSize: '13px'
                        }}>
                            <div style={{ color: '#389e0d', fontWeight: 500, marginBottom: 4 }}>
                                💡 Lưu ý khi tạo người dùng:
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4' }}>
                                • <strong>Vai trò Bệnh nhân</strong> không cần thông tin bệnh viện và khoa/phòng ban<br />
                                • <strong>Các vai trò khác</strong> yêu cầu chọn bệnh viện và có thể chọn khoa/phòng ban<br />
                                • <strong>Email</strong> và <strong>Số điện thoại</strong> phải là duy nhất trong hệ thống<br />
                                • <strong>Lỗi sẽ được hiển thị chi tiết</strong> để hỗ trợ khắc phục nhanh chóng
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
                                    icon={<UserAddOutlined />}
                                >
                                    {loading ? 'Đang tạo...' : `Tạo ${isPatientRole ? 'Bệnh nhân' : 'Người dùng'}`}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default AddUser;