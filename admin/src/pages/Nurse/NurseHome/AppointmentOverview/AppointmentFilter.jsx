import React from 'react';
import { DatePicker, Select, Button, Row, Col } from 'antd';

const { Option } = Select;

const AppointmentFilters = ({ onFilterChange }) => {
    const handleDateChange = (date, dateString) => {
        onFilterChange({ date: dateString });
    };

    const handleStatusChange = (value) => {
        onFilterChange({ status: value });
    };

    return (
        <div className="appointment-filters">
            <Row gutter={16}>
                <Col span={8}>
                    <DatePicker onChange={handleDateChange} placeholder="Select Date" />
                </Col>
                <Col span={8}>
                    <Select placeholder="Select Status" onChange={handleStatusChange} allowClear>
                        <Option value="upcoming">Upcoming</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="canceled">Canceled</Option>
                    </Select>
                </Col>
                <Col span={8}>
                    <Button type="primary" onClick={() => onFilterChange({})}>
                        Apply Filters
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default AppointmentFilters;