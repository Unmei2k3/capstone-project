import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Rate, 
  Input, 
  Select, 
  Row, 
  Col,
  message,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { 
  getDoctorsByDepartment, 
  getAllDoctors, 
  assignDoctorToDepartment, 
  deleteDoctor 
} from '../../../services/doctorService';

const { Option } = Select;

const DoctorManagement = ({ visible, department, onCancel, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (visible && department) {
      fetchDoctors();
      fetchAvailableDoctors();
    }
  }, [visible, department]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await getDoctorsByDepartment(department.id);
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const response = await getAllDoctors({ departmentId: null }); // Doctors without department
      setAvailableDoctors(response.items || []);
    } catch (error) {
      console.error('Error fetching available doctors:', error);
    }
  };

  const handleAssignDoctor = async (doctorId) => {
    try {
      await assignDoctorToDepartment(doctorId, department.id);
      message.success('Doctor assigned successfully');
      setShowAssignModal(false);
      fetchDoctors();
      fetchAvailableDoctors();
      onSuccess && onSuccess();
    } catch (error) {
      message.error('Failed to assign doctor');
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await assignDoctorToDepartment(doctorId, null); // Remove from department
      message.success('Doctor removed from department');
      fetchDoctors();
      onSuccess && onSuccess();
    } catch (error) {
      message.error('Failed to remove doctor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, doctor) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={doctor.avatar}
            icon={<UserOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{doctor.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {doctor.qualification}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specialization) => (
        <Tag color="blue">{specialization}</Tag>
      ),
    },
    {
      title: 'Experience',
      key: 'experience',
      render: (_, doctor) => (
        <div>
          <div><strong>{doctor.experience} years</strong></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Rate disabled value={doctor.rating} style={{ fontSize: '12px' }} />
            <span style={{ marginLeft: 4, fontSize: '12px' }}>{doctor.rating}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Patients',
      dataIndex: 'totalPatients',
      key: 'totalPatients',
      render: (patients) => (
        <span style={{ fontWeight: 500 }}>{patients}</span>
      ),
    },
    {
      title: 'Fee',
      dataIndex: 'consultationFee',
      key: 'consultationFee',
      render: (fee) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>${fee}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, doctor) => (
        <Space size="small">
          <Tooltip title="Edit Doctor">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Remove from Department">
            <Popconfirm
              title="Remove doctor from this department?"
              description="This will unassign the doctor from the department."
              onConfirm={() => handleRemoveDoctor(doctor.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const assignColumns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, doctor) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={doctor.avatar}
            icon={<UserOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{doctor.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {doctor.qualification}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specialization) => (
        <Tag color="blue">{specialization}</Tag>
      ),
    },
    {
      title: 'Experience & Rating',
      key: 'experience',
      render: (_, doctor) => (
        <div>
          <div>{doctor.experience} years</div>
          <Rate disabled value={doctor.rating} style={{ fontSize: '12px' }} />
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, doctor) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleAssignDoctor(doctor.id)}
        >
          Assign
        </Button>
      ),
    },
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MedicineBoxOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Manage Doctors - {department?.name}
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={1000}
        className="custom-modal"
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Input
                placeholder="Search doctors..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowAssignModal(true)}
                block
              >
                Assign Doctor
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDoctors}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} doctors`
          }}
          size="small"
        />
      </Modal>

      {/* Assign Doctor Modal */}
      <Modal
        title="Assign Doctor to Department"
        visible={showAssignModal}
        onCancel={() => setShowAssignModal(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={assignColumns}
          dataSource={availableDoctors}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false
          }}
          size="small"
        />
      </Modal>
    </>
  );
};

export default DoctorManagement;