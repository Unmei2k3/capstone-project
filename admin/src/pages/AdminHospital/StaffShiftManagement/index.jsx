import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Row,
  Col,
  Checkbox,
  message,
  ConfigProvider,
  List,
  Tag,
} from "antd";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getStaffNurseList } from "../../../services/staffNurseService";
import { getUserById } from "../../../services/userService";
import { createStaffSchedules, deleteStaffSchedule, getScheduleByStaffNurseId, updateStaffSchedule } from "../../../services/scheduleService";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import utc from "dayjs/plugin/utc";
import viLocale from "@fullcalendar/core/locales/vi";
import { getHospitalWorkDate } from "../../../services/hospitalService";

dayjs.extend(utc);
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;

const weekdayOptions = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

dayjs.extend(customParseFormat);
dayjs.locale("vi");

const isShiftDisabled = (event) => {
  if (!event) return true;

  const now = dayjs();
  const eventEnd = dayjs(event.end);

  const patients = event.extendedProps?.patients || [];

  if (patients.length > 0) return true;

  if (eventEnd.isBefore(now)) return true;

  return false;
};

const eventColor = (info) => {
  const { type, status, patients } = info.event.extendedProps;
  console.log("Event extendedProps:", info.event.extendedProps);
  if (type === "booking") {
    Object.assign(info.el.style, {
      backgroundColor: "#3575d3",
      color: "#fff",
      borderRadius: "10px",
      border: "1px solid #2a5ebd",
      boxShadow: "0 2px 10px rgba(53,117,211,0.25)",
      fontWeight: "600",
      padding: "6px 5px",
    });
  } else if (status === "Đang khám") {
    Object.assign(info.el.style, {
      backgroundColor: "#43a047",
      color: "#fff",
      borderRadius: "10px",
      border: "1px solid #2e7d32",
      boxShadow: "0 2px 10px rgba(67,160,71,0.25)",
      fontWeight: "600",
      padding: "6px 5px",
    });
  } else if (status === "Chưa bắt đầu") {
    Object.assign(info.el.style, {
      backgroundColor: "#ffd600",
      color: "#4e342e",
      borderRadius: "10px",
      border: "1px solid #c6a700",
      boxShadow: "0 2px 10px rgba(255,214,0,0.20)",
      fontWeight: "600",
      padding: "6px 5px",
    });
  } else if (!patients || patients.length === 0) {
    Object.assign(info.el.style, {
      backgroundColor: "#bdbdbd",
      color: "#212121",
      borderRadius: "10px",
      border: "1px solid #9e9e9e",
      boxShadow: "0 2px 10px rgba(189,189,189,0.25)",
      fontWeight: "600",
      padding: "6px 5px",
    });
  } else {
    Object.assign(info.el.style, {
      backgroundColor: "#2196f3",
      color: "#fff",
      borderRadius: "10px",
      border: "1px solid #1976d2",
      boxShadow: "0 2px 10px rgba(33,150,243,0.25)",
      fontWeight: "600",
      padding: "6px 5px",
    });
  }
};


