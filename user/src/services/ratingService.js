import axios from 'axios';

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWRlbnRpZmllciI6IjEiLCJlbWFpbCI6ImFkbWluQGhvc3RuYW1lLmNvbSIsImZ1bGxOYW1lIjoiU3VwZXIgVXNlciIsIm5hbWUiOiJTdXBlciIsInN1cm5hbWUiOiJVc2VyIiwiaXBBZGRyZXNzIjoiMC4wLjAuMSIsImF2YXRhclVybCI6IiIsIm1vYmlsZXBob25lIjoiIiwiZXhwIjoxNzgxMjcwNDgzLCJpc3MiOiJodHRwczovL0JFLlNFUDQ5MC5uZXQiLCJhdWQiOiJCRS5TRVA0OTAifQ.kQIX9uvjN9UOPiBitp9JsO2DlPlFyIU4VTP1ZyM4k3Y";

const api = axios.create({
  baseURL: 'https://localhost:8175/api/v1',
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Submit hospital rating
export const submitHospitalRating = async (ratingData) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now(),
        ...ratingData,
        submittedAt: new Date().toISOString()
      };
    }
    
    const response = await api.post('/ratings/hospital', ratingData);
    return response.data;
  } catch (error) {
    console.error('Error submitting hospital rating:', error);
    throw error;
  }
};

// Submit doctor rating
export const submitDoctorRating = async (ratingData) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now(),
        ...ratingData,
        submittedAt: new Date().toISOString()
      };
    }
    
    const response = await api.post('/ratings/doctor', ratingData);
    return response.data;
  } catch (error) {
    console.error('Error submitting doctor rating:', error);
    throw error;
  }
};

// Get patient ratings
export const getPatientRatings = async (patientId) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          type: "hospital",
          hospitalId: 1,
          hospitalName: "City General Hospital",
          rating: 5,
          comment: "Excellent service and very professional staff!",
          submittedAt: "2024-06-25T10:00:00Z"
        },
        {
          id: 2,
          type: "doctor",
          doctorId: 3,
          doctorName: "Dr. Emily Rodriguez",
          hospitalName: "City General Hospital",
          rating: 4,
          comment: "Good doctor, very knowledgeable.",
          submittedAt: "2024-06-25T10:05:00Z"
        }
      ];
    }
    
    const response = await api.get(`/patients/${patientId}/ratings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient ratings:', error);
    throw error;
  }
};

// Get hospital ratings
export const getHospitalRatings = async (hospitalId) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          patientName: "John D.",
          rating: 5,
          comment: "Excellent service and very professional staff!",
          submittedAt: "2024-06-25T10:00:00Z"
        },
        {
          id: 2,
          patientName: "Mary S.",
          rating: 4,
          comment: "Good facilities, but waiting time was a bit long.",
          submittedAt: "2024-06-20T14:30:00Z"
        }
      ];
    }
    
    const response = await api.get(`/hospitals/${hospitalId}/ratings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hospital ratings:', error);
    throw error;
  }
};

// Get doctor ratings
export const getDoctorRatings = async (doctorId) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          patientName: "Alice M.",
          rating: 5,
          comment: "Very knowledgeable and caring doctor!",
          submittedAt: "2024-06-22T09:15:00Z"
        },
        {
          id: 2,
          patientName: "Bob K.",
          rating: 4,
          comment: "Professional and thorough examination.",
          submittedAt: "2024-06-18T11:45:00Z"
        }
      ];
    }
    
    const response = await api.get(`/doctors/${doctorId}/ratings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor ratings:', error);
    throw error;
  }
};