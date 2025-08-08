import { getAuth, postAuth } from "../utils/request";

export const getStepByServiceId = async (serviceId) => {
  try {
    const result = await getAuth(`/services/${serviceId}/servicesteps`);
    console.log(`Steps for service ${serviceId}:`, result);

    if (!result || !Array.isArray(result)) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching steps for service ${serviceId}:`, error.message);
    throw error;
  }
};


export const createBookAppointment = async (payload) => {
  try {
    const result = await postAuth('/appointments/book', payload);
    if (!result) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching Appointment  ${payload}:`, error.message);
    throw error;
  }
};


