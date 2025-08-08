import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Avatar,
  Tag,
  Descriptions,
  Tabs,
  Button,
  Rate,
  Statistic,
  Spin,
  message,
  Table,
  Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { getHospitalById } from '../../../services/hospitalService';
import { useSelector } from 'react-redux';
import './HospitalDetail.scss';

const { TabPane } = Tabs;

const HospitalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  // Get user role for permission check
  const user = useSelector((state) => state.user.user);
  const userRole = user?.role || 'user';

  useEffect(() => {
    fetchHospitalDetail();
  }, [id]);

  const fetchHospitalDetail = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching hospital detail for ID:', id);
      const response = await getHospitalById(id);
      console.log('📦 Hospital response:', response);

      // ✅ Handle API response format: {result: {...}, success: true, message: "..."}
      let hospitalData = null;
      if (response && response.result) {
        hospitalData = response.result;
      } else if (response && !response.result) {
        hospitalData = response; // Fallback if direct data
      }

      if (hospitalData) {
        console.log('🏥 Hospital data:', hospitalData);
        setHospital(hospitalData);
      } else {
        message.error('Hospital not found');
        navigate('/admin/hospitals');
      }
    } catch (error) {
      console.error('❌ Error fetching hospital detail:', error);
      message.error('Failed to load hospital details');
      navigate('/admin/hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log(userRole)
    if (userRole.name === 'System Admin') {
      navigate('/admin-system/hospitals');
    } else {
      navigate('/admin/hospitals');
    }
  };

  const handleEdit = () => {
    if (userRole === 'admin' || userRole === 'systemAdmin') {
      navigate(`/admin/hospitals/edit/${id}`);
    }
  };

  // ✅ Map type number to string
  const getHospitalType = (type) => {
    switch (type) {
      case 1:
        return 'General Hospital';
      case 2:
        return 'Specialized Hospital';
      case 3:
        return 'Community Hospital';
      default:
        return 'Unknown Type';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 1:
        return 'blue';
      case 2:
        return 'purple';
      case 3:
        return 'green';
      default:
        return 'default';
    }
  };

  // ✅ Format time properly
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // ✅ Services table columns
  const servicesColumns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {formatCurrency(price)}
        </span>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading hospital details...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Hospital not found" />
        <Button type="primary" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="hospital-detail-container">
      {/* Header */}
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card className="hospital-header-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  style={{ marginRight: 16 }}
                >
                  Back to Hospitals
                </Button>
              </Col>
              <Col>
                {(userRole === 'admin' || userRole === 'systemAdmin') && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Edit Hospital
                  </Button>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Hospital Overview */}
        <Col span={24}>
          <Card className="hospital-overview-card">
            <Row gutter={24}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    icon={<MedicineBoxOutlined />}
                    src={hospital.image} // ✅ Use 'image' instead of 'logoUrl'
                    style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                  />
                  <div>
                    <Tag color={getTypeColor(hospital.type)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {getHospitalType(hospital.type)} {/* ✅ Map type number to string */}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" style={{ fontSize: '12px' }}>
                      ACTIVE {/* ✅ Default to active since no status in API */}
                    </Tag>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={18}>
                <Row gutter={[0, 16]}>
                  <Col span={24}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                      {hospital.name}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#8c8c8c', margin: '8px 0' }}>
                      Hospital ID: {hospital.id} | Code: {hospital.code}
                    </p>
                    <div style={{ marginBottom: 16 }}>
                      <Tag color="blue" style={{ marginRight: 8 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatTime(hospital.openTime)} - {formatTime(hospital.closeTime)}
                      </Tag>
                      <Tag color="gold">
                        {hospital.services?.length || 0} Services Available
                      </Tag>
                    </div>
                  </Col>

                  <Col span={24}>
                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                      <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      {hospital.address}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Services"
                  value={hospital.services?.length || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<MedicineBoxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Hospital Type"
                  value={hospital.type}
                  valueStyle={{ color: '#1890ff' }}
                  formatter={(value) => getHospitalType(value)}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Average Price"
                  value={hospital.services?.reduce((sum, service) => sum + service.price, 0) / (hospital.services?.length || 1)}
                  valueStyle={{ color: '#faad14' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Detailed Information Tabs */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Basic Information" key="1">
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <Descriptions title="Contact Information" column={1} bordered>
                      <Descriptions.Item
                        label={<><PhoneOutlined style={{ marginRight: 8 }} />Phone</>}
                      >
                        {hospital.phoneNumber || 'Not Available'}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}
                      >
                        {hospital.email || 'Not Available'}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><EnvironmentOutlined style={{ marginRight: 8 }} />Address</>}
                      >
                        {hospital.address}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><GlobalOutlined style={{ marginRight: 8 }} />Google Maps</>}
                      >
                        {hospital.googleMapUri ? (
                          <a href={hospital.googleMapUri} target="_blank" rel="noopener noreferrer">
                            View on Google Maps
                          </a>
                        ) : (
                          'Not Available'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Descriptions title="Operating Information" column={1} bordered>
                      <Descriptions.Item
                        label={<><ClockCircleOutlined style={{ marginRight: 8 }} />Open Time</>}
                      >
                        {formatTime(hospital.openTime)}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><ClockCircleOutlined style={{ marginRight: 8 }} />Close Time</>}
                      >
                        {formatTime(hospital.closeTime)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Hospital Type">
                        <Tag color={getTypeColor(hospital.type)}>
                          {getHospitalType(hospital.type)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Location Coordinates">
                        Lat: {hospital.latitude}, Lng: {hospital.longitude}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab={`Services (${hospital.services?.length || 0})`} key="2">
                {hospital.services && hospital.services.length > 0 ? (
                  <Table
                    columns={servicesColumns}
                    dataSource={hospital.services}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} services`
                    }}
                    scroll={{ x: 800 }}
                  />
                ) : (
                  <Empty description="No services available" />
                )}
              </TabPane>

              <TabPane tab="Location" key="3">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card title="Address Details">
                      <p><strong>Full Address:</strong></p>
                      <p>{hospital.address}</p>
                      <p><strong>Coordinates:</strong></p>
                      <p>Latitude: {hospital.latitude}</p>
                      <p>Longitude: {hospital.longitude}</p>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    {hospital.googleMapUri && (
                      <Card title="Google Maps">
                        <iframe
                          src={hospital.googleMapUri}
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Hospital Location"
                        />
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="System Information" key="4">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Hospital ID">
                    {hospital.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hospital Code">
                    {hospital.code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    <Tag color={getTypeColor(hospital.type)}>
                      {getHospitalType(hospital.type)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Services">
                    {hospital.services?.length || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Image URL" span={2}>
                    {hospital.image ? (
                      <a href={hospital.image} target="_blank" rel="noopener noreferrer">
                        {hospital.image}
                      </a>
                    ) : (
                      'No image available'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Banner URL" span={2}>
                    {hospital.banner || 'No banner available'}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalDetail;