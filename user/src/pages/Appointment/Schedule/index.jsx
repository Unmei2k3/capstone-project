import { current } from "@reduxjs/toolkit";
import { Button, Calendar, ConfigProvider, Menu } from "antd";
import dayjs from 'dayjs';
import viVN from 'antd/locale/vi_VN';
import { LeftOutlined, EnvironmentOutlined, CalendarOutlined, SolutionOutlined, CheckCircleFilled, RightOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import "./styles.scss";
import { getHospitalSpecializationSchedule } from "../../../services/scheduleService";

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);
dayjs.locale('vi');


function AppointmentSchedule({ onNext, defaultValue, infomationValue, onBack }) {

    const items = [
        {
            key: 'center',
            label: <span style={{ fontWeight: 600 }}>{infomationValue.hospitalName}</span>,
        },
        {
            key: 'date',
            label: <span style={{ color: '#00bfff', fontWeight: 600 }}>Chọn ngày khám</span>,
        },
    ];
    const defaultSelectedDate = dayjs().startOf('day');
    const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
    const [selectedShift, setSelectedShift] = useState(null);
    const [fromDate, setFromDate] = useState(defaultSelectedDate.startOf('month').startOf('day').toISOString());
    const [toDate, setToDate] = useState(defaultSelectedDate.endOf('month').endOf('day').toISOString());
    const [schedules, setSchedules] = useState([]);
    const [hasMorning, setHasMorning] = useState(false);
    const [hasAfternoon, setHasAfternoon] = useState(false);
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const hospitalIdInt = defaultValue?.hospitalId ? parseInt(defaultValue.hospitalId, 10) : undefined;
                const data = await getHospitalSpecializationSchedule({
                    hospitalId: hospitalIdInt,
                    doctorIds: defaultValue?.doctor?.id ? [defaultValue.doctor.id] : [],
                    specializationId: defaultValue?.specialty?.id,
                    dateFrom: fromDate,
                    dateTo: toDate
                });
                const data2 = ({
                    hospitalId: hospitalIdInt,
                    doctorIds: defaultValue?.doctor?.id ? [defaultValue.doctor.id] : [],
                    specializationId: defaultValue?.specialty?.id,
                    dateFrom: fromDate,
                    dateTo: toDate
                });
                console.log("data2 call api: " + JSON.stringify(data2));
                console.log("data call api: " + JSON.stringify(data));
                setSchedules(data.schedules || []);
                console.log("schedule call api: " + JSON.stringify(schedules));
            } catch (err) {
                console.error("Failed to fetch schedules:", err);
            }
        };

        fetchSchedule();
    }, [toDate, fromDate]);

    useEffect(() => {
        if (!selectedDate || !schedules.length) {
            setHasMorning(false);
            setHasAfternoon(false);
            return;
        }

        const selected = selectedDate.format("YYYY-MM-DD");
        const schedulesOfDay = schedules.filter(s =>
            dayjs(s.workDate).format("YYYY-MM-DD") === selected && s.isAvailable
        );

        const morning = schedulesOfDay.some(s =>
            dayjs(s.startTime, "HH:mm:ss").isBefore(dayjs("12:00:00", "HH:mm:ss"))
        );
        const afternoon = schedulesOfDay.some(s =>
            dayjs(s.startTime, "HH:mm:ss").isAfter(dayjs("12:29:00", "HH:mm:ss"))
        );

        setHasMorning(morning);
        setHasAfternoon(afternoon);
    }, [selectedDate, schedules]);

    const handleSelect = (date) => {
        setSelectedDate(date);
        const startOfMonth = date.startOf('month').startOf('day').toISOString();
        const endOfMonth = date.endOf('month').endOf('day').toISOString();

        setFromDate(startOfMonth);
        setToDate(endOfMonth);
        setSelectedShift(null);
    };
    useEffect(() => {
        if (defaultValue?.specialty) {
            setSelectedShift(defaultValue.shift);
        }
    }, [defaultValue]);
    console.log("information in 2 steps is " + JSON.stringify(defaultValue));
    return <>

        <div style={{ background: '#eaf8ff', display: "flex", flexDirection: "column" }}>
            <Menu
                mode="horizontal"
                selectedKeys={[current]}
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 16,
                    boxShadow: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: 50
                }}
                items={items}
                disabledOverflow
            />
            <ConfigProvider
                locale={viVN}
                theme={{
                    token: {
                        colorPrimary: '#00bfff',
                    },
                    components: {
                        Calendar: {
                            itemActiveBg: '#00bfff',
                            itemActiveColor: '#fff',
                        },
                    },
                }}
            >
                <div className="responsive-container"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: 32,
                        padding: 40,
                    }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px #e6f4ff',
                        width: 340,
                        minWidth: 300,
                        paddingBottom: 24,
                    }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #00bfff 60%, #00eaff 100%)',
                            color: '#fff',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            fontWeight: 600,
                            fontSize: 18,
                            padding: '16px 24px',
                        }}>
                            Thông tin cơ sở y tế
                        </div>
                        <div style={{ padding: '24px 24px 0 24px', fontSize: 15 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                <CheckCircleFilled style={{ color: '#00bfff', marginRight: 8 }} />
                                {infomationValue.hospitalName}
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Dịch vụ:</span> {infomationValue.serviceName}
                            </div>
                            {defaultValue?.specialty?.name && (
                                <div style={{ marginBottom: 8 }}>
                                    <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                    <span style={{ fontWeight: 500 }}>Chuyên khoa:</span> {defaultValue.specialty.name}
                                </div>
                            )}
                            {defaultValue?.doctor?.user?.fullname && (
                                <div style={{ marginBottom: 8 }}>
                                    <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                    <span style={{ fontWeight: 500 }}>Bác sĩ: {defaultValue.doctor.user.fullname}</span>
                                </div>
                            )}
                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Ngày khám:</span> {selectedDate.format('DD/MM/YYYY')}
                                {selectedShift && (
                                    <span style={{ fontWeight: 500 }}>
                                        {" "}({selectedShift === 'morning' ? 'Buổi sáng' : 'Buổi chiều'})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 50 }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 16,
                            boxShadow: '0 2px 8px #e6f4ff',
                            width: "auto",
                            maxWidth: 600,
                            paddingBottom: 24,
                        }}>
                            <div style={{
                                background: 'linear-gradient(90deg, #00bfff 60%, #00eaff 100%)',
                                color: '#fff',
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                fontWeight: 600,
                                fontSize: 20,
                                padding: '16px 24px',
                                marginBottom: 0,
                            }}>
                                Vui lòng chọn ngày khám
                            </div>
                            <div style={{ padding: '24px 24px 0 24px' }}>
                                <Calendar
                                    fullscreen={false}
                                    value={selectedDate}
                                    onSelect={handleSelect}
                                    disabledDate={currentDate => {
                                        const dateStr = currentDate.format('YYYY-MM-DD');
                                        const today = dayjs().startOf('day')
                                        if (!currentDate.isAfter(today)) {
                                            return true;
                                        }
                                        const schedulesOfDay = schedules.filter(s =>
                                            dayjs(s.workDate).format('YYYY-MM-DD') === dateStr && s.isAvailable
                                        );

                                        const hasMorning = schedulesOfDay.some(s =>
                                            dayjs(s.startTime, 'HH:mm:ss').isBefore(dayjs('12:00:00', 'HH:mm:ss'))
                                        );
                                        const hasAfternoon = schedulesOfDay.some(s =>
                                            dayjs(s.startTime, 'HH:mm:ss').isSameOrAfter(dayjs('12:00:00', 'HH:mm:ss'))
                                        );


                                        return !(hasMorning || hasAfternoon);
                                    }}
                                    headerRender={({ value, onChange }) => (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                                        }}>
                                            <LeftOutlined
                                                style={{ color: '#00bfff', fontSize: 18, cursor: 'pointer', marginRight: 12 }}
                                                onClick={() => onChange(value.subtract(1, 'month'))}
                                            />
                                            <span style={{ color: '#00bfff', fontWeight: 600, fontSize: 18, marginRight: 12 }}>
                                                THÁNG {value.format('MM-YYYY')}
                                            </span>
                                            <RightOutlined
                                                style={{ color: "#00bfff", fontSize: 18, cursor: "pointer" }}
                                                onClick={() => onChange(value.add(1, "month"))}
                                            />
                                        </div>
                                    )}
                                    locale={viVN}
                                    dateFullCellRender={date => {
                                        const isSelected = date.isSame(selectedDate, 'date');
                                        const day = date.day();
                                        let color = undefined;
                                        if (day === 0) color = '#ff4d4f';
                                        if (day === 6) color = '#faad14';
                                        return (
                                            <div style={{
                                                width: "100%", height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: 8,
                                                background: isSelected ? '#00bfff' : undefined,
                                                color: isSelected ? '#fff' : color,
                                                fontWeight: isSelected ? 700 : 500,
                                                border: isSelected ? 'none' : '1px solid #e6f4ff',
                                                cursor: 'pointer',
                                            }}>
                                                {date.date().toString().padStart(2, '0')}
                                            </div>
                                        );
                                    }}
                                    monthCellRender={() => null}
                                />
                            </div>

                            {selectedDate && (
                                <div style={{ marginTop: 32, padding: '0 24px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
                                        Chọn ca khám
                                    </div>
                                    <div style={{ display: 'flex', gap: 24 }}>
                                        <Button
                                            type={selectedShift === 'morning' ? "primary" : "default"}
                                            disabled={!hasMorning}
                                            style={{
                                                border: '2px solid #00bfff',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                color: selectedShift === 'morning' ? '#fff' : '#00bfff',
                                                background: selectedShift === 'morning' ? '#00bfff' : '#fff',
                                                width: 140,
                                                height: 48,
                                                opacity: hasMorning ? 1 : 0.5,
                                                cursor: hasMorning ? 'pointer' : 'not-allowed',
                                            }}
                                            onClick={() => hasMorning && setSelectedShift('morning')}
                                        >
                                            Buổi sáng
                                        </Button>
                                        <Button
                                            type={selectedShift === 'afternoon' ? "primary" : "default"}
                                            disabled={!hasAfternoon}
                                            style={{
                                                border: '2px solid #00bfff',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                color: selectedShift === 'afternoon' ? '#fff' : '#00bfff',
                                                background: selectedShift === 'afternoon' ? '#00bfff' : '#fff',
                                                width: 140,
                                                height: 48,
                                                opacity: hasAfternoon ? 1 : 0.5,
                                                cursor: hasAfternoon ? 'pointer' : 'not-allowed',
                                            }}
                                            onClick={() => hasAfternoon && setSelectedShift('afternoon')}
                                        >
                                            Buổi chiều
                                        </Button>
                                    </div>
                                    <div style={{ color: '#faad14', fontSize: 13, marginTop: 16 }}>
                                        Tất cả thời gian theo múi giờ Việt Nam GMT +7
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button
                                onClick={onBack}
                                style={{
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    marginTop: 30
                                }}
                            >
                                ← Quay lại
                            </Button>

                            <Button
                                type="primary"
                                disabled={!selectedShift}
                                style={{
                                    borderRadius: 6,
                                    backgroundColor: '#00cfff',
                                    borderColor: '#00cfff',
                                    marginTop: 30
                                }}
                                onClick={() => onNext({ date: selectedDate.format('YYYY-MM-DD'), shift: selectedShift })}
                            >
                                Tiếp tục →
                            </Button>
                        </div>
                    </div>
                </div>
            </ConfigProvider>
        </div>
    </>
}

export default AppointmentSchedule;