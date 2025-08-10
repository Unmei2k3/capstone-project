import { Menu } from "antd";

import {
    BankOutlined,
    MedicineBoxOutlined,
    InboxOutlined,
    HeatMapOutlined,
    AndroidOutlined,
    LineChartOutlined,
    ExperimentOutlined,
    DashboardOutlined,
    ReadOutlined,
    UserSwitchOutlined,
    UsergroupAddOutlined,
    ApartmentOutlined,
    ScheduleOutlined,
    TeamOutlined,
    IdcardOutlined,
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    EditOutlined,
    CheckCircleOutlined,
    UnorderedListOutlined,
    FormOutlined,
} from "@ant-design/icons";



import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { DOCTOR, HOSPITALADMIN, HOSPITALSTAFF, NURSE } from "../../constants/roles/role";

function MenuSider() {
    const user = useSelector((state) => state.user.user);
    const userRole = user?.role?.name;

    console.log("userRole in MenuSider:", userRole);

    const commonItems = [
        {
            key: "home",
            label: <Link to="/">Dashboard</Link>,
            icon: <DashboardOutlined />,
        }
    ];


    const hospitalAdminItems = [
        {
            key: "home",
            label: <Link to="/admin-hospital">Dashboard</Link>,
            icon: <DashboardOutlined />,
        },
        {
            key: "hospital-statistic",
            label: <Link to="/admin-hospital/hospital-statistic">Thống kê</Link>,
            icon: <LineChartOutlined />,
        },
        {
            key: "staffs",
            label: <Link to="/admin-hospital/staff-management">Nhân viên</Link>,
            icon: <TeamOutlined />,
        },
        {
            key: 'hospital-detail',
            icon: <BankOutlined />,
            label: <Link to="/admin-hospital/hospital-detail">Bệnh viện của tôi</Link>,
            
        },
        {
            key: "department-room",
            label: <Link to="/admin-hospital/room-management">Phòng khám</Link>,
            icon: <ApartmentOutlined />,
        },
        {
            key: "specialist-management",
            label: <Link to="/admin-hospital/specialist-management">Chuyên khoa</Link>,
            icon: <ReadOutlined />,
        },
        {
            key: "doctor-shift-management",
            label: <Link to="/admin-hospital/doctor-shift-management">Ca làm bác sĩ</Link>,
            icon: <UserSwitchOutlined />,
        },
        {
            key: "staff-shift-management",
            label: <Link to="/admin-hospital/staff-shift-management">Ca làm nhân viên</Link>,
            icon: <ScheduleOutlined />,
        },
        // {
        //     key: "nurse-shift-management",
        //     label: <Link to="/admin-hospital/nurse-shift-management">Ca làm y tá</Link>,
        //     icon: <ScheduleOutlined />,
        // },
        {
            key: "department-management",
            label: <Link to="/admin-hospital/departments">Department Management</Link>,
            icon: <BankOutlined />
        },

        {
            key: "medical-services",
            label: <Link to="/admin-hospital/medical-service-management">Dịch vụ y tế</Link>,
            icon: <ExperimentOutlined />,
        },
        {
            key: "leave-request",
            label: <Link to="/admin-hospital/leave-request-management">Đơn xin nghỉ phép</Link>,
            icon: <InboxOutlined />,
        },
        {
            key: "payment-list",
            label: <Link to="/admin-hospital/payment-list">Thanh toán</Link>,
            icon: <UnorderedListOutlined />,
        },
    ];

    const doctorItems = [
        {
            key: "home",
            label: <Link to="/doctor">Dashboard</Link>,
            icon: <DashboardOutlined />,
        },
        {
            key: "profile",
            label: <Link to="/doctor/profile">Hồ sơ</Link>,
            icon: <IdcardOutlined />,
        },
        {
            key: "schedule",
            label: <Link to="/doctor/work-schedule">Lịch làm việc</Link>,
            icon: <CalendarOutlined />,
        },
        {
            key: "request-leave",
            label: <Link to="/doctor/request-leave">Xin nghỉ</Link>,
            icon: <FormOutlined />,
        },
    ];

    const nurseItems = [
        {
            key: "home",
            label: <Link to="/nurse">Dashboard</Link>,
            icon: <DashboardOutlined />,
        },
        {
            key: "appointment",
            label: <Link to="/nurse/appointment">Lịch hẹn</Link>,
            icon: <CalendarOutlined />,
        },
        {
            key: "nurse-profile",
            label: <Link to="/nurse/nurse-profile">Hồ sơ cá nhân</Link>,
            icon: <UserOutlined />,
        },
        {
            key: "work-schedule",
            label: <Link to="/nurse/work-schedule">Lịch làm việc</Link>,
            icon: <ClockCircleOutlined />,
        },
        {
            key: "adjust-appointment-schedule",
            label: <Link to="/nurse/adjust-appointment-schedule">Điều chỉnh lịch hẹn</Link>,
            icon: <EditOutlined />,
        },
        {
            key: "payment-list",
            label: <Link to="/nurse/payment-list">Xử lý thanh toán</Link>,
            icon: <UnorderedListOutlined />,
        },
        {
            key: "request-leave",
            label: <Link to="/nurse/request-leave">Xin nghỉ</Link>,
            icon: <FormOutlined />,
        },
    ];

    const staffItems = [
        {
            key: "home",
            label: <Link to="/staff">Dashboard</Link>,
            icon: <DashboardOutlined />,
        },
        {
            key: "staff-profile",
            label: <Link to="/staff/staff-profile">Hồ sơ cá nhân</Link>,
            icon: <UserOutlined />,
        },
        {
            key: "work-schedule",
            label: <Link to="/staff/work-schedule">Lịch làm việc</Link>,
            icon: <ClockCircleOutlined />,
        },
        {
            key: "request-leave",
            label: <Link to="/staff/request-leave">Xin nghỉ</Link>,
            icon: <FormOutlined />,
        },
    ];
    const getMenuItems = (role) => {
        switch (role) {
            case HOSPITALADMIN:
                return hospitalAdminItems;
            case DOCTOR:
                return doctorItems;
            case HOSPITALSTAFF:
                return staffItems;
            case NURSE:
                return nurseItems;
            default:
                return commonItems;
        }
    };

    const items = getMenuItems(userRole);

    return (
        <Menu
            mode="vertical"
            items={items}
        />
    );
}

export default MenuSider;