const StaffShiftManagement = () => {
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  //const [staffDetail, setStaffDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [modalDetail, setModalDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const user = useSelector((state) => state.user.user);
  const [allStaffs, setAllStaffs] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [flag, setFlag] = useState(false);
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message)
  const calendarRef = useRef();
  const shiftSelectMode = editingShift ? undefined : "multiple";
  const [workingDates, setWorkingDates] = useState([]);

  useEffect(() => {
    const fetchHospitalWorkDates = async () => {
      if (!user?.hospitals?.[0]?.id) return;
      try {
        const response = await getHospitalWorkDate(user.hospitals[0].id);
        console.log("response log is :  " + JSON.stringify(response));
        if (response?.workingDates) {
          setWorkingDates(response.workingDates);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch làm việc bệnh viện:", error);
        setWorkingDates([]);
      }
    };
    fetchHospitalWorkDates();
  }, [user?.hospitals]);

  const getShiftTimesByDay = (dayOfWeek) => {
    const dayInfo = workingDates.find((d) => d.dayOfWeek === dayOfWeek);

    if (
      !dayInfo ||
      dayInfo.isClosed ||
      dayInfo.startTime === "00:00:00" ||
      dayInfo.endTime === "00:00:00"
    ) {
      return {
        morning: { startTime: "00:00:00", endTime: "00:00:00" },
        afternoon: { startTime: "00:00:00", endTime: "00:00:00" },
      };
    }

    return {
      morning: { startTime: dayInfo.startTime, endTime: "12:00:00" },
      afternoon: { startTime: "12:00:00", endTime: dayInfo.endTime },
    };
  };

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
    if (selectedPersonId && calendarRef.current) {

      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;

      handleDatesSet({ start: view.activeStart, end: view.activeEnd });
    }
  }, [selectedPersonId, flag]);

  const handleDatesSet = async (arg) => {
    if (!selectedPersonId) return;

    const from = dayjs(arg.start).toISOString();
    const to = dayjs(arg.end).toISOString();

    console.log("Fetching staff schedule for:", selectedPersonId, "from", from, "to", to, "and hospital ID:", user.hospitals[0]?.id);

    try {
      console.log("Fetching schedule for staff ID:", selectedPersonId, "from", from, "to", to, "hospital ID:", user.hospitals[0]?.id);
      const data = await getScheduleByStaffNurseId(selectedPersonId, from, to, user.hospitals[0]?.id);
      console.log("Fetched staff schedule data:", data, "for staff ID:", selectedPersonId);
      const schedules = data?.schedules || [];
      const now = dayjs();

      const formattedEvents = schedules.map((item) => {

        const dateStr = item.workDate.split("T")[0];
        const startStr = `${dateStr}T${item.startTime}`;
        const endStr = `${dateStr}T${item.endTime}`;
        const start = dayjs(startStr);
        const end = dayjs(endStr);

        let status = "Ca làm việc khác";
        const hasAppointments = item.appointment?.length > 0;

        if (hasAppointments) {
          if (now.isAfter(end)) {
            status = "Đã khám";
          } else if (now.isBefore(start)) {
            status = "Chưa bắt đầu";
          } else {
            status = "Đang khám";
          }
        } else {
          if (now.isAfter(end)) {
            status = "Ca rỗng (đã qua)";
          } else if (now.isBefore(start)) {
            status = "Ca rỗng (sắp tới)";
          } else {
            status = "Ca rỗng (đang chờ)";
          }
        }

        const patients =
          item.appointment?.map((appt) => {
            const dob = dayjs(appt.patient.dob);
            const age = dayjs().diff(dob, "year");

            return {
              id: appt.id,
              name: appt.patient.fullname || "Không rõ",
              age,
              note: appt.note || "",
              gender: appt.patient.gender ? "Nam" : "Nữ",
              service: appt.service?.name || "Không rõ",
            };
          }) || [];

        return {
          id: item.id,
          title: item.timeShift === 1 ? "Ca sáng " : "Ca chiều",
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            type: status.includes("rỗng") ? "shift" : "appointment",
            department: item.room?.department?.name || "Không rõ",
            room: item.room?.name || "Không rõ",
            status,
            patients,
            doctorScheduleId: item.doctorScheduleId || 0,
          },
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Lỗi khi tải lịch làm việc nhân viên:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    const fetchStaffs = async () => {
      if (!user?.hospitals?.[0]?.id) return;

      try {
        const staffList = await getStaffNurseList(user.hospitals[0].id);
        setAllStaffs(staffList || []);
        console.log("Fetched all staff:", JSON.stringify(staffList));
        setSelectedPersonId(staffList?.[0]?.staffId || null);
        const nurseList = (staffList || []).filter((s) => s.role?.name === 'Nurse');
        setNurses(nurseList);
        console.log("Fetched nurses:", nurseList);
        console.log("Fetched all staff:", staffList);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
        setAllStaffs([]);
        setNurses([]);
      }
    };

    fetchStaffs();
  }, [user?.hospitals]);

  // useEffect(() => {
  //   const fetchDoctor = async () => {
  //     if (!selectedPersonId) return;
  //     const result = await getUserById(selectedPersonId);
  //     if (result) {
  //       console.log("result nurse detail : " + JSON.stringify(result));
  //       setStaffDetail(result);
  //       console.log("staff detail: " + JSON.stringify(staffDetail));
  //     } else {
  //       console.error("Không tìm thấy thông tin bác sĩ.");
  //     }
  //   };
  //   fetchDoctor();
  // }, [selectedPersonId]);

  const normalStaffs = allStaffs.filter(
    (s) => !nurses.find((n) => n.staffId === s.staffId)
  );


  // const events = filteredShifts.map((shift) => ({
  //   id: shift.id,
  //   title: `${shift.hospitalStaffName || "Nhân viên"} - Phòng ${shift.room?.name || "chưa xác định"}`,
  //   start: dayjs(`${dayjs(shift.workDate).format("YYYY-MM-DD")}T${shift.startTime}`).toISOString(),
  //   end: dayjs(`${dayjs(shift.workDate).format("YYYY-MM-DD")}T${shift.endTime}`).toISOString(),
  //   extendedProps: {
  //     ...shift,
  //     type: "shift",
  //     status: shift.isAvailable ? (shift.timeShift === 1 ? "Đang làm" : "Chưa bắt đầu") : "Không có ca",
  //     patients: (shift.appointment || []).map(app => ({
  //       id: app.id,
  //       name: app.patient?.fullname || "Bệnh nhân chưa rõ",
  //       age: app.patient?.dob ? dayjs().diff(dayjs(app.patient.dob), "year") : "N/A",
  //       note: app.note || "",
  //     }))
  //   },
  // }));

  const showDeleteConfirm = (shift) => {
    setShiftToDelete(shift);
    setDeleteConfirmVisible(true);
  };

  const onAddShift = (dateStr = null) => {
    setEditingShift(null);
    form.resetFields();
    if (dateStr) form.setFieldValue("workDate", dayjs(dateStr));
    setModalVisible(true);
  };
  const handleEventClick = ({ event }) => {
    setSelectedEvent(event);

    setEditingShift({
      id: event.id,
      doctorScheduleId: event.extendedProps.doctorScheduleId || 0,
      staffId: event.extendedProps.staffId || selectedPersonId,
      workDate: dayjs(event.start).local().startOf('day'),
      timeShift: event.title.includes("sáng") ? 1 : 2,
      isAvailable: true,
      reasonOfUnavailability: event.extendedProps.reasonOfUnavailability || "",
    });

    form.setFieldsValue({
      staffId: event.extendedProps.staffId || selectedPersonId,
      workDate: dayjs(event.start).local().startOf('day'),
      shift: event.title.includes("sáng") ? ["morning"] : ["afternoon"],
    });

    setModalDetail(true);
  };



  const onFinish = async (values) => {
    const { shift, workDate } = values;
    console.log("shift is " + shift + "work date is " + workDate);
    let shiftArray = [];

    if (Array.isArray(shift)) {
      shiftArray = shift;
    } else if (typeof shift === "string" && shift) {
      shiftArray = [shift];
    } else {
      shiftArray = [];
    }
    if (shiftArray.length === 0 || !workDate) {
      dispatch(
        setMessage({
          type: "error",
          content: "Vui lòng chọn ngày và ca làm việc",
        })
      );
      return;
    }
    console.log("shift Array : " + JSON.stringify(shiftArray));
    const dayOfWeek = dayjs(workDate).day();
    const shiftTimesMap = getShiftTimesByDay(dayOfWeek);

    console.log("day of week: " + JSON.stringify(dayOfWeek) + "shift time map : " + JSON.stringify(shiftTimesMap));
    const validShifts = shiftArray.every(sh => {
      const times = shiftTimesMap[sh];
      console.log("times is : " + JSON.stringify(times));
      return times && times.startTime !== "00:00:00" && times.endTime !== "00:00:00";
    });
    console.log("valid shifts is : " + validShifts);
    if (!validShifts) {
      dispatch(setMessage({
        type: 'error',
        content: 'Ngày làm việc này không hỗ trợ ca làm đã chọn vì bệnh viện đóng cửa hoặc thời gian không hợp lệ.'
      }));
      return;
    }

    const shiftsPayload = shiftArray.map((sh) => {
      const times = shiftTimesMap[sh];
      // if (!times || !times.startTime || !times.endTime) {
      //   throw new Error(`Ca làm '${sh}' không có thời gian hợp lệ trong ngày đã chọn`);
      // }
      return {
        startTime: times.startTime,
        endTime: times.endTime,
      };
    });

    try {
      if (editingShift) {
        const shiftKey = shiftArray[0];
        const times = shiftTimesMap[shiftKey];

        const updatePayload = {
          id: editingShift.id,
          doctorScheduleId: editingShift.doctorScheduleId || null,
          staffId: values.staffId,
          workDate: workDate ? workDate.format("YYYY-MM-DD") : null,
          startTime: times.startTime,
          endTime: times.endTime,
          isAvailable: true,
          reasonOfUnavailability: "",
        };
        console.log("Update payload:", JSON.stringify(updatePayload));
        await updateStaffSchedule(updatePayload);
        dispatch(setMessage({ type: 'success', content: 'Cập nhật ca làm việc thành công!' }));
      } else {
        const payload = {
          staffIds: [values.staffId],
          hospitalId: user.hospitals[0]?.id,
          daysOfWeek: [dayOfWeek],
          shifts: shiftsPayload,
          startDate: dayjs(workDate).format("YYYY-MM-DD"),
          endDate: dayjs(workDate).format("YYYY-MM-DD"),
          isAvailable: false,
          reasonOfUnavailability: "",
        };
        console.log("Create payload:", JSON.stringify(payload));
        await createStaffSchedules(payload);
        dispatch(setMessage({ type: 'success', content: 'Tạo ca làm việc thành công!' }));
      }
      setFlag(prev => !prev);
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi xử lý ca làm việc:", error);
      dispatch(setMessage({ type: 'error', content: 'Xảy ra lỗi khi lưu ca làm việc!' }));
    }
  };


  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    const { status, patients, department, room } = extendedProps;
    console.log("Event info:", eventInfo);
    console.log("Extended props:", extendedProps);

    return (
      <div
        style={{
          padding: 8,
          borderRadius: 6,
          backgroundColor: "#f9f9f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          lineHeight: 1.3,
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          display: "-webkit-box",
          WebkitLineClamp: 6,
          height: "100%"
        }}
      >
        {(department) && (
          <div
            style={{
              fontWeight: "600",
              color: "#2c3e50",
              marginBottom: 4,
            }}
          >
            {department}
          </div>
        )}
        {(room) && (
          <div
            style={{
              fontWeight: "600",
              color: "#2c3e50",
              marginBottom: 4,
            }}
          >
            {room}
          </div>
        )}
        <div
          style={{
            fontWeight: "700",
            fontSize: 14,
            color: "#34495e",
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 120,
          }}
          title={title}
        >
          {title.split(" - ")[0]}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "6px 0" }} />

        <div
          style={{
            fontSize: 12,
            color: status === "Completed" ? "green" : "#e67e22",
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          {status}
        </div>

        <div style={{ fontSize: 12, color: "#555" }}>
          👥 <strong>{patients.length}</strong> bệnh nhân
        </div>
      </div>
    );
  };
  const onFinishBulk = async (values) => {
    const { staffIds, weekdays, shift, dateRange } = values;

    if (!staffIds || staffIds.length === 0) {
      message.error("Vui lòng chọn Nhân viên");
      return;
    }
    if (!weekdays || weekdays.length === 0) {
      message.error("Vui lòng chọn ngày trong tuần");
      return;
    }
    if (!shift || shift.length === 0) {
      message.error("Vui lòng chọn ca làm");
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    try {
      for (const dayOfWeek of weekdays) {
        const shiftTimesMap = getShiftTimesByDay(dayOfWeek);

        const validShifts = shift.every((sh) => {
          const times = shiftTimesMap[sh];
          return times && times.startTime && times.endTime && times.startTime !== "00:00:00" && times.endTime !== "00:00:00";
        });

        if (!validShifts) {
          dispatch(setMessage({
            type: "error",
            content: `Ngày ${weekdayOptions.find(d => d.value === dayOfWeek)?.label || dayOfWeek} không hỗ trợ ca làm đã chọn do bệnh viện đóng cửa hoặc thời gian không hợp lệ.`
          }));
          return;
        }

        const shiftsPayload = shift.map((sh) => ({
          startTime: shiftTimesMap[sh].startTime,
          endTime: shiftTimesMap[sh].endTime,
        }));

        for (const userId of staffIds) {
          const payload = {
            staffIds: [userId],
            hospitalId: user.hospitals[0]?.id,
            daysOfWeek: [dayOfWeek],
            shifts: shiftsPayload,
            startDate: dateRange[0].format("YYYY-MM-DD"),
            endDate: dateRange[1].format("YYYY-MM-DD"),
            isAvailable: true,
            reasonOfUnavailability: "",
          };

          console.log("Bulk create payload:", JSON.stringify(payload));
          await createStaffSchedules(payload);
        }
      }

      dispatch(setMessage({ type: "success", content: "Tạo ca làm việc thành công!" }));
      bulkForm.resetFields();
      setFlag((prev) => !prev);

    } catch (error) {
      console.error("Lỗi tạo lịch mẫu:", error);
      dispatch(setMessage({ type: "error", content: "Xảy ra lỗi khi tạo ca làm việc!" }));
    }
  };


  const Legend = () => (
    <Row justify="center" gutter={16} style={{ marginBottom: 20 }}>
      <Col>
        <Tag icon={<CheckCircleOutlined />} color="#43a047" style={{ borderRadius: 8 }}>
          Đang làm
        </Tag>
      </Col>
      <Col>
        <Tag
          icon={<PauseCircleOutlined />}
          color="#ffd600"
          style={{ borderRadius: 8, color: "#4e342e" }}
        >
          Chưa bắt đầu
        </Tag>
      </Col>
      <Col>
        <Tag icon={<StopOutlined />} color="#bdbdbd" style={{ borderRadius: 8 }}>
          Không có ca
        </Tag>
      </Col>
      <Col>
        <Tag color="#2196f3" style={{ borderRadius: 8 }}>
          Khác
        </Tag>
      </Col>
    </Row>
  );

  return (
    <>
      {contextHolder}
      <ConfigProvider locale={viVN}>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(120deg, #fafbfc 0%, #eef5f9 100%)",
            padding: "32px 0",
          }}
        >
          <div
            style={{
              maxWidth: 1220,
              margin: "auto",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 32px #3575d324",
              padding: 32,
            }}
          >
            <Row justify="center">
              <Col>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    padding: "12px 40px",
                    borderRadius: 14,
                    background: "linear-gradient(90deg,#358cfb,#38c484 85%)",
                    color: "#fff",
                    marginBottom: 32,
                    userSelect: "none",
                  }}
                >
                  <CalendarOutlined style={{ marginRight: 16 }} />
                  Quản lý lịch làm việc Nhân viên
                </h1>
              </Col>
            </Row>

            <Row justify="center" style={{ marginBottom: 32 }}>
              <Select
                allowClear
                showSearch
                placeholder="Chọn nhân viên hoặc y tá"
                style={{ width: 300 }}
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                onChange={(value) => setSelectedPersonId(value)}
                value={selectedPersonId}
              >
                <OptGroup label="Y tá (Nurse)">
                  {nurses.map(n => (
                    <Option key={`nurse-${n.staffId}`} value={n.staffId}>{n.fullname}</Option>
                  ))}
                </OptGroup>
                <OptGroup label="Nhân viên (Staff)">
                  {normalStaffs.map(s => (
                    <Option key={`staff-${s.staffId}`} value={s.staffId}>{s.fullname}</Option>
                  ))}
                </OptGroup>
              </Select>
            </Row>

            <Legend />

            <Row gutter={28}>
              <Col md={8} xs={24} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    boxShadow: "0 1px 8px #3575d311",
                    padding: "24px 18px",
                    height: '100%',
                  }}
                >
                  <h2
                    style={{
                      fontWeight: 700,
                      marginBottom: 24,
                      color: "#3575d3",
                      textAlign: "center",
                    }}
                  >
                    Tạo lịch mẫu cho Nhân viên
                  </h2>
                  <Form
                    layout="vertical"
                    form={bulkForm}
                    onFinish={onFinishBulk}
                    scrollToFirstError
                  >
                    <Form.Item
                      name="staffIds"
                      label="Nhân viên"
                      rules={[{ required: true, message: "Vui lòng chọn Nhân viên." }]}
                    >

                      <Select
                        mode="multiple"
                        placeholder="Chọn Nhân viên"
                        onChange={(value) => {
                          if (value.includes("all")) {
                            const allIds = allStaffs.map((n) => n.staffId);
                            bulkForm.setFieldsValue({ staffIds: allIds });
                          }
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        <Option key="all" value="all">
                          Tất cả
                        </Option>
                        {allStaffs.map((doc) => (
                          <Option key={doc.staffId} value={doc.staffId}>
                            {doc.fullname}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="weekdays"
                      label="Ngày trong tuần"
                      rules={[{ required: true, message: "Vui lòng chọn ngày trong tuần." }]}
                    >
                      <Checkbox.Group options={weekdayOptions} />
                    </Form.Item>

                    <Form.Item
                      name="shift"
                      label="Ca làm"
                      rules={[{ required: true, message: "Vui lòng chọn ca làm." }]}
                    >
                      <Select mode="multiple" style={{ borderRadius: 8 }}>
                        <Option value="morning">Sáng</Option>
                        <Option value="afternoon">Chiều</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="dateRange"
                      label="Khoảng thời gian"
                      rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian." }]}
                    >
                      <RangePicker style={{ width: "100%", borderRadius: 8 }} />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      style={{ borderRadius: 8 }}
                    >
                      Tạo lịch mẫu
                    </Button>
                  </Form>
                </div>
              </Col>

              <Col md={16} xs={24}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 15,
                    boxShadow: "0 2px 10px #2196f310",
                    padding: 12,
                    minHeight: 630,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* <Row justify="end" style={{ marginBottom: 8 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="large"
                      style={{
                        background: "#2188ff",
                        border: "none",
                        borderRadius: 8,
                        boxShadow: "0 2px 10px #3575d322",
                      }}
                      onClick={() => onAddShift()}
                    >
                      Tạo sự kiện
                    </Button>
                  </Row> */}

                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    ref={calendarRef}
                    eventContent={renderEventContent}
                    headerToolbar={{
                      start: "prev,next today",
                      center: "title",
                      end: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    locale={viLocale}
                    height={600}
                    eventClick={handleEventClick}
                    events={events}
                    eventDidMount={eventColor}
                    datesSet={handleDatesSet}
                    dateClick={(info) => onAddShift(info.dateStr)}
                    dayMaxEventRows={4}
                    firstDay={1}
                    allDaySlot={false}
                    slotMinTime="06:00:00"
                    slotMaxTime="18:00:00"
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }}
                    contentHeight={550}
                    expandRows
                  />
                </div>
              </Col>
            </Row>

            <Modal
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              title={editingShift ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
              footer={[
                <Button key="cancel" onClick={() => setModalVisible(false)} style={{ borderRadius: 8 }}>
                  Hủy
                </Button>,
                <Button
                  key="ok"
                  type="primary"
                  onClick={() => form.submit()}
                  style={{ borderRadius: 8 }}
                >
                  Lưu
                </Button>,
              ]}
              destroyOnClose
              centered
              bodyStyle={{ borderRadius: 14, padding: 24 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  status: "pending",
                  staffId: selectedPersonId
                }}
                scrollToFirstError
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="staffId"
                      label="Nhân viên"
                      rules={[{ required: true, message: "Vui lòng chọn Nhân viên" }]}
                    >
                      <Select placeholder="Chọn Nhân viên" style={{ borderRadius: 8 }}>
                        {allStaffs.map((doc) => (
                          <Option key={doc?.staffId} value={doc?.staffId}>
                            {doc?.fullname}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="workDate"
                      label="Ngày làm việc"
                      rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
                    >
                      <DatePicker format="YYYY-MM-DD" style={{ width: "100%", borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="shift"
                      label="Ca làm"
                      rules={[{ required: true, message: "Vui lòng chọn ca làm." }]}
                    >
                      <Select mode={shiftSelectMode} style={{ borderRadius: 8 }}>
                        <Option value="morning">Sáng</Option>
                        <Option value="afternoon">Chiều</Option>
                      </Select>
                    </Form.Item>

                  </Col>
                  <Col span={12}>
                  
                    {form.getFieldValue("workDate") ? (() => {
                      const dayOfWeek = dayjs(form.getFieldValue("workDate")).day();
                      const times = getShiftTimesByDay(dayOfWeek);
                      return (
                        <div style={{ fontSize: 14, color: "#555", userSelect: "none", marginTop: 24 }}>
                          {times.morning?.startTime && times.morning?.endTime ? (
                            <div>
                              <b>Ca sáng:</b> {times.morning.startTime} - {times.morning.endTime}
                            </div>
                          ) : (
                            <div>
                              <b>Ca sáng:</b> Không có giờ làm việc
                            </div>
                          )}
                          {times.afternoon?.startTime && times.afternoon?.endTime ? (
                            <div>
                              <b>Ca chiều:</b> {times.afternoon.startTime} - {times.afternoon.endTime}
                            </div>
                          ) : (
                            <div>
                              <b>Ca chiều:</b> Không có giờ làm việc
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div style={{ fontSize: 14, color: "#999", userSelect: "none", marginTop: 8 }}>
                        Chọn ngày để xem giờ làm việc ca sáng/chiều
                      </div>
                    )}
                  </Col>
                </Row>
              </Form>
            </Modal>

            <Modal
              visible={deleteConfirmVisible}
              title="Xác nhận xóa ca làm việc?"
              onOk={async () => {
                try {
                  console.log("Deleting shift:", shiftToDelete.id);
                  await deleteStaffSchedule(shiftToDelete.id);
                  setFlag(prev => !prev);
                  dispatch(setMessage({ type: 'success', content: 'Xóa ca làm việc thành công!' }));
                } catch (error) {
                  dispatch(setMessage({ type: 'error', content: 'Lỗi xoá ca làm việc!' }));
                } finally {
                  setDeleteConfirmVisible(false);
                  setShiftToDelete(null);
                  setModalDetail(false);
                }
              }}
              onCancel={() => {
                setDeleteConfirmVisible(false);
                setShiftToDelete(null);
              }}
              okText="Xóa"
              cancelText="Hủy"
              centered
            />


            <Modal
              open={modalDetail}
              onCancel={() => setModalDetail(false)}
              footer={[
                <Button
                  key="edit"
                  type="primary"
                  disabled={isShiftDisabled(selectedEvent)}
                  onClick={() => {
                    setEditingShift({
                      id: selectedEvent.id,
                      doctorScheduleId: selectedEvent.extendedProps.doctorScheduleId || 0,
                      staffId: selectedEvent.extendedProps.staffId || selectedPersonId,
                      workDate: selectedEvent.start,
                      timeShift: selectedEvent.title.includes("sáng") ? 1 : 2,
                      isAvailable: true,
                      reasonOfUnavailability: selectedEvent.extendedProps.reasonOfUnavailability || "",
                    });

                    form.setFieldsValue({
                      staffId: selectedEvent.extendedProps.staffId || selectedPersonId,
                      workDate: dayjs(selectedEvent.start).local().startOf('day'),
                      shift: selectedEvent.title.includes("sáng") ? ["morning"] : ["afternoon"],
                    });

                    setModalVisible(true);
                    setModalDetail(false);
                  }}
                  style={{ borderRadius: 8 }}
                >
                  Sửa
                </Button>,
                <Button
                  key="delete"
                  danger
                  disabled={isShiftDisabled(selectedEvent)}
                  onClick={() => showDeleteConfirm(selectedEvent)}
                  style={{ borderRadius: 8 }}
                >
                  Xoá
                </Button>,
                <Button
                  key="close"
                  onClick={() => setModalDetail(false)}
                  style={{ borderRadius: 8 }}
                >
                  Đóng
                </Button>,
              ]}
              title={
                selectedEvent && (
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 22,
                        color: "#3575d3",
                        userSelect: "none",
                      }}
                    >
                      {selectedEvent.title}
                    </span>
                    {selectedEvent.departmentName && (
                      <div
                        style={{ fontSize: 15, color: "#1976d2", marginTop: 6, userSelect: "none" }}
                      >
                        {selectedEvent.departmentName} - Phòng {selectedEvent.roomName}
                      </div>
                    )}
                  </div>
                )
              }
              width={620}
              centered
              bodyStyle={{
                borderRadius: 18,
                minHeight: 280,
              }}
            >
              {selectedEvent ? (
                <>
                  {selectedEvent.extendedProps.room && <p>🏥 Phòng khám: {selectedEvent.extendedProps.room}</p>}
                  <p>🕒 Thời gian: {dayjs(selectedEvent.start).format("HH:mm")} - {dayjs(selectedEvent.end).format("HH:mm")}</p>
                  <p>👥 Số bệnh nhân: {selectedEvent.extendedProps.patients?.length || 0}</p>
                  <p>📌 Trạng thái: {selectedEvent.extendedProps.status || "Không rõ"}</p>
                  {/* <p>📌 id doctor schedule: {selectedEvent.extendedProps.doctorScheduleId || "Không rõ"}</p> */}
                  <List
                    bordered
                    dataSource={selectedEvent.extendedProps.patients || []}
                    renderItem={p => (
                      <List.Item key={p.id}>
                        <List.Item.Meta title={p.name} description={`Tuổi: ${p.age} | Ghi chú: ${p.note || "Không có"}`} />
                      </List.Item>
                    )}
                    locale={{ emptyText: "Chưa có bệnh nhân nào trong ca này." }}
                    style={{ marginBottom: 22 }}
                  />


                </>
              ) : (
                <div>Không có dữ liệu lịch làm việc.</div>
              )}

            </Modal>
          </div>
        </div>
      </ConfigProvider>
    </>

  );
};

export default StaffShiftManagement;
