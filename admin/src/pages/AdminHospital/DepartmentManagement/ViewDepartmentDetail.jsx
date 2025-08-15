import React, { useEffect } from 'react';
import { 
  Modal, 
  Descriptions, 
  Avatar, 
  Tag, 
  Row, 
  Col, 
  Divider, 
  message
} from 'antd';
import { 
  BankOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';

const ViewDepartment = ({ visible, record, onCancel }) => {
  // Redux hooks
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message);

  // Handle Redux messages
  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,
      });
      dispatch(clearMessage());
    }
  }, [messageState, messageApi, dispatch]);

  useEffect(() => {
    if (visible && record) {
      dispatch(setMessage({
        type: 'info',
        content: `👁️ Xem chi tiết khoa "${record.name}"`
      }));
    }
  }, [visible, record, dispatch]);

  if (!record) return null;

  const handleCancel = () => {
    dispatch(setMessage({
      type: 'info',
      content: '🚫 Đã đóng thông tin chi tiết khoa'
    }));
    onCancel();
  };

  return (
    <>
      {contextHolder}
      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BankOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              Chi tiết khoa: {record.name}
            </span>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <div style={{ padding: '20px 0' }}>
          {/* Department Header */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={100}
                  icon={<BankOutlined />}
                  style={{ 
                    backgroundColor: '#1890ff', 
                    marginBottom: 16,
                    fontSize: '40px'
                  }}
                />
                <div>
                  <Tag 
                    color="success"
                    style={{ 
                      fontSize: '14px', 
                      padding: '4px 12px',
                      fontWeight: 500
                    }}
                  >
                    HOẠT ĐỘNG
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={18}>
              <Descriptions 
                column={1} 
                bordered 
                size="middle"
                labelStyle={{ 
                  fontWeight: 600, 
                  color: '#262626',
                  backgroundColor: '#fafafa'
                }}
              >
                <Descriptions.Item label="🏥 Tên khoa">
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#1890ff' }}>
                    {record.name}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="📋 Mô tả">
                  <span style={{ color: '#595959' }}>
                    {record.description || 'Không có mô tả'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 600 }}>
            📊 Thông tin hệ thống
          </Divider>
          
          <Descriptions 
            column={2} 
            bordered 
            size="middle"
            labelStyle={{ 
              fontWeight: 600, 
              color: '#262626',
              backgroundColor: '#fafafa'
            }}
          >
            <Descriptions.Item label="🔢 ID Khoa">
              <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                {record.id}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="🏥 ID Bệnh viện">
              <Tag color="green" style={{ fontFamily: 'monospace' }}>
                {record.hospitalId}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Summary Stats */}
          <Divider orientation="left" style={{ fontSize: '16px', fontWeight: 600 }}>
            📈 Thống kê tóm tắt
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                backgroundColor: '#e6f7ff', 
                borderRadius: '8px',
                border: '1px solid #91d5ff'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1890ff',
                  marginBottom: '8px'
                }}>
                  ID {record.id}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Mã định danh khoa
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                backgroundColor: '#f6ffed', 
                borderRadius: '8px',
                border: '1px solid #b7eb8f'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#52c41a',
                  marginBottom: '8px'
                }}>
                  {record.name.length}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Độ dài tên khoa
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                backgroundColor: '#fff2e8', 
                borderRadius: '8px',
                border: '1px solid #ffd591'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#fa8c16',
                  marginBottom: '8px'
                }}>
                  {record.description ? record.description.length : 0}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Độ dài mô tả
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default ViewDepartment;