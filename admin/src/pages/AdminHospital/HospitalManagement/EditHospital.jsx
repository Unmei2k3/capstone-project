import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Button, Spin, message, TimePicker } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { updateHospital, getHospitalById } from '../../../services/hospitalService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const EditHospital = ({ visible, record, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record?.id && visible) {
      fetchHospitalDetails(record.id);
    }
  }, [record, visible]);

  const fetchHospitalDetails = async (hospitalId) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching hospital details for edit:', hospitalId);

      const response = await getHospitalById(hospitalId);
      const hospitalData = response?.result || response;

      console.log('📦 Hospital data for edit:', hospitalData);

      if (hospitalData) {
        form.setFieldsValue({
          code: hospitalData.code || '',
          name: hospitalData.name || '',
          address: hospitalData.address || '',
          image: hospitalData.image || '',
          googleMapUri: hospitalData.googleMapUri || '',
          banner: hospitalData.banner || '',
          type: hospitalData.type || 1,
          phoneNumber: hospitalData.phoneNumber || '',
          email: hospitalData.email || '',
          openTime: hospitalData.openTime ? dayjs(hospitalData.openTime) : null,
          closeTime: hospitalData.closeTime ? dayjs(hospitalData.closeTime) : null,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching hospital details:", error);
      message.error('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSpinning(true);
    try {
      console.log('🚀 Edit form values:', values);

      // ✅ Transform data to match API schema
      const hospitalData = {
        code: values.code,
        name: values.name,
        address: values.address,
        image: values.image || '',
        googleMapUri: values.googleMapUri || '',
        banner: values.banner || '',
        type: parseInt(values.type), // Convert to number
        phoneNumber: values.phoneNumber,
        email: values.email,
        openTime: values.openTime ? values.openTime.toISOString() : null,
        closeTime: values.closeTime ? values.closeTime.toISOString() : null
      };

      console.log('📤 Sending updated hospital data:', hospitalData);

      const response = await updateHospital(record.id, hospitalData);

      setSpinning(false);
      if (response) {
        message.success('Hospital updated successfully!');
        onSuccess();
      } else {
        message.error('Failed to update hospital');
      }
    } catch (err) {
      setSpinning(false);
      console.error("❌ Error updating hospital:", err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update hospital. Please try again.';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Edit Hospital: {record?.name}
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="custom-modal"
    >
      <Spin spinning={spinning || loading}>
        <div className="hospital-form-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Basic Information */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Hospital Name"
                  rules={[{ required: true, message: 'Please enter hospital name' }]}
                >
                  <Input placeholder="City General Hospital" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="code"
                  label="Hospital Code"
                  rules={[{ required: true, message: 'Please enter hospital code' }]}
                >
                  <Input placeholder="CGH001" />
                </Form.Item>
              </Col>
            </Row>

            {/* Type and Contact */}
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="type"
                  label="Hospital Type"
                  rules={[{ required: true, message: 'Please select hospital type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value={1}>General Hospital</Option>
                    <Option value={2}>Specialized Hospital</Option>
                    <Option value={3}>Community Hospital</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="+84-123-456-789" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="contact@hospital.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* Address */}
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input placeholder="123 Main Street, District 1, Ho Chi Minh City" />
            </Form.Item>

            {/* Operating Hours */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="openTime"
                  label="Opening Time"
                  rules={[{ required: true, message: 'Please select opening time' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Select opening time"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="closeTime"
                  label="Closing Time"
                  rules={[{ required: true, message: 'Please select closing time' }]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Select closing time"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Media URLs */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="image"
                  label="Hospital Logo/Image URL"
                >
                  <Input placeholder="https://example.com/hospital-logo.png" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="banner"
                  label="Banner Image URL"
                >
                  <Input placeholder="https://example.com/hospital-banner.png" />
                </Form.Item>
              </Col>
            </Row>

            {/* Google Maps */}
            <Form.Item
              name="googleMapUri"
              label="Google Maps Embed URI"
            >
              <TextArea
                rows={3}
                placeholder="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
              />
            </Form.Item>

            {/* Action Buttons */}
            <Form.Item className="button-group">
              <Button type="default" onClick={onCancel} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Hospital
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default EditHospital;