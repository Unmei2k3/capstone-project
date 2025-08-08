import React, { useState, useEffect } from 'react';
import {
    Modal,
    Descriptions,
    Avatar,
    Row,
    Col,
    Tag,
    Divider,
    Space,
    Typography,
    Card,
    List,
    Alert,
    Empty,
    Spin
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    HeartOutlined,
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BankOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorDetail } from '../../../services/doctorService';

const { Title, Text } = Typography;

const ViewStaff = ({ visible, onCancel, staff }) => {
    const [loading, setLoading] = useState(false);
    const [doctorDetailData, setDoctorDetailData] = useState(null);
    const [error, setError] = useState(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible && staff?.id) {
            fetchDoctorDetail(staff.id);
        } else if (!visible) {
            // Reset state when modal closes
            setDoctorDetailData(null);
            setError(null);
            setLoading(false);
        }
    }, [visible, staff?.id]);

    const fetchDoctorDetail = async (doctorId) => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔍 Fetching doctor detail for ID:', doctorId);
            const detailData = await getDoctorDetail(doctorId);
            console.log('📥 Received doctor detail:', detailData);
            
            setDoctorDetailData(detailData);
        } catch (error) {
            console.error('❌ Error fetching doctor detail:', error);
            setError('Không thể tải thông tin chi tiết bác sĩ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Early return for no staff
    if (!staff || !visible) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Thông tin bác sĩ</span>
                    </Space>
                }
                open={visible}
                onCancel={onCancel}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    padding: '80px 0' 
                }}>
                    <Spin 
                        size="large" 
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} />}
                    />
                    <div style={{ marginLeft: 16, fontSize: 16 }}>
                        Đang tải thông tin bác sĩ...
                    </div>
                </div>
            </Modal>
        );
    }

    // Error state
    if (error) {
        return (
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Thông tin bác sĩ</span>
                    </Space>
                }
                open={visible}
                onCancel={onCancel}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
            >
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <button 
                            onClick={() => fetchDoctorDetail(staff.id)}
                            style={{
                                background: '#1890ff',
                                color: 'white',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Thử lại
                        </button>
                    }
                />
            </Modal>
        );
    }

    // No data state
    if (!doctorDetailData) {
        return (
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Thông tin bác sĩ</span>
                    </Space>
                }
                open={visible}
                onCancel={onCancel}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
            >
                <Empty 
                    description="Không có dữ liệu để hiển thị"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </Modal>
        );
    }

    // Extract data from API response
    const doctorData = doctorDetailData;
    const user = doctorData.user || {};
    const hospitalAffiliations = doctorData.hospitalAffiliations || [];
    const specializations = doctorData.specializations || [];

    console.log('📋 Using API data:');
    console.log('- doctorData:', doctorData);
    console.log('- user:', user);
    console.log('- hospitalAffiliations:', hospitalAffiliations);
    console.log('- specializations:', specializations);

    const getStatusTag = (status) => {
        const statusConfig = {
            active: { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoạt động' },
            inactive: { color: 'red', icon: <CloseCircleOutlined />, text: 'Không hoạt động' },
            pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ duyệt' }
        };

        const config = statusConfig[status] || statusConfig.active;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const getGenderText = (gender) => {
        if (typeof gender === 'boolean') {
            return gender ? '👨 Nam' : '👩 Nữ';
        }
        if (typeof gender === 'string') {
            return gender.toLowerCase() === 'male' ? '👨 Nam' : '👩 Nữ';
        }
        return '❓ Chưa xác định';
    };

    const getStaffTypeText = (type) => {
        const typeConfig = {
            doctor: { text: 'Bác sĩ', icon: <MedicineBoxOutlined />, color: '#1890ff' },
            nurse: { text: 'Y tá', icon: <HeartOutlined />, color: '#52c41a' }
        };

        const config = typeConfig[type] || typeConfig.doctor;
        return (
            <Space>
                <span style={{ color: config.color }}>{config.icon}</span>
                <Text strong style={{ color: config.color }}>{config.text}</Text>
            </Space>
        );
    };

    const getPracticingDuration = (practicingFrom) => {
        if (!practicingFrom) return 'Chưa cập nhật';
        
        try {
            const startDate = dayjs(practicingFrom);
            const now = dayjs();
            const years = now.diff(startDate, 'year');
            const months = now.diff(startDate, 'month') % 12;
            
            return `${years} năm ${months} tháng`;
        } catch (error) {
            console.error("Error calculating practicing duration:", error);
            return 'Không thể tính toán';
        }
    };

    const renderHospitalAffiliations = () => {
        if (!hospitalAffiliations || hospitalAffiliations.length === 0) {
            return (
                <>
                    <Divider />
                    <Title level={5} style={{ marginBottom: 16 }}>
                        <BankOutlined style={{ marginRight: 8 }} />
                        Liên kết bệnh viện & Khoa làm việc
                    </Title>
                    <div style={{ 
                        textAlign: 'center', 
                        padding: 40, 
                        color: '#999',
                        background: '#f9f9f9',
                        borderRadius: 8
                    }}>
                        <Text type="secondary">Chưa có thông tin liên kết bệnh viện</Text>
                    </div>
                </>
            );
        }

        return (
            <>
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>
                    <BankOutlined style={{ marginRight: 8 }} />
                    Liên kết bệnh viện & Khoa làm việc ({hospitalAffiliations.length})
                </Title>
                
                <List
                    dataSource={hospitalAffiliations}
                    renderItem={(affiliation, index) => (
                        <List.Item key={affiliation.id || index}>
                            <Card 
                                size="small" 
                                style={{ width: '100%', marginBottom: 8 }}
                                title={
                                    <Space>
                                        <BankOutlined style={{ color: '#1890ff' }} />
                                        <Text strong>{affiliation.hospital?.name || 'Tên bệnh viện không xác định'}</Text>
                                    </Space>
                                }
                                extra={
                                    <Tag color="blue" icon={<TeamOutlined />}>
                                        {affiliation.departmentName || 'Khoa không xác định'}
                                    </Tag>
                                }
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Space direction="vertical" size={4}>
                                            <div>
                                                <Text strong>Vị trí: </Text>
                                                <Tag color="green">{affiliation.position || 'Chưa xác định'}</Tag>
                                            </div>
                                            <div>
                                                <Text strong>Khoa: </Text>
                                                <Text>{affiliation.departmentName || 'Chưa xác định'}</Text>
                                            </div>
                                            <div>
                                                <Text strong>Địa chỉ: </Text>
                                                <Text type="secondary">
                                                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                                                    {affiliation.hospital?.address || 'Chưa cập nhật địa chỉ'}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>
                                    <Col span={12}>
                                        <Space direction="vertical" size={4}>
                                            <div>
                                                <Text strong>Bắt đầu hợp đồng: </Text>
                                                <Text>
                                                    {affiliation.contractStart 
                                                        ? dayjs(affiliation.contractStart).format('DD/MM/YYYY')
                                                        : 'Chưa xác định'
                                                    }
                                                </Text>
                                            </div>
                                            <div>
                                                <Text strong>Kết thúc hợp đồng: </Text>
                                                <Text>
                                                    {affiliation.contractEnd 
                                                        ? dayjs(affiliation.contractEnd).format('DD/MM/YYYY')
                                                        : 'Chưa xác định'
                                                    }
                                                </Text>
                                            </div>
                                            <div>
                                                <Text strong>Thời hạn còn lại: </Text>
                                                <Text type="secondary">
                                                    {affiliation.contractEnd
                                                        ? `${Math.max(0, dayjs(affiliation.contractEnd).diff(dayjs(), 'month'))} tháng`
                                                        : 'Chưa xác định'
                                                    }
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        </List.Item>
                    )}
                />
            </>
        );
    };

    const renderSpecializations = () => {
        if (!specializations || specializations.length === 0) {
            return (
                <>
                    <Divider />
                    <Title level={5} style={{ marginBottom: 16 }}>
                        <MedicineBoxOutlined style={{ marginRight: 8 }} />
                        Chuyên khoa
                    </Title>
                    <div style={{ 
                        textAlign: 'center', 
                        padding: 40, 
                        color: '#999',
                        background: '#f9f9f9',
                        borderRadius: 8
                    }}>
                        <Text type="secondary">Chưa có thông tin chuyên khoa</Text>
                    </div>
                </>
            );
        }

        return (
            <>
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Chuyên khoa ({specializations.length})
                </Title>
                
                <Row gutter={[16, 16]}>
                    {specializations.map((spec, index) => (
                        <Col xs={24} sm={12} md={8} key={spec.id || index}>
                            <Card 
                                size="small"
                                hoverable
                                cover={
                                    spec.image ? (
                                        <div style={{ height: 120, overflow: 'hidden' }}>
                                            <img
                                                alt={spec.name || 'Chuyên khoa'}
                                                src={spec.image}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover' 
                                                }}
                                                onError={(e) => {
                                                    console.log("Image failed to load:", spec.image);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            height: 120, 
                                            background: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <MedicineBoxOutlined style={{ fontSize: 40, color: '#ccc' }} />
                                        </div>
                                    )
                                }
                                style={{ textAlign: 'center' }}
                            >
                                <Card.Meta
                                    title={
                                        <Text strong style={{ fontSize: '14px' }}>
                                            {spec.name || 'Chuyên khoa không xác định'}
                                        </Text>
                                    }
                                    description={
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {spec.description || 'Không có mô tả'}
                                        </Text>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>Thông tin bác sĩ - {user.fullname || 'Không rõ'}</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            destroyOnClose
            style={{ top: 20 }}
        >
            <div style={{ padding: '16px 0', maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Header Section */}
                <Row gutter={24} style={{ marginBottom: 24 }}>
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <Avatar
                            size={120}
                            src={user.avatarUrl}
                            icon={<UserOutlined />}
                            style={{ marginBottom: 16 }}
                        />
                        <div>
                            <Title level={4} style={{ marginBottom: 8 }}>
                                {user.fullname || 'Tên không xác định'}
                            </Title>
                            {getStaffTypeText(doctorData.type || 'doctor')}
                        </div>
                    </Col>
                    <Col span={18}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Trạng thái: </Text>
                                        {getStatusTag(doctorData.status || 'active')}
                                    </div>
                                    <div>
                                        <Text strong>Mã bác sĩ: </Text>
                                        <Text code>{doctorData?.id || 'N/A'}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Kinh nghiệm: </Text>
                                        <Text>{doctorData.experience || getPracticingDuration(doctorData?.practicingFrom)}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Số chuyên khoa: </Text>
                                        <Tag color="purple">{specializations?.length || 0}</Tag>
                                    </div>
                                    <div>
                                        <Text strong>Số bệnh viện: </Text>
                                        <Tag color="blue">{hospitalAffiliations?.length || 0}</Tag>
                                    </div>
                                    <div>
                                        <Text strong>Tổng bệnh nhân: </Text>
                                        <Tag color="green">{doctorData.totalPatients || 0}</Tag>
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Divider />

                {/* Personal Information */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Thông tin cá nhân
                </Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên" span={2}>
                        {user.fullname || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <Space>
                            <MailOutlined />
                            {user.email || 'Chưa cập nhật'}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        <Space>
                            <PhoneOutlined />
                            {user.phoneNumber || 'Chưa cập nhật'}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                        {getGenderText(user.gender)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        <Space>
                            <CalendarOutlined />
                            {user.dob ? dayjs(user.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="CCCD" span={2}>
                        <Text code>{user.cccd || 'Chưa cập nhật'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                        <Text>
                            {[user.streetAddress, user.ward, user.province]
                                .filter(Boolean)
                                .join(', ') || 'Chưa cập nhật'}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Professional Information */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Thông tin nghề nghiệp
                </Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Mô tả" span={2}>
                        {doctorData?.description || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bắt đầu hành nghề">
                        <Space>
                            <CalendarOutlined />
                            {doctorData?.practicingFrom 
                                ? dayjs(doctorData.practicingFrom).format('DD/MM/YYYY')
                                : 'Chưa cập nhật'
                            }
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian hành nghề">
                        <Text strong>{doctorData.experience || getPracticingDuration(doctorData?.practicingFrom)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phí tư vấn">
                        <Text strong style={{ color: '#52c41a' }}>
                            {doctorData.consultationFee ? `${Number(doctorData.consultationFee).toLocaleString()} VNĐ` : 'Chưa cập nhật'}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đánh giá">
                        <Space>
                            <Text strong>{doctorData.rating || 'N/A'}</Text>
                            <Text type="secondary">/ 5.0</Text>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Lịch làm việc" span={2}>
                        <Text>{doctorData.schedule || 'Chưa cập nhật'}</Text>
                    </Descriptions.Item>
                </Descriptions>

                {/* Hospital Affiliations & Departments */}
                {renderHospitalAffiliations()}

                {/* Specializations */}
                {renderSpecializations()}

                {/* Bio Section */}
                {doctorData?.description && (
                    <>
                        <Divider />
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <BookOutlined style={{ marginRight: 8 }} />
                            Mô tả chi tiết
                        </Title>
                        <div style={{ 
                            background: '#f6f8fa', 
                            padding: 16, 
                            borderRadius: 8,
                            border: '1px solid #e1e4e8'
                        }}>
                            <Text>{doctorData.description}</Text>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ViewStaff;