
import BlankLayout from "../../components/BlankLayout";
import LayoutCommon from "../../components/LayoutCommon";
import DepartmentManagement from "../../pages/AdminHospital/DepartmentManagement/DepartmentManagement";
import ErrorPage from "../../pages/Error";
import HospitalDetail from "../../pages/AdminHospital/HospitalManagement/HospitalDetail";
import Login from "../../pages/Login";
import UserManagement from "../../pages/AdminHospital/UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import WorkSchedule from "../../pages/Doctor/WorkSchedule";
import DoctorProfile from "../../pages/Doctor/DoctorProfile";
import DoctorHome from "../../pages/Doctor/DoctorHome";
import HospitalStaffHome from "../../pages/HospitalStaff/StaffHome";
import NurseHome from "../../pages/Nurse/NurseHome";
import AdminHospitalHome from "../../pages/AdminHospital/AdminHospitalHome";
import AdminSystem from "../../pages/AdminSystem/DashBoard";
import AdminSystemHeader from "../../components/LayoutCommon/admin-system-header";
import DoctorRequestLeave from "../../pages/Doctor/DoctorRequestLeave";
import AdminDoctorShiftManagement from "../../pages/AdminHospital/DoctorShiftManagement";
import StaffShiftManagement from "../../pages/AdminHospital/StaffShiftManagement";
import ManageRoom from "../../pages/AdminHospital/RoomManagement";
import ManageSpecialist from "../../pages/AdminHospital/SpecialistManagement";
import ManageSpecialistAdminSystem from "../../pages/AdminSystem/SpecialistManagement";
import HospitalManagement from "../../pages/AdminHospital/HospitalManagement/HospitalManagement";
import AppointmentOverview from "../../pages/Nurse/NurseHome/AppointmentOverview/AppointmentOverview";
import ReviewFeedback from "../../pages/HospitalStaff/ReviewFeedback/ReviewFeedback";
import MedicalServiceManagement from "../../pages/AdminHospital/MedicalServiceManagement";
import LeaveRequestManagement from "../../pages/AdminHospital/LeaveRequestManagement";
import HospitalStatisticPage from "../../pages/AdminHospital/HospitalStatisticPage";
import NurseProfile from "../../pages/Nurse/NurseProfile";
import WorkScheduleNurse from "../../pages/Nurse/WorkSchedule";
import StaffProfile from "../../pages/HospitalStaff/StaffProfile";
import AdjustBookingSchedule from "../../pages/Nurse/AdjustAppointmentSchedule";
import NursePaymentConfirmation from "../../pages/Nurse/PaymentAdjust/ConfirmPayment";
import NurseUnpaidBookingList from "../../pages/Nurse/PaymentAdjust/UnpaidBookingList";
import StaffWorkSchedule from "../../pages/HospitalStaff/WorkSchedule";
import StaffManagementPage from "../../pages/AdminHospital/DoctorManagement/StaffManagement";
import PaymentSuccess from "../../pages/Payment/PaymentSuccess";
import PaymentCancelled from "../../pages/Payment/PaymentCancelled";
import { DOCTOR, HOSPITALADMIN, HOSPITALSTAFF, NURSE, SYSTEMADMIN } from "../roles/role";

export const routes = [
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "/payment/success", element: <PaymentSuccess /> },
      { path: "/payment/cancelled", element: <PaymentCancelled /> },
      { path: "/payment/cancel", element: <PaymentCancelled /> },
    ],
  },
  {
    path: "/unauthorized",
    children: [
      { index: true, element: <ErrorPage /> },
    ],
  },
  {
    path: "/admin-hospital",
    element: (
      <ProtectedRoute allowedRoles={[HOSPITALADMIN]}>
        <LayoutCommon />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminHospitalHome /> },
      { path: "users", element: <UserManagement /> },
      { path: "staff-management", element: <StaffManagementPage /> },
      { path: "doctor-shift-management", element: <AdminDoctorShiftManagement /> },
      { path: "staff-shift-management", element: <StaffShiftManagement /> },
      { path: "room-management", element: <ManageRoom /> },
      { path: "specialist-management", element: <ManageSpecialist /> },
      { path: "departments", element: <DepartmentManagement /> },
      { path: "medical-service-management", element: <MedicalServiceManagement /> },
      { path: "leave-request-management", element: <LeaveRequestManagement /> },
      { path: "hospital-statistic", element: <HospitalStatisticPage /> },
      { path: "payment-list", element: <NurseUnpaidBookingList /> },
    ],
  },
  {
    path: "/doctor",
    element: (
      <ProtectedRoute allowedRoles={[DOCTOR]}>
        <LayoutCommon />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DoctorHome /> },
      { path: "work-schedule", element: <WorkSchedule /> },
      { path: "profile", element: <DoctorProfile /> },
      { path: "request-leave", element: <DoctorRequestLeave /> },
    ],
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRoles={[HOSPITALSTAFF]}>
        <LayoutCommon />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HospitalStaffHome /> },
      { path: "review-feedback", element: <ReviewFeedback /> },
      { path: "staff-profile", element: <StaffProfile /> },
      { path: "work-schedule", element: <StaffWorkSchedule /> },
      { path: "request-leave", element: <DoctorRequestLeave /> },
    ],
  },
  {
    path: "/nurse",
    element: (
      <ProtectedRoute allowedRoles={[NURSE]}>
        <LayoutCommon />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <NurseHome /> },
      { path: "appointment", element: <AppointmentOverview /> },
      { path: "nurse-profile", element: <NurseProfile /> },
      { path: "work-schedule", element: <WorkScheduleNurse /> },
      { path: "adjust-appointment-schedule", element: <AdjustBookingSchedule /> },
      { path: "payment-confirm/:id", element: <NursePaymentConfirmation /> },
      { path: "payment-list", element: <NurseUnpaidBookingList /> },
      { path: "request-leave", element: <DoctorRequestLeave /> },
    ],
  },
  {
    path: "/admin-system",
    element: (
      <ProtectedRoute allowedRoles={[SYSTEMADMIN]}>
        <AdminSystemHeader />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminSystem /> },
      { path: "hospitals", element: <HospitalManagement /> },
      { path: "hospital-detail/:id", element: <HospitalDetail /> },
      { path: "users", element: <UserManagement /> },
      { path: "specialist-management", element: <ManageSpecialistAdminSystem /> },
    ],
  },
];