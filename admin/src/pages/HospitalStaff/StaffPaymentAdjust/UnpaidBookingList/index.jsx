import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Badge,
  Tabs,
  ConfigProvider,
  Typography,
  Space
} from 'antd';
import { SearchOutlined, CreditCardOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/es/locale/vi_VN';
import './styles.scss';

const { Title } = Typography;
const { TabPane } = Tabs;

const StaffUnpaidBookingList = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [bookingList, setBookingList] = useState([
    {
      id: 'BK-001',
      patientName: 'Nguyễn Văn A',
      phoneNumber: '0909123456',
      serviceName: 'Khám nội tổng quát',
      appointmentTime: '16/07/2025 14:00',
      paymentMethod: 'offline',
      paymentStatus: 'UNPAID'
    },
    {
      id: 'BK-002',
      patientName: 'Trần Thị B',
      phoneNumber: '0911222333',
      serviceName: 'Khám da liễu',
      appointmentTime: '17/07/2025 09:00',
      paymentMethod: 'offline',
      paymentStatus: 'UNPAID'
    },
    {
      id: 'BK-003',
      patientName: 'Phạm Văn C',
      phoneNumber: '0922333444',
      serviceName: 'Khám tim mạch',
      appointmentTime: '18/07/2025 10:30',
      paymentMethod: 'online',
      paymentStatus: 'PAID'
    }
  ]);

  const filteredBookings = useMemo(() => {
    return bookingList.filter(
      (item) =>
        item.paymentMethod === 'offline' &&
        (activeTab === 'all' || item.paymentStatus === activeTab) &&
        (item.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.phoneNumber.includes(searchText) ||
          item.id.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [bookingList, searchText, activeTab]);

  const statusCounts = useMemo(() => {
    const unpaid = bookingList.filter(
      (b) => b.paymentStatus === 'UNPAID' && b.paymentMethod === 'offline'
    ).length;
    const paid = bookingList.filter(
      (b) => b.paymentStatus === 'PAID' && b.paymentMethod === 'offline'
    ).length;
    return { all: unpaid + paid, unpaid, paid };
  }, [bookingList]);

  const columns = [
    {
      title: 'Mã đặt khám',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName'
    },
    {
      title: 'SĐT',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName'
    },
    {
      title: 'Thời gian',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime'
    },
    {
      title: 'Trạng thái',
      key: 'paymentStatus',
      render: (_, record) => (
        <Tag color={record.paymentStatus === 'PAID' ? 'green' : 'volcano'}>
          {record.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/staff/payment-confirm/${record.id}`)}
        >
          Xác nhận
        </Button>
      )
    }
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div className="staff-payment-list">
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3}>
                  <CreditCardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Xác nhận thanh toán tại viện
                </Title>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Row className="actions-row" style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input.Search
                    placeholder="Tìm theo mã, tên, SĐT..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    enterButton
                    allowClear
                  />
                </Col>
              </Row>

              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                  key="all"
                  tab={<span>Tất cả <Badge count={statusCounts.all} /></span>}
                />
                <TabPane
                  key="UNPAID"
                  tab={<span>Chưa thanh toán <Badge count={statusCounts.unpaid} style={{ backgroundColor: '#fa541c' }} /></span>}
                />
                <TabPane
                  key="PAID"
                  tab={<span>Đã thanh toán <Badge count={statusCounts.paid} style={{ backgroundColor: '#52c41a' }} /></span>}
                />
              </Tabs>

              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default StaffUnpaidBookingList;
