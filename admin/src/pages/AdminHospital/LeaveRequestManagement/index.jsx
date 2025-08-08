import React, { useState, useMemo, useEffect } from "react";
import {
    Table, Modal, Button, Tag, message, Space, Tabs,
    Input, Row, Col, Card, Badge, ConfigProvider
} from "antd";
import {
    EyeOutlined, CheckOutlined, CloseOutlined, ScheduleOutlined, SearchOutlined
} from "@ant-design/icons";
import "./style.scss";
import viVN from "antd/es/locale/vi_VN";
import { useSelector } from "react-redux";
import { getRequestsByHospital, updateRequest } from "../../../services/requestService";

const { TabPane } = Tabs;

const mapReasonToRequestType = (type) => {
    switch (type) {
        case 1:
            return 'Nghỉ phép';
        case 2:
            return 'Nghỉ ốm';
        case 3:
            return 'Đi công tác';
        case 4:
            return "Khác";
        default:
            return 'Khác';
    }
};


const LeaveRequestManagement = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const user = useSelector((state) => state.user.user);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const isRequestExpired = (startDate) => {
        if (!startDate) return false;
        const today = new Date();
        const start = new Date(startDate);
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        return start < today;
    };

    const updateStatus = async (status) => {
        if (!selectedRequest) return;

        try {
            setModalLoading(true);
            const payload = {
                requestId: selectedRequest.id,
                type: selectedRequest.requestType,
                status: status,
                startDate: selectedRequest.startDate,
                endDate: selectedRequest.endDate,
                reason: selectedRequest.reason,
            }
            console.log("Cập nhật trạng thái:", JSON.stringify(payload));
            await updateRequest(payload);
            message.success("Cập nhật trạng thái thành công");
            setSelectedRequest(null);
            const result = await getRequestsByHospital(user.hospitals[0].id);
            setLeaveRequests(result);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error("Cập nhật trạng thái thất bại");
        } finally {
            setModalLoading(false);
        }
    }

    useEffect(() => {
        const fetchStaffs = async () => {
            if (!user?.hospitals?.[0]?.id) return;

            try {
                const result = await getRequestsByHospital(user.hospitals[0].id);
                setLeaveRequests(result);
            } catch (error) {
                console.error("Lỗi khi tải danh sách xin nghỉ:", error);

            }
        };

        fetchStaffs();
    }, [user?.hospitals]);

    const showDetail = (record) => {
        setSelectedRequest(record);
    };

    const counts = useMemo(() => {
        const doctor = leaveRequests.filter(r => r.roleName === "Doctor").length;
        const nurse = leaveRequests.filter(r => r.roleName === "Nurse").length;
        const staff = leaveRequests.filter(r => r.roleName === "Hospital Staff").length;
        return {
            all: leaveRequests.length,
            doctor,
            nurse,
            staff,
        };
    }, [leaveRequests]);

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter(req =>
            (activeTab === "all" || req.roleName.toLowerCase() === activeTab) &&
            (req.requesterName.toLowerCase().includes(searchText.toLowerCase()) ||
                req.reason.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [leaveRequests, activeTab, searchText]);

    const columns = [
        {
            title: "Tên nhân viên",
            dataIndex: "requesterName",
            key: "requesterName"
        },
        {
            title: "Vai trò",
            dataIndex: "roleName",
            key: "roleName",
            render: (roleName) => {
                if (!roleName) return "Nhân viên y tế";
                const roleLower = roleName.toLowerCase();
                if (roleLower === "doctor") return "Bác sĩ";
                if (roleLower === "nurse") return "Y tá";
                return "Nhân viên y tế";
            }
        },
        {
            title: "Từ ngày",
            dataIndex: "startDate",
            key: "startDate",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : ""
        },
        {
            title: "Đến ngày",
            dataIndex: "endDate",
            key: "endDate",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : ""
        },
        {
            title: "Lý do",
            dataIndex: "requestType",
            key: "requestType",
            render: (type) => mapReasonToRequestType(type),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const mapping = {
                    1: { color: "orange", label: "Chờ duyệt" },
                    2: { color: "green", label: "Đã duyệt" },
                    3: { color: "red", label: "Đã từ chối" },
                    4: { color: "default", label: "Đã hủy" },
                };
                const { color, label } = mapping[status] || { color: "default", label: "Không rõ" };
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Button icon={<EyeOutlined />} onClick={() => showDetail(record)}>Xem</Button>
            )
        }
    ];


    return (
        <ConfigProvider locale={viVN}>
            <div className="leave-request-management">
                <Row gutter={[0, 24]}>
                    <Col span={24}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <h2><ScheduleOutlined style={{ marginRight: 8 }} />Quản lý yêu cầu nghỉ phép</h2>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={24}>
                        <Card>
                            <Row className="actions-row" style={{ marginBottom: 16 }}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Input.Search
                                        placeholder="Tìm theo tên hoặc lý do"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        enterButton={<SearchOutlined />}
                                        allowClear
                                        size="middle"
                                    />
                                </Col>
                            </Row>

                            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                <TabPane
                                    tab={<span>Tất cả <Badge count={counts.all} style={{ backgroundColor: '#1890ff' }} /></span>}
                                    key="all"
                                />
                                <TabPane
                                    tab={<span>Bác sĩ <Badge count={counts.doctor} /></span>}
                                    key="doctor"
                                />
                                <TabPane
                                    tab={<span>Y tá <Badge count={counts.nurse} /></span>}
                                    key="nurse"
                                />
                                <TabPane
                                    tab={<span>Nhân viên y tế <Badge count={counts.staff} /></span>}
                                    key="healthcare staff"
                                />
                            </Tabs>

                            <Table
                                dataSource={filteredRequests}
                                rowKey="id"
                                columns={columns}
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Chi tiết yêu cầu nghỉ phép"
                    open={!!selectedRequest}
                    onCancel={() => setSelectedRequest(null)}

                    footer={[
                        <Space key="actions">
                            {/* <Button
                                key="cancel"
                                icon={<CloseOutlined />}
                                loading={modalLoading}
                                onClick={() => updateStatus(4)}
                            >
                                Huỷ đơn
                            </Button> */}

                            <>
                                <Button
                                    icon={<CloseOutlined />}
                                    danger
                                    loading={modalLoading}
                                    onClick={() => updateStatus(3)}
                                    disabled={isRequestExpired(selectedRequest?.startDate)} 
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    icon={<CheckOutlined />}
                                    type="primary"
                                    loading={modalLoading}
                                    onClick={() => updateStatus(2)}
                                    disabled={isRequestExpired(selectedRequest?.startDate)} 
                                >
                                    Duyệt
                                </Button>
                            </>
                        </Space>
                    ]}
                >
                    {selectedRequest && (
                        <>
                            <p><b>Nhân viên:</b> {selectedRequest.requesterName}</p>

                            <p><b>Vai trò:</b> {
                                selectedRequest.roleName ? (
                                    selectedRequest.roleName.toLowerCase() === "doctor" ? "Bác sĩ" :
                                        selectedRequest.roleName.toLowerCase() === "nurse" ? "Y tá" :
                                            "Nhân viên y tế"
                                ) : "Nhân viên y tế"
                            }</p>

                            <p><b>Thời gian nghỉ:</b> {
                                selectedRequest.startDate ?
                                    new Date(selectedRequest.startDate).toLocaleDateString("vi-VN") : ""
                            } → {
                                    selectedRequest.endDate ?
                                        new Date(selectedRequest.endDate).toLocaleDateString("vi-VN") : ""
                                }</p>

                            <p><b>Lý do:</b> {mapReasonToRequestType(selectedRequest.requestType)}</p>

                            <p><b>Trạng thái:</b> {
                                {
                                    1: "Chờ duyệt",
                                    2: "Đã duyệt",
                                    3: "Đã từ chối"
                                }[selectedRequest.status] || "Không rõ"
                            }</p>
                        </>
                    )}
                </Modal>

            </div>

        </ConfigProvider>
    );
};

export default LeaveRequestManagement;
