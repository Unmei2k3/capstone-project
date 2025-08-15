import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { changePaymentStatus, getPaymentDetail } from '../../../../services/paymentService';


const formatCurrency = (value) =>
  value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('vi-VN', {
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

function NursePaymentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('');
  const isPaid = booking?.status === 2;
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!id) {
      message.warning('Không tìm thấy mã thanh toán, đang chuyển hướng về danh sách.');
      navigate('/nurse/unpaid-bookings', { replace: true });
      return;
    }
    const fetchBooking = async () => {
      try {
        const data = await getPaymentDetail(id);
        if (!data) throw new Error('Not found');
        setBooking(data);
      } catch (e) {
        message.error('Không tìm thấy thông tin thanh toán!');
      }
    };
    fetchBooking();
  }, [id, flag]);

  const openModal = (type) => {
    if (type === 'confirmPayment') {
      setModalTitle('Xác nhận thanh toán');
      setModalContent('Bạn có chắc chắn đã nhận được thanh toán từ bệnh nhân không?');
    } else if (type === 'unconfirmPayment') {
      setModalTitle('Hủy xác nhận thanh toán');
      setModalContent('Bạn có chắc chắn muốn hủy xác nhận đã thanh toán này không?');
    } else if (type === 'cancelPayment') {
      setModalTitle('Hủy lịch khám');
      setModalContent('Bạn có chắc chắn muốn hủy đơn thanh toán này không?');
    }
    setModalType(type);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    setModalLoading(true);
    try {
      if (modalType === 'confirmPayment') {
        console.log('Confirming payment for booking:', booking);
        await changePaymentStatus(booking.id, "2");
        message.success('Xác nhận thanh toán thành công!');
        setFlag(prev => !prev);
      } else if (modalType === 'unconfirmPayment') {
        console.log('Unconfirming payment for booking:', booking);
        await changePaymentStatus(booking.id, "1");
        message.success('Hủy xác nhận thanh toán thành công!');
        setFlag(prev => !prev);
      } else if (modalType === 'cancelPayment') {
        console.log('Cancelling booking:', booking);
        await changePaymentStatus(booking.id, "5");
        message.success('Đã hủy lịch khám.');
        setFlag(prev => !prev);
      }
      setModalVisible(false);
    } catch (error) {
      message.error(modalType === 'confirmPayment' ? 'Có lỗi khi xác nhận thanh toán!' :
        modalType === 'unconfirmPayment' ? 'Có lỗi khi hủy xác nhận thanh toán!' : 'Hủy lịch thất bại!');
    } finally {
      setModalLoading(false);
    }
  };

  const paymentMethodMap = {
    1: 'Thanh toán tại cơ sở',
    2: 'Thanh toán online',
  };

  const statusMap = {
    1: { text: 'Đang chờ', color: 'gold' },
    2: { text: 'Hoàn thành', color: 'green' },
    3: { text: 'Lỗi', color: 'red' },
    4: { text: 'Đã hoàn tiền', color: 'purple' },
    5: { text: 'Đã huỷ', color: 'grey' },
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Spin size="large" tip="Đang tải thông tin đặt khám..." />
      </div>
    );
  }

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Xác nhận thanh toán tại viện</span>
            <Button
              type="default"
              onClick={() => navigate(-1)}
              icon={<ArrowLeftOutlined />}
              style={{
                backgroundColor: '#e6f7ff',
                borderColor: '#91d5ff',
                color: '#1890ff',
                fontWeight: '600',
                borderRadius: 6,
                padding: '0 16px',
              }}
            >
              Quay lại
            </Button>
          </div>
        }
        bordered={false}
        style={{ maxWidth: 700, margin: '40px auto' }}
      >
        <Descriptions
          bordered
          column={1}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
          labelStyle={{ fontWeight: '600' }}
        >
          <Descriptions.Item label="Mã đặt khám">{booking.id}</Descriptions.Item>
          <Descriptions.Item label="Họ tên bệnh nhân">{booking.user?.fullname}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{booking.user?.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Dịch vụ khám">{booking.serviceName}</Descriptions.Item>
          <Descriptions.Item label="Bác sĩ">{booking.doctorName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Thời gian khám">{formatDateTime(booking.appointmentTime)}</Descriptions.Item>
          {booking.createdOn && (
            <Descriptions.Item label="Ngày tạo">{formatDateTime(booking.createdOn)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Phương thức thanh toán">{booking.method===1?"Tiền Mặt" : "Chuyển Khoản"}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền"> {paymentMethodMap[booking.method] || 'Không xác định'}</Descriptions.Item>

          <Descriptions.Item label="Trạng thái thanh toán">
            {statusMap[booking.status] ? (
              <Tag color={statusMap[booking.status].color}>
                {statusMap[booking.status].text}
              </Tag>
            ) : (
              <Tag>Unknown</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <Button
            type={isPaid ? "default" : "primary"}
            danger={false}
            onClick={() => openModal(isPaid ? 'unconfirmPayment' : 'confirmPayment')}
            style={{ borderRadius: 6, padding: '0 24px' }}
          >
            {isPaid ? 'Hủy xác nhận đã thanh toán' : 'Xác nhận đã thanh toán'}
          </Button>

          <Button
            danger
            onClick={() => openModal('cancelPayment')}
            style={{ borderRadius: 6, padding: '0 24px' }}
          >
            Hủy đơn thanh toán
          </Button>
        </div>
      </Card>

      <Modal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={modalLoading}
        maskClosable={false}
        destroyOnClose
      >
        {modalContent}
      </Modal>
    </>
  );
}

export default NursePaymentConfirmation;
