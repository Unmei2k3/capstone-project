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
} from "antd";
import { Column, Bar } from "@ant-design/charts";
import moment from "moment";

const { Title } = Typography;

const HospitalStatisticPage = () => {
  const [dateRange, setDateRange] = useState([
    moment().startOf("month"),
    moment().endOf("month"),
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);

    // TODO: Replace with actual API call to fetch data from your DB
    setTimeout(() => {
      setStats({
        soLuotKham: 650,           // Số lượt khám (Appointments count)
        soCaPhauThuat: 54,         // Số ca phẫu thuật
        soBenhNhanMoi: 129,        // Bệnh nhân mới
        doanhThu: 20125,           // Tổng doanh thu
        soPhong: 100,              // Tổng số phòng hoặc giường (tạm dùng HotelCapacity)
        soGiuongDangDung: 79,      // Giường đang sử dụng (từ phòng/room hoặc appointments active)
        soNhanVienHienCo: 50,      // Số lượng nhân viên (HospitalStaffs)
        soNhanVienCoMat: 45,       // Nhân viên hiện diện (StaffSchedules)
        doanhThuTheoNgay: [600, 1500, 1200, 1700, 1000, 1900, 2500], // Doanh thu tuần hoặc ngày
        soLuotKhamTheoKhoa: [       // Số lượt khám theo khoa (Departments)
          { khoa: "Nội khoa", luotKham: 120 },
          { khoa: "Ngoại khoa", luotKham: 80 },
          { khoa: "Sản khoa", luotKham: 60 },
        ],
        trangThaiBacSi: [
          { key: 1, ten: "Bác sĩ Binh", trangThai: "Có mặt" },
          { key: 2, ten: "Bác sĩ An", trangThai: "Đang phẫu thuật" },
        ],
        lichHen: [
          {
            key: 1,
            benhNhan: "Nguyễn Văn A",
            bacSi: "Bác sĩ Binh",
            ngay: "2025-07-08",
            dichVu: "Khám tổng quát",
          },
          {
            key: 2,
            benhNhan: "Trần Thị B",
            bacSi: "Bác sĩ An",
            ngay: "2025-07-09",
            dichVu: "Khám chuyên khoa",
          },
        ],
      });
      setLoading(false);
    }, 800);
  };

  // Config charts data mapping
  const chartDoanhThuConfig = {
    data: stats.doanhThuTheoNgay?.map((value, idx) => ({
      ngay: `Ngày ${idx + 1}`,
      doanhThu: value,
    })) || [],
    xField: "ngay",
    yField: "doanhThu",
    color: "#722ed1",
    height: 220,
  };

  const chartLuotKhamKhoaConfig = {
    data: stats.soLuotKhamTheoKhoa || [],
    xField: "khoa",
    yField: "luotKham",
    color: "#52c41a",
    height: 220,
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f0f2f5" }}>
      <Title level={3} style={{ color: "#1890ff" }}>
        🏥 Thống kê bệnh viện
      </Title>

      {/* Thống kê chung */}
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
              prefix="$"
              value={stats.doanhThu}
              valueStyle={{ color: "#096dd9" }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card style={{ backgroundColor: "#f0f5ff" }}>
            <Statistic
              title="Nhân viên (Hiện diện / Tổng)"
              value={
                stats.soNhanVienCoMat !== undefined &&
                stats.soNhanVienHienCo !== undefined
                  ? `${stats.soNhanVienCoMat} / ${stats.soNhanVienHienCo}`
                  : ""
              }
              valueStyle={{ color: "#52c41a" }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Chọn khoảng thời gian */}
      <Row gutter={16} style={{ marginBottom: 24, textAlign: "right" }}>
        <Col span={24}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
          />
        </Col>
      </Row>

      {/* Biểu đồ doanh thu và lượt khám theo khoa */}
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

      {/* Bảng lịch hẹn */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Lịch hẹn khám bệnh" loading={loading}>
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={stats.lichHen}
              columns={[
                {
                  title: "Tên bệnh nhân",
                  dataIndex: "benhNhan",
                  key: "benhNhan",
                },
                { title: "Bác sĩ", dataIndex: "bacSi", key: "bacSi" },
                { title: "Ngày khám", dataIndex: "ngay", key: "ngay" },
                { title: "Dịch vụ", dataIndex: "dichVu", key: "dichVu" },
              ]}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng trạng thái bác sĩ */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Trạng thái bác sĩ" loading={loading}>
            <Table
              size="small"
              pagination={false}
              dataSource={stats.trangThaiBacSi}
              columns={[
                { title: "Tên bác sĩ", dataIndex: "ten", key: "ten" },
                {
                  title: "Trạng thái",
                  dataIndex: "trangThai",
                  key: "trangThai",
                  render: (text) => (
                    <Tag color={text === "Có mặt" ? "green" : "orange"}>
                      {text}
                    </Tag>
                  ),
                },
              ]}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalStatisticPage;
