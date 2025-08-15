import React, { useState, useEffect } from 'react';
import { Button, Input, Row, Col, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import DepartmentTable from './DepartmentTable';
import AddDepartment from './AddDepartment';
import { getAllDepartments } from '../../../services/departmentService';
import { clearMessage, setMessage } from '../../../redux/slices/messageSlice';
import './DepartmentManage.scss';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Redux hooks
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);
    const dispatch = useDispatch();

    // Handle Redux messages
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, messageApi, dispatch]);

    const fetchDepartments = async (page = 1, pageSize = 10, search = '', showMessage = false) => {
        setLoading(true);



        try {
            const response = await getAllDepartments();
            let allData = [];

            // Handle different response formats
            if (Array.isArray(response)) {
                allData = response;
            } else if (response?.items) {
                allData = response.items;
            } else if (response?.data) {
                allData = response.data;
            }

            // Filter by search text
            let filteredData = allData;
            if (search && search.trim() !== '') {
                const searchLower = search.toLowerCase();
                filteredData = filteredData.filter(dept =>
                    dept.name?.toLowerCase().includes(searchLower) ||
                    dept.description?.toLowerCase().includes(searchLower)
                );
            }

            // Apply pagination
            const startIndex = (page - 1) * pageSize;
            const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

            setDepartments(paginatedData);
            setPagination({
                current: page,
                pageSize,
                total: filteredData.length,
            });



        } catch (error) {
            console.error('Lỗi tải danh sách khoa:', error);

            dispatch(setMessage({
                type: 'error',
                content: '❌ Không thể tải danh sách khoa. Vui lòng thử lại!'
            }));

            setDepartments([]);
            setPagination({ current: 1, pageSize: 10, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleTableChange = (paginationConfig) => {
        fetchDepartments(paginationConfig.current, paginationConfig.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchDepartments(1, pagination.pageSize, searchText, true);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));

        // Auto search after user stops typing
        clearTimeout(handleSearchChange.timeoutId);
        handleSearchChange.timeoutId = setTimeout(() => {
            fetchDepartments(1, pagination.pageSize, value);
        }, 300);
    };

    const handleAddDepartment = () => {
        setShowAddModal(true);
        dispatch(setMessage({
            type: 'info',
            content: '➕ Mở form thêm khoa mới'
        }));
    };

    const handleAddDepartmentSuccess = (newDepartment) => {
        setShowAddModal(false);

        dispatch(setMessage({
            type: 'success',
            content: `✅ Thêm khoa "${newDepartment?.name || 'mới'}" thành công!`
        }));

        // Reload data
        fetchDepartments(pagination.current, pagination.pageSize, searchText, true);
    };

    const handleAddDepartmentCancel = () => {
        setShowAddModal(false);
        dispatch(setMessage({
            type: 'info',
            content: '🚫 Đã hủy thêm khoa mới'
        }));
    };

    const handleEditDepartmentSuccess = (updatedDepartment) => {
        dispatch(setMessage({
            type: 'success',
            content: `✅ Cập nhật khoa "${updatedDepartment?.name || ''}" thành công!`
        }));

        // Reload data
        fetchDepartments(pagination.current, pagination.pageSize, searchText, true);
    };

    const handleDeleteDepartmentSuccess = (deletedDepartment) => {
        dispatch(setMessage({
            type: 'success',
            content: `✅ Xóa khoa "${deletedDepartment?.name || ''}" thành công!`
        }));

        setTimeout(() => {
            dispatch(setMessage({
                type: 'warning',
                content: '⚠️ Dữ liệu đã được xóa vĩnh viễn'
            }));
        }, 1000);

        // Smart pagination adjustment
        const newTotal = pagination.total - 1;
        const newPage = Math.max(1, Math.ceil(newTotal / pagination.pageSize));
        const targetPage = pagination.current > newPage ? newPage : pagination.current;

        fetchDepartments(targetPage, pagination.pageSize, searchText, true);
    };

    const handleDepartmentError = (error, operation) => {
        const operationMessages = {
            add: 'Không thể thêm khoa mới',
            edit: 'Không thể cập nhật khoa',
            delete: 'Không thể xóa khoa'
        };

        dispatch(setMessage({
            type: 'error',
            content: `❌ ${operationMessages[operation]}. Vui lòng thử lại!`
        }));
    };

    const handleRefresh = () => {
        dispatch(setMessage({
            type: 'info',
            content: '🔄 Đang làm mới danh sách khoa...'
        }));
        fetchDepartments(pagination.current, pagination.pageSize, searchText, true);
    };

    return (
        <>
            {contextHolder}

            <div className="department-management-container">
                <Row gutter={[0, 24]}>
                    <Col span={24}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 600,
                                    color: '#262626',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <BankOutlined style={{
                                        marginRight: 12,
                                        color: '#1890ff',
                                        fontSize: '28px'
                                    }} />
                                    Quản lý khoa
                                </h2>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddDepartment}
                                    size="large"
                                    style={{
                                        borderRadius: '6px',
                                        height: '44px',
                                        fontSize: '16px',
                                        fontWeight: 500
                                    }}
                                >
                                    Thêm khoa mới
                                </Button>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={24}>
                        <Card style={{
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Row gutter={16} style={{ marginBottom: '24px' }}>
                                <Col xs={24} sm={16} md={12} lg={8}>
                                    <Input.Search
                                        placeholder="Tìm kiếm theo tên khoa hoặc mô tả..."
                                        value={searchText}
                                        onChange={handleSearchChange}
                                        onSearch={handleSearch}
                                        enterButton={<SearchOutlined />}
                                        allowClear
                                        loading={loading}
                                        size="large"
                                        style={{ borderRadius: '6px' }}
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '40px',
                                        color: '#666',
                                        fontSize: '14px'
                                    }}>
                                        Tổng: <strong style={{
                                            marginLeft: '8px',
                                            color: '#1890ff',
                                            fontSize: '16px'
                                        }}>
                                            {pagination.total} khoa
                                        </strong>
                                    </div>
                                </Col>
                            </Row>

                            <DepartmentTable
                                departments={departments}
                                loading={loading}
                                pagination={pagination}
                                onChange={handleTableChange}
                                onReload={handleRefresh}
                                onEditSuccess={handleEditDepartmentSuccess}
                                onDeleteSuccess={handleDeleteDepartmentSuccess}
                                onError={handleDepartmentError}
                            />
                        </Card>
                    </Col>
                </Row>

                {showAddModal && (
                    <AddDepartment
                        visible={showAddModal}
                        onCancel={handleAddDepartmentCancel}
                        onSuccess={handleAddDepartmentSuccess}
                        onError={(error) => handleDepartmentError(error, 'add')}
                    />
                )}
            </div>
        </>
    );
};

export default DepartmentManagement;