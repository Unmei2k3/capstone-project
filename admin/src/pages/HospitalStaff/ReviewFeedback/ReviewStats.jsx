import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import { 
  StarOutlined, 
  CommentOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  UserOutlined
} from '@ant-design/icons';

const ReviewStats = ({ statistics }) => {
  const {
    totalReviews = 0,
    averageRating = 0,
    ratingDistribution = {},
    statusCount = {},
    typeCount = {}
  } = statistics;

  const getProgressColor = (rating) => {
    if (rating >= 4) return '#52c41a';
    if (rating >= 3) return '#fadb14';
    if (rating >= 2) return '#fa8c16';
    return '#ff4d4f';
  };

  return (
    <div className="statistics-row">
      <Row gutter={16}>
        {/* Total Reviews */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Tổng số đánh giá"
              value={totalReviews}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        {/* Average Rating */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={averageRating}
              precision={1}
              prefix={<StarOutlined />}
              suffix="/ 5"
              valueStyle={{ color: '#fadb14' }}
            />
          </Card>
        </Col>
        
        {/* Approved Reviews */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={statusCount.approved || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        {/* Pending Reviews */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={statusCount.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        {/* Escalated Reviews */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Cần xử lý"
              value={statusCount.escalated || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        {/* Doctor Reviews */}
        <Col xs={12} sm={6} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đánh giá bác sĩ"
              value={typeCount.doctor_review || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Phân bố đánh giá theo sao">
              <Row gutter={16}>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating] || 0;
                  const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  
                  return (
                    <Col xs={24} sm={12} md={8} lg={4} key={rating} style={{ marginBottom: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 8 }}>
                          <StarOutlined style={{ color: '#fadb14', marginRight: 4 }} />
                          <span style={{ fontWeight: 500 }}>{rating} sao</span>
                        </div>
                        <Progress
                          percent={percentage}
                          strokeColor={getProgressColor(rating)}
                          style={{ marginBottom: 4 }}
                        />
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {count} đánh giá ({percentage}%)
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ReviewStats;