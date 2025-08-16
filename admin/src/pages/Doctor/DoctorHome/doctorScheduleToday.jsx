import React, { useEffect, useState } from "react";
import { Card, List, Typography, Tag, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getScheduleByDoctorId } from "../../../services/scheduleService";

const { Text } = Typography;

const timeShiftLabels = {
  1: "Ca sáng",
  2: "Ca chiều"
};

const getStatusTag = (isAvailable) =>
  isAvailable ? <Tag color="green">Đã có bệnh nhân</Tag> : <Tag color="red">Chưa có bệnh nhân</Tag>;

const DoctorScheduleToday = ({ doctorId }) => {
  const [schedules, setSchedules] = useState([]);
  const todayStr = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    async function fetchSchedules() {
      const fromDate = todayStr;
      const toDate = todayStr;
      try {
        const result = await getScheduleByDoctorId(doctorId, fromDate,toDate);
        setSchedules(result);
      } catch (error) {
        setSchedules([]);
        console.error("Error fetching schedules:", error);
      }
    }
    if (doctorId) {
      fetchSchedules();
    }
  }, [doctorId, todayStr]);

  if (!schedules.length) {
    return <Empty description="Không có lịch làm việc hôm nay" />;
  }

  return (
    <Card title="🗓️ Lịch làm việc hôm nay" style={{ borderRadius: 12 }}>
      <List
        dataSource={schedules}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              avatar={<CalendarOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text strong>
                    {dayjs(item.workDate).format("DD/MM/YYYY")} - {timeShiftLabels[item.timeShift] || "Ca không xác định"}
                  </Text>
                  {getStatusTag(item.isAvailable)}
                </div>
              }
              description={
                <div>
                  <Text>Thời gian: {item.startTime} - {item.endTime}</Text><br />
                  <Text>Phòng: {item.room?.name || "Chưa rõ"}</Text><br />
                  <Text>Số lượt hẹn: {item.appointment?.length || 0}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DoctorScheduleToday;
