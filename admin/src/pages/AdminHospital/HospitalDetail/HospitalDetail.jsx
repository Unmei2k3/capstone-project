import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Card,
    Row,
    Col,
    Button,
    Tag,
    Avatar,
    Statistic,
    Descriptions,
    Spin,
    message,
    Typography,
    Space,
    Rate,
    Badge,
    Table,
    Tooltip,
    Modal,
    Form,
    TimePicker,
    Switch
} from 'antd';
import {
    EditOutlined,
    PhoneOutlined,
    MailOutlined,
    GlobalOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    TeamOutlined,
    BankOutlined,
    SafetyOutlined,
    StarOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
    getHospitalById,
    getHospitalWorkingDates,
    createHospitalWorkingDates,
    updateHospitalWorkingDates
} from '../../../services/hospitalService';
import { setMessage } from '../../../redux/slices/messageSlice';
import EditHospital from './EditHospitalDetail';
import './HospitalDetail.scss';

const { Title, Text } = Typography;

const MyHospital = () => {
    const [hospital, setHospital] = useState(null);
    const [workingDates, setWorkingDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [workingScheduleModalVisible, setWorkingScheduleModalVisible] = useState(false);
    const [workingScheduleForm] = Form.useForm();

    const user = useSelector((state) => state.user?.user);
    const dispatch = useDispatch();

    // Get hospital ID from user data
    const hospitalId = user?.hospitals?.[0]?.id;

    useEffect(() => {
        if (hospitalId) {
            fetchHospitalDetail();
            fetchWorkingDates();
        }
    }, [hospitalId]);

    const fetchHospitalDetail = async () => {
        setLoading(true);
        try {
            console.log('🏥 Fetching hospital detail for ID:', hospitalId);
            const response = await getHospitalById(hospitalId);
            console.log('✅ Hospital detail response:', response);

            // ✅ Extract data from API response structure
            const hospitalData = response.result || response;
            setHospital(hospitalData);

            dispatch(setMessage({
                type: 'success',
                content: 'Hospital information loaded successfully',
                duration: 3
            }));
        } catch (error) {
            console.error('❌ Error fetching hospital detail:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Failed to load hospital information',
                duration: 4
            }));
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkingDates = async () => {
        try {
            console.log('📅 Fetching working dates for hospital ID:', hospitalId);
            const response = await getHospitalWorkingDates(hospitalId);
            console.log('✅ Working dates response:', response);

            const workingDatesData = response.workingDates || response || [];
            setWorkingDates(workingDatesData);
        } catch (error) {
            console.error('❌ Error fetching working dates:', error);
            setWorkingDates([]);
        }
    };

    const handleEditSuccess = (updatedHospital) => {
        setHospital(updatedHospital);
        setEditModalVisible(false);
        dispatch(setMessage({
            type: 'success',
            content: 'Hospital information updated successfully',
            duration: 4
        }));
        // Refresh data
        fetchHospitalDetail();
    };

    // Default working dates structure
    const getDefaultWorkingDates = () => [
        { dayOfWeek: 0, dayOfWeekName: "Chủ Nhật", startTime: "00:00:00", endTime: "00:00:00", isClosed: true },
        { dayOfWeek: 1, dayOfWeekName: "Thứ Hai", startTime: "08:00:00", endTime: "17:00:00", isClosed: false },
        { dayOfWeek: 2, dayOfWeekName: "Thứ Ba", startTime: "08:00:00", endTime: "17:00:00", isClosed: false },
        { dayOfWeek: 3, dayOfWeekName: "Thứ Tư", startTime: "08:00:00", endTime: "17:00:00", isClosed: false },
        { dayOfWeek: 4, dayOfWeekName: "Thứ Năm", startTime: "08:00:00", endTime: "17:00:00", isClosed: false },
        { dayOfWeek: 5, dayOfWeekName: "Thứ Sáu", startTime: "08:00:00", endTime: "17:00:00", isClosed: false },
        { dayOfWeek: 6, dayOfWeekName: "Thứ Bảy", startTime: "00:00:00", endTime: "00:00:00", isClosed: true }
    ];

    // Handle opening working schedule modal
    const handleOpenWorkingScheduleModal = () => {
        const dataToEdit = workingDates.length > 0 ? workingDates : getDefaultWorkingDates();

        // Convert time strings to dayjs objects for TimePicker
        const formData = {};
        dataToEdit.forEach(day => {
            formData[`day_${day.dayOfWeek}_isClosed`] = day.isClosed;
            if (!day.isClosed && day.startTime !== "00:00:00") {
                formData[`day_${day.dayOfWeek}_startTime`] = dayjs(day.startTime, 'HH:mm:ss');
            }
            if (!day.isClosed && day.endTime !== "00:00:00") {
                formData[`day_${day.dayOfWeek}_endTime`] = dayjs(day.endTime, 'HH:mm:ss');
            }
        });

        workingScheduleForm.setFieldsValue(formData);
        setWorkingScheduleModalVisible(true);
    };

    // Handle working schedule form submission
    const handleWorkingScheduleSubmit = async () => {
        try {
            const values = await workingScheduleForm.validateFields();

            const workingDatesPayload = getDefaultWorkingDates().map(day => {
                const isClosed = values[`day_${day.dayOfWeek}_isClosed`] || false;
                const startTime = values[`day_${day.dayOfWeek}_startTime`];
                const endTime = values[`day_${day.dayOfWeek}_endTime`];

                return {
                    dayOfWeek: day.dayOfWeek,
                    dayOfWeekName: day.dayOfWeekName,
                    startTime: isClosed ? "00:00:00" : (startTime ? startTime.format('HH:mm:ss') : "08:00:00"),
                    endTime: isClosed ? "00:00:00" : (endTime ? endTime.format('HH:mm:ss') : "17:00:00"),
                    isClosed
                };
            });

            // Determine whether to create or update
            const isUpdate = workingDates.length > 0;

            if (isUpdate) {
                await updateHospitalWorkingDates(hospitalId, { workingDates: workingDatesPayload });
                dispatch(setMessage({
                    type: 'success',
                    content: 'Lịch làm việc đã được cập nhật thành công',
                    duration: 4
                }));
            } else {
                await createHospitalWorkingDates(hospitalId, { workingDates: workingDatesPayload });
                dispatch(setMessage({
                    type: 'success',
                    content: 'Lịch làm việc đã được tạo thành công',
                    duration: 4
                }));
            }

            setWorkingScheduleModalVisible(false);
            fetchWorkingDates(); // Refresh working dates data

        } catch (error) {
            console.error('❌ Error saving working schedule:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Có lỗi xảy ra khi lưu lịch làm việc',
                duration: 4
            }));
        }
    };

    const getHospitalType = (type) => {
        switch (type) {
            case 1: return 'Bệnh viện Đa khoa';
            case 2: return 'Bệnh viện Chuyên khoa';
            case 3: return 'Bệnh viện Cộng đồng';
            default: return 'Bệnh viện';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 1: return 'blue';
            case 2: return 'purple';
            case 3: return 'green';
            default: return 'default';
        }
    };

    // ✅ Format time from API response
    const formatTime = (timeString) => {
        if (!timeString) return 'Chưa có thông tin';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return 'Chưa có thông tin';
        }
    };

    // ✅ Format working schedule time
    const formatScheduleTime = (timeString) => {
        if (!timeString || timeString === "00:00:00") return "";
        try {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        } catch (error) {
            return "";
        }
    };

    // ✅ Get working day status
    const getWorkingDayStatus = (workingDay) => {
        if (workingDay.isClosed) {
            return <Tag color="red">Đóng cửa</Tag>;
        }
        return (
            <Tag color="green">
                {formatScheduleTime(workingDay.startTime)} - {formatScheduleTime(workingDay.endTime)}
            </Tag>
        );
    };

    // ✅ Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // ✅ Services table columns
    const serviceColumns = [
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Tag color="green" icon={<DollarOutlined />}>
                    {formatCurrency(price)}
                </Tag>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: false,
            },
            render: (description) => (
                <Tooltip placement="topLeft" title={description}>
                    {description}
                </Tooltip>
            ),
        }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!hospital) {
        return (
            <Card style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary">Không có thông tin bệnh viện</Text>
            </Card>
        );
    }

    return (
        <div className="hospital-detail-container">
            {/* Header Section */}
            <Card className="hospital-header-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar
                            size={80}
                            src={hospital.image}
                            icon={<BankOutlined />}
                            style={{
                                backgroundColor: '#1890ff',
                                marginRight: 24
                            }}
                        />
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                {hospital.name}
                            </Title>
                            <Space style={{ marginTop: 8 }}>
                                <Tag color={getTypeColor(hospital.type)} icon={<MedicineBoxOutlined />}>
                                    {getHospitalType(hospital.type)}
                                </Tag>
                                <Tag color="green" icon={<SafetyOutlined />}>
                                    Đang hoạt động
                                </Tag>
                                {hospital.code && (
                                    <Tag color="default">Mã: {hospital.code}</Tag>
                                )}
                            </Space>
                            <div style={{ marginTop: 8 }}>
                                <Space>
                                    <ClockCircleOutlined />
                                    <Text>
                                        {formatTime(hospital.openTime)} - {formatTime(hospital.closeTime)}
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setEditModalVisible(true)}
                    >
                        Chỉnh sửa Bệnh viện
                    </Button>
                </div>
            </Card>

            {/* Statistics Section */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng dịch vụ"
                            value={hospital.services?.length || 0}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="ID Bệnh viện"
                            value={hospital.id}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Loại bệnh viện"
                            value={hospital.type}
                            prefix={<SafetyOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Giá trung bình"
                            value={hospital.services?.length > 0 ?
                                (hospital.services.reduce((sum, service) => sum + service.price, 0) / hospital.services.length).toFixed(0) : 0
                            }
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Information */}
            <Row gutter={16}>
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <HomeOutlined />
                                Thông tin bệnh viện
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Tên bệnh viện">
                                {hospital.name}
                            </Descriptions.Item>

                            <Descriptions.Item label="ID Bệnh viện">
                                <Text code>{hospital.id}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã bệnh viện">
                                <Text code>{hospital.code}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Loại hình">
                                <Tag color={getTypeColor(hospital.type)}>
                                    {getHospitalType(hospital.type)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Badge status="success" text="Hoạt động" />
                            </Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ">
                                <Space>
                                    <EnvironmentOutlined />
                                    <Text copyable>{hospital.address}</Text>
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giờ hoạt động">
                                <Space>
                                    <ClockCircleOutlined />
                                    <Text>
                                        {formatTime(hospital.openTime)} - {formatTime(hospital.closeTime)}
                                    </Text>
                                </Space>
                            </Descriptions.Item>

                            {hospital.phoneNumber && (
                                <Descriptions.Item label="Số điện thoại">
                                    <Space>
                                        <PhoneOutlined />
                                        <Text copyable>{hospital.phoneNumber}</Text>
                                    </Space>
                                </Descriptions.Item>
                            )}

                            {hospital.email && (
                                <Descriptions.Item label="Email">
                                    <Space>
                                        <MailOutlined />
                                        <Text copyable>{hospital.email}</Text>
                                    </Space>
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="Vị trí">
                                <Space>
                                    <EnvironmentOutlined />
                                    <Text>
                                        Lat: {hospital.latitude}, Long: {hospital.longitude}
                                    </Text>
                                    {hospital.googleMapUri && (
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={() => window.open(hospital.googleMapUri, '_blank')}
                                        >
                                            Xem trên Google Maps
                                        </Button>
                                    )}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Services Section */}
                    <Card
                        title={
                            <Space>
                                <MedicineBoxOutlined />
                                Dịch vụ bệnh viện ({hospital.services?.length || 0})
                            </Space>
                        }
                    >
                        <Table
                            dataSource={hospital.services || []}
                            columns={serviceColumns}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} trong ${total} dịch vụ`,
                            }}
                            scroll={{ x: 400 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Admin Information */}
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                Quản trị viên
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={64}
                                src={user?.avatarUrl}
                                icon={<UserOutlined />}
                            />
                            <div style={{ marginTop: 16 }}>
                                <Title level={4} style={{ margin: 0 }}>
                                    {user?.fullname || 'Quản trị viên bệnh viện'}
                                </Title>
                                <Text type="secondary">Quản trị viên bệnh viện</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Text copyable>
                                        {user?.email || 'admin@hospital.com'}
                                    </Text>
                                </div>
                                {user?.phoneNumber && (
                                    <div style={{ marginTop: 4 }}>
                                        <Text copyable>
                                            {user.phoneNumber}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Working Schedule Section */}
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined />
                                Lịch làm việc
                            </Space>
                        }
                        extra={
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={handleOpenWorkingScheduleModal}
                            >
                                {workingDates.length > 0 ? 'Sửa lịch' : 'Tạo lịch'}
                            </Button>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        {workingDates.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {workingDates.map((workingDay) => (
                                    <div
                                        key={workingDay.dayOfWeek}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <Text strong style={{ minWidth: '80px' }}>
                                            {workingDay.dayOfWeekName}
                                        </Text>
                                        <div>
                                            {getWorkingDayStatus(workingDay)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Text type="secondary">Chưa có thông tin lịch làm việc</Text>
                            </div>
                        )}
                    </Card>

                    {/* Quick Stats */}
                    <Card
                        title={
                            <Space>
                                <InfoCircleOutlined />
                                Thống kê nhanh
                            </Space>
                        }
                    >
                        <div style={{ textAlign: 'center' }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Dịch vụ"
                                        value={hospital.services?.length || 0}
                                        valueStyle={{ fontSize: 20, color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="ID Bệnh viện"
                                        value={hospital.id}
                                        valueStyle={{ fontSize: 20, color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                            <div style={{ marginTop: 16, padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Bệnh viện đã được thành lập và đang hoạt động
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Edit Modal */}
            <EditHospital
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onSuccess={handleEditSuccess}
                hospital={hospital}
            />

            {/* Working Schedule Modal */}
            <Modal
                title={
                    <Space>
                        <ClockCircleOutlined />
                        {workingDates.length > 0 ? 'Sửa lịch làm việc' : 'Tạo lịch làm việc mới'}
                    </Space>
                }
                open={workingScheduleModalVisible}
                onCancel={() => setWorkingScheduleModalVisible(false)}
                onOk={handleWorkingScheduleSubmit}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={workingScheduleForm}
                    layout="vertical"
                >
                    {getDefaultWorkingDates().map((day) => (
                        <Card
                            key={day.dayOfWeek}
                            size="small"
                            style={{ marginBottom: 16 }}
                            title={<Text strong>{day.dayOfWeekName}</Text>}
                        >
                            <Row gutter={16} align="middle">
                                <Col span={6}>
                                    <Form.Item
                                        name={`day_${day.dayOfWeek}_isClosed`}
                                        label="Đóng cửa"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={9}>
                                    <Form.Item
                                        name={`day_${day.dayOfWeek}_startTime`}
                                        label="Giờ mở cửa"
                                        dependencies={[`day_${day.dayOfWeek}_isClosed`]}
                                    >
                                        <TimePicker
                                            format="HH:mm"
                                            placeholder="Chọn giờ mở"
                                            style={{ width: '100%' }}
                                            disabled={
                                                workingScheduleForm.getFieldValue(`day_${day.dayOfWeek}_isClosed`)
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={9}>
                                    <Form.Item
                                        name={`day_${day.dayOfWeek}_endTime`}
                                        label="Giờ đóng cửa"
                                        dependencies={[`day_${day.dayOfWeek}_isClosed`]}
                                    >
                                        <TimePicker
                                            format="HH:mm"
                                            placeholder="Chọn giờ đóng"
                                            style={{ width: '100%' }}
                                            disabled={
                                                workingScheduleForm.getFieldValue(`day_${day.dayOfWeek}_isClosed`)
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default MyHospital;