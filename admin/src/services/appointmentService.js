import axios from 'axios';
import { getAuth, postAuth, putAuth, putAuthNum } from '../utils/request';

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
        appointmentNumber: "APT-2024-001",
        patientName: "John Smith",
        patientAge: 45,
        patientGender: "Male",
        patientPhone: "+1-555-0123",
        patientEmail: "john.smith@email.com",
        doctorName: "Dr. Sarah Johnson",
        doctorSpecialty: "Cardiology",
        department: "Cardiology",
        appointmentDate: "2024-07-15",
        appointmentTime: "09:00",
        duration: 30,
        status: "scheduled",
        priority: "high",
        type: "consultation",
        symptoms: "Chest pain, shortness of breath",
        notes: "Follow-up appointment for cardiac evaluation",
        roomNumber: "C-101",
        nurseAssigned: "Nurse Emily Rodriguez",
        preparationRequired: ["ECG", "Blood pressure check"],
        medicationsToReview: ["Aspirin 81mg", "Lisinopril 10mg"],
        allergies: ["Penicillin"],
        lastVisit: "2024-06-15",
        insuranceProvider: "Blue Cross Blue Shield",
        emergencyContact: {
            name: "Jane Smith",
            relationship: "Wife",
            phone: "+1-555-0124"
        },
        createdAt: "2024-07-10T08:00:00Z",
        updatedAt: "2024-07-13T14:30:00Z"
    },
    {
        id: 2,
        appointmentNumber: "APT-2024-002",
        patientName: "Maria Garcia",
        patientAge: 32,
        patientGender: "Female",
        patientPhone: "+1-555-0456",
        patientEmail: "maria.garcia@email.com",
        doctorName: "Dr. Michael Chen",
        doctorSpecialty: "Neurology",
        department: "Neurology",
        appointmentDate: "2024-07-15",
        appointmentTime: "10:30",
        duration: 45,
        status: "in-progress",
        priority: "medium",
        type: "follow-up",
        symptoms: "Headaches, dizziness",
        notes: "MRI results review and treatment plan discussion",
        roomNumber: "N-205",
        nurseAssigned: "Nurse Michael Thompson",
        preparationRequired: ["Neurological assessment", "Vital signs"],
        medicationsToReview: ["Sumatriptan 50mg", "Topiramate 25mg"],
        allergies: ["Latex", "Shellfish"],
        lastVisit: "2024-06-20",
        insuranceProvider: "Aetna",
        emergencyContact: {
            name: "Carlos Garcia",
            relationship: "Husband",
            phone: "+1-555-0457"
        },
        createdAt: "2024-07-08T10:15:00Z",
        updatedAt: "2024-07-15T10:30:00Z"
    },
    {
        id: 3,
        appointmentNumber: "APT-2024-003",
        patientName: "Robert Wilson",
        patientAge: 28,
        patientGender: "Male",
        patientPhone: "+1-555-0789",
        patientEmail: "robert.wilson@email.com",
        doctorName: "Dr. Emily Rodriguez",
        doctorSpecialty: "Emergency Medicine",
        department: "Emergency",
        appointmentDate: "2024-07-15",
        appointmentTime: "14:00",
        duration: 20,
        status: "completed",
        priority: "low",
        type: "urgent",
        symptoms: "Minor cut on hand, needs stitches",
        notes: "Work-related injury, requires tetanus shot",
        roomNumber: "ER-3",
        nurseAssigned: "Nurse Sarah Kim",
        preparationRequired: ["Wound cleaning", "Tetanus shot preparation"],
        medicationsToReview: [],
        allergies: ["None known"],
        lastVisit: "2022-03-10",
        insuranceProvider: "Kaiser Permanente",
        emergencyContact: {
            name: "Lisa Wilson",
            relationship: "Sister",
            phone: "+1-555-0790"
        },
        createdAt: "2024-07-15T13:45:00Z",
        updatedAt: "2024-07-15T14:25:00Z"
    },
    {
        id: 4,
        appointmentNumber: "APT-2024-004",
        patientName: "Linda Brown",
        patientAge: 67,
        patientGender: "Female",
        patientPhone: "+1-555-0321",
        patientEmail: "linda.brown@email.com",
        doctorName: "Dr. James Park",
        doctorSpecialty: "Geriatrics",
        department: "Internal Medicine",
        appointmentDate: "2024-07-16",
        appointmentTime: "11:00",
        duration: 60,
        status: "scheduled",
        priority: "medium",
        type: "routine-checkup",
        symptoms: "Annual physical examination",
        notes: "Comprehensive geriatric assessment, medication review",
        roomNumber: "IM-304",
        nurseAssigned: "Nurse David Lee",
        preparationRequired: ["Blood work", "Vital signs", "Weight/Height"],
        medicationsToReview: ["Metformin 500mg", "Atorvastatin 20mg", "Amlodipine 5mg"],
        allergies: ["Codeine"],
        lastVisit: "2023-07-16",
        insuranceProvider: "Medicare",
        emergencyContact: {
            name: "Tom Brown",
            relationship: "Son",
            phone: "+1-555-0322"
        },
        createdAt: "2024-06-16T09:00:00Z",
        updatedAt: "2024-07-10T16:20:00Z"
    },
    {
        id: 5,
        appointmentNumber: "APT-2024-005",
        patientName: "Ahmed Hassan",
        patientAge: 35,
        patientGender: "Male",
        patientPhone: "+1-555-0654",
        patientEmail: "ahmed.hassan@email.com",
        doctorName: "Dr. Lisa Wang",
        doctorSpecialty: "Dermatology",
        department: "Dermatology",
        appointmentDate: "2024-07-16",
        appointmentTime: "15:30",
        duration: 30,
        status: "scheduled",
        priority: "low",
        type: "consultation",
        symptoms: "Skin rash, itching",
        notes: "Possible allergic reaction, need allergy testing",
        roomNumber: "D-102",
        nurseAssigned: "Nurse Jennifer Martinez",
        preparationRequired: ["Skin photography", "Allergy patch preparation"],
        medicationsToReview: ["Antihistamine"],
        allergies: ["Unknown - under investigation"],
        lastVisit: "New patient",
        insuranceProvider: "United Healthcare",
        emergencyContact: {
            name: "Fatima Hassan",
            relationship: "Wife",
            phone: "+1-555-0655"
        },
        createdAt: "2024-07-12T14:00:00Z",
        updatedAt: "2024-07-14T11:15:00Z"
    },
    {
        id: 6,
        appointmentNumber: "APT-2024-006",
        patientName: "Sophie Turner",
        patientAge: 29,
        patientGender: "Female",
        patientPhone: "+1-555-0987",
        patientEmail: "sophie.turner@email.com",
        doctorName: "Dr. Rachel Green",
        doctorSpecialty: "Obstetrics & Gynecology",
        department: "Women's Health",
        appointmentDate: "2024-07-17",
        appointmentTime: "08:30",
        duration: 45,
        status: "scheduled",
        priority: "high",
        type: "prenatal",
        symptoms: "20-week pregnancy checkup",
        notes: "Anatomy scan scheduled, genetic counseling if needed",
        roomNumber: "OB-201",
        nurseAssigned: "Nurse Amanda Wilson",
        preparationRequired: ["Ultrasound preparation", "Weight check", "Urine test"],
        medicationsToReview: ["Prenatal vitamins", "Iron supplement"],
        allergies: ["Iodine"],
        lastVisit: "2024-06-17",
        insuranceProvider: "Cigna",
        emergencyContact: {
            name: "Mark Turner",
            relationship: "Husband",
            phone: "+1-555-0988"
        },
        createdAt: "2024-06-17T10:30:00Z",
        updatedAt: "2024-07-15T09:45:00Z"
    }
];

