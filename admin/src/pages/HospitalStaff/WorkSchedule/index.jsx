import React, { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { Modal, ConfigProvider, Tag, Row, Col } from "antd";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { getScheduleByStaffNurseId } from "../../../services/scheduleService";
import "dayjs/locale/vi";
import { getStaffNurseByUserId } from "../../../services/staffNurseService";


dayjs.locale("vi");


const LegendColor = () => (
  <Row justify="center" gutter={16} style={{ marginBottom: 24 }}>
    <Col>
      <Tag color="#4caf50" style={{ borderRadius: 8 }}>
        Đang làm
      </Tag>
    </Col>
    <Col>
      <Tag color="#ffd54f" style={{ borderRadius: 8, color: "#4e342e" }}>
        Chưa bắt đầu
      </Tag>
    </Col>
 
    <Col>
      <Tag color="#2196f3" style={{ borderRadius: 8 }}>
        Khác
      </Tag>
    </Col>
  </Row>
);


const StaffWorkSchedule = () => {
  const user = useSelector((state) => state.user.user);
  const hospitalId = user?.hospitals?.[0]?.id;

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [staffNurseDetail, setStaffNurseDetail] = useState(null);
  const calendarRef = useRef();

  useEffect(() => {
    const fetchStaffNurseDetail = async () => {
      if (!user?.id) return;
      try {
        const result = await getStaffNurseByUserId(user.id);
        if (result) {
          setStaffNurseDetail(result);
        } else {
          console.error("Không tìm thấy thông tin nhân viên.");
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết nhân viên:", error);
      }
    };
    fetchStaffNurseDetail();
  }, [user?.id]);

  const handleDatesSet = useCallback(
    async (arg) => {
      if (!staffNurseDetail?.staffId || !hospitalId) {
        setEvents([]); 
        return;
      }
      try {
        const from = dayjs(arg.start).toISOString();
        const to = dayjs(arg.end).toISOString();
        const data = await getScheduleByStaffNurseId(
          staffNurseDetail.staffId,
          from,
          to,
          hospitalId
        );
        const schedules = data?.schedules || [];
        const now = dayjs();

        const eventsFormatted = schedules.map((item) => {
          const dateStr = item.workDate.split("T")[0];
          const start = dayjs(`${dateStr}T${item.startTime}`).toISOString();
          const end = dayjs(`${dateStr}T${item.endTime}`).toISOString();

      
      

          return {
            id: item.id,
            title: item.timeShift === 1 ? "Ca sáng" : "Ca chiều",
            start,
            end,
            extendedProps: {
              type: "shift",
            },
          };
        });

        setEvents(eventsFormatted);
      } catch (error) {
        console.error("Lỗi khi tải lịch làm việc nhân viên:", error);
        setEvents([]);
      }
    },
    [staffNurseDetail, hospitalId]
  );

  useEffect(() => {
    if (staffNurseDetail && hospitalId && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      handleDatesSet({ start: view.activeStart, end: view.activeEnd });
    }
  }, [staffNurseDetail, hospitalId, handleDatesSet]);

  const handleEventClick = ({ event }) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const eventColor = (info) => {
    const { status } = info.event.extendedProps;
    let backgroundColor = "#bdbdbd";
    let borderColor = "#9e9e9e";
    let textColor = "#212121";

    if (status === "Đang làm") {
      backgroundColor = "#4caf50";
      borderColor = "#388e3c";
      textColor = "#fff";
    } else if (status === "Chưa bắt đầu") {
      backgroundColor = "#ffd54f";
      borderColor = "#ffa000";
      textColor = "#4e342e";
    }  else if (status === "Đã khám") {
      backgroundColor = "#43a047";
      borderColor = "#2e7d32";
      textColor = "#fff";
    } else {
      backgroundColor = "#2196f3";
      borderColor = "#1976d2";
      textColor = "#fff";
    }

    Object.assign(info.el.style, {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      color: textColor,
      borderRadius: 8,
      fontWeight: "600",
      boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
    });
  };

  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    const { status } = extendedProps;

    return (
      <div
        style={{
          padding: 8,
          borderRadius: 6,
          height: "100%",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          lineHeight: 1.3,
        }}
      >
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
          {title}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "6px 0" }} />

        <div
          style={{
            fontSize: 12,
            color: status === "Đã khám" ? "green" : "#e67e22",
            fontWeight: "600",
          }}
        >
          {status}
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider locale={viVN}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 24,
          background: "#f9fafb",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 32,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 1,
            color: "#1a237e",
            userSelect: "none",
          }}
        >
          Lịch làm việc của tôi
        </h2>

        <LegendColor />

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          ref={calendarRef}
          locale={viLocale}
          events={events}
          height={600}
          eventClick={handleEventClick}
          eventDidMount={eventColor}
          eventContent={renderEventContent}
          nowIndicator={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          datesSet={handleDatesSet}
        />

        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
          width={400}
          title={selectedEvent ? selectedEvent.title : null}
        >
          {selectedEvent ? (
            <p>
              <b>🕒 Thời gian:</b> {dayjs(selectedEvent.start).format("HH:mm")} -{" "}
              {dayjs(selectedEvent.end).format("HH:mm")}
            </p>
          ) : (
            <div>Không có dữ liệu lịch làm việc.</div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default StaffWorkSchedule;
