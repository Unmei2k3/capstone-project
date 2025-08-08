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
} from 'antd';
import { SearchOutlined, CreditCardOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/es/locale/vi_VN';
import { getPayments } from '../../../../services/paymentService';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { TabPane } = Tabs;

const NurseUnpaidBookingList = () => {
  const navigate = useNavigate();
  const userDefault = useSelector((state) => state.user.user || null);
  console.log('User Default:', userDefault);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [bookingList, setBookingList] = useState([]);

  const statusMap = {
    1: { text: 'Đang chờ', color: 'gold' },
    2: { text: 'Hoàn thành', color: 'green' },
    3: { text: 'Lỗi', color: 'red' },
    4: { text: 'Đã hoàn tiền', color: 'purple' },
    5: { text: 'Đã huỷ', color: 'grey' },
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  };

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await getPayments(userDefault?.hospitals?.[0]?.id);
        console.log('Payments Response:', JSON.stringify(response));
        const data = response?.result || [];
        const mapped = data.map(item => ({
          id: String(item.id),
          patientName: item.user?.fullname || '',
          phoneNumber: item.user?.phoneNumber || '',
          serviceName: item.serviceName,
          doctorName: item.doctorName,
          amount: item.amount,
          appointmentTime: formatDateTime(item.appointmentTime),
          createdOn: formatDateTime(item.createdOn),
          paymentMethod: item.method === 1 ? 'offline' : item.method === 2 ? 'online' : 'unknown',
          status: item.status,
          insuranceClaimInfo: item.insuranceClaimInfo,
        }));
        setBookingList(mapped);
        console.log('Booking List:', JSON.stringify(mapped));
      } catch (error) {
        console.error('Failed to load payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);
const filteredBookings = useMemo(() => {
  return bookingList.filter((item) => {
    const matchStatus = activeTab === 'all' || String(item.status) === activeTab;

    const searchLower = searchText.toLowerCase();
    const matchSearch =
      item.patientName.toLowerCase().includes(searchLower) ||
      item.phoneNumber.includes(searchText) ||
      item.id.toLowerCase().includes(searchLower);

    return matchStatus && matchSearch;
  });
}, [bookingList, searchText, activeTab]);

  const statusCounts = useMemo(() => {
    const counts = { all: 0 };
    Object.keys(statusMap).forEach((key) => {
      counts[key] = 0;
    });

    bookingList.forEach((item) => {
      if (item.paymentMethod !== 'offline') return;

      counts.all += 1;
      if (item.status in counts) {
        counts[item.status] += 1;
      }
    });

    return counts;
  }, [bookingList]);

  const columns = [
    { title: 'Mã đặt khám', dataIndex: 'id', key: 'id' },
    { title: 'Bệnh nhân', dataIndex: 'patientName', key: 'patientName' },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    { title: 'Thời gian khám', dataIndex: 'appointmentTime', key: 'appointmentTime' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const st = statusMap[record.status];
        return st ? <Tag color={st.color}>{st.text}</Tag> : <Tag color="default">Không rõ</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/nurse/payment-confirm/${record.id}`)}
        >
          Xác nhận
        </Button>
      ),
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
                <TabPane key="all" tab={<span>Tất cả <Badge count={statusCounts.all} /></span>} />
                <TabPane key="1" tab={<span>Pending <Badge count={statusCounts[1]} style={{ backgroundColor: 'gold' }} /></span>} />
                <TabPane key="2" tab={<span>Completed <Badge count={statusCounts[2]} style={{ backgroundColor: 'green' }} /></span>} />
                <TabPane key="3" tab={<span>Failed <Badge count={statusCounts[3]} style={{ backgroundColor: 'red' }} /></span>} />
                <TabPane key="4" tab={<span>Refunded <Badge count={statusCounts[4]} style={{ backgroundColor: 'purple' }} /></span>} />
                <TabPane key="5" tab={<span>Cancel <Badge count={statusCounts[5]} style={{ backgroundColor: 'grey' }} /></span>} />
              </Tabs>

              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default NurseUnpaidBookingList;