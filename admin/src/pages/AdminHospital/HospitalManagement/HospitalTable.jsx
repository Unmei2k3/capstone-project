import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar } from 'antd';
import { DeleteOutlined, EyeOutlined, MedicineBoxOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DeleteHospital from './DeleteHospital';

const HospitalTable = ({ hospitals, loading, pagination, onChange, onReload }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState(null);

  const handleDelete = (record) => {
    setHospitalToDelete(record);
    setShowDeleteModal(true);
  };

  // Navigate to Hospital Detail page
  const handleViewDetail = (record) => {
    navigate(`/admin-system/hospital-detail/${record.id}`);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    onReload();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Ngưng hoạt động';
      default:
        return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'Thông tin Bệnh viện',
      key: 'hospital',
      width: '40%',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<MedicineBoxOutlined />} 
            size={48}
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
            src={record.logoUrl}
          />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '15px',
              color: '#1890ff',
              marginBottom: 4,
              lineHeight: '1.2'
            }}>
              {record.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              marginBottom: 2
            }}>
              Mã: {record.code || 'N/A'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>ID: {record.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thông tin Liên hệ',
      key: 'contact',
      width: '35%',
      render: (_, record) => (
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 6,
            fontSize: '13px'
          }}>
            <PhoneOutlined style={{ marginRight: 6, color: '#1890ff' }} />
            <span>{record.phoneNumber || 'Chưa có SĐT'}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: 6,
            fontSize: '13px'
          }}>
            <MailOutlined style={{ marginRight: 6, color: '#52c41a' }} />
            <span style={{ 
              wordBreak: 'break-all',
              maxWidth: '200px'
            }}>
              {record.email || 'Chưa có email'}
            </span>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            lineHeight: '1.3',
            maxWidth: '250px'
          }}>
            📍 {record.address || 'Chưa có địa chỉ'}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center',
      render: (status) => (
        <Tag 
          color={getStatusColor(status)} 
          className="hospital-status-tag"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: '6px'
          }}
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Tooltip title="Xem chi tiết bệnh viện">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{
                borderRadius: '6px',
                fontWeight: 500,
                width: '100px'
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Xóa bệnh viện khỏi hệ thống">
            <Button
              type="primary" 
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={{
                borderRadius: '6px',
                width: '100px'
              }}
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="hospital-table-container">
      <Table
        columns={columns}
        dataSource={hospitals}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bệnh viện`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        loading={loading}
        onChange={onChange}
        bordered={false}
        size="middle"
        scroll={{ x: 800 }}
        className="custom-hospital-table"
        locale={{
          emptyText: '🏥 Không có dữ liệu bệnh viện',
          triggerDesc: 'Nhấn để sắp xếp giảm dần',
          triggerAsc: 'Nhấn để sắp xếp tăng dần',
          cancelSort: 'Nhấn để hủy sắp xếp'
        }}
      />
      
      {showDeleteModal && (
        <DeleteHospital
          visible={showDeleteModal}
          record={hospitalToDelete}
          onCancel={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default HospitalTable;