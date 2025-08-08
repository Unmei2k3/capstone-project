import React from 'react';
import { Modal, Descriptions, Avatar, Tag, Row, Col, Divider } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, IdcardOutlined } from '@ant-design/icons';

const ViewUser = ({ visible, record, onCancel }) => {
  if (!record) return null;

  // ✅ Sử dụng role từ API response
  const getUserRole = (user) => {
    if (!user.role) return 'user';
    
    const roleType = user.role.roleType;
    const roleName = user.role.name;
    
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

  const getRoleDisplayName = (user) => {
    if (!user.role) return 'User';
    return user.role.name; // "System Admin", "Hospital Admin", "Doctor", etc.
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

  // ✅ Format date properly (handle "0001-01-01" from API)
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01' || dateString.startsWith('0001-01-01')) {
      return 'Not provided';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ Format gender
  const formatGender = (gender) => {
    return gender ? 'Male' : 'Female';
  };

  // ✅ Get verification status with proper null handling
  const getVerificationStatus = (isVerified) => {
    if (isVerified === null || isVerified === undefined) {
      return (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#8c8c8c' }}>Not set</span>
        </span>
      );
    }
    return isVerified ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
        <span style={{ color: '#52c41a' }}>Verified</span>
      </span>
    ) : (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
        <span style={{ color: '#ff4d4f' }}>Not Verified</span>
      </span>
    );
  };

  const role = getUserRole(record);
  const roleDisplayName = getRoleDisplayName(record);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          User Details: {record.fullname}
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="custom-modal"
    >
      <div style={{ padding: '20px 0' }}>
        {/* User Avatar and Basic Info */}
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
                  {roleDisplayName?.toUpperCase() || 'USER'}
                </Tag>
              </div>
              <div>
                <Tag color={record.active ? 'success' : 'default'}>
                  {record.active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Full Name" span={2}>
                <strong>{record.fullname || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                {record.userName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {record.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {record.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {record.phoneNumber || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider orientation="left">Personal Information</Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Date of Birth">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(record.dob)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {formatGender(record.gender)}
          </Descriptions.Item>
          <Descriptions.Item label="Job/Occupation">
            {record.job || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="CCCD/ID Card">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <IdcardOutlined style={{ marginRight: 4 }} />
              {record.cccd || 'Not provided'}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Address Information</Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Province">
            {record.province || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Ward">
            {record.ward || 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Street Address" span={2}>
            {record.streetAddress || 'Not provided'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Account Status</Divider>
        
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Email Verification">
            {getVerificationStatus(record.isVerifiedEmail)}
          </Descriptions.Item>
          <Descriptions.Item label="Phone Verification">
            {getVerificationStatus(record.isVerifiedPhone)}
          </Descriptions.Item>
          <Descriptions.Item label="Account Status">
            <Tag color={record.active ? 'success' : 'default'}>
              {record.active ? 'ACTIVE' : 'INACTIVE'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Register Provider">
            {record.registerProvider || 'Direct Registration'}
          </Descriptions.Item>
        </Descriptions>

        
      </div>
    </Modal>
  );
};

export default ViewUser;