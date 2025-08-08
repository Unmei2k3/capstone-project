import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Tabs, 
  Badge, 
  Button,
  notification,
  Rate,
  DatePicker,
  Space
} from 'antd';
import { 
  StarOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  FilterOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { 
  getReviews, 
  getReviewStatistics, 
  getDepartments 
} from '../../../services/reviewService';
import ReviewList from './ReviewList';
import ReviewStats from './ReviewStats';
import './ReviewFeedback.scss';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReviewFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  const [counts, setCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    escalated: 0,
    doctorReviews: 0,
    serviceReviews: 0,
    facilityReviews: 0,
    highPriority: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0
  });

  useEffect(() => {
    fetchReviews();
    fetchStatistics();
    fetchDepartments();
  }, []);

  const fetchReviews = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {
        search: searchText,
        rating: ratingFilter,
        status: statusFilter,
        type: typeFilter,
        department: departmentFilter,
        priority: priorityFilter,
        dateFrom: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
        dateTo: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        ...filters
      };

      const response = await getReviews(params);
      setReviews(response.items || []);
      
      // Calculate counts
      const allReviews = response.items || [];
      setCounts({
        all: allReviews.length,
        approved: allReviews.filter(r => r.status === 'approved').length,
        pending: allReviews.filter(r => r.status === 'pending').length,
        underReview: allReviews.filter(r => r.status === 'under_review').length,
        escalated: allReviews.filter(r => r.status === 'escalated').length,
        doctorReviews: allReviews.filter(r => r.type === 'doctor_review').length,
        serviceReviews: allReviews.filter(r => r.type === 'service_review').length,
        facilityReviews: allReviews.filter(r => r.type === 'facility_review').length,
        highPriority: allReviews.filter(r => r.priority === 'high').length,
        rating5: allReviews.filter(r => r.rating === 5).length,
        rating4: allReviews.filter(r => r.rating === 4).length,
        rating3: allReviews.filter(r => r.rating === 3).length,
        rating2: allReviews.filter(r => r.rating === 2).length,
        rating1: allReviews.filter(r => r.rating === 1).length
      });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách đánh giá. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getReviewStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSearch = () => {
    fetchReviews();
  };

  const handleRefresh = () => {
    setSearchText('');
    setRatingFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setPriorityFilter('all');
    setDateRange(null);
    fetchReviews({
      search: '',
      rating: 'all',
      status: 'all',
      type: 'all',
      department: 'all',
      priority: 'all',
      dateFrom: undefined,
      dateTo: undefined
    });
    fetchStatistics();
  };

  const getReviewsByFilter = (filterType) => {
    switch (filterType) {
      case 'approved':
        return reviews.filter(r => r.status === 'approved');
      case 'pending':
        return reviews.filter(r => r.status === 'pending');
      case 'under-review':
        return reviews.filter(r => r.status === 'under_review');
      case 'escalated':
        return reviews.filter(r => r.status === 'escalated');
      case 'doctor-reviews':
        return reviews.filter(r => r.type === 'doctor_review');
      case 'service-reviews':
        return reviews.filter(r => r.type === 'service_review');
      case 'facility-reviews':
        return reviews.filter(r => r.type === 'facility_review');
      case 'high-priority':
        return reviews.filter(r => r.priority === 'high');
      case 'rating-5':
        return reviews.filter(r => r.rating === 5);
      case 'rating-4':
        return reviews.filter(r => r.rating === 4);
      case 'rating-3':
        return reviews.filter(r => r.rating === 3);
      case 'rating-2':
        return reviews.filter(r => r.rating === 2);
      case 'rating-1':
        return reviews.filter(r => r.rating === 1);
      default:
        return reviews;
    }
  };

  const handleReviewUpdate = () => {
    fetchReviews();
    fetchStatistics();
    notification.success({
      message: 'Thành công',
      description: 'Đánh giá đã được cập nhật!',
    });
  };

  return (
    <div className="review-feedback-container">
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2>
                <CommentOutlined style={{ marginRight: 12 }} />
                Quản lý Đánh giá & Phản hồi
              </h2>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size="large"
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </Col>

        {/* Statistics Cards */}
        <Col span={24}>
          <ReviewStats statistics={statistics} />
        </Col>

        <Col span={24}>
          <Card>
            {/* Filters */}
            <Row className="filters-row" gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Input.Search
                  placeholder="Tìm kiếm đánh giá..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={4}>
                <RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange}
                  onChange={(dates) => {
                    setDateRange(dates);
                    fetchReviews({ 
                      dateFrom: dates ? dates[0].format('YYYY-MM-DD') : undefined,
                      dateTo: dates ? dates[1].format('YYYY-MM-DD') : undefined
                    });
                  }}
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
              
              <Col xs={24} sm={8} md={4} lg={3}>
                <Select
                  value={ratingFilter}
                  onChange={(value) => {
                    setRatingFilter(value);
                    fetchReviews({ rating: value });
                  }}
                  style={{ width: '100%' }}
                  placeholder="Đánh giá"
                >
                  <Option value="all">Tất cả sao</Option>
                  <Option value="5">5 sao</Option>
                  <Option value="4">4 sao</Option>
                  <Option value="3">3 sao</Option>
                  <Option value="2">2 sao</Option>
                  <Option value="1">1 sao</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={8} md={4} lg={4}>
                <Select
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    fetchReviews({ status: value });
                  }}
                  style={{ width: '100%' }}
                  placeholder="Trạng thái"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="under_review">Đang xem xét</Option>
                  <Option value="escalated">Cần xử lý</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={8} md={4} lg={4}>
                <Select
                  value={typeFilter}
                  onChange={(value) => {
                    setTypeFilter(value);
                    fetchReviews({ type: value });
                  }}
                  style={{ width: '100%' }}
                  placeholder="Loại đánh giá"
                >
                  <Option value="all">Tất cả loại</Option>
                  <Option value="doctor_review">Đánh giá bác sĩ</Option>
                  <Option value="service_review">Đánh giá dịch vụ</Option>
                  <Option value="facility_review">Đánh giá cơ sở</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={4} lg={3}>
                <Select
                  value={priorityFilter}
                  onChange={(value) => {
                    setPriorityFilter(value);
                    fetchReviews({ priority: value });
                  }}
                  style={{ width: '100%' }}
                  placeholder="Ưu tiên"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="high">Cao</Option>
                  <Option value="normal">Bình thường</Option>
                </Select>
              </Col>
            </Row>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} className="review-tabs">
              <TabPane
                tab={
                  <span>
                    Tất cả <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} />
                  </span>
                }
                key="1"
              >
                <ReviewList
                  reviews={reviews}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    Chờ duyệt <Badge count={counts.pending} style={{ backgroundColor: '#fa8c16' }} />
                  </span>
                }
                key="2"
              >
                <ReviewList
                  reviews={getReviewsByFilter('pending')}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    Cần xử lý <Badge count={counts.escalated} style={{ backgroundColor: '#ff4d4f' }} />
                  </span>
                }
                key="3"
              >
                <ReviewList
                  reviews={getReviewsByFilter('escalated')}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    Đánh giá bác sĩ <Badge count={counts.doctorReviews} style={{ backgroundColor: '#52c41a' }} />
                  </span>
                }
                key="4"
              >
                <ReviewList
                  reviews={getReviewsByFilter('doctor-reviews')}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    5 sao <Badge count={counts.rating5} style={{ backgroundColor: '#fadb14' }} />
                  </span>
                }
                key="5"
              >
                <ReviewList
                  reviews={getReviewsByFilter('rating-5')}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    1-2 sao <Badge count={counts.rating1 + counts.rating2} style={{ backgroundColor: '#ff4d4f' }} />
                  </span>
                }
                key="6"
              >
                <ReviewList
                  reviews={[...getReviewsByFilter('rating-1'), ...getReviewsByFilter('rating-2')]}
                  loading={loading}
                  onUpdate={handleReviewUpdate}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReviewFeedback;