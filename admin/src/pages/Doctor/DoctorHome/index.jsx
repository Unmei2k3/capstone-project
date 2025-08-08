import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  List,
  Avatar,
  Typography,
  Tag,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  NotificationOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getDoctorByUserId } from "../../../services/doctorService";

const { Title, Text } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case "Đang khám":
      return <Tag color="green">{status}</Tag>;
    case "Chưa bắt đầu":
      return <Tag color="orange">{status}</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

const DoctorHome = () => {
  const user = useSelector((state) => state.user.user);
  const [doctorDetail, setDoctorDetail] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      if (!user?.id) return;
      const result = await getDoctorByUserId(user?.id);
      if (result) {
        setDoctorDetail(result);
      } else {
        console.error("No doctor data found");
      }
    };
    fetchApi();
  }, [user?.id]);

  const todaySchedules = doctorDetail?.schedules?.filter((item) =>
    isToday(new Date(item.date))
  );

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      <Title style={{ textAlign: "center", color: "#1890ff" }} level={2}>
        Chào bác sĩ {doctorDetail?.user?.fullname || "Bác sĩ"}
      </Title>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="🗓️ Lịch làm việc hôm nay"
            extra={<Button type="link">Xem chi tiết</Button>}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <List
              itemLayout="horizontal"
              dataSource={todaySchedules && todaySchedules.length > 0 ? todaySchedules : []}
              locale={{ emptyText: "Không có lịch hôm nay" }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <CalendarOutlined
                        style={{
                          fontSize: 24,
                          color: "#52c41a",
                        }}
                      />
                    }
                    title={
                      <span>
                        <strong>{item.time}</strong> - {item.specialization}{" "}
                        {getStatusTag(item.status || "Đang khám")}
                      </span>
                    }
                    description={
                      <Text>
                        Phòng: {item.room || "Chưa rõ"} | Bệnh nhân: {item.patientCount || 0}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="📰 Tin tức y khoa mới nhất"
            style={{
              marginTop: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <List
              dataSource={[
                {
                  id: 1,
                  title: "Cập nhật phương pháp điều trị mới cho bệnh tiêu hóa",
                  date: "27/06/2025",
                },
                {
                  id: 2,
                  title: "Lời khuyên chăm sóc sức khỏe mùa hè",
                  date: "25/06/2025",
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text strong>{item.title}</Text>{" "}
                  <Text type="secondary">({item.date})</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="👤 Thông tin cá nhân"
            style={{
              textAlign: "center",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: 24,
            }}
          >
            <Avatar
              size={100}
              src={doctorDetail?.user?.avatarUrl}
              icon={<UserOutlined />}
            />
            <Title level={4} style={{ marginTop: 16 }}>
              {doctorDetail?.user?.fullname}
            </Title>

            <Text>
              Chuyên môn:{" "}
              {doctorDetail?.specializations
                ?.map((s) => s.name)
                .join(", ") || "Chưa có"}
            </Text>
            <br />
            <Text>
              Kinh nghiệm:{" "}
              {doctorDetail?.practicingFrom
                ? `${new Date().getFullYear() - new Date(doctorDetail.practicingFrom).getFullYear()} năm`
                : "Chưa cập nhật"}
            </Text>
            <br />
            <Divider />
            <EnvironmentOutlined
              style={{ color: "#1890ff", marginRight: 8 }}
            />
            <Text strong>
              Bệnh viện:{" "}
              {doctorDetail?.hospitalAffiliations?.[0]?.hospital?.name ||
                "Chưa rõ"}
            </Text>

            {doctorDetail?.qualification?.length > 0 && (
              <>
                <Divider />
                <Text strong>Bằng cấp:</Text>
                <List
                  size="small"
                  dataSource={doctorDetail.qualification}
                  renderItem={(item) => (
                    <List.Item>
                      🎓 {item.qualificationName} - {item.instituteName} (
                      {item.procurementYear})
                    </List.Item>
                  )}
                />
              </>
            )}

            <Button type="primary" style={{ marginTop: 16 }}>
              Cập nhật hồ sơ
            </Button>
          </Card>

          <Card
            title="🔔 Thông báo phòng khám"
            extra={<Button type="link">Xem tất cả</Button>}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <List>
              <List.Item>
                <NotificationOutlined
                  style={{ marginRight: 8, color: "#1890ff" }}
                />
                <Text>Thay đổi giờ làm việc từ 01/07/2025</Text>
              </List.Item>
              <List.Item>
                <NotificationOutlined
                  style={{ marginRight: 8, color: "#1890ff" }}
                />
                <Text>Yêu cầu cập nhật giấy phép hành nghề</Text>
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorHome;
