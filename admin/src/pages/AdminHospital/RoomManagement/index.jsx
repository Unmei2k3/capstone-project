import React, { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select,
  Space, message, ConfigProvider, Row, Col, Card
} from "antd";
import {
  PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, ApartmentOutlined
} from "@ant-design/icons";
import viVN from "antd/es/locale/vi_VN";
import { useDispatch, useSelector } from "react-redux";
import {
  createHospitalRoom,
  deleteHospitalRoom,
  getHospitalRooms,
  updateHospitalRoom,
} from "../../../services/roomService";
import {
  getSpecializationsByHospitalId,
} from "../../../services/specializationService";
import { getAllDepartments } from "../../../services/departmentService";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";


const { Option } = Select;

const ManageRoom = () => {
  const user = useSelector((state) => state.user.user);
  const hospitalId = user?.hospitals[0]?.id;
  const [rooms, setRooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [departments, setDepartments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [flag, setFlag] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message)
  const dispatch = useDispatch();

  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,

      });
      dispatch(clearMessage());
    }
  }, [messageState, dispatch]);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchRooms = async () => {
      try {
        const result = await getHospitalRooms(hospitalId);
        setRooms(result);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };

    fetchRooms();
  }, [hospitalId, flag]);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchDepartments = async () => {
      try {
        const result = await getAllDepartments(hospitalId);
        if (result) setDepartments(result);
        else console.error("No department data found");
      } catch (error) {
        console.error(error);
      }
    };

    fetchDepartments();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchSpecialists = async () => {
      try {
        const result = await getSpecializationsByHospitalId(hospitalId);
        if (result) setSpecialists(result);
        else console.error("No specializations found");
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecialists();
  }, [hospitalId]);

  const showAddModal = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name || "",
      roomCode: record.roomCode || "",
      specialty: record.specialization?.id || null,
      department: record.department?.id || null,
      description: record.description || "",
    });
    setModalVisible(true);
  };

  const showDeleteModal = (record) => {
    console.log("handle delete is call", record);
    setRoomToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    try {
      console.log("delete in hospital : " + roomToDelete.id);
      await deleteHospitalRoom(roomToDelete.id);
      dispatch(setMessage({ type: 'success', content: 'Xoá phòng ' + roomToDelete.name + ' thành công!' }));
      setFlag((prev) => !prev);
    } catch (error) {
      dispatch(setMessage({ type: 'error', content: 'Xoá phòng khám thất bại!' }));
      console.error(error);
    } finally {
      setDeleteModalVisible(false);
      setRoomToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setRoomToDelete(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
       const { name, roomCode, specialty, department, description } = values;

      const payload = {
        specializationId: specialty,
        departmentId: department,
        hospitalId: hospitalId,
        roomName: name,
        roomCode: editing?.roomCode|| roomCode,
        description: description || "",
      };

      if (editing) {
        payload.roomId = editing.id;
        console.log("handle submit in edit room : " + JSON.stringify(payload));
        await updateHospitalRoom(editing.id, payload);
        dispatch(setMessage({ type: 'success', content: 'Cập nhật phòng khám thành công!' }));
      } else {
        console.log("handle submit in create room : " + JSON.stringify(payload));
        await createHospitalRoom(payload);
        dispatch(setMessage({ type: 'success', content: 'Thêm phòng khám thành công!' }));
      }

      setFlag((prev) => !prev);
      setModalVisible(false);
      setEditing(null);
      form.resetFields();
    } catch (error) {
      message.error("Lỗi khi lưu phòng khám");
      console.error(error);
    }
  };

  const filteredData = rooms.filter((dep) =>
    dep.name.toLowerCase().includes(searchText.toLowerCase())
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
      title: "Tên phòng khám",
      dataIndex: "name",
      width: 300,
      key: "name",
    },
    {
      title: "Mã phòng",
      dataIndex: "roomCode",
      width: 150,
      key: "roomCode",
    },
    {
      title: "Mô tả",
      width: 170,
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialization",
      key: "specialization",
      render: (specialization) =>
        specialization ? (
          <span>
            {specialization.name}
          </span>
        ) : (
          <span>Không có</span>
        ),
    },
    {
      title: "Khoa",
      dataIndex: "department",
      key: "department",
      render: (department) =>
        department ? (
          <span>{department.name}</span>
        ) : (
          <span>Không có</span>
        ),
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
            icon={<DeleteOutlined />}
            danger
            onClick={() => showDeleteModal(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <> {contextHolder}
      <ConfigProvider locale={viVN}>
        <div className="room-department-container">
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h2>
                    <ApartmentOutlined style={{ marginRight: 8 }} />
                    Quản lý phòng khám
                  </h2>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    size="large"
                  >
                    Thêm phòng khám
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
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
            title={editing ? "Chỉnh sửa phòng khám" : "Thêm phòng khám mới"}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleSubmit}
            okText={editing ? "Lưu" : "Thêm"}
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Tên phòng khám"
                rules={[{ required: true, message: "Vui lòng nhập tên phòng khám" }]}
              >
                <Input placeholder="Tên phòng khám" />
              </Form.Item>
              <Form.Item
                name="roomCode"
                label="Mã phòng"
              >
                <Input placeholder="Mã phòng" />
              </Form.Item>
              <Form.Item name="specialty" label="Chuyên khoa"  >
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Chọn chuyên khoa">
                  {specialists.map((spe) => (
                    <Option key={spe.id} value={spe.id}>
                      {spe.name}
                    </Option>

                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="department" label="Khoa" rules={[{ required: true, message: "Vui lòng chọn khoa" }]}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  placeholder="Chọn khoa">
                  {departments.map((dep) => (
                    <Option key={dep.id} value={dep.id}>
                      {dep.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <Input placeholder="Mô tả" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Xác nhận xóa phòng?"
            visible={deleteModalVisible}
            onOk={handleDeleteOk}
            onCancel={handleDeleteCancel}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <p>Bạn có chắc muốn xóa "{roomToDelete?.name}" không?</p>
          </Modal>
        </div>
      </ConfigProvider>
    </>
  );
};

export default ManageRoom;
