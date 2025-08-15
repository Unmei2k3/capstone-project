import React, { useState, useEffect, useMemo } from "react";
import {
    Table,
    Input,
    Row,
    Col,
    Card,
    Tag,
    Badge,
    Tabs,
    ConfigProvider,
    Typography,
    Button,
    message,
    Select,
    Modal,
    Descriptions,
} from "antd";
import { SearchOutlined, EyeOutlined, CalendarOutlined } from "@ant-design/icons";
import viVN from "antd/es/locale/vi_VN";
import { useSelector, useDispatch } from "react-redux";
import { getAppointmentsByUserId, changeAppointmentStatus } from "../../../services/appointmentService";
import { getAllPatients } from "../../../services/userService";
import dayjs from "dayjs";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
const now = dayjs();
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const APPOINTMENT_STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    CANCELLED: 3,
    COMPLETED: 4,
    EXPIRED: 5,
};

const statusMap = {
    1: { text: "Chưa xác nhận", color: "gold" },
    2: { text: "Đã xác nhận", color: "green" },
    3: { text: "Đã hủy", color: "grey" },
    4: { text: "Hoàn thành", color: "blue" },
    5: { text: "Đã qua", color: "gray" },
};

const PatientAppointmentList = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user || null);
    const messageState = useSelector((state) => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);
    const [appointmentList, setAppointmentList] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [confirmCancelModalVisible, setConfirmCancelModalVisible] = useState(false);

    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch, messageApi]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getAllPatients();
                setPatients(data || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bệnh nhân", error);
                setPatients([]);
            }
        })();
    }, []);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
        });
    };

    const fetchAppointments = async (patientId) => {
        setLoading(true);
        try {
            const appointments = await getAppointmentsByUserId(patientId);

            const formatted = (appointments || []).map((item) => {

                const appointmentDateTime = dayjs(item.appointmentTime);

                const isExpired = appointmentDateTime.isBefore(now, "minute");

                let status = item.status;
                if (isExpired && status !== APPOINTMENT_STATUS.CANCELLED && status !== APPOINTMENT_STATUS.COMPLETED) {
                    status = APPOINTMENT_STATUS.EXPIRED;
                }

                const workDate = item.doctorSchedule?.workDate?.split("T")[0] || "";
                const startTimeStr = `${workDate}T${item.doctorSchedule?.startTime}`;
                const endTimeStr = `${workDate}T${item.doctorSchedule?.endTime || ""}`;

                return {
                    id: String(item.id),
                    patientName: patients.find((p) => p.id === item.patientId)?.fullname || "",
                    phoneNumber: item.patient?.phoneNumber || "",
                    doctorName: item.doctorSchedule?.doctorProfile?.description || "Không rõ",
                    specializationName: item.doctorSchedule?.specialization?.name || "",
                    appointmentTime: formatDateTime(item.appointmentTime),
                    workDate,
                    startTime: formatDateTime(startTimeStr),
                    endTime: dayjs(endTimeStr).format("HH:mm"),
                    status,
                    note: item.note || "",
                    roomName: item.doctorSchedule?.room?.name || "",
                    serviceName: item.serviceName || item.service?.name || "",
                    rawData: item,
                };
            });
            setAppointmentList(formatted);
        } catch (error) {
            message.error("Lỗi khi tải danh sách lịch hẹn");
            setAppointmentList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedPatientId) {
            setAppointmentList([]);
            return;
        }
        fetchAppointments(selectedPatientId);
    }, [selectedPatientId, patients]);

    const statusCounts = useMemo(() => {
        const counts = { all: 0 };
        Object.keys(statusMap).forEach((k) => (counts[k] = 0));

        appointmentList.forEach((item) => {
            counts.all++;
            if (item.status in counts) counts[item.status]++;
        });
        return counts;
    }, [appointmentList]);

    const filteredAppointments = useMemo(() => {
        const lowerSearch = searchText.toLowerCase();
        return appointmentList.filter((item) => {
            const statusMatch = activeTab === "all" || String(item.status) === activeTab;
            const searchMatch =
                item.patientName.toLowerCase().includes(lowerSearch) ||
                item.doctorName.toLowerCase().includes(lowerSearch) ||
                item.serviceName.toLowerCase().includes(lowerSearch) ||
                item.roomName.toLowerCase().includes(lowerSearch) ||
                item.id.toLowerCase().includes(lowerSearch);
            return statusMatch && searchMatch;
        });
    }, [appointmentList, searchText, activeTab]);

    const handleChangeStatus = async () => {
        if (!selectedAppointment) return;

        const appointmentId = selectedAppointment.id;
        const currentStatus = selectedAppointment.status;

        let newStatus;

        if (currentStatus === APPOINTMENT_STATUS.PENDING) {
            newStatus = APPOINTMENT_STATUS.CONFIRMED;
        } else if (currentStatus === APPOINTMENT_STATUS.CONFIRMED) {
            newStatus = APPOINTMENT_STATUS.COMPLETED;
        } else {
            message.warning("Không thể đổi trạng thái từ trạng thái hiện tại.");
            return;
        }

        try {
            await changeAppointmentStatus(appointmentId, newStatus);
            dispatch(
                setMessage({
                    type: "success",
                    content: `Đã cập nhật trạng thái thành "${newStatus === APPOINTMENT_STATUS.CONFIRMED ? "Chấp nhận" : "Hoàn thành"
                        }".`,
                })
            );
            setModalOpen(false);
            setSelectedAppointment(null);
            await fetchAppointments(selectedPatientId);
        } catch (error) {
            dispatch(setMessage({ type: "error", content: "Đổi trạng thái không thành công!" }));
        }
    };

    // Show confirm cancel modal
    const showConfirmCancelModal = () => {
        setConfirmCancelModalVisible(true);
    };

    // Handle confirm cancel appointment
    const handleConfirmCancel = async () => {
        setConfirmCancelModalVisible(false);
        if (!selectedAppointment) return;
        if (selectedAppointment.status === APPOINTMENT_STATUS.CANCELLED) {
            message.warning("Lịch hẹn đã được hủy trước đó");
            return;
        }
        try {
            await changeAppointmentStatus(selectedAppointment.id, APPOINTMENT_STATUS.CANCELLED);
            dispatch(setMessage({ type: "success", content: "Hủy lịch hẹn thành công!" }));
            setModalOpen(false);
            setSelectedAppointment(null);
            await fetchAppointments(selectedPatientId);
        } catch (error) {
            dispatch(setMessage({ type: "error", content: "Hủy lịch hẹn không thành công!" }));
        }
    };

    const nextStatusLabel = (() => {
        if (!selectedAppointment) return null;
        const status = selectedAppointment.status;
        switch (status) {
            case APPOINTMENT_STATUS.PENDING:
                return "Chấp nhận";
            case APPOINTMENT_STATUS.CONFIRMED:
                return "Hoàn thành";
            default:
                return null;
        }
    })();

    const columns = [
        { title: "Mã lịch hẹn", dataIndex: "id", key: "id" },
        { title: "Bệnh nhân", dataIndex: "patientName", key: "patientName" },
        {
            title: "Thời gian khám",
            key: "appointmentTime",
            render: (_, record) => `${record.startTime} - ${record.endTime}`,
        },
        { title: "Phòng", dataIndex: "roomName", key: "roomName" },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => {
                const st = statusMap[record.status];
                return st ? <Tag color={st.color}>{st.text}</Tag> : <Tag color="default">Không rõ</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedAppointment(record);
                        setModalOpen(true);
                    }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <>
            {contextHolder}
            <ConfigProvider locale={viVN}>
                <div>
                    <Row gutter={[16, 24]} style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={3}>
                                        <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                        Lịch hẹn của bệnh nhân
                                    </Title>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn bệnh nhân"
                                optionFilterProp="children"
                                value={selectedPatientId}
                                onChange={setSelectedPatientId}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                style={{ width: "100%" }}
                            >
                                {patients.map((p) => (
                                    <Option key={p.id} value={p.id}>
                                        {p.fullname || `Bệnh nhân #${p.id}`}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {/* <Col xs={24} sm={12} md={8} lg={6}>
                            <Input
                                placeholder="Tìm kiếm..."
                                prefix={<SearchOutlined />}
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col> */}
                    </Row>

                    <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
                        <TabPane key="all" tab={<span>Tất cả <Badge count={statusCounts.all} /></span>} />
                        {Object.entries(statusMap).map(([key, val]) => (
                            <TabPane
                                key={key}
                                tab={
                                    <span>
                                        {val.text} <Badge count={statusCounts[key]} style={{ backgroundColor: val.color }} />
                                    </span>
                                }
                            />
                        ))}
                    </Tabs>

                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Table
                            columns={columns}
                            dataSource={filteredAppointments}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: "max-content" }}
                        />
                    </Card>

                    {/* Modal xem chi tiết */}
                    <Modal
                        visible={modalOpen}
                        title="Chi tiết lịch hẹn"
                        footer={
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    {selectedAppointment?.status !== APPOINTMENT_STATUS.EXPIRED && nextStatusLabel && (
                                        <Button
                                            type="primary"
                                            onClick={handleChangeStatus}
                                            style={{ marginRight: 8 }}
                                            disabled={
                                                !nextStatusLabel ||
                                                selectedAppointment?.status === APPOINTMENT_STATUS.CANCELLED ||
                                                selectedAppointment?.status === APPOINTMENT_STATUS.COMPLETED
                                            }
                                        >
                                            {nextStatusLabel}
                                        </Button>
                                    )}

                                    <Button
                                        danger
                                        onClick={showConfirmCancelModal}
                                        disabled={
                                            selectedAppointment?.status === APPOINTMENT_STATUS.CANCELLED ||
                                            selectedAppointment?.status === APPOINTMENT_STATUS.COMPLETED ||
                                            selectedAppointment?.status === APPOINTMENT_STATUS.EXPIRED
                                        }
                                    >
                                        Hủy
                                    </Button>
                                </div>
                                <Button onClick={() => setModalOpen(false)}>Đóng</Button>
                            </div>
                        }
                        onCancel={() => setModalOpen(false)}
                        width={700}
                        centered
                    >
                        {selectedAppointment ? (
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Mã lịch hẹn">{selectedAppointment.id}</Descriptions.Item>
                                <Descriptions.Item label="Dịch vụ">{selectedAppointment.serviceName}</Descriptions.Item>
                                <Descriptions.Item label="Thời gian hẹn">{formatDateTime(selectedAppointment.appointmentTime)}</Descriptions.Item>
                                <Descriptions.Item label="Bác sĩ">{selectedAppointment.doctorProfile?.description || selectedAppointment.doctorName || "Không rõ"}</Descriptions.Item>
                                <Descriptions.Item label="Chuyên khoa">{selectedAppointment.doctorSchedule?.specialization?.name || selectedAppointment.specializationName || "Không rõ"}</Descriptions.Item>
                                <Descriptions.Item label="Phòng">{selectedAppointment.doctorSchedule?.room?.name || selectedAppointment.roomName || "Không rõ"}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">{statusMap[selectedAppointment.status]?.text || "Không rõ"}</Descriptions.Item>
                                <Descriptions.Item label="Ghi chú">{selectedAppointment.note || "Không có"}</Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <p>Không có dữ liệu</p>
                        )}
                    </Modal>

                    {/* Modal xác nhận hủy */}
                    <Modal
                        visible={confirmCancelModalVisible}
                        title="Xác nhận hủy lịch hẹn"
                        onOk={handleConfirmCancel}
                        onCancel={() => setConfirmCancelModalVisible(false)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        centered
                    >
                        <p>Bạn có chắc chắn muốn hủy lịch hẹn này không? Thao tác này không thể hoàn tác.</p>
                    </Modal>
                </div>
            </ConfigProvider>
        </>
    );
};

export default PatientAppointmentList;
