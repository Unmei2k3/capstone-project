import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Spin, notification, Row, Col } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { createRequest } from '../../../services/requestService';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
const { Option } = Select;

const DoctorLeaveRequestForm = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [startDateValue, setStartDateValue] = useState(null);
  const [endDateValue, setEndDateValue] = useState(null);
  console.log("User data:", user);
  const disabledStartDate = (current) => {
    if (!current) return false;
    return current <= dayjs().startOf('day') || (endDateValue && current > endDateValue);
  };

  const disabledEndDate = (current) => {
    if (!current) return false;
    return current <= dayjs().startOf('day') || (startDateValue && current < startDateValue);
  };

  const error = () => {
    notification.error({
      message: 'Lỗi',
      description: 'Gửi đơn xin nghỉ phép thất bại. Vui lòng thử lại.',
      placement: 'topRight',
    });
  };
  const mapReasonToRequestType = (reason) => {
    switch (reason) {
      case 'Nghỉ phép':
        return 1;
      case 'Nghỉ ốm':
        return 2;
      case 'Đi công tác':
        return 3;
      case 'Khác':
        return 4;
      default:
        return 4;
    }
  };
  const handleSubmit = async (values) => {
    setSpinning(true);
    try {
      const payload = {
        type: mapReasonToRequestType(values.reason),
        hospitalId: user.hospitals[0]?.id,
        startDate: values.startDate.format(),
        endDate: values.endDate.format(),
        timeShift: values.shift,
        reason: values.reason,
      };
      console.log("Submitting leave request with payload:", payload);
      await createRequest(payload);

      setSpinning(false);
      form.resetFields();
      onSuccess();

    } catch (err) {
      setSpinning(false);
      error();
      console.error("Error submitting leave request:", err);
    }
  };

  return (
    <ConfigProvider locale={viVN}>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Đơn Xin Nghỉ Phép Của {user?.role?.id === 1 ? 'Bác Sĩ' : user?.role?.id === 7 ? 'Y Tá' : 'Nhân Viên'}
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        className="custom-modal"
      >
        <Spin spinning={spinning}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              reason: 'Nghỉ phép',
              fullName: user?.fullname || '',

            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"

                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input disabled placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="shift"
                  label="Ca nghỉ"
                  rules={[{ required: true, message: 'Chọn ca nghỉ phép' }]}
                >
                  <Select placeholder="Chọn ca nghỉ">
                    <Option value={1}>Sáng</Option>
                    <Option value={2}>Chiều</Option>
                    <Option value={3}>Cả ngày</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu nghỉ"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu nghỉ' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    showToday={false}
                    disabledDate={disabledStartDate}
                    onChange={(date) => setStartDateValue(date)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc nghỉ"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc nghỉ' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    showToday={false}
                    disabledDate={disabledEndDate}
                    onChange={(date) => setEndDateValue(date)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="reason"
              label="Lý do nghỉ"
              rules={[{ required: true, message: 'Vui lòng chọn lý do nghỉ' }]}
            >
              <Select placeholder="Chọn lý do nghỉ">
                <Option value="Nghỉ phép">Nghỉ phép</Option>
                <Option value="Nghỉ ốm">Nghỉ ốm</Option>
                <Option value="Đi công tác">Đi công tác</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Ghi chú / Cam kết"
            >
              <Input.TextArea rows={3} placeholder="Nhập ghi chú hoặc cam kết (nếu có)" />
            </Form.Item>

            <Form.Item className="button-group" style={{ textAlign: 'right' }}>
              <Button type="default" onClick={onCancel} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi đơn
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default DoctorLeaveRequestForm;
