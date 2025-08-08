import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select,
  Space, message, ConfigProvider, Row, Col, Card
} from "antd";
import {
  PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, MedicineBoxOutlined
} from "@ant-design/icons";
import viVN from "antd/es/locale/vi_VN";
import ServiceFlowModal from "./ServiceFlowModal";
import { createService, deleteService, getHospitalServices, getServices, getStepByServiceId, getSteps, updateService } from "../../../services/medicalServiceService";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";

const { Option } = Select;

const MedicalServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [flowModalVisible, setFlowModalVisible] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [flag, setFlag] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message)
  useEffect(() => {
    const fetchApi = async () => {
      const result = await getHospitalServices(105);
      console.log("result in medical service : " + result);
      if (result) {
        setServices(result);
      } else {
        console.error("No step data found");
      }
    };
    fetchApi();
  }, [flag]);

  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,

      });
      dispatch(clearMessage());
    }
  }, [messageState, dispatch]);
  const showAddModal = (hospitalId) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ hospitalId: Number(hospitalId) });
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue({
      id: record.id,
      hospitalId: record.hospitalId,
      name: record.name,
      description: record.description,
      price: record.price
    });
    setModalVisible(true);
  };



  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { id, hospitalId, name, price, description } = values;

      if (id) {
        const updated = { id, hospitalId, name, price: parseInt(price, 10), description };
        console.log("updated service is : " + id, hospitalId, name, price, description);
        await updateService(updated);
        dispatch(setMessage({ type: 'success', content: 'Cập nhật thành công!' }));
      } else {
        const newService = {
          hospitalId,
          name,
          description,
          price: parseInt(price, 10),
        };
        console.log("alues from form:", values);
        await createService(newService);
        dispatch(setMessage({ type: 'success', content: 'Thêm mới thành công!' }));

      }
      setFlag(prev => !prev);
      setModalVisible(false);

    }
    catch (error) {
      dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin dịch vụ, vui lòng thử lại sau!' }));

      console.error(error);
    }
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteService(deletingRecord.id);

      dispatch(setMessage({ type: 'success', content: 'Xoá dịch vụ ' + deletingRecord.name + ' thành công!' }));
      setDeleteModalVisible(false);
      setDeletingRecord(null);
      setFlag(prev => !prev);
    } catch (error) {
      dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin dịch vụ!' }));

      console.error(error);
    }
  };

  const filteredData = services.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "#",
      key: "index",
      width: 80,
      render: (_, __, index) => (
        <span style={{ color: "gray" }}>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Mô tả",
      width: 300,
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} đ`
    },

    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Sửa
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={async () => {
              try {
                const flowSteps = await getStepByServiceId(record.id);
                console.log("Flow steps is : " + flowSteps);
                setEditingFlow({
                  id: record.id,
                  name: record.name,
                  flow: flowSteps,
                });
                setFlowModalVisible(true);
              } catch (error) {
                message.error("Không thể tải luồng dịch vụ");
              }
            }}
          >
            Luồng
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => showDeleteModal(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <ConfigProvider locale={viVN}>
        <div className="medical-service-container">
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h2><MedicineBoxOutlined style={{ marginRight: 8 }} />Danh sách dịch vụ y tế</h2>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showAddModal(105)}
                    size="large"
                  >
                    Thêm dịch vụ
                  </Button>
                </Col>
              </Row>

            </Col>

            <Col span={24}>
              <Card>
                <Row style={{marginBottom: 25}}>
                  <Col span={8}>
                    <Input.Search
                      placeholder="Tìm theo tên dịch vụ..."
                      enterButton={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </Col>
                </Row>
                <Table
                  dataSource={filteredData}
                  rowKey="id"
                  columns={columns}
                   pagination={{
                    ...pagination,
                    onChange: (page, pageSize) =>
                      setPagination({ current: page, pageSize }),
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Modal
            title="Xác nhận xóa dịch vụ"
            open={deleteModalVisible}
            onCancel={() => setDeleteModalVisible(false)}
            onOk={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            {deletingRecord && (
              <div>
                <p>Bạn có chắc chắn muốn xóa dịch vụ này?</p>
                <p><strong>Tên dịch vụ:</strong> {deletingRecord.name}</p>
              </div>
            )}
          </Modal>

          <Modal
            title={editing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical">
              <Form.Item name="id" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="hospitalId" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="Tên dịch vụ"
                rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <Input placeholder="Mô tả" />
              </Form.Item>
              <Form.Item
                name="price"
                label="Giá tiền (VND)"
                rules={[
                  { required: true, message: "Vui lòng nhập giá tiền" },
                  { pattern: /^[0-9]+$/, message: "Giá tiền phải là số" }
                ]}
              >
                <Input />
              </Form.Item>

            </Form>
          </Modal>

          <ServiceFlowModal
            open={flowModalVisible}
            onCancel={() => setFlowModalVisible(false)}
            flowData={editingFlow}
            onSave={(updatedFlow) => {
              console.log("update success : " + updatedFlow.flow);
              setFlowModalVisible(false);
              dispatch(setMessage({ type: 'success', content: 'Cập nhật luồng thành công!' }));

            }}
          />

        </div>
      </ConfigProvider>
    </>

  );
};

export default MedicalServiceManagement;
