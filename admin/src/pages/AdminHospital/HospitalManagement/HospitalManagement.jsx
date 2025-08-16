import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import HospitalTable from './HospitalTable';
import AddHospital from './AddHospital';
import { getAllHospitals } from '../../../services/hospitalService';
import './HospitalManagement.scss';

const { TabPane } = Tabs;

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
  });

  const fetchHospitals = async (page = 1, pageSize = 10, search = '', status = 'all') => {
    console.log('🏥 HospitalManagement: fetchHospitals được gọi với:', { page, pageSize, search, status });
    
    setLoading(true);
    try {
      const response = await getAllHospitals();
      console.log('📥 HospitalManagement: Phản hồi getAllHospitals:', response);

      let allData = [];
      
      if (response && response.result && Array.isArray(response.result)) {
        allData = response.result;
      } else if (Array.isArray(response)) {
        allData = response;
      }

      console.log('📋 HospitalManagement: Dữ liệu đã xử lý:', allData);

      // ✅ Đảm bảo dữ liệu có trường status
      allData = allData.map(hospital => ({
        ...hospital,
        status: hospital.status || 'active'
      }));

      setAllHospitals(allData);

      let filteredData = allData;

      // ✅ Lọc theo từ khóa tìm kiếm (chỉ cần tên, địa chỉ, email, phone)
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(hospital =>
          hospital.name?.toLowerCase().includes(searchLower) ||
          hospital.address?.toLowerCase().includes(searchLower) ||
          hospital.email?.toLowerCase().includes(searchLower) ||
          hospital.phoneNumber?.toLowerCase().includes(searchLower)
        );
      }

      // ✅ Lọc theo trạng thái
      if (status && status !== 'all') {
        filteredData = filteredData.filter(hospital => hospital.status === status);
      }

      // ✅ Phân trang dữ liệu
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setHospitals(paginatedData);
      setPagination({
        current: page,
        pageSize,
        total: filteredData.length,
      });

      // ✅ Cập nhật số lượng bệnh viện
      setCounts({
        all: allData.length,
        active: allData.filter(hospital => hospital.status === 'active').length,
        inactive: allData.filter(hospital => hospital.status === 'inactive').length,
      });

    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách bệnh viện:', error);
      
      // ✅ Reset dữ liệu khi có lỗi
      setHospitals([]);
      setAllHospitals([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      setCounts({
        all: 0,
        active: 0,
        inactive: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounce để tối ưu hóa tìm kiếm
  const debouncedFetchHospitals = useCallback(
    debounce((search, status) => {
      fetchHospitals(1, pagination.pageSize, search, status);
    }, 300),
    [pagination.pageSize]
  );

  // ✅ Effect cho tìm kiếm và lọc
  useEffect(() => {
    if (allHospitals.length > 0) {
      debouncedFetchHospitals(searchText, statusFilter);
    }
  }, [searchText, debouncedFetchHospitals, statusFilter, allHospitals.length]);

  // ✅ Tải dữ liệu ban đầu
  useEffect(() => {
    fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter);
  }, []);

  const handleTableChange = (paginationConfig) => {
    fetchHospitals(paginationConfig.current, paginationConfig.pageSize, searchText, statusFilter);
  };

  const handleSearch = () => {
    fetchHospitals(1, pagination.pageSize, searchText, statusFilter);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchHospitals(1, pagination.pageSize, searchText, status);
  };

  const handleAddHospital = () => {
    setShowAddModal(true);
  };

  const handleAddHospitalSuccess = () => {
    setShowAddModal(false);
    fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter);
  };

  // ✅ Hàm lọc bệnh viện theo trạng thái
  const getFilteredHospitals = (status) => {
    if (status === 'all') return hospitals;
    return allHospitals.filter(hospital => hospital.status === status);
  };

  return (
    <div className="hospital-management-container">
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0, color: '#1890ff', fontSize: '24px', fontWeight: 600 }}>
                <MedicineBoxOutlined style={{ marginRight: 12 }} />
                Quản lý Bệnh viện
              </h2>
              <p style={{ color: '#666', marginTop: 4, marginBottom: 0 }}>
                Quản lý thông tin cơ bản của các bệnh viện trong hệ thống
              </p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddHospital}
                size="large"
                style={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  height: '40px',
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }}
              >
                Thêm Bệnh viện
              </Button>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* ✅ Simplified search row - removed type filter */}
            <Row className="actions-row" gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={18} md={20} lg={21} className="search-container">
                <Input.Search
                  placeholder="Tìm kiếm bệnh viện theo tên, địa chỉ, email, số điện thoại..."
                  value={searchText}
                  onChange={handleSearchChange} 
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                  loading={loading}
                  style={{ borderRadius: '6px' }}
                />
              </Col>
            </Row>

            <Tabs 
              defaultActiveKey="1" 
              className="hospital-tabs"
              onChange={(key) => {
                const statusMap = { '1': 'all', '2': 'active', '3': 'inactive' };
                handleStatusFilter(statusMap[key]);
              }}
              style={{ marginTop: 16 }}
            >
              <TabPane
                tab={
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    🏥 Tất cả Bệnh viện 
                    <Badge 
                      count={counts.all} 
                      style={{ 
                        backgroundColor: '#1890ff',
                        marginLeft: 8,
                        fontSize: '12px'
                      }} 
                    />
                  </span>
                }
                key="1"
              >
                <HospitalTable
                  hospitals={statusFilter === 'all' ? hospitals : getFilteredHospitals('all')}
                  loading={loading}
                  pagination={statusFilter === 'all' ? pagination : { ...pagination, total: counts.all }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter)}
                />
              </TabPane>

              <TabPane
                tab={
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    🟢 Đang hoạt động 
                    <Badge 
                      count={counts.active} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        marginLeft: 8,
                        fontSize: '12px'
                      }} 
                    />
                  </span>
                }
                key="2"
              >
                <HospitalTable
                  hospitals={statusFilter === 'active' ? hospitals : getFilteredHospitals('active')}
                  loading={loading}
                  pagination={statusFilter === 'active' ? pagination : { ...pagination, total: counts.active }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter)}
                />
              </TabPane>

              <TabPane
                tab={
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    🔴 Ngưng hoạt động 
                    <Badge 
                      count={counts.inactive} 
                      style={{ 
                        backgroundColor: '#ff4d4f',
                        marginLeft: 8,
                        fontSize: '12px'
                      }} 
                    />
                  </span>
                }
                key="3"
              >
                <HospitalTable
                  hospitals={statusFilter === 'inactive' ? hospitals : getFilteredHospitals('inactive')}
                  loading={loading}
                  pagination={statusFilter === 'inactive' ? pagination : { ...pagination, total: counts.inactive }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter)}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {showAddModal && (
        <AddHospital
          visible={showAddModal}
          onCancel={() => setShowAddModal(false)}
          onSuccess={handleAddHospitalSuccess}
        />
      )}
    </div>
  );
};

// ✅ Hàm debounce để tối ưu hóa performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default HospitalManagement;