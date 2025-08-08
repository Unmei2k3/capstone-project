import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, notification, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { updateDepartment, getDepartmentById } from '../../../services/departmentService';

const { Option } = Select;
const { TextArea } = Input;

const EditDepartment = ({ visible, record, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record?.id) {
      fetchDepartmentDetails(record.id);
    }
  }, [record]);

  const fetchDepartmentDetails = async (departmentId) => {
    setLoading(true);
    try {
        console.log('🔍 Fetching department details for ID:', departmentId);
        
        const departmentData = await getDepartmentById(departmentId);
        console.log('📦 Department data received:', departmentData);
        
        if (departmentData) {
            form.setFieldsValue({
                name: departmentData.name || '',
                code: departmentData.code || '',
                description: departmentData.description || '',
                headOfDepartment: departmentData.headOfDepartment || '',
                location: departmentData.location || '',
                phoneNumber: departmentData.phoneNumber || '',
                email: departmentData.email || '',
                totalStaff: departmentData.totalStaff || 0,
                totalBeds: departmentData.totalBeds || 0,
                operatingHours: departmentData.operatingHours || '',
                status: departmentData.status || 'active',
            });
        }
    } catch (error) {
        console.error("❌ Error fetching department details:", error);
        notification.error({
            message: 'Error',
            description: 'Failed to load department details. Please try again.',
            placement: 'topRight',
        });
    } finally {
        setLoading(false);
    }
};

  const success = () => {
    notification.success({
      message: 'Success',
      description: 'Department updated successfully!',
      placement: 'topRight',
    });
  };

  const error = () => {
    notification.error({
      message: 'Error',
      description: 'Failed to update department. Please try again.',
      placement: 'topRight',
    });
  };

  const handleSubmit = async (values) => {
    setSpinning(true);
    try {
        console.log('🚀 Updating department with values:', values);
        console.log('🚀 Department ID:', record.id);
        
        const response = await updateDepartment(record.id, values);
        setSpinning(false);
        
        console.log('✅ Update response:', response);
        
        if (response) {
            success();
            onSuccess();
        } else {
            error('No response received from server');
        }
    } catch (err) {
        setSpinning(false);
        console.error(" Error updating department:", err);
        console.error(" Error details:", err.response?.data);
        
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Failed to update department. Please try again.';
        notification.error({
            message: 'Error',
            description: errorMessage,
            placement: 'topRight',
        });
    }
};

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Edit Department: {record?.name}
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="custom-modal"
    >
      <Spin spinning={spinning || loading}>
        <div className="department-form-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: record?.name,
              code: record?.code,
              description: record?.description,
              headOfDepartment: record?.headOfDepartment,
              location: record?.location,
              phoneNumber: record?.phoneNumber,
              email: record?.email,
              totalStaff: record?.totalStaff,
              totalBeds: record?.totalBeds,
              operatingHours: record?.operatingHours,
              status: record?.status,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Department Name"
                  rules={[{ required: true, message: 'Please enter department name' }]}
                >
                  <Input placeholder="Enter department name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="code"
                  label="Department Code"
                  rules={[{ required: true, message: 'Please enter department code' }]}
                >
                  <Input placeholder="Enter department code" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                placeholder="Enter department description" 
                rows={3}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="headOfDepartment"
                  label="Head of Department"
                  rules={[{ required: true, message: 'Please enter head of department' }]}
                >
                  <Input placeholder="Dr. John Smith" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder="Building A - Floor 1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="+1-234-567-8901" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="department@hospital.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="totalStaff"
                  label="Total Staff"
                  rules={[{ required: true, message: 'Please enter total staff' }]}
                >
                  <Input type="number" placeholder="25" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="totalBeds"
                  label="Total Beds"
                  rules={[{ required: true, message: 'Please enter total beds' }]}
                >
                  <Input type="number" placeholder="15" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="operatingHours"
              label="Operating Hours"
              rules={[{ required: true, message: 'Please enter operating hours' }]}
            >
              <Input placeholder="Mon-Fri: 8AM-6PM or 24/7" />
            </Form.Item>

            <Form.Item className="button-group">
              <Button type="default" onClick={onCancel} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                Update Department
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default EditDepartment;