import { deleteAuth, get, postAuth, putAuth } from "../utils/request";

export const getSpecializationList = async () => {
  try {
    const result = await get('/specializations');

    if (!result || !result.result) {
      throw new Error('Specialization data is missing in the response.');
    }

    return result.result;
  } catch (error) {
    console.error(`Error fetching specialization`, error.message);
    throw error;
  }
};

export const updateSpecialization = async (specializationData) => {
  try {
    const result = await putAuth(`/specializations/update`, specializationData);
    console.log(`User updated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating user with ID ${specializationData.id}:`, error.message);
    throw error;
  }
};

export const createSpecialization = async (specializationData) => {
  try {
    const result = await postAuth(`/specializations/create`, specializationData);
    console.log(`User created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error creating user with ID ${specializationData.id}:`, error.message);
    throw error;
  }
};

export const deleteSpecialization = async (specializationId) => {
  try {
    const result = await deleteAuth(`/specializations`, specializationId);
    console.log(`User created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error delete user with ID ${specializationId}:`, error.message);
    throw error;
  }
};

export const getSpecializationsByHospitalId = async (hospitalId) => {
  try {
    const result = await get(`/specializations?hospitalId=${hospitalId}`);
    console.log(`Fetched specializations for hospital ${hospitalId}:`, result);
    return result.result;
  } catch (error) {
    console.error(`Failed to fetch specializations for hospital ${hospitalId}:`, error);
    throw error;
  }
};

export const addSpecializationToHospital = async (hospitalId, specializationIds) => {
  try {
    const result = await postAuth(`/hospitals/${hospitalId}/specialization`, specializationIds);
    console.log(`Added specializationIds ${specializationIds} to hospitalId ${hospitalId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error adding specializationIds ${specializationIds} to hospitalId ${hospitalId}:`, error.message);
    throw error;
  }
};


export const deleteSpecializationFromHospital = async (hospitalId, specializationId) => {
  try {
    const result = await deleteAuth(`/hospitals/${hospitalId}/specialization`, specializationId);
    console.log(`Deleted specializationId ${specializationId} from hospitalId ${hospitalId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error deleting specializationId ${specializationId} from hospitalId ${hospitalId}:`, error.message);
    throw error;
  }
};