import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, notification, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createDepartment } from '../../../services/departmentService';

const { Option } = Select;
const { TextArea } = Input;

const AddDepartment = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);

  const success = () => {
    notification.success({
      message: 'Success',
      description: 'Department added successfully!',
      placement: 'topRight',
    });
  };

  const error = (message = 'Failed to add department. Please try again.') => {
    notification.error({
      message: 'Error',
      description: message,
      placement: 'topRight',
    });
  };

  const handleSubmit = async (values) => {
    setSpinning(true);
    try {
      // Chuẩn bị data theo format API yêu cầu
      const departmentData = {
        hospitalId: 200, // Default hospitalId, có thể lấy từ context hoặc props
        name: values.name,
        description: values.description
      };

      console.log('Creating department with data:', departmentData);



      const response = await createDepartment(departmentData);
      setSpinning(false);

      if (response) {
        form.resetFields();
        success();
        onSuccess(); // Callback để refresh danh sách departments
      } else {
        error();
      }
    } catch (err) {
      setSpinning(false);
      console.error("Error adding department:", err);

      // Hiển thị error message cụ thể từ API nếu có
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add department. Please try again.';
      error(errorMessage);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PlusOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Add New Department
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600} // Giảm width vì chỉ còn 2 fields
      className="custom-modal"
    >
      <Spin spinning={spinning}>
        <div className="department-form-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Department Name"
              rules={[
                { required: true, message: 'Please enter department name' },
                { min: 2, message: 'Department name must be at least 2 characters' },
                { max: 100, message: 'Department name must not exceed 100 characters' }
              ]}
            >
              <Input
                placeholder="Enter department name (e.g., Emergency Department, Cardiology)"
                showCount
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter description' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { max: 500, message: 'Description must not exceed 500 characters' }
              ]}
            >
              <TextArea
                placeholder="Enter detailed description of the department's purpose and services"
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div style={{
              padding: '16px',
              backgroundColor: '#f0f2f5',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                <strong>Note:</strong> Hospital ID will be automatically assigned. Additional department details can be updated after creation.
              </p>
            </div>

            <Form.Item className="button-group" style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button
                type="default"
                onClick={onCancel}
                style={{ marginRight: 8 }}
                disabled={spinning}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={spinning}
                icon={<PlusOutlined />}
              >
                Create Department
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default AddDepartment;