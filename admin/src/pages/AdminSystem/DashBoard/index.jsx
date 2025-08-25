import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Select,
  Divider,
  Table,
  Tag,
  Input,
  DatePicker,
  Button,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Column, Bar, Line } from "@ant-design/charts";
import moment from "moment";
import { getAllHospitals } from "../../../services/hospitalService";
import { getSystemAdminDashboard } from "../../../services/statisticService";
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminSystemHomePage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [errorHospitals, setErrorHospitals] = useState(null);
  const [errorDashboard, setErrorDashboard] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState([]);

  const AppointmentStatusTags = {
    1: { text: "Chờ Duyệt", color: "orange" },
    2: { text: "Đã Duyệt", color: "blue" },
    3: { text: "Đã Huỷ", color: "red" },
    4: { text: "Đã khám", color: "green" },
  };
  const renderStatusTag = (status) => {
    const { text, color } = AppointmentStatusTags[status] || {
      text: "Unknown",
      color: "default",
    };
    return <Tag color={color}>{text}</Tag>;
  };

  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      setErrorHospitals(null);
      try {
        const list = await getAllHospitals();
        setHospitals(list);
      } catch (err) {
        setErrorHospitals(err.message || "Lỗi tải danh sách bệnh viện");
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!selectedHospitalId) {
      setDashboardData(null);
      return;
    }
    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      setErrorDashboard(null);
      try {
        const data = await getSystemAdminDashboard(selectedHospitalId);
        setDashboardData(data);
      } catch (err) {
        setErrorDashboard(err.message || "Lỗi tải dữ liệu dashboard");
        setDashboardData(null);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, [selectedHospitalId]);

  const filteredAppointments = dashboardData?.appointments.filter((item) => {
    if (filterDateRange.length === 2) {
      console.log('Filtering appointments with date range:', filterDateRange);
      const startDate = filterDateRange[0].toDate();
      const endDate = filterDateRange[1].toDate();
      const itemDate = new Date(item.appointmentTime);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      itemDate.setHours(0, 0, 0, 0);

      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  }) || [];
  
  const filteredDailyRevenues = dashboardData?.dailyRevenues.filter(item => {
    if (filterDateRange.length === 2) {
      const startDate = filterDateRange[0].toDate();
      const endDate = filterDateRange[1].toDate();
      const itemDate = new Date(item.dayLabel);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  }) || [];

  const configDoanhThuNgay = {
    data: filteredDailyRevenues.map(item => ({
      ngay: item.dayLabel,
      doanhThu: item.revenue,
    })),
    xField: "ngay",
    yField: "doanhThu",
    color: "#52c41a",
    height: 220,
    meta: {
      ngay: { alias: "Ngày" },
      doanhThu: { alias: "Doanh thu (VNĐ)" },
    },
  };

  const columnsLichHen = [
    {
      title: "Mã bệnh nhân",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "Ngày khám",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          Dashboard Quản lý Hệ thống Bệnh viện
        </Title>

        {loadingHospitals ? (
          <Spin tip="Đang tải danh sách bệnh viện..." />
        ) : errorHospitals ? (
          <Alert message="Lỗi" description={errorHospitals} type="error" showIcon />
        ) : (
          <Select
            showSearch
            placeholder="Chọn bệnh viện"
            optionFilterProp="children"
            onChange={setSelectedHospitalId}
            value={selectedHospitalId}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: 320, marginBottom: 24 }}
            allowClear
          >
            {hospitals.map((h) => (
              <Option key={h.id} value={h.id}>
                {h.name}
              </Option>
            ))}
          </Select>
        )}

        {loadingDashboard ? (
          <Spin tip="Đang tải dữ liệu dashboard..." style={{ marginTop: 50 }} />
        ) : errorDashboard ? (
          <Alert message="Lỗi" description={errorDashboard} type="error" showIcon />
        ) : dashboardData ? (
          <>
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng số bác sĩ"
                    value={dashboardData.totalDoctor}
                    prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                    valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng nhân viên y tế"
                    value={dashboardData.totalStaff}
                    prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                    valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Ca khám hôm nay"
                    value={dashboardData.totalAppointToday}
                    prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
                    valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Doanh thu hôm nay (VNĐ)"
                    value={dashboardData.revenueToday}
                    suffix="₫"
                    prefix={<MedicineBoxOutlined style={{ color: "#096dd9" }} />}
                    valueStyle={{ color: "#096dd9", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
            </Row>

            <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              value={filterDateRange}
              onChange={(dates) => setFilterDateRange(dates || [])}
              style={{ marginBottom: 16 }}
              allowClear
            />

            <Card title="Doanh thu theo ngày trong tuần" style={{ marginBottom: 32 }}>
              <Line {...configDoanhThuNgay} />
            </Card>

            <Card title="Lịch hẹn chi tiết">
              <Table
                columns={columnsLichHen}
                dataSource={filteredAppointments}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                rowKey="id"
              />
            </Card>
          </>
        ) : (
          <div>Chọn một bệnh viện để xem dữ liệu</div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default AdminSystemHomePage;