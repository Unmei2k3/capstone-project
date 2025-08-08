import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  message,
} from 'antd';

const mockBooking = {
  id: 'BK-123456',
  patientName: 'Nguyễn Văn A',
  phoneNumber: '0909 123 456',
  serviceName: 'Khám nội tổng quát',
  doctorName: 'BS. Trần Văn B',
  appointmentTime: '16/07/2025 - 14:00',
  paymentMethod: 'Thanh toán tại viện',
  totalPrice: 500000,
  paymentStatus: 'UNPAID', // or 'PAID'
};

function StaffPaymentConfirmation() {
  const [booking, setBooking] = useState(mockBooking);
  const [loading, setLoading] = useState(false);

  const handleConfirmPayment = () => {
    Modal.confirm({
      title: 'Xác nhận thanh toán',
      content: 'Bạn có chắc chắn đã nhận được thanh toán từ bệnh nhân không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          // Simulate API call delay
          await new Promise((res) => setTimeout(res, 1000));

          // In real app: call your API here
          setBooking((prev) => ({
            ...prev,
            paymentStatus: 'PAID',
          }));

          message.success('Xác nhận thanh toán thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xác nhận thanh toán!');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancelBooking = () => {
    Modal.confirm({
      title: 'Hủy lịch khám',
      content: 'Bạn có chắc chắn muốn hủy lịch khám này không?',
      okText: 'Hủy lịch',
      cancelText: 'Giữ lại',
      onOk: async () => {
        try {
          setLoading(true);
          // Simulate API call
          await new Promise((res) => setTimeout(res, 1000));

          message.success('Đã hủy lịch khám.');
          // Optionally: redirect or mark as canceled
        } catch (error) {
          message.error('Hủy lịch thất bại!');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <Card
      title="Xác nhận thanh toán tại viện"
      bordered={false}
      style={{ maxWidth: 700, margin: '40px auto' }}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã đặt khám">{booking.id}</Descriptions.Item>
        <Descriptions.Item label="Họ tên bệnh nhân">{booking.patientName}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{booking.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="Dịch vụ khám">{booking.serviceName}</Descriptions.Item>
        <Descriptions.Item label="Bác sĩ">{booking.doctorName}</Descriptions.Item>
        <Descriptions.Item label="Thời gian khám">{booking.appointmentTime}</Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{booking.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{formatCurrency(booking.totalPrice)}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          {booking.paymentStatus === 'PAID' ? (
            <Tag color="green">Đã thanh toán</Tag>
          ) : (
            <Tag color="red">Chưa thanh toán</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Space>
          <Button
            type="primary"
            onClick={handleConfirmPayment}
            loading={loading}
            disabled={booking.paymentStatus === 'PAID'}
          >
            Xác nhận đã thanh toán
          </Button>
          <Button danger onClick={handleCancelBooking} loading={loading}>
            Hủy lịch khám
          </Button>
        </Space>
      </div>
    </Card>
  );
}

export default StaffPaymentConfirmation;
