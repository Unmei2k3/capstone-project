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
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const NurseHome = () => {
  const { Title, Text } = Typography;
  const userDefault = useSelector((state) => state.user.user || null);
  const navigate = useNavigate();
  if (!userDefault) {
    return <div>Đang tải dữ liệu...</div>;
  }

  const fullname = userDefault.fullname || userDefault.userName || "Chưa có tên";
  const job = userDefault.job || "Chưa xác định";
  const hospitals = userDefault.hospitals || [];
  const email = userDefault.email || "";
  const phoneNumber = userDefault.phoneNumber || "";
  const address = userDefault.streetAddress || "";
  const province = userDefault.province || "";
  const ward = userDefault.ward || "";

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
        Chào {fullname}
      </Title>

      <Row gutter={[24, 24]}>

        <Col span={16}>

          <Card
            title="Ca trực hôm nay"
            style={{
              backgroundColor: "#e6fffb",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Text>Chưa có dữ liệu ca trực.</Text>
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
            <Text>Chưa có dữ liệu bệnh nhân.</Text>
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
            <Text>Chưa có dữ liệu nhiệm vụ.</Text>
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
            <Text>Chưa có thông báo mới.</Text>
          </Card>
        </Col>

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
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={userDefault.avatarUrl || null}
              alt={fullname}
            />
            <Title level={4} style={{ marginTop: 16 }}>
              {fullname}
            </Title>
            <Text>
              <strong>Chức vụ: </strong> Y Tá
            </Text>
            <br />
            <Text>
              <strong>Bệnh viện: </strong>{" "}
              {hospitals.length > 0 ? hospitals[0].name : "Chưa có"}
            </Text>
            <br />
            <Text>
              <HomeOutlined /> {`${address}, ${ward}, ${province}`}
            </Text>
            <br />
            <Text>
              <PhoneOutlined /> {phoneNumber}
            </Text>
            <br />
            <Text>
              <MailOutlined /> {email}
            </Text>
            <br />
            <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate("nurse-profile")}>
              Cập nhật hồ sơ
            </Button>
          </Card>
        </Col>
      </Row>
    </div >
  );
};

export default NurseHome;
