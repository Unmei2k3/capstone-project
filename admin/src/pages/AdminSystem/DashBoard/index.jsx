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

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const hospitals = [
  { id: 1, name: "Bệnh viện A" },
  { id: 2, name: "Bệnh viện B" },
  { id: 3, name: "Bệnh viện C" },
];


const statsByHospital = {
  1: {
    bacSi: 45,
    nhanVien: 120,
    caKhamHomNay: 78,
    benhNhanDangDT: 150,
    doanhThu: 25000,
    gioiHanGiuong: { dangDung: 70, tong: 100 },
    caPhauThuatTheoBS: [
      { bacSi: "Bác sĩ Binh", soCa: 12 },
      { bacSi: "Bác sĩ An", soCa: 9 },
      { bacSi: "Bác sĩ Hoa", soCa: 5 },
    ],
    tyLeGiuongTheoKhoa: [
      { khoa: "Nội", tiLe: 0.85 },
      { khoa: "Ngoại", tiLe: 0.72 },
      { khoa: "Sản", tiLe: 0.78 },
    ],
    doanhThuTheoNgay: [
      { ngay: "Thứ 2", doanhThu: 3500 },
      { ngay: "Thứ 3", doanhThu: 4200 },
      { ngay: "Thứ 4", doanhThu: 4800 },
      { ngay: "Thứ 5", doanhThu: 5000 },
      { ngay: "Thứ 6", doanhThu: 4600 },
      { ngay: "Thứ 7", doanhThu: 5200 },
      { ngay: "Chủ nhật", doanhThu: 4800 },
    ],
    nhanVienTheoTrangThai: [
      { trangThai: "Trực", soLuong: 30 },
      { trangThai: "Nghỉ", soLuong: 10 },
      { trangThai: "Đi công tác", soLuong: 5 },
      { trangThai: "Làm việc", soLuong: 75 },
    ],
    lichHenChiTiet: [
      {
        key: 1,
        benhNhan: "Nguyễn Văn A",
        bacSi: "Bác sĩ Binh",
        khoa: "Nội",
        ngay: "2025-07-08",
        dichVu: "Khám tổng quát",
      },
      {
        key: 2,
        benhNhan: "Trần Thị B",
        bacSi: "Bác sĩ An",
        khoa: "Ngoại",
        ngay: "2025-07-09",
        dichVu: "Phẫu thuật",
      },
      {
        key: 3,
        benhNhan: "Lê Văn C",
        bacSi: "Bác sĩ Hoa",
        khoa: "Sản",
        ngay: "2025-07-10",
        dichVu: "Khám thai",
      },
    ],
    danhGiaHanhLong: {
      soLuong: 320,
      diemTrungBinh: 4.3,
    },
  },
  2: {
    // ... tương tự cho bệnh viện B
    bacSi: 30,
    nhanVien: 90,
    caKhamHomNay: 60,
    benhNhanDangDT: 100,
    doanhThu: 18000,
    gioiHanGiuong: { dangDung: 55, tong: 80 },
    caPhauThuatTheoBS: [
      { bacSi: "Bác sĩ Nam", soCa: 15 },
      { bacSi: "Bác sĩ Lan", soCa: 7 },
    ],
    tyLeGiuongTheoKhoa: [
      { khoa: "Nội", tiLe: 0.75 },
      { khoa: "Ngoại", tiLe: 0.65 },
      { khoa: "Sản", tiLe: 0.70 },
    ],
    doanhThuTheoNgay: [
      { ngay: "Thứ 2", doanhThu: 3200 },
      { ngay: "Thứ 3", doanhThu: 4000 },
      { ngay: "Thứ 4", doanhThu: 4500 },
      { ngay: "Thứ 5", doanhThu: 4700 },
      { ngay: "Thứ 6", doanhThu: 4400 },
      { ngay: "Thứ 7", doanhThu: 4800 },
      { ngay: "Chủ nhật", doanhThu: 4600 },
    ],
    nhanVienTheoTrangThai: [
      { trangThai: "Trực", soLuong: 20 },
      { trangThai: "Nghỉ", soLuong: 7 },
      { trangThai: "Đi công tác", soLuong: 3 },
      { trangThai: "Làm việc", soLuong: 60 },
    ],
    lichHenChiTiet: [
      {
        key: 4,
        benhNhan: "Phạm Thị D",
        bacSi: "Bác sĩ Nam",
        khoa: "Nội",
        ngay: "2025-07-08",
        dichVu: "Khám tổng quát",
      },
      {
        key: 5,
        benhNhan: "Hoàng Văn E",
        bacSi: "Bác sĩ Lan",
        khoa: "Ngoại",
        ngay: "2025-07-09",
        dichVu: "Phẫu thuật",
      },
    ],
    danhGiaHanhLong: {
      soLuong: 180,
      diemTrungBinh: 4.0,
    },
  },
  3: {
    // ... tương tự cho bệnh viện C
    bacSi: 55,
    nhanVien: 140,
    caKhamHomNay: 85,
    benhNhanDangDT: 170,
    doanhThu: 32000,
    gioiHanGiuong: { dangDung: 90, tong: 120 },
    caPhauThuatTheoBS: [
      { bacSi: "Bác sĩ Hải", soCa: 20 },
      { bacSi: "Bác sĩ Bình", soCa: 10 },
    ],
    tyLeGiuongTheoKhoa: [
      { khoa: "Nội", tiLe: 0.80 },
      { khoa: "Ngoại", tiLe: 0.75 },
      { khoa: "Sản", tiLe: 0.85 },
    ],
    doanhThuTheoNgay: [
      { ngay: "Thứ 2", doanhThu: 4000 },
      { ngay: "Thứ 3", doanhThu: 4800 },
      { ngay: "Thứ 4", doanhThu: 5200 },
      { ngay: "Thứ 5", doanhThu: 5500 },
      { ngay: "Thứ 6", doanhThu: 5000 },
      { ngay: "Thứ 7", doanhThu: 6000 },
      { ngay: "Chủ nhật", doanhThu: 5800 },
    ],
    nhanVienTheoTrangThai: [
      { trangThai: "Trực", soLuong: 35 },
      { trangThai: "Nghỉ", soLuong: 12 },
      { trangThai: "Đi công tác", soLuong: 6 },
      { trangThai: "Làm việc", soLuong: 87 },
    ],
    lichHenChiTiet: [
      {
        key: 6,
        benhNhan: "Lê Thị F",
        bacSi: "Bác sĩ Hải",
        khoa: "Nội",
        ngay: "2025-07-08",
        dichVu: "Khám tổng quát",
      },
      {
        key: 7,
        benhNhan: "Trần Văn G",
        bacSi: "Bác sĩ Bình",
        khoa: "Ngoại",
        ngay: "2025-07-09",
        dichVu: "Phẫu thuật",
      },
    ],
    danhGiaHanhLong: {
      soLuong: 400,
      diemTrungBinh: 4.5,
    },
  },
};


