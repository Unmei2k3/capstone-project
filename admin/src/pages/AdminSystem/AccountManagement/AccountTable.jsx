import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import EditAccount from './EditAccount';
import DeleteAccount from './DeleteAccount';
import ViewAccount from './ViewAccount';

const AccountTable = ({ users, loading, pagination, onChange, onReload }) => {
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    const handleEdit = (record) => {
        setEditingUser(record);
        setShowEditModal(true);
    };

    const handleDelete = (record) => {
        setUserToDelete(record);
        setShowDeleteModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        onReload();
    };

    const handleView = (record) => {
        setViewingUser(record);
        setShowViewModal(true);
    };

    const handleDeleteSuccess = () => {
        setShowDeleteModal(false);
        onReload();
    };

    const getStatusColor = (active) => {
        return active ? 'success' : 'default';
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return '#ff4d4f';
            case 'doctor':
                return '#52c41a';
            case 'staff':
                return '#1890ff';
            case 'nurse':
                return '#d51ba0ff';
            case 'hospitalAdmin':
                return '#722ed1';
            case 'systemAdmin':
                return '#faad14';
            default:
                return '#1890ff';
        }
    };

    // Extract role from username if not provided directly
    const getUserRole = (user) => {
        if (user.role) return user.role;

        const username = user.userName?.toLowerCase();
        if (username.includes('admin')) return 'admin';
        if (username.includes('doctor')) return 'doctor';
        if (username.includes('staff')) return 'staff';
        if (username.includes('nurse')) return 'nurse';
        if (username.includes('hospitaladmin')) return 'hospitalAdmin';
        if (username.includes('systemadmin')) return 'systemAdmin';
        return 'user';
    };

    const columns = [
        {
            title: 'Account',
            key: 'user',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{ marginRight: 12, backgroundColor: '#1890ff' }}
                        src={record.avatarUrl}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.fullname}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Role',
            key: 'role',
            render: (_, record) => {
                const role = getUserRole(record);
                return (
                    <Tag color={getRoleColor(role)} className="user-role-tag">
                        {role?.toUpperCase() || 'USER'}
                    </Tag>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={getStatusColor(record.active)} className="user-status-tag">
                    {record.active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Verification',
            key: 'verification',
            render: (_, record) => (
                <>
                    <Tag color={record.isVerifiedEmail ? 'green' : 'orange'} style={{ marginRight: 4 }}>
                        {record.isVerifiedEmail ? 'Email verified' : 'Email unverified'}
                    </Tag>
                    {record.phoneNumber && (
                        <Tag color={record.isVerifiedPhone ? 'green' : 'orange'}>
                            {record.isVerifiedPhone ? 'Phone verified' : 'Phone unverified'}
                        </Tag>
                    )}
                </>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="account-table-container">
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={onChange}
                bordered={false}
                size="middle"
            />

            {showEditModal && (
                <EditAccount
                    visible={showEditModal}
                    record={editingUser}
                    onCancel={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {showDeleteModal && (
                <DeleteAccount
                    visible={showDeleteModal}
                    record={userToDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {showViewModal && (
                <ViewAccount
                    visible={showViewModal}
                    record={viewingUser}
                    onCancel={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

export default AccountTable;