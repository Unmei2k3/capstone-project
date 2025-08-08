import React, { useState, useEffect } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import UserTable from './UserTable';
import AddUser from './AddUser';
import { getAllUsers } from '../../../services/userService';
import './styles.scss';

const { TabPane } = Tabs;

// Hàm phụ trợ để xác định vai trò từ username
const getUserRole = (user) => {
    if (user.role) return user.role;

    const username = user.userName?.toLowerCase();
    if (username.includes('admin')) return 'admin';
    if (username.includes('doctor')) return 'doctor';
    if (username.includes('staff')) return 'staff';
    if (username.includes('hospitaladmin')) return 'hospitalAdmin';
    if (username.includes('systemadmin')) return 'systemAdmin';
    return 'user';
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [counts, setCounts] = useState({
        all: 0,
        admin: 0,
        doctor: 0,
        staff: 0,
        user: 0,
    });

    const fetchUsers = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await getAllUsers({
                page,
                pageSize,
                search,
            });

            if (response && response.success) {
                const userData = response.result || [];
                setUsers(userData);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize,
                    total: userData.length,
                });

                // Phân loại người dùng theo vai trò
                const adminCount = userData.filter(user => getUserRole(user) === 'admin').length;
                const doctorCount = userData.filter(user => getUserRole(user) === 'doctor').length;
                const staffCount = userData.filter(user => getUserRole(user) === 'staff').length;
                const normalUserCount = userData.filter(user => getUserRole(user) === 'user').length;

                setCounts({
                    all: userData.length,
                    admin: adminCount,
                    doctor: doctorCount,
                    staff: staffCount,
                    user: normalUserCount,
                });
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, searchText);
    }, []);

    const handleTableChange = (pagination) => {
        fetchUsers(pagination.current, pagination.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchUsers(1, pagination.pageSize, searchText);
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleAddUserSuccess = () => {
        setShowAddModal(false);
        fetchUsers(pagination.current, pagination.pageSize, searchText);
    };

    return (
        <div className="user-management-container">
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h2>
                                <UserOutlined style={{ marginRight: 12 }} />
                                User Management
                            </h2>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddUser}
                                size="large"
                            >
                                Add User
                            </Button>
                        </Col>
                    </Row>
                </Col>

                <Col span={24}>
                    <Card>
                        <Row className="actions-row">
                            <Col xs={24} sm={12} md={8} lg={6} className="search-container">
                                <Input.Search
                                    placeholder="Search by name, email..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onSearch={handleSearch}
                                    enterButton={<SearchOutlined />}
                                    size="middle"
                                    allowClear
                                />
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="1" className="user-tabs">
                            <TabPane
                                tab={
                                    <span>
                                        All Users <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="1"
                            >
                                <UserTable
                                    users={users}
                                    loading={loading}
                                    pagination={pagination}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Administrators <Badge count={counts.admin} style={{ backgroundColor: '#ff4d4f' }} />
                                    </span>
                                }
                                key="2"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'admin')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.admin }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Doctors <Badge count={counts.doctor} style={{ backgroundColor: '#52c41a' }} />
                                    </span>
                                }
                                key="3"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'doctor')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.doctor }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Staff <Badge count={counts.staff} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="4"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'staff')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.staff }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>
                            <TabPane
                                tab={
                                    <span>
                                        Nurse <Badge count={counts.admin} style={{ backgroundColor: '#d51ba0ff' }} />
                                    </span>
                                }
                                key="5"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'nurse')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.nurse }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            {showAddModal && (
                <AddUser
                    visible={showAddModal}
                    onCancel={() => setShowAddModal(false)}
                    onSuccess={handleAddUserSuccess}
                />
            )}
        </div>
    );
};

export default UserManagement;