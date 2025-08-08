import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../../pages/UserAccount/Login";
import Home from "../../pages/Home";
import Register from "../../pages/UserAccount/Register";
import ErrorPage from "../../pages/Error";
import UserAccount from "../../pages/UserAccount/Detail";
import ChangePassword from "../../pages/UserAccount/ChangePassword";
import UpadteProfile from "../../pages/UserProfile/Update";
import HospitalList from "../../pages/Hospital/HospitalList";
import HospitalDetail from "../../pages/Hospital/HospitalDetail";
import PatientRecords from "../../pages/HealthRecords"; // Thêm import cho component mới


import BlankLayout from "../../components/BlankLayout";
import LayoutCommon from "../../components/LayoutCommon";
import NewPassword from "../../pages/UserAccount/ForgetPassword/NewPassword";
import ForgetPassword from "../../pages/UserAccount/ForgetPassword";
import DoctorDetail from "../../pages/Doctor/DoctorDetail/index.jsx";
import VerifyEmailRegisterAuto from "../../pages/UserAccount/Register/VerifyEmailRegisterAuto";
import VerifyEmailRegisterNotice from "../../pages/UserAccount/Register/VerifyEmailRegisterNotice";
import VerifyEmailForgetAuto from "../../pages/UserAccount/ForgetPassword/VerifyEmailForgetAuto";
import VerifyEmailForgetNotice from "../../pages/UserAccount/ForgetPassword/VerifyEmailForgetNotice";
import AppointmentSchedule from "../../pages/Appointment/Schedule";
import AppointmentService from "../../pages/Appointment/Service";
import AppointmentSpecialty from "../../pages/Appointment/Specialty";
import ChatPage from "../../components/ChatBox/ChatPage";

import BookingHistoryPage from "../../pages/BookingHistory/BookingHistoryPage";
import PatientPortal from "../../pages/PatientPortal/PatientPortal";
import PaymentPage from "../../pages/PatientPortal/PaymentPage";
import RatingPage from "../../pages/PatientPortal/RatingPage";
import DoctorList from "../../pages/Doctor/DoctorList/index.jsx";
import AppointmentDoctor from "../../pages/Appointment/Doctor/index.jsx";
import UserBookingFlow from "../../pages/Appointment/Flow/index.jsx";
import AppointmentReviewPage from "../../pages/Appointment/Accept/index.jsx";
import PaymentCancelled from "../../pages/Payment/PaymentCancelled.jsx";
import PaymentSuccess from "../../pages/Payment/PaymentSuccess.jsx";



export const routes = [
  //public
  {
    path: "/",
    element: <LayoutCommon />,
    children: [
      {
        index: true,
        element: <Home /> // đã vẽ report 3
      },
      {
        path: '/payment/success',
        element: <PaymentSuccess />
      },
      {
        path: '/payment/cancelled',
        element: <PaymentCancelled />
      },
      {
        path: '/payment/cancel',
        element: <PaymentCancelled />
      },
      {
        path: "unauthorized",
        element: <ErrorPage /> // đã vẽ report 3
      },

      {
        path: "profile",
        element: <UpadteProfile /> // đã vẽ report 3
      },
      {
        path: "doctor-detail/:doctorId",
        element: <DoctorDetail /> // đã vẽ report 3
      },
      {
        path: "doctor-list",
        element: <DoctorList />
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "booking-history",
        element: <ProtectedRoute allowedRoles={['Patient']} />,
        children: [
          {
            path: "",
            element: <BookingHistoryPage /> // đã vẽ report 3
          }
        ]
      },
      {
        path: "account",
        element: <ProtectedRoute allowedRoles={['Patient']} />,
        children: [
          {
            path: "",
            element: <UserAccount />,
          },
          {
            path: "change-password",
            element: <ChangePassword /> // đã vẽ report 3
          },
        ],
      },

      {
        path: "/patient",
        element: <BlankLayout />,
        children: [
          {
            index: true,
            element: <PatientPortal />
          },
          {
            path: "payment",
            element: <PaymentPage />
          },
          {
            path: "rating",
            element: <RatingPage />
          },

        ]
      },

      {
        path: "change-password",
        element: <ChangePassword />
      },

      {
        path: "*",
        element: <Navigate to="/" />
      },
      {
        path: "account",
        element: <ProtectedRoute allowedRoles={['Patient']} />,
        children: [
          {
            path: "",
            element: <UserAccount />,
          },
          {
            path: "change-password",
            element: <ChangePassword /> // đã vẽ report 3
          },
        ],
      },

      {
        path: "hospital-detail/:hospitalId",
        element: (
          <HospitalDetail />// đã vẽ report 3
        )
      },
      {
        path: "hospital-list",
        element: <HospitalList />// đã vẽ report 3
      },

      {
        path: "*",
        element: <Navigate to="/" /> // bỏ qua
      },
      {
        path: "health-records",
        element: <PatientRecords /> // đã vẽ report 3
      },
    ]

  },
  {
    path: "/login",
    element: <BlankLayout />,
    children: [
      {
        index: true,
        element: <Login /> // đã vẽ report 3 
      },
      {
        path: "register",
        element: <Register /> // đã vẽ report 3
      },
      {
        path: "new-password",
        element: <NewPassword />
      },
      {
        path: "forget-password",
        element: <ForgetPassword /> // đã vẽ report 3
      },
    ]
  },
  {
    path: "/appointment",
    element: <LayoutCommon />,
    children: [
      {
        index: true,
        element: <AppointmentService /> // đã vẽ report 3
      },
      {
        path: "booking",
        element: <ProtectedRoute allowedRoles={['Patient']} />,
        children: [
          {
            index: true,
            element: <UserBookingFlow />,
          },
        ],
      },
      {
        path: "schedule",
        element: <AppointmentSchedule /> // đã vẽ report 3
      },
      {
        path: "doctor",
        element: <AppointmentDoctor />
      },
      {
        path: "specialty",
        element: <AppointmentSpecialty />
      },
      {
        path: "accept-infomation",
        element: <AppointmentReviewPage />
      }
    ]
  },
  {
    path: "/auth",
    element: <BlankLayout />,
    children: [
      {
        path: "verify-email",
        element: <VerifyEmailRegisterAuto />
      },
      {
        path: "verify-email-notice",
        element: <VerifyEmailRegisterNotice />
      },
      {
        path: "reset-password/verify-code",
        element: <VerifyEmailForgetAuto />
      },
      {
        path: "reset-password/verify-email-notice",
        element: <VerifyEmailForgetNotice />
      },

    ]
  }

];

