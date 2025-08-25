import React, { useState, useEffect } from "react";
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
  RiseOutlined,
} from "@ant-design/icons";
import { getHospitalParameter } from "../../../services/statisticService";


const AdminHospitalHome = () => {
  const { Title, Text } = Typography;

  const [statsData, setStatsData] = useState([
    {
      title: "Tổng bác sĩ",
      value: 0,
      icon: <UserOutlined />,
      color: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    {
      title: "Nhân viên y tế",
      value: 0,
      icon: <TeamOutlined />,
      color: "#f6ffed",
      borderColor: "#b7eb8f",
    },
    {
      title: "Tổng ca khám đã xử lý",
      value: 0,
      icon: <CalendarOutlined />,
      color: "#fffbe6",
      borderColor: "#ffe58f",
    },
    {
      title: "Hiệu suất làm việc của nhân viên",
      value: 0,
      icon: <RiseOutlined style={{ color: "#1890ff" }} />,
      color: "#e6f7ff",
      borderColor: "#1890ff",
    }

  ]);

  const [performance, setPerformance] = useState({
    clinicPerformance: 0,
    successfulAppointmentRate: 0,
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getHospitalParameter();
        console.log("total appoint : ", JSON.stringify(result));
        setStatsData((prevStats) =>
          prevStats.map((stat) => {
            if (stat.title === "Tổng bác sĩ") {
              return { ...stat, value: result.totalDoctor || 0 };
            } else if (stat.title === "Nhân viên y tế") {
              return { ...stat, value: result.totalStaff || 0 };
            } else if (stat.title === "Tổng ca khám đã xử lý") {
              return {
                ...stat,
                value: result.totalAppoint
                  ? `${result.totalSuccessAppoint}/${result.totalAppoint} (${(result.totalSuccessAppoint / result.totalAppoint * 100).toFixed(1)}%)`
                  : "0/0 (0%)"
              };
            } else {
              return { ...stat, value: result.clinicPerformance || 0 };
            }
          })
        );

        setPerformance({
          clinicPerformance: result.clinicPerformance || 0,
          successfulAppointmentRate: Math.round(result.successfulAppointmentRate) || 0,
        });
      } catch (error) {
        console.error("Failed to fetch hospital parameters:", error);
      }
    };

    fetchData();
  }, []);

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
        Chào Quản lý bệnh viện 
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
                formatter={
                  stat.title === "Hiệu suất làm việc của nhân viên"
                    ? (value) => `${value}%`
                    : undefined
                }
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
            title="Hiệu suất"
            style={{
              textAlign: "center",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >

          
            <Text strong style={{ marginTop: 16, display: "block" }}>
              Tỷ lệ đặt lịch thành công
            </Text>
            <Progress percent={performance.successfulAppointmentRate} status="active" />

          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHospitalHome;
