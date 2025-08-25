import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, BankOutlined } from '@ant-design/icons';
import EditDepartment from './EditDepartment';
import DeleteDepartment from './DeleteDepartment';
import ViewDepartment from './ViewDepartmentDetail';

const DepartmentTable = ({ departments, loading, pagination, onChange, onReload }) => {
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingDepartment, setViewingDepartment] = useState(null);

    const handleEdit = (record) => {
        console.log('DepartmentTable: Edit clicked for record:', record);
        setEditingDepartment(record);
        setShowEditModal(true);
    };

    const handleDelete = (record) => {
        console.log('🔍 DepartmentTable: Delete clicked for record:', record);
        setDepartmentToDelete(record);
        setShowDeleteModal(true);
    };

    const handleView = (record) => {
        setViewingDepartment(record);
        setShowViewModal(true);
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

    // ✅ Simplified columns based on API response structure
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            render: (text, record, index) => {
                return (pagination.current - 1) * pagination.pageSize + index + 1;
            }
        },
        {
            title: 'ID Khoa',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id) => (
                <Tag color="blue" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    #{id}
                </Tag>
            ),
        },
        {
            title: 'Tên Khoa/Phòng',
            key: 'name',
            width: 300,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        icon={<BankOutlined />}
                        style={{ 
                            marginRight: 12, 
                            backgroundColor: '#1890ff',
                            flexShrink: 0
                        }}
                        size="default"
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ 
                            fontWeight: 500, 
                            fontSize: '14px',
                            color: '#262626'
                        }}>
                            {record.name || 'Không có tên'}
                        </div>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#8c8c8c',
                            marginTop: '2px'
                        }}>
                            Hospital ID: {record.hospitalId || 'N/A'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 350,
            render: (description) => (
                <div style={{ 
                    maxWidth: 330,
                    lineHeight: '1.4'
                }}>
                    {description ? (
                        description.length > 80 ? (
                            <Tooltip title={description} placement="topLeft">
                                <span style={{ 
                                    fontSize: '13px',
                                    color: '#595959',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {description}
                                </span>
                            </Tooltip>
                        ) : (
                            <span style={{ 
                                fontSize: '13px',
                                color: '#595959'
                            }}>
                                {description}
                            </span>
                        )
                    ) : (
                        <span style={{ 
                            color: '#bfbfbf', 
                            fontSize: '13px',
                            fontStyle: 'italic'
                        }}>
                            Chưa có mô tả
                        </span>
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
                            size="small"
                            onClick={() => handleView(record)}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                            style={{ color: '#fa8c16' }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => {
                                console.log('Delete button clicked for record:', record);
                                handleDelete(record);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="department-table-container">
            <Table
                columns={columns}
                dataSource={departments}
                rowKey={(record) => record.id || Math.random()}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} khoa/phòng`,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                loading={loading}
                onChange={onChange}
                bordered={false}
                size="middle"
                scroll={{ x: 830 }}
                locale={{
                    emptyText: (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <BankOutlined style={{ 
                                fontSize: '48px', 
                                color: '#d9d9d9', 
                                marginBottom: '16px' 
                            }} />
                            <div style={{ 
                                color: '#999', 
                                fontSize: '16px', 
                                marginBottom: '8px' 
                            }}>
                                Không có dữ liệu khoa/phòng
                            </div>
                            <div style={{ color: '#ccc', fontSize: '12px' }}>
                                Hãy thử thêm khoa/phòng mới hoặc làm mới dữ liệu
                            </div>
                        </div>
                    ),
                    triggerDesc: 'Nhấn để sắp xếp giảm dần',
                    triggerAsc: 'Nhấn để sắp xếp tăng dần',
                    cancelSort: 'Nhấn để hủy sắp xếp',
                }}
                className="custom-department-table"
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            />

            {/* ✅ Enhanced modals với proper props */}
            {showEditModal && editingDepartment && (
                <EditDepartment
                    visible={showEditModal}
                    record={editingDepartment}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingDepartment(null);
                    }}
                    onSuccess={handleEditSuccess}
                    key={`edit-${editingDepartment.id}`}
                />
            )}

            {showDeleteModal && departmentToDelete && (
                <DeleteDepartment
                    visible={showDeleteModal}
                    record={departmentToDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDepartmentToDelete(null);
                    }}
                    onSuccess={handleDeleteSuccess}
                    key={`delete-${departmentToDelete.id}`}
                />
            )}

            {showViewModal && viewingDepartment && (
                <ViewDepartment
                    visible={showViewModal}
                    record={viewingDepartment}
                    onCancel={() => {
                        setShowViewModal(false);
                        setViewingDepartment(null);
                    }}
                    key={`view-${viewingDepartment.id}`}
                />
            )}
        </div>
    );
};

export default DepartmentTable;