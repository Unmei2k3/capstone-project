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
    getDoctorByUserId
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
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [specializationFilter, setSpecializationFilter] = useState('all');
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
        inactiveNurses: 0,
        departments: 0
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
            console.log('🏥 Hospital ID extracted from user:', currentHospitalId);
            console.log('🏥 Hospital name:', user.hospitals[0].name);
            setHospitalId(currentHospitalId);
        } else {
            console.warn('⚠️ No hospital found in user data:', user);
        }
    }, [user]);

    const departments = [
        { id: 1, name: 'Cardiology' },
        { id: 2, name: 'Neurology' },
        { id: 3, name: 'Emergency' },
        { id: 4, name: 'Pediatrics' },
        { id: 5, name: 'Orthopedics' },
        { id: 6, name: 'Surgery' },
        { id: 7, name: 'Internal Medicine' },
        { id: 8, name: 'Radiology' },
        { id: 9, name: 'Laboratory' }
    ];

    const specializations = [
        'Cardiology',
        'Neurology',
        'Emergency Medicine',
        'Pediatrics',
        'Orthopedics',
        'General Surgery',
        'Internal Medicine',
        'Radiology',
        'Pathology',
        'Anesthesiology',
        'Critical Care',
        'Intensive Care',
        'Operating Room',
        'Recovery'
    ];



    // ✅ Simplified fetchStaff without any fallback/callback logic
    const fetchStaff = async () => {
        if (!hospitalId) {
            console.warn('⚠️ No hospital ID available, cannot fetch staff');
            return;
        }

        setLoading(true);
        try {
            console.log('🔄 Fetching staff data...');
            console.log('🏥 Using hospital ID:', hospitalId);

            // ✅ Fetch doctors from API
            console.log('🔄 Fetching doctors...');
            const doctorResponse = await getAllDoctors();
            console.log('📥 Doctor API Response:', doctorResponse);

            let doctors = [];
            if (Array.isArray(doctorResponse)) {
                console.log('📋 Processing doctors, count:', doctorResponse.length);
                doctors = doctorResponse.map((doctor, index) => {
                    const user = doctor.user || {};
                    return {
                        id: doctor.id || user.id || `doctor-${index}`,
                        type: 'doctor',
                        name: user.fullname || user.userName || doctor.description || 'Unknown Doctor',
                        fullname: user.fullname || user.userName || doctor.description || 'Unknown Doctor',
                        email: user.email || `doctor${index + 1}@hospital.com`,
                        phone: user.phoneNumber || 'N/A',
                        phoneNumber: user.phoneNumber || 'N/A',
                        userName: user.userName || '',
                        avatarUrl: user.avatarUrl || '',
                        avatar: user.avatarUrl || '',
                        gender: user.gender,
                        dob: user.dob,
                        cccd: user.cccd || '',
                        province: user.province,
                        ward: user.ward,
                        streetAddress: user.streetAddress || '',
                        job: user.job || 'Doctor',
                        description: doctor.description || 'No description',
                        practicingFrom: doctor.practicingFrom || new Date().toISOString(),
                        specialization: 'General Medicine',
                        departmentId: 1,
                        departmentName: getDepartmentName(1),
                        licenseNumber: `Doc-${doctor.id || index}`,
                        experience: '5 years',
                        education: 'Medical Degree',
                        status: 'active',
                        consultationFee: 200000,
                        totalPatients: Math.floor(Math.random() * 1000),
                        rating: (4 + Math.random()).toFixed(1),
                        createdAt: doctor.practicingFrom || new Date().toISOString(),
                        schedule: 'Mon-Fri: 8:00-17:00',
                        originalData: {
                            doctor: doctor,
                            user: user,
                            hospitalAffiliations: doctor.hospitalAffiliations || [],
                            specializations: doctor.specializations || []
                        }
                    };
                });
            } else {
                console.warn('⚠️ Unexpected doctor API response format:', doctorResponse);
                doctors = []; // ✅ Empty array instead of fallback
            }

            console.log('✅ Processed doctors:', doctors);

            // ✅ Fetch nurses from API - no fallback
            console.log('🔄 Fetching nurses for hospital ID:', hospitalId);
            const nurseResponse = await getStaffNurseByHospitalId(hospitalId);
            console.log('📥 Nurse API Response:', nurseResponse);

            let nurses = [];
            if (Array.isArray(nurseResponse)) {
                console.log('📋 Processing nurses, count:', nurseResponse.length);
                nurses = nurseResponse.map((nurse, index) => {
                    const nurseUser = nurse || {};
                    console.log(`👩‍⚕️ Processing nurse ${index + 1}:`, nurseUser);

                    return {
                        id: nurse.id || nurseUser.id || `nurse-${index}`,
                        type: 'nurse',
                        name: nurseUser.fullname || 'Unknown Nurse',
                        fullname: nurseUser.fullname || 'Unknown Nurse',
                        email: nurseUser.email || 'No email',
                        phone: nurseUser.phoneNumber || 'No phone',
                        phoneNumber: nurseUser.phoneNumber || 'No phone',
                        userName: nurseUser.userName || '',
                        avatarUrl: nurseUser.avatarUrl || '',
                        avatar: nurseUser.avatarUrl || '',
                        gender: nurseUser.gender,
                        dob: nurseUser.dob,
                        cccd: nurseUser.cccd || '',
                        province: nurseUser.province,
                        ward: nurseUser.ward,
                        streetAddress: nurseUser.streetAddress || '',
                        job: nurseUser.job || 'Nurse',
                        description: nurse.description || 'No description',
                        specialization: nurse.specialization || 'General Nursing',
                        departmentId: nurse.departmentId || 1,
                        departmentName: getDepartmentName(nurse.departmentId || 1),
                        licenseNumber: `Nurse${nurse.id || index}`,
                        experience: nurse.experience || '3 years',
                        education: nurse.education || 'Nursing Degree',
                        status: nurse.status || 'active',
                        consultationFee: 0,
                        totalPatients: nurse.totalPatients || Math.floor(Math.random() * 500),
                        rating: nurse.rating || (4 + Math.random()).toFixed(1),
                        createdAt: nurse.createdAt || new Date().toISOString(),
                        schedule: nurse.schedule || 'Mon-Fri: 8:00-17:00',
                        shift: nurse.shift || 'Day Shift (7AM-7PM)',
                        certifications: nurse.certifications || 'BLS, CPR',
                        originalData: {
                            nurse: nurse,
                            user: nurseUser,
                            hospitalAffiliations: nurse.hospitalAffiliations || [],
                            specializations: nurse.specializations || []
                        }
                    };
                });
            } else {
                console.warn('⚠️ Unexpected nurse API response format:', nurseResponse);
                nurses = []; // ✅ Empty array instead of fallback
            }

            console.log('✅ Processed nurses:', nurses);

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

            if (departmentFilter !== 'all') {
                filteredDoctors = filteredDoctors.filter(doctor => doctor.departmentId === parseInt(departmentFilter));
                filteredNurses = filteredNurses.filter(nurse => nurse.departmentId === parseInt(departmentFilter));
            }

            if (statusFilter !== 'all') {
                filteredDoctors = filteredDoctors.filter(doctor => doctor.status === statusFilter);
                filteredNurses = filteredNurses.filter(nurse => nurse.status === statusFilter);
            }

            if (specializationFilter !== 'all') {
                filteredDoctors = filteredDoctors.filter(doctor => doctor.specialization === specializationFilter);
                filteredNurses = filteredNurses.filter(nurse => nurse.specialization === specializationFilter);
            }

            console.log('✅ Filtered doctors:', filteredDoctors);
            console.log('✅ Filtered nurses:', filteredNurses);

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

            console.log('✅ Final staff list:', allStaff);

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
                inactiveNurses,
                departments: departments.length
            });

            console.log('📊 Updated stats:', {
                totalDoctors: doctors.length,
                totalNurses: nurses.length,
                activeDoctors,
                activeNurses,
                inactiveDoctors,
                inactiveNurses
            });

        } catch (error) {
            console.error('❌ Error fetching staff:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Failed to fetch staff data. Please try again.',
                duration: 4
            }));
            // ✅ Set empty arrays instead of fallback data
            setStaff([]);
            setStats({
                totalDoctors: 0,
                totalNurses: 0,
                activeDoctors: 0,
                activeNurses: 0,
                inactiveDoctors: 0,
                inactiveNurses: 0,
                departments: 0
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
    }, [hospitalId, activeTab, pagination.current, pagination.pageSize, searchText, departmentFilter, statusFilter, specializationFilter]);

    const getDepartmentName = (departmentId) => {
        const dept = departments.find(d => d.id === departmentId);
        return dept ? dept.name : 'Unknown Department';
    };


    const handleViewDetails = async (staffMember) => {
        console.log('👁️ Viewing staff:', staffMember);
        console.log('🔍 Staff type:', staffMember.type);

        try {
            let staffData;

            if (staffMember.type === 'doctor') {
                console.log('👨‍⚕️ Fetching doctor details via getDoctorById...');
                staffData = await getDoctorByUserId(staffMember.id);
            } else if (staffMember.type === 'nurse') {
                console.log('👩‍⚕️ Fetching nurse details via getUserById...');
                staffData = await getUserById(staffMember.id);
            } else {
                // Fallback for unknown type
                console.log('👤 Unknown type, using getUserById...');
                staffData = await getUserById(staffMember.id);
            }

            console.log('✅ Fetched staff details:', staffData);

            // Set the detailed data for viewing
            setSelectedViewStaff({
                ...staffMember,
                detailedData: staffData,
                apiSource: staffMember.type === 'doctor' ? 'getDoctorById' : 'getUserById'
            });
            setViewModalVisible(true);

        } catch (error) {
            console.error('❌ Error fetching staff details:', error);
            dispatch(setMessage({
                type: 'error',
                content: `Failed to load ${staffMember.type} details`,
                duration: 4
            }));

            // Show modal with existing data as fallback
            setSelectedViewStaff(staffMember);
            setViewModalVisible(true);
        }
    };

    const handleEditStaff = (staffMember) => {
        console.log('✏️ Editing staff:', staffMember);
        console.log('🔍 Staff type:', staffMember.type);

        // Add type info for the edit modal to know which service to use
        setSelectedStaff({
            ...staffMember,
            editApiType: staffMember.type === 'doctor' ? 'updateDoctor' : 'updateUser'
        });
        setEditModalVisible(true);
    };

    const handleDeleteStaff = async (staffMember) => {
        console.log('🗑️ Deleting staff:', staffMember);
        console.log('🔍 Staff type:', staffMember.type);

        try {
            let deleteResponse;
            let apiUsed;

            if (staffMember.type === 'doctor') {
                console.log('👨‍⚕️ Deleting doctor via deleteDoctor...');
                deleteResponse = await deleteDoctor(staffMember.id);
                apiUsed = 'deleteDoctor';
            } else if (staffMember.type === 'nurse') {
                console.log('👩‍⚕️ Deleting nurse via deleteUser...');
                deleteResponse = await deleteUser(staffMember.id);
                apiUsed = 'deleteUser';
            } else {
                console.log('👤 Unknown type, using deleteUser...');
                deleteResponse = await deleteUser(staffMember.id);
                apiUsed = 'deleteUser';
            }

            console.log(`✅ ${apiUsed} response:`, deleteResponse);

            // Check if deletion was successful
            const isSuccess = deleteResponse === true ||
                deleteResponse?.success === true ||
                deleteResponse?.message?.toLowerCase().includes('success') ||
                !deleteResponse?.error;

            if (isSuccess) {
                dispatch(setMessage({
                    type: 'success',
                    content: `${staffMember.type === 'doctor' ? 'Bác sĩ' : 'Y tá'} đã được xóa thành công!`,
                    duration: 4
                }));
                await fetchStaff(); // Refresh the staff list
                return Promise.resolve();
            } else {
                throw new Error(deleteResponse?.message || `Failed to delete ${staffMember.type}`);
            }

        } catch (error) {
            console.error(`❌ Error deleting ${staffMember.type}:`, error);

            let errorMessage = `Không thể xóa ${staffMember.type}`;
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
        console.log('🚨 showDeleteConfirm called with:', staffMember);
        setStaffToDelete(staffMember);
        setDeleteConfirmVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        console.log('🆗 Delete confirmed, calling handleDeleteStaff...');
        try {
            setDeleteConfirmVisible(false);
            await handleDeleteStaff(staffToDelete);
            console.log('✅ Delete completed successfully');
        } catch (error) {
            console.error('❌ Delete failed:', error);
        } finally {
            setStaffToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('❌ Delete cancelled');
        setDeleteConfirmVisible(false);
        setStaffToDelete(null);
    };

    // const handleView = (staffMember) => {
    //     handleViewDetails(staffMember);
    // };

    // const handleEdit = (staffMember) => {
    //     handleEditStaff(staffMember);
    // };

    const handleDelete = (staffMember) => {
        showDeleteConfirm(staffMember);
    };

    const handleDeleteSuccess = async () => {
        console.log('✅ Delete operation completed successfully');
        setDeleteModalVisible(false);
        setSelectedStaff(null);

        try {
            await fetchStaff();
            console.log('🔄 Staff data refreshed after deletion');
        } catch (error) {
            console.error('❌ Error refreshing data after deletion:', error);
        }
    };

    const handleDeleteCancel = () => {
        console.log('❌ Delete operation cancelled');
        setDeleteModalVisible(false);
        setSelectedStaff(null);
    };

    const handleStatusToggle = (staffMember) => {
        const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';

        Modal.confirm({
            title: `${newStatus === 'active' ? 'Activate' : 'Deactivate'} ${staffMember.type === 'doctor' ? 'Doctor' : 'Nurse'}`,
            content: `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${staffMember.name}?`,
            okText: 'Yes',
            onOk: async () => {
                try {
                    if (staffMember.type === 'doctor') {
                        const response = await updateDoctorStatus(staffMember.id, newStatus);
                        if (response.success) {
                            dispatch(setMessage({
                                type: 'success',
                                content: `${staffMember.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
                                duration: 4
                            }));
                            fetchStaff();
                        }
                    } else {
                        // ✅ For nurses, just refresh without fallback message
                        fetchStaff();
                    }
                } catch (error) {
                    dispatch(setMessage({
                        type: 'error',
                        content: `Failed to update ${staffMember.type} status. Please try again.`,
                        duration: 4
                    }));
                }
            }
        });
    };

    const columns = [
        {
            title: 'Staff Member',
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
                                {staffMember.type === 'doctor' ? 'Doctor' : 'Nurse'}
                            </Tag>
                            {staffMember.licenseNumber}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact',
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
            title: 'Department',
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
            title: 'Specialization',
            dataIndex: 'specialization',
            key: 'specialization',
            width: 150,
            render: (specialization) => (
                <Tag color="purple">{specialization}</Tag>
            ),
        },
        {
            title: 'Experience & Rating',
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
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, staffMember) => (
                <Tag
                    color={staffMember.status === 'active' ? 'success' : 'error'}
                    icon={staffMember.status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStatusToggle(staffMember)}
                >
                    {staffMember.status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, staffMember) => {
                // ✅ Determine action tooltips based on type
                const viewTooltip = staffMember.type === 'doctor'
                    ? 'View Doctor (getDoctorById)'
                    : 'View Nurse (getUserById)';

                const editTooltip = staffMember.type === 'doctor'
                    ? 'Edit Doctor (updateDoctor)'
                    : 'Edit Nurse (updateUser)';

                const deleteTooltip = staffMember.type === 'doctor'
                    ? 'Delete Doctor (deleteDoctor)'
                    : 'Delete Nurse (deleteUser)';

                return (
                    <Space size="small">
                        <Tooltip title={viewTooltip}>
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(staffMember)} // ✅ Type-aware function
                                style={{
                                    color: staffMember.type === 'doctor' ? '#1890ff' : '#52c41a'
                                }}
                            />
                        </Tooltip>

                        <Tooltip title={editTooltip}>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditStaff(staffMember)} // ✅ Type-aware function
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
                                    console.log('🔥 Delete button clicked for:', staffMember);
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
        switch (filterType) {
            case 'department':
                setDepartmentFilter(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            case 'specialization':
                setSpecializationFilter(value);
                break;
        }
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleAddStaff = (type) => {
        console.log('🔧 Adding staff of type:', type);
        setAddingStaffType(type); // ✅ Set type for adding
        setAddModalVisible(true);
    };


    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    <TeamOutlined style={{ marginRight: 12 }} />
                    Staff Management
                </Title>
                <p style={{ color: '#8c8c8c', marginTop: 8 }}>
                    Manage hospital doctors and nurses, their information, and assignments
                </p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Doctors"
                            value={stats.totalDoctors}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Nurses"
                            value={stats.totalNurses}
                            prefix={<HeartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Active Staff"
                            value={stats.activeDoctors + stats.activeNurses}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Departments"
                            value={stats.departments}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#722ed1' }}
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
                            placeholder="Search staff..."
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => !e.target.value && setSearchText('')}
                        />

                        <Select
                            placeholder="Department"
                            style={{ width: 150 }}
                            value={departmentFilter}
                            onChange={(value) => handleFilterChange('department', value)}
                        >
                            <Option value="all">All Departments</Option>
                            {departments.map(dept => (
                                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                            ))}
                        </Select>

                        <Select
                            placeholder="Specialization"
                            style={{ width: 150 }}
                            value={specializationFilter}
                            onChange={(value) => handleFilterChange('specialization', value)}
                        >
                            <Option value="all">All Specializations</Option>
                            {specializations.map(spec => (
                                <Option key={spec} value={spec}>{spec}</Option>
                            ))}
                        </Select>

                        <Select
                            placeholder="Status"
                            style={{ width: 120 }}
                            value={statusFilter}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
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
                            Thêm Y tá
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
                            departments={departments}
                            specializations={specializations}
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
                                All Staff ({stats.totalDoctors + stats.totalNurses})
                            </span>
                        }
                        key="all"
                    />
                    <TabPane
                        tab={
                            <span>
                                <MedicineBoxOutlined />
                                Doctors ({stats.totalDoctors})
                            </span>
                        }
                        key="doctors"
                    />
                    <TabPane
                        tab={
                            <span>
                                <HeartOutlined />
                                Nurses ({stats.totalNurses})
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
                            `${range[0]}-${range[1]} of ${total} staff members`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1300 }}
                />
            </Card>

            {/* Edit Staff Modal - Unified for both Doctor and Nurse */}
            {editModalVisible && selectedStaff && (
                <EditStaff
                    visible={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onSuccess={() => {
                        setEditModalVisible(false);
                        fetchStaff();
                    }}
                    staff={selectedStaff}
                    departments={departments}
                    specializations={specializations}
                />
            )}

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
                        staffType="doctor" // ✅ Pass explicit type
                    />
                ) : (
                    <ViewStaff  // ✅ Có thể tạo ViewNurse component riêng hoặc dùng ViewStaff
                        visible={viewModalVisible}
                        onCancel={() => {
                            setViewModalVisible(false);
                            setSelectedViewStaff(null);
                        }}
                        staff={selectedViewStaff}
                        apiSource={selectedViewStaff?.apiSource}
                        detailedData={selectedViewStaff?.detailedData}
                        staffType="nurse" // ✅ Pass explicit type
                    />
                )
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Xóa {staffToDelete?.type === 'doctor' ? 'Bác sĩ' : 'Y tá'}
                    </div>
                }
                open={deleteConfirmVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText={`Có, xóa ${staffToDelete?.type === 'doctor' ? 'Bác sĩ' : 'Y tá'}`}
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
                            <div><strong>Loại:</strong> {staffToDelete.type === 'doctor' ? 'Bác sĩ' : 'Y tá'}</div>
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