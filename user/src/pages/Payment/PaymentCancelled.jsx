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
    Alert,
    Spin,
    Modal,
    List
} from 'antd';
import {
    CloseCircleOutlined,
    HomeOutlined,
    RedoOutlined,
    PhoneOutlined,
    MailOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentByOrderId, cancelPayment } from '../../services/paymentService';

import './PaymentCancelled.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';


const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const PaymentCancelled = () => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();


    const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
    const cancelReason = searchParams.get('cancel') || searchParams.get('reason');
    const status = searchParams.get('status');

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
            console.log('🔄 Fetching payment data for cancelled order:', orderId);

            const response = await getPaymentByOrderId(orderId);
            console.log('📥 Cancelled payment data:', response);

            setPaymentData(response.result);
            setError(null);
        } catch (error) {
            console.error('❌ Error fetching payment data:', error);
            setError('Failed to load payment information');
        } finally {
            setLoading(false);
        }
    };


    const handleConfirmCancellation = () => {
        confirm({
            title: 'Confirm Payment Cancellation',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <Paragraph>
                        Are you sure you want to cancel this payment? This action will:
                    </Paragraph>
                    <ul>
                        <li>Cancel your appointment booking</li>
                        <li>Refund the payment (if already processed)</li>
                        <li>Free up the appointment slot for others</li>
                    </ul>
                    <Paragraph style={{ color: '#ff4d4f' }}>
                        <strong>Note:</strong> Cancellation may take 3-5 business days for refund processing.
                    </Paragraph>
                </div>
            ),
            okText: 'Yes, Cancel Payment',
            okType: 'danger',
            cancelText: 'Keep Booking',
            onOk: performCancellation,
        });
    };


    const performCancellation = async () => {
        try {
            setCancelling(true);
            console.log('🔄 Cancelling payment for order:', orderId);

            const cancelData = {
                reason: cancelReason || 'User requested cancellation',
                cancelledAt: new Date().toISOString()
            };

            await cancelPayment(orderId, cancelData);
            console.log('✅ Payment cancelled successfully');


            await fetchPaymentData();

            Modal.success({
                title: 'Payment Cancelled',
                content: 'Your payment has been cancelled successfully. Refund will be processed within 3-5 business days.',
            });
        } catch (error) {
            console.error('❌ Error cancelling payment:', error);
            Modal.error({
                title: 'Cancellation Failed',
                content: 'Failed to cancel the payment. Please contact support for assistance.',
            });
        } finally {
            setCancelling(false);
        }
    };


    const handleRetryPayment = () => {
        navigate(`/payment/retry?orderId=${orderId}`);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleBookNewAppointment = () => {
        navigate('/appointments/book');
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
        <div className="payment-cancelled-container">
            <div className="payment-cancelled-content">

                <Result
                    status="error"
                    title="Payment Cancelled"
                    subTitle={
                        <div>
                            <Paragraph>
                                Your payment was cancelled and the appointment booking was not completed.
                            </Paragraph>
                            <Text type="secondary">
                                Order ID: <Text code>{orderId}</Text>
                            </Text>
                        </div>
                    }
                    icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                />


                <Alert
                    message="Payment Cancelled"
                    description={
                        <div>
                            <Paragraph style={{ margin: 0 }}>
                                {cancelReason === 'user'
                                    ? 'You cancelled the payment process. No charges have been made to your account.'
                                    : cancelReason === 'timeout'
                                        ? 'The payment session expired. Please try booking again.'
                                        : 'The payment was cancelled. Please contact support if this was unexpected.'
                                }
                            </Paragraph>
                            {paymentData?.refundStatus && (
                                <Text style={{ fontSize: '12px' }}>
                                    Refund Status: <Tag color="processing">{paymentData.refundStatus}</Tag>
                                </Text>
                            )}
                        </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Row gutter={24}>

                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                                    Cancellation Details
                                </div>
                            }
                            className="cancellation-details-card"
                        >
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Order ID">
                                    <Text code>{paymentData?.id || orderId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Cancellation Time">
                                    <Text>
                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                        {formatDateTime(paymentData?.cancelledAt)}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Cancellation Reason">
                                    <Tag color="orange">
                                        {cancelReason === 'user' ? 'User Cancelled' :
                                            cancelReason === 'timeout' ? 'Session Timeout' :
                                                cancelReason === 'failed' ? 'Payment Failed' :
                                                    'Cancelled'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Amount">
                                    <Text style={{ fontSize: '16px' }}>
                                        {paymentData?.amount?.toLocaleString() || '500,000'} VND
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color="error" icon={<CloseCircleOutlined />}>
                                        CANCELLED
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Refund Status">
                                    <Tag color={paymentData?.refundStatus === 'completed' ? 'success' : 'processing'}>
                                        {paymentData?.refundStatus?.toUpperCase() || 'NO_CHARGE'}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider />


                            <Title level={5}>
                                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                                Original Booking Details
                            </Title>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Service">
                                    <Text>{paymentData?.serviceName || 'General Consultation'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Doctor">
                                    <Text>{paymentData?.doctorName || 'Dr. John Smith'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Requested Date & Time">
                                    <Text style={{ textDecoration: 'line-through', color: '#999' }}>
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
                            title="What would you like to do?"
                            style={{ marginBottom: 16 }}
                            size="small"
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    icon={<RedoOutlined />}
                                    block
                                    onClick={handleRetryPayment}
                                    size="large"
                                >
                                    Retry Payment
                                </Button>

                                <Button
                                    icon={<RedoOutlined />}
                                    block
                                    onClick={handleBookNewAppointment}
                                >
                                    Book New Appointment
                                </Button>

                                <Divider style={{ margin: '12px 0' }} />

                                <Button
                                    icon={<HomeOutlined />}
                                    block
                                    onClick={handleGoHome}
                                >
                                    Back to Home
                                </Button>

                                {paymentData?.status !== 'cancelled' && (
                                    <>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <Button
                                            danger
                                            block
                                            loading={cancelling}
                                            onClick={handleConfirmCancellation}
                                        >
                                            Confirm Cancellation
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Card>


                        <Card title="Common Cancellation Reasons" size="small" style={{ marginBottom: 16 }}>
                            <List
                                size="small"
                                dataSource={[
                                    'Changed my mind about the appointment',
                                    'Payment method issue',
                                    'Need to reschedule to a different time',
                                    'Found another healthcare provider',
                                    'Technical issues during payment'
                                ]}
                                renderItem={(item, index) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                        <Text style={{ fontSize: '12px' }}>
                                            {index + 1}. {item}
                                        </Text>
                                    </List.Item>
                                )}
                            />
                        </Card>


                        <Card title="Need Help?" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: '12px' }}>Contact Support:</Text>
                                </div>

                                <Button
                                    icon={<PhoneOutlined />}
                                    size="small"
                                    block
                                    href="tel:1900-1234"
                                >
                                    Call: 1900-1234
                                </Button>

                                <Button
                                    icon={<MailOutlined />}
                                    size="small"
                                    block
                                    href="mailto:support@hospital.com"
                                >
                                    Email: support@hospital.com
                                </Button>
                            </Space>

                            <Alert
                                message="Refund Policy"
                                description="If payment was processed, refunds typically take 3-5 business days to appear in your account."
                                type="info"
                                showIcon
                                style={{ marginTop: 12, fontSize: '11px' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PaymentCancelled;