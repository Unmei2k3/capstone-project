
import { Button, Col, Flex, Row, Tooltip, Card, Carousel, Rate } from "antd";
import { Input, Space } from 'antd';
import { CheckCircleFilled, EnvironmentOutlined, RightOutlined } from "@ant-design/icons";
import "./style.scss";
import banner1 from "../../assets/images/banner1.png";
import banner2 from "../../assets/images/banner2.png";
import banner3 from "../../assets/images/banner3.png";
import { Spin } from 'antd';
import React, { useEffect, useState } from "react";
import { getHospitalList } from "../../services/hospitalService";
import imgErrorHospital from "../../assets/images/errorImgHospital.jpg";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { getSpecializationList } from "../../services/specializationService";
import ChatBot from "../../components/ChatBox/ChatBot";
const { Search } = Input;

function Home() {
    const INITIAL_COUNT = 16;
    const navigate = useNavigate();
    const settings = {
        centerMode: true,
        centerPadding: "0px",
        dots: false,
        infinite: true,
        speed: 200,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 20000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false
                }
            }
        ]
    };

    const SpecializationItem = React.memo(({ item }) => (
        <Col
            xs={24} sm={12} md={8} lg={6} xl={3}
            style={{
                cursor: "pointer",
                marginBottom: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src={item.image}
                alt={item.description}
                loading="lazy"
                style={{ width: 80, height: 80, margin: "0 0", display: "block" }}
            />
            <div style={{
                fontFamily: 'Roboto',
                fontSize: 20,
                textAlign: 'center',
                color: ' #003553',
                marginTop: 8,
                fontWeight: 400,
                height: 46,
                width: 105.5,
                display: "flex",
                justifyContent: "center",
                whiteSpace: "normal",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                direction: 'ltr'
            }}>
                {item.name}
            </div>
        </Col>
    ));

    const [hospital, setHospital] = useState([]);
    const [loadingHospital, setLoadingHospital] = useState(true);
    useEffect(() => {
        const fetchApi = async () => {
            const result = await getHospitalList();
            if (result) {
                setHospital(result);
                setLoadingHospital(false);
            } else {
                console.error("No hospital data found");
            }
        };
        fetchApi();
    }, []);
    console.log(hospital);

    const [specialization, setSpecialization] = useState([]);
    const [loadingSpecialization, setLoadingSpecialization] = useState(true);
    useEffect(() => {
        const fetchApi = async () => {
            const result = await getSpecializationList();
            if (result) {
                setSpecialization(result);
                setLoadingSpecialization(false);
            } else {
                console.error("No hospital data found");
            }
        };
        fetchApi();
    }, []);

    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const handleShowMore = () => {
        if (visibleCount >= specialization.length)
            setVisibleCount(INITIAL_COUNT);
        else
            setVisibleCount(visibleCount + INITIAL_COUNT);
    };

    const onSearch = (value, _e, info) =>
        console.log(info === null || info === void 0 ? void 0 : info.source, value);
    return <>
        <div className="background-img">
            <div style={{
                background: '#E8F4FD',
                borderRadius: 12,
                boxShadow: '0 4px 16px 0 rgba(24, 144, 255, 0.12)',
                padding: 24,
                marginBottom: 20, marginTop: 0
            }}>
                <Row justify="center" >
                    <Col className="gutter-row" span={12} style={{ textAlign: 'center', marginBottom: 20, marginTop: 20 }}>
                        <h1>Kết nối Người Dân với Cơ sở & Dịch vụ Y tế hàng đầu</h1>
                    </Col>
                </Row>
                {/* <Row justify="center">
                    <Col className="gutter-row" span={12} style={{ textAlign: 'center', marginBottom: 40 }}>

                        <Search
                            placeholder="Tìm kiếm bác sĩ, gói khám, cơ sở khám, ..."
                            allowClear
                            enterButton="Search"
                            size="large"
                            onSearch={onSearch}
                        />
                    </Col>
                </Row> */}
            </div>



            <Row justify="center" style={{
                marginTop: 30,

            }}
            >
                <Col span={20}>
                    <Carousel
                        autoplay
                        effect="fade"
                        dots={true}
                        dotPosition="bottom"
                        autoplaySpeed={4000}
                    >
                        <div>
                            <div style={{
                                height: '300px',

                                borderRadius: '8px',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <img
                                    src={banner1}
                                    alt="Banner 1"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />

                            </div>
                        </div>
                        <div>
                            <div style={{
                                height: '300px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <img
                                    src={banner2}
                                    alt="Banner 2"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />

                            </div>
                        </div>
                        <div>
                            <div style={{
                                height: '300px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <img
                                    src={banner3}
                                    alt="Banner 3"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />

                            </div>
                        </div>

                    </Carousel>
                </Col>
            </Row>
            <div style={{
                marginBottom: 20,
                marginTop: 50,
                background: '#E8F4FD',
                borderRadius: 12,
                boxShadow: '0 4px 16px 0 rgba(24, 144, 255, 0.12)',
                padding: 24,
            }}>
                <Row justify="center" style={{ marginBottom: 20 }}>
                    <Col className="gutter-row" span={12} style={{ textAlign: 'center' }}>
                        <h1>Cơ sở y tế đặt khám</h1>
                    </Col>
                </Row>

                <Row justify="center">
                    <Col span={20} >
                        <Spin spinning={loadingHospital} tip="Đang tải cơ sở y tế...">
                            <Slider {...settings}>
                                {hospital.map((item, idx) => (
                                    <div key={idx}>
                                        <Card className="facility-card" hoverable onClick={() => navigate(`/hospital-detail/${item.id}`)}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: 20,
                                                height: 140
                                            }}>
                                                <img
                                                    src={item.image || imgErrorHospital}
                                                    alt="img is loading..."
                                                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div>
                                                <h3 style={{ whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center', height: 50, overflow: 'hidden' }}>
                                                    {item.name || "Cơ sở y tế"}
                                                    <CheckCircleFilled style={{ color: '#1890ff', marginLeft: 5 }} />
                                                </h3>
                                                <p style={{ whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center', height: 80, overflow: 'hidden' }}>
                                                    <EnvironmentOutlined /> {item.address || "Địa chỉ không xác định"}
                                                </p>
                                                <div style={{ marginBottom: 10 }}>
                                                    <span>(5) </span>
                                                    <Rate defaultValue={5} disabled style={{ fontSize: 16 }} />
                                                </div>
                                                <Button type="primary" block>
                                                    Đặt khám ngay
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                ))}


                            </Slider>
                        </Spin>
                    </Col>
                </Row>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 30 }}>
                    <Button
                        type="default"
                        className="see-all-btn"
                        onClick={() => navigate('/hospital-list')}
                    >
                        Xem tất cả
                    </Button>
                </div>

            </div>
            <Row justify="center" style={{ marginBottom: 20 }}>
                <Col className="gutter-row" span={12} style={{ textAlign: 'center' }}>
                    <h1>Chuyên khoa</h1>
                </Col>
            </Row>
            <Spin spinning={loadingSpecialization} tip="Đang tải chuyên khoa...">
                <Row gutter={[0, 30]} justify="center" style={{ width: '80%', margin: '0 auto' }}>

                    {specialization.slice(0, visibleCount).map((item, idx) => (
                        <SpecializationItem key={idx} item={item} />
                    ))}

                </Row>
            </Spin>
            <div style={{ marginTop: 24, justifyContent: 'center', display: 'flex', marginBottom: 100 }}>
                <span
                    style={{
                        color: "#1890ff",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: 18,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                    onClick={handleShowMore}
                >
                    {visibleCount < specialization.length ? "Xem thêm" : "Thu gọn"}
                </span>
            </div>

        </div >
        <ChatBot />
    </>
}
export default Home;