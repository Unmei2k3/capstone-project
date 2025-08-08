import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';
import ViewUser from './ViewUser';
const UserTable = ({ users, loading, pagination, onChange, onReload }) => {
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
            case 'systemAdmin': return '#faad14';
            case 'hospitalAdmin': return '#722ed1';
            case 'doctor': return '#52c41a';
            case 'nurse': return '#13c2c2';
            case 'patient': return '#1890ff';
            default: return '#8c8c8c';
        }
    };


    // Extract role from username if not provided directly
    const getUserRole = (user) => {
        if (!user.role) return 'user';

        const roleType = user.role.roleType;
        const roleName = user.role.name;



        // Option 1: Map by roleType
        switch (roleType) {
            case 2: return 'doctor';
            case 4: return 'hospitalAdmin';
            case 5: return 'systemAdmin';
            case 6: return 'patient';
            case 7: return 'nurse';
            default: return 'user';
        }

        // Option 2: Return name directly
        // return roleName;
    };

    const columns = [
        {
            title: 'User',
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
        <div className="user-table-container">
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
                <EditUser
                    visible={showEditModal}
                    record={editingUser}
                    onCancel={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {showDeleteModal && (
                <DeleteUser
                    visible={showDeleteModal}
                    record={userToDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {showViewModal && (
                <ViewUser
                    visible={showViewModal}
                    record={viewingUser}
                    onCancel={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

export default UserTable;