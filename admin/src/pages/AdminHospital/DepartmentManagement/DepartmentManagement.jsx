import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge, Select } from 'antd';
import { PlusOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import DepartmentTable from './DepartmentTable';
import AddDepartment from './AddDepartment';
import { getAllDepartments } from '../../../services/departmentService';
import './DepartmentManage.scss';

const { TabPane } = Tabs;
const { Option } = Select;

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        inactive: 0,
    });

    const fetchDepartments = async (page = 1, pageSize = 10, search = '', status = 'all') => {
        console.log('DepartmentManagement: fetchDepartments called with:', { page, pageSize, search, status });

        setLoading(true);
        try {
            const response = await getAllDepartments();
            console.log('DepartmentManagement: getAllDepartments response:', response);

            let allData = [];

            // Handle different response formats
            if (Array.isArray(response)) {
                allData = response;
            } else if (response && response.items) {
                allData = response.items;
            } else if (response && response.data) {
                allData = response.data;
            }

            // Add default status if missing
            allData = allData.map(dept => ({
                ...dept,
                status: dept.status || 'active'
            }));

            setAllDepartments(allData);

            // Apply client-side filtering
            let filteredData = allData;

            // Filter by search text
            if (search && search.trim() !== '') {
                const searchLower = search.toLowerCase();
                filteredData = filteredData.filter(dept =>
                    dept.name?.toLowerCase().includes(searchLower) ||
                    dept.description?.toLowerCase().includes(searchLower)
                );
            }

            // Filter by status
            if (status && status !== 'all') {
                filteredData = filteredData.filter(dept => dept.status === status);
            }

            // Apply client-side pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            setDepartments(paginatedData);
            setPagination({
                current: page,
                pageSize,
                total: filteredData.length,
            });

            // Calculate counts
            setCounts({
                all: allData.length,
                active: allData.filter(dept => dept.status === 'active').length,
                inactive: allData.filter(dept => dept.status === 'inactive').length,
            });

        } catch (error) {
            console.error('Failed to fetch departments:', error);

            // Reset data on error
            setDepartments([]);
            setAllDepartments([]);
            setPagination({
                current: 1,
                pageSize: 10,
                total: 0,
            });
            setCounts({
                all: 0,
                active: 0,
                inactive: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ THÊM: useCallback để tối ưu performance
    const debouncedFetchDepartments = useCallback(
        debounce((search, status) => {
            fetchDepartments(1, pagination.pageSize, search, status);
        }, 300), // Delay 300ms
        [pagination.pageSize]
    );

    // ✅ THÊM: useEffect để watch searchText changes
    useEffect(() => {
        if (allDepartments.length > 0) {
            // Chỉ gọi khi đã có data và search text thay đổi
            debouncedFetchDepartments(searchText, statusFilter);
        }
    }, [searchText, debouncedFetchDepartments, statusFilter, allDepartments.length]);

    // Initial data load
    useEffect(() => {
        fetchDepartments(pagination.current, pagination.pageSize, searchText, statusFilter);
    }, []);

    const handleTableChange = (paginationConfig) => {
        fetchDepartments(paginationConfig.current, paginationConfig.pageSize, searchText, statusFilter);
    };

    // ✅ SỬA: Không cần handleSearch nữa vì search tự động
    const handleSearch = () => {
        // Function này giờ chỉ để tương thích, search đã tự động
        fetchDepartments(1, pagination.pageSize, searchText, statusFilter);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        fetchDepartments(1, pagination.pageSize, searchText, value);
    };

    // ✅ THÊM: Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        // Reset về page 1 khi search
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleAddDepartment = () => {
        setShowAddModal(true);
    };

    const handleAddDepartmentSuccess = () => {
        setShowAddModal(false);
        fetchDepartments(pagination.current, pagination.pageSize, searchText, statusFilter);
    };

    const getFilteredDepartments = (status) => {
        if (status === 'all') return departments;
        return allDepartments.filter(dept => dept.status === status);
    };

    return (
        <div className="department-management-container">
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h2>
                                <BankOutlined style={{ marginRight: 12 }} />
                                Department Management
                            </h2>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddDepartment}
                                size="large"
                            >
                                Add Department
                            </Button>
                        </Col>
                    </Row>
                </Col>

                <Col span={24}>
                    <Card>
                        <Row className="actions-row" gutter={16}>
                            <Col xs={24} sm={12} md={8} lg={6} className="search-container">
                                <Input.Search
                                    placeholder="Search departments..."
                                    value={searchText}
                                    onChange={handleSearchChange} // ✅ SỬA: Dùng handleSearchChange
                                    onSearch={handleSearch} // Vẫn giữ để nhấn Enter hoạt động
                                    enterButton={<SearchOutlined />}
                                    allowClear
                                    loading={loading} // ✅ THÊM: Hiển thị loading khi search
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6} lg={4}>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilter}
                                    style={{ width: '100%' }}
                                    placeholder="Filter by status"
                                >
                                    <Option value="all">All Status</Option>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Col>
                        </Row>

                        <Tabs
                            defaultActiveKey="1"
                            className="department-tabs"
                            onChange={(key) => {
                                const statusMap = { '1': 'all', '2': 'active', '3': 'inactive' };
                                handleStatusFilter(statusMap[key]);
                            }}
                        >
                            <TabPane
                                tab={
                                    <span>
                                        All Departments <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="1"
                            >
                                <DepartmentTable
                                    departments={statusFilter === 'all' ? departments : getFilteredDepartments('all')}
                                    loading={loading}
                                    pagination={statusFilter === 'all' ? pagination : { ...pagination, total: counts.all }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchDepartments(pagination.current, pagination.pageSize, searchText, statusFilter)}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Active <Badge count={counts.active} style={{ backgroundColor: '#52c41a' }} />
                                    </span>
                                }
                                key="2"
                            >
                                <DepartmentTable
                                    departments={statusFilter === 'active' ? departments : getFilteredDepartments('active')}
                                    loading={loading}
                                    pagination={statusFilter === 'active' ? pagination : { ...pagination, total: counts.active }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchDepartments(pagination.current, pagination.pageSize, searchText, statusFilter)}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Inactive <Badge count={counts.inactive} style={{ backgroundColor: '#ff4d4f' }} />
                                    </span>
                                }
                                key="3"
                            >
                                <DepartmentTable
                                    departments={statusFilter === 'inactive' ? departments : getFilteredDepartments('inactive')}
                                    loading={loading}
                                    pagination={statusFilter === 'inactive' ? pagination : { ...pagination, total: counts.inactive }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchDepartments(pagination.current, pagination.pageSize, searchText, statusFilter)}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            {showAddModal && (
                <AddDepartment
                    visible={showAddModal}
                    onCancel={() => setShowAddModal(false)}
                    onSuccess={handleAddDepartmentSuccess}
                />
            )}
        </div>
    );
};

// ✅ THÊM: Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default DepartmentManagement;