import React from 'react';
import { 
  Drawer, 
  Typography, 
  Descriptions, 
  Tag, 
  Divider, 
  Button, 
  Row, 
  Col, 
  Space 
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  DollarOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  BookOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BookingDetailDrawer = ({ booking, visible, onClose }) => {
  if (!booking) return null;

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', text: 'Hoàn thành' };
      case 'confirmed':
        return { color: 'blue', text: 'Đã xác nhận' };
      case 'pending':
        return { color: 'orange', text: 'Chờ xác nhận' };
      case 'cancelled':
        return { color: 'red', text: 'Đã hủy' };
      default:
        return { color: 'default', text: status };
    }
  };

  const statusInfo = getStatusInfo(booking.status);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MedicineBoxOutlined style={{ marginRight: 8, fontSize: 18 }} />
          <span>Chi tiết đặt khám</span>
          <Tag color={statusInfo.color} style={{ marginLeft: 'auto' }}>
            {statusInfo.text}
          </Tag>
        </div>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={visible}
    >
      <div className="booking-detail">
        {/* Thông tin đặt khám */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <FileTextOutlined /> Thông tin đặt khám
          </Title>
          
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đặt khám">
              <Text strong>{booking.bookingId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              <CalendarOutlined /> {booking.bookingDate}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khám">
              <ClockCircleOutlined /> {booking.appointmentTime}
            </Descriptions.Item>
            <Descriptions.Item label="Phí khám">
              <DollarOutlined /> {booking.fee?.toLocaleString() || 0} VNĐ
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Thông tin y tế */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <BookOutlined /> Thông tin y tế
          </Title>
          
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Cơ sở y tế">
              {booking.hospital}
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên khoa">
              {booking.department}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ">
              {booking.doctor}
            </Descriptions.Item>
            <Descriptions.Item label="Triệu chứng">
              {booking.symptoms}
            </Descriptions.Item>
            {booking.notes && (
              <Descriptions.Item label="Ghi chú">
                {booking.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        <Divider />

        {/* Thông tin bệnh nhân */}
        <div className="detail-section">
          <Title level={5} className="section-title">
            <UserOutlined /> Thông tin bệnh nhân
          </Title>
          
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ và tên">
              {booking.patientName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined /> {booking.patientPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined /> {booking.patientEmail}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Action buttons */}
        <Row gutter={16} justify="end">
          {booking.status === 'pending' && (
            <Col>
              <Button type="primary" danger>
                Hủy lịch hẹn
              </Button>
            </Col>
          )}
          {booking.status === 'completed' && (
            <Col>
              <Button type="primary">
                Xem phiếu khám
              </Button>
            </Col>
          )}
          <Col>
            <Button onClick={onClose}>
              Đóng
            </Button>
          </Col>
        </Row>
      </div>
    </Drawer>
  );
};

export default BookingDetailDrawer;