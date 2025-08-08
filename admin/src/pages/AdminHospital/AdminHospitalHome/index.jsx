import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Button,
  Typography,
  Progress,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

const AdminHospitalHome = () => {
  const { Title, Text } = Typography;

  const statsData = [
    {
      title: "Tổng bác sĩ",
      value: 45,
      icon: <UserOutlined />,
      color: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    {
      title: "Nhân viên y tế",
      value: 120,
      icon: <TeamOutlined />,
      color: "#f6ffed",
      borderColor: "#b7eb8f",
    },
    {
      title: "Ca khám hôm nay",
      value: 78,
      icon: <CalendarOutlined />,
      color: "#fffbe6",
      borderColor: "#ffe58f",
    },
    {
      title: "Bệnh nhân đang điều trị",
      value: 150,
      icon: <UserOutlined />,
      color: "#fff0f6",
      borderColor: "#ffadd2",
    },
  ];

  const notifications = [
    {
      id: 1,
      content: "Yêu cầu duyệt lịch nghỉ phép từ nhân viên Nguyễn Văn A",
      date: "28/06/2025",
    },
    {
      id: 2,
      content: "Cập nhật quy trình phòng chống dịch Covid-19",
      date: "27/06/2025",
    },
    {
      id: 3,
      content: "Lịch họp ban giám đốc ngày 30/06/2025",
      date: "26/06/2025",
    },
  ];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
        minHeight: "100vh",
      }}
    >
      <Title level={2} style={{ color: "#1890ff" }}>
        Chào Admin Nguyễn Văn B
      </Title>

      <Row gutter={24}>
        {statsData.map((stat) => (
          <Col span={6} key={stat.title}>
            <Card
              style={{
                backgroundColor: stat.color,
                border: `1px solid ${stat.borderColor}`,
                borderRadius: 12,
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ fontWeight: "bold" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card
            title="Quản lý nhanh"
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <Row gutter={[16, 16]}>
              {[
                "Quản lý bác sĩ",
                "Quản lý nhân viên",
                "Quản lý lịch làm việc",
                "Quản lý phòng khám",
                "Duyệt lịch hẹn",
                "Báo cáo & Thống kê",
              ].map((label, index) => (
                <Col span={8} key={index}>
                  <Button
                    block
                    type="primary"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#1890ff" : "#52c41a",
                      borderColor: "transparent",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>

          <Card
            title="Thông báo nội bộ"
            style={{
              marginTop: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item>
                  <NotificationOutlined
                    style={{ marginRight: 8, color: "#fa8c16" }}
                  />
                  <Text>{item.content}</Text>{" "}
                  <Text type="secondary">({item.date})</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="Hiệu suất làm việc"
            style={{
              textAlign: "center",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Text strong>Hiệu suất sử dụng phòng khám</Text>
            <Progress percent={75} status="active" />
            <Text strong style={{ marginTop: 16, display: "block" }}>
              Tỷ lệ đặt lịch thành công
            </Text>
            <Progress percent={85} status="success" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHospitalHome;
