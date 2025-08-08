import React, { useEffect, useState, useRef } from "react";
import {
  Table, Button, Modal, Form, Select, Space, message,
  Row, Col, ConfigProvider, Card,
  Input
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import viVN from "antd/es/locale/vi_VN";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import {
  getSpecializationsByHospitalId
} from "../../../services/hospitalService";
import { addSpecializationToHospital, deleteSpecializationFromHospital, getSpecializationList } from "../../../services/specializationService";

const ManageSpecialist = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const [specialists, setSpecialists] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector(state => state.message);

  useEffect(() => {
    const fetchHospitalSpecialization = async () => {
      if (!user?.hospitals?.length) return;
      try {
        setLoadingSpecialists(true);
        const result = await getSpecializationsByHospitalId(user.hospitals[0].id);
        setSpecialists(result || []);
      } catch (error) {
        console.error("Lấy danh sách chuyên khoa bệnh viện lỗi:", error);
      } finally {
        setLoadingSpecialists(false);
      }
    };
    fetchHospitalSpecialization();
  }, [user]);

  useEffect(() => {
    const fetchAllSpecializations = async () => {
      try {
        const list = await getSpecializationList();
        setAllSpecializations(list || []);
      } catch (error) {
        console.error("Lấy danh sách chuyên khoa lỗi:", error);
      }
    };
    fetchAllSpecializations();
  }, []);

  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,
      });
      dispatch(clearMessage());
    }
  }, [messageState, dispatch]);

  const showAddModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const showDeleteModal = (record) => {
    setDeletingRecord(record);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      if (!user?.hospitals?.length) throw new Error("Không xác định bệnh viện");
        console.log("hospital id : " + user.hospitals[0].id, "deleting record id : " + deletingRecord.id);
      await deleteSpecializationFromHospital(user.hospitals[0].id, deletingRecord.id);
      dispatch(setMessage({ type: 'success', content: `Xoá chuyên khoa ${deletingRecord.name} thành công!` }));

      setDeleteModalVisible(false);
      setDeletingRecord(null);

      const result = await getSpecializationsByHospitalId(user.hospitals[0].id);
      setSpecialists(result || []);
    } catch (error) {
      dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin chuyên khoa!' }));
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const specializationId = values.specializationId;
      if (!specializationId) return;

      if (!user?.hospitals?.length) throw new Error("Không xác định bệnh viện");

      await addSpecializationToHospital(user.hospitals[0].id, specializationId);

      dispatch(setMessage({ type: 'success', content: 'Thêm mới chuyên khoa thành công!' }));
      setModalVisible(false);

      // Load lại danh sách hiện tại
      const result = await getSpecializationsByHospitalId(user.hospitals[0].id);
      setSpecialists(result || []);
    } catch (error) {
      console.error(error);
      dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin chuyên khoa!' }));
    }
  };

  // Lọc dữ liệu theo search
  const filteredData = specialists.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) =>
        id ? <span style={{ color: "gray" }}>{id}</span> : <span style={{ color: "gray" }}>Không có ID</span>,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tên chuyên khoa",
      width: 380,
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
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? <img src={image} alt="Ảnh" width={60} height={60} style={{ objectFit: "cover", borderRadius: 6 }} />
          : <span style={{ color: "gray" }}>Không có ảnh</span>
    },
    {
      title: "Hành động",
      align: "center",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* Bỏ nút sửa theo yêu cầu */}
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
        <div style={{ padding: 20, background: '#fff' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <h2><AppstoreOutlined style={{ marginRight: 8 }} />Quản lý chuyên khoa</h2>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{ marginRight: 8 }}>
                Thêm chuyên khoa
              </Button>
            </Col>
          </Row>

          <Card>
            <Row style={{ marginBottom: 25 }}>
              <Col span={8}>
                <Input.Search
                  placeholder="Tìm kiếm..."
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginTop: 8 }}
                  allowClear
                />
              </Col>
            </Row>
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loadingSpecialists}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>

          <Modal
            title="Xác nhận xóa chuyên khoa"
            open={deleteModalVisible}
            onCancel={() => setDeleteModalVisible(false)}
            onOk={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            {deletingRecord && (
              <div>
                <p>Bạn có chắc chắn muốn xóa chuyên khoa sau?</p>
                <p><strong>Tên chuyên khoa:</strong> {deletingRecord.name}</p>
              </div>
            )}
          </Modal>

          <Modal
            title="Thêm chuyên khoa mới"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="specializationId"
                label="Chọn chuyên khoa"
                rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn chuyên khoa"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allSpecializations.map(spec => (
                    <Select.Option key={spec.id} value={spec.id}>
                      {spec.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </ConfigProvider>
    </>
  );
};

export default ManageSpecialist;
