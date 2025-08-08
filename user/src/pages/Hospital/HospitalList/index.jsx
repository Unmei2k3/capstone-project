import { Button, Card, Col, Empty, Input, Pagination, Rate, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getHospitalList } from "../../../services/hospitalService";
import imgErrorHospital from "../../../assets/images/errorImgHospital.jpg";

function HospitalList() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState([]);
  const [originalHospitalList, setOriginalHospitalList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedData = hospital.slice(startIdx, endIdx);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      const result = await getHospitalList();
      if (result) {
        setHospital(result);
        setOriginalHospitalList(result);
        setSelectedHospital(result[0] || null);
      } else {
        console.error("No hospital data found");
      }
    };
    fetchApi();
  }, []);

  const onChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setHospital(originalHospitalList);
      return;
    }
    const filtered = originalHospitalList.filter((hospital) =>
      (hospital.name || "").toLowerCase().includes(value.toLowerCase())
    );
    setHospital(filtered);
    setCurrentPage(1);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f7f9fc", // nền tổng thể nhẹ nhàng
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px 36px",
        }}
      >
        <h1
          style={{
            color: "#1a73e8", // xanh mới, dễ nhìn
            fontSize: "42px",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Danh sách cơ sở y tế
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Lựa chọn bệnh viện hàng đầu để có trải nghiệm chăm sóc sức khỏe tốt
          nhất
        </p>
        <Input.Search
          placeholder="Tìm kiếm tên bệnh viện..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={onChange}
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 10,
            boxShadow: "0 4px 15px rgba(26,115,232,0.15)", // đổ bóng nhẹ
          }}
        />
      </div>

      <Row gutter={[28, 28]} justify="center">
        <Col xs={24} md={14}>
          {pagedData.length > 0 ? (
            pagedData.map((item, idx) => (
              <Card
                key={idx}
                onClick={() => setSelectedHospital(item)}
                hoverable
                style={{
                  marginBottom: 28,
                  borderRadius: 14,
                  background: "#ffffff",
                  boxShadow:
                    selectedHospital?.id === item.id
                      ? "0 6px 18px rgba(26,115,232,0.3)" // đổ bóng nổi bật bệnh viện đang chọn
                      : "0 3px 10px rgba(0,0,0,0.07)",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
                bodyStyle={{ padding: 20 }}
              >
                <Row gutter={20} align="middle" style={{ display: 'flex', flexWrap: 'nowrap' }}>
                  <Col flex="none">
                    <img
                      src={item.image || imgErrorHospital}
                      alt="Ảnh bệnh viện"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid #1a73e8'
                      }}
                    />
                  </Col>
                  <Col flex="1" style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#0b3954',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}{' '}
                      <CheckCircleFilled style={{ color: '#43a047', marginLeft: 6 }} />
                    </h3>
                    <p
                      style={{
                        color: '#555',
                        fontSize: 15,
                        margin: '6px 0 10px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <EnvironmentOutlined style={{ color: '#1a73e8', marginRight: 6 }} />{' '}
                      {item.address || 'Chưa cập nhật'}
                    </p>
                    <Rate disabled defaultValue={5} style={{ fontSize: 16 }} />
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        gap: 14,
                      }}
                    >
                      <Button
                        type="primary"
                        size="middle"
                        style={{ borderRadius: 8, padding: "0 20px" }}
                        onClick={(e) => {
                          e.stopPropagation(); // tránh trigger setSelectedHospital khi nhấn nút
                          navigate(`/appointment?hospitalId=${item.id}`);
                        }}
                      >
                        Đặt khám
                      </Button>
                      <Button
                        size="middle"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hospital-detail/${item.id}`);
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Empty
              description="Không có dữ liệu bệnh viện"
              style={{ margin: "60px 0" }}
            />
          )}

          {pagedData.length > 0 && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={hospital.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              style={{ marginTop: 36, textAlign: "center" }}
              itemRender={(page, type, originalElement) => {
                // custom icon for prev/next if muốn
                return originalElement;
              }}
            />
          )}
        </Col>

        <Col xs={0} md={10}>
          {selectedHospital && (
            <Card
              style={{
                borderRadius: 14,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                background: "#ffffff",
                padding: 28,
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <img
                  src={selectedHospital.image || imgErrorHospital}
                  alt="Logo"
                  style={{ height: 90, borderRadius: 12, objectFit: "cover" }}
                />
                <h2
                  style={{
                    color: "#1a73e8",
                    marginTop: 16,
                    fontWeight: "bold",
                    fontSize: 26,
                  }}
                >
                  {selectedHospital.name}
                </h2>
              </div>
              <p
                style={{
                  color: "#4a4a4a",
                  marginBottom: 24,
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                {selectedHospital.description || "Chưa có mô tả chi tiết"}
              </p>
              <h3
                style={{
                  fontWeight: 600,
                  color: "#004876",
                  marginBottom: 8,
                  fontSize: 20,
                }}
              >
                Bản đồ
              </h3>
              <iframe
                src={selectedHospital.googleMapUri}
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: 10 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ bệnh viện"
              ></iframe>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default HospitalList;
