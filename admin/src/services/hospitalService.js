import axios from 'axios';
import { deleteAuth, get, getAuth, postAuth, putAuth } from '../utils/request';

// Token cho authorization
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWRlbnRpZmllciI6IjEiLCJlbWFpbCI6ImFkbWluQGhvc3RuYW1lLmNvbSIsImZ1bGxOYW1lIjoiU3VwZXIgVXNlciIsIm5hbWUiOiJTdXBlciIsInN1cm5hbWUiOiJVc2VyIiwiaXBBZGRyZXNzIjoiMC4wLjAuMSIsImF2YXRhclVybCI6IiIsIm1vYmlsZXBob25lIjoiIiwiZXhwIjoxNzgxMjcwNDgzLCJpc3MiOiJodHRwczovL0JFLlNFUDQ5MC5uZXQiLCJhdWQiOiJCRS5TRVA0OTAifQ.kQIX9uvjN9UOPiBitp9JsO2DlPlFyIU4VTP1ZyM4k3Y";

// Cấu hình axios
const api = axios.create({
    baseURL: 'https://localhost:8175/api/v1',
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Sample data for development
const sampleHospitals = [
    {
        id: 1,
        name: "City General Hospital",
        code: "CGH001",
        type: "General",
        status: "active",
        address: "123 Main Street, Downtown",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        phoneNumber: "+1-555-0123",
        email: "info@citygeneral.com",
        website: "https://citygeneral.com",
        establishedDate: "1985-03-15",
        licenseNumber: "LIC-2024-001",
        totalBeds: 450,
        totalDepartments: 12,
        totalStaff: 850,
        rating: 4.8,
        accreditation: "Joint Commission",
        adminName: "Dr. Sarah Johnson",
        adminEmail: "admin@citygeneral.com",
        logoUrl: "",
        description: "A leading healthcare facility providing comprehensive medical services to the community.",
        services: ["Emergency Care", "Surgery", "Cardiology", "Pediatrics", "Oncology"],
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-06-10T14:30:00Z"
    },
    {
        id: 2,
        name: "Metropolitan Medical Center",
        code: "MMC002",
        type: "Specialized",
        status: "active",
        address: "456 Healthcare Blvd, Medical District",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
        phoneNumber: "+1-555-0456",
        email: "contact@metromedical.com",
        website: "https://metromedical.com",
        establishedDate: "1992-08-22",
        licenseNumber: "LIC-2024-002",
        totalBeds: 680,
        totalDepartments: 18,
        totalStaff: 1200,
        rating: 4.9,
        accreditation: "AAAHC",
        adminName: "Dr. Michael Chen",
        adminEmail: "admin@metromedical.com",
        logoUrl: "",
        description: "Advanced medical center specializing in cutting-edge treatments and research.",
        services: ["Neurology", "Cardiothoracic Surgery", "Transplant Services", "Cancer Treatment"],
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-06-08T16:45:00Z"
    },
    {
        id: 3,
        name: "Community Health Hospital",
        code: "CHH003",
        type: "Community",
        status: "inactive",
        address: "789 Community Ave, Suburbia",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
        phoneNumber: "+1-555-0789",
        email: "info@communityhealth.com",
        website: "https://communityhealth.com",
        establishedDate: "1978-11-05",
        licenseNumber: "LIC-2024-003",
        totalBeds: 200,
        totalDepartments: 8,
        totalStaff: 350,
        rating: 4.2,
        accreditation: "Joint Commission",
        adminName: "Dr. Emily Rodriguez",
        adminEmail: "admin@communityhealth.com",
        logoUrl: "",
        description: "Community-focused hospital providing accessible healthcare services to local residents.",
        services: ["Family Medicine", "Emergency Care", "Maternity", "Orthopedics"],
        createdAt: "2024-03-10T09:15:00Z",
        updatedAt: "2024-05-20T11:20:00Z"
    }
];

// Get all hospitals
export const getAllHospitals = async (params) => {
    try {
        const result = await getAuth(`/hospitals`);
        console.log(`Fetched services for hospitals :`, result);
        return result.result;
    } catch (error) {
        console.error(`Error fetching services for hospitals:`, error.message);
        throw error;
    }
};

// Get hospital by ID
export const getHospitalById = async (id) => {
    try {
        const result = await getAuth(`/hospitals/${id}`);
        console.log(`Fetched hospital with ID ${id}:`, result);
        return result.result;
    } catch (error) {
        console.error(`Error fetching hospital with ID ${id}:`, error.message);
        throw error;
    }
};

// Create hospital
export const createHospital = async (hospitalData) => {
    try {
        const result = await postAuth('/hospitals/create', hospitalData);
        console.log(`hospital created successfully:`, result);
        return result;
    } catch (error) {
        console.error(`Error creating hospital with ID ${hospitalData.id}:`, error.message);
        throw error;
    }
};

// Update hospital
export const updateHospital = async (hospitalData) => {
    try {
        const result = await putAuth(`/hospitals/update`, hospitalData);
        console.log(`Hospital updated successfully:`, result);
        return result;
    } catch (error) {
        console.error(`Error updating hospital with ID ${hospitalData.id}:`, error.message);
        throw error;
    }
};

// Delete hospital
export const deleteHospital = async (hospitalId) => {
    try {
        const result = await deleteAuth(`/hospitals`, hospitalId);
        console.log(`Hospital with ID ${hospitalId} deleted successfully:`, result);
        return result.result;
    } catch (error) {
        console.error(`Error deleting hospital with ID ${hospitalId}:`, error.message);
        throw error;
    }
};



export const getSpecializationsByHospitalId = async (hospitalId) => {
  try {
    const result = await get(`/hospitals/${hospitalId}/specialization`);
    console.log(`🩺 Fetched specializations for hospital ${hospitalId}:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching specializations for hospital ${hospitalId}:`, error);
    throw error;
  }
};

export const getDoctorsBySpecialization = async (hospitalId) => {
  try {
    const result = await getAuth(`/hospitals/${hospitalId}/doctors/grouped-by-specialization`);
    console.log(`👨‍⚕️ Fetched doctors by specialization for hospital ${hospitalId}:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching doctors by specialization for hospital ${hospitalId}:`, error);
    throw error;
  }
};