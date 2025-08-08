import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Divider,
    Typography,
    Space,
    Alert,
    Modal,
    Result
} from 'antd';
import {
    CreditCardOutlined,
    SafetyOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment, getPaymentMethods } from '../../services/paymentService';
import './Payment.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    const appointment = location.state?.appointment;

    useEffect(() => {
        if (!appointment) {
            navigate('/patient');
            return;
        }
        fetchPaymentMethods();
    }, [appointment, navigate]);

    const fetchPaymentMethods = async () => {
        try {
            const methods = await getPaymentMethods(1); // Mock patient ID
            setPaymentMethods(methods);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const handlePayment = async (values) => {
        setLoading(true);
        try {
            const paymentData = {
                appointmentId: appointment.id,
                amount: appointment.amount,
                method: values.paymentMethod,
                cardNumber: values.cardNumber,
                expiryDate: values.expiryDate,
                cvv: values.cvv,
                cardName: values.cardName
            };

            const result = await processPayment(paymentData);
            setPaymentResult(result);
            setShowSuccess(true);
        } catch (error) {
            Modal.error({
                title: 'Payment Failed',
                content: error.message || 'Payment processing failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessOk = () => {
        setShowSuccess(false);
        navigate('/patient');
    };

    if (!appointment) {
        return null;
    }

    return (
        <div className="payment-page-container">
            <Row gutter={24}>
                <Col span={24}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/patient')}
                        style={{ marginBottom: 16 }}
                    >
                        Back to Portal
                    </Button>
                </Col>

                <Col xs={24} lg={16}>
                    <Card>
                        <Title level={3}>
                            <CreditCardOutlined style={{ marginRight: 8 }} />
                            Payment Details
                        </Title>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handlePayment}
                            initialValues={{
                                paymentMethod: 'new_card'
                            }}
                        >
                            <Form.Item
                                name="paymentMethod"
                                label="Payment Method"
                                rules={[{ required: true, message: 'Please select a payment method' }]}
                            >
                                <Select placeholder="Select payment method">
                                    <Option value="new_card">New Credit Card</Option>
                                    {paymentMethods.map(method => (
                                        <Option key={method.id} value={method.id}>
                                            {method.brand} ending in {method.last4}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Divider />

                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Item
                                        name="cardName"
                                        label="Cardholder Name"
                                        rules={[{ required: true, message: 'Please enter cardholder name' }]}
                                    >
                                        <Input placeholder="John Doe" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Item
                                        name="cardNumber"
                                        label="Card Number"
                                        rules={[
                                            { required: true, message: 'Please enter card number' },
                                            { pattern: /^\d{16}$/, message: 'Please enter a valid 16-digit card number' }
                                        ]}
                                    >
                                        <Input
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={16}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                form.setFieldsValue({ cardNumber: value });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={12}>
                                    <Form.Item
                                        name="expiryDate"
                                        label="Expiry Date"
                                        rules={[
                                            { required: true, message: 'Please enter expiry date' },
                                            { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Format: MM/YY' }
                                        ]}
                                    >
                                        <Input
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 2) {
                                                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                }
                                                form.setFieldsValue({ expiryDate: value });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={12}>
                                    <Form.Item
                                        name="cvv"
                                        label="CVV"
                                        rules={[
                                            { required: true, message: 'Please enter CVV' },
                                            { pattern: /^\d{3,4}$/, message: 'Please enter a valid CVV' }
                                        ]}
                                    >
                                        <Input
                                            placeholder="123"
                                            maxLength={4}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                form.setFieldsValue({ cvv: value });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Alert
                                message="Secure Payment"
                                description="Your payment information is encrypted and secure."
                                type="info"
                                icon={<SafetyOutlined />}
                                style={{ marginBottom: 24 }}
                            />

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    size="large"
                                    block
                                >
                                    Pay ${appointment.amount}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Payment Summary">
                        <div className="payment-summary">
                            <div className="summary-item">
                                <Text strong>{appointment.hospitalName}</Text>
                            </div>
                            <div className="summary-item">
                                <Text>{appointment.service}</Text>
                            </div>
                            <div className="summary-item">
                                <Text>Doctor: {appointment.doctorName}</Text>
                            </div>
                            <div className="summary-item">
                                <Text>Department: {appointment.department}</Text>
                            </div>

                            <Divider />

                            <div className="summary-item">
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Text>Service Fee:</Text>
                                    <Text>${appointment.amount}</Text>
                                </Space>
                            </div>
                            <div className="summary-item">
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Text>Processing Fee:</Text>
                                    <Text>$0.00</Text>
                                </Space>
                            </div>

                            <Divider />

                            <div className="summary-item">
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                        ${appointment.amount}
                                    </Title>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Success Modal */}
            <Modal
                visible={showSuccess}
                onOk={handleSuccessOk}
                onCancel={handleSuccessOk}
                footer={[
                    <Button key="ok" type="primary" onClick={handleSuccessOk}>
                        OK
                    </Button>
                ]}
                width={500}
            >
                <Result
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title="Payment Successful!"
                    subTitle={
                        <div>
                            <p>Transaction ID: {paymentResult?.transactionId}</p>
                            <p>Amount: ${paymentResult?.amount}</p>
                            <p>Method: {paymentResult?.method}</p>
                        </div>
                    }
                />
            </Modal>
        </div>
    );
};

export default PaymentPage;