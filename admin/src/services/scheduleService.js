import { deleteAuth, get, getAuth, postAuth, putAuth } from "../utils/request";

export const getScheduleByDoctorId = async (doctorId, from, to) => {
  try {
    const result = await getAuth(`/doctors/${doctorId}/schedule?from=${from}&to=${to}`);
    console.log(`Schedule for doctor ${doctorId} from ${from} to ${to}:`, result);

    if (!result) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result.result;
  } catch (error) {
    console.error(`Error fetching schedule for doctor ${doctorId}:`, error.message);
    throw error;
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const result = await postAuth("/schedules", scheduleData);
    console.log("Schedule created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating schedule:", error.message);
    throw error;
  }
};

export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const result = await putAuth(`/schedules/${scheduleId}`, scheduleData);
    console.log("Schedule created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating schedule:", error.message);
    throw error;
  }
};


export const getScheduleByStaffNurseId = async (staffId, from, to, hospitalId) => {
  try {
    const payload = {
      staffId: staffId,
      hospitalId: hospitalId,
      dateFrom: from,  
      dateTo: to
    };
    const result = await postAuth(`/staffschedules`, payload);
    console.log(`Schedule for staff ${staffId} from ${from} to ${to}:`, result);

    if (!result) {
      throw new Error("Invalid response from server. Expected an array.");
    }

    return result.result;
  } catch (error) {
    console.error(`Error fetching schedule for staff ${staffId}:`, error.message);
    throw error;
  }
};

export const createStaffSchedules = async (scheduleData) => {
  try {
    const result = await postAuth("/staffschedules/create", scheduleData);
    console.log("StaffSchedules created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating StaffSchedules:", error.message);
    throw error;
  }
};


export const updateStaffSchedule = async (scheduleData) => {
  try {
    const result = await putAuth("/staffschedules/update", scheduleData);
    console.log("StaffSchedule updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating StaffSchedule:", error.message);
    throw error;
  }
};

export const deleteStaffSchedule = async (staffScheduleId) => {
  try {
    const result = await deleteAuth(`/staffschedules`, staffScheduleId);
    console.log(`StaffSchedule ${staffScheduleId} deleted successfully`, result);
    return result;
  } catch (error) {
    console.error(`Error deleting StaffSchedule ${staffScheduleId}:`, error.message);
    throw error;
  }
};

export const deleteDoctorSchedule = async (id) => {
  try {
    const result = await deleteAuth(`/schedules`, id);
    console.log(`doctor schedule ${id} deleted successfully`, result);
    return result;
  } catch (error) {
    console.error(`Error deleting StaffSchedule ${id}:`, error.message);
    throw error;
  }
};

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