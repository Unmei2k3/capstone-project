import React from 'react';
import { Modal, Descriptions, Avatar, Tag, Row, Col, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, IdcardOutlined } from '@ant-design/icons';

const ViewUser = ({ visible, record, onCancel }) => {
  if (!record) return null;

  // ✅ Sử dụng role từ API response
  const getUserRole = (user) => {
    if (!user.role) return 'user';
    
    const roleType = user.role.roleType;
    
    // Map by roleType
    switch (roleType) {
      case 2: return 'doctor';
      case 4: return 'hospitalAdmin';
      case 5: return 'systemAdmin';
      case 6: return 'patient';
      case 7: return 'nurse';
      default: return 'user';
    }
  };

  // ✅ Chuyển đổi role display name sang tiếng Việt
  const getRoleDisplayName = (user) => {
    if (!user.role) return 'Người dùng';
    
    const roleType = user.role.roleType;
    switch (roleType) {
      case 2: return 'Bác sĩ';
      case 4: return 'Quản trị viên Bệnh viện';
      case 5: return 'Quản trị viên Hệ thống';
      case 6: return 'Bệnh nhân';
      case 7: return 'Y tá';
      default: return 'Người dùng';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'systemAdmin':
        return '#faad14'; // Gold
      case 'hospitalAdmin':
        return '#722ed1'; // Purple
      case 'doctor':
        return '#52c41a'; // Green
      case 'nurse':
        return '#13c2c2'; // Cyan
      case 'patient':
        return '#1890ff'; // Blue
      default:
        return '#8c8c8c'; // Gray
    }
  };

  // ✅ Format date properly (handle "0001-01-01" from API) - Tiếng Việt
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01' || dateString.startsWith('0001-01-01')) {
      return 'Chưa cung cấp';
    }
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  // ✅ Format gender - Tiếng Việt
  const formatGender = (gender) => {
    if (gender === null || gender === undefined) return 'Chưa xác định';
    return gender ? 'Nam' : 'Nữ';
  };

  // ✅ Get verification status with proper null handling - Tiếng Việt
  const getVerificationStatus = (isVerified) => {
    if (isVerified === null || isVerified === undefined) {
      return (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#8c8c8c' }}>Chưa thiết lập</span>
        </span>
      );
    }
    return isVerified ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
        <span style={{ color: '#52c41a' }}>Đã xác thực</span>
      </span>
    ) : (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
        <span style={{ color: '#ff4d4f' }}>Chưa xác thực</span>
      </span>
    );
  };

  const role = getUserRole(record);
  const roleDisplayName = getRoleDisplayName(record);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: '16px' }} />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>
            Chi tiết Người dùng: {record.fullname || 'Không rõ'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="custom-modal"
      destroyOnClose
    >
      <div style={{ padding: '20px 0' }}>
        {/* ✅ User Avatar and Basic Info */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={record.avatarUrl || undefined}
                style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
              />
              <div>
                <Tag 
                  color={getRoleColor(role)} 
                  style={{ fontSize: '14px', padding: '4px 12px', marginBottom: 8 }}
                >
                  {roleDisplayName?.toUpperCase() || 'NGƯỜI DÙNG'}
                </Tag>
              </div>
              <div>
                <Tag color={record.active ? 'success' : 'default'}>
                  {record.active ? 'HOẠT ĐỘNG' : 'NGƯNG HOẠT ĐỘNG'}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Họ và tên" span={2}>
                <strong>{record.fullname || 'Chưa có'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">
                {record.userName || 'Chưa có'}
              </Descriptions.Item>
              <Descriptions.Item label="ID người dùng">
                <code>{record.id || 'Chưa có'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {record.email || 'Chưa có'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {record.phoneNumber || 'Chưa cung cấp'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider orientation="left" style={{ fontWeight: 600 }}>
          <span style={{ color: '#1890ff' }}>📋 Thông tin cá nhân</span>
        </Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Ngày sinh">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {formatDate(record.dob)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {formatGender(record.gender)}
          </Descriptions.Item>
          <Descriptions.Item label="Nghề nghiệp">
            {record.job || 'Chưa cung cấp'}
          </Descriptions.Item>
          <Descriptions.Item label="Căn cước công dân">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <IdcardOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {record.cccd || 'Chưa cung cấp'}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ fontWeight: 600 }}>
          <span style={{ color: '#1890ff' }}>📍 Thông tin địa chỉ</span>
        </Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Tỉnh/Thành phố">
            {record.province || 'Chưa cung cấp'}
          </Descriptions.Item>
          <Descriptions.Item label="Phường/Xã">
            {record.ward || 'Chưa cung cấp'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ đường phố" span={2}>
            {record.streetAddress || 'Chưa cung cấp'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ fontWeight: 600 }}>
          <span style={{ color: '#1890ff' }}>🔐 Trạng thái tài khoản</span>
        </Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Xác thực Email">
            {getVerificationStatus(record.isVerifiedEmail)}
          </Descriptions.Item>
          <Descriptions.Item label="Xác thực Số điện thoại">
            {getVerificationStatus(record.isVerifiedPhone)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái tài khoản">
            <Tag color={record.active ? 'success' : 'default'} style={{ fontSize: '12px' }}>
              {record.active ? '✅ HOẠT ĐỘNG' : '⏸️ NGƯNG HOẠT ĐỘNG'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức đăng ký">
            {record.registerProvider === 'Google' ? 'Google' : 
             record.registerProvider === 'Facebook' ? 'Facebook' :
             record.registerProvider || 'Đăng ký trực tiếp'}
          </Descriptions.Item>
        </Descriptions>

        {/* ✅ Additional System Info */}
        <Divider orientation="left" style={{ fontWeight: 600 }}>
          <span style={{ color: '#1890ff' }}>⚙️ Thông tin hệ thống</span>
        </Divider>
        
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Vai trò hệ thống">
            <Tag color={getRoleColor(role)} style={{ fontSize: '12px' }}>
              {roleDisplayName}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mã vai trò">
            <code>{record.role?.roleType || 'Không rõ'}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo tài khoản">
            {record.createdAt ? formatDate(record.createdAt) : 'Không rõ'}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật cuối">
            {record.updatedAt ? formatDate(record.updatedAt) : 'Không rõ'}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default ViewUser;