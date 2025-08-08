import { postAuth } from "../utils/request";

export const getHospitalSpecializationSchedule = async ({
  hospitalId,
  doctorIds = [],
  specializationId,
  dateFrom,
  dateTo
}) => {
  try {
    const payload = {
      doctorIds,
      hospitalId,
      specializationId,
      dateFrom,
      dateTo
    };

    const result = await postAuth(`/schedules/${hospitalId}/hospital/specialization`, payload);

    if (!result || typeof result !== 'object') {
      throw new Error("Invalid response from server. Expected an object.");
    }

    return result;
  } catch (error) {
    console.error(`Error fetching schedule for hospital ${hospitalId}:`, error.message);
    throw error;
  }
};