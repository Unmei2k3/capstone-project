import React, { useState } from 'react';
import {
    Card,
    Form,
    Rate,
    Input,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Modal,
    Result
} from 'antd';
import {
    StarOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitHospitalRating, submitDoctorRating } from '../../services/ratingService';
import './Rating.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const RatingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [hospitalForm] = Form.useForm();
    const [doctorForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const appointment = location.state?.appointment;

    const handleHospitalRating = async (values) => {
        setLoading(true);
        try {
            await submitHospitalRating({
                appointmentId: appointment.id,
                hospitalId: appointment.hospitalId,
                patientId: 1, // Mock patient ID
                rating: values.hospitalRating,
                comment: values.hospitalComment
            });

            // Submit doctor rating if provided
            const doctorValues = doctorForm.getFieldsValue();
            if (doctorValues.doctorRating) {
                await submitDoctorRating({
                    appointmentId: appointment.id,
                    doctorId: appointment.doctorId,
                    patientId: 1, // Mock patient ID
                    rating: doctorValues.doctorRating,
                    comment: doctorValues.doctorComment
                });
            }

            setShowSuccess(true);
        } catch (error) {
            Modal.error({
                title: 'Rating Submission Failed',
                content: 'Failed to submit rating. Please try again.',
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
        navigate('/patient');
        return null;
    }

    return (
        <div className="rating-page-container">
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
                            <StarOutlined style={{ marginRight: 8 }} />
                            Rate Your Experience
                        </Title>

                        <div className="appointment-info">
                            <Card size="small" style={{ backgroundColor: '#f5f5f5', marginBottom: 24 }}>
                                <Row>
                                    <Col span={12}>
                                        <Text strong>Hospital:</Text> {appointment.hospitalName}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Doctor:</Text> {appointment.doctorName}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Department:</Text> {appointment.department}
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Service:</Text> {appointment.service}
                                    </Col>
                                </Row>
                            </Card>
                        </div>

                        {/* Hospital Rating */}
                        <Card
                            size="small"
                            title={
                                <span>
                                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                                    Rate Hospital: {appointment.hospitalName}
                                </span>
                            }
                            style={{ marginBottom: 16 }}
                        >
                            <Form
                                form={hospitalForm}
                                layout="vertical"
                                onFinish={handleHospitalRating}
                            >
                                <Form.Item
                                    name="hospitalRating"
                                    label="Overall Hospital Rating"
                                    rules={[{ required: true, message: 'Please rate the hospital' }]}
                                >
                                    <Rate allowHalf style={{ fontSize: '24px' }} />
                                </Form.Item>

                                <Form.Item
                                    name="hospitalComment"
                                    label="Comments about Hospital"
                                    rules={[{ required: true, message: 'Please provide your feedback' }]}
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="Share your experience with the hospital facilities, staff, cleanliness, etc."
                                    />
                                </Form.Item>
                            </Form>
                        </Card>

                        {/* Doctor Rating */}
                        <Card
                            size="small"
                            title={
                                <span>
                                    <UserOutlined style={{ marginRight: 8 }} />
                                    Rate Doctor: {appointment.doctorName}
                                </span>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            <Form
                                form={doctorForm}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="doctorRating"
                                    label="Doctor Rating"
                                    rules={[{ required: true, message: 'Please rate the doctor' }]}
                                >
                                    <Rate allowHalf style={{ fontSize: '24px' }} />
                                </Form.Item>

                                <Form.Item
                                    name="doctorComment"
                                    label="Comments about Doctor"
                                    rules={[{ required: true, message: 'Please provide your feedback' }]}
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="Share your experience with the doctor's professionalism, knowledge, bedside manner, etc."
                                    />
                                </Form.Item>
                            </Form>
                        </Card>

                        <Form.Item>
                            <Button
                                type="primary"
                                loading={loading}
                                size="large"
                                block
                                onClick={() => hospitalForm.submit()}
                            >
                                Submit Ratings
                            </Button>
                        </Form.Item>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Rating Guidelines">
                        <div className="rating-guidelines">
                            <Title level={5}>Hospital Rating Criteria:</Title>
                            <ul>
                                <li>Overall cleanliness and facilities</li>
                                <li>Staff professionalism and courtesy</li>
                                <li>Waiting times and efficiency</li>
                                <li>Communication and information provided</li>
                                <li>Overall experience and satisfaction</li>
                            </ul>

                            <Divider />

                            <Title level={5}>Doctor Rating Criteria:</Title>
                            <ul>
                                <li>Medical knowledge and expertise</li>
                                <li>Communication and listening skills</li>
                                <li>Bedside manner and empathy</li>
                                <li>Thoroughness of examination</li>
                                <li>Treatment explanation and guidance</li>
                            </ul>

                            <Divider />

                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Your ratings help other patients make informed decisions and help healthcare providers improve their services.
                            </Text>
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
                    title="Rating Submitted Successfully!"
                    subTitle="Thank you for your feedback. Your rating helps improve healthcare services."
                />
            </Modal>
        </div>
    );
};

export default RatingPage;