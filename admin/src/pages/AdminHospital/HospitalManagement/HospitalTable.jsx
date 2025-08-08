import React, { useState } from 'react';
import { Table, Button, Space, Tag, Tooltip, Avatar, Rate } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MedicineBoxOutlined, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import EditHospital from './EditHospital';
import DeleteHospital from './DeleteHospital';

const HospitalTable = ({ hospitals, loading, pagination, onChange, onReload }) => {
  const navigate = useNavigate();
  const [editingHospital, setEditingHospital] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState(null);

  const handleEdit = (record) => {
    setEditingHospital(record);
    setShowEditModal(true);
  };

  const handleDelete = (record) => {
    setHospitalToDelete(record);
    setShowDeleteModal(true);
  };

  // Navigate to Hospital Detail page
  const handleViewDetail = (record) => {
    navigate(`/admin-system/hospital-detail/${record.id}`);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onReload();
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'General':
        return 'blue';
      case 'Specialized':
        return 'purple';
      case 'Community':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      title: 'Hospital',
      key: 'hospital',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<MedicineBoxOutlined />} 
            style={{ marginRight: 12, backgroundColor: '#1890ff' }}
            src={record.logoUrl}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Code: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type & Rating',
      key: 'typeRating',
      render: (_, record) => (
        <div>
          <Tag color={getTypeColor(record.type)} style={{ marginBottom: 4 }}>
            {record.type}
          </Tag>
          <div>
            <Rate disabled value={record.rating} style={{ fontSize: '12px' }} />
            <span style={{ marginLeft: 8, fontSize: '12px' }}>{record.rating}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <span style={{ fontSize: '12px' }}>{record.city}, {record.state}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <span style={{ fontSize: '12px' }}>{record.phoneNumber}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Administrator',
      dataIndex: 'adminName',
      key: 'adminName',
      render: (adminName, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{adminName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.adminEmail}</div>
        </div>
      ),
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>Beds: <strong>{record.totalBeds}</strong></div>
          <div style={{ fontSize: '12px' }}>Departments: <strong>{record.totalDepartments}</strong></div>
          <div style={{ fontSize: '12px' }}>Staff: <strong>{record.totalStaff}</strong></div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="hospital-status-tag">
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Established',
      dataIndex: 'establishedDate',
      key: 'establishedDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip> */}
          <Tooltip title="Delete">
            <Button
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
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
        pagination={pagination}
        loading={loading}
        onChange={onChange}
        bordered={false}
        size="middle"
        scroll={{ x: 1200 }}
      />
      
      {showEditModal && (
        <EditHospital
          visible={showEditModal}
          record={editingHospital}
          onCancel={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
      
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