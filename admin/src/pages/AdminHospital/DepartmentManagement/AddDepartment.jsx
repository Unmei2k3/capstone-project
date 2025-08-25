import React, { useState } from 'react';
import { Modal, Form, Input, Button, Spin, notification, Row, Col } from 'antd';
import { PlusOutlined, BankOutlined } from '@ant-design/icons';
import { createDepartment } from '../../../services/departmentService';

const { TextArea } = Input;

const AddDepartment = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);

  const success = () => {
    notification.success({
      message: 'Thành công',
      description: 'Đã thêm khoa/phòng thành công!',
      placement: 'topRight',
      duration: 3
    });
  };

  const error = (message = 'Không thể thêm khoa/phòng. Vui lòng thử lại.') => {
    notification.error({
      message: 'Lỗi',
      description: message,
      placement: 'topRight',
      duration: 5
    });
  };

  const handleSubmit = async (values) => {
    setSpinning(true);
    
    try {
      // ✅ Chuẩn bị data theo format API yêu cầu
      const departmentData = {
        hospitalId: 200, // Default hospitalId, có thể lấy từ context hoặc props
        name: values.name?.trim(),
        description: values.description?.trim()
      };

      console.log('🏥 Đang tạo khoa/phòng với dữ liệu:', departmentData);

      const response = await createDepartment(departmentData);
      console.log('✅ Phản hồi tạo khoa/phòng:', response);

      // ✅ Enhanced success validation
      if (response?.success || response?.result || response?.id) {
        form.resetFields();
        success();
        
        // ✅ Call onSuccess callback để refresh danh sách departments
        if (onSuccess && typeof onSuccess === 'function') {
          setTimeout(() => {
            onSuccess(response);
          }, 500);
        }
        
        // ✅ Auto close modal after success
        setTimeout(() => {
          onCancel();
        }, 1500);
      } else {
        throw new Error('Phản hồi không hợp lệ từ server');
      }
    } catch (err) {
      console.error('❌ Lỗi khi thêm khoa/phòng:', err);

      // ✅ Enhanced error handling với tiếng Việt
      let errorMessage = 'Không thể thêm khoa/phòng. Vui lòng thử lại.';

      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('🔍 Error response data:', errorData);

        if (errorData.title) {
          switch (errorData.title) {
            case 'DEPARTMENT_NAME_EXISTS':
              errorMessage = '🏥 Tên khoa/phòng đã tồn tại! Vui lòng sử dụng tên khác.';
              break;
            case 'HOSPITAL_NOT_FOUND':
              errorMessage = '🏥 Không tìm thấy bệnh viện! Vui lòng kiểm tra lại.';
              break;
            case 'VALIDATION_ERROR':
              errorMessage = '⚠️ Dữ liệu không hợp lệ! Vui lòng kiểm tra lại thông tin đã nhập.';
              break;
            case 'PERMISSION_DENIED':
              errorMessage = '🔒 Bạn không có quyền thêm khoa/phòng mới.';
              break;
            default:
              errorMessage = `❌ ${errorData.title.replace(/_/g, ' ')} - Vui lòng thử lại.`;
              break;
          }
        } else if (errorData.message) {
          errorMessage = `❌ ${errorData.message}`;
        }
      } else if (err.message) {
        errorMessage = `❌ ${err.message}`;
      }

      if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = '🌐 Lỗi kết nối mạng! Vui lòng kiểm tra kết nối internet và thử lại.';
      }

      error(errorMessage);
    } finally {
      setSpinning(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Thêm Khoa/Phòng mới
        </div>
      }
      open={visible} // ✅ Antd v5 compatibility
      onCancel={handleCancel}
      footer={null}
      width={650}
      className="custom-modal"
      destroyOnClose
      maskClosable={false}
      style={{ top: 20 }}
    >
      <Spin spinning={spinning} tip="Đang tạo khoa/phòng...">
        <div className="department-form-container" style={{ padding: '20px 0' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            scrollToFirstError
          >
            {/* ✅ Thông tin cơ bản */}
            <div style={{ 
              marginBottom: 24, 
              padding: '16px', 
              background: '#f0f7ff', 
              borderRadius: '8px',
              border: '1px solid #d6e4ff'
            }}>
              <h4 style={{ color: '#1890ff', marginBottom: 16 }}>🏥 Thông tin Khoa/Phòng</h4>
              
              <Form.Item
                name="name"
                label="Tên khoa/phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khoa/phòng' },
                  { min: 2, message: 'Tên khoa/phòng phải có ít nhất 2 ký tự' },
                  { max: 100, message: 'Tên khoa/phòng không được vượt quá 100 ký tự' }
                ]}
                hasFeedback
              >
                <Input
                  placeholder="Ví dụ: Khoa Cấp cứu, Khoa Tim mạch, Phòng Xét nghiệm"
                  showCount
                  maxLength={100}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả' },
                  { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                  { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
                ]}
                hasFeedback
              >
                <TextArea
                  placeholder="Nhập mô tả chi tiết về chức năng, dịch vụ và hoạt động của khoa/phòng này..."
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </div>

            {/* ✅ Lưu ý hệ thống */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f6ffed',
              borderRadius: '6px',
              marginBottom: '24px',
              border: '1px solid #b7eb8f'
            }}>
              <div style={{ 
                color: '#389e0d', 
                fontWeight: 500, 
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center'
              }}>
                💡 Lưu ý quan trọng:
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '20px',
                fontSize: '13px', 
                color: '#666',
                lineHeight: '1.6'
              }}>
                <li><strong>ID Bệnh viện</strong> sẽ được gán tự động theo hệ thống</li>
                <li><strong>Tên khoa/phòng</strong> phải là duy nhất trong bệnh viện</li>
                <li>Có thể cập nhật thêm thông tin chi tiết sau khi tạo thành công</li>
                <li>Khoa/phòng mới sẽ được kích hoạt ngay sau khi tạo</li>
              </ul>
            </div>

            {/* ✅ Nút hành động */}
            <Row justify="end" gutter={8}>
              <Col>
                <Button 
                  onClick={handleCancel}
                  disabled={spinning}
                  size="large"
                >
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={spinning}
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    minWidth: '140px'
                  }}
                >
                  {spinning ? 'Đang tạo...' : 'Tạo Khoa/Phòng'}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default AddDepartment;