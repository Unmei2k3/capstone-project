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
    UserAddOutlined,
    BuildOutlined
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
import { deleteUser, getUserById, getAllUsers } from '../../../services/userService';
import AddHospitalStaff from './AddHospitalStaff';

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
        totalHospitalStaff: 0,
        activeDoctors: 0,
        activeNurses: 0,
        activeHospitalStaff: 0,
        inactiveDoctors: 0,
        inactiveNurses: 0,
        inactiveHospitalStaff: 0
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

    // ✅ Enhanced fetchStaff with getAllUsers for hospital staff
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
                        userId: user.id || doctor.id,
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
                        licenseNumber: `Doc-${doctor.id || index}`,
                        status: user.active ? 'active' : 'inactive',
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

            // ✅ Fetch nurses from API with role filtering (roleType: 7)
            console.log('🔄 Đang tải danh sách điều dưỡng cho ID bệnh viện:', hospitalId);
            const nurseResponse = await getStaffNurseByHospitalId(hospitalId);
            console.log('📥 Phản hồi API Điều dưỡng:', nurseResponse);

            let nurses = [];
            if (nurseResponse?.success && Array.isArray(nurseResponse.result)) {
                console.log('📋 Đang xử lý danh sách điều dưỡng, số lượng:', nurseResponse.result.length);

                // ✅ Filter nurses with roleType 7 and valid role
                const validNurses = nurseResponse.result.filter(nurse => {
                    const hasValidRole = nurse.role !== null && nurse.role !== undefined;
                    const isNurse = nurse.role?.roleType === 7; // ✅ Updated to roleType 7
                    if (!hasValidRole) {
                        console.log('❌ Loại bỏ nhân viên không có role:', nurse.fullname, '(ID:', nurse.id, ')');
                    }
                    if (!isNurse && hasValidRole) {
                        console.log('ℹ️ Bỏ qua nhân viên không phải điều dưỡng:', nurse.fullname, 'RoleType:', nurse.role?.roleType);
                    }
                    return hasValidRole && isNurse;
                });

                console.log('✅ Điều dưỡng hợp lệ sau khi lọc:', validNurses.length, '/', nurseResponse.result.length);

                nurses = validNurses.map((nurse, index) => {
                    console.log(`👩‍⚕️ Đang xử lý điều dưỡng ${index + 1}:`, nurse.fullname, 'Role:', nurse.role?.name);

                    return {
                        id: nurse.id || `nurse-${index}`,
                        userId: nurse.id,
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

                        // ✅ Hospital information from API
                        hospitalId: nurse.hospitalId,
                        hospitalName: nurse.hospitalName,

                        // ✅ Role information (guaranteed to exist after filtering)
                        roleId: nurse.role.id,
                        roleName: nurse.role.name,
                        roleType: nurse.role.roleType,

                        // ✅ Default values for display
                        licenseNumber: `Y tá-${nurse.staffId || nurse.id}`,
                        status: nurse.active ? 'active' : 'inactive',
                        createdAt: nurse.createdAt || new Date().toISOString(),
                        schedule: nurse.schedule || 'Thứ 2-6: 8:00-17:00',
                        shift: nurse.shift || 'Ca ngày (7AM-7PM)',

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

                // ✅ Filter nurses with roleType 7 and valid role
                const validNurses = nurseResponse.filter(nurse => {
                    const hasValidRole = nurse.role !== null && nurse.role !== undefined;
                    const isNurse = nurse.role?.roleType === 7; // ✅ Updated to roleType 7
                    if (!hasValidRole) {
                        console.log('❌ Loại bỏ nhân viên không có role:', nurse.fullname || nurse.userName, '(ID:', nurse.id, ')');
                    }
                    if (!isNurse && hasValidRole) {
                        console.log('ℹ️ Bỏ qua nhân viên không phải điều dưỡng:', nurse.fullname, 'RoleType:', nurse.role?.roleType);
                    }
                    return hasValidRole && isNurse;
                });

                console.log('✅ Điều dưỡng hợp lệ sau khi lọc:', validNurses.length, '/', nurseResponse.length);

                nurses = validNurses.map((nurse, index) => {
                    console.log(`👩‍⚕️ Đang xử lý điều dưỡng ${index + 1}:`, nurse.fullname, 'Role:', nurse.role?.name);

                    return {
                        id: nurse.id || `nurse-${index}`,
                        userId: nurse.id,
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

                        // ✅ Hospital information
                        hospitalId: nurse.hospitalId,
                        hospitalName: nurse.hospitalName,

                        // ✅ Role information (guaranteed to exist after filtering)
                        roleId: nurse.role.id,
                        roleName: nurse.role.name,
                        roleType: nurse.role.roleType,

                        // ✅ Default values
                        licenseNumber: `Y tá-${nurse.staffId || nurse.id}`,
                        status: nurse.active ? 'active' : 'inactive',
                        createdAt: nurse.createdAt || new Date().toISOString(),
                        schedule: nurse.schedule || 'Thứ 2-6: 8:00-17:00',
                        shift: nurse.shift || 'Ca ngày (7AM-7PM)',

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

            // ✅ Fetch hospital staff with roleType: 4 using getAllUsers
            console.log('🔄 Đang tải tất cả users để lọc hospital staff...');
            let hospitalStaff = [];

            try {
                const allUsersResponse = await getAllUsers();
                console.log('📥 Phản hồi API getAllUsers:', allUsersResponse);

                if (allUsersResponse?.success && Array.isArray(allUsersResponse.result)) {
                    console.log('📋 Đang lọc hospital staff từ tất cả users, tổng số:', allUsersResponse.result.length);

                    // ✅ Filter users with roleType 4 (Hospital Staff)
                    const hospitalStaffUsers = allUsersResponse.result.filter(user => {
                        const isHospitalStaff = user.role?.roleType === 3;
                        if (isHospitalStaff) {
                            console.log(`🏢 Tìm thấy hospital staff: ${user.fullname} (Role: ${user.role?.name})`);
                        }
                        return isHospitalStaff;
                    });

                    console.log('✅ Hospital staff đã lọc:', hospitalStaffUsers.length, 'từ', allUsersResponse.result.length, 'users');

                    hospitalStaff = hospitalStaffUsers.map((staff, index) => {
                        console.log(`🏢 Đang xử lý hospital staff ${index + 1}:`, staff.fullname, 'Role:', staff.role?.name);

                        return {
                            id: staff.id || `hospital-staff-${index}`,
                            userId: staff.id,
                            staffId: staff.id || `HS-${staff.id}`,
                            type: 'hospital-staff',
                            name: staff.fullname || staff.userName || 'Nhân viên BV chưa xác định',
                            fullname: staff.fullname || staff.userName || 'Nhân viên BV chưa xác định',
                            email: staff.email || 'Không có email',
                            phone: staff.phoneNumber || 'Không có điện thoại',
                            phoneNumber: staff.phoneNumber || 'Không có điện thoại',
                            userName: staff.userName || '',
                            avatarUrl: staff.avatarUrl || '',
                            avatar: staff.avatarUrl || '',
                            gender: staff.gender,
                            dob: staff.dob,
                            cccd: staff.cccd || '',
                            province: staff.province,
                            ward: staff.ward,
                            streetAddress: staff.streetAddress || '',
                            job: staff.job || staff.role?.name || 'Nhân viên Bệnh viện',
                            description: staff.description || 'Không có mô tả',

                            // ✅ Hospital information
                            hospitalId: hospitalId, // Use current hospital ID
                            hospitalName: user?.hospitals?.[0]?.name || '',

                            // ✅ Role information
                            roleId: staff.role?.id,
                            roleName: staff.role?.name,
                            roleType: staff.role?.roleType || 4,

                            // ✅ Status from user data
                            status: staff.active ? 'active' : 'inactive',

                            // ✅ Default values
                            licenseNumber: `NV-${staff.id}`,
                            createdAt: staff.createdAt || new Date().toISOString(),
                            schedule: staff.schedule || 'Thứ 2-6: 8:00-17:00',

                            // ✅ Store original data for reference
                            originalData: {
                                staff: staff,
                                user: staff,
                                apiResponse: allUsersResponse
                            }
                        };
                    });
                } else if (Array.isArray(allUsersResponse)) {
                    // ✅ Fallback for direct array response
                    console.log('📋 Đang lọc hospital staff từ direct array, tổng số:', allUsersResponse.length);

                    // ✅ Filter users with roleType 4 (Hospital Staff)
                    const hospitalStaffUsers = allUsersResponse.filter(user => {
                        const isHospitalStaff = user.role?.roleType === 4;
                        if (isHospitalStaff) {
                            console.log(`🏢 Tìm thấy hospital staff: ${user.fullname} (Role: ${user.role?.name})`);
                        }
                        return isHospitalStaff;
                    });

                    console.log('✅ Hospital staff đã lọc:', hospitalStaffUsers.length, 'từ', allUsersResponse.length, 'users');

                    hospitalStaff = hospitalStaffUsers.map((staff, index) => {
                        console.log(`🏢 Đang xử lý hospital staff ${index + 1}:`, staff.fullname, 'Role:', staff.role?.name);

                        return {
                            id: staff.id || `hospital-staff-${index}`,
                            userId: staff.id,
                            staffId: staff.id || `HS-${staff.id}`,
                            type: 'hospital-staff',
                            name: staff.fullname || staff.userName || 'Nhân viên BV chưa xác định',
                            fullname: staff.fullname || staff.userName || 'Nhân viên BV chưa xác định',
                            email: staff.email || 'Không có email',
                            phone: staff.phoneNumber || 'Không có điện thoại',
                            phoneNumber: staff.phoneNumber || 'Không có điện thoại',
                            userName: staff.userName || '',
                            avatarUrl: staff.avatarUrl || '',
                            avatar: staff.avatarUrl || '',
                            gender: staff.gender,
                            dob: staff.dob,
                            cccd: staff.cccd || '',
                            province: staff.province,
                            ward: staff.ward,
                            streetAddress: staff.streetAddress || '',
                            job: staff.job || staff.role?.name || 'Nhân viên Bệnh viện',
                            description: staff.description || 'Không có mô tả',

                            // ✅ Hospital information
                            hospitalId: hospitalId, // Use current hospital ID
                            hospitalName: user?.hospitals?.[0]?.name || '',

                            // ✅ Role information
                            roleId: staff.role?.id,
                            roleName: staff.role?.name,
                            roleType: staff.role?.roleType || 4,

                            // ✅ Status from user data
                            status: staff.active ? 'active' : 'inactive',

                            // ✅ Default values
                            licenseNumber: `NV-${staff.id}`,
                            createdAt: staff.createdAt || new Date().toISOString(),
                            schedule: staff.schedule || 'Thứ 2-6: 8:00-17:00',

                            // ✅ Store original data for reference
                            originalData: {
                                staff: staff,
                                user: staff,
                                apiResponse: allUsersResponse
                            }
                        };
                    });
                }

                console.log('✅ Đã xử lý danh sách hospital staff:', hospitalStaff);

            } catch (hospitalStaffError) {
                console.error('❌ Lỗi khi tải hospital staff từ getAllUsers:', hospitalStaffError);
                // Continue without hospital staff if API fails
                hospitalStaff = [];
            }

            // ✅ Apply filters
            let filteredDoctors = [...doctors];
            let filteredNurses = [...nurses];
            let filteredHospitalStaff = [...hospitalStaff];

            if (searchText) {
                const searchFilter = (item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.phoneNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.userName.toLowerCase().includes(searchText.toLowerCase());

                filteredDoctors = filteredDoctors.filter(searchFilter);
                filteredNurses = filteredNurses.filter(searchFilter);
                filteredHospitalStaff = filteredHospitalStaff.filter(searchFilter);
            }

            if (statusFilter !== 'all') {
                filteredDoctors = filteredDoctors.filter(doctor => doctor.status === statusFilter);
                filteredNurses = filteredNurses.filter(nurse => nurse.status === statusFilter);
                filteredHospitalStaff = filteredHospitalStaff.filter(staff => staff.status === statusFilter);
            }

            console.log('✅ Bác sĩ đã lọc:', filteredDoctors);
            console.log('✅ Điều dưỡng đã lọc:', filteredNurses);
            console.log('✅ Hospital staff đã lọc:', filteredHospitalStaff);

            // ✅ Combine staff based on active tab
            let allStaff = [];
            switch (activeTab) {
                case 'doctors':
                    allStaff = filteredDoctors;
                    break;
                case 'nurses':
                    allStaff = filteredNurses;
                    break;
                case 'hospital-staff':
                    allStaff = filteredHospitalStaff;
                    break;
                default:
                    allStaff = [...filteredDoctors, ...filteredNurses, ...filteredHospitalStaff];
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
            const activeHospitalStaff = hospitalStaff.filter(s => s.status === 'active').length;
            const inactiveHospitalStaff = hospitalStaff.filter(s => s.status === 'inactive').length;

            setStats({
                totalDoctors: doctors.length,
                totalNurses: nurses.length,
                totalHospitalStaff: hospitalStaff.length,
                activeDoctors,
                activeNurses,
                activeHospitalStaff,
                inactiveDoctors,
                inactiveNurses,
                inactiveHospitalStaff
            });

            console.log('📊 Thống kê đã cập nhật:', {
                totalDoctors: doctors.length,
                totalNurses: nurses.length,
                totalHospitalStaff: hospitalStaff.length,
                activeDoctors,
                activeNurses,
                activeHospitalStaff,
                inactiveDoctors,
                inactiveNurses,
                inactiveHospitalStaff
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
                totalHospitalStaff: 0,
                activeDoctors: 0,
                activeNurses: 0,
                activeHospitalStaff: 0,
                inactiveDoctors: 0,
                inactiveNurses: 0,
                inactiveHospitalStaff: 0
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
            } else {
                // ✅ Both nurse and hospital staff use getUserById
                console.log(`👩‍⚕️ Đang tải chi tiết ${staffMember.type} qua getUserById...`);
                staffData = await getUserById(staffMember.userId || staffMember.id);
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
                content: `Không thể tải chi tiết ${staffMember.type === 'doctor' ? 'bác sĩ' :
                    staffMember.type === 'nurse' ? 'điều dưỡng' : 'nhân viên bệnh viện'}`,
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
            } else {
                // ✅ Both nurse and hospital staff use deleteUser
                console.log(`👩‍⚕️ Đang xóa ${staffMember.type} qua deleteUser...`);
                deleteResponse = await deleteUser(staffMember.userId || staffMember.id);
                apiUsed = 'deleteUser';
            }

            console.log(`✅ Phản hồi ${apiUsed}:`, deleteResponse);

            const isSuccess = deleteResponse === true ||
                deleteResponse?.success === true ||
                deleteResponse?.message?.toLowerCase().includes('success') ||
                !deleteResponse?.error;

            if (isSuccess) {
                const staffTypeText = staffMember.type === 'doctor' ? 'Bác sĩ' :
                    staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên bệnh viện';

                dispatch(setMessage({
                    type: 'success',
                    content: `${staffTypeText} đã được xóa thành công!`,
                    duration: 4
                }));
                await fetchStaff();
                return Promise.resolve();
            } else {
                const staffTypeText = staffMember.type === 'doctor' ? 'bác sĩ' :
                    staffMember.type === 'nurse' ? 'điều dưỡng' : 'nhân viên bệnh viện';
                throw new Error(deleteResponse?.message || `Không thể xóa ${staffTypeText}`);
            }

        } catch (error) {
            const staffTypeText = staffMember.type === 'doctor' ? 'bác sĩ' :
                staffMember.type === 'nurse' ? 'điều dưỡng' : 'nhân viên bệnh viện';
            console.error(`❌ Lỗi khi xóa ${staffTypeText}:`, error);

            let errorMessage = `Không thể xóa ${staffTypeText}`;
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
        const staffTypeText = staffMember.type === 'doctor' ? 'Bác sĩ' :
            staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV';

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
                        // ✅ For nurse and hospital staff, just refresh the data
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

    // ✅ UPDATED: Enhanced columns with hospital staff support
    const columns = [
        {
            title: 'Nhân viên',
            key: 'staff',
            width: 350,
            render: (_, staffMember) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        src={staffMember.avatarUrl || staffMember.avatar}
                        icon={<UserOutlined />}
                        style={{
                            marginRight: 12,
                            backgroundColor: staffMember.type === 'doctor' ? '#1890ff' :
                                staffMember.type === 'nurse' ? '#52c41a' : '#722ed1'
                        }}
                    />
                    <div>
                        <div style={{
                            fontWeight: 500,
                            color: staffMember.type === 'doctor' ? '#1890ff' :
                                staffMember.type === 'nurse' ? '#52c41a' : '#722ed1'
                        }}>
                            {staffMember.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <Tag
                                size="small"
                                color={staffMember.type === 'doctor' ? 'blue' :
                                    staffMember.type === 'nurse' ? 'green' : 'purple'}
                                icon={staffMember.type === 'doctor' ? <MedicineBoxOutlined /> :
                                    staffMember.type === 'nurse' ? <HeartOutlined /> : <BuildOutlined />}
                            >
                                {staffMember.type === 'doctor' ? 'Bác sĩ' :
                                    staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'}
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
            width: 280,
            render: (_, staffMember) => (
                <div>
                    <div style={{ fontSize: '13px', marginBottom: 4 }}>📧 {staffMember.email}</div>
                    <div style={{ fontSize: '13px' }}>📞 {staffMember.phone || staffMember.phoneNumber}</div>
                </div>
            ),
        },
        {
            title: 'Vai trò & Chức vụ',
            key: 'role',
            width: 200,
            render: (_, staffMember) => (
                <div>
                    <Tag
                        color={staffMember.type === 'doctor' ? 'blue' :
                            staffMember.type === 'nurse' ? 'green' : 'purple'}
                        style={{ marginBottom: 4 }}
                    >
                        {staffMember.job}
                    </Tag>
                    {(staffMember.type === 'nurse' || staffMember.type === 'hospital-staff') && staffMember.roleName && (
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {staffMember.roleName}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
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
                    : `Xem ${staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'} (getUserById)`;

                const editTooltip = staffMember.type === 'doctor'
                    ? 'Sửa Bác sĩ (updateDoctor)'
                    : `Sửa ${staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'} (updateUser)`;

                const deleteTooltip = staffMember.type === 'doctor'
                    ? 'Xóa Bác sĩ (deleteDoctor)'
                    : `Xóa ${staffMember.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'} (deleteUser)`;

                return (
                    <Space size="small">
                        <Tooltip title={viewTooltip}>
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(staffMember)}
                                style={{
                                    color: staffMember.type === 'doctor' ? '#1890ff' :
                                        staffMember.type === 'nurse' ? '#52c41a' : '#722ed1'
                                }}
                            />
                        </Tooltip>

                        <Tooltip title={editTooltip}>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditStaff(staffMember)}
                                style={{
                                    color: staffMember.type === 'doctor' ? '#1890ff' :
                                        staffMember.type === 'nurse' ? '#52c41a' : '#722ed1'
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
                    Quản lý bác sĩ, điều dưỡng và nhân viên bệnh viện, thông tin và phân công công việc
                </p>
            </div>

            {/* ✅ Updated Statistics with Hospital Staff */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số Bác sĩ"
                            value={stats.totalDoctors}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số Điều dưỡng"
                            value={stats.totalNurses}
                            prefix={<HeartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên Bệnh viện"
                            value={stats.totalHospitalStaff}
                            prefix={<BuildOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng Hoạt động"
                            value={stats.activeDoctors + stats.activeNurses + stats.activeHospitalStaff}
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
                        <Button
                            type="primary"
                            icon={<BuildOutlined />}
                            onClick={() => handleAddStaff('hospital-staff')}
                            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                        >
                            Thêm Nhân viên
                        </Button>
                    </Space>
                </div>

                {/* ✅ Updated Add Staff Modals */}
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
                    ) : addingStaffType === 'nurse' ? (
                        <AddNurse
                            visible={addModalVisible}
                            onCancel={() => setAddModalVisible(false)}
                            onSuccess={() => {
                                setAddModalVisible(false);
                                fetchStaff();
                            }}
                        />
                    ) : (
                        <AddHospitalStaff
                            visible={addModalVisible}
                            onCancel={() => setAddModalVisible(false)}
                            onSuccess={() => {
                                setAddModalVisible(false);
                                fetchStaff();
                            }}
                        />
                    )
                )}

                {/* ✅ Updated Tabs with Hospital Staff */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ marginBottom: 16 }}
                >
                    <TabPane
                        tab={
                            <span>
                                <TeamOutlined />
                                Tất cả ({stats.totalDoctors + stats.totalNurses + stats.totalHospitalStaff})
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
                    <TabPane
                        tab={
                            <span>
                                <BuildOutlined />
                                Nhân viên BV ({stats.totalHospitalStaff})
                            </span>
                        }
                        key="hospital-staff"
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
                    scroll={{ x: 1000 }}
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
                <ViewStaff
                    visible={viewModalVisible}
                    onCancel={() => {
                        setViewModalVisible(false);
                        setSelectedViewStaff(null);
                    }}
                    staff={selectedViewStaff}
                    apiSource={selectedViewStaff?.apiSource}
                    detailedData={selectedViewStaff?.detailedData}
                    staffType={selectedViewStaff.type}
                />
            )}

            {/* ✅ Updated Delete Confirmation Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Xóa {staffToDelete?.type === 'doctor' ? 'Bác sĩ' :
                            staffToDelete?.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'}
                    </div>
                }
                open={deleteConfirmVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText={`Có, xóa ${staffToDelete?.type === 'doctor' ? 'Bác sĩ' :
                    staffToDelete?.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên BV'}`}
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
                            <div><strong>Loại:</strong> {
                                staffToDelete.type === 'doctor' ? 'Bác sĩ' :
                                    staffToDelete.type === 'nurse' ? 'Điều dưỡng' : 'Nhân viên Bệnh viện'
                            }</div>
                            <div><strong>Email:</strong> {staffToDelete.email}</div>
                            <div><strong>API:</strong> {
                                staffToDelete.type === 'doctor' ? 'deleteDoctor' : 'deleteUser'
                            }</div>
                            <div><strong>Service:</strong> {
                                staffToDelete.type === 'doctor' ? 'doctorService' : 'userService'
                            }</div>
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