import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Descriptions, 
  Avatar, 
  Tag, 
  Row, 
  Col, 
  Divider, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  Rate,
  Tooltip,
  Empty
} from 'antd';
import { 
  BankOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { getDoctorsByDepartment } from '../../../services/doctorService';

const { TabPane } = Tabs;

const ViewDepartment = ({ visible, record, onCancel }) => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (visible && record && activeTab === '2') {
      fetchDoctors();
    }
  }, [visible, record, activeTab]);

  const fetchDoctors = async () => {
    if (!record?.id) return;
    
    setLoadingDoctors(true);
    try {
      const doctorsData = await getDoctorsByDepartment(record.id);
      setDoctors(doctorsData || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  if (!record) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const doctorColumns = [
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
              License: {doctor.licenseNumber}
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
      title: 'Contact',
      key: 'contact',
      render: (_, doctor) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <span style={{ fontSize: '12px' }}>{doctor.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MailOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <span style={{ fontSize: '12px' }}>{doctor.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Experience & Rating',
      key: 'experience',
      render: (_, doctor) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <strong>{doctor.experience} years</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Rate disabled value={doctor.rating} style={{ fontSize: '12px' }} />
            <span style={{ marginLeft: 8, fontSize: '12px' }}>{doctor.rating}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Patients & Fee',
      key: 'stats',
      render: (_, doctor) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            Patients: <strong>{doctor.totalPatients}</strong>
          </div>
          <div style={{ fontSize: '12px' }}>
            Fee: <strong>${doctor.consultationFee}</strong>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || 'N/A'}
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
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BankOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Department Details: {record.name}
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      className="custom-modal"
    >
      <div style={{ padding: '20px 0' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Department Information" key="1">
            {/* Department Header */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    icon={<BankOutlined />}
                    style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                  />
                  <div>
                    <Tag 
                      color={getStatusColor(record.status)} 
                      style={{ fontSize: '14px', padding: '4px 12px' }}
                    >
                      {record.status?.toUpperCase() || 'N/A'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Department Name" span={2}>
                    <strong style={{ fontSize: '16px' }}>{record.name || 'N/A'}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Department Code">
                    <Tag color="blue">{record.code || 'N/A'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(record.status)}>
                      {record.status?.toUpperCase() || 'N/A'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    {record.description || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider orientation="left">Department Information</Divider>
            
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item 
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Head of Department
                  </span>
                }
              >
                {record.headOfDepartment || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    Location
                  </span>
                }
              >
                {record.location || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                    Phone Number
                  </span>
                }
              >
                {record.phoneNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    Email
                  </span>
                }
              >
                {record.email || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Statistics & Operations</Divider>
            
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {doctors.length || record.totalStaff || 0}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Total Doctors</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {record.totalBeds || 0}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Total Beds</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {doctors.filter(d => d.status === 'active').length || 0}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Active Doctors</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }}>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    Operating Hours
                  </div>
                  <div style={{ color: '#8c8c8c', marginTop: '8px' }}>
                    {record.operatingHours || 'N/A'}
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left">System Information</Divider>
            
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Department ID">
                {record.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {record.createdAt ? formatDate(record.createdAt) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {record.updatedAt ? formatDate(record.updatedAt) : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <MedicineBoxOutlined />
                Doctors ({doctors.length})
              </span>
            } 
            key="2"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Department Doctors</h3>
                <p style={{ margin: 0, color: '#8c8c8c' }}>
                  Manage doctors assigned to this department
                </p>
              </div>
              <Button type="primary" icon={<PlusOutlined />}>
                Assign Doctor
              </Button>
            </div>

            {doctors.length > 0 ? (
              <Table
                columns={doctorColumns}
                dataSource={doctors}
                rowKey="id"
                loading={loadingDoctors}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} doctors`
                }}
                size="small"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No doctors assigned to this department yet.
                    <br />
                    <Button type="link" icon={<PlusOutlined />}>
                      Assign your first doctor
                    </Button>
                  </span>
                }
              />
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <StarOutlined />
                Performance
              </span>
            } 
            key="3"
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <h4>Department Rating</h4>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Rate disabled value={4.5} style={{ marginRight: 16 }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>4.5/5.0</span>
                  </div>
                  <p style={{ color: '#8c8c8c' }}>Based on 125 patient reviews</p>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <h4>Average Doctor Rating</h4>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Rate disabled value={4.7} style={{ marginRight: 16 }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {doctors.length > 0 
                        ? (doctors.reduce((sum, doc) => sum + doc.rating, 0) / doctors.length).toFixed(1)
                        : '0.0'
                      }/5.0
                    </span>
                  </div>
                  <p style={{ color: '#8c8c8c' }}>
                    Average rating of {doctors.length} doctors
                  </p>
                </div>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                    {doctors.reduce((sum, doc) => sum + doc.totalPatients, 0)}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Total Patients Served</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
                    ${doctors.reduce((sum, doc) => sum + doc.consultationFee, 0)}
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Total Consultation Fees</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {doctors.length > 0 
                      ? Math.round(doctors.reduce((sum, doc) => sum + doc.experience, 0) / doctors.length)
                      : 0
                    }
                  </div>
                  <div style={{ color: '#8c8c8c' }}>Avg. Years Experience</div>
                </div>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default ViewDepartment;