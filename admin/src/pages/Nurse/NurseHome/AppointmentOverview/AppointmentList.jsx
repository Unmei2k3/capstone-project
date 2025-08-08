import React, { useState } from 'react';
import { List, Card, Tag, Button, Space, Avatar, Modal, Descriptions, Row, Col, Typography } from 'antd';
import {
    UserOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    EyeOutlined,
    EditOutlined,
    MedicineBoxOutlined,
    HeartOutlined
} from '@ant-design/icons';
import { updateAppointmentStatus } from '../../../../services/appointmentService';
import moment from 'moment';

const { Text } = Typography;

const AppointmentList = ({ appointments, onUpdate }) => {
    const [viewingAppointment, setViewingAppointment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled':
                return 'blue';
            case 'in-progress':
                return 'orange';
            case 'completed':
                return 'green';
            case 'cancelled':
                return 'red';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'red';
            case 'medium':
                return 'orange';
            case 'low':
                return 'green';
            default:
                return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'urgent':
                return 'volcano';
            case 'consultation':
                return 'blue';
            case 'follow-up':
                return 'green';
            case 'routine-checkup':
                return 'cyan';
            case 'prenatal':
                return 'magenta';
            default:
                return 'default';
        }
    };

    const handleViewDetails = (appointment) => {
        setViewingAppointment(appointment);
        setShowViewModal(true);
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            onUpdate();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };

    const renderAppointmentItem = (appointment) => (
        <List.Item key={appointment.id}>
            <Card
                className="appointment-card"
                style={{ width: '100%' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={16} md={18}>
                        <div className="appointment-header">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{ marginRight: 12, backgroundColor: '#1890ff' }}
                                />
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: 4 }}>
                                        {appointment.patientName}
                                    </h4>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {appointment.appointmentNumber}
                                    </Text>
                                </div>
                            </div>

                            <Space wrap style={{ marginBottom: 8 }}>
                                <Tag color={getStatusColor(appointment.status)}>
                                    {appointment.status?.toUpperCase()}
                                </Tag>
                                <Tag color={getPriorityColor(appointment.priority)}>
                                    {appointment.priority?.toUpperCase()} PRIORITY
                                </Tag>
                                <Tag color={getTypeColor(appointment.type)}>
                                    {appointment.type?.toUpperCase()}
                                </Tag>
                            </Space>

                            <div className="appointment-details">
                                <Row gutter={[8, 4]}>
                                    <Col xs={24} sm={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                            <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                            {moment(appointment.appointmentDate).format('MMM DD, YYYY')} at {appointment.appointmentTime}
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                            <EnvironmentOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                            Room {appointment.roomNumber} - {appointment.department}
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                            <MedicineBoxOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                                            {appointment.doctorName}
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                                            <PhoneOutlined style={{ marginRight: 4, color: '#fa8c16' }} />
                                            {appointment.patientPhone}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {appointment.symptoms && (
                                <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                                    <strong>Symptoms:</strong> {appointment.symptoms}
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <div style={{ textAlign: 'right' }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewDetails(appointment)}
                                    size="small"
                                    block
                                >
                                    View Details
                                </Button>

                                {appointment.status === 'scheduled' && (
                                    <Button
                                        type="default"
                                        onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
                                        size="small"
                                        block
                                    >
                                        Start
                                    </Button>
                                )}

                                {appointment.status === 'in-progress' && (
                                    <Button
                                        type="default"
                                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                        size="small"
                                        block
                                    >
                                        Complete
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Card>
        </List.Item>
    );

    return (
        <>
            <List
                dataSource={appointments}
                renderItem={renderAppointmentItem}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} appointments`
                }}
                locale={{
                    emptyText: 'No appointments found'
                }}
            />

            {/* View Appointment Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EyeOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        Appointment Details
                    </div>
                }
                visible={showViewModal}
                onCancel={() => setShowViewModal(false)}
                footer={null}
                width={800}
            >
                {viewingAppointment && (
                    <div style={{ padding: '20px 0' }}>
                        {/* Patient Header */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={80}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#1890ff', marginRight: 20 }}
                            />
                            <div>
                                <h3 style={{ margin: 0, marginBottom: 8 }}>
                                    {viewingAppointment.patientName}
                                </h3>
                                <Space>
                                    <Tag color={getStatusColor(viewingAppointment.status)}>
                                        {viewingAppointment.status?.toUpperCase()}
                                    </Tag>
                                    <Tag color={getPriorityColor(viewingAppointment.priority)}>
                                        {viewingAppointment.priority?.toUpperCase()} PRIORITY
                                    </Tag>
                                </Space>
                            </div>
                        </div>

                        {/* Appointment Information */}
                        <Descriptions title="Appointment Information" bordered column={2}>
                            <Descriptions.Item label="Appointment Number" span={2}>
                                {viewingAppointment.appointmentNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date & Time">
                                {moment(viewingAppointment.appointmentDate).format('MMMM DD, YYYY')} at {viewingAppointment.appointmentTime}
                            </Descriptions.Item>
                            <Descriptions.Item label="Duration">
                                {viewingAppointment.duration} minutes
                            </Descriptions.Item>
                            <Descriptions.Item label="Doctor">
                                {viewingAppointment.doctorName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Department">
                                {viewingAppointment.department}
                            </Descriptions.Item>
                            <Descriptions.Item label="Room">
                                {viewingAppointment.roomNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color={getTypeColor(viewingAppointment.type)}>
                                    {viewingAppointment.type?.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Assigned Nurse">
                                {viewingAppointment.nurseAssigned}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Patient Information */}
                        <Descriptions title="Patient Information" bordered column={2} style={{ marginTop: 24 }}>
                            <Descriptions.Item label="Age">
                                {viewingAppointment.patientAge} years old
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                                {viewingAppointment.patientGender}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                {viewingAppointment.patientPhone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {viewingAppointment.patientEmail}
                            </Descriptions.Item>
                            <Descriptions.Item label="Insurance">
                                {viewingAppointment.insuranceProvider}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Visit">
                                {viewingAppointment.lastVisit}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Medical Information */}
                        <Descriptions title="Medical Information" bordered column={1} style={{ marginTop: 24 }}>
                            <Descriptions.Item label="Symptoms">
                                {viewingAppointment.symptoms}
                            </Descriptions.Item>
                            <Descriptions.Item label="Notes">
                                {viewingAppointment.notes}
                            </Descriptions.Item>
                            <Descriptions.Item label="Allergies">
                                <Space wrap>
                                    {viewingAppointment.allergies?.map((allergy, index) => (
                                        <Tag key={index} color="red">{allergy}</Tag>
                                    )) || 'None known'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Current Medications">
                                <Space wrap>
                                    {viewingAppointment.medicationsToReview?.map((med, index) => (
                                        <Tag key={index} color="blue">{med}</Tag>
                                    )) || 'None'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Preparation Required">
                                <Space wrap>
                                    {viewingAppointment.preparationRequired?.map((prep, index) => (
                                        <Tag key={index} color="green">{prep}</Tag>
                                    )) || 'None'}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Emergency Contact */}
                        {viewingAppointment.emergencyContact && (
                            <Descriptions title="Emergency Contact" bordered column={2} style={{ marginTop: 24 }}>
                                <Descriptions.Item label="Name">
                                    {viewingAppointment.emergencyContact.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Relationship">
                                    {viewingAppointment.emergencyContact.relationship}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phone" span={2}>
                                    {viewingAppointment.emergencyContact.phone}
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default AppointmentList;