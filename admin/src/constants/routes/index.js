
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
import MyHospital from "../../pages/AdminHospital/HospitalDetail/HospitalDetail";
import PatientAppointmentList from "../../pages/Nurse/PatientAppointmentList";
import AdminTrackPaymentPage from "../../pages/AdminHospital/PaymentTracking/AdminTrackPayment";

export const routes = [
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      { index: true, element: <Login /> }, // đã vẽ
      { path: "login", element: <Login /> }, // đã vẽ
     
    ],
  },
  {
    path: "/unauthorized",
    children: [
      { index: true, element: <ErrorPage /> }, // đã vẽ
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
      { path: "doctor-shift-management", element: <AdminDoctorShiftManagement /> }, // đã vẽ
      { path: "staff-shift-management", element: <StaffShiftManagement /> }, // đã vẽ
      { path: "room-management", element: <ManageRoom /> }, // đã vẽ
      { path: "specialist-management", element: <ManageSpecialist /> },  // đã vẽ
      { path: "departments", element: <DepartmentManagement /> }, 
      { path: "medical-service-management", element: <MedicalServiceManagement /> },  // đã vẽ
      { path: "leave-request-management", element: <LeaveRequestManagement /> }, // đã vẽ
      { path: "hospital-statistic", element: <HospitalStatisticPage /> },
      { path: "payment-list", element: <AdminTrackPaymentPage /> },
      {
        path: "hospital-detail",
        element: <MyHospital />,
      },
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
      { path: "work-schedule", element: <WorkSchedule /> }, // đã vẽ
      { path: "profile", element: <DoctorProfile /> }, // đã vẽ
      { path: "request-leave", element: <DoctorRequestLeave /> }, // đã vẽ
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
      { path: "staff-profile", element: <StaffProfile /> },  // đã vẽ
      { path: "work-schedule", element: <StaffWorkSchedule /> }, // đã vẽ
      { path: "request-leave", element: <DoctorRequestLeave /> }, // đã vẽ
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
      { path: "nurse-profile", element: <NurseProfile /> }, // đã vẽ
      { path: "work-schedule", element: <WorkScheduleNurse /> }, // đã vẽ
      { path: "adjust-appointment-schedule", element: <AdjustBookingSchedule /> }, // đã vẽ
      { path: "payment-confirm/:id", element: <NursePaymentConfirmation /> },
      { path: "payment-list", element: <NurseUnpaidBookingList /> }, // đã vẽ
      { path: "request-leave", element: <DoctorRequestLeave /> },  // đã vẽ
      { path: "patient-appointment-list", element: <PatientAppointmentList/>}
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