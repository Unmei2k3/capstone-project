import React from "react";
import { Card, Row, Col, Button, List, Avatar, Typography, Tag } from "antd";
import { UserOutlined, NotificationOutlined, CheckCircleOutlined, ClockCircleOutlined, CommentOutlined, StarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const HospitalStaffHome = () => {
  const { Title, Text } = Typography;
  const navigate = useNavigate();
  const userDefault = useSelector((state) => state.user.user || null);
  const fakeTasks = [
    { id: 1, title: "Chuẩn bị phòng khám số 10", status: "Đang xử lý" },
    { id: 2, title: "Kiểm tra trang thiết bị phòng mổ", status: "Chưa xử lý" },
    { id: 3, title: "Hỗ trợ bác sĩ Nguyễn Văn A", status: "Đã hoàn thành" },
  ];

  const fakeNotifications = [
    { id: 1, content: "Lịch họp nhân viên ngày 30/06/2025", date: "28/06/2025" },
    { id: 2, content: "Đào tạo sử dụng phần mềm quản lý mới", date: "01/07/2025" },
  ];

  const statusColor = {
    "Đang xử lý": "orange",
    "Chưa xử lý": "red",
    "Đã hoàn thành": "green",
  };


  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <Title level={2}>Chào nhân viên {userDefault.fullname || "Bác sĩ"}</Title>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Nhiệm vụ hôm nay">
            <List
              dataSource={fakeTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      task.status === "Đã hoàn thành" ? (
                        <CheckCircleOutlined style={{ fontSize: 24, color: "green" }} />
                      ) : task.status === "Đang xử lý" ? (
                        <ClockCircleOutlined style={{ fontSize: 24, color: "orange" }} />
                      ) : (
                        <UserOutlined style={{ fontSize: 24, color: "red" }} />
                      )
                    }
                    title={task.title}
                    description={<Tag color={statusColor[task.status]}>{task.status}</Tag>}
                  />
                  <Button type="link">Chi tiết</Button>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Truy cập nhanh" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  icon={<CommentOutlined />}
                  onClick={() => navigate('/staff/review-feedback')}
                  block
                  size="large"
                >
                  Quản lý Đánh giá
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="default"
                  icon={<StarOutlined />}
                  block
                  size="large"
                >
                  Báo cáo chất lượng
                </Button>
              </Col>
            </Row>
          </Card>

          <Card
            title="Thông báo nội bộ"
            style={{ marginTop: 24 }}
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              dataSource={fakeNotifications}
              renderItem={(item) => (
                <List.Item>
                  <NotificationOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text>{item.content}</Text> <Text type="secondary">({item.date})</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Thông tin cá nhân" style={{ textAlign: "center" }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={4} style={{ marginTop: 16 }}>
              Nguyễn Thị B
            </Title>
            <Text>Chức vụ: Nhân viên y tế</Text>
            <br />
            <Text>Bộ phận: Khoa Khám bệnh</Text>
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

export default HospitalStaffHome;
