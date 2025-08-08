import React, { useState, useEffect } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import UserTable from './UserTable';
import AddUser from './AddUser';
import { getAllUsers } from '../../../services/userService';
import './styles.scss';

const { TabPane } = Tabs;

// ✅ Hàm xác định role từ API response
const getUserRole = (user) => {
    if (!user.role) return 'user';

    const roleType = user.role.roleType;

    switch (roleType) {
        case 2: return 'doctor';
        case 4: return 'hospitalAdmin';
        case 5: return 'systemAdmin';
        case 6: return 'patient';
        case 7: return 'nurse';
        default: return 'user';
    }
};

// ✅ Hàm kiểm tra có phải admin không (gộp systemAdmin và hospitalAdmin)
const isAdmin = (user) => {
    const role = getUserRole(user);
    return role === 'systemAdmin' || role === 'hospitalAdmin';
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
        admin: 0, // Gộp systemAdmin + hospitalAdmin
        doctor: 0,
        nurse: 0,
        patient: 0,
        user: 0, // Other users
    });

    const fetchUsers = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await getAllUsers({
                page,
                pageSize,
                search,
            });

            console.log('✅ Users API response:', response);

            if (response && response.success) {
                const userData = response.result || [];
                setUsers(userData);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize,
                    total: userData.length,
                });

                // ✅ Phân loại người dùng theo role từ API
                const adminCount = userData.filter(user => isAdmin(user)).length;
                const doctorCount = userData.filter(user => getUserRole(user) === 'doctor').length;
                const nurseCount = userData.filter(user => getUserRole(user) === 'nurse').length;
                const patientCount = userData.filter(user => getUserRole(user) === 'patient').length;
                const otherCount = userData.filter(user => {
                    const role = getUserRole(user);
                    return !isAdmin(user) && role !== 'doctor' && role !== 'nurse' && role !== 'patient';
                }).length;

                setCounts({
                    all: userData.length,
                    admin: adminCount,
                    doctor: doctorCount,
                    nurse: nurseCount,
                    patient: patientCount,
                    user: otherCount,
                });

                console.log('📊 User counts:', {
                    all: userData.length,
                    admin: adminCount,
                    doctor: doctorCount,
                    nurse: nurseCount,
                    patient: patientCount,
                    user: otherCount
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
                            {/* ✅ All Users Tab */}
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

                            {/* ✅ Administrators Tab (gộp System Admin + Hospital Admin) */}
                            <TabPane
                                tab={
                                    <span>
                                        Administrators <Badge count={counts.admin} style={{ backgroundColor: '#faad14' }} />
                                    </span>
                                }
                                key="2"
                            >
                                <UserTable
                                    users={users.filter(user => isAdmin(user))}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.admin }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            {/* ✅ Doctors Tab */}
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

                            {/* ✅ Nurses Tab */}
                            <TabPane
                                tab={
                                    <span>
                                        Nurses <Badge count={counts.nurse} style={{ backgroundColor: '#13c2c2' }} />
                                    </span>
                                }
                                key="4"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'nurse')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.nurse }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            {/* ✅ Patients Tab */}
                            <TabPane
                                tab={
                                    <span>
                                        Patients <Badge count={counts.patient} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="5"
                            >
                                <UserTable
                                    users={users.filter(user => getUserRole(user) === 'patient')}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.patient }}
                                    onChange={handleTableChange}
                                    onReload={() => fetchUsers(pagination.current, pagination.pageSize, searchText)}
                                />
                            </TabPane>

                            {/* ✅ Other Users Tab */}
                            <TabPane
                                tab={
                                    <span>
                                        Others <Badge count={counts.user} style={{ backgroundColor: '#8c8c8c' }} />
                                    </span>
                                }
                                key="6"
                            >
                                <UserTable
                                    users={users.filter(user => {
                                        const role = getUserRole(user);
                                        return !isAdmin(user) && role !== 'doctor' && role !== 'nurse' && role !== 'patient';
                                    })}
                                    loading={loading}
                                    pagination={{ ...pagination, total: counts.user }}
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