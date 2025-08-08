import { deleteAuth, get, getAuth, postAuth, putAuth } from "../utils/request";

export const getSteps = async () => {
    try {
        const result = await getAuth('/steps');

        if (!result || !result.result) {
            throw new Error('Step data is missing in the response.');
        }

        return result.result;
    } catch (error) {
        console.error(`Error fetching Step`, error.message);
        throw error;
    }
};

export const getServices = async () => {
    try {
        const result = await get('/services');
        console.log("API raw result:", result);

        return result;
    } catch (error) {
        console.error(`Error fetching Service`, error.message);
        throw error;
    }
};

export const updateService = async (serviceData) => {
  try {
    const result = await putAuth(`/services/update`, serviceData);
    console.log(`User updated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating user with ID ${serviceData.id}:`, error.message);
    throw error;
  }
};

export const createService= async (service) => {
  try {
    const result = await postAuth(`/services/create`, service);
    console.log(`service created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error creating service with ID ${service.id}:`, error.message);
    throw error;
  }
};


export const getHospitalServices = async (hospitalId) => {
  try {
    const result = await getAuth(`/hospitals/${hospitalId}/services`);
    console.log(`Fetched services for hospital ${hospitalId}:`, result);
    return result.result;
  } catch (error) {
    console.error(`Error fetching services for hospital ID ${hospitalId}:`, error.message);
    throw error;
  }
};

export const getStepByServiceId = async (serviceId ) => {
  try {
    const result = await getAuth(`/services/${serviceId}/servicesteps`);
    console.log(`Fetched services step for hospital ${serviceId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error fetching services for hospital ID ${serviceId}:`, error.message);
    throw error;
  }
};

export const updateServiceSteps = async (serviceId, steps) => {
  const payload = steps.map((step, index) => ({
    id: step.id,
    stepOrder: index + 1, 
    isRequired: step.isRequired ?? false,
    status: step.status,
    stepId: step.steps.id,
  }));

  try {
    const result = await putAuth(`/services/${serviceId}/servicesteps`, payload);
    return result;
  } catch (error) {
    console.error(`Error updating service steps for ID ${serviceId}:`, error.message);
    throw error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const result = await deleteAuth(`/services`, serviceId);
    console.log(`service created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error delete service with ID ${serviceId}:`, error.message);
    throw error;
  }
};
