import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Spin, message } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { updateDepartment, getDepartmentById } from '../../../services/departmentService';
import { useSelector, useDispatch } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';

const { TextArea } = Input;

const EditDepartment = ({ visible, record, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message);
  const user = useSelector((state) => state.user?.user);
  const hospitalId = user?.hospitals?.[0]?.id;

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
    if (visible && record?.id) {
      fetchDepartmentDetails(record.id);
    }
  }, [visible, record]);

  const fetchDepartmentDetails = async (departmentId) => {
    setLoading(true);



    try {
      const departmentData = await getDepartmentById(departmentId);
      if (departmentData) {
        form.setFieldsValue({
          name: departmentData.name || '',
          description: departmentData.description || '',
        });


      }
    } catch (error) {
      console.error('Error fetching department:', error);

      dispatch(setMessage({
        type: 'error',
        content: '❌ Không thể tải thông tin khoa. Vui lòng thử lại.'
      }));

      if (error.response?.data?.message) {
        setTimeout(() => {
          dispatch(setMessage({
            type: 'warning',
            content: `Chi tiết lỗi: ${error.response.data.message}`
          }));
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    // Validation
    if (!hospitalId) {
      dispatch(setMessage({
        type: 'error',
        content: '❌ Không tìm thấy ID bệnh viện. Vui lòng đăng nhập lại.'
      }));
      return;
    }

    if (!record?.id) {
      dispatch(setMessage({
        type: 'error',
        content: '❌ Không tìm thấy ID khoa. Vui lòng thử lại.'
      }));
      return;
    }

    setSpinning(true);



    try {
      const updatePayload = {
        id: Number(record.id),
        hospitalId: Number(hospitalId),
        name: values.name.trim(),
        description: values.description.trim()
      };

      console.log('📤 Payload gửi đi:', updatePayload);

      const response = await updateDepartment(updatePayload);

      // Success
      dispatch(setMessage({
        type: 'success',
        content: `✅ Cập nhật khoa "${values.name.trim()}" thành công!`
      }));



      // Call success callback
      setTimeout(() => {
        onSuccess({
          ...record,
          name: values.name.trim(),
          description: values.description.trim()
        });
      }, 1000);

    } catch (error) {
      console.error('💥 Lỗi cập nhật khoa:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';

      dispatch(setMessage({
        type: 'error',
        content: `❌ Không thể cập nhật khoa "${values.name.trim()}": ${errorMessage}`
      }));

      if (error.response?.status) {
        setTimeout(() => {
          dispatch(setMessage({
            type: 'warning',
            content: `🔍 Mã lỗi: ${error.response.status} - ${error.response.statusText || 'Unknown'}`
          }));
        }, 1500);
      }
    } finally {
      setSpinning(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();

    dispatch(setMessage({
      type: 'info',
      content: `🚫 Đã hủy chỉnh sửa khoa "${record?.name || ''}"`
    }));

    onCancel();
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              Chỉnh sửa Khoa: {record?.name || 'Không rõ'}
            </span>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
        maskClosable={false}
        centered
      >
        <Spin spinning={spinning || loading} tip={loading ? "Đang tải dữ liệu..." : "Đang cập nhật..."}>
          <div style={{ padding: '20px 0' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              preserve={false}
            >
              <Form.Item
                name="name"
                label="Tên khoa"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khoa' },
                  { min: 2, message: 'Tên khoa phải có ít nhất 2 ký tự' },
                  { max: 100, message: 'Tên khoa không được quá 100 ký tự' },
                  {
                    validator: (_, value) => {
                      if (value && value.trim().length === 0) {
                        return Promise.reject(new Error('Tên khoa không được chỉ chứa khoảng trắng'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  placeholder="Nhập tên khoa..."
                  showCount
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả khoa"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả khoa' },
                  { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                  { max: 500, message: 'Mô tả không được quá 500 ký tự' }
                ]}
              >
                <TextArea
                  placeholder="Nhập mô tả khoa..."
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Button
                  onClick={handleCancel}
                  size="large"
                  disabled={spinning}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={spinning}
                  size="large"
                  disabled={loading}
                >
                  {spinning ? 'Đang cập nhật...' : 'Cập nhật Khoa'}
                </Button>
              </div>
            </Form>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default EditDepartment;