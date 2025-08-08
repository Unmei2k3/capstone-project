import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Table,
    Tag,
    Button,
    Card,
    DatePicker,
    Space,
    Breadcrumb,
    Empty
} from 'antd';
import {
    FileTextOutlined,
    CalendarOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import BookingDetailDrawer from './BookingDetailDrawer';
import { useSelector } from 'react-redux';
import './BookingHistory.scss';

const { Title } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

const BookingHistoryPage = () => {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { user } = useSelector((state) => state.user);

    // Fetch bookings on initial load
    useEffect(() => {
        fetchBookings();
    }, []);

    // Apply filters when dateRange changes
    useEffect(() => {
        filterBookings();
    }, [dateRange, bookings]);

    const fetchBookings = () => {
        setLoading(true);

        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
            const mockBookings = generateMockBookings(30);
            setBookings(mockBookings);
            setFilteredBookings(mockBookings);
            setPagination(prev => ({ ...prev, total: mockBookings.length }));
            setLoading(false);
        }, 1000);
    };

    const filterBookings = () => {
        let result = [...bookings];

        if (dateRange && dateRange[0] && dateRange[1]) {
            result = result.filter(booking => {
                const bookingDate = moment(booking.bookingDate, 'DD/MM/YYYY');
                return bookingDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
            });
        }

        setFilteredBookings(result);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: result.length
        }));
    };

    const handleViewDetails = (record) => {
        setSelectedBooking(record);
        setDrawerVisible(true);
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const resetFilters = () => {
        setDateRange(null);
        setFilteredBookings(bookings);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: bookings.length
        }));
    };

    const columns = [
        {
            title: 'Mã đặt khám',
            dataIndex: 'bookingId',
            key: 'bookingId',
            render: (text) => <span className="booking-id">{text}</span>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (text) => (
                <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {text}
                </span>
            ),
        },
        {
            title: 'Thời gian khám',
            dataIndex: 'appointmentTime',
            key: 'appointmentTime',
            render: (text) => (
                <span>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    {text}
                </span>
            ),
        },
        {
            title: 'Cơ sở y tế',
            dataIndex: 'hospital',
            key: 'hospital',
            ellipsis: true,
        },
        {
            title: 'Chuyên khoa',
            dataIndex: 'department',
            key: 'department',
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '';
                let text = '';
                switch (status) {
                    case 'completed':
                        color = 'green';
                        text = 'Hoàn thành';
                        break;
                    case 'confirmed':
                        color = 'blue';
                        text = 'Đã xác nhận';
                        break;
                    case 'pending':
                        color = 'orange';
                        text = 'Chờ xác nhận';
                        break;
                    case 'cancelled':
                        color = 'red';
                        text = 'Đã hủy';
                        break;
                    default:
                        color = 'default';
                        text = status;
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    // Generate mock data function
    const generateMockBookings = (count) => {
        const statuses = ['completed', 'confirmed', 'pending', 'cancelled'];
        const hospitals = [
            'Bệnh viện Đa khoa DABS',
            'Phòng khám Đa khoa Sài Gòn',
            'Bệnh viện FPT',
            'Bệnh viện Đại học Y Dược'
        ];
        const departments = [
            'Nội tổng hợp',
            'Ngoại tổng hợp',
            'Tim mạch',
            'Sản phụ khoa',
            'Nhi khoa',
            'Da liễu'
        ];
        const doctors = [
            'BS. Nguyễn Văn A',
            'BS. Trần Thị B',
            'BS. Lê Văn C',
            'BS. Phan Thị D'
        ];

        const result = [];

        for (let i = 1; i <= count; i++) {
            // Generate a random date within the last 6 months
            const randomDate = moment()
                .subtract(Math.floor(Math.random() * 180), 'days')
                .format('DD/MM/YYYY');

            // Generate random time
            const hours = Math.floor(Math.random() * 9) + 8; // 8AM to 5PM
            const minutes = Math.random() > 0.5 ? '00' : '30';
            const appointmentTime = `${hours}:${minutes}`;

            // Generate booking
            result.push({
                id: i,
                bookingId: `BK${String(i).padStart(5, '0')}`,
                bookingDate: randomDate,
                appointmentTime: appointmentTime,
                hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
                department: departments[Math.floor(Math.random() * departments.length)],
                doctor: doctors[Math.floor(Math.random() * doctors.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                patientName: user?.fullname || 'Trần Thành Đạt',
                patientPhone: user?.phoneNumber || '097****969',
                patientEmail: user?.email || 'example@gmail.com',
                symptoms: 'Sốt, đau đầu, mệt mỏi',
                notes: Math.random() > 0.5 ? 'Có tiền sử bệnh tim' : '',
                fee: Math.floor(Math.random() * 5 + 1) * 100000
            });
        }

        // Sort by date (newest first)
        return result.sort((a, b) => {
            return moment(b.bookingDate, 'DD/MM/YYYY').diff(moment(a.bookingDate, 'DD/MM/YYYY'));
        });
    };

    return (
        <Content className="booking-history-container">
            {/* Breadcrumb */}
            <Breadcrumb className="booking-breadcrumb">
                <Breadcrumb.Item>
                    <Link to="/"><HomeOutlined /> Trang chủ</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <FileTextOutlined /> Lịch sử đặt khám
                </Breadcrumb.Item>
            </Breadcrumb>

            <Title level={2} className="page-title">
                <CalendarOutlined /> Lịch sử đặt khám
            </Title>

            {/* Filters */}
            <Card className="filter-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Title level={5}>Lọc theo ngày đặt khám:</Title>
                        <Space>
                            <RangePicker
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                                allowClear
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={filterBookings}
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={resetFilters}
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>

            {/* Booking Table */}
            <Card className="booking-table-card">
                <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowKey="id"
                    pagination={pagination}
                    onChange={handleTableChange}
                    loading={loading}
                    locale={{
                        emptyText: <Empty description="Không tìm thấy lịch đặt khám nào" />
                    }}
                />
            </Card>

            {/* Detail Drawer */}
            <BookingDetailDrawer
                booking={selectedBooking}
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
        </Content>
    );
};

export default BookingHistoryPage;