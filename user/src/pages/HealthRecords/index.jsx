import React, { useState, useEffect } from 'react';
import { Layout, Button, Card, Row, Col, Badge, Breadcrumb, Tooltip } from 'antd';
import { UserOutlined, CalendarOutlined, PhoneOutlined, InfoCircleOutlined, HomeOutlined, GlobalOutlined, BellOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './styles.scss';
import { useSelector } from 'react-redux';

const PatientRecords = () => {
    const { user } = useSelector((state) => state.user);
    const [patientRecords, setPatientRecords] = useState([
        {
            id: 1,
            name: user?.fullName || 'Trần Thành Đạt',
            dob: '25/06/2003',
            phone: '097****969',
            gender: 'Nam',
            address: 'Thành phố Hà Nội',
            ethnicity: 'Kinh'
        }
    ]);

    const [activeRecord, setActiveRecord] = useState(patientRecords[0]);

    // Mẫu dữ liệu phiếu khám
    const [medicalForms, setMedicalForms] = useState([
        {
            id: 1,
            patientId: 1,
            hospitalName: 'Bệnh viện Đa khoa XYZ',
            doctorName: 'Bs. Nguyễn Văn A',
            date: '12/06/2025',
            status: 'Đã khám',
            diagnosis: 'Viêm họng cấp'
        },
        {
            id: 2,
            patientId: 1,
            hospitalName: 'Phòng khám ABC',
            doctorName: 'Bs. Lê Thị B',
            date: '05/05/2025',
            status: 'Đã khám',
            diagnosis: 'Cảm cúm thông thường'
        }
    ]);

    return (
        <div className="patient-records-container">
            <div className="breadcrumb-section">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/"><HomeOutlined /> Trang chủ</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Hồ sơ bệnh nhân</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <div className="sidebar">


                        <div className="sidebar-menu">
                            <div className={`menu-item ${true ? 'active' : ''}`}>
                                <FileTextOutlined /> Hồ sơ bệnh nhân
                            </div>
                            <div className="menu-item">
                                <FileTextOutlined /> Phiếu khám bệnh
                            </div>
                            <div className="menu-item notification">
                                <BellOutlined /> Thông báo
                                <Badge count={99} className="notification-badge" />
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={18}>
                    <div className="patient-records">
                        <h2 className="section-title">Danh sách hồ sơ bệnh nhân</h2>

                        <Card
                            className="patient-card"
                            bordered={false}
                            actions={[
                                <Tooltip title="Chi tiết">
                                    <InfoCircleOutlined key="detail" />
                                </Tooltip>,
                                <Tooltip title="Chỉnh sửa">
                                    <EditOutlined key="edit" />
                                </Tooltip>,
                                <Tooltip title="Xóa hồ sơ">
                                    <DeleteOutlined key="delete" />
                                </Tooltip>,
                            ]}
                        >
                            <div className="patient-info">
                                <div className="patient-header">
                                    <h3>
                                        <UserOutlined className="icon" /> Họ và tên:
                                        <span className="highlight-text"> {activeRecord.name}</span>
                                    </h3>
                                </div>

                                <Row gutter={[16, 16]} className="patient-details">
                                    <Col xs={24} md={12}>
                                        <p>
                                            <CalendarOutlined className="icon" /> Ngày sinh:
                                            <span className="detail-text"> {activeRecord.dob}</span>
                                        </p>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <p>
                                            <PhoneOutlined className="icon" /> Số điện thoại:
                                            <span className="detail-text"> {activeRecord.phone}</span>
                                        </p>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <p>
                                            <InfoCircleOutlined className="icon" /> Giới tính:
                                            <span className="detail-text"> {activeRecord.gender}</span>
                                        </p>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <p>
                                            <HomeOutlined className="icon" /> Địa chỉ:
                                            <span className="detail-text"> {activeRecord.address}</span>
                                        </p>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <p>
                                            <GlobalOutlined className="icon" /> Dân tộc:
                                            <span className="detail-text"> {activeRecord.ethnicity}</span>
                                        </p>
                                    </Col>
                                </Row>

                                <div className="action-buttons">
                                    <Button type="primary" icon={<EditOutlined />}>
                                        Sửa hồ sơ
                                    </Button>
                                    <Button danger icon={<DeleteOutlined />}>
                                        Xóa hồ sơ
                                    </Button>
                                    <Button type="default" icon={<InfoCircleOutlined />}>
                                        Chi tiết
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default PatientRecords;
