import React, { useEffect, useState } from "react";
import {
    Table, Button, Modal, Form, Input, Select, Space, message,
    Row, Col, ConfigProvider, Card, Switch
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    DeleteOutlined,
    EditOutlined,
    AppstoreOutlined,
    UploadOutlined
} from "@ant-design/icons";
import * as XLSX from 'xlsx';
import viVN from "antd/es/locale/vi_VN";
import { useRef } from "react";
import { createSpecialization, deleteSpecialization, getSpecializationList, updateSpecialization } from "../../../services/specializationService";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";


const ManageSpecialist = () => {
    const dispatch = useDispatch();
    const [specialists, setSpecialists] = useState([]);
    const [flag, setFlag] = useState(false);
    const [loadingSpecialists, setLoadingSpecialists] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message)

    useEffect(() => {
        const fetchApi = async () => {
            const result = await getSpecializationList();
            if (result) {
                setSpecialists(result);
                setLoadingSpecialists(false);
            } else {
                setLoadingSpecialists(true);
                console.error("No hospital data found");
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
    const showAddModal = () => {
        setEditing(null);
        form.resetFields();
        setModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditing(record);
        form.setFieldsValue({
            id: record.id,
            name: record.name,
            description: record.description,
            image: record.image
        });
        setModalVisible(true);
    };

    const showDeleteModal = (record) => {
        setDeletingRecord(record);
        setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            await deleteSpecialization(deletingRecord.id);

            dispatch(setMessage({ type: 'success', content: 'Xoá chuyên khoa ' + deletingRecord.name + ' thành công!' }));
            setDeleteModalVisible(false);
            setDeletingRecord(null);
            setFlag(prev => !prev);
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin chuyên khoa!' }));

            console.error(error);
        }
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const { id, name, description, image } = values;
            console.log("Updating attribute specialist:", id, name, description, image);
            if (id) {
                const updated = { id, name, description, image };
                console.log("Updating specialist:", updated);
                await updateSpecialization(updated);
                dispatch(setMessage({ type: 'success', content: 'Cập nhật thành công!' }));
            } else {
                const newSpecialist = {
                    name,
                    description,
                    image
                };
                await createSpecialization(newSpecialist);
                dispatch(setMessage({ type: 'success', content: 'Thêm mới thành công!' }));
            }
            setFlag(prev => !prev);
            setModalVisible(false);
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: 'Lỗi xử lý thông tin chuyên khoa!' }));

            console.error(error);
        }
    };
    const fileInputRef = useRef();

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            const newItems = json.map((row, index) => ({
                id: Date.now() + index,
                name: row.name || '',
                img: row.img || ''
            }));

            const validItems = newItems.filter(i => i.name);
            setSpecialists(prev => [...prev, ...validItems]);
            message.success(`Đã nhập ${validItems.length} dòng từ Excel`);
        };
        reader.readAsArrayBuffer(file);
    };

    const filteredData = specialists.filter((s) => {
        const keyword = searchText.toLowerCase();
        return (
            s.name.toLowerCase().includes(keyword)
        );
    });
    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            width: 80,
            render: (id) =>
                id ? <span style={{ color: "gray" }}>{id}</span> : <span style={{ color: "gray" }}>Không có ID</span>,
            sorter: (a, b) => a.id - b.id
        },
        {
            title: ("Tên chuyên khoa"),
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
            key: "img",
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
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Sửa
                    </Button>
                    <Button icon={<DeleteOutlined />} danger onClick={() => showDeleteModal(record)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];
    return (
        <> {contextHolder}
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
                            {/* <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                                Nhập từ Excel
                            </Button> */}
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                ref={fileInputRef}
                                onChange={handleExcelUpload}
                                style={{ display: "none" }}
                            />
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
                        title={editing ? "Chỉnh sửa chuyên khoa" : "Thêm chuyên khoa mới"}
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
                            <Form.Item
                                name="name"
                                label="Tên chuyên khoa"
                                rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
                            >
                                <Input placeholder="Tên chuyên khoa" />
                            </Form.Item>
                            <Form.Item
                                name="description"
                                label="Mô tả"
                            >
                                <Input placeholder="Mô tả" />
                            </Form.Item>
                            <Form.Item
                                name="image"
                                label="Link ảnh chuyên khoa"
                            >
                                <Input placeholder="https://example.com/image.png" />
                            </Form.Item>
                        </Form>

                    </Modal>
                </div>
            </ConfigProvider>
        </>

    );
};


export default ManageSpecialist;
