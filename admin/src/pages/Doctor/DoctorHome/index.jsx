import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  List,
  Avatar,
  Typography,
  Divider,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { getDoctorByUserId } from "../../../services/doctorService";
import { useNavigate } from "react-router-dom";
import DoctorScheduleToday from "./doctorScheduleToday";

const { Title, Text } = Typography;

const DoctorHome = () => {
  const user = useSelector((state) => state.user.user);
  const [doctorDetail, setDoctorDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user?.id) return;
      try {
        const data = await getDoctorByUserId(user.id);
        setDoctorDetail(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu bác sĩ:", error);
      }
    };
    fetchDoctor();
  }, [user?.id]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      <Title style={{ textAlign: "center", color: "#1890ff" }} level={2}>
        Chào bác sĩ {doctorDetail?.user?.fullname || "Bác sĩ"}
      </Title>

      <Row gutter={16}>
        <Col span={16}>
          {/* Lịch làm việc hôm nay, gọi API riêng với doctorId thực */}
          {doctorDetail?.id && <DoctorScheduleToday doctorId={doctorDetail.id} />}

          <Card
            title="📰 Tin tức y khoa mới nhất"
            style={{
              marginTop: 24,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            extra={<Button type="link">Xem tất cả</Button>}
          >
            {/* Bạn có thể thay đổi lấy tin tức thực tế */}
            <List
              dataSource={[]}
              locale={{ emptyText: "Chưa có tin tức" }}
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
              src={doctorDetail?.user?.avatarUrl || undefined}
              icon={<UserOutlined />}
            />
            <Title level={4} style={{ marginTop: 16 }}>
              {doctorDetail?.user?.fullname || "Chưa cập nhật"}
            </Title>

            <Text>
              Chuyên môn:{" "}
              {doctorDetail?.specializations?.map((s) => s.name).join(", ") ||
                "Chưa có"}
            </Text>
            <br />
        
            <br />
            <Divider />
            <EnvironmentOutlined
              style={{ color: "#1890ff", marginRight: 8, verticalAlign: "middle" }}
            />
            <Tooltip
              title={doctorDetail?.hospitalAffiliations?.[0]?.hospital?.name || ""}
            >
              <Text
                strong
                style={{
                  display: "block",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "200px",
                  margin: "0 auto",
                }}
                ellipsis
              >
                Bệnh viện:{" "}
                {doctorDetail?.hospitalAffiliations?.[0]?.hospital?.name || "Chưa rõ"}
              </Text>
            </Tooltip>

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
                      {item.procurementYear || "N/A"})
                    </List.Item>
                  )}
                />
              </>
            )}

            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate("profile")}
            >
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
            <List
              dataSource={[]}
              locale={{ emptyText: "Chưa có thông báo" }}
              renderItem={(item) => (
                <List.Item>
                  <NotificationOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorHome;