const AdminSystemHomePage = () => {
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0].id);
  const [filterDoanhThuNgay, setFilterDoanhThuNgay] = useState([]);
  const [filterBacSi, setFilterBacSi] = useState("");
  const [filterKhoa, setFilterKhoa] = useState("");
  const [filterNgay, setFilterNgay] = useState([]);

  // Dữ liệu lọc
  const allAppointments = statsByHospital[selectedHospitalId].lichHenChiTiet || [];

  const filteredAppointments = allAppointments.filter((item) => {
    const matchBacSi = filterBacSi ? item.bacSi.includes(filterBacSi) : true;
    const matchKhoa = filterKhoa ? item.khoa.includes(filterKhoa) : true;
    const matchNgay =
      filterNgay.length === 2
        ? moment(item.ngay).isBetween(filterNgay[0], filterNgay[1], null, "[]")
        : true;
    return matchBacSi && matchKhoa && matchNgay;
  });

  // Thống kê
  const stats = statsByHospital[selectedHospitalId];

  // Config các biểu đồ

  const configCaPhauThuat = {
    data: stats.caPhauThuatTheoBS || [],
    xField: "bacSi",
    yField: "soCa",
    label: { position: "top" },
    color: "#fa541c",
    height: 250,
    meta: {
      bacSi: { alias: "Bác sĩ" },
      soCa: { alias: "Số ca phẫu thuật" },
    },
  };


  const filteredDoanhThu = (stats.doanhThuTheoNgay || []).filter((item) => {
    if (filterDoanhThuNgay.length !== 2) return true;
    return moment(item.ngayThuc).isBetween(filterDoanhThuNgay[0], filterDoanhThuNgay[1], 'day', '[]');
  });

  const configDoanhThuNgay = {
    data: filteredDoanhThu,
    xField: "ngay",
    yField: "doanhThu",
    color: "#52c41a",
    height: 220,
    meta: {
      ngay: { alias: "Ngày" },
      doanhThu: { alias: "Doanh thu (VNĐ)" },
    },
  };

  const configNhanVienTrangThai = {
    data: stats.nhanVienTheoTrangThai || [],
    xField: "trangThai",
    yField: "soLuong",
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    color: "#722ed1",
    height: 220,
    meta: {
      trangThai: { alias: "Trạng thái" },
      soLuong: { alias: "Số lượng" },
    },
  };

  // Các cột bảng lịch hẹn
  const columnsLichHen = [
    {
      title: "Tên bệnh nhân",
      dataIndex: "benhNhan",
      key: "benhNhan",
    },
    {
      title: "Bác sĩ",
      dataIndex: "bacSi",
      key: "bacSi",
    },
    {
      title: "Khoa",
      dataIndex: "khoa",
      key: "khoa",
    },
    {
      title: "Ngày khám",
      dataIndex: "ngay",
      key: "ngay",
    },
    {
      title: "Dịch vụ",
      dataIndex: "dichVu",
      key: "dichVu",
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard Quản lý Hệ thống Bệnh viện
      </Title>

      <Select
        style={{ width: 320, marginBottom: 24 }}
        value={selectedHospitalId}
        onChange={(val) => {
          setSelectedHospitalId(val);
          // Reset filters khi đổi bệnh viện
          setFilterBacSi("");
          setFilterKhoa("");
          setFilterNgay([]);
        }}
        placeholder="Chọn bệnh viện"
        allowClear
      >
        {hospitals.map((h) => (
          <Option key={h.id} value={h.id}>
            {h.name}
          </Option>
        ))}
      </Select>

      {/* Thống kê tổng quan */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bác sĩ"
              value={stats.bacSi}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nhân viên y tế"
              value={stats.nhanVien}
              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca khám hôm nay"
              value={stats.caKhamHomNay}
              prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bệnh nhân đang điều trị"
              value={stats.benhNhanDangDT}
              prefix={<FileDoneOutlined style={{ color: "#eb2f96" }} />}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê giường & doanh thu */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu trong ngày (VNĐ)"
              value={stats.doanhThu}
              precision={0}
              valueStyle={{ color: "#096dd9", fontWeight: "bold" }}
              suffix="₫"
              prefix={<MedicineBoxOutlined style={{ color: "#096dd9" }} />}
            />
          </Card>
        </Col>
        {/* <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đánh giá hài lòng"
              value={`${stats.danhGiaHanhLong.diemTrungBinh} / 5`}
              suffix={`(${stats.danhGiaHanhLong.soLuong} lượt)`}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
              prefix={<SmileOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col> */}
      </Row>


      <RangePicker
        value={filterDoanhThuNgay}
        onChange={(dates) => setFilterDoanhThuNgay(dates || [])}
        style={{ marginBottom: 16 }}
      />
      <Card title="Doanh thu theo ngày trong tuần" style={{ marginBottom: 32 }}>
        <Line {...configDoanhThuNgay} />
      </Card>

      {/* Biểu đồ nhân viên theo trạng thái */}
      <Card title="Nhân viên y tế trong ngày" style={{ marginBottom: 32 }}>
        <Bar {...configNhanVienTrangThai} />
      </Card>

      {/* Bộ lọc lịch hẹn */}
      <Card title="Lịch hẹn chi tiết" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm bác sĩ"
              allowClear
              value={filterBacSi}
              onChange={(e) => setFilterBacSi(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm khoa"
              allowClear
              value={filterKhoa}
              onChange={(e) => setFilterKhoa(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              value={filterNgay}
              onChange={(dates) => setFilterNgay(dates || [])}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columnsLichHen}
          dataSource={filteredAppointments}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default AdminSystemHomePage;
