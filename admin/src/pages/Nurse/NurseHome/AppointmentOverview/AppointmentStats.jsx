import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const AppointmentStats = ({ statistics }) => {
  return (
    <Row gutter={16}>
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="Total Appointments"
            value={statistics.totalAppointments || 0}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="Today's Appointments"
            value={statistics.todayAppointments || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="In Progress"
            value={statistics.inProgressAppointments || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="Completed"
            value={statistics.completedAppointments || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="High Priority"
            value={statistics.highPriorityAppointments || 0}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6} md={6} lg={4}>
        <Card>
          <Statistic
            title="Scheduled"
            value={statistics.scheduledAppointments || 0}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AppointmentStats;