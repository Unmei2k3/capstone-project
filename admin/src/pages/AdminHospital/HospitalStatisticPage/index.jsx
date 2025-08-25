import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { Column, Bar, ConfigProvider } from "@ant-design/charts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/vi";
import viVN from "antd/es/locale/vi_VN";
import { getStatisticHospitalId } from "../../../services/statisticService";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
dayjs.locale("vi");

const { Title } = Typography;
const { RangePicker } = DatePicker;


const HospitalStatisticPage = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    soLuotKham: 0,
    soBenhNhanMoi: 0,
    doanhThu: 0,
    soNhanVienCoMat: 0,
    soNhanVienHienCo: 0,
    doanhThuTheoNgay: [],
    soLuotKhamTheoKhoa: [],
    lichHen: [],
    trangThaiBacSi: [],
  });

  const getStatusText = (status) => {
    switch (status) {
      case 1: return "Đang chờ";
      case 2: return "Đã xác nhận";
      case 3: return "Đã hủy";
      case 4: return "Hoàn thành";
      default: return "Không rõ";
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const fromDate = dateRange[0]?.startOf("day").format("YYYY-MM-DD");
        const toDate = dateRange[1]?.endOf("day").format("YYYY-MM-DD");

        const data = await getStatisticHospitalId(fromDate, toDate);
        console.log("data iss : " + data);
        setStats({
          soLuotKham: data.totalVisits,
          soBenhNhanMoi: data.newPatients,
          doanhThu: data.revenue,
          soNhanVienCoMat: data.staffLeaveToday,
          soNhanVienHienCo: 0,
          tongBacSi: data.totalDoctor,
          tongNhanVien: data.totalStaff,
          doanhThuTheoNgay: data.dailyRevenues.map(item => ({
            ngay: item.dayLabel,
            doanhThu: item.revenue,
          })),
          soLuotKhamTheoKhoa: data.departmentVisits.map(item => ({
            khoa: item.departmentName,
            luotKham: item.visitCount,
          })),
          lichHen: data.appointments,
          trangThaiBacSi: [],
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching statistics:", error);
        message.error("Lỗi tải dữ liệu thống kê");
      }
    };

    if (dateRange?.length === 2) {
      fetchStats();
    }
  }, [dateRange]);



  const chartDoanhThuConfig = {
    data: stats.doanhThuTheoNgay,
    xField: "ngay",
    yField: "doanhThu",
    color: "#722ed1",
    height: 220,
    tooltip: {
      formatter: (datum) => ({ name: "Doanh thu", value: `${datum.doanhThu} VNĐ` }),
    },
  };

  const chartLuotKhamKhoaConfig = {
    data: stats.soLuotKhamTheoKhoa,
    xField: "khoa",
    yField: "luotKham",
    color: "#52c41a",
    height: 220,
  };

  return (
    <ConfigProvider locale={viVN}>

      <div style={{ padding: 24, backgroundColor: "#f0f2f5" }}>
        <Title level={3} style={{ color: "#1890ff" }}>
          🏥 Thống kê bệnh viện
        </Title>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card style={{ backgroundColor: "#f9f0ff" }}>
              <Statistic
                title="Số lượt khám"
                value={stats.soLuotKham}
                valueStyle={{ color: "#722ed1" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card style={{ backgroundColor: "#f6ffed" }}>
              <Statistic
                title="Bệnh nhân mới"
                value={stats.soBenhNhanMoi}
                valueStyle={{ color: "#389e0d" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card style={{ backgroundColor: "#e6f7ff" }}>
              <Statistic
                title="Doanh thu"
                suffix="VNĐ"
                value={stats.doanhThu}
                valueStyle={{ color: "#096dd9" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card style={{ backgroundColor: "#f0f5ff" }}>
              <Statistic
                title="Nhân viên vắng"
                value={`${stats.soNhanVienCoMat}`}
                valueStyle={{ color: "#52c41a" }}
                loading={loading}
              />
            </Card>
          </Col>
           <Col span={4}>
            <Card style={{ backgroundColor: "#f0f5ff" }}>
              <Statistic
                title="Số lượng bác sĩ"
                value={`${stats.tongBacSi}`}
                valueStyle={{ color: "#52c41a" }}
                loading={loading}
              />
            </Card>
          </Col>
           <Col span={4}>
            <Card style={{ backgroundColor: "#f0f5ff" }}>
              <Statistic
                title="Số lượng nhân viên"
                value={`${stats.tongNhanVien}`}
                valueStyle={{ color: "#52c41a" }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24, textAlign: "right" }}>
          <Col span={24}>
            <RangePicker
            locale={viVN}
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format="DD/MM/YYYY"
              style={{ width: 300 }}
              allowClear={false}

            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Doanh thu theo ngày" loading={loading}>
              <Column {...chartDoanhThuConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Số lượt khám theo khoa" loading={loading}>
              <Bar {...chartLuotKhamKhoaConfig} />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Lịch hẹn khám bệnh" loading={loading}>
              <Table
                size="small"
                pagination={{ pageSize: 5 }}
                dataSource={stats.lichHen.map((item) => ({
                  key: item.id,
                  benhNhan: `Bệnh nhân #${item.patientId}`,
                  bacSi: `Bác sĩ ${item.serviceId}`,
                  ngay: dayjs(item.appointmentTime).format("DD/MM/YYYY"),
                  dichVu: item.serviceName,
                  trangThai: getStatusText(item.status),
                }))}
                columns={[
                  { title: "Tên bệnh nhân", dataIndex: "benhNhan", key: "benhNhan" },
                  { title: "Bác sĩ", dataIndex: "bacSi", key: "bacSi" },
                  { title: "Ngày khám", dataIndex: "ngay", key: "ngay" },
                  { title: "Dịch vụ", dataIndex: "dichVu", key: "dichVu" },
                  {
                    title: "Trạng thái",
                    dataIndex: "trangThai",
                    key: "trangThai",
                    render: (text) => {
                      let color = "blue";
                      if (text === "Đang chờ") color = "orange";
                      else if (text === "Đã xác nhận") color = "green";
                      else if (text === "Đã hủy") color = "red";
                      else if (text === "Hoàn thành") color = "blue";
                      return <Tag color={color}>{text}</Tag>;
                    }
                  },
                ]}
                locale={{ emptyText: "Không có lịch hẹn nào" }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

  
      </div>
    </ConfigProvider>
  );
};

export default HospitalStatisticPage;