// Get appointments with filters
export const getAppointments = async (params = {}) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 500));

            let filteredAppointments = [...sampleAppointments];

            // Filter by search text
            if (params.search) {
                const searchLower = params.search.toLowerCase();
                filteredAppointments = filteredAppointments.filter(appointment =>
                    appointment.patientName.toLowerCase().includes(searchLower) ||
                    appointment.doctorName.toLowerCase().includes(searchLower) ||
                    appointment.appointmentNumber.toLowerCase().includes(searchLower) ||
                    appointment.department.toLowerCase().includes(searchLower)
                );
            }

            // Filter by status
            if (params.status && params.status !== 'all') {
                filteredAppointments = filteredAppointments.filter(appointment =>
                    appointment.status === params.status
                );
            }

            // Filter by date
            if (params.date) {
                filteredAppointments = filteredAppointments.filter(appointment =>
                    appointment.appointmentDate === params.date
                );
            }

            // Filter by department
            if (params.department && params.department !== 'all') {
                filteredAppointments = filteredAppointments.filter(appointment =>
                    appointment.department === params.department
                );
            }

            // Filter by priority
            if (params.priority && params.priority !== 'all') {
                filteredAppointments = filteredAppointments.filter(appointment =>
                    appointment.priority === params.priority
                );
            }

            return {
                items: filteredAppointments,
                total: filteredAppointments.length
            };
        }

        const response = await api.get('/appointments', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 300));
            return sampleAppointments.find(appointment => appointment.id === parseInt(id));
        }

        const response = await api.get(`/appointments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment:', error);
        throw error;
    }
};

// Update appointment status
export const updateAppointmentStatus = async (id, status, notes = '') => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                id,
                status,
                notes,
                updatedAt: new Date().toISOString()
            };
        }

        const response = await api.put(`/appointments/${id}/status`, { status, notes });
        return response.data;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
};

// Get appointment statistics
export const getAppointmentStatistics = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 300));

            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = sampleAppointments.filter(app => app.appointmentDate === today);

            return {
                totalAppointments: sampleAppointments.length,
                todayAppointments: todayAppointments.length,
                scheduledAppointments: sampleAppointments.filter(app => app.status === 'scheduled').length,
                inProgressAppointments: sampleAppointments.filter(app => app.status === 'in-progress').length,
                completedAppointments: sampleAppointments.filter(app => app.status === 'completed').length,
                cancelledAppointments: sampleAppointments.filter(app => app.status === 'cancelled').length,
                highPriorityAppointments: sampleAppointments.filter(app => app.priority === 'high').length
            };
        }

        const response = await api.get('/appointments/statistics');
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment statistics:', error);
        throw error;
    }
};

export const getDepartments = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 200));

            const departments = [...new Set(sampleAppointments.map(app => app.department))];
            return departments.map(dept => ({ name: dept, value: dept }));
        }

        const response = await api.get('/departments');
        return response.data;
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

export const getAppointmentsByUserId = async (userId, from, to) => {
  try {
    const query = new URLSearchParams({ from, to }).toString();
    const url = `/user/${userId}/appointments?${query}`;
    const result = await getAuth(url);  
    return result.result;
  } catch (error) {
    console.error(`Error fetching appointments for user ${userId}:`, error.message);
    throw error;
  }
};

export const changeAppointmentTime = async (appointmentId, scheduleId) => {
  try {
    const result = await putAuth(`/appointments/${appointmentId}/change-time/${scheduleId}`);
    return result;
  } catch (error) {
    console.error(
      `Error changing appointment time for appointmentId=${appointmentId}, scheduleId=${scheduleId}:`,
      error.message
    );
    throw error;
  }
};

export const changeAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const body = JSON.stringify(String(newStatus)); 
    
       const result = await putAuthNum(
      `/appointments/${appointmentId}/change-status`,
      body,
      { 'Content-Type': 'application/json' }
    );

    return result;
  } catch (error) {
    console.error(
      `Error changing appointment status for appointmentId=${appointmentId} to status=${newStatus}:`,
      error.message
    );
    throw error;
  }
};
