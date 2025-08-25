import { getAuth } from "../utils/request";

export const getStatisticHospitalId = async (fromDate, toDate) => {
  try {
    let url = `/dashboards/collective`;
    if (fromDate && toDate) {
      const query = new URLSearchParams({ fromDate, toDate }).toString();
      url = `${url}?${query}`;
    }
    const result = await getAuth(url);
    console.log("result is : ", result);
    return result;
  } catch (error) {
    console.error(`Error fetching statistic:`, error.message);
    throw error;
  }
};

export const getHospitalParameter = async () => {
  try {
 
    const result = await getAuth("/dashboards/hospital-parameter");
    console.log("result is : ", result);
    return result;
  } catch (error) {
    console.error(`Error fetching statistic:`, error.message);
    throw error;
  }
};


export const getSystemAdminDashboard = async (hospitalId) => {
  try {
    const result = await getAuth(`/dashboards/system-dashboard/${hospitalId}`);
    console.log("result is : ", result);
    return result;
  } catch (error) {
    console.error(`Error fetching statistic:`, error.message);
    throw error;
  }
};