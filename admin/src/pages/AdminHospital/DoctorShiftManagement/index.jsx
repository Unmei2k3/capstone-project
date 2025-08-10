import React, { useState, useEffect } from "react";
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
import { useDispatch, useSelector } from 'react-redux';
import viLocale from "@fullcalendar/core/locales/vi";

import {
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { getDoctorByHospitalId, getDoctorByUserId } from "../../../services/doctorService";
import { useRef } from "react";
import { createSchedule, deleteDoctorSchedule, getScheduleByDoctorId, updateSchedule } from "../../../services/scheduleService";
import { getHospitalDepartments } from "../../../services/departmentService";
import { getHospitalRooms } from "../../../services/roomService";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import { getStaffNurseList } from "../../../services/staffNurseService";
import { getHospitalWorkDate } from "../../../services/hospitalService";

const { Option } = Select;
const { RangePicker } = DatePicker;

const weekdayOptions = [

  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
  { label: "Chủ nhật", value: 0 }
];

dayjs.extend(customParseFormat);
dayjs.locale("vi");


const eventColor = (info) => {
  const { type, status, patients } = info.event.extendedProps;
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


const renderEventContent = (eventInfo) => {
  const { title, extendedProps } = eventInfo.event;
  const { status, patients, department, room } = extendedProps;

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
      {department && (
        <div
          style={{
            fontWeight: "600",
            color: "#2c3e50",
            marginBottom: 4,
            whiteSpace: "normal",

            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {department}
        </div>
      )}
      {room && (
        <div
          style={{
            fontWeight: "600",
            color: "#2c3e50",
            marginBottom: 4,
            whiteSpace: "normal",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {status}
      </div>

      <div style={{ fontSize: 12, color: "#555", whiteSpace: "normal" }}>
        👥 <strong>{patients.length}</strong> bệnh nhân
      </div>
    </div>
  );
};


const AdminDoctorShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [modalDetail, setModalDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [doctorDetail, setDoctorDetail] = useState(null);
  const [events, setEvents] = useState([]);
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message)
  const [rooms, setRooms] = useState([]);
  const { confirm } = Modal;
  const calendarRef = useRef();
  const [flag, setFlag] = useState(false);
  const [nurses, setNurses] = useState([]);
  const user = useSelector((state) => state.user.user);
  const shiftSelectMode = editingShift ? undefined : "multiple";
  // console.log("user is: " + JSON.stringify(user));
  // console.log("hospital admin id is: " + user.hospitals[0]?.id);
  // console.log("hospital admin is: " + JSON.stringify(user));
  // console.log("doctor detail: " + JSON.stringify(doctorDetail));
  const [workingDates, setWorkingDates] = useState([]);

  useEffect(() => {
    const fetchHospitalWorkDates = async () => {
      if (!user?.hospitals?.[0]?.id) return;
      try {
        const response = await getHospitalWorkDate(user.hospitals[0].id);
        console.log("response log is : ", response);
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
        morning: { startTime: null, endTime: null },
        afternoon: { startTime: null, endTime: null },
      };
    }
    return {
      morning: { startTime: dayInfo.startTime, endTime: "12:00:00" },
      afternoon: { startTime: "12:00:00", endTime: dayInfo.endTime },
    };
  };

  const isShiftDisabled = (event) => {
    if (!event) return true;

    const now = dayjs();
    const eventEnd = dayjs(event.end);

    const patients = event.extendedProps?.patients || [];

    if (patients.length > 0) return true;

    if (eventEnd.isBefore(now)) return true;

    return false;
  };
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user?.id) return;
      const result = await getDoctorByHospitalId(user.hospitals[0]?.id);
      setSelectedDoctorId(result?.[0]?.user?.id || null);
      if (result) {
        console.log("result doctor list : " + JSON.stringify(result));
        setDoctors(result);
      } else {
        console.error("Không tìm thấy thông tin bác sĩ.");
      }
    };
    fetchDoctor();
  }, [user?.hospitals[0]?.id]);


  useEffect(() => {
    const fetchStaffs = async () => {
      if (!user?.hospitals?.[0]?.id) return;

      try {
        const staffList = await getStaffNurseList(user.hospitals[0].id);
        console.log("Staff nurse list: ", JSON.stringify(staffList));
        const nurseList = (staffList || []).filter((s) => s.role?.name === 'Nurse');
        setNurses(nurseList);
        console.log("Nurse list: ", JSON.stringify(nurses));
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);

        setNurses([]);
      }
    };

    fetchStaffs();
  }, [user?.hospitals]);


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
    const hospitalId = user?.hospitals[0]?.id;
    if (!hospitalId) return;
    const fetchData = async () => {
      const roomData = await getHospitalRooms(hospitalId);
      setRooms(roomData || []);
    };
    fetchData();
  }, [user?.hospitals[0]?.id]);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!selectedDoctorId) return;
      const result = await getDoctorByUserId(selectedDoctorId);
      if (result) {
        console.log("result doctor detail : " + result);
        setDoctorDetail(result);
        console.log("doctor detail: " + JSON.stringify(doctorDetail));
      } else {
        console.error("Không tìm thấy thông tin bác sĩ.");
      }
    };
    fetchDoctor();
  }, [selectedDoctorId]);

  useEffect(() => {
    if (doctorDetail && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      handleDatesSet({ start: view.activeStart, end: view.activeEnd });
    }
  }, [doctorDetail, flag]);


  const showDeleteConfirm = (shift) => {
    setShiftToDelete(shift);
    setDeleteConfirmVisible(true);
  };

  const handleDatesSet = async (arg) => {
    if (!doctorDetail) return;

    const from = dayjs(arg.start).toISOString();
    const to = dayjs(arg.end).toISOString();
    console.log("from schedule : " + from + " to Schedule : " + to + " doctor id : " + doctorDetail.id);

    try {
      const result = await getScheduleByDoctorId(doctorDetail.id, from, to);
      console.log("result doctor schedule: " + JSON.stringify(result));
      const now = dayjs();

      const formattedEvents = result.map((item) => {
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
              serviceName: appt.serviceName || "Không rõ",
              servicePrice: appt.servicePrice || 0,
            };
          }) || [];

        return {
          id: item.id,
          title: item.timeShift === 1 ? "Ca sáng" : "Ca chiều",

          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            type: status.includes("rỗng") ? "shift" : "appointment",
            department: item.room?.department?.name || "Không rõ",
            room: item.room?.name || "Không rõ",
            status,
            patients,
            nurseId: item.nurseInfo?.id || null,
          },
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Lỗi khi tải lịch làm việc:", err);
    }
  };

  const onAddShift = (dateStr = null) => {
    setEditingShift(null);
    form.resetFields();
    if (dateStr) form.setFieldValue("workDate", dayjs(dateStr));
    setModalVisible(true);
  };

  const handleEventClick = ({ event }) => {
    setSelectedEvent(event);
    console.log("Selected even in doctor shift management " + JSON.stringify(selectedEvent));
    setModalDetail(true);
  };
  const onDeleteShift = (id) => {
    confirm({
      title: "Xác nhận xóa ca làm việc?",
      onOk: () => {
        const newData = shifts.filter((s) => String(s.id) !== String(id));
        setShifts(newData);
        setModalDetail(false);
        dispatch(setMessage({ type: 'success', content: 'Xóa ca làm việc thành công!' }));
      },
    });
  };

  const onFinishAddOrUpdate = async (values) => {
    try {
      const hospitalAffiliationId = doctorDetail?.hospitalAffiliations?.[0]?.id || 0;
      const doctorId = doctorDetail?.id || 0;
      let shiftArray = [];
      const { roomId, shift, weekday, workDate, nurseId } = values;

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

      const dayOfWeek = Array.isArray(weekday) && weekday.length > 0
        ? weekday[0]
        : (workDate ? dayjs(workDate).day() : null);

      if (dayOfWeek === null) {
        dispatch(setMessage({ type: 'error', content: 'Vui lòng chọn ngày làm việc hoặc ngày trong tuần!' }));
        return;
      }
      const shiftTimesMap = getShiftTimesByDay(dayOfWeek);
      console.log("shiftTimesMap is : " + JSON.stringify(shiftTimesMap));
    
      const validShifts = shiftArray.every(sh => {
        const times = shiftTimesMap[sh];
        return times && times.startTime && times.endTime && times.startTime.trim() !== "00:00:00" && times.endTime.trim() !== "00:00:00";
      });
      console.log("validShifts is : " + shiftTimesMap);
      if (!validShifts) {
        dispatch(setMessage({
          type: "error",
          content: "Ngày làm việc này không hỗ trợ ca làm đã chọn vì bệnh viện đóng cửa hoặc thời gian không hợp lệ.",
        }));
        return;
      }


      const shiftsPayload = shiftArray.map((sh) => {
        const times = shiftTimesMap[sh];
        if (!times || !times.startTime || !times.endTime) {
          throw new Error(`Ca làm '${sh}' không có thời gian hợp lệ trong ngày đã chọn`);
        }
        return {
          startTime: times.startTime,
          endTime: times.endTime,
        };
      });

      if (editingShift) {
        console.log("is updating ...");
        const scheduleId = editingShift.id || 0;
        const shiftKey = shiftArray[0];
        const times = shiftTimesMap[shiftKey];
        if (!times || !times.startTime || !times.endTime) {
          dispatch(setMessage({
            type: 'error',
            content: 'Ngày làm việc này không hỗ trợ ca làm đã chọn vì bệnh viện đóng cửa hoặc thời gian không hợp lệ.'
          }));
          return;
        }

        const updatePayload = {
          id: scheduleId,
          hospitalAffiliationId,
          userId: nurseId,
          roomId,
          daysOfWeek: dayOfWeek,
          startTime: times.startTime,
          endTime: times.endTime,
          workDate: workDate ? dayjs(workDate).format("YYYY-MM-DD") : null,
          isAvailable: true,
          reasonOfUnavailability: "",
        };
        console.log("Payload cập nhật:", JSON.stringify(updatePayload));
        await updateSchedule(scheduleId, updatePayload);
        setFlag(prev => !prev);
        dispatch(setMessage({ type: 'success', content: 'Cập nhật ca làm việc thành công!' }));
      } else {
        const daysOfWeekArr = Array.isArray(weekday) && weekday.length > 0
          ? weekday
          : (workDate ? [dayjs(workDate).day()] : []);

        const payload = {
          doctorIds: [doctorId],
          daysOfWeek: daysOfWeekArr,
          shifts: shiftsPayload,
          startDate: workDate ? dayjs(workDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          endDate: workDate ? dayjs(workDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          isAvailable: false,
          reasonOfUnavailability: "",
        };

        console.log("Payload tạo mới:", JSON.stringify(payload));
        await createSchedule(payload);
        setFlag(prev => !prev);
        dispatch(setMessage({ type: 'success', content: 'Tạo ca làm việc thành công!' }));
      }

      setModalVisible(false);
      setEditingShift(null);
      form.resetFields();

    } catch (error) {
      console.error("Lỗi khi lưu ca làm việc:", error);
      dispatch(setMessage({ type: 'error', content: 'Lưu ca làm việc thất bại, vui lòng thử lại!' }));
    }
  };


  const onFinishBulk = async (values) => {
    const { doctorIds, weekdays, shift, dateRange } = values;

    if (!doctorIds || doctorIds.length === 0) {
      dispatch(setMessage({ type: 'error', content: 'Vui lòng chọn bác sĩ!' }));
      return;
    }
    if (!weekdays || weekdays.length === 0) {
      dispatch(setMessage({ type: 'error', content: 'Vui lòng chọn ngày trong tuần!' }));
      return;
    }
    if (!shift || shift.length === 0) {
      dispatch(setMessage({ type: 'error', content: 'Vui lòng chọn ca làm!' }));
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      dispatch(setMessage({ type: 'error', content: 'Vui lòng chọn khoảng thời gian!' }));
      return;
    }

    try {
      for (const dayOfWeek of weekdays) {
        const shiftTimesMap = getShiftTimesByDay(dayOfWeek);

        const validShifts = shift.every((sh) => {
          const times = shiftTimesMap[sh];
          return times && times.startTime && times.endTime && times.startTime.trim() !== "00:00:00" && times.endTime.trim() !== "00:00:00";
        });

        if (!validShifts) {
          dispatch(setMessage({
            type: "error",
            content: `Ngày ${weekdayOptions.find(d => d.value === dayOfWeek)?.label || dayOfWeek} không hỗ trợ ca làm đã chọn do bệnh viện đóng cửa hoặc thời gian không hợp lệ.`
          }));
          return;
        }

        const shiftsPayload = shift.map((sh) => {
          const times = shiftTimesMap[sh];
          return {
            startTime: times.startTime,
            endTime: times.endTime,
          };
        });

        const payload = {
          doctorIds: doctorIds,
          daysOfWeek: [dayOfWeek],
          shifts: shiftsPayload,
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
          isAvailable: false,
          reasonOfUnavailability: "",
        };

        console.log("Bulk create payload:", JSON.stringify(payload));
        await createSchedule(payload);
      }

      dispatch(setMessage({ type: 'success', content: 'Tạo lịch mẫu thành công!!' }));
      setFlag(prev => !prev);
      bulkForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo lịch mẫu:", error);
      dispatch(setMessage({ type: 'error', content: 'Tạo lịch mẫu thất bại, vui lòng thử lại sau!' }));
    }
  };


  const Legend = () => (
    <Row justify="center" gutter={16} style={{ marginBottom: 20 }}>
      <Col>
        <Tag icon={<CalendarOutlined />} color="#3575d3" style={{ borderRadius: 8 }}>
          Đặt khám
        </Tag>
      </Col>
      <Col>
        <Tag icon={<CheckCircleOutlined />} color="#43a047" style={{ borderRadius: 8 }}>
          Đang khám
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
                  Quản lý lịch làm việc bác sĩ
                </h1>
              </Col>
            </Row>

            <Row justify="center" style={{ marginBottom: 32 }}>
              <Select
                allowClear
                showSearch
                placeholder="Lọc theo bác sĩ"
                style={{
                  width: 320,
                  fontWeight: 600,
                  background: "#f6fafd",
                  borderRadius: 8,
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(value) => setSelectedDoctorId(value)}
                value={selectedDoctorId}
              >
                {doctors.map((doc) => (
                  <Option key={doc?.user?.id} value={doc?.user?.id}>
                    {doc?.user?.fullname}
                  </Option>
                ))}
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
                    Tạo lịch cho bác sĩ
                  </h2>
                  <Form
                    layout="vertical"
                    form={bulkForm}
                    onFinish={onFinishBulk}
                    scrollToFirstError
                  >
                    <Form.Item
                      name="doctorIds"
                      label="Bác sĩ"
                      rules={[{ required: true, message: "Vui lòng chọn bác sĩ." }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn bác sĩ"
                        onChange={(value) => {
                          if (value.includes("all")) {
                            const allIds = doctors.map((n) => n.user?.id);
                            bulkForm.setFieldsValue({ doctorIds: allIds });
                          }
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        <Option key="all" value="all">
                          Tất cả
                        </Option>
                        {doctors.map((doc) => (
                          <Option key={doc?.user?.id} value={doc?.id}>
                            {doc?.user?.fullname}
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
                      Tạo lịch
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
                    datesSet={handleDatesSet}
                    headerToolbar={{
                      start: "prev,next today",
                      center: "title",
                      end: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    locale={viLocale}
                    events={events}
                    height={600}
                    eventClick={handleEventClick}
                    eventDidMount={eventColor}
                    dateClick={(info) => onAddShift(info.dateStr)}
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
                onFinish={onFinishAddOrUpdate}
                initialValues={{
                  status: "pending",
                }}
                scrollToFirstError
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Bác sĩ"
                    >
                      <Input
                        value={
                          (() => {
                            return doctorDetail?.user?.fullname || '';
                          })()
                        }
                        disabled
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    {editingShift && (
                      <Form.Item
                        name="nurseId"
                        label="Y tá"
                        rules={[{ required: true, message: "Vui lòng chọn y tá" }]}
                      >
                        <Select placeholder="Chọn Y tá" style={{ borderRadius: 8 }}>
                          {nurses.map((nurse) => (
                            <Option key={nurse?.id} value={nurse?.id}>
                              {nurse?.fullname}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}
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
                </Row>
                {editingShift && (
                  <Form.Item
                    name="roomId"
                    label="Phòng khám"
                    rules={[{ required: true, message: "Vui lòng chọn phòng khám" }]}
                  >
                    <Select placeholder="Chọn phòng khám" style={{ borderRadius: 8 }}>
                      {rooms.map(room => (
                        <Option key={room.id} value={room.id}>{room.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
                <div style={{ fontSize: 14, color: "#555", marginTop: 8, userSelect: "none", marginLeft: 10 }}>
                  {form.getFieldValue("workDate") ? (() => {
                    const dayOfWeek = dayjs(form.getFieldValue("workDate")).day();
                    const times = getShiftTimesByDay(dayOfWeek);

                    return (
                      <>
                        <div>
                          <b>Ca sáng:</b> {times.morning?.startTime || "--"} - {times.morning?.endTime || "--"}
                        </div>
                        <div>
                          <b>Ca chiều:</b> {times.afternoon?.startTime || "--"} - {times.afternoon?.endTime || "--"}
                        </div>
                      </>
                    );
                  })() : (
                    <div>Vui lòng chọn ngày làm việc để xem giờ ca làm.</div>
                  )}
                </div>
              </Form>
            </Modal>

            <Modal
              open={modalDetail}
              onCancel={() => setModalDetail(false)}
              footer={[
                <Button
                  key="edit"
                  type="primary"
                  disabled={isShiftDisabled(selectedEvent)}
                  onClick={() => {
                    setEditingShift(selectedEvent);
                    form.setFieldsValue({
                      workDate: selectedEvent.start ? dayjs(selectedEvent.start) : null,
                      shift: selectedEvent.title?.toLowerCase().includes("sáng") ? ["morning"] : ["afternoon"],
                      roomId: rooms.find(r => r.name === selectedEvent.extendedProps?.room)?.id || null,
                      weekday: [dayjs(selectedEvent.start).day()],
                      nurseId: selectedEvent.extendedProps?.nurseId || null,
                    });
                    setModalVisible(true);
                    setModalDetail(false);
                  }}
                  style={{ borderRadius: 8 }}
                >
                  Sửa
                </Button>,
                // <Button
                //   key="delete"
                //   danger
                //   disabled={isShiftDisabled(selectedEvent)}
                //   onClick={() => onDeleteShift(selectedEvent.id)}
                //   style={{ borderRadius: 8 }}
                // >
                //   Xoá
                // </Button>,
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
              centered
              bodyStyle={{ maxHeight: "50vh", overflowY: "auto", paddingRight: 12 }}
              title={selectedEvent ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 20 }}>
                    {selectedEvent.title}
                  </span>
                  {selectedEvent.extendedProps?.department && (
                    <span style={{ fontSize: 15, color: "#1a73e8" }}>
                      {selectedEvent.extendedProps.department} - {selectedEvent.extendedProps.room}
                    </span>
                  )}
                </div>
              ) : null}
              width={600}
            >
              {selectedEvent ? (
                <>
                  {selectedEvent.extendedProps?.room && (
                    <p><b>🏥 Phòng khám:</b> {selectedEvent.extendedProps.room}</p>
                  )}
                  <p><b>🕒 Thời gian:</b> {dayjs(selectedEvent.start).format("HH:mm")} - {dayjs(selectedEvent.end).format("HH:mm")}</p>
                  <p><b>👥 Số bệnh nhân:</b> {selectedEvent.extendedProps?.patients?.length || 0}</p>
                  <p><b>📌 Trạng thái:</b> {selectedEvent.extendedProps?.status || "Không rõ"}</p>

                  <List
                    dataSource={selectedEvent.extendedProps?.patients || []}
                    renderItem={(p) => (
                      <List.Item key={p.id}>
                        <List.Item.Meta
                          title={<b>{p.name}</b>}
                          description={`Tuổi: ${p.age} | Giới tính: ${p.gender} | Dịch vụ: ${p.serviceName} | Giá: ${p.servicePrice} | Ghi chú: ${p.note || "Không có"}`}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: "Chưa có bệnh nhân nào." }}
                    style={{ marginTop: 16 }}
                  />
                </>
              ) : (
                <div>Không có dữ liệu lịch làm việc.</div>
              )}
            </Modal>

            <Modal
              visible={deleteConfirmVisible}
              title="Xác nhận xóa ca làm việc?"
              onOk={async () => {
                try {
                  console.log("Deleting shift:", shiftToDelete.id);
                  await deleteDoctorSchedule(shiftToDelete.id);
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
          </div>
        </div>
      </ConfigProvider>
    </>

  );
};

export default AdminDoctorShiftManagement;
