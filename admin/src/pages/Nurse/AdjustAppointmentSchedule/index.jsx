import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import {
  Modal,
  ConfigProvider,
  Select,
  Row,
  Col,
  message,
  Button,
  Typography,
  List,
  Tag,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useDispatch, useSelector } from "react-redux";

import { getDoctorByHospitalId } from "../../../services/doctorService";
import { getSpecializationsByHospitalId } from "../../../services/specializationService";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { getHospitalSpecializationSchedule } from "../../../services/scheduleService";
import { getAllPatients } from "../../../services/userService";
import {
  changeAppointmentStatus,
  changeAppointmentTime,
  getAppointmentsByUserId,
} from "../../../services/appointmentService";
import { getStepByServiceId } from "../../../services/medicalServiceService";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import "./style.scss";
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const APPOINTMENT_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  CANCELLED: 3,
  COMPLETED: 4,
};

const AdjustAppointmentSchedule = () => {
  const hospitalId = useSelector((state) => state.user.user?.hospitals?.[0]?.id);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [currentRange, setCurrentRange] = useState({
    start: dayjs().startOf("week"),
    end: dayjs().endOf("week"),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [flag, setFlag] = useState(false);
  const [filterDoctorId, setFilterDoctorId] = useState(null);
  const [filterSpecId, setFilterSpecId] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [serviceSteps, setServiceSteps] = useState([]);

  const messageState = useSelector((state) => state.message);
  const [messageApi, contextHolder] = message.useMessage();

  const [filterDateFrom, setFilterDateFrom] = useState(currentRange.start);
  const [filterDateTo, setFilterDateTo] = useState(currentRange.end);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSchedules = async () => {
      await loadAvailableSchedules(filterDoctorId, filterSpecId);
    };
    fetchSchedules();
  }, [filterDoctorId, filterSpecId, hospitalId, filterDateFrom, filterDateTo]);


  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,
      });
      dispatch(clearMessage());
    }
  }, [messageState, dispatch, messageApi]);

  const Legend = () => (
    <Row justify="center" gutter={16} style={{ marginBottom: 16 }}>
      <Col>
        <Tag icon={<PauseCircleOutlined />} color="#ffd600" style={{ borderRadius: 8, color: "#4e342e" }}>
          Chưa xác nhận
        </Tag>
      </Col>
      <Col>
        <Tag icon={<CheckCircleOutlined />} color="#43a047" style={{ borderRadius: 8 }}>
          Đã xác nhận
        </Tag>
      </Col>
      <Col>
        <Tag color="#1e88e5" style={{ borderRadius: 8 }}>
          Hoàn thành
        </Tag>
      </Col>
      <Col>
        <Tag icon={<StopOutlined />} color="#bdbdbd" style={{ borderRadius: 8 }}>
          Đã hủy
        </Tag>
      </Col>
    </Row>
  );

  const defaultEventColor = {
    backgroundColor: "#cfd8dc",
    borderColor: "#42a5f5",
    textColor: "#0d47a1",
  };
  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    const status = extendedProps.status;

    let icon = null;
    let color = "#174378";
    let statusColor = "#0b2a44";

    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        icon = <PauseCircleOutlined style={{ color: "#fbc02d", marginRight: 6 }} />;
        color = "#795548";
        statusColor = "#5d4037";
        break;
      case APPOINTMENT_STATUS.CONFIRMED:
        icon = <CheckCircleOutlined style={{ color: "#388e3c", marginRight: 6 }} />;
        color = "#1b5e20";
        statusColor = "#2e7d32";
        break;
      case APPOINTMENT_STATUS.COMPLETED:
        icon = <CalendarOutlined style={{ color: "#1976d2", marginRight: 6 }} />;
        color = "#0d47a1";  
        statusColor = "#0b3d91";
        break;
      case APPOINTMENT_STATUS.CANCELLED:
        icon = <StopOutlined style={{ color: "#9e9e9e", marginRight: 6 }} />; // xám mềm
        color = "#424242";  // xám đen nhẹ
        statusColor = "#616161";
        break;
      default:
        color = "#174378";
        statusColor = "#0b2a44";
    }

    return (
      <div style={{ padding: "4px 8px", whiteSpace: "normal" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {icon}
          <b style={{ color, flex: 1, fontWeight: "700", fontSize: 14 }}>{title}</b>
        </div>
        <div style={{ marginTop: 2, fontSize: 12, color }}>
          <span style={{ fontWeight: "600" }}>Phòng: </span>
          <span>{extendedProps.room || "-"}</span>
        </div>
        <div style={{ marginTop: 2, fontSize: 12, color: statusColor }}>
          <span style={{ fontWeight: "600" }}>Trạng thái: </span>
          <span>
            {(() => {
              switch (status) {
                case APPOINTMENT_STATUS.PENDING:
                  return "Chưa xác nhận";
                case APPOINTMENT_STATUS.CONFIRMED:
                  return "Đã xác nhận";
                case APPOINTMENT_STATUS.COMPLETED:
                  return "Hoàn thành";
                case APPOINTMENT_STATUS.CANCELLED:
                  return "Đã hủy";
                default:
                  return "Không rõ";
              }
            })()}
          </span>
        </div>
      </div>
    );
  };


  useEffect(() => {
    if (!selectedEvent) {
      setServiceSteps([]);
      return;
    }
    const serviceId = selectedEvent.extendedProps.serviceId;
    console.log("service id is : " + serviceId);
    if (!serviceId) {
      setServiceSteps([]);
      return;
    }
    (async () => {
      try {
        const steps = await getStepByServiceId(serviceId);
        console.log("stepss is ", JSON.stringify(steps));
        setServiceSteps(steps || []);
      } catch {
        setServiceSteps([]);
      }
    })();
  }, [selectedEvent]);

  const isSpecializationStepEnabled = serviceSteps.some(step => step.steps.id === 1 && step.status === true);
  const isDoctorStepEnabled = serviceSteps.some(step => step.steps.id === 2 && step.status === true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllPatients();
        setPatients(data || []);
      } catch {
        console.error("Failed to fetch patients");
      }
    })();
  }, []);

  useEffect(() => {
    if (!hospitalId) return;
    (async () => {
      try {
        const docs = await getDoctorByHospitalId(hospitalId);
        setDoctors(docs || []);
      } catch {
        setDoctors([]);
      }
      try {
        const specs = await getSpecializationsByHospitalId(hospitalId);
        setSpecializations(specs || []);
      } catch {
        setSpecializations([]);
      }
    })();
  }, [hospitalId]);

  useEffect(() => {
    if (!selectedPatientId || !currentRange.start || !currentRange.end) {
      setAppointments([]);
      return;
    }
    (async () => {
      try {
        const payload = {
          userId: selectedPatientId,
          dateFrom: currentRange.start.format("YYYY-MM-DD"),
          dateTo: currentRange.end.format("YYYY-MM-DD"),
        };
        console.log("Fetching appointments with payload:", payload);
        console.log("selected patient id : " + selectedPatientId);
        const list = await getAppointmentsByUserId(
          selectedPatientId,
          currentRange.start.toISOString(),
          currentRange.end.toISOString()
        );
        console.log("list appoint is : " + JSON.stringify(list));
        const events = list.map((item) => {
          const workDateStr = item.doctorSchedule.workDate.split("T")[0];
          const startDT = dayjs(`${workDateStr}T${item.doctorSchedule.startTime}`).toISOString();
          const endDT = dayjs(`${workDateStr}T${item.doctorSchedule.endTime}`).toISOString();
          const patient = patients.find((p) => p.id === item.patientId);
          const classNames = [];
          if (item.status === APPOINTMENT_STATUS.CANCELLED) classNames.push("fc-event-cancelled");
          if (item.status === APPOINTMENT_STATUS.COMPLETED) classNames.push("fc-event-completed");
          return {
            id: `appointment-${item.id}`,
            title: `Hẹn khám`,
            backgroundColor: defaultEventColor.backgroundColor,
            start: startDT,
            end: endDT,
            classNames,
            extendedProps: {
              type: "appointment",
              patientId: item.patientId,
              patientName: patient?.fullname || "Không rõ",
              doctorId: item.doctorSchedule.doctorProfile?.id,
              doctorName: item.doctorSchedule.doctorProfile?.user?.fullname || "Không rõ",
              specializationId: item.doctorSchedule.specialization?.id,
              specializationName: item.doctorSchedule.specialization?.name,
              department: item.doctorSchedule.department,
              note: item.note,
              serviceId: item.serviceId,
              status: item.status,
              room: item.doctorSchedule.room?.name,
              serviceName: item.serviceName,
              appointmentId: item.id,
            },
          };
        });
        setAppointments(events);
      } catch {
        setAppointments([]);
      }
    })();
  }, [selectedPatientId, currentRange, flag]);

  useEffect(() => {
    if (!selectedEvent) return;
    const updated = appointments.find(e => e.id === selectedEvent.id);
    if (updated) {
      setSelectedEvent({
        ...updated,
        extendedProps: { ...updated.extendedProps },
      });
    }
  }, [appointments]);

  const loadAvailableSchedules = async (doctorId, specId) => {
    if (!hospitalId) return;
    if (!doctorId && !specId) {
      setAvailableSchedules([]);
      return;
    }
    try {
      const payload = {
        hospitalId,
        doctorIds: doctorId ? [doctorId] : [],
        specializationId: specId || null,
        dateFrom: filterDateFrom.format("YYYY-MM-DD"),
        dateTo: filterDateTo.format("YYYY-MM-DD"),
      };
      console.log("payload adjust : " + JSON.stringify(payload));
      const result = await getHospitalSpecializationSchedule(payload);
      const schedules = (result.schedules || []).filter(item => item.isAvailable);
      setAvailableSchedules(schedules);
    } catch {
      setAvailableSchedules([]);
    }
  };

  const openModal = async (event) => {
    setSelectedEvent(event);
    setFilterDoctorId(event.extendedProps.doctorId || null);
    setFilterSpecId(event.extendedProps.specializationId || null);
    setSelectedScheduleId(null);
    setModalOpen(true);

    await loadAvailableSchedules(event.extendedProps.doctorId, event.extendedProps.specializationId);
  };

  const handleChangeTime = async () => {
    if (!selectedEvent) return;
    if (!selectedScheduleId) return;
    try {
      await changeAppointmentTime(selectedEvent.extendedProps.appointmentId, selectedScheduleId);
      dispatch(setMessage({ type: "success", content: "Đổi lịch hẹn thành công!" }));
      setModalOpen(false);
      setFlag(prev => !prev);
    } catch {
      dispatch(setMessage({ type: "error", content: "Lịch không khả dụng hoặc người dùng đã có lịch khám vào thời gian này!" }));
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedEvent) return;
    const appointmentId = selectedEvent.extendedProps.appointmentId;
    const currentStatus = selectedEvent.extendedProps.status;

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
      dispatch(setMessage({ type: "success", content: `Đã cập nhật trạng thái thành "${newStatus === APPOINTMENT_STATUS.CONFIRMED ? "Chấp nhận" : "Hoàn thành"}".` }));
      setFlag(prev => !prev);
      setModalOpen(false);
    } catch {
      dispatch(setMessage({ type: "error", content: "Đổi trạng thái không thành công!" }));
    }
  };

  const nextStatusLabel = (() => {
    if (!selectedEvent) return null;
    const status = selectedEvent.extendedProps.status;
    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        return "Chấp nhận";
      case APPOINTMENT_STATUS.CONFIRMED:
        return "Hoàn thành";
      default:
        return null;
    }
  })();

  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    const appointmentId = selectedEvent.extendedProps.appointmentId;

    if (selectedEvent.extendedProps.status === APPOINTMENT_STATUS.CANCELLED) {
      message.warning("Lịch hẹn đã được hủy trước đó");
      return;
    }

    try {
      await changeAppointmentStatus(appointmentId, APPOINTMENT_STATUS.CANCELLED);
      setFlag(prev => !prev);
      dispatch(setMessage({ type: "success", content: "Hủy lịch hẹn thành công!" }));
      setModalOpen(false);
    } catch {
      dispatch(setMessage({ type: "error", content: "Hủy lịch hẹn không thành công!" }));
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        return "Chưa xác nhận";
      case APPOINTMENT_STATUS.CONFIRMED:
        return "Đã xác nhận";
      case APPOINTMENT_STATUS.CANCELLED:
        return "Đã hủy";
      case APPOINTMENT_STATUS.COMPLETED:
        return "Hoàn thành";
      default:
        return "Không rõ";
    }
  };

  const handleDatesSet = (arg) => {
    setCurrentRange({ start: dayjs(arg.start).startOf("day"), end: dayjs(arg.end).startOf("day") });
  };

  return (
    <>
      {contextHolder}
      <ConfigProvider locale={viVN}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
            Quản lý lịch hẹn & ca làm việc
          </Title>
          <Legend />
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Select
                showSearch
                allowClear
                placeholder="Chọn bệnh nhân"
                style={{ width: "100%" }}
                onChange={setSelectedPatientId}
                value={selectedPatientId}
                optionFilterProp="children"
                filterOption={(input, option) => option?.children.toLowerCase().includes(input.toLowerCase())}
                optionLabelProp="children"
              >
                {patients.map(p => (
                  <Option key={p.id} value={p.id}>
                    {p.fullname || `Bệnh nhân #${p.id}`}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={viLocale}
            editable={false}
            events={appointments.filter(
              (a) =>
                a.extendedProps.status !== APPOINTMENT_STATUS.CANCELLED &&
                a.extendedProps.status !== APPOINTMENT_STATUS.COMPLETED
            )}
            eventContent={renderEventContent}
            eventClick={({ event }) => openModal(event)}
            height={600}
            nowIndicator
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay",
            }}
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            datesSet={handleDatesSet}
            firstDay={1}
            initialDate={currentRange.start.toISOString()}
          />

          <Modal
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={null}
            centered
            title={selectedEvent?.title ? `Chi tiết: ${selectedEvent.title}` : "Chi tiết"}
            width={700}
          >
            {selectedEvent ? (
              <>
                <p>
                  <b>Thời gian:</b> {dayjs(selectedEvent.start).format("DD/MM/YYYY HH:mm")} -{" "}
                  {dayjs(selectedEvent.end).format("HH:mm")}
                </p>
                <p><b>Dịch vụ:</b> {selectedEvent.extendedProps.serviceName}</p>
                <p><b>Bệnh nhân:</b> {selectedEvent.extendedProps.patientName}</p>
                <p><b>Chuyên khoa hiện tại:</b> {selectedEvent.extendedProps.specializationName || "Không rõ"}</p>
                <p><b>Phòng:</b> {selectedEvent.extendedProps.room || "Không rõ"}</p>
                <p><b>Trạng thái:</b> {getStatusText(selectedEvent.extendedProps.status)}</p>
                <p><b>Ghi chú:</b> {selectedEvent.extendedProps.note || "Không có"}</p>

                <Row gutter={16} style={{ marginTop: 16 }}>

                  <Col span={12}>
                    <label>Bác sĩ (lọc ca khả dụng):</label>
                    <Select
                      allowClear
                      style={{ width: "100%" }}
                      value={filterDoctorId}
                      onChange={setFilterDoctorId}
                      placeholder="Chọn bác sĩ"
                      showSearch
                      disabled={!isDoctorStepEnabled}
                      filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    >
                      {doctors.map(doc => (
                        <Option key={doc.id} value={doc.id}>
                          {doc.user?.fullname || doc.description || `Bác sĩ #${doc.id}`}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <label>Khoảng ngày:</label>
                    <RangePicker
                      value={[filterDateFrom, filterDateTo]}
                      format="DD/MM/YYYY"
                      onChange={(dates) => {
                        setFilterDateFrom(dates?.[0] || null);
                        setFilterDateTo(dates?.[1] || null);
                      }}
                      allowEmpty={[false, false]}
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={12}>
                    <label>Chuyên khoa (lọc ca khả dụng):</label>
                    <Select
                      allowClear
                      style={{ width: "100%" }}
                      value={filterSpecId}
                      onChange={setFilterSpecId}
                      placeholder="Chọn chuyên khoa"
                      showSearch
                      disabled={!isSpecializationStepEnabled}
                      filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    >
                      {specializations.map(spec => (
                        <Option key={spec.id} value={spec.id}>{spec.name}</Option>
                      ))}
                    </Select>
                  </Col>
                </Row>

                <div style={{ marginTop: 20 }}>
                  <label>Chọn ca làm việc khả dụng để đổi lịch:</label>
                  {availableSchedules.length === 0 ? (
                    <Text type="secondary">
                      Vui lòng chọn bác sĩ hoặc chuyên khoa để hiển thị ca làm việc khả dụng
                    </Text>
                  ) : (
                    <List
                      bordered
                      dataSource={availableSchedules}
                      renderItem={(item) => {
                        const workDate = dayjs(item.workDate).format("DD/MM/YYYY");
                        return (
                          <List.Item
                            style={{
                              cursor: "pointer",
                              backgroundColor: selectedScheduleId === item.id ? "rgba(100, 181, 246, 0.3)" : "transparent",
                            }}
                            onClick={() => setSelectedScheduleId(item.id)}
                          >
                            <Text strong>
                              Ca {item.startTime >= "07:30:00" && item.endTime <= "12:00:00" ? "Sáng" : "Chiều"} - {workDate}
                            </Text>
                            <br />
                            <Text>
                              {item.startTime} - {item.endTime} - Phòng {item.roomName || "Không rõ"}
                            </Text>
                          </List.Item>
                        );
                      }}
                      style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}
                    />
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    disabled={
                      !selectedScheduleId ||
                      selectedEvent?.extendedProps.status === APPOINTMENT_STATUS.CANCELLED ||
                      selectedEvent?.extendedProps.status === APPOINTMENT_STATUS.COMPLETED
                    }
                    onClick={handleChangeTime}
                    style={{ marginRight: 8 }}
                  >
                    Đổi lịch hẹn
                  </Button>
                  {nextStatusLabel && (
                    <Button
                      type="primary"
                      disabled={
                        selectedEvent?.extendedProps.status === APPOINTMENT_STATUS.CANCELLED ||
                        selectedEvent?.extendedProps.status === APPOINTMENT_STATUS.COMPLETED
                      }
                      onClick={handleChangeStatus}
                      style={{ marginRight: 8 }}
                    >
                      {nextStatusLabel}
                    </Button>
                  )}
                  <Button
                    danger
                    disabled={selectedEvent?.extendedProps.status === APPOINTMENT_STATUS.CANCELLED}
                    onClick={handleCancelAppointment}
                  >
                    Hủy lịch hẹn
                  </Button>
                </div>
              </>
            ) : (
              <p>Không có dữ liệu</p>
            )}
          </Modal>
        </div>
      </ConfigProvider>
    </>
  );
};

export default AdjustAppointmentSchedule;
