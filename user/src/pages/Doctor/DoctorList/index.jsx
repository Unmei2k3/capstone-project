import { useEffect, useState } from "react";
import { Card, Col, Empty, Input, Pagination, Rate, Row, Select, Button } from "antd";
import { EnvironmentOutlined, SearchOutlined, CalendarOutlined, PushpinOutlined, BookOutlined } from "@ant-design/icons";
import imgErrorDoctor from "../../../assets/images/errorImgHospital.jpg";

const mockDoctorList = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        rank: "PGS.TS",
        address: "Bệnh viện Bạch Mai, Hà Nội",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 5,
        speciality: "Nội tổng quát",
        treatment: "Nội tổng quát",
        schedule: "Hẹn khám"
    },
    {
        id: 2,
        name: "Trần Thị B",
        rank: "TS",
        address: "Bệnh viện Chợ Rẫy, TP.HCM",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        rating: 4,
        speciality: "Tim mạch",
        treatment: "Suy tim, tăng huyết áp",
        schedule: "Hẹn khám"
    },
    {
        id: 3,
        name: "Lê Văn C",
        rank: "BSCKII",
        address: "Bệnh viện Trung Ương Huế",
        image: "https://randomuser.me/api/portraits/men/53.jpg",
        rating: 5,
        speciality: "Thần kinh",
        treatment: "Đau đầu, mất ngủ, Parkinson",
        schedule: "Hẹn khám"
    },
    {
        id: 4,
        name: "Phạm Thị D",
        rank: "ThS",
        address: "Bệnh viện Việt Đức, Hà Nội",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        rating: 3,
        speciality: "Tiêu hóa",
        treatment: "Dạ dày, đại tràng, gan",
        schedule: "Hẹn khám"
    },
    {
        id: 5,
        name: "Đỗ Văn E",
        rank: "BSCKI",
        address: "Bệnh viện Đại học Y Dược TP.HCM",
        image: "https://randomuser.me/api/portraits/men/73.jpg",
        rating: 4,
        speciality: "Da liễu",
        treatment: "Viêm da, mụn, nấm",
        schedule: "Hẹn khám"
    },
    {
        id: 6,
        name: "Ngô Thị F",
        rank: "Bác sĩ",
        address: "Bệnh viện Quân Y 103",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        rating: 5,
        speciality: "Sản phụ khoa",
        treatment: "Khám thai, sinh nở, nội tiết",
        schedule: "Hẹn khám"
    },
    {
        id: 7,
        name: "Phan Văn G",
        rank: "ThS",
        address: "Bệnh viện Tâm Thần Trung Ương",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        rating: 4,
        speciality: "Tâm thần",
        treatment: "Trầm cảm, rối loạn lo âu",
        schedule: "Hẹn khám"
    },
    {
        id: 8,
        name: "Nguyễn Thị H",
        rank: "BSCKI",
        address: "Bệnh viện Phụ Sản Hà Nội",
        image: "https://randomuser.me/api/portraits/women/31.jpg",
        rating: 5,
        speciality: "Phụ sản",
        treatment: "Khám sản, vô sinh hiếm muộn",
        schedule: "Hẹn khám"
    },
    {
        id: 9,
        name: "Vũ Văn I",
        rank: "PGS.TS",
        address: "Bệnh viện Nhi Trung Ương",
        image: "https://randomuser.me/api/portraits/men/25.jpg",
        rating: 5,
        speciality: "Nhi khoa",
        treatment: "Hô hấp, tiêu hóa trẻ em",
        schedule: "Hẹn khám"
    },
    {
        id: 10,
        name: "Lê Thị J",
        rank: "TS",
        address: "Bệnh viện Da Liễu TP.HCM",
        image: "https://randomuser.me/api/portraits/women/11.jpg",
        rating: 4,
        speciality: "Da liễu",
        treatment: "Chăm sóc da chuyên sâu",
        schedule: "Hẹn khám"
    },
    {
        id: 11,
        name: "Trương Văn K",
        rank: "BSCKII",
        address: "Bệnh viện Tai Mũi Họng Trung Ương",
        image: "https://randomuser.me/api/portraits/men/12.jpg",
        rating: 4,
        speciality: "Tai Mũi Họng",
        treatment: "Viêm xoang, viêm họng",
        schedule: "Hẹn khám"
    },
    {
        id: 12,
        name: "Đinh Thị L",
        rank: "Bác sĩ",
        address: "Bệnh viện Mắt Trung Ương",
        image: "https://randomuser.me/api/portraits/women/55.jpg",
        rating: 5,
        speciality: "Mắt",
        treatment: "Cận thị, đau mắt, phẫu thuật LASIK",
        schedule: "Hẹn khám"
    }
];

