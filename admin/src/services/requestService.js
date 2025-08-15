import { getAuth, postAuth, putAuth } from "../utils/request";

export const getRequestsByHospital = async (hospitalId, userId) => {
  if (!hospitalId) {
    throw new Error("Hospital ID is required to fetch requests.");
  }

  try {
    let url = `/requests/hospital/${hospitalId}`;

    if (userId !== undefined && userId !== null) {
      url += `?userId=${encodeURIComponent(userId)}`;
    }

    const response = await getAuth(url);

    return response.result; 
  } catch (error) {
    console.error("Lỗi khi lấy yêu cầu theo hospital:", error);
    throw error;
  }
};

export const createRequest = async (requestData) => {
  try {
    const response = await postAuth('/requests/create', requestData);
    console.log("Tạo yêu cầu thành công:", response);
    return response; 
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu:", error);
    throw error;
  }
};

export const updateRequest = async (requestData) => {
  try {
    const response = await putAuth('/requests/update', requestData);
    console.log("Cập nhật yêu cầu thành công:", response);
    return response; 
  } catch (error) {
    console.error("Lỗi khi cập nhật yêu cầu:", error);
    throw error;
  }
};

export const cancelRequestStatus = async ({ requestId, status }) => {

  try {
    const payload = {
      requestId,
      status,
    };
    console.log("cancel request is : " + JSON.stringify(payload));
    const response = await putAuth('/requests/change-status', payload);

    console.log("Đổi trạng thái yêu cầu thành công:", response);
    return response;
  } catch (error) {
    console.error("Lỗi khi đổi trạng thái yêu cầu:", error);
    throw error;
  }
};