import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  ConfigProvider,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import viVN from 'antd/es/locale/vi_VN';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getTrackPayments } from '../../../services/paymentService';

dayjs.extend(utc);

const { Title } = Typography;

const statusMap = {
  1: { text: 'Đang chờ', color: 'gold' },
  2: { text: 'Hoàn thành', color: 'green' },
  3: { text: 'Thất bại', color: 'red' },
  4: { text: 'Hoàn tiền', color: 'purple' },
  5: { text: 'Đã huỷ', color: 'grey' },
};

const AdminTrackPaymentPage = () => {
  const userDefault = useSelector((state) => state.user.user || null);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState('');

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  };
  const translateRole = (roleName) => {
    switch (roleName) {
      case "Doctor": return "Bác sĩ";
      case "Patient": return "Bệnh nhân";
      case "Hospital Admin": return "Quản trị viên bệnh viện";
      case "Hospital Staff": return "Nhân viên bệnh viện";
      case "System Admin": return "Quản trị hệ thống";
      case "Manager": return "Quản lý";
      case "Nurse": return "Y tá";
      default: return roleName;
    }
  };
  useEffect(() => {
    const fetchData = async () => {

      setLoading(true);
      try {
        const response = await getTrackPayments(userDefault?.hospitals[0]?.id);
        const data = response || [];

        const mapped = data.map((item) => ({
          id: String(item.id),
          appointmentId: item.appointmentId,
          serviceName: item.serviceName,
          amount: item.amount,
          method: item.method === 1 ? 'offline' : item.method === 2 ? 'online' : 'unknown',
          status: item.status,
          createdOn: item.createdOn,
          lastModifiedOn: item.lastModifiedOn,
          lastModifiedBy: item.lastModifiedBy?.fullname || '',
          role: item.lastModifiedBy?.role?.name,
          userName: item.user?.fullname || '',
          phoneNumber: item.user?.phoneNumber || '',
        }));

        setPayments(mapped);
      } catch (error) {
        console.error('Failed to load track payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userDefault]);

  const filteredPayments = useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return payments.filter((item) => {
      return (
        item.id.toLowerCase().includes(lowerSearch) ||
        item.appointmentId.toString().includes(lowerSearch) ||
        item.serviceName.toLowerCase().includes(lowerSearch) ||
        item.userName.toLowerCase().includes(lowerSearch) ||
        item.lastModifiedBy.toLowerCase().includes(lowerSearch)
      );
    });
  }, [payments, searchText]);

  // Columns showing minimal info in main table
  const columns = [
    {
      title: 'ID Giao dịch',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => text?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (text) => {
        if (text === 'offline') return <Tag color="blue">Offline</Tag>;
        if (text === 'online') return <Tag color="green">Online</Tag>;
        return <Tag>Unknown</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const st = statusMap[status];
        return st ? <Tag color={st.color}>{st.text}</Tag> : <Tag>Không rõ</Tag>;
      },
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div className="admin-track-payment-page">
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Title level={3}>Lịch sử giao dịch thanh toán hệ thống</Title>
          </Col>

          <Col span={24}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Row style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    allowClear
                    placeholder="Tìm theo ID, dịch vụ, tên người thực hiện giao dịch..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={filteredPayments}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ margin: 0 }}>
                      <p><b>Mã Lịch khám:</b> {record.appointmentId}</p>
                      <p><b>Ngày tạo:</b> {formatDateTime(record.createdOn)}</p>
                      <p><b>Ngày chỉnh sửa cuối:</b> {formatDateTime(record.lastModifiedOn)}</p>
                      <b>Người thực hiện giao dịch cuối:</b> {record.lastModifiedBy}  { }
                       ({translateRole(record.role)})
                      <p><b>Bệnh nhân:</b> {record.userName}</p>
                      <p><b>SĐT bệnh nhân:</b> {record.phoneNumber}</p>
                    </div>
                  ),
                  rowExpandable: () => true,
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default AdminTrackPaymentPage;
