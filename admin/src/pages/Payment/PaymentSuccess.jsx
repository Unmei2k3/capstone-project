import React, { useState, useEffect } from 'react';
import {
    Result,
    Card,
    Descriptions,
    Button,
    Space,
    Tag,
    Typography,
    Divider,
    Row,
    Col,
    Timeline,
    Alert,
    Spin
} from 'antd';
import {
    CheckCircleOutlined,
    HomeOutlined,
    PrinterOutlined,
    DownloadOutlined,
    CalendarOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './PaymentSuccess.scss';
import { getPaymentByOrderId } from '../../services/paymentService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { Title, Text, Paragraph } = Typography;

const PaymentSuccess = () => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    
    const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');

    const formatDateTime = (dateString) => {
        if (!dateString) return new Date().toLocaleString();

        try {
            const date = dayjs(dateString);
            
            return date.format('HH:mm:ss DD/M/YYYY');
        } catch (error) {
            console.error('Error formatting date:', error);
            return new Date().toLocaleString();
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return new Date().toLocaleTimeString();

        try {
            const date = dayjs(dateString);
            return date.format('HH:mm:ss');
        } catch (error) {
            console.error('Error formatting time:', error);
            return new Date().toLocaleTimeString();
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchPaymentData();
        } else {
            setError('No order ID provided');
            setLoading(false);
        }
    }, [orderId]);

   
    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching payment data for order:', orderId);

            const response = await getPaymentByOrderId(orderId);
            console.log('📥 Payment data response:', response);

            setPaymentData(response.result);
            setError(null);
        } catch (error) {
            console.error('❌ Error fetching payment data:', error);
            setError('Failed to load payment information');
        } finally {
            setLoading(false);
        }
    };

    
    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewAppointments = () => {
        navigate('/appointments');
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleDownloadReceipt = () => {
        
        console.log('📄 Downloading receipt...');
    };

    if (loading) {
        return (
            <div className="payment-loading">
                <Spin size="large" tip="Loading payment information..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-error">
                <Result
                    status="error"
                    title="Error Loading Payment"
                    subTitle={error}
                    extra={
                        <Button type="primary" onClick={handleGoHome}>
                            Go Home
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="payment-success-container">
            <div className="payment-success-content">
                
                <Result
                    status="success"
                    title="Payment Successful!"
                    subTitle={
                        <div>
                            <Paragraph>
                                Your payment has been processed successfully. Your appointment has been confirmed.
                            </Paragraph>
                            <Text type="secondary">
                                Order ID: <Text code>{orderId}</Text>
                            </Text>
                        </div>
                    }
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />

                
                <Alert
                    message="Payment Confirmed"
                    description="Your payment has been successfully processed and your appointment is now confirmed. You will receive a confirmation email shortly."
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Row gutter={24}>
                    
                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                    Payment Details
                                </div>
                            }
                            className="payment-details-card"
                        >
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Order ID">
                                    <Text code>{paymentData?.orderId || orderId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Transaction ID">
                                    <Text code>{paymentData?.id || 'TXN-' + Date.now()}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Amount">
                                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                        {paymentData?.amount?.toLocaleString() || '500,000'} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Method">
                                    <Tag color="blue">{paymentData?.paymentMethod || 'PayOS'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                        PAID
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Date">
                                    <Text>
                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                        {formatDateTime(paymentData?.createdAt)}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            
                            <Title level={5}>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Appointment Details
                            </Title>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Service">
                                    <Text strong>{paymentData?.serviceName || 'General Consultation'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Doctor">
                                    <Text>
                                        <UserOutlined style={{ marginRight: 4 }} />
                                        {paymentData?.doctorName || 'Dr. John Smith'}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Date & Time">
                                    <Text>
                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                        {paymentData?.appointmentDate || 'Dec 15, 2024 - 2:00 PM'}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Department">
                                    <Tag color="purple">{paymentData?.department || 'Cardiology'}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    
                    <Col xs={24} lg={10}>
                        
                        <Card
                            title="Process Timeline"
                            style={{ marginBottom: 16 }}
                            size="small"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: 'green',
                                        children: (
                                            <div>
                                                <Text strong>Payment Initiated</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {paymentData?.createdAt ?
                                                        formatTime(dayjs(paymentData.createdAt).subtract(5, 'minute').toISOString()) :
                                                        formatTime(new Date(Date.now() - 300000).toISOString())
                                                    }
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: 'green',
                                        children: (
                                            <div>
                                                <Text strong>Payment Processed</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {paymentData?.createdAt ?
                                                        formatTime(dayjs(paymentData.createdAt).subtract(2, 'minute').toISOString()) :
                                                        formatTime(new Date(Date.now() - 120000).toISOString())
                                                    }
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: 'green',
                                        children: (
                                            <div>
                                                <Text strong>Appointment Confirmed</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {formatTime(paymentData?.createdAt)}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        color: 'blue',
                                        children: (
                                            <div>
                                                <Text>Email Confirmation Sent</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Processing...
                                                </Text>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </Card>

                        
                        <Card title="Next Steps" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    block
                                    onClick={handleViewAppointments}
                                >
                                    View My Appointments
                                </Button>

                                <Button
                                    icon={<PrinterOutlined />}
                                    block
                                    onClick={handlePrintReceipt}
                                >
                                    Print Receipt
                                </Button>

                                <Button
                                    icon={<DownloadOutlined />}
                                    block
                                    onClick={handleDownloadReceipt}
                                >
                                    Download Receipt
                                </Button>

                                <Divider style={{ margin: '12px 0' }} />

                                <Button
                                    icon={<HomeOutlined />}
                                    block
                                    onClick={handleGoHome}
                                >
                                    Back to Home
                                </Button>
                            </Space>
                        </Card>

                        
                        <Alert
                            message="Need Help?"
                            description={
                                <div>
                                    <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                        If you have any questions about your payment or appointment,
                                        please contact our support team.
                                    </Paragraph>
                                    <Text style={{ fontSize: '12px' }}>
                                        📞 Hotline: 1900-1234 | 📧 support@hospital.com
                                    </Text>
                                </div>
                            }
                            type="info"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PaymentSuccess;