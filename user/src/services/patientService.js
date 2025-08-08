import axios from 'axios';

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWRlbnRpZmllciI6IjEiLCJlbWFpbCI6ImFkbWluQGhvc3RuYW1lLmNvbSIsImZ1bGxOYW1lIjoiU3VwZXIgVXNlciIsIm5hbWUiOiJTdXBlciIsInN1cm5hbWUiOiJVc2VyIiwiaXBBZGRyZXNzIjoiMC4wLjAuMSIsImF2YXRhclVybCI6IiIsIm1vYmlsZXBob25lIjoiIiwiZXhwIjoxNzgxMjcwNDgzLCJpc3MiOiJodHRwczovL0JFLlNFUDQ5MC5uZXQiLCJhdWQiOiJCRS5TRVA0OTAifQ.kQIX9uvjN9UOPiBitp9JsO2DlPlFyIU4VTP1ZyM4k3Y";

const api = axios.create({
  baseURL: 'https://localhost:8175/api/v1',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Sample appointments data
const sampleAppointments = [
  {
    id: 1,
    patientId: 1,
    hospitalId: 1,
    hospitalName: "City General Hospital",
    doctorId: 1,
    doctorName: "Dr. Sarah Johnson",
    department: "Cardiology",
    appointmentDate: "2024-07-15T10:00:00Z",
    status: "completed",
    amount: 150.00,
    paymentStatus: "paid",
    canRate: true,
    hasRated: false,
    service: "Consultation"
  },
  {
    id: 2,
    patientId: 1,
    hospitalId: 2,
    hospitalName: "Metropolitan Medical Center",
    doctorId: 2,
    doctorName: "Dr. Michael Chen",
    department: "Neurology",
    appointmentDate: "2024-07-20T14:30:00Z",
    status: "pending",
    amount: 200.00,
    paymentStatus: "pending",
    canRate: false,
    hasRated: false,
    service: "MRI Scan"
  },
  {
    id: 3,
    patientId: 1,
    hospitalId: 1,
    hospitalName: "City General Hospital",
    doctorId: 3,
    doctorName: "Dr. Emily Rodriguez",
    department: "Emergency",
    appointmentDate: "2024-06-25T09:15:00Z",
    status: "completed",
    amount: 300.00,
    paymentStatus: "paid",
    canRate: true,
    hasRated: true,
    service: "Emergency Treatment"
  }
];

// Get patient appointments
export const getPatientAppointments = async (patientId) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return sampleAppointments.filter(app => app.patientId === patientId);
    }
    
    const response = await api.get(`/patient/${patientId}/appointments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Get available hospitals for patient
export const getHospitalsForPatient = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: 1,
          name: "City General Hospital",
          address: "123 Main Street, Downtown",
          rating: 4.8,
          totalRatings: 256,
          departments: ["Cardiology", "Emergency", "Surgery"],
          image: "/images/hospital1.jpg"
        },
        {
          id: 2,
          name: "Metropolitan Medical Center",
          address: "456 Healthcare Blvd, Medical District",
          rating: 4.9,
          totalRatings: 189,
          departments: ["Neurology", "Oncology", "Pediatrics"],
          image: "/images/hospital2.jpg"
        }
      ];
    }
    
    const response = await api.get('/hospitals/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};

// Get doctors by hospital
export const getDoctorsByHospital = async (hospitalId) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          department: "Cardiology",
          rating: 4.9,
          totalRatings: 45,
          experience: "15 years",
          image: "/images/doctor1.jpg"
        },
        {
          id: 2,
          name: "Dr. Michael Chen",
          department: "Neurology",
          rating: 4.8,
          totalRatings: 38,
          experience: "12 years",
          image: "/images/doctor2.jpg"
        }
      ];
    }
    
    const response = await api.get(`/hospitals/${hospitalId}/doctors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};