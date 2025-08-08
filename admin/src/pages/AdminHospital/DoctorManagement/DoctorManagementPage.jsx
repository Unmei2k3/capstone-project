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
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import {
  getDoctors,
  deleteDoctor,
  updateDoctorStatus
} from '../../../services/doctorService';


import AddStaff from './AddStaff';
import EditStaff from './EditStaff';
import ViewStaff from './ViewStaff';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const DoctorManagementPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0
  });


  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const dispatch = useDispatch();


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
    'Anesthesiology'
  ];


  const fetchDoctors = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching doctors...');
      
      const response = await getDoctors({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        specialization: specializationFilter !== 'all' ? specializationFilter : undefined
      });

      console.log('📥 API Response:', response);

      if (response.success && response.result) {
        
        const transformedDoctors = response.result.map((doctor, index) => {
          console.log(`👨‍⚕️ Doctor ${index + 1}:`, doctor);
          
          return {
            id: doctor.id || doctor.userId || index,
            fullname: doctor.fullName || doctor.fullname || doctor.name || 'Unknown Doctor',
            email: doctor.email || `doctor${index + 1}@hospital.com`,
            phoneNumber: doctor.phoneNumber || doctor.phone || 'N/A',
            specialization: doctor.specialization || 'General Medicine',
            departmentId: doctor.departmentId || 1,
            departmentName: doctor.departmentName || getDepartmentName(doctor.departmentId) || 'General',
            licenseNumber: doctor.licenseNumber || `MD${doctor.id || index}`,
            experience: doctor.experience || doctor.yearsOfExperience || '5 years',
            education: doctor.education || doctor.qualification || 'Medical Degree',
            status: doctor.status || (doctor.isActive !== false ? 'active' : 'inactive'),
            avatarUrl: doctor.avatarUrl || doctor.avatar || '',
            gender: doctor.gender,
            dob: doctor.dob || doctor.dateOfBirth,
            consultationFee: doctor.consultationFee || doctor.fee || 200000,
            totalPatients: doctor.totalPatients || doctor.patientCount || 0,
            rating: doctor.rating || doctor.averageRating || 4.5,
            createdAt: doctor.createdAt || doctor.joinDate || new Date().toISOString(),
            schedule: doctor.schedule || doctor.workingHours || 'Mon-Fri: 8:00-17:00',
            cccd: doctor.cccd || doctor.identityCard || '',
            province: doctor.province || doctor.address?.province || 'Ho Chi Minh City',
            ward: doctor.ward || doctor.address?.ward || 'District 1',
            streetAddress: doctor.streetAddress || doctor.address?.street || '',
            job: doctor.job || 'Doctor'
          };
        });

        console.log('✅ Transformed doctors:', transformedDoctors);

        setDoctors(transformedDoctors);
        setPagination(prev => ({
          ...prev,
          total: response.total || transformedDoctors.length
        }));

        
        const activeCount = transformedDoctors.filter(d => d.status === 'active').length;
        const inactiveCount = transformedDoctors.filter(d => d.status === 'inactive').length;
        
        setStats({
          total: transformedDoctors.length,
          active: activeCount,
          inactive: inactiveCount,
          departments: departments.length
        });

      } else {
        console.warn('❌ Invalid API response:', response);
        setDoctors([]);
        dispatch(setMessage({
          type: 'warning',
          content: 'No doctors found or invalid response format.',
          duration: 4
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      dispatch(setMessage({
        type: 'error',
        content: 'Failed to fetch doctors. Please try again.',
        duration: 4
      }));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

 
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };


  const handleView = (doctor) => {
    console.log('👁️ Viewing doctor:', doctor);
    setSelectedDoctor(doctor);
    setViewModalVisible(true);
  };

  const handleEdit = (doctor) => {
    console.log('✏️ Editing doctor:', doctor);
    setSelectedDoctor(doctor);
    setEditModalVisible(true);
  };

  const handleDelete = (doctor) => {
    Modal.confirm({
      title: 'Delete Doctor',
      content: `Are you sure you want to delete ${doctor.fullname}?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteDoctor(doctor.id);
          if (response.success) {
            dispatch(setMessage({
              type: 'success',
              content: `${doctor.fullname} has been deleted successfully.`,
              duration: 4
            }));
            fetchDoctors();
          }
        } catch (error) {
          dispatch(setMessage({
            type: 'error',
            content: 'Failed to delete doctor. Please try again.',
            duration: 4
          }));
        }
      }
    });
  };

  const handleStatusToggle = (doctor) => {
    const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
    
    Modal.confirm({
      title: `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Doctor`,
      content: `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${doctor.fullname}?`,
      okText: 'Yes',
      onOk: async () => {
        try {
          const response = await updateDoctorStatus(doctor.id, newStatus);
          if (response.success) {
            dispatch(setMessage({
              type: 'success',
              content: `${doctor.fullname} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
              duration: 4
            }));
            fetchDoctors();
          }
        } catch (error) {
          dispatch(setMessage({
            type: 'error',
            content: 'Failed to update doctor status. Please try again.',
            duration: 4
          }));
        }
      }
    });
  };

  
  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      width: 250,
      render: (_, doctor) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={doctor.avatarUrl}
            icon={<UserOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 500, color: '#1890ff' }}>
              {doctor.fullname}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {doctor.licenseNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_, doctor) => (
        <div>
          <div style={{ fontSize: '13px' }}>📧 {doctor.email}</div>
          <div style={{ fontSize: '13px' }}>📞 {doctor.phoneNumber}</div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (department) => (
        <Tag color="blue" icon={<MedicineBoxOutlined />}>
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
      render: (_, doctor) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            {doctor.experience}
          </div>
          <Rate disabled value={doctor.rating} style={{ fontSize: '12px' }} />
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, doctor) => (
        <Tag 
          color={doctor.status === 'active' ? 'success' : 'error'}
          icon={doctor.status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ cursor: 'pointer' }}
          onClick={() => handleStatusToggle(doctor)}
        >
          {doctor.status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, doctor) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleView(doctor)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(doctor)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(doctor)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  
  useEffect(() => {
    fetchDoctors();
  }, [pagination.current, pagination.pageSize, searchText, departmentFilter, statusFilter, specializationFilter]);


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

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <MedicineBoxOutlined style={{ marginRight: 12 }} />
          Doctor Management
        </Title>
        <p style={{ color: '#8c8c8c', marginTop: 8 }}>
          Manage hospital doctors, their information, and assignments
        </p>
      </div>

    
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total Doctors"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Active Doctors"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Inactive Doctors"
              value={stats.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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
              placeholder="Search doctors..."
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

          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
            size="large"
          >
            Add Doctor
          </Button>
        </div>

    
        <Table
          columns={columns}
          dataSource={doctors}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} doctors`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

    
      <AddStaff
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={() => {
          setAddModalVisible(false);
          fetchDoctors();
        }}
        staffType="doctor"
        departments={departments}
        specializations={specializations}
      />

      <EditStaff
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => {
          setEditModalVisible(false);
          fetchDoctors();
        }}
        staff={selectedDoctor ? { 
          ...selectedDoctor, 
          type: 'doctor', 
          name: selectedDoctor.fullname, 
          phone: selectedDoctor.phoneNumber 
        } : null}
        departments={departments}
        specializations={specializations}
      />

      <ViewStaff
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        staff={selectedDoctor ? { 
          ...selectedDoctor, 
          type: 'doctor', 
          name: selectedDoctor.fullname, 
          phone: selectedDoctor.phoneNumber 
        } : null}
      />
    </div>
  );
};

export default DoctorManagementPage;