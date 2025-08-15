import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar, message } from 'antd';
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
    const [actionLoading, setActionLoading] = useState(false);

    const handleEdit = (record) => {
        setEditingUser(record);
        setShowEditModal(true);
    };

    const handleDelete = (record) => {
        setUserToDelete(record);
        setShowDeleteModal(true);
    };

    // ✅ Enhanced edit success handler với loading state
    const handleEditSuccess = async (response, options = {}) => {
        try {
            setActionLoading(true);

            console.log('✅ User edit success:', response, options);

            // ✅ Show success message
            message.success(`Cập nhật thông tin "${editingUser?.fullname || 'người dùng'}" thành công!`);

            // ✅ Close modal
            setShowEditModal(false);
            setEditingUser(null);

            // ✅ Auto reload user list nếu có flag hoặc mặc định reload
            if (options.shouldReload !== false && onReload && typeof onReload === 'function') {
                console.log('🔄 Auto reloading user list after edit...');

                // ✅ Delay để user thấy success message trước khi reload
                setTimeout(() => {
                    onReload();
                }, 300);
            }
        } catch (error) {
            console.error('❌ Error handling edit success:', error);
        } finally {
            setTimeout(() => setActionLoading(false), 500);
        }
    };

    const handleView = (record) => {
        setViewingUser(record);
        setShowViewModal(true);
    };

    // ✅ Enhanced delete success handler với loading state
    const handleDeleteSuccess = async (response, options = {}) => {
        try {
            setActionLoading(true);

            console.log('✅ User delete success:', response, options);

            // ✅ Show success message
            message.success(`Đã xóa người dùng "${userToDelete?.fullname || 'người dùng'}" thành công!`);

            // ✅ Close modal
            setShowDeleteModal(false);
            setUserToDelete(null);

            // ✅ Auto reload user list nếu có flag hoặc mặc định reload
            if (options.shouldReload !== false && onReload && typeof onReload === 'function') {
                console.log('🔄 Auto reloading user list after delete...');

                // ✅ Delay để user thấy success message trước khi reload
                setTimeout(() => {
                    onReload();
                }, 300);
            }
        } catch (error) {
            console.error('❌ Error handling delete success:', error);
        } finally {
            setTimeout(() => setActionLoading(false), 500);
        }
    };

    // ✅ Handle modal cancel với cleanup
    const handleEditCancel = () => {
        setShowEditModal(false);
        setEditingUser(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const handleViewCancel = () => {
        setShowViewModal(false);
        setViewingUser(null);
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

    // ✅ Chuyển đổi role sang tiếng Việt
    const getRoleDisplayName = (roleType) => {
        switch (roleType) {
            case 1: return 'Người dùng';
            case 2: return 'Bác sĩ';
            case 4: return 'Quản trị viên BV';
            case 5: return 'Quản trị hệ thống';
            case 6: return 'Bệnh nhân';
            case 7: return 'Y tá';
            default: return 'Không xác định';
        }
    };

    // Extract role from username if not provided directly
    const getUserRole = (user) => {
        if (!user.role) return 'user';

        const roleType = user.role.roleType;

        // Option 1: Map by roleType
        switch (roleType) {
            case 2: return 'doctor';
            case 4: return 'hospitalAdmin';
            case 5: return 'systemAdmin';
            case 6: return 'patient';
            case 7: return 'nurse';
            default: return 'user';
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            width: 250,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        icon={<UserOutlined />}
                        style={{
                            marginRight: 12,
                            backgroundColor: '#1890ff',
                            flexShrink: 0
                        }}
                        src={record.avatarUrl}
                        size="default"
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {record.fullname || record.fullName || 'Không rõ'}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {record.email || 'Chưa có email'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'userName',
            key: 'userName',
            width: 150,
            render: (text) => (
                <span style={{ fontSize: '13px' }}>
                    {text || 'Chưa có'}
                </span>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 130,
            render: (text) => (
                <span style={{ fontSize: '13px' }}>
                    {text || 'Chưa có'}
                </span>
            ),
        },
        {
            title: 'Vai trò',
            key: 'role',
            width: 150,
            render: (_, record) => {
                const role = getUserRole(record);
                const roleType = record.role?.roleType || record.roleType;
                const displayName = getRoleDisplayName(roleType);

                return (
                    <Tag color={getRoleColor(role)} className="user-role-tag">
                        {displayName}
                    </Tag>
                );
            },
        },
        {
            title: 'Bệnh viện',
            key: 'hospital',
            width: 180,
            render: (_, record) => (
                <span style={{
                    fontSize: '12px',
                    color: record.hospitalName ? '#333' : '#999'
                }}>
                    {record.hospitalName || 'Chưa phân công'}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => (
                <Tag color={getStatusColor(record.active)} className="user-status-tag">
                    {record.active ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                </Tag>
            ),
        },
        {
            title: 'Xác thực',
            key: 'verification',
            width: 130,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Tag
                        color={record.isVerifiedEmail ? 'green' : 'orange'}
                        style={{ margin: 0, fontSize: '10px', padding: '1px 6px' }}
                    >
                        {record.isVerifiedEmail ? '✓ Email' : '⏳ Email'}
                    </Tag>
                    {record.phoneNumber && (
                        <Tag
                            color={record.isVerifiedPhone ? 'green' : 'orange'}
                            style={{ margin: 0, fontSize: '10px', padding: '1px 6px' }}
                        >
                            {record.isVerifiedPhone ? '✓ SĐT' : '⏳ SĐT'}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            style={{ color: '#1890ff' }}
                            size="small"
                            disabled={actionLoading}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            style={{ color: '#52c41a' }}
                            size="small"
                            disabled={actionLoading}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                            size="small"
                            disabled={actionLoading}
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
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} người dùng`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    size: 'default'
                }}
                loading={loading || actionLoading ? {
                    tip: actionLoading ? 'Đang xử lý...' : 'Đang tải dữ liệu...'
                } : false}
                onChange={onChange}
                bordered={false}
                size="middle"
                locale={{
                    emptyText: (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                            <div style={{ color: '#999', fontSize: '16px', marginBottom: '8px' }}>
                                Không có dữ liệu người dùng
                            </div>
                            <div style={{ color: '#ccc', fontSize: '12px' }}>
                                Hãy thử thêm người dùng mới hoặc thay đổi bộ lọc
                            </div>
                        </div>
                    ),
                    triggerDesc: 'Nhấn để sắp xếp giảm dần',
                    triggerAsc: 'Nhấn để sắp xếp tăng dần',
                    cancelSort: 'Nhấn để hủy sắp xếp',
                }}
                scroll={{ x: 1200 }}
                className="custom-user-table"
            />

            {/* ✅ Edit Modal với enhanced props */}
            {showEditModal && editingUser && (
                <EditUser
                    visible={showEditModal}
                    record={editingUser}
                    onCancel={handleEditCancel}
                    onSuccess={handleEditSuccess}
                    key={`edit-${editingUser.id}`} // Force re-render when user changes
                />
            )}

            {/* ✅ Delete Modal với enhanced props */}
            {showDeleteModal && userToDelete && (
                <DeleteUser
                    visible={showDeleteModal}
                    record={userToDelete}
                    onCancel={handleDeleteCancel}
                    onSuccess={handleDeleteSuccess}
                    key={`delete-${userToDelete.id}`} // Force re-render when user changes
                />
            )}

            {/* ✅ View Modal với enhanced props */}
            {showViewModal && viewingUser && (
                <ViewUser
                    visible={showViewModal}
                    record={viewingUser}
                    onCancel={handleViewCancel}
                    key={`view-${viewingUser.id}`} // Force re-render when user changes
                />
            )}
        </div>
    );
};

export default UserTable;