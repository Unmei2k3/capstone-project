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

  // ✅ Get user role for permission check
  const user = useSelector((state) => state.user.user);
  const userRole = user?.role || 'user';

  useEffect(() => {
    fetchHospitalDetail();
  }, [id]);

  const fetchHospitalDetail = async () => {
    setLoading(true);
    try {
      console.log('🔍 Đang tải thông tin chi tiết bệnh viện ID:', id);
      const response = await getHospitalById(id);
      console.log('📦 Phản hồi bệnh viện:', response);

      // ✅ Handle API response format: {result: {...}, success: true, message: "..."}
      let hospitalData = null;
      if (response && response.result) {
        hospitalData = response.result;
      } else if (response && !response.result) {
        hospitalData = response; // Fallback if direct data
      }

      if (hospitalData) {
        console.log('🏥 Dữ liệu bệnh viện:', hospitalData);
        setHospital(hospitalData);
      } else {
        message.error('Không tìm thấy bệnh viện');
        navigate('/admin/hospitals');
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải thông tin bệnh viện:', error);
      message.error('Không thể tải thông tin chi tiết bệnh viện');
      navigate('/admin/hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log('👤 Vai trò người dùng:', userRole);
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

  // ✅ Map type number to Vietnamese string
  const getHospitalType = (type) => {
    switch (type) {
      case 0:
        return 'Bệnh viện Tổng hợp';
      case 1:
        return 'Bệnh viện Chuyên khoa';
      case 2:
        return 'Bệnh viện Cộng đồng';
      case 3:
        return 'Bệnh viện Tư nhân';
      default:
        return 'Loại không xác định';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 0:
        return 'blue';
      case 1:
        return 'purple';
      case 2:
        return 'green';
      case 3:
        return 'orange';
      default:
        return 'default';
    }
  };

  // ✅ Format time to Vietnamese format
  const formatTime = (timeString) => {
    if (!timeString) return 'Không có thông tin';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'Thời gian không hợp lệ';
    }
  };

  // ✅ Format currency to Vietnamese
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // ✅ Services table columns in Vietnamese
  const servicesColumns = [
    {
      title: 'Tên Dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>
    },
    {
      title: 'Giá',
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
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || 'Không có mô tả'
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin bệnh viện...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Empty description="Không tìm thấy bệnh viện" />
        <Button type="primary" onClick={handleBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="hospital-detail-container">
      {/* ✅ Header */}
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
                  Quay lại Danh sách Bệnh viện
                </Button>
              </Col>
              <Col>
                {(userRole === 'admin' || userRole === 'systemAdmin') && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Chỉnh sửa Bệnh viện
                  </Button>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* ✅ Hospital Overview */}
        <Col span={24}>
          <Card className="hospital-overview-card">
            <Row gutter={24}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    icon={<MedicineBoxOutlined />}
                    src={hospital.image}
                    style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                  />
                  <div>
                    <Tag color={getTypeColor(hospital.type)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {getHospitalType(hospital.type)}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" style={{ fontSize: '12px' }}>
                      🟢 ĐANG HOẠT ĐỘNG
                    </Tag>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={18}>
                <Row gutter={[0, 16]}>
                  <Col span={24}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                      {hospital.name}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#8c8c8c', margin: '8px 0' }}>
                      ID: {hospital.id} | Mã: {hospital.code}
                    </p>
                    <div style={{ marginBottom: 16 }}>
                      <Tag color="blue" style={{ marginRight: 8 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatTime(hospital.openTime)} - {formatTime(hospital.closeTime)}
                      </Tag>
                      <Tag color="gold">
                        {hospital.services?.length || 0} Dịch vụ có sẵn
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

        {/* ✅ Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Số Dịch vụ"
                  value={hospital.services?.length || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<MedicineBoxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Loại Bệnh viện"
                  value={hospital.type}
                  valueStyle={{ color: '#1890ff' }}
                  formatter={(value) => getHospitalType(value)}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Giá Trung bình"
                  value={hospital.services?.length > 0 
                    ? hospital.services.reduce((sum, service) => sum + (service.price || 0), 0) / hospital.services.length 
                    : 0}
                  valueStyle={{ color: '#faad14' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Tổng Doanh thu Ước tính"
                  value={hospital.services?.reduce((sum, service) => sum + (service.price || 0), 0) || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* ✅ Detailed Information Tabs */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="📋 Thông tin Cơ bản" key="1">
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <Descriptions title="🔗 Thông tin Liên hệ" column={1} bordered>
                      <Descriptions.Item
                        label={<><PhoneOutlined style={{ marginRight: 8 }} />Số điện thoại</>}
                      >
                        <a href={`tel:${hospital.phoneNumber}`}>
                          {hospital.phoneNumber || 'Chưa có thông tin'}
                        </a>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}
                      >
                        <a href={`mailto:${hospital.email}`}>
                          {hospital.email || 'Chưa có thông tin'}
                        </a>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><EnvironmentOutlined style={{ marginRight: 8 }} />Địa chỉ</>}
                      >
                        {hospital.address || 'Chưa có thông tin'}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><GlobalOutlined style={{ marginRight: 8 }} />Google Maps</>}
                      >
                        {hospital.googleMapUri ? (
                          <a href={hospital.googleMapUri} target="_blank" rel="noopener noreferrer">
                            📍 Xem trên Google Maps
                          </a>
                        ) : (
                          'Chưa có thông tin'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Descriptions title="⏰ Thông tin Hoạt động" column={1} bordered>
                      <Descriptions.Item
                        label={<><ClockCircleOutlined style={{ marginRight: 8 }} />Giờ mở cửa</>}
                      >
                        <Tag color="green">{formatTime(hospital.openTime)}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<><ClockCircleOutlined style={{ marginRight: 8 }} />Giờ đóng cửa</>}
                      >
                        <Tag color="red">{formatTime(hospital.closeTime)}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="🏥 Loại hình">
                        <Tag color={getTypeColor(hospital.type)}>
                          {getHospitalType(hospital.type)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="📍 Tọa độ">
                        {hospital.latitude && hospital.longitude 
                          ? `${hospital.latitude}, ${hospital.longitude}`
                          : 'Chưa có thông tin'
                        }
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab={`💊 Dịch vụ (${hospital.services?.length || 0})`} key="2">
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
                        `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} dịch vụ`,
                      pageSizeOptions: ['10', '20', '50']
                    }}
                    scroll={{ x: 800 }}
                    locale={{
                      emptyText: 'Không có dịch vụ nào',
                      triggerDesc: 'Nhấn để sắp xếp giảm dần',
                      triggerAsc: 'Nhấn để sắp xếp tăng dần',
                      cancelSort: 'Nhấn để hủy sắp xếp'
                    }}
                  />
                ) : (
                  <Empty 
                    description="Chưa có dịch vụ nào được thêm"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </TabPane>

              <TabPane tab="📍 Vị trí" key="3">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card title="📋 Chi tiết Địa chỉ" style={{ height: '400px' }}>
                      <div style={{ lineHeight: '2' }}>
                        <p><strong>🏢 Địa chỉ đầy đủ:</strong></p>
                        <p style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          {hospital.address}
                        </p>
                        
                        {(hospital.latitude && hospital.longitude) && (
                          <>
                            <p><strong>📍 Tọa độ GPS:</strong></p>
                            <p>🌐 Vĩ độ: <code>{hospital.latitude}</code></p>
                            <p>🌐 Kinh độ: <code>{hospital.longitude}</code></p>
                          </>
                        )}

                        {hospital.googleMapUri && (
                          <div style={{ marginTop: 16 }}>
                            <Button 
                              type="primary" 
                              icon={<GlobalOutlined />}
                              href={hospital.googleMapUri} 
                              target="_blank"
                              style={{ width: '100%' }}
                            >
                              🗺️ Mở Google Maps
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    {hospital.googleMapUri ? (
                      <Card title="🗺️ Bản đồ Google Maps">
                        <iframe
                          src={hospital.googleMapUri}
                          width="100%"
                          height="350"
                          style={{ border: 0, borderRadius: '8px' }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Vị trí Bệnh viện"
                        />
                      </Card>
                    ) : (
                      <Card title="🗺️ Bản đồ" style={{ height: '400px' }}>
                        <Empty 
                          description="Chưa có thông tin bản đồ" 
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="⚙️ Thông tin Hệ thống" key="4">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="🆔 ID Bệnh viện">
                    <code>{hospital.id}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="🏷️ Mã Bệnh viện">
                    <Tag color="blue">{hospital.code}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="🏥 Loại hình">
                    <Tag color={getTypeColor(hospital.type)}>
                      {getHospitalType(hospital.type)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="💊 Tổng Dịch vụ">
                    <strong style={{ color: '#1890ff' }}>
                      {hospital.services?.length || 0} dịch vụ
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="🖼️ URL Hình ảnh" span={2}>
                    {hospital.image ? (
                      <a href={hospital.image} target="_blank" rel="noopener noreferrer">
                        {hospital.image.length > 60 
                          ? `${hospital.image.substring(0, 60)}...` 
                          : hospital.image
                        }
                      </a>
                    ) : (
                      <span style={{ color: '#8c8c8c' }}>Chưa có hình ảnh</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="🎨 URL Banner" span={2}>
                    {hospital.banner ? (
                      <a href={hospital.banner} target="_blank" rel="noopener noreferrer">
                        {hospital.banner.length > 60 
                          ? `${hospital.banner.substring(0, 60)}...` 
                          : hospital.banner
                        }
                      </a>
                    ) : (
                      <span style={{ color: '#8c8c8c' }}>Chưa có banner</span>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {/* ✅ Debug Information */}
                <div style={{
                  marginTop: 24,
                  padding: '12px 16px',
                  background: '#f0f0f0',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9'
                }}>
                  <h4 style={{ color: '#666', marginBottom: 8 }}>🔍 Thông tin Debug:</h4>
                  <pre style={{ fontSize: '12px', margin: 0, color: '#666' }}>
                    {JSON.stringify(hospital, null, 2)}
                  </pre>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalDetail;