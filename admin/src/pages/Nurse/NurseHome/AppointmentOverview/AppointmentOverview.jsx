import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Input,
    Select,
    DatePicker,
    Tabs,
    Badge,
    Button,
    notification,
    Spin
} from 'antd';
import {
    CalendarOutlined,
    SearchOutlined,
    ReloadOutlined,
    FilterOutlined
} from '@ant-design/icons';
import {
    getAppointments,
    getAppointmentStatistics,
    getDepartments
} from '../../../../services/appointmentService';
import AppointmentList from './AppointmentList';
import AppointmentStats from './AppointmentStats';
import './Appointment.scss';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;

const AppointmentOverview = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statistics, setStatistics] = useState({});
    const [departments, setDepartments] = useState([]);
    const [activeTab, setActiveTab] = useState('1');

    const [counts, setCounts] = useState({
        all: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        today: 0,
        tomorrow: 0,
        highPriority: 0
    });

    useEffect(() => {
        fetchAppointments();
        fetchStatistics();
        fetchDepartments();
    }, []);

    const fetchAppointments = async (filters = {}) => {
        setLoading(true);
        try {
            const params = {
                search: searchText,
                status: statusFilter,
                department: departmentFilter,
                priority: priorityFilter,
                date: selectedDate ? selectedDate.format('YYYY-MM-DD') : undefined,
                ...filters
            };

            const response = await getAppointments(params);
            setAppointments(response.items || []);

            // Calculate counts
            const allAppointments = response.items || [];
            const today = moment().format('YYYY-MM-DD');
            const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

            setCounts({
                all: allAppointments.length,
                scheduled: allAppointments.filter(app => app.status === 'scheduled').length,
                inProgress: allAppointments.filter(app => app.status === 'in-progress').length,
                completed: allAppointments.filter(app => app.status === 'completed').length,
                cancelled: allAppointments.filter(app => app.status === 'cancelled').length,
                today: allAppointments.filter(app => app.appointmentDate === today).length,
                tomorrow: allAppointments.filter(app => app.appointmentDate === tomorrow).length,
                highPriority: allAppointments.filter(app => app.priority === 'high').length
            });

        } catch (error) {
            console.error('Error fetching appointments:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to fetch appointments. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await getAppointmentStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const depts = await getDepartments();
            setDepartments(depts);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleSearch = () => {
        fetchAppointments();
    };

    const handleRefresh = () => {
        setSearchText('');
        setSelectedDate(null);
        setStatusFilter('all');
        setDepartmentFilter('all');
        setPriorityFilter('all');
        fetchAppointments({
            search: '',
            status: 'all',
            department: 'all',
            priority: 'all',
            date: undefined
        });
        fetchStatistics();
    };

    const getAppointmentsByFilter = (filterType) => {
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

        switch (filterType) {
            case 'scheduled':
                return appointments.filter(app => app.status === 'scheduled');
            case 'in-progress':
                return appointments.filter(app => app.status === 'in-progress');
            case 'completed':
                return appointments.filter(app => app.status === 'completed');
            case 'cancelled':
                return appointments.filter(app => app.status === 'cancelled');
            case 'today':
                return appointments.filter(app => app.appointmentDate === today);
            case 'tomorrow':
                return appointments.filter(app => app.appointmentDate === tomorrow);
            case 'high-priority':
                return appointments.filter(app => app.priority === 'high');
            default:
                return appointments;
        }
    };

    const handleAppointmentUpdate = () => {
        fetchAppointments();
        fetchStatistics();
        notification.success({
            message: 'Success',
            description: 'Appointment updated successfully!',
        });
    };

    return (
        <div className="appointment-overview-container">
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h2>
                                <CalendarOutlined style={{ marginRight: 12 }} />
                                Appointment Overview
                            </h2>
                        </Col>
                        <Col>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                size="large"
                            >
                                Refresh
                            </Button>
                        </Col>
                    </Row>
                </Col>

                {/* Statistics Cards */}
                <Col span={24}>
                    <AppointmentStats statistics={statistics} />
                </Col>

                <Col span={24}>
                    <Card>
                        {/* Filters */}
                        <Row className="filters-row" gutter={16}>
                            <Col xs={24} sm={12} md={6} lg={6}>
                                <Input.Search
                                    placeholder="Search appointments..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onSearch={handleSearch}
                                    enterButton={<SearchOutlined />}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} sm={12} md={6} lg={4}>
                                <DatePicker
                                    placeholder="Select date"
                                    value={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        fetchAppointments({ date: date ? date.format('YYYY-MM-DD') : undefined });
                                    }}
                                    style={{ width: '100%' }}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} sm={8} md={4} lg={4}>
                                <Select
                                    value={statusFilter}
                                    onChange={(value) => {
                                        setStatusFilter(value);
                                        fetchAppointments({ status: value });
                                    }}
                                    style={{ width: '100%' }}
                                    placeholder="Status"
                                >
                                    <Option value="all">All Status</Option>
                                    <Option value="scheduled">Scheduled</Option>
                                    <Option value="in-progress">In Progress</Option>
                                    <Option value="completed">Completed</Option>
                                    <Option value="cancelled">Cancelled</Option>
                                </Select>
                            </Col>

                            <Col xs={24} sm={8} md={4} lg={5}>
                                <Select
                                    value={departmentFilter}
                                    onChange={(value) => {
                                        setDepartmentFilter(value);
                                        fetchAppointments({ department: value });
                                    }}
                                    style={{ width: '100%' }}
                                    placeholder="Department"
                                >
                                    <Option value="all">All Departments</Option>
                                    {departments.map(dept => (
                                        <Option key={dept.value} value={dept.value}>
                                            {dept.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>

                            <Col xs={24} sm={8} md={4} lg={4}>
                                <Select
                                    value={priorityFilter}
                                    onChange={(value) => {
                                        setPriorityFilter(value);
                                        fetchAppointments({ priority: value });
                                    }}
                                    style={{ width: '100%' }}
                                    placeholder="Priority"
                                >
                                    <Option value="all">All Priority</Option>
                                    <Option value="high">High</Option>
                                    <Option value="medium">Medium</Option>
                                    <Option value="low">Low</Option>
                                </Select>
                            </Col>
                        </Row>

                        {/* Tabs */}
                        <Tabs activeKey={activeTab} onChange={setActiveTab} className="appointment-tabs">
                            <TabPane
                                tab={
                                    <span>
                                        All Appointments <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="1"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={appointments}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Today <Badge count={counts.today} style={{ backgroundColor: '#52c41a' }} />
                                    </span>
                                }
                                key="2"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('today')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Tomorrow <Badge count={counts.tomorrow} style={{ backgroundColor: '#fa8c16' }} />
                                    </span>
                                }
                                key="3"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('tomorrow')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Scheduled <Badge count={counts.scheduled} style={{ backgroundColor: '#1890ff' }} />
                                    </span>
                                }
                                key="4"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('scheduled')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        In Progress <Badge count={counts.inProgress} style={{ backgroundColor: '#722ed1' }} />
                                    </span>
                                }
                                key="5"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('in-progress')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        High Priority <Badge count={counts.highPriority} style={{ backgroundColor: '#ff4d4f' }} />
                                    </span>
                                }
                                key="6"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('high-priority')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        Completed <Badge count={counts.completed} style={{ backgroundColor: '#52c41a' }} />
                                    </span>
                                }
                                key="7"
                            >
                                <Spin spinning={loading}>
                                    <AppointmentList
                                        appointments={getAppointmentsByFilter('completed')}
                                        onUpdate={handleAppointmentUpdate}
                                    />
                                </Spin>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AppointmentOverview;