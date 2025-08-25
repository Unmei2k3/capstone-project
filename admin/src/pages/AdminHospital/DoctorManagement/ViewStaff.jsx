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
    LoadingOutlined,
    SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorDetail } from '../../../services/doctorService';
import { getUserById } from '../../../services/userService';

const { Title, Text } = Typography;

const ViewStaff = ({ 
    visible,
    onCancel,
    staff,
    apiSource,
    detailedData,
    staffType 
}) => {
    const [loading, setLoading] = useState(false);
    const [staffDetailData, setStaffDetailData] = useState(null);
    const [error, setError] = useState(null);
    
    // ✅ Enhanced staff type detection
    const getStaffType = () => {
        if (staffType) return staffType;
        if (staff?.type) return staff.type;
        if (staff?.role?.name) {
            const roleName = staff.role.name.toLowerCase();
            if (roleName.includes('doctor')) return 'doctor';
            if (roleName.includes('nurse')) return 'nurse';
            if (roleName.includes('hospital staff')) return 'hospital-staff';
        }
        return 'hospital-staff'; // Default fallback
    };

    const currentStaffType = getStaffType();

    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible && staff?.id) {
            fetchStaffDetail(staff.id);
        } else if (!visible) {
            setStaffDetailData(null);
            setError(null);
            setLoading(false);
        }
    }, [visible, staff?.id]);

    const fetchStaffDetail = async (staffId) => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Đang tải chi tiết nhân viên ID:', staffId, 'Loại:', currentStaffType);

            let detailData;

            // ✅ Enhanced API handling for different staff types
            if (currentStaffType === 'doctor') {
                detailData = await getDoctorDetail(staffId);
                console.log('📥 Nhận dữ liệu bác sĩ:', detailData);
            } else if (currentStaffType === 'nurse') {
                const response = await getUserById(staffId);
                console.log('📥 Nhận dữ liệu y tá:', response);

                if (response) {
                    detailData = {
                        id: response.id,
                        type: 'nurse',
                        status: response.active ? 'active' : 'inactive',
                        user: response,
                        specializations: [],
                        hospitalAffiliations: response.hospitals || [],
                        experience: response.experience || null,
                        practicingFrom: response.practicingFrom || null,
                        description: response.description || null,
                        rating: response.rating || null,
                        totalPatients: response.totalPatients || 0,
                        schedule: response.schedule || null
                    };
                }
            } else if (currentStaffType === 'hospital-staff') {
                // ✅ Handle hospital staff using getUserById
                const response = await getUserById(staffId);
                console.log('📥 Nhận dữ liệu nhân viên bệnh viện:', response);

                if (response) {
                    detailData = {
                        id: response.id,
                        type: 'hospital-staff',
                        status: response.active ? 'active' : 'inactive',
                        user: response,
                        specializations: [], // Hospital staff typically don't have specializations
                        hospitalAffiliations: response.hospitals || [],
                        experience: response.experience || null,
                        practicingFrom: response.practicingFrom || null,
                        description: response.description || response.job || null,
                        rating: response.rating || null,
                        totalPatients: 0, // Hospital staff don't treat patients directly
                        schedule: response.schedule || null,
                        role: response.role
                    };
                }
            } else {
                throw new Error(`Không hỗ trợ loại nhân viên: ${currentStaffType}`);
            }

            setStaffDetailData(detailData);
        } catch (error) {
            console.error('❌ Lỗi khi tải chi tiết nhân viên:', error);
            
            let staffTypeText = 'nhân viên';
            switch (currentStaffType) {
                case 'doctor':
                    staffTypeText = 'bác sĩ';
                    break;
                case 'nurse':
                    staffTypeText = 'y tá';
                    break;
                case 'hospital-staff':
                    staffTypeText = 'nhân viên bệnh viện';
                    break;
            }
            
            setError(`Không thể tải thông tin chi tiết ${staffTypeText}. Vui lòng thử lại.`);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Enhanced staff type configuration
    const getStaffTypeConfig = (type) => {
        const typeConfigs = {
            doctor: {
                title: 'Thông tin Bác sĩ',
                icon: <MedicineBoxOutlined />,
                color: '#1890ff',
                text: 'Bác sĩ',
                loadingText: 'Đang tải thông tin bác sĩ...',
                codeLabel: 'Mã bác sĩ'
            },
            nurse: {
                title: 'Thông tin Y tá',
                icon: <HeartOutlined />,
                color: '#52c41a',
                text: 'Y tá',
                loadingText: 'Đang tải thông tin y tá...',
                codeLabel: 'Mã y tá'
            },
            'hospital-staff': {
                title: 'Thông tin Nhân viên Bệnh viện',
                icon: <SettingOutlined />,
                color: '#fa8c16',
                text: 'Nhân viên Bệnh viện',
                loadingText: 'Đang tải thông tin nhân viên...',
                codeLabel: 'Mã nhân viên'
            }
        };

        return typeConfigs[type] || typeConfigs['hospital-staff'];
    };

    const config = getStaffTypeConfig(currentStaffType);

    // Early return for no staff
    if (!staff || !visible) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: config.color, marginRight: 8 }}>
                            {config.icon}
                        </span>
                        <span style={{ color: config.color }}>{config.title}</span>
                    </div>
                }
                open={visible}
                onCancel={onCancel}
                footer={null}
                width={900}
                destroyOnClose
            >
                {apiSource && (
                    <div style={{
                        background: '#f0f0f0',
                        padding: 8,
                        borderRadius: 4,
                        marginBottom: 16,
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <strong>Nguồn dữ liệu:</strong> {apiSource} |
                        <strong> Loại nhân viên:</strong> {currentStaffType} |
                        <strong> Có dữ liệu chi tiết:</strong> {detailedData ? 'Có' : 'Không'}
                    </div>
                )}
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
                        {config.loadingText}
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
                        <span>{config.title}</span>
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
                            onClick={() => fetchStaffDetail(staff.id)}
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
    if (!staffDetailData) {
        return (
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>{config.title}</span>
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
    const staffData = staffDetailData;
    const user = staffData.user || {};
    const hospitalAffiliations = staffData.hospitalAffiliations || [];
    const specializations = staffData.specializations || [];

    console.log('📋 Sử dụng dữ liệu API:');
    console.log('- staffData:', staffData);
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

    const getStaffTypeDisplay = (type) => {
        const config = getStaffTypeConfig(type);
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
            console.error("Lỗi tính thời gian hành nghề:", error);
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
                        Liên kết Bệnh viện
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
                    Liên kết Bệnh viện ({hospitalAffiliations.length})
                </Title>

                <List
                    dataSource={hospitalAffiliations}
                    renderItem={(hospital, index) => (
                        <List.Item key={hospital.id || index}>
                            <Card
                                size="small"
                                style={{ width: '100%', marginBottom: 8 }}
                                title={
                                    <Space>
                                        <BankOutlined style={{ color: '#1890ff' }} />
                                        <Text strong>{hospital.name || 'Tên bệnh viện không xác định'}</Text>
                                    </Space>
                                }
                                extra={
                                    <Tag color="blue">
                                        Mã: {hospital.code || 'N/A'}
                                    </Tag>
                                }
                            >
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>ID Bệnh viện: </Text>
                                        <Text code>{hospital.id}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Địa chỉ: </Text>
                                        <Text type="secondary">
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                                            {hospital.address || 'Chưa cập nhật địa chỉ'}
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            </>
        );
    };

    const renderSpecializations = () => {
        // ✅ Only show specializations for doctors
        if (currentStaffType !== 'doctor') {
            return null;
        }

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
                                                    console.log("Ảnh tải thất bại:", spec.image);
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

    // ✅ Enhanced role display
    const renderRoleInfo = () => {
        if (!staffData.role) return null;

        return (
            <div style={{
                marginTop: 12,
                padding: '8px 12px',
                backgroundColor: '#f0f7ff',
                borderRadius: '4px',
                border: '1px solid #d6e4ff'
            }}>
                <Text style={{ fontSize: '13px', color: '#1890ff' }}>
                    👤 <strong>Vai trò:</strong> {staffData.role.name}
                </Text>
                {staffData.role.roleType && (
                    <Text style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '4px' }}>
                        Loại vai trò: {staffData.role.roleType}
                    </Text>
                )}
            </div>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span>{config.title} - {user.fullname || 'Không rõ'}</span>
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
                            {getStaffTypeDisplay(staffData.type || currentStaffType)}
                        </div>
                        {/* ✅ Role info */}
                        {renderRoleInfo()}
                    </Col>
                    <Col span={18}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Trạng thái: </Text>
                                        {getStatusTag(staffData.status || 'active')}
                                    </div>
                                    <div>
                                        <Text strong>{config.codeLabel}: </Text>
                                        <Text code>{staffData?.id || 'N/A'}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Kinh nghiệm: </Text>
                                        <Text>{staffData.experience || getPracticingDuration(staffData?.practicingFrom)}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    {currentStaffType === 'doctor' && (
                                        <div>
                                            <Text strong>Số chuyên khoa: </Text>
                                            <Tag color="purple">{specializations?.length || 0}</Tag>
                                        </div>
                                    )}
                                    <div>
                                        <Text strong>Số bệnh viện: </Text>
                                        <Tag color="blue">{hospitalAffiliations?.length || 0}</Tag>
                                    </div>
                                    {currentStaffType === 'doctor' && (
                                        <div>
                                            <Text strong>Tổng bệnh nhân: </Text>
                                            <Tag color="green">{staffData.totalPatients || 0}</Tag>
                                        </div>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Divider />

                {/* Personal Information */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Thông tin Cá nhân
                </Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên" span={2}>
                        {user.fullname || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên đăng nhập">
                        <Text code>{user.userName || 'Chưa cập nhật'}</Text>
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
                    <Descriptions.Item label="Công việc" span={2}>
                        <Text>{user.job || 'Chưa cập nhật'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                        <Text>
                            {[user.streetAddress, user.ward, user.province]
                                .filter(Boolean)
                                .join(', ') || 'Chưa cập nhật'}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>

                {/* ✅ Professional Information - Only for doctors and nurses */}
                {(currentStaffType === 'doctor' || currentStaffType === 'nurse') && (
                    <>
                        <Divider />
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <MedicineBoxOutlined style={{ marginRight: 8 }} />
                            Thông tin Nghề nghiệp
                        </Title>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Mô tả" span={2}>
                                {staffData?.description || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bắt đầu hành nghề">
                                <Space>
                                    <CalendarOutlined />
                                    {staffData?.practicingFrom
                                        ? dayjs(staffData.practicingFrom).format('DD/MM/YYYY')
                                        : 'Chưa cập nhật'
                                    }
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian hành nghề">
                                <Text strong>{staffData.experience || getPracticingDuration(staffData?.practicingFrom)}</Text>
                            </Descriptions.Item>
                            {currentStaffType === 'doctor' && (
                                <Descriptions.Item label="Phí tư vấn">
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {staffData.consultationFee ? `${Number(staffData.consultationFee).toLocaleString()} VNĐ` : 'Chưa cập nhật'}
                                    </Text>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Đánh giá">
                                <Space>
                                    <Text strong>{staffData.rating || 'N/A'}</Text>
                                    <Text type="secondary">/ 5.0</Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lịch làm việc" span={2}>
                                <Text>{staffData.schedule || 'Chưa cập nhật'}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}

                {/* Hospital Affiliations */}
                {renderHospitalAffiliations()}

                {/* Specializations - Only show for doctors */}
                {renderSpecializations()}

                {/* Account Information */}
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>
                    <SettingOutlined style={{ marginRight: 8 }} />
                    Thông tin Tài khoản
                </Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Trạng thái tài khoản">
                        {user.active ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>Đã kích hoạt</Tag>
                        ) : (
                            <Tag color="red" icon={<CloseCircleOutlined />}>Chưa kích hoạt</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Xác thực email">
                        {user.isVerifiedEmail ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                        ) : (
                            <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa xác thực</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Xác thực số điện thoại">
                        {user.isVerifiedPhone ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                        ) : (
                            <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa xác thực</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lần đăng nhập cuối">
                        <Space>
                            <ClockCircleOutlined />
                            {user.lastLogin ? dayjs(user.lastLogin).format('DD/MM/YYYY HH:mm') : 'Chưa từng đăng nhập'}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp đăng ký" span={2}>
                        <Text>{user.registerProvider || 'Hệ thống nội bộ'}</Text>
                    </Descriptions.Item>
                </Descriptions>

                {/* Bio Section */}
                {staffData?.description && (
                    <>
                        <Divider />
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <BookOutlined style={{ marginRight: 8 }} />
                            Mô tả Chi tiết
                        </Title>
                        <div style={{
                            background: '#f6f8fa',
                            padding: 16,
                            borderRadius: 8,
                            border: '1px solid #e1e4e8'
                        }}>
                            <Text>{staffData.description}</Text>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ViewStaff;