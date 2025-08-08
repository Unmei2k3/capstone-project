import { get } from "../utils/request";

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

export const getSpecializationByHospitalId = async (hospitalId) => {
    try {
        if (!hospitalId) throw new Error("hospitalId is required");

        const result = await get(`/hospitals/${hospitalId}/specialization`);

        if (!result || !result.result) {
            throw new Error('Specialization data is missing in the response.');
        }

        return result.result;
    } catch (error) {
        console.error(`Error fetching specialization by hospitalId`, error.message);
        throw error;
    }
};