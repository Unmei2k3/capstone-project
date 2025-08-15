import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { Modal, List, ConfigProvider } from "antd";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "./style.scss";
import { useSelector } from "react-redux";
import { getDoctorByUserId } from "../../../services/doctorService";
import { getScheduleByDoctorId } from "../../../services/scheduleService";
import { useRef } from "react";
import {
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
dayjs.locale("vi");
const LegendColor = () => (
  <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", gap: 8 }}>
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {[
        { icon: <CheckCircleOutlined />, color: "#4caf50", border: "#388e3c", label: "Đang khám" },
        { icon: <PauseCircleOutlined />, color: "#ffd54f", border: "#ffa000", label: "Chưa bắt đầu" },
        { icon: <CheckCircleOutlined />, color: "#e0e0e0", border: "#9e9e9e", label: "Đã khám xong" },
        { icon: <CalendarOutlined />, color: "#ffb3b3", border: "#ff7875", label: "Ca đặt lịch (booking)" },
        { color: "#64b5f6", border: "#1976d2", label: "Ca làm việc khác" },
      ].map(({ icon, color, border, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 16,
            height: 16,
            backgroundColor: color,
            border: `1px solid ${border}`,
            borderRadius: 4,
          }} />
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {icon} {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);
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

const WorkSchedule = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const user = useSelector((state) => state.user.user);
  const [doctorDetail, setDoctorDetail] = useState(null);
  const calendarRef = useRef();
  useEffect(() => {
    if (doctorDetail && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      handleDatesSet({ start: view.activeStart, end: view.activeEnd });
    }
  }, [doctorDetail]);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!user.id) return;
      const result = await getDoctorByUserId(user.id);
      if (result) {
        console.log("result doctor detail : " + result);
        setDoctorDetail(result);
      } else {
        console.error("Không tìm thấy thông tin bác sĩ.");
      }
    };
    fetchDoctor();
  }, [user?.id]);

  const handleDatesSet = async (arg) => {
    if (!doctorDetail) return;

    const from = dayjs(arg.start).toISOString();
    const to = dayjs(arg.end).toISOString();
    console.log("from schedule : " + from + " to Schedule : " + to);

    try {
      const result = await getScheduleByDoctorId(doctorDetail?.id, from, to);
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
              service: appt.service?.name || "Không rõ",
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
          },
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Lỗi khi tải lịch làm việc:", err);
    }
  };


  const handleEventClick = ({ event }) => {
    setSelectedEvent(event);
    console.log("Selected event:", selectedEvent);
    setModalOpen(true);
  };

  const eventColor = (info) => {
    const { type, status } = info.event.extendedProps;

    if (type === "booking") {
      return {
        backgroundColor: "#ffb3b3",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #ff7875",
        boxShadow: "0 2px 8px rgba(255,120,117,0.12)",
      };
    }

    if (status === "Đang khám") {
      return {
        backgroundColor: "#4caf50",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #388e3c",
        boxShadow: "0 2px 8px rgba(76,175,80,0.12)",
      };
    }

    if (status === "Chưa bắt đầu") {
      return {
        backgroundColor: "#ffd54f",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #ffa000",
        boxShadow: "0 2px 8px rgba(255,213,79,0.12)",
      };
    }

    if (status === "Đã khám") {
      return {
        backgroundColor: "#bdbdbd",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #9e9e9e",
        boxShadow: "0 2px 8px rgba(189,189,189,0.12)",
      };
    }

    if (status === "Ca rỗng (đang chờ)") {
      return {
        backgroundColor: "#90caf9",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #42a5f5",
        boxShadow: "0 2px 8px rgba(144,202,249,0.12)",
      };
    }

    if (status === "Ca rỗng (sắp tới)") {
      return {
        backgroundColor: "#ffe082",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #ffca28",
        boxShadow: "0 2px 8px rgba(255,224,130,0.12)",
      };
    }

    if (status === "Ca rỗng (đã qua)") {
      return {
        backgroundColor: "#e0e0e0",
        color: "black",
        borderRadius: "8px",
        border: "1px solid #bdbdbd",
        boxShadow: "0 2px 8px rgba(224,224,224,0.12)",
      };
    }

    return {
      backgroundColor: "#64b5f6",
      color: "black",
      borderRadius: "8px",
      border: "1px solid #1976d2",
      boxShadow: "0 2px 8px rgba(100,181,246,0.12)",
    };
  };


  return (
    <ConfigProvider locale={viVN}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 5,
          background: "#f9fafb",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          marginBottom: 50
        }}
      >
        <h2 style={{
          textAlign: "center",
          marginBottom: 32,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 1,
          color: "#1a237e",
          userSelect: "none",
        }}>
          Lịch làm việc của tôi
        </h2>

        <LegendColor />

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          ref={calendarRef}
          eventContent={renderEventContent}
          locale={viLocale}
          datesSet={handleDatesSet}
          events={events}
          height={600}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            Object.assign(info.el.style, eventColor(info));
          }}
          nowIndicator={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="18:00:00"
        />

        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
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
              <p><b>🕒 Thời gian:</b> {dayjs(selectedEvent.start).format("HH:mm")} - {dayjs(selectedEvent.end).format("HH:mm")}</p>
              <p><b>👥 Số bệnh nhân:</b> {selectedEvent.extendedProps?.patients?.length || 0}</p>
              <p><b>📌 Trạng thái:</b> {selectedEvent.extendedProps?.status || "Không rõ"}</p>

              <List
                dataSource={selectedEvent.extendedProps?.patients || []}
                renderItem={(p) => (
                  <List.Item key={p.id}>
                    <List.Item.Meta
                      title={<b>{p.name}</b>}
                      description={`Tuổi: ${p.age} | Giới tính: ${p.gender} | Dịch vụ: ${p.service} | Ghi chú: ${p.note || "Không có"}`}
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
      </div>
    </ConfigProvider>
  );
};

export default WorkSchedule;
