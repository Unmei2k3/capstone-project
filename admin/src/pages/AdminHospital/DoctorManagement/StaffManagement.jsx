import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Input,
    Select,
    Space,
    Avatar,
    Tag,
    Tooltip,
    Rate,
    Modal,
    Row,
    Col,
    Statistic,
    Typography,
    Tabs
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    HeartOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import {
    deleteDoctor,
    updateDoctorStatus,
    getAllDoctors,
    getDoctorByUserId,
    getDoctorByHospitalId
} from '../../../services/doctorService';

import AddStaff from './AddStaff';
import EditStaff from './EditStaff';
import ViewStaff from './ViewStaff';
import DeleteStaff from './DeleteStaff';
import { getStaffNurseByHospitalId } from '../../../services/staffNurseService';
import AddNurse from './AddNurse';
import { deleteUser, getUserById } from '../../../services/userService';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const StaffManagementPage = () => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [addingStaffType, setAddingStaffType] = useState('doctor');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalNurses: 0,
        activeDoctors: 0,
        activeNurses: 0,
        inactiveDoctors: 0,
        inactiveNurses: 0
    });

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffType, setStaffType] = useState('doctor');
    const [selectedViewStaff, setSelectedViewStaff] = useState(null);
    const [hospitalId, setHospitalId] = useState(null);
    const dispatch = useDispatch();

    // ✅ Get user from Redux store
    const user = useSelector((state) => state.user?.user);

    // ✅ Extract hospitalId when user data is available
    useEffect(() => {
        if (user && user.hospitals && user.hospitals.length > 0) {
            const currentHospitalId = user.hospitals[0].id;
            console.log('🏥 ID Bệnh viện được trích xuất từ user:', currentHospitalId);
            console.log('🏥 Tên bệnh viện:', user.hospitals[0].name);
            setHospitalId(currentHospitalId);
        } else {
            console.warn('⚠️ Không tìm thấy bệnh viện trong dữ liệu user:', user);
        }
    }, [user]);

    // ✅ Simplified fetchStaff with role filtering for nurses
    const fetchStaff = async () => {
        if (!hospitalId) {
            console.warn('⚠️ Không có ID bệnh viện, không thể tải dữ liệu nhân viên');
            return;
        }

        setLoading(true);
        try {
            console.log('🔄 Đang tải dữ liệu nhân viên...');
            console.log('🏥 Sử dụng ID bệnh viện:', hospitalId);

            // ✅ Fetch doctors from API
            console.log('🔄 Đang tải danh sách bác sĩ...');
            const doctorResponse = await getDoctorByHospitalId(hospitalId);
            console.log('📥 Phản hồi API Bác sĩ:', doctorResponse);

            let doctors = [];
            if (Array.isArray(doctorResponse)) {
                console.log('📋 Đang xử lý danh sách bác sĩ, số lượng:', doctorResponse.length);
                doctors = doctorResponse.map((doctor, index) => {
                    const user = doctor.user || {};
                    return {
                        id: doctor.id || user.id || `doctor-${index}`,
                        type: 'doctor',
                        name: user.fullname || user.userName || doctor.description || 'Bác sĩ chưa xác định',
                        fullname: user.fullname || user.userName || doctor.description || 'Bác sĩ chưa xác định',
                        email: user.email || `bacsi${index + 1}@benhvien.com`,
                        phone: user.phoneNumber || 'Không có',
                        phoneNumber: user.phoneNumber || 'Không có',
                        userName: user.userName || '',
                        avatarUrl: user.avatarUrl || '',
                        avatar: user.avatarUrl || '',
                        gender: user.gender,
                        dob: user.dob,
                        cccd: user.cccd || '',
                        province: user.province,
                        ward: user.ward,
                        streetAddress: user.streetAddress || '',
                        job: user.job || 'Bác sĩ',
                        description: doctor.description || 'Không có mô tả',
                        practicingFrom: doctor.practicingFrom || new Date().toISOString(),
                        specialization: 'Y học tổng quát',
                        departmentId: 1,
                        departmentName: 'Khoa tổng quát',
                        licenseNumber: `Doc-${doctor.id || index}`,
                        experience: '5 năm',
                        education: 'Bằng Y khoa',
                        status: 'active',
                        consultationFee: 200000,
                        totalPatients: Math.floor(Math.random() * 1000),
                        rating: (4 + Math.random()).toFixed(1),
                        createdAt: doctor.practicingFrom || new Date().toISOString(),
                        schedule: 'Thứ 2-6: 8:00-17:00',
                        originalData: {
                            doctor: doctor,
                            user: user,
                            hospitalAffiliations: doctor.hospitalAffiliations || [],
                            specializations: doctor.specializations || []
                        }
                    };
                });
            } else {
                console.warn('⚠️ Định dạng phản hồi API bác sĩ không mong đợi:', doctorResponse);
                doctors = [];
            }

            console.log('✅ Đã xử lý danh sách bác sĩ:', doctors);

            // ✅ Fetch nurses from API with role filtering
            console.log('🔄 Đang tải danh sách điều dưỡng cho ID bệnh viện:', hospitalId);
            const nurseResponse = await getStaffNurseByHospitalId(hospitalId);
            console.log('📥 Phản hồi API Điều dưỡng:', nurseResponse);

            let nurses = [];
            if (nurseResponse?.success && Array.isArray(nurseResponse.result)) {
                console.log('📋 Đang xử lý danh sách điều dưỡng, số lượng:', nurseResponse.result.length);
                
                // ✅ Filter out nurses with null role
                const validNurses = nurseResponse.result.filter(nurse => {
                    const hasValidRole = nurse.role !== null && nurse.role !== undefined;
                    if (!hasValidRole) {
                        console.log('❌ Loại bỏ nhân viên không có role:', nurse.fullname, '(ID:', nurse.id, ')');
                    }
                    return hasValidRole;
                });
                
                console.log('✅ Điều dưỡng hợp lệ sau khi lọc:', validNurses.length, '/', nurseResponse.result.length);
                
                nurses = validNurses.map((nurse, index) => {
                    console.log(`👩‍⚕️ Đang xử lý điều dưỡng ${index + 1}:`, nurse.fullname, 'Role:', nurse.role?.name);

                    return {
                        id: nurse.id || `nurse-${index}`,
                        staffId: nurse.staffId,
                        type: 'nurse',
                        name: nurse.fullname || 'Điều dưỡng chưa xác định',
                        fullname: nurse.fullname || 'Điều dưỡng chưa xác định',
                        email: nurse.email || 'Không có email',
                        phone: nurse.phoneNumber || 'Không có điện thoại',
                        phoneNumber: nurse.phoneNumber || 'Không có điện thoại',
                        userName: nurse.userName || '',
                        avatarUrl: nurse.avatarUrl || '',
                        avatar: nurse.avatarUrl || '',
                        gender: nurse.gender,
                        dob: nurse.dob,
                        cccd: nurse.cccd || '',
                        province: nurse.province,
                        ward: nurse.ward,
                        streetAddress: nurse.streetAddress || '',
                        job: nurse.job || nurse.role?.name || 'Điều dưỡng',
                        description: nurse.description || 'Không có mô tả',
                        specialization: nurse.specialization || 'Điều dưỡng tổng quát',
                        
                        // ✅ Hospital information from API
                        hospitalId: nurse.hospitalId,
                        hospitalName: nurse.hospitalName,
                        
                        // ✅ Role information (guaranteed to exist after filtering)
                        roleId: nurse.role.id,
                        roleName: nurse.role.name,
                        roleType: nurse.role.roleType,
                        
                        // ✅ Default values for display
                        departmentId: nurse.departmentId || 1,
                        departmentName: 'Khoa tổng quát',
                        licenseNumber: `Y tá-${nurse.staffId || nurse.id}`,
                        experience: nurse.experience || '3 năm',
                        education: nurse.education || 'Bằng Điều dưỡng',
                        status: nurse.status || 'active',
                        consultationFee: 0,
                        totalPatients: nurse.totalPatients || Math.floor(Math.random() * 500),
                        rating: nurse.rating || (4 + Math.random()).toFixed(1),
                        createdAt: nurse.createdAt || new Date().toISOString(),
                        schedule: nurse.schedule || 'Thứ 2-6: 8:00-17:00',
                        shift: nurse.shift || 'Ca ngày (7AM-7PM)',
                        certifications: nurse.certifications || 'BLS, CPR',
                        
                        // ✅ Store original data for reference
                        originalData: {
                            nurse: nurse,
                            user: nurse,
                            hospitalAffiliations: nurse.hospitalAffiliations || [],
                            specializations: nurse.specializations || [],
                            apiResponse: nurseResponse
                        }
                    };
                });
            } else if (Array.isArray(nurseResponse)) {
                // ✅ Fallback for direct array response
                console.log('📋 Đang xử lý danh sách điều dưỡng (direct array), số lượng:', nurseResponse.length);
                
                // ✅ Filter out nurses with null role
                const validNurses = nurseResponse.filter(nurse => {
                    const hasValidRole = nurse.role !== null && nurse.role !== undefined;
                    if (!hasValidRole) {
                        console.log('❌ Loại bỏ nhân viên không có role:', nurse.fullname || nurse.userName, '(ID:', nurse.id, ')');
                    }
                    return hasValidRole;
                });
                
                console.log('✅ Điều dưỡng hợp lệ sau khi lọc:', validNurses.length, '/', nurseResponse.length);
                
                nurses = validNurses.map((nurse, index) => {
                    console.log(`👩‍⚕️ Đang xử lý điều dưỡng ${index + 1}:`, nurse.fullname, 'Role:', nurse.role?.name);

                    return {
                        id: nurse.id || `nurse-${index}`,
                        staffId: nurse.staffId,
                        type: 'nurse',
                        name: nurse.fullname || nurse.userName || 'Điều dưỡng chưa xác định',
                        fullname: nurse.fullname || nurse.userName || 'Điều dưỡng chưa xác định',
                        email: nurse.email || 'Không có email',
                        phone: nurse.phoneNumber || 'Không có điện thoại',
                        phoneNumber: nurse.phoneNumber || 'Không có điện thoại',
                        userName: nurse.userName || '',
                        avatarUrl: nurse.avatarUrl || '',
                        avatar: nurse.avatarUrl || '',
                        gender: nurse.gender,
                        dob: nurse.dob,
                        cccd: nurse.cccd || '',
                        province: nurse.province,
                        ward: nurse.ward,
                        streetAddress: nurse.streetAddress || '',
                        job: nurse.job || nurse.role?.name || 'Điều dưỡng',
                        description: nurse.description || 'Không có mô tả',
                        specialization: nurse.specialization || 'Điều dưỡng tổng quát',
                        
                        // ✅ Hospital information
                        hospitalId: nurse.hospitalId,
                        hospitalName: nurse.hospitalName,
                        
                        // ✅ Role information (guaranteed to exist after filtering)
                        roleId: nurse.role.id,
                        roleName: nurse.role.name,
                        roleType: nurse.role.roleType,
                        
                        // ✅ Default values
                        departmentId: nurse.departmentId || 1,
                        departmentName: 'Khoa tổng quát',
                        licenseNumber: `Y tá-${nurse.staffId || nurse.id}`,
                        experience: nurse.experience || '3 năm',
                        education: nurse.education || 'Bằng Điều dưỡng',
                        status: nurse.status || 'active',
                        consultationFee: 0,
                        totalPatients: nurse.totalPatients || Math.floor(Math.random() * 500),
                        rating: nurse.rating || (4 + Math.random()).toFixed(1),
                        createdAt: nurse.createdAt || new Date().toISOString(),
                        schedule: nurse.schedule || 'Thứ 2-6: 8:00-17:00',
                        shift: nurse.shift || 'Ca ngày (7AM-7PM)',
                        certifications: nurse.certifications || 'BLS, CPR',
                        
                        // ✅ Store original data for reference
                        originalData: {
                            nurse: nurse,
                            user: nurse,
                            hospitalAffiliations: nurse.hospitalAffiliations || [],
                            specializations: nurse.specializations || [],
                            apiResponse: nurseResponse
                        }
                    };
                });
            } else {
                console.warn('⚠️ Định dạng phản hồi API điều dưỡng không mong đợi:', nurseResponse);
                nurses = [];
            }

            console.log('✅ Đã xử lý danh sách điều dưỡng:', nurses);

            // ✅ Apply filters
            let filteredDoctors = [...doctors];
            let filteredNurses = [...nurses];

            if (searchText) {
                filteredDoctors = filteredDoctors.filter(doctor =>
                    doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    doctor.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    doctor.phoneNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                    doctor.userName.toLowerCase().includes(searchText.toLowerCase())
                );

                filteredNurses = filteredNurses.filter(nurse =>
                    nurse.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    nurse.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    nurse.phoneNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                    nurse.userName.toLowerCase().includes(searchText.toLowerCase())
                );
            }

            if (statusFilter !== 'all') {
                filteredDoctors = filteredDoctors.filter(doctor => doctor.status === statusFilter);
                filteredNurses = filteredNurses.filter(nurse => nurse.status === statusFilter);
            }

            console.log('✅ Bác sĩ đã lọc:', filteredDoctors);
            console.log('✅ Điều dưỡng đã lọc:', filteredNurses);

            // ✅ Combine staff based on active tab
            let allStaff = [];
            switch (activeTab) {
                case 'doctors':
                    allStaff = filteredDoctors;
                    break;
                case 'nurses':
                    allStaff = filteredNurses;
                    break;
                default:
                    allStaff = [...filteredDoctors, ...filteredNurses];
                    break;
            }

            console.log('✅ Danh sách nhân viên cuối cùng:', allStaff);

            setStaff(allStaff);
            setPagination(prev => ({
                ...prev,
                total: allStaff.length
            }));

            // ✅ Update stats
            const activeDoctors = doctors.filter(d => d.status === 'active').length;
            const inactiveDoctors = doctors.filter(d => d.status === 'inactive').length;
            const activeNurses = nurses.filter(n => n.status === 'active').length;
            const inactiveNurses = nurses.filter(n => n.status === 'inactive').length;

            setStats({
                totalDoctors: doctors.length,
                totalNurses: nurses.length,
                activeDoctors,
                activeNurses,
                inactiveDoctors,
                inactiveNurses
            });

            console.log('📊 Thống kê đã cập nhật:', {
                totalDoctors: doctors.length,
                totalNurses: nurses.length,
                activeDoctors,
                activeNurses,
                inactiveDoctors,
                inactiveNurses
            });

        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu nhân viên:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Không thể tải dữ liệu nhân viên. Vui lòng thử lại.',
                duration: 4
            }));
            setStaff([]);
            setStats({
                totalDoctors: 0,
                totalNurses: 0,
                activeDoctors: 0,
                activeNurses: 0,
                inactiveDoctors: 0,
                inactiveNurses: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ Only fetch when hospitalId is available
    useEffect(() => {
        if (hospitalId) {
            fetchStaff();
        }
    }, [hospitalId, activeTab, pagination.current, pagination.pageSize, searchText, statusFilter]);

    const handleViewDetails = async (staffMember) => {
        console.log('👁️ Đang xem chi tiết nhân viên:', staffMember);
        console.log('🔍 Loại nhân viên:', staffMember.type);

        try {
            let staffData;

            if (staffMember.type === 'doctor') {
                console.log('👨‍⚕️ Đang tải chi tiết bác sĩ qua getDoctorById...');
                staffData = await getDoctorByUserId(staffMember.id);
            } else if (staffMember.type === 'nurse') {
                console.log('👩‍⚕️ Đang tải chi tiết điều dưỡng qua getUserById...');
                staffData = await getUserById(staffMember.id);
            } else {
                console.log('👤 Loại không xác định, sử dụng getUserById...');
                staffData = await getUserById(staffMember.id);
            }

            console.log('✅ Đã tải chi tiết nhân viên:', staffData);

            setSelectedViewStaff({
                ...staffMember,
                detailedData: staffData,
                apiSource: staffMember.type === 'doctor' ? 'getDoctorById' : 'getUserById'
            });
            setViewModalVisible(true);

        } catch (error) {
            console.error('❌ Lỗi khi tải chi tiết nhân viên:', error);
            dispatch(setMessage({
                type: 'error',
                content: `Không thể tải chi tiết ${staffMember.type === 'doctor' ? 'bác sĩ' : 'điều dưỡng'}`,
                duration: 4
            }));

            setSelectedViewStaff(staffMember);
            setViewModalVisible(true);
        }
    };

    const handleEditStaff = (staffMember) => {
        console.log('✏️ Đang chỉnh sửa nhân viên:', staffMember);
        console.log('🔍 Loại nhân viên:', staffMember.type);

        setSelectedStaff({
            ...staffMember,
            editApiType: staffMember.type === 'doctor' ? 'updateDoctor' : 'updateUser'
        });
        setEditModalVisible(true);
    };

    const handleDeleteStaff = async (staffMember) => {
        console.log('🗑️ Đang xóa nhân viên:', staffMember);
        console.log('🔍 Loại nhân viên:', staffMember.type);

        try {
            let deleteResponse;
            let apiUsed;

            if (staffMember.type === 'doctor') {
                console.log('👨‍⚕️ Đang xóa bác sĩ qua deleteDoctor...');
                deleteResponse = await deleteDoctor(staffMember.id);
                apiUsed = 'deleteDoctor';
            } else if (staffMember.type === 'nurse') {
                console.log('👩‍⚕️ Đang xóa điều dưỡng qua deleteUser...');
                deleteResponse = await deleteUser(staffMember.id);
                apiUsed = 'deleteUser';
            } else {
                console.log('👤 Loại không xác định, sử dụng deleteUser...');
                deleteResponse = await deleteUser(staffMember.id);
                apiUsed = 'deleteUser';
            }

            console.log(`✅ Phản hồi ${apiUsed}:`, deleteResponse);

            const isSuccess = deleteResponse === true ||
                deleteResponse?.success === true ||
                deleteResponse?.message?.toLowerCase().includes('success') ||
                !deleteResponse?.error;

            if (isSuccess) {
                dispatch(setMessage({
                    type: 'success',
                    content: `${staffMember.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'} đã được xóa thành công!`,
                    duration: 4
                }));
                await fetchStaff();
                return Promise.resolve();
            } else {
                throw new Error(deleteResponse?.message || `Không thể xóa ${staffMember.type === 'doctor' ? 'bác sĩ' : 'điều dưỡng'}`);
            }

        } catch (error) {
            console.error(`❌ Lỗi khi xóa ${staffMember.type === 'doctor' ? 'bác sĩ' : 'điều dưỡng'}:`, error);

            let errorMessage = `Không thể xóa ${staffMember.type === 'doctor' ? 'bác sĩ' : 'điều dưỡng'}`;
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            dispatch(setMessage({
                type: 'error',
                content: errorMessage,
                duration: 4
            }));
            return Promise.reject(error);
        }
    };

    const showDeleteConfirm = (staffMember) => {
        console.log('🚨 showDeleteConfirm được gọi với:', staffMember);
        setStaffToDelete(staffMember);
        setDeleteConfirmVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        console.log('🆗 Xác nhận xóa, đang gọi handleDeleteStaff...');
        try {
            setDeleteConfirmVisible(false);
            await handleDeleteStaff(staffToDelete);
            console.log('✅ Xóa hoàn tất thành công');
        } catch (error) {
            console.error('❌ Xóa thất bại:', error);
        } finally {
            setStaffToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('❌ Hủy xóa');
        setDeleteConfirmVisible(false);
        setStaffToDelete(null);
    };

    const handleDelete = (staffMember) => {
        showDeleteConfirm(staffMember);
    };

    const handleDeleteSuccess = async () => {
        console.log('✅ Thao tác xóa hoàn tất thành công');
        setDeleteModalVisible(false);
        setSelectedStaff(null);

        try {
            await fetchStaff();
            console.log('🔄 Dữ liệu nhân viên đã được làm mới sau khi xóa');
        } catch (error) {
            console.error('❌ Lỗi khi làm mới dữ liệu sau khi xóa:', error);
        }
    };

    const handleDeleteCancel = () => {
        console.log('❌ Hủy thao tác xóa');
        setDeleteModalVisible(false);
        setSelectedStaff(null);
    };

    const handleStatusToggle = (staffMember) => {
        const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
        const statusText = newStatus === 'active' ? 'Kích hoạt' : 'Vô hiệu hóa';
        const staffTypeText = staffMember.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng';

        Modal.confirm({
            title: `${statusText} ${staffTypeText}`,
            content: `Bạn có chắc chắn muốn ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} ${staffMember.name}?`,
            okText: 'Có',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    if (staffMember.type === 'doctor') {
                        const response = await updateDoctorStatus(staffMember.id, newStatus);
                        if (response.success) {
                            dispatch(setMessage({
                                type: 'success',
                                content: `${staffMember.name} đã được ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'}.`,
                                duration: 4
                            }));
                            fetchStaff();
                        }
                    } else {
                        fetchStaff();
                    }
                } catch (error) {
                    dispatch(setMessage({
                        type: 'error',
                        content: `Không thể cập nhật trạng thái ${staffTypeText.toLowerCase()}. Vui lòng thử lại.`,
                        duration: 4
                    }));
                }
            }
        });
    };

    const columns = [
        {
            title: 'Nhân viên',
            key: 'staff',
            width: 280,
            render: (_, staffMember) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        src={staffMember.avatarUrl || staffMember.avatar}
                        icon={<UserOutlined />}
                        style={{
                            marginRight: 12,
                            backgroundColor: staffMember.type === 'doctor' ? '#1890ff' : '#52c41a'
                        }}
                    />
                    <div>
                        <div style={{
                            fontWeight: 500,
                            color: staffMember.type === 'doctor' ? '#1890ff' : '#52c41a'
                        }}>
                            {staffMember.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <Tag
                                size="small"
                                color={staffMember.type === 'doctor' ? 'blue' : 'green'}
                                icon={staffMember.type === 'doctor' ? <MedicineBoxOutlined /> : <HeartOutlined />}
                            >
                                {staffMember.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'}
                            </Tag>
                            {staffMember.licenseNumber}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: 200,
            render: (_, staffMember) => (
                <div>
                    <div style={{ fontSize: '13px' }}>📧 {staffMember.email}</div>
                    <div style={{ fontSize: '13px' }}>📞 {staffMember.phone || staffMember.phoneNumber}</div>
                </div>
            ),
        },
        {
            title: 'Khoa',
            dataIndex: 'departmentName',
            key: 'department',
            width: 150,
            render: (department, staffMember) => (
                <Tag
                    color={staffMember.type === 'doctor' ? 'blue' : 'green'}
                    icon={<MedicineBoxOutlined />}
                >
                    {department}
                </Tag>
            ),
        },
        {
            title: 'Chuyên khoa',
            dataIndex: 'specialization',
            key: 'specialization',
            width: 150,
            render: (specialization) => (
                <Tag color="purple">{specialization}</Tag>
            ),
        },
        {
            title: 'Kinh nghiệm & Đánh giá',
            key: 'experience',
            width: 160,
            render: (_, staffMember) => (
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                        {staffMember.experience}
                    </div>
                    <Rate disabled value={staffMember.rating || 4.5} style={{ fontSize: '12px' }} />
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 100,
            render: (_, staffMember) => (
                <Tag
                    color={staffMember.status === 'active' ? 'success' : 'error'}
                    icon={staffMember.status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStatusToggle(staffMember)}
                >
                    {staffMember.status === 'active' ? 'HOẠT ĐỘNG' : 'VÔ HIỆU'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_, staffMember) => {
                const viewTooltip = staffMember.type === 'doctor'
                    ? 'Xem Bác sĩ (getDoctorById)'
                    : 'Xem Điều dưỡng (getUserById)';

                const editTooltip = staffMember.type === 'doctor'
                    ? 'Sửa Bác sĩ (updateDoctor)'
                    : 'Sửa Điều dưỡng (updateUser)';

                const deleteTooltip = staffMember.type === 'doctor'
                    ? 'Xóa Bác sĩ (deleteDoctor)'
                    : 'Xóa Điều dưỡng (deleteUser)';

                return (
                    <Space size="small">
                        <Tooltip title={viewTooltip}>
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(staffMember)}
                                style={{
                                    color: staffMember.type === 'doctor' ? '#1890ff' : '#52c41a'
                                }}
                            />
                        </Tooltip>

                        <Tooltip title={editTooltip}>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditStaff(staffMember)}
                                style={{
                                    color: staffMember.type === 'doctor' ? '#1890ff' : '#52c41a'
                                }}
                            />
                        </Tooltip>

                        <Tooltip title={deleteTooltip}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    console.log('🔥 Nút xóa được nhấn cho:', staffMember);
                                    showDeleteConfirm(staffMember);
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'status') {
            setStatusFilter(value);
        }
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleAddStaff = (type) => {
        console.log('🔧 Thêm nhân viên loại:', type);
        setAddingStaffType(type);
        setAddModalVisible(true);
    };

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    <TeamOutlined style={{ marginRight: 12 }} />
                    Quản lý Nhân viên
                </Title>
                <p style={{ color: '#8c8c8c', marginTop: 8 }}>
                    Quản lý bác sĩ và điều dưỡng của bệnh viện, thông tin và phân công công việc
                </p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số Bác sĩ"
                            value={stats.totalDoctors}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số Điều dưỡng"
                            value={stats.totalNurses}
                            prefix={<HeartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên Hoạt động"
                            value={stats.activeDoctors + stats.activeNurses}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <Space size="middle" wrap>
                        <Search
                            placeholder="Tìm kiếm nhân viên..."
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => !e.target.value && setSearchText('')}
                        />

                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 120 }}
                            value={statusFilter}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Vô hiệu</Option>
                        </Select>
                    </Space>

                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddStaff('doctor')}
                        >
                            Thêm Bác sĩ
                        </Button>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => handleAddStaff('nurse')}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Thêm Điều dưỡng
                        </Button>
                    </Space>
                </div>

                {/* Add Staff Modals */}
                {addModalVisible && (
                    addingStaffType === 'doctor' ? (
                        <AddStaff
                            visible={addModalVisible}
                            onCancel={() => setAddModalVisible(false)}
                            onSuccess={() => {
                                setAddModalVisible(false);
                                fetchStaff();
                            }}
                            staffType={addingStaffType}
                        />
                    ) : (
                        <AddNurse
                            visible={addModalVisible}
                            onCancel={() => setAddModalVisible(false)}
                            onSuccess={() => {
                                setAddModalVisible(false);
                                fetchStaff();
                            }}
                        />
                    )
                )}

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ marginBottom: 16 }}
                >
                    <TabPane
                        tab={
                            <span>
                                <TeamOutlined />
                                Tất cả Nhân viên ({stats.totalDoctors + stats.totalNurses})
                            </span>
                        }
                        key="all"
                    />
                    <TabPane
                        tab={
                            <span>
                                <MedicineBoxOutlined />
                                Bác sĩ ({stats.totalDoctors})
                            </span>
                        }
                        key="doctors"
                    />
                    <TabPane
                        tab={
                            <span>
                                <HeartOutlined />
                                Điều dưỡng ({stats.totalNurses})
                            </span>
                        }
                        key="nurses"
                    />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={staff}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trong ${total} nhân viên`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1300 }}
                />
            </Card>

            {/* Edit Staff Modal */}
            {editModalVisible && selectedStaff && (
                <EditStaff
                    visible={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onSuccess={() => {
                        setEditModalVisible(false);
                        fetchStaff();
                    }}
                    staff={selectedStaff}
                />
            )}

            {/* View Staff Modal */}
            {viewModalVisible && selectedViewStaff && (
                selectedViewStaff.type === 'doctor' ? (
                    <ViewStaff
                        visible={viewModalVisible}
                        onCancel={() => {
                            setViewModalVisible(false);
                            setSelectedViewStaff(null);
                        }}
                        staff={selectedViewStaff}
                        apiSource={selectedViewStaff?.apiSource}
                        detailedData={selectedViewStaff?.detailedData}
                        staffType="doctor"
                    />
                ) : (
                    <ViewStaff
                        visible={viewModalVisible}
                        onCancel={() => {
                            setViewModalVisible(false);
                            setSelectedViewStaff(null);
                        }}
                        staff={selectedViewStaff}
                        apiSource={selectedViewStaff?.apiSource}
                        detailedData={selectedViewStaff?.detailedData}
                        staffType="nurse"
                    />
                )
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Xóa {staffToDelete?.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'}
                    </div>
                }
                open={deleteConfirmVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText={`Có, xóa ${staffToDelete?.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'}`}
                cancelText="Hủy"
                okButtonProps={{
                    danger: true,
                    type: 'primary'
                }}
                width={500}
            >
                {staffToDelete && (
                    <div>
                        <p>Bạn có chắc chắn muốn xóa <strong>{staffToDelete.name}</strong>?</p>
                        <div style={{
                            background: '#f5f5f5',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#666',
                            marginTop: 16
                        }}>
                            <div><strong>Loại:</strong> {staffToDelete.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'}</div>
                            <div><strong>Email:</strong> {staffToDelete.email}</div>
                            <div><strong>API:</strong> {staffToDelete.type === 'doctor' ? 'deleteDoctor' : 'deleteUser'}</div>
                            <div><strong>Service:</strong> {staffToDelete.type === 'doctor' ? 'doctorService' : 'userService'}</div>
                            <div style={{ color: '#ff4d4f', marginTop: 8, fontWeight: 500 }}>
                                ⚠️ Hành động này không thể hoàn tác.
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <DeleteStaff
                visible={deleteModalVisible}
                onCancel={handleDeleteCancel}
                onSuccess={handleDeleteSuccess}
                staff={selectedStaff}
            />
        </div>
    );
};

export default StaffManagementPage;