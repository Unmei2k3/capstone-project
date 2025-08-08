import { get } from "../utils/request";

export const getHospitalList = async () => {
    try {
        const result = await get('/hospitals');
        console.log(`Hospital fetched successfully:`, result.result);
        if (!result || !result.result) {
            throw new Error('Hospital data is missing in the response.');
        }

        return result.result;
    } catch (error) {
        console.error(`Error fetching hospital`, error.message);
        throw error;
    }
};


export const getHospitalDetail = async (id) => {
  try {
    const result = await get(`/hospitals/${id}`);
    if (!result || !result.result) {
      throw new Error('Hospital Data is missing in the response.');
    }
    return result.result;
  } catch (error) {
    console.error(`Error fetching hospital with ID ${id}:`, error.message);
    throw error;
  }
};