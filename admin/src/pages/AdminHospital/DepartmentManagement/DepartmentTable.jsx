import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, BankOutlined, UserOutlined, PhoneOutlined, TeamOutlined } from '@ant-design/icons';
import EditDepartment from './EditDepartment';
import DeleteDepartment from './DeleteDepartment';
import ViewDepartment from './ViewDepartmentDetail';
import DoctorManagement from './DoctorManage';

const DepartmentTable = ({ departments, loading, pagination, onChange, onReload }) => {
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null); // Sử dụng này thay vì selectedRecord
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingDepartment, setViewingDepartment] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [managingDepartment, setManagingDepartment] = useState(null);

    const handleEdit = (record) => {
        console.log('DepartmentTable: Edit clicked for record:', record);
        setEditingDepartment(record);
        setShowEditModal(true);
    };

    const handleDelete = (record) => {
        console.log('🔍 DepartmentTable: Delete clicked for record:', record);
        console.log('🔍 Record keys:', Object.keys(record || {}));
        console.log('🔍 Record ID:', record?.id);
        console.log('🔍 Record structure:', JSON.stringify(record, null, 2));

        setDepartmentToDelete(record);
        setShowDeleteModal(true);
    };

    const handleView = (record) => {
        setViewingDepartment(record);
        setShowViewModal(true);
    };

    const handleManageDoctors = (record) => {
        setManagingDepartment(record);
        setShowDoctorModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingDepartment(null);
        onReload();
    };

    const handleDeleteSuccess = () => {
        setShowDeleteModal(false);
        setDepartmentToDelete(null);
        onReload();
    };

    const handleDoctorManagementSuccess = () => {
        onReload(); // Refresh department data
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const columns = [
        {
            title: 'Department',
            key: 'department',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        icon={<BankOutlined />}
                        style={{ marginRight: 12, backgroundColor: '#1890ff' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            ID: {record.id} {record.code && `| Code: ${record.code}`}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description) => (
                <div style={{ maxWidth: 200 }}>
                    {description ? (
                        description.length > 80
                            ? description.substring(0, 80) + '...'
                            : description
                    ) : 'N/A'}
                </div>
            ),
        },
        {
            title: 'Head of Department',
            key: 'head',
            render: (_, record) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                        <span style={{ fontSize: '12px' }}>{record.headOfDepartment || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                        <span style={{ fontSize: '12px' }}>{record.phoneNumber || 'N/A'}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location) => location || 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} className="department-status-tag">
                    {status?.toUpperCase() || 'ACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Statistics',
            key: 'statistics',
            render: (_, record) => (
                <div>
                    <div style={{ fontSize: '12px' }}>Staff: <strong>{record.totalStaff || 0}</strong></div>
                    <div style={{ fontSize: '12px' }}>Beds: <strong>{record.totalBeds || 0}</strong></div>
                </div>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => {


                return (
                    <Space size="small">
                        <Tooltip title="View Details">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handleView(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Manage Doctors">
                            <Button
                                type="text"
                                icon={<TeamOutlined />}
                                onClick={() => handleManageDoctors(record)}
                                style={{ color: '#52c41a' }}
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
                                onClick={() => {
                                    console.log('Delete button clicked for record:', record);
                                    handleDelete(record);
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="department-table-container">
            <Table
                columns={columns}
                dataSource={departments}
                rowKey={(record) => {

                    return record.id || record.departmentId || record.deptId || Math.random();
                }}
                pagination={pagination}
                loading={loading}
                onChange={onChange}
                bordered={false}
                size="middle"
            />

            {showEditModal && (
                <EditDepartment
                    visible={showEditModal}
                    record={editingDepartment}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingDepartment(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}

            {showDeleteModal && (
                <DeleteDepartment
                    visible={showDeleteModal}
                    record={departmentToDelete} // Sử dụng departmentToDelete thay vì selectedRecord
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDepartmentToDelete(null);
                    }}
                    onSuccess={handleDeleteSuccess}
                />
            )}

            {showViewModal && (
                <ViewDepartment
                    visible={showViewModal}
                    record={viewingDepartment}
                    onCancel={() => {
                        setShowViewModal(false);
                        setViewingDepartment(null);
                    }}
                />
            )}

            {showDoctorModal && (
                <DoctorManagement
                    visible={showDoctorModal}
                    department={managingDepartment}
                    onCancel={() => {
                        setShowDoctorModal(false);
                        setManagingDepartment(null);
                    }}
                    onSuccess={handleDoctorManagementSuccess}
                />
            )}
        </div>
    );
};

export default DepartmentTable;