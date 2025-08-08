import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge, Select } from 'antd';
import { PlusOutlined, SearchOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import HospitalTable from './HospitalTable';
import AddHospital from './AddHospital';
import { getAllHospitals } from '../../../services/hospitalService';
import './HospitalManagement.scss';

const { TabPane } = Tabs;
const { Option } = Select;

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
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

  const fetchHospitals = async (page = 1, pageSize = 10, search = '', status = 'all', type = 'all') => {
    console.log('HospitalManagement: fetchHospitals called with:', { page, pageSize, search, status, type });
    
    setLoading(true);
    try {
      const response = await getAllHospitals();
      console.log('HospitalManagement: getAllHospitals response:', response);

   
      let allData = [];
      
      if (response && response.result && Array.isArray(response.result)) {
        allData = response.result;
      } else if (Array.isArray(response)) {
        allData = response;
      }

      console.log('HospitalManagement: Processed data:', allData);

     
      allData = allData.map(hospital => ({
        ...hospital,
        status: hospital.status || 'active',
        type: hospital.type || hospital.hospitalType || 'General'
      }));

      setAllHospitals(allData);


      let filteredData = allData;

      // Filter by search text
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(hospital =>
          hospital.name?.toLowerCase().includes(searchLower) ||
          hospital.address?.toLowerCase().includes(searchLower) ||
          hospital.email?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (status && status !== 'all') {
        filteredData = filteredData.filter(hospital => hospital.status === status);
      }

      // Filter by type
      if (type && type !== 'all') {
        filteredData = filteredData.filter(hospital => 
          hospital.type === type || hospital.hospitalType === type
        );
      }

 
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setHospitals(paginatedData);
      setPagination({
        current: page,
        pageSize,
        total: filteredData.length,
      });

  
      setCounts({
        all: allData.length,
        active: allData.filter(hospital => hospital.status === 'active').length,
        inactive: allData.filter(hospital => hospital.status === 'inactive').length,
      });

    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      
      // Reset data on error
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


  const debouncedFetchHospitals = useCallback(
    debounce((search, status, type) => {
      fetchHospitals(1, pagination.pageSize, search, status, type);
    }, 300),
    [pagination.pageSize]
  );

  
  useEffect(() => {
    if (allHospitals.length > 0) {
      debouncedFetchHospitals(searchText, statusFilter, typeFilter);
    }
  }, [searchText, debouncedFetchHospitals, statusFilter, typeFilter, allHospitals.length]);

  // Initial data load
  useEffect(() => {
    fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter);
  }, []);

  const handleTableChange = (paginationConfig) => {
    fetchHospitals(paginationConfig.current, paginationConfig.pageSize, searchText, statusFilter, typeFilter);
  };

  const handleSearch = () => {
    fetchHospitals(1, pagination.pageSize, searchText, statusFilter, typeFilter);
  };

 
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    fetchHospitals(1, pagination.pageSize, searchText, value, typeFilter);
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    fetchHospitals(1, pagination.pageSize, searchText, statusFilter, value);
  };

  const handleAddHospital = () => {
    setShowAddModal(true);
  };

  const handleAddHospitalSuccess = () => {
    setShowAddModal(false);
    fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter);
  };

  
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
              <h2>
                <MedicineBoxOutlined style={{ marginRight: 12 }} />
                Hospital Management
              </h2>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddHospital}
                size="large"
              >
                Add Hospital
              </Button>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Card>
            <Row className="actions-row" gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="search-container">
                <Input.Search
                  placeholder="Search hospitals..."
                  value={searchText}
                  onChange={handleSearchChange} 
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                  loading={loading} 
                />
              </Col>
              <Col xs={24} sm={6} md={4} lg={3}>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  style={{ width: '100%' }}
                  placeholder="Status"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={24} sm={6} md={4} lg={3}>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  style={{ width: '100%' }}
                  placeholder="Type"
                >
                  <Option value="all">All Types</Option>
                  <Option value="General">General</Option>
                  <Option value="Specialized">Specialized</Option>
                  <Option value="Community">Community</Option>
                </Select>
              </Col>
            </Row>

            <Tabs 
              defaultActiveKey="1" 
              className="hospital-tabs"
              onChange={(key) => {
                const statusMap = { '1': 'all', '2': 'active', '3': 'inactive' };
                handleStatusFilter(statusMap[key]);
              }}
            >
              <TabPane
                tab={
                  <span>
                    All Hospitals <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} />
                  </span>
                }
                key="1"
              >
                <HospitalTable
                  hospitals={statusFilter === 'all' ? hospitals : getFilteredHospitals('all')}
                  loading={loading}
                  pagination={statusFilter === 'all' ? pagination : { ...pagination, total: counts.all }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter)}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    Active <Badge count={counts.active} style={{ backgroundColor: '#52c41a' }} />
                  </span>
                }
                key="2"
              >
                <HospitalTable
                  hospitals={statusFilter === 'active' ? hospitals : getFilteredHospitals('active')}
                  loading={loading}
                  pagination={statusFilter === 'active' ? pagination : { ...pagination, total: counts.active }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter)}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    Inactive <Badge count={counts.inactive} style={{ backgroundColor: '#ff4d4f' }} />
                  </span>
                }
                key="3"
              >
                <HospitalTable
                  hospitals={statusFilter === 'inactive' ? hospitals : getFilteredHospitals('inactive')}
                  loading={loading}
                  pagination={statusFilter === 'inactive' ? pagination : { ...pagination, total: counts.inactive }}
                  onChange={handleTableChange}
                  onReload={() => fetchHospitals(pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter)}
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