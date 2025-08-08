import React from 'react';
import { Modal, Descriptions, Tag, Avatar, Typography } from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ViewAccount = ({ visible, record, onCancel }) => {
    if (!record) return null;

    const getStatusColor = (active) => {
        return active ? 'success' : 'default';
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#ff4d4f';
            case 'doctor': return '#52c41a';
            case 'staff': return '#1890ff';
            case 'nurse': return '#d51ba0ff';
            case 'hospitalAdmin': return '#722ed1';
            case 'systemAdmin': return '#faad14';
            default: return '#1890ff';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EyeOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    Account Details
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <div style={{ padding: '20px 0' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <Avatar
                        size={80}
                        src={record.avatarUrl}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff', marginRight: 20 }}
                    />
                    <div>
                        <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                            {record.fullname}
                        </Title>
                        <div style={{ marginBottom: 8 }}>
                            <Tag color={getRoleColor(record.role)} style={{ fontSize: '12px' }}>
                                {record.role?.toUpperCase() || 'USER'}
                            </Tag>
                            <Tag color={getStatusColor(record.active)} style={{ fontSize: '12px' }}>
                                {record.active ? 'ACTIVE' : 'INACTIVE'}
                            </Tag>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <Descriptions title="Account Information" bordered column={2}>
                    <Descriptions.Item label="Full Name" span={2}>
                        {record.fullname || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Username">
                        {record.userName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {record.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone Number">
                        {record.phoneNumber || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Role">
                        <Tag color={getRoleColor(record.role)}>
                            {record.role?.toUpperCase() || 'USER'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(record.active)}>
                            {record.active ? 'ACTIVE' : 'INACTIVE'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                {/* Verification Status */}
                <Descriptions title="Verification Status" bordered column={2} style={{ marginTop: 24 }}>
                    <Descriptions.Item label="Email Verification">
                        <Tag color={record.isVerifiedEmail ? 'green' : 'orange'}>
                            {record.isVerifiedEmail ? 'VERIFIED' : 'UNVERIFIED'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone Verification">
                        <Tag color={record.isVerifiedPhone ? 'green' : 'orange'}>
                            {record.isVerifiedPhone ? 'VERIFIED' : 'UNVERIFIED'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                {/* System Information */}
                <Descriptions title="System Information" bordered column={1} style={{ marginTop: 24 }}>
                    <Descriptions.Item label="Account ID">
                        {record.id || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created Date">
                        {formatDate(record.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        {formatDate(record.updatedAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login">
                        {formatDate(record.lastLogin)}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
};

export default ViewAccount;