function DoctorList() {
    const [doctors, setDoctors] = useState(mockDoctorList);
    const [originalDoctors, setOriginalDoctors] = useState(mockDoctorList);
    const [selectedRank, setSelectedRank] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedData = doctors.slice(startIdx, endIdx);

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        applyFilter(value, selectedRank);
    };

    const onRankChange = (value) => {
        setSelectedRank(value);
        applyFilter(searchText, value);
    };

    const applyFilter = (text, rank) => {
        let filtered = originalDoctors;
        if (text) {
            filtered = filtered.filter(d => (d.name || '').toLowerCase().includes(text.toLowerCase()));
        }
        if (rank) {
            filtered = filtered.filter(d => d.rank === rank);
        }
        setDoctors(filtered);
        setCurrentPage(1);
    };

    const rankOptions = [
        { value: "PGS.TS", label: "PGS.TS" },
        { value: "TS", label: "TS" },
        { value: "ThS", label: "ThS" },
        { value: "BSCKII", label: "BSCKII" },
        { value: "BSCKI", label: "BSCKI" },
        { value: "Bác sĩ", label: "Bác sĩ" },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 8px' }}>
            <div style={{ textAlign: 'center', padding: '24px 8px 16px' }}>
                <h1 style={{ color: '#1677ff', fontSize: '28px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                    Danh sách bác sĩ
                </h1>
                <p style={{ fontSize: 14, color: '#555', maxWidth: 600, margin: '0 auto 24px' }}>
                    Tìm kiếm bác sĩ theo tên hoặc học hàm để chọn lựa tốt nhất
                </p>
                <Row gutter={16} justify="center" style={{ marginBottom: 16 }}>
                    <Col xs={24} md={14}>
                        <Input
                            allowClear
                            size="middle"
                            placeholder="Tìm theo tên bác sĩ..."
                            prefix={<SearchOutlined />}
                            onChange={onSearchChange}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            allowClear
                            placeholder="Lọc theo học hàm"
                            size="middle"
                            style={{ width: '100%' }}
                            options={rankOptions}
                            onChange={onRankChange}
                        />
                    </Col>
                </Row>
            </div>

            <Row gutter={[16, 16]} justify="center">
                <Col span={24}>
                    {pagedData.length > 0 ? (
                        <div style={{ padding: '0 100px' }}>
                            <Row gutter={[16, 16]}>
                                {pagedData.map((doc, idx) => (
                                    <Col xs={24} md={12} key={idx}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: 12,
                                                background: '#f8fbff',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Row gutter={20}>
                                                <Col>
                                                    <img
                                                        src={doc.image || imgErrorDoctor}
                                                        alt="Ảnh bác sĩ"
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                            objectFit: 'cover',
                                                            borderRadius: '50%',
                                                            border: '1px solid #e6f7ff'
                                                        }}
                                                    /></Col>
                                                <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <div style={{ paddingLeft: 50 }}>
                                                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{doc.rank} {doc.name}</h3>
                                                        <p style={{ color: '#666', fontSize: 13 }}>
                                                            <EnvironmentOutlined /> {doc.address || 'Chưa cập nhật'}
                                                        </p>
                                                        <Rate disabled defaultValue={doc.rating || 5} style={{ fontSize: 12 }} />
                                                        <p style={{ marginTop: 6, fontSize: 13 }}>
                                                            <BookOutlined style={{ color: '#1677ff' }} /> Chuyên khoa: {doc.speciality}
                                                        </p>
                                                        <p style={{ fontSize: 13 }}>
                                                            <PushpinOutlined style={{ color: '#1677ff' }} /> Chuyên trị: {doc.treatment}
                                                        </p>
                                                        <p style={{ fontSize: 13 }}>
                                                            <CalendarOutlined style={{ color: '#1677ff' }} /> Lịch khám: {doc.schedule}
                                                        </p>
                                                        <div style={{ marginTop: 8 }}>
                                                            <Button type="primary" size="small" style={{ borderRadius: 4 }}>Đặt khám</Button>
                                                        </div>
                                                    </div>
                                                </Col>

                                            </Row>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <Empty description="Không có bác sĩ nào phù hợp" style={{ margin: '24px 0' }} />
                    )}

                    {pagedData.length > 0 && (
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={doctors.length}
                            onChange={setCurrentPage}
                            showSizeChanger={false}
                            style={{ marginTop: 24, textAlign: 'center' }}
                        />
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default DoctorList;
