import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    Tag,
    Rate,
    Typography,
    Statistic,
    List,
    Avatar,
    Space,
    Divider
} from 'antd';
import {
    CalendarOutlined,
    DollarOutlined,
    StarOutlined,
    MedicineBoxOutlined,
    UserOutlined,
    CreditCardOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments, getHospitalsForPatient } from '../../services/patientService';
import './PatientPortal.scss';

const { Title, Text } = Typography;

const PatientPortal = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock patient data - in real app, get from auth context
    const currentPatient = {
        id: 1,
        name: "John Doe",
        email: "john.doe@email.com"
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appointmentsData, hospitalsData] = await Promise.all([
                getPatientAppointments(currentPatient.id),
                getHospitalsForPatient()
            ]);

            setAppointments(appointmentsData || []);
            setHospitals(hospitalsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'processing';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const handlePayment = (appointment) => {
        navigate('/patient/payment', { state: { appointment } });
    };

    const handleRating = (appointment) => {
        navigate('/patient/rating', { state: { appointment } });
    };

    const handleViewHospital = (hospital) => {
        navigate(`/patient/hospital/${hospital.id}`);
    };

    const pendingPayments = appointments.filter(app => app.paymentStatus === 'pending');
    const canRateAppointments = appointments.filter(app => app.canRate && !app.hasRated);
    const totalSpent = appointments
        .filter(app => app.paymentStatus === 'paid')
        .reduce((sum, app) => sum + app.amount, 0);

    return (
        <div className="patient-portal-container">
            {/* Header */}
            <Row gutter={[0, 24]}>
                <Col span={24}>
                    <Card className="welcome-card">
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={2} style={{ margin: 0 }}>
                                    Welcome, {currentPatient.name}! 👋
                                </Title>
                                <Text type="secondary">
                                    Manage your healthcare appointments, payments, and reviews
                                </Text>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<CalendarOutlined />}
                                        onClick={() => navigate('/patient/book-appointment')}
                                    >
                                        Book Appointment
                                    </Button>
                                    <Button
                                        icon={<CreditCardOutlined />}
                                        onClick={() => navigate('/patient/payment-history')}
                                    >
                                        Payment History
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Statistics */}
                <Col span={24}>
                    <Row gutter={16}>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Total Appointments"
                                    value={appointments.length}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Pending Payments"
                                    value={pendingPayments.length}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Total Spent"
                                    value={totalSpent}
                                    precision={2}
                                    prefix="$"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Pending Reviews"
                                    value={canRateAppointments.length}
                                    prefix={<StarOutlined />}
                                    valueStyle={{ color: '#eb2f96' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Quick Actions */}
                <Col span={24}>
                    <Row gutter={16}>
                        {/* Pending Payments */}
                        {pendingPayments.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card
                                    title={
                                        <span>
                                            <DollarOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                            Pending Payments ({pendingPayments.length})
                                        </span>
                                    }
                                    className="action-card"
                                >
                                    <List
                                        dataSource={pendingPayments.slice(0, 3)}
                                        renderItem={(appointment) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => handlePayment(appointment)}
                                                    >
                                                        Pay Now
                                                    </Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                                                    title={appointment.hospitalName}
                                                    description={
                                                        <div>
                                                            <div>{appointment.service} - ${appointment.amount}</div>
                                                            <Text type="secondary">{appointment.doctorName}</Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                    {pendingPayments.length > 3 && (
                                        <Button
                                            type="link"
                                            onClick={() => navigate('/patient/payment-history')}
                                            style={{ padding: 0 }}
                                        >
                                            View all pending payments
                                        </Button>
                                    )}
                                </Card>
                            </Col>
                        )}

                        {/* Pending Reviews */}
                        {canRateAppointments.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card
                                    title={
                                        <span>
                                            <StarOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                                            Pending Reviews ({canRateAppointments.length})
                                        </span>
                                    }
                                    className="action-card"
                                >
                                    <List
                                        dataSource={canRateAppointments.slice(0, 3)}
                                        renderItem={(appointment) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => handleRating(appointment)}
                                                    >
                                                        Rate Now
                                                    </Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<UserOutlined />} />}
                                                    title={appointment.doctorName}
                                                    description={
                                                        <div>
                                                            <div>{appointment.hospitalName}</div>
                                                            <Text type="secondary">{appointment.service}</Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                    {canRateAppointments.length > 3 && (
                                        <Button
                                            type="link"
                                            onClick={() => navigate('/patient/rating-history')}
                                            style={{ padding: 0 }}
                                        >
                                            View all pending reviews
                                        </Button>
                                    )}
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Col>

                {/* Recent Appointments */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Recent Appointments
                            </span>
                        }
                        extra={
                            <Button type="link" onClick={() => navigate('/patient/appointments')}>
                                View All
                            </Button>
                        }
                    >
                        <List
                            dataSource={appointments.slice(0, 5)}
                            renderItem={(appointment) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{appointment.hospitalName}</span>
                                                <Space>
                                                    <Tag color={getStatusColor(appointment.status)}>
                                                        {appointment.status.toUpperCase()}
                                                    </Tag>
                                                    <Tag color={getPaymentStatusColor(appointment.paymentStatus)}>
                                                        {appointment.paymentStatus.toUpperCase()}
                                                    </Tag>
                                                </Space>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div>
                                                    <strong>{appointment.doctorName}</strong> - {appointment.department}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                    <span>
                                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                                                    </span>
                                                    <span>
                                                        <DollarOutlined style={{ marginRight: 4 }} />
                                                        ${appointment.amount}
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Available Hospitals */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <span>
                                <MedicineBoxOutlined style={{ marginRight: 8 }} />
                                Available Hospitals
                            </span>
                        }
                        extra={
                            <Button type="link" onClick={() => navigate('/patient/hospitals')}>
                                View All
                            </Button>
                        }
                    >
                        <List
                            dataSource={hospitals.slice(0, 5)}
                            renderItem={(hospital) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            onClick={() => handleViewHospital(hospital)}
                                        >
                                            View Details
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={hospital.image}
                                                icon={<MedicineBoxOutlined />}
                                            />
                                        }
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{hospital.name}</span>
                                                <div>
                                                    <Rate disabled value={hospital.rating} style={{ fontSize: '12px' }} />
                                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                                                        ({hospital.totalRatings})
                                                    </Text>
                                                </div>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div>{hospital.address}</div>
                                                <div style={{ marginTop: 4 }}>
                                                    {hospital.departments.slice(0, 3).map(dept => (
                                                        <Tag key={dept} size="small">{dept}</Tag>
                                                    ))}
                                                    {hospital.departments.length > 3 && (
                                                        <Tag size="small">+{hospital.departments.length - 3} more</Tag>
                                                    )}
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PatientPortal;