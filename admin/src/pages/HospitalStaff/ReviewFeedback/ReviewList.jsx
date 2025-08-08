import React, { useState } from 'react';
import { 
  List, 
  Card, 
  Tag, 
  Button, 
  Space, 
  Avatar, 
  Modal, 
  Descriptions, 
  Row, 
  Col,
  Rate,
  Typography,
  Form,
  Input,
  Select,
  Spin,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  WarningOutlined,
  CalendarOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { updateReviewStatus, addReviewResponse } from '../../../services/reviewService';
import moment from 'moment';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReviewList = ({ reviews, loading, onUpdate }) => {
  const [viewingReview, setViewingReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [respondingReview, setRespondingReview] = useState(null);
  const [responseForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'under_review':
        return 'blue';
      case 'escalated':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'under_review':
        return 'Đang xem xét';
      case 'escalated':
        return 'Cần xử lý';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'normal':
        return 'green';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'normal':
        return 'Bình thường';
      default:
        return priority;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'doctor_review':
        return 'blue';
      case 'service_review':
        return 'green';
      case 'facility_review':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'doctor_review':
        return 'Đánh giá bác sĩ';
      case 'service_review':
        return 'Đánh giá dịch vụ';
      case 'facility_review':
        return 'Đánh giá cơ sở';
      default:
        return type;
    }
  };

  const handleViewDetails = (review) => {
    setViewingReview(review);
    setShowViewModal(true);
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      onUpdate();
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleAddResponse = (review) => {
    setRespondingReview(review);
    setShowResponseModal(true);
    responseForm.resetFields();
  };

  const handleSubmitResponse = async (values) => {
    setSubmitting(true);
    try {
      await addReviewResponse(respondingReview.id, values);
      setShowResponseModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderReviewItem = (review) => (
    <List.Item key={review.id}>
      <Card className="review-card" style={{ width: '100%' }}>
        <div className="review-header">
          <div className="patient-info">
            <Avatar 
              className="patient-avatar"
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <div className="patient-details">
              <h4>{review.patientName}</h4>
              <div className="patient-meta">
                {review.doctorName && (
                  <span style={{ marginRight: 16 }}>
                    <MedicineBoxOutlined style={{ marginRight: 4 }} />
                    {review.doctorName}
                  </span>
                )}
                <span style={{ marginRight: 16 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {review.department}
                </span>
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {moment(review.visitDate).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
            <div className="review-rating">
              <Rate disabled defaultValue={review.rating} style={{ fontSize: 16 }} />
              <span className="rating-text">{review.rating}/5 sao</span>
            </div>
          </div>

          <div className="review-tags">
            <Tag 
              className={`status-tag ${review.status}`}
              color={getStatusColor(review.status)}
            >
              {getStatusText(review.status)}
            </Tag>
            <Tag 
              className={`priority-tag ${review.priority}`}
              color={getPriorityColor(review.priority)}
            >
              Ưu tiên {getPriorityText(review.priority)}
            </Tag>
            <Tag 
              className="type-tag"
              color={getTypeColor(review.type)}
            >
              {getTypeText(review.type)}
            </Tag>
          </div>
        </div>

        <div className="review-content">
          <div className="review-title">{review.title}</div>
          <Paragraph 
            className="review-comment"
            ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
          >
            {review.comment}
          </Paragraph>

          {review.tags && review.tags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {review.tags.map((tag, index) => (
                <Tag key={index} size="small" style={{ marginBottom: 4 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {review.response && (
          <div className="review-response">
            <div className="response-header">
              Phản hồi từ {review.response.responder}
            </div>
            <div className="response-content">
              {review.response.message}
            </div>
            <div className="response-date">
              {moment(review.response.date).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        )}

        <div className="review-stats">
          <div className="stats-left">
            <div className="stat-item">
              <LikeOutlined />
              <span>{review.helpful} hữu ích</span>
            </div>
            {review.reportCount > 0 && (
              <div className="stat-item">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>{review.reportCount} báo cáo</span>
              </div>
            )}
          </div>
          <div className="stats-right">
            {moment(review.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>

        <div className="review-actions">
          <Space>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(review)}
              size="small"
            >
              Chi tiết
            </Button>

            {!review.response && (
              <Button
                type="default"
                icon={<MessageOutlined />}
                onClick={() => handleAddResponse(review)}
                size="small"
              >
                Phản hồi
              </Button>
            )}

            {review.status === 'pending' && (
              <Button
                type="default"
                onClick={() => handleStatusUpdate(review.id, 'approved')}
                size="small"
              >
                Duyệt
              </Button>
            )}

            {(review.status === 'pending' || review.status === 'under_review') && (
              <Button
                type="default"
                danger
                onClick={() => handleStatusUpdate(review.id, 'escalated')}
                size="small"
              >
                Cần xử lý
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </List.Item>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Empty
        description="Không có đánh giá nào"
        style={{ padding: '60px 0' }}
      />
    );
  }

  return (
    <>
      <List
        dataSource={reviews}
        renderItem={renderReviewItem}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`
        }}
      />

      {/* View Review Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={showViewModal}
        onCancel={() => setShowViewModal(false)}
        footer={null}
        width={800}
        className="review-detail-modal"
      >
        {viewingReview && (
          <div style={{ padding: '20px 0' }}>
            {/* Patient Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', marginRight: 20 }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, marginBottom: 8 }}>
                  {viewingReview.patientName}
                </h3>
                <Rate disabled defaultValue={viewingReview.rating} style={{ marginBottom: 8 }} />
                <div>
                  <Tag color={getStatusColor(viewingReview.status)}>
                    {getStatusText(viewingReview.status)}
                  </Tag>
                  <Tag color={getPriorityColor(viewingReview.priority)}>
                    Ưu tiên {getPriorityText(viewingReview.priority)}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Review Information */}
            <Descriptions title="Thông tin đánh giá" bordered column={2}>
              <Descriptions.Item label="Tiêu đề" span={2}>
                {viewingReview.title}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám">
                {moment(viewingReview.visitDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Loại đánh giá">
                {getTypeText(viewingReview.type)}
              </Descriptions.Item>
              <Descriptions.Item label="Khoa">
                {viewingReview.department}
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                {viewingReview.doctorName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung" span={2}>
                {viewingReview.comment}
              </Descriptions.Item>
              <Descriptions.Item label="Tags" span={2}>
                {viewingReview.tags?.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                )) || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Hữu ích">
                {viewingReview.helpful} lượt
              </Descriptions.Item>
              <Descriptions.Item label="Báo cáo">
                {viewingReview.reportCount} lượt
              </Descriptions.Item>
            </Descriptions>

            {/* Response */}
            {viewingReview.response && (
              <div style={{ marginTop: 24 }}>
                <Descriptions title="Phản hồi" bordered column={1}>
                  <Descriptions.Item label="Người phản hồi">
                    {viewingReview.response.responder}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung">
                    {viewingReview.response.message}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian">
                    {moment(viewingReview.response.date).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Response Modal */}
      <Modal
        title="Thêm phản hồi"
        open={showResponseModal}
        onCancel={() => setShowResponseModal(false)}
        footer={null}
        width={600}
      >
        {respondingReview && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
              <Text strong>{respondingReview.patientName}</Text>
              <br />
              <Text type="secondary">{respondingReview.title}</Text>
              <br />
              <Rate disabled defaultValue={respondingReview.rating} size="small" />
            </div>

            <Form
              form={responseForm}
              onFinish={handleSubmitResponse}
              layout="vertical"
              className="response-form"
            >
              <Form.Item
                label="Người phản hồi"
                name="responder"
                rules={[{ required: true, message: 'Vui lòng nhập tên người phản hồi' }]}
              >
                <Input placeholder="Tên bác sĩ/nhân viên phản hồi" />
              </Form.Item>

              <Form.Item
                label="Nội dung phản hồi"
                name="message"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nội dung phản hồi..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setShowResponseModal(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Gửi phản hồi
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReviewList;