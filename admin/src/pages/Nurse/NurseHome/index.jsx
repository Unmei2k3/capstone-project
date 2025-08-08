import React from "react";
import {
  Card,
  Row,
  Col,
  List,
  Avatar,
  Typography,
  Tag,
  Button,
} from "antd";
import {
  UserOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

const NurseHome = () => {
  const { Title, Text } = Typography;

  const fakeShift = {
    time: "07:00 - 15:00",
    room: "Phòng 12",
    department: "Khoa Hồi sức tích cực",
    status: "Đang làm",
    patientCount: 4,
  };

  const fakePatients = [
    { id: 1, name: "Nguyễn Văn A", age: 65, room: "12A", condition: "Ổn định" },
    { id: 2, name: "Trần Thị B", age: 70, room: "12B", condition: "Cần theo dõi" },
    { id: 3, name: "Lê Văn C", age: 58, room: "12C", condition: "Đang điều trị" },
    { id: 4, name: "Phạm Thị D", age: 62, room: "12D", condition: "Ổn định" },
  ];

  const fakeTasks = [
    { id: 1, title: "Đo dấu hiệu sinh tồn cho bệnh nhân 12A", status: "Chưa làm" },
    { id: 2, title: "Phát thuốc cho bệnh nhân 12B", status: "Đang làm" },
    { id: 3, title: "Ghi chép hồ sơ y tế bệnh nhân 12C", status: "Chưa làm" },
    { id: 4, title: "Hỗ trợ bác sĩ khám bệnh", status: "Đã hoàn thành" },
  ];

  const fakeNotifications = [
    {
      id: 1,
      content: "Đào tạo quy trình chăm sóc mới ngày 30/06/2025",
      date: "28/06/2025",
    },
    {
      id: 2,
      content: "Lịch họp khoa ngày 01/07/2025",
      date: "29/06/2025",
    },
  ];

  const statusColor = {
    "Chưa làm": "red",
    "Đang làm": "orange",
    "Đã hoàn thành": "green",
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
        minHeight: "100vh",
      }}
    >
      <Title level={2} style={{ color: "#52c41a" }}>
        Chào điều dưỡng Nguyễn Thị H
      </Title>

      <Row gutter={[24, 24]}>
        {/* Left side */}
        <Col span={16}>
          <Card
            title="Ca trực hôm nay"
            style={{
              backgroundColor: "#e6fffb",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Text strong>Thời gian: </Text> {fakeShift.time} <br />
            <Text strong>Phòng: </Text> {fakeShift.room} <br />
            <Text strong>Khoa: </Text> {fakeShift.department} <br />
            <Text strong>Số bệnh nhân cần chăm sóc: </Text>{" "}
            {fakeShift.patientCount} <br />
            <Tag
              color={fakeShift.status === "Đang làm" ? "green" : "blue"}
              style={{ marginTop: 8 }}
            >
              {fakeShift.status}
            </Tag>
          </Card>

          <Card
            title="Bệnh nhân cần chăm sóc"
            style={{
              marginTop: 24,
              backgroundColor: "#fff1f0",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={fakePatients}
              renderItem={(patient) => (
                <List.Item
                  actions={[
                    <Button type="link" key="detail">
                      Xem chi tiết
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Text strong>{patient.name} (Tuổi: {patient.age})</Text>
                    }
                    description={`Phòng: ${patient.room} | Tình trạng: ${patient.condition}`}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="Nhiệm vụ cần làm"
            style={{
              marginTop: 24,
              backgroundColor: "#fffbe6",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <List
              dataSource={fakeTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Tag color={statusColor[task.status]} key={task.id}>
                      {task.status}
                    </Tag>,
                  ]}
                >
                  {task.title}
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="Thông báo nội bộ"
            style={{
              marginTop: 24,
              backgroundColor: "#f0f5ff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <List
              dataSource={fakeNotifications}
              renderItem={(item) => (
                <List.Item>
                  <NotificationOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>{item.content}</Text>{" "}
                  <Text type="secondary">({item.date})</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Right side */}
        <Col span={8}>
          <Card
            title="Thông tin cá nhân"
            style={{
              textAlign: "center",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: "#ffffff",
            }}
          >
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={4} style={{ marginTop: 16 }}>
              Nguyễn Thị H
            </Title>
            <Text>Chức vụ: Điều dưỡng</Text>
            <br />
            <Text>Bộ phận: Khoa Hồi sức tích cực</Text>
            <br />
            <Button type="primary" style={{ marginTop: 16 }}>
              Cập nhật hồ sơ
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NurseHome;
