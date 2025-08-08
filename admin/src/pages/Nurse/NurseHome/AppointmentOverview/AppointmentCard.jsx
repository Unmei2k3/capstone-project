import React from 'react';
import { Card } from 'antd';
import PropTypes from 'prop-types';

const AppointmentCard = ({ appointment }) => {
    return (
        <Card title={`Appointment with ${appointment.doctorName}`} bordered={false}>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Status:</strong> {appointment.status}</p>
            <p><strong>Notes:</strong> {appointment.notes}</p>
        </Card>
    );
};

AppointmentCard.propTypes = {
    appointment: PropTypes.shape({
        doctorName: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        notes: PropTypes.string,
    }).isRequired,
};

export default AppointmentCard;