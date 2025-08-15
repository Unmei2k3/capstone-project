import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Row, Col, DatePicker, notification } from 'antd';
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
    
    // ✅ Redux hooks với safe fallback
    const dispatch = useDispatch();
    const messageState = useSelector(state => state.message || {});

    // ✅ State cho dropdown options
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // ✅ Cập nhật danh sách vai trò theo roleType từ API
    const roles = [
        { id: 1, name: 'Người dùng', roleType: 1 },
        { id: 2, name: 'Bác sĩ', roleType: 2 },
        { id: 4, name: 'Quản trị viên Bệnh viện', roleType: 4 },
        { id: 5, name: 'Quản trị viên Hệ thống', roleType: 5 },
        { id: 6, name: 'Bệnh nhân', roleType: 6 },
        { id: 7, name: 'Y tá', roleType: 7 }
    ];

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

    // ✅ Message handler - Safe check for messageState
    useEffect(() => {
        // ✅ Safe check để tránh lỗi Cannot read properties of null
        if (messageState && messageState.content && messageState.content.trim()) {
            const config = {
                message: messageState.type === 'success' ? 'Thành công!' : 
                         messageState.type === 'error' ? 'Có lỗi xảy ra!' :
                         messageState.type === 'warning' ? 'Cảnh báo!' : 'Thông báo',
                description: messageState.content,
                duration: messageState.duration || 4,
                placement: 'topRight',
            };

            // ✅ Show notification based on type
            try {
                if (messageState.type === 'success') {
                    notification.success({
                        ...config,
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    });
                } else if (messageState.type === 'error') {
                    notification.error({
                        ...config,
                        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                    });
                } else if (messageState.type === 'warning') {
                    notification.warning({
                        ...config,
                        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                    });
                } else {
                    notification.info(config);
                }

                // ✅ Clear message sau khi hiển thị
                const timer = setTimeout(() => {
                    dispatch(clearMessage());
                }, (messageState.duration || 4) * 1000);

                return () => clearTimeout(timer);
            } catch (error) {
                console.warn('❌ Error showing notification:', error);
                // ✅ Fallback: clear message nếu có lỗi
                dispatch(clearMessage());
            }
        }
    }, [messageState, dispatch]);

    // ✅ Debug useEffect để kiểm tra location state
    useEffect(() => {
        console.log('🔍 AddUser location state updated:', {
            provincesCount: provinces.length,
            districtsCount: districts.length,
            wardsCount: wards.length,
            selectedProvince,
            selectedDistrict,
            loadingStates: {
                provinces: loadingProvinces,
                districts: loadingDistricts,
                wards: loadingWards
            }
        });
    }, [provinces, districts, wards, selectedProvince, selectedDistrict, loadingProvinces, loadingDistricts, loadingWards]);

    // ✅ Fetch provinces và reset data khi modal mở
    useEffect(() => {
        if (visible) {
            console.log('👀 Modal opened, starting to fetch data...');
            // ✅ Clear any existing messages when modal opens
            try {
                dispatch(clearMessage());
            } catch (error) {
                console.warn('❌ Error clearing message:', error);
            }
            
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
        } else {
            console.log('👁️ Modal closed');
            // ✅ Clear messages when modal closes
            try {
                dispatch(clearMessage());
            } catch (error) {
                console.warn('❌ Error clearing message on close:', error);
            }
        }
    }, [visible, dispatch, form]);

    // ✅ Safe dispatch helper
    const safeDispatch = (action) => {
        try {
            dispatch(action);
        } catch (error) {
            console.warn('❌ Error dispatching action:', error);
        }
    };

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

            // ✅ Filter và clean data để tránh duplicate keys - Updated for new format
            const cleanedProvinces = processedProvinces
                .filter((province, index) => {
                    if (!province) {
                        console.warn(`⚠️ Null province at index ${index}`);
                        return false;
                    }
                    // ✅ Updated validation for new format: {province: 'Name', id: 'X', wards: []}
                    if (!province.province && !province.name && !province.id) {
                        console.warn(`⚠️ Province missing required fields at index ${index}:`, province);
                        return false;
                    }
                    return true;
                })
                .map((province, index) => ({
                    ...province,
                    // ✅ Normalize the data format
                    id: province.id || `province-${index}`,
                    code: province.id || `province-${index}`, // Use id as code
                    name: province.province || province.name || `Province ${index + 1}`, // Use province field as name
                    province: province.province || province.name || `Province ${index + 1}`,
                    // ✅ Ensure unique identifier
                    uniqueKey: createUniqueKey(province, index, 'province')
                }));

            console.log('📋 Processed provinces:', cleanedProvinces);
            console.log('📊 Provinces count:', cleanedProvinces.length);

            setProvinces(cleanedProvinces);

            if (cleanedProvinces.length > 0) {
                console.log('🎉 Provinces loaded successfully!', cleanedProvinces.length, 'provinces');
                // ✅ Tạm thời không hiện success message cho provinces để tránh spam
                // safeDispatch(setMessage({
                //     type: 'success',
                //     content: `✅ Đã tải thành công ${cleanedProvinces.length} tỉnh/thành phố`,
                //     duration: 2
                // }));
            } else {
                console.warn('⚠️ No provinces found after processing');
                safeDispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy dữ liệu tỉnh/thành phố',
                    duration: 3
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching provinces:', error);
            console.error('❌ Error details:', error.response?.data || error.message);

            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            safeDispatch(setMessage({
                type: 'error',
                content: `❌ Không thể tải danh sách tỉnh/thành phố: ${errorMessage}`,
                duration: 5
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

            // ✅ Districts data should be array directly from your service
            const rawDistricts = Array.isArray(districtsData) ? districtsData : [];
            
            // ✅ Filter và clean data để tránh duplicate keys
            const cleanedDistricts = rawDistricts
                .filter((district, index) => {
                    if (!district) {
                        console.warn(`⚠️ Null district at index ${index}`);
                        return false;
                    }
                    // Handle both possible formats
                    if (!district.district && !district.name && !district.id) {
                        console.warn(`⚠️ District missing required fields at index ${index}:`, district);
                        return false;
                    }
                    return true;
                })
                .map((district, index) => ({
                    ...district,
                    // ✅ Normalize the data format
                    id: district.id || `district-${index}`,
                    code: district.id || `district-${index}`,
                    name: district.district || district.name || `District ${index + 1}`,
                    district: district.district || district.name || `District ${index + 1}`,
                    // ✅ Ensure unique identifier
                    uniqueKey: createUniqueKey(district, index, 'district')
                }));
            
            console.log('📋 Processed districts:', cleanedDistricts);
            console.log('📊 Districts count:', cleanedDistricts.length);

            setDistricts(cleanedDistricts);

            if (cleanedDistricts.length > 0) {
                console.log('🎉 Districts loaded successfully!', cleanedDistricts.length, 'districts for', provinceCode);
                // ✅ Tạm thời không hiện success message cho districts để tránh spam
            } else {
                console.warn('⚠️ No districts found for province:', provinceCode);
                safeDispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy quận/huyện cho tỉnh này',
                    duration: 3
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching districts:', error);
            console.error('❌ Error details:', error.response?.data || error.message);
            
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            safeDispatch(setMessage({
                type: 'error',
                content: `❌ Không thể tải danh sách quận/huyện: ${errorMessage}`,
                duration: 5
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

            // ✅ Wards data should be array directly from your service
            const rawWards = Array.isArray(wardsData) ? wardsData : [];
            
            // ✅ Filter và clean data để tránh duplicate keys
            const cleanedWards = rawWards
                .filter((ward, index) => {
                    if (!ward) {
                        console.warn(`⚠️ Null ward at index ${index}`);
                        return false;
                    }
                    // Handle both possible formats
                    if (!ward.ward && !ward.name && !ward.id) {
                        console.warn(`⚠️ Ward missing required fields at index ${index}:`, ward);
                        return false;
                    }
                    return true;
                })
                .map((ward, index) => ({
                    ...ward,
                    // ✅ Normalize the data format
                    id: ward.id || `ward-${index}`,
                    code: ward.id || `ward-${index}`,
                    name: ward.ward || ward.name || `Ward ${index + 1}`,
                    ward: ward.ward || ward.name || `Ward ${index + 1}`,
                    // ✅ Ensure unique identifier
                    uniqueKey: createUniqueKey(ward, index, 'ward')
                }));
            
            console.log('📋 Processed wards:', cleanedWards);
            console.log('📊 Wards count:', cleanedWards.length);

            setWards(cleanedWards);

            if (cleanedWards.length > 0) {
                console.log('🎉 Wards loaded successfully!', cleanedWards.length, 'wards for', districtCode);
                // ✅ Tạm thời không hiện success message cho wards để tránh spam
            } else {
                console.warn('⚠️ No wards found for district:', districtCode);
                safeDispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy phường/xã cho quận/huyện này',
                    duration: 3
                }));
            }

        } catch (error) {
            console.error('❌ Error fetching wards:', error);
            console.error('❌ Error details:', error.response?.data || error.message);
            
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            safeDispatch(setMessage({
                type: 'error',
                content: `❌ Không thể tải danh sách phường/xã: ${errorMessage}`,
                duration: 5
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

            if (processedHospitals.length > 0) {
                // ✅ Tạm thời không hiện success message cho hospitals để tránh spam
                console.log('🎉 Hospitals loaded successfully!', processedHospitals.length, 'hospitals');
            } else {
                safeDispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Không tìm thấy dữ liệu bệnh viện',
                    duration: 3
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching hospitals:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            safeDispatch(setMessage({
                type: 'error',
                content: `❌ Không thể tải danh sách bệnh viện: ${errorMessage}`,
                duration: 5
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

            if (processedDepartments.length > 0) {
                console.log('🎉 Departments loaded successfully!', processedDepartments.length, 'departments');
                // ✅ Tạm thời không hiện success message cho departments để tránh spam
            } else {
                safeDispatch(setMessage({
                    type: 'warning',
                    content: '⚠️ Bệnh viện này chưa có khoa/phòng ban nào',
                    duration: 3
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching departments:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            safeDispatch(setMessage({
                type: 'error',
                content: `❌ Không thể tải danh sách khoa: ${errorMessage}`,
                duration: 5
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

        // Reset department khi chọn hospital mới
        form.setFieldsValue({ departmentId: undefined });

        // Fetch departments cho hospital được chọn
        fetchDepartments(hospitalId);
    };

    // ✅ Enhanced province change handler with districts fetching
    const handleProvinceChange = (provinceId) => {
        console.log('🌏 Province selected:', provinceId);
        setSelectedProvince(provinceId);
        
        // Reset district và ward khi chọn province mới
        form.setFieldsValue({ 
            district: undefined,
            ward: undefined 
        });
        setSelectedDistrict(null);
        setWards([]);
        
        // ✅ Fetch districts cho province được chọn (use provinceId)
        fetchDistricts(provinceId);
    };

    // ✅ Enhanced district change handler with wards fetching  
    const handleDistrictChange = (districtId) => {
        console.log('🏘️ District selected:', districtId);
        setSelectedDistrict(districtId);
        
        // Reset ward khi chọn district mới
        form.setFieldsValue({ ward: undefined });
        
        // ✅ Fetch wards cho district được chọn (use districtId)
        fetchWards(districtId);
    };

    // ✅ Handle ward selection
    const handleWardChange = (wardId) => {
        console.log('🏠 Ward selected:', wardId);
    };

    // ✅ Enhanced submit handler với detailed error handling
    const handleSubmit = async (values) => {
        setLoading(true);
        
        // ✅ Clear any existing messages
        safeDispatch(clearMessage());

        try {
            // ✅ Show processing message
            safeDispatch(setMessage({
                type: 'info',
                content: '⏳ Đang xử lý thông tin người dùng...',
                duration: 2
            }));

            const selectedRole = roles.find(role => role.id === values.roleId);

            // ✅ Get selected location names for payload - Updated for new format
            const selectedProvinceObj = provinces.find(p => p.id === values.province || p.code === values.province);
            const selectedDistrictObj = districts.find(d => d.id === values.district || d.code === values.district);
            const selectedWardObj = wards.find(w => w.id === values.ward || w.code === values.ward);

            // ✅ Validation before API call
            if (!selectedRole) {
                throw new Error('Vai trò được chọn không hợp lệ');
            }

            if (!values.hospitalId) {
                throw new Error('Vui lòng chọn bệnh viện');
            }

            // ✅ Tạo payload theo đúng format API
            const userData = {
                hospitalId: values.hospitalId || 0,
                departmentId: values.departmentId || 0,
                roleType: selectedRole?.roleType || 1,
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

            console.log('📤 Payload gửi đến API:', userData);

            const response = await createUser(userData);
            console.log('📥 Phản hồi từ API:', response);

            // ✅ Enhanced success validation
            if (response?.success || response?.result || response?.id) {
                safeDispatch(setMessage({
                    type: 'success',
                    content: `🎉 Tạo người dùng "${userData.fullname}" thành công! Vai trò: ${selectedRole.name}`,
                    duration: 5
                }));

                // ✅ Reset form và state
                form.resetFields();
                setSelectedHospitalId(null);
                setDepartments([]);
                setSelectedProvince(null);
                setSelectedDistrict(null);
                setDistricts([]);
                setWards([]);

                // ✅ Call parent success callback với flag để reload user list
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(response, { shouldReload: true }); // Pass reload flag
                }

                // ✅ Auto close modal sau 1.5 giây để user thấy success message
                setTimeout(() => {
                    handleCancel();
                }, 1500);
            } else {
                throw new Error('Phản hồi không hợp lệ từ server');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tạo người dùng:', error);

            let errorMessage = 'Không thể tạo người dùng. Vui lòng thử lại.';
            let errorDetails = '';

            // ✅ Enhanced error handling
            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.title) {
                    switch (errorData.title) {
                        case 'PHONE_ALREADY_EXISTS':
                            errorMessage = '📱 Số điện thoại này đã được đăng ký';
                            errorDetails = 'Vui lòng sử dụng số điện thoại khác hoặc kiểm tra lại thông tin.';
                            break;
                        case 'EMAIL_ALREADY_EXISTS':
                            errorMessage = '📧 Email này đã được đăng ký';
                            errorDetails = 'Vui lòng sử dụng email khác hoặc kiểm tra lại thông tin.';
                            break;
                        case 'CCCD_ALREADY_EXISTS':
                            errorMessage = '🆔 Số CCCD này đã được đăng ký';
                            errorDetails = 'Vui lòng kiểm tra lại số CCCD hoặc liên hệ quản trị viên.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage = '⚠️ Dữ liệu không hợp lệ';
                            errorDetails = errorData.message || 'Vui lòng kiểm tra lại thông tin đã nhập.';
                            break;
                        case 'UNAUTHORIZED':
                            errorMessage = '🔒 Không có quyền thực hiện thao tác này';
                            errorDetails = 'Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.';
                            break;
                        case 'SERVER_ERROR':
                            errorMessage = '🔥 Lỗi hệ thống';
                            errorDetails = 'Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ kỹ thuật.';
                            break;
                        default:
                            errorMessage = `❌ ${errorData.title.replace(/_/g, ' ').toLowerCase()}`;
                            errorDetails = errorData.message || 'Vui lòng thử lại.';
                            break;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }

                // ✅ Handle validation errors array
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorDetails = errorData.errors.map(err => `• ${err.field}: ${err.message}`).join('\n');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            // ✅ Network errors
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                errorMessage = '🌐 Lỗi kết nối mạng';
                errorDetails = 'Vui lòng kiểm tra kết nối internet và thử lại.';
            }

            // ✅ Display error message
            const fullErrorMessage = errorDetails ? `${errorMessage}\n${errorDetails}` : errorMessage;
            
            safeDispatch(setMessage({
                type: 'error',
                content: fullErrorMessage,
                duration: 8
            }));

        } finally {
            setLoading(false);
        }
    };

    // ✅ Enhanced cancel handler
    const handleCancel = () => {
        // ✅ Clear messages
        safeDispatch(clearMessage());
        
        // ✅ Reset form và state
        form.resetFields();
        setSelectedHospitalId(null);
        setDepartments([]);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setDistricts([]);
        setWards([]);
        
        // ✅ Call parent cancel callback
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserAddOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Thêm Người dùng mới
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
                    {/* ✅ Debug thông tin location state - Ẩn trong production */}
                    {process.env.NODE_ENV === 'development' && (provinces.length > 0 || districts.length > 0 || wards.length > 0) && (
                        <div style={{
                            marginBottom: 16,
                            padding: '8px 12px',
                            background: '#fff7e6',
                            borderRadius: '4px',
                            border: '1px solid #ffd591',
                            fontSize: '12px'
                        }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                                🏙️ Location Debug Info (Development Only):
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.3' }}>
                                • <strong>Provinces:</strong> {provinces.length} loaded<br/>
                                • <strong>Districts:</strong> {districts.length} loaded<br/>
                                • <strong>Wards:</strong> {wards.length} loaded<br/>
                                • <strong>Selected:</strong> P: {selectedProvince || 'None'}, D: {selectedDistrict || 'None'}<br/>
                                • <strong>Loading:</strong> P: {loadingProvinces ? 'Yes' : 'No'}, D: {loadingDistricts ? 'Yes' : 'No'}, W: {loadingWards ? 'Yes' : 'No'}
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

                    {/* ✅ Thông tin cơ quan */}
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

                    {/* ✅ Thông tin địa chỉ - Fixed với cascade Province → District → Ward theo format API mới */}
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

                    {/* ✅ Thông báo hệ thống - Safe check cho messageState */}
                    {messageState && messageState.content && messageState.content.trim() && (
                        <div style={{
                            marginBottom: 24,
                            padding: '12px 16px',
                            background: messageState.type === 'success' ? '#f6ffed' : 
                                       messageState.type === 'error' ? '#fff1f0' : 
                                       messageState.type === 'warning' ? '#fffbe6' : '#e6f7ff',
                            borderRadius: '6px',
                            border: `1px solid ${messageState.type === 'success' ? '#b7eb8f' : 
                                                 messageState.type === 'error' ? '#ffccc7' : 
                                                 messageState.type === 'warning' ? '#ffe58f' : '#91d5ff'}`,
                            fontSize: '13px'
                        }}>
                            <div style={{ 
                                color: messageState.type === 'success' ? '#389e0d' : 
                                       messageState.type === 'error' ? '#cf1322' : 
                                       messageState.type === 'warning' ? '#d48806' : '#1890ff', 
                                fontWeight: 500, 
                                marginBottom: 4 
                            }}>
                                {messageState.type === 'success' ? '✅ Thành công' : 
                                 messageState.type === 'error' ? '❌ Lỗi' : 
                                 messageState.type === 'warning' ? '⚠️ Cảnh báo' : 'ℹ️ Thông tin'}
                            </div>
                            <div style={{ color: '#666', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                                {messageState.content}
                            </div>
                        </div>
                    )}

                    {/* ✅ Ghi chú - Updated */}
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
                            • <strong>Bệnh viện</strong> là bắt buộc và sẽ load danh sách khoa tương ứng<br />
                            • <strong>Khoa/Phòng ban</strong> không bắt buộc, có thể để "Chưa phân khoa"<br />
                            • <strong>Địa chỉ</strong> sử dụng cascade selection với format API mới<br />
                            • <strong>Email</strong> và <strong>Số điện thoại</strong> phải là duy nhất trong hệ thống<br />
                            • <strong>Ngày sinh</strong> là bắt buộc và phải từ 16 tuổi trở lên<br />
                            • <strong>Mật khẩu</strong> phải có ít nhất 6 ký tự<br />
                            • <strong>Thông báo lỗi</strong> sẽ hiển thị chi tiết để hỗ trợ khắc phục
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
                                {loading ? 'Đang tạo...' : 'Tạo người dùng'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AddUser;