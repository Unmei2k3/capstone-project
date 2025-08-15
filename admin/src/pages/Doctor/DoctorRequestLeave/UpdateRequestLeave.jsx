import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Spin,
  notification,
  Row,
  Col,
  ConfigProvider,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { updateRequest } from '../../../services/requestService';
import viVN from 'antd/es/locale/vi_VN';
import { useSelector, useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';

const { Option } = Select;

const UpdateRequestLeave = ({ visible, onCancel, onSuccess, initialValues }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [startDateValue, setStartDateValue] = useState(null);
  const [endDateValue, setEndDateValue] = useState(null);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // không chọn trước hôm nay và không lớn hơn ngày kết thúc
  const disabledStartDate = (current) => {
    if (!current) return false;
    return (
      current.isBefore(dayjs().startOf('day')) ||
      (endDateValue && current.isAfter(endDateValue))
    );
  };

  //  không chọn trước hôm nay và không nhỏ hơn ngày bắt đầu
  const disabledEndDate = (current) => {
    if (!current) return false;
    return (
      current.isBefore(dayjs().startOf('day')) ||
      (startDateValue && current.isBefore(startDateValue))
    );
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        fullName: user?.fullname || '',
        notes: initialValues.reason || '',
        reason:
          initialValues.requestType === 1 ? 'Nghỉ phép' :
            initialValues.requestType === 2 ? 'Nghỉ ốm' :
              initialValues.requestType === 3 ? 'Đi công tác' : 'Khác',
        timeShift: initialValues.timeShift || 3,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
      });
      setStartDateValue(initialValues.startDate ? dayjs(initialValues.startDate) : null);
      setEndDateValue(initialValues.endDate ? dayjs(initialValues.endDate) : null);
    } else {
      form.resetFields();
      setStartDateValue(null);
      setEndDateValue(null);
    }
  }, [initialValues, form, user?.fullname]);

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

  const error = () => {
    notification.error({
      message: 'Lỗi',
      description: 'Cập nhật đơn thất bại. Vui lòng thử lại.',
      placement: 'topRight',
    });
  };

  const handleSubmit = async (values) => {
    setSpinning(true);
    try {
      const payload = {
        requestId: initialValues.id,
        hospitalId: user.hospitals[0]?.id,
        type: mapReasonToRequestType(values.reason),
        startDate: values.startDate.format(),
        endDate: values.endDate.format(),
        timeShift: values.timeShift,
        reason: values.notes,
      };

      await updateRequest(payload);

      setSpinning(false);
      dispatch(setMessage({ type: 'success', content: 'Cập nhật đơn nghỉ phép thành công!' }));
      form.resetFields();
      onSuccess && onSuccess();
    } catch (err) {
      setSpinning(false);
      dispatch(setMessage({ type: 'error', content: 'Cập nhật đơn nghỉ phép thất bại. Vui lòng thử lại.' }));
      error();
      console.error('Error updating leave request:', err);
    }
  };

  return (
    <ConfigProvider locale={viVN}>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Cập nhật đơn xin nghỉ phép
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        className="custom-modal"
        destroyOnClose={true}
      >
        <Spin spinning={spinning}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input disabled placeholder="Nhập họ và tên bác sĩ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="timeShift"
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

            <Form.Item name="notes" label="Ghi chú / Cam kết">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú hoặc cam kết (nếu có)" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="default" onClick={onCancel} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default UpdateRequestLeave;
