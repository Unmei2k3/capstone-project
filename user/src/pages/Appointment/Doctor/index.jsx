import { useEffect, useState } from "react";
import { Button, ConfigProvider, Menu, Modal, Table } from "antd";
import dayjs from "dayjs";
import viVN from "antd/locale/vi_VN";
import {
    CalendarOutlined,
    CheckCircleFilled,
    UserOutlined,
    MailOutlined,
} from "@ant-design/icons";
import "./styles.scss";
import { getDoctorByHospitalId } from "../../../services/doctorService";

dayjs.locale("vi");

function AppointmentDoctor({ onNext, defaultValue, infomationValue, onBack }) {
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorModal, setSelectedDoctorModal] = useState(null);

    console.log("default value: " + defaultValue?.specialty?.name);
    useEffect(() => {
        const fetchApi = async () => {
            try {
                const result = await getDoctorByHospitalId(infomationValue.hospitalId);
                const filteredDoctors = defaultValue?.specialty
                    ? result.filter((doctor) =>
                        doctor.specializations.some(
                            (spec) => spec.id === defaultValue.specialty.id
                        )
                    )
                    : result;

                const doctorsWithKey = filteredDoctors.map((doctor, index) => ({
                    ...doctor,
                    key: index + 1,
                }));

                setDoctors(doctorsWithKey);
            } catch (error) {
                console.error("Lỗi khi fetch danh sách bác sĩ:", error);
            }
        };

        fetchApi();
    }, [infomationValue.hospitalId, defaultValue?.specialty?.id]);

    useEffect(() => {
        if (defaultValue?.doctor) {
            setSelectedDoctor(defaultValue.doctor);
        }
    }, [defaultValue]);
    const handleDetail = (doctor) => {
        setSelectedDoctorModal(doctor);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: "#",
            dataIndex: "key",
            key: "key",
            width: 50,
        },
        {
            title: "Bác sĩ",
            key: "doctor",
            render: (text, record) => (
                <div>
                    <strong>{record.user.fullname}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>{record.description}</div>
                </div>
            ),
        },
        {
            title: "Lịch làm việc",
            dataIndex: "schedule",
            key: "schedule",
        },
        {
            title: "",
            key: "action",
            width: 160,
            render: (_, record) => (
                <div style={{ display: "flex", gap: 8 }}>
                    <Button
                        type="default"
                        style={{
                            borderRadius: 6,
                            backgroundColor: "#eaf6ff",
                            color: "#00baff",
                            border: "none",
                        }}
                        onClick={() => handleDetail(record)}
                    >
                        Xem chi tiết
                    </Button>
                </div>


            ),
        },

    ];

    const items = [
        {
            key: "center",
            label: (
                <span style={{ fontWeight: 600 }}>
                    Trung Tâm Bác Sĩ Chuyên Khoa Doctor Check
                </span>
            ),
        },
        {
            key: "date",
            label: (
                <span style={{ color: "#00bfff", fontWeight: 600 }}>
                    Danh sách bác sĩ
                </span>
            ),
        },
    ];

    return (
        <div
            style={{
                background: "#eaf8ff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Menu
                mode="horizontal"
                selectedKeys={[]}
                style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 16,
                    boxShadow: "none",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 50,
                }}
                items={items}
                disabledOverflow
            />

            <ConfigProvider locale={viVN}>
                <div
                    className="responsive-container"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: 32,
                        height: "fit-content",
                        padding: 40,
                    }}
                >
                    {/* Info box */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 2px 8px #e6f4ff",
                            width: 340,
                            minWidth: 300,
                            paddingBottom: 24,
                        }}
                    >
                        <div
                            style={{
                                background:
                                    "linear-gradient(90deg, #00bfff 60%, #00eaff 100%)",
                                color: "#fff",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                fontWeight: 600,
                                fontSize: 18,
                                padding: "16px 24px",
                            }}
                        >
                            Thông tin cơ sở y tế
                        </div>
                        <div
                            style={{ padding: "24px 24px 0 24px", fontSize: 15 }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                <CheckCircleFilled
                                    style={{ color: "#00bfff", marginRight: 8 }}
                                />
                                {infomationValue.hospitalName}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Dịch vụ: {infomationValue.serviceName}</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Chuyên khoa:</span> {defaultValue?.specialty?.name}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined
                                    style={{ color: "#00bfff", marginRight: 8 }}
                                />
                                <span style={{ fontWeight: 500 }}>
                                    Bác sĩ: {selectedDoctor?.user?.fullname}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 50 }}>

                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                boxShadow: "0 2px 8px #e6f4ff",
                                width: "auto",
                                maxWidth: 600,
                                paddingBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "linear-gradient(90deg, #00bfff 60%, #00eaff 100%)",
                                    color: "#fff",
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    minWidth: 460,
                                    fontWeight: 600,
                                    fontSize: 20,
                                    padding: "16px 24px",
                                    marginBottom: 0,
                                }}
                            >
                                Danh sách bác sĩ
                            </div>

                            <Table
                                dataSource={doctors}
                                columns={columns}
                                pagination={false}
                                rowKey="key"
                                style={{
                                    maxHeight: 300,
                                    overflowY: "auto",
                                    marginTop: 16,
                                    borderRadius: 8,
                                    boxShadow: "0 2px 8px #e6f4ff",
                                }}
                                onRow={(record) => ({
                                    onClick: () => {
                                        setSelectedDoctor(record);
                                    },
                                    style: { cursor: 'pointer' }
                                })}
                            />

                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
                            <Button
                                onClick={onBack}
                                style={{
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                ← Quay lại
                            </Button>

                            <Button
                                type="primary"
                                disabled={!selectedDoctor}
                                style={{
                                    borderRadius: 6,
                                    backgroundColor: "#00cfff",
                                    borderColor: "#00cfff",
                                }}
                                onClick={() => onNext({ doctor: selectedDoctor })}
                            >

                                Tiếp tục →
                            </Button>
                        </div>
                    </div>
                </div>

            </ConfigProvider>

            {/* Modal chi tiết bác sĩ */}
            <Modal
                title={
                    <span style={{ color: "black", fontSize: 20, fontWeight: 600 }}>
                        🩺 Thông tin chi tiết bác sĩ
                    </span>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                bodyStyle={{
                    padding: 16,
                    borderRadius: "0 0 8px 8px",
                }}
            >
                {selectedDoctorModal && (
                    <div style={{ fontSize: 15, lineHeight: "1.8" }}>
                        {selectedDoctorModal?.user?.avatarUrl && (
                            <div style={{ textAlign: "center", marginBottom: 20 }}>
                                <img
                                    src={selectedDoctorModal.user.avatarUrl}
                                    alt="Avatar"
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "3px solid #00bfff",
                                    }}
                                />
                            </div>
                        )}

                        <p>
                            <UserOutlined style={{ color: "#00bfff", marginRight: 8 }} />
                            <strong>Họ tên:</strong> {selectedDoctorModal?.user?.fullname || "Chưa cập nhật"}
                        </p>
                        <p>
                            <MailOutlined style={{ color: "#00bfff", marginRight: 8 }} />
                            <strong>Email:</strong> {selectedDoctorModal?.user?.email || "Chưa cập nhật"}
                        </p>
                        <p>
                            <UserOutlined style={{ color: "#00bfff", marginRight: 8 }} />
                            <strong>SĐT:</strong> {selectedDoctorModal?.user?.phoneNumber || "Chưa cập nhật"}
                        </p>
                        <p>
                            <strong>🧠 Chuyên khoa:</strong>{" "}
                            {selectedDoctorModal?.specializations
                                ?.map((s) => s.name)
                                .join(", ") || "Chưa cập nhật"}
                        </p>
                        <p>
                            <strong>🎓 Bằng cấp:</strong>
                            <ul style={{ paddingLeft: 20 }}>
                                {selectedDoctorModal?.qualification?.map((q) => (
                                    <li key={q.id}>
                                        {q.qualificationName} - {q.instituteName} ({q.procurementYear})
                                    </li>
                                )) || <li>Chưa cập nhật</li>}
                            </ul>
                        </p>
                        <p>
                            <strong>🗓 Bắt đầu hành nghề:</strong>{" "}
                            {selectedDoctorModal?.practicingFrom
                                ? dayjs(selectedDoctorModal.practicingFrom).format("DD/MM/YYYY")
                                : "Chưa cập nhật"}
                        </p>
                        <p>
                            <strong>📝 Mô tả:</strong> {selectedDoctorModal?.description || "Chưa có mô tả"}
                        </p>
                    </div>
                )}
            </Modal>

        </div>
    );
}

export default AppointmentDoctor;
