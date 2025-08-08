import { get } from "../utils/request";

export const getDoctorByHospitalId = async (id) => {
  try {
    const result = await get(`/doctors/by-hospital/${id}`);
    if (!result || !result.result) {
      throw new Error('User data is missing in the response.');
    }
    return result.result;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error.message);
    throw error;
  }
};

export const getDoctorDetail = async (id) => {
  try {
    const result = await get(`/doctors/${id}`);
    if (!result || !result.result) {
      throw new Error('doctors data is missing in the response.');
    }
    return result.result;
  } catch (error) {
    console.error(`Error fetching doctors with ID ${id}:`, error.message);
    throw error;
  }
};