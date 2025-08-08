import { deleteAuth, getAuth, postAuth, putAuth } from "../utils/request";

export const getHospitalRooms = async (hospitalId) => {
  try {
    const result = await getAuth(`/rooms?hospitalId=${hospitalId}`);
    console.log(`Fetched rooms for hospital ${hospitalId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error fetching rooms for hospital ID ${hospitalId}:`, error.message);
    throw error;
  }
};

export const createHospitalRoom = async (room) => {
  try {
    const result = await postAuth('/rooms', room);
    console.log('Room created successfully:', result);
    return result;
  } catch (error) {
    console.error(`Error creating room:`, error.message);
    throw error;
  }
};

export const updateHospitalRoom = async (id, room) => {
  try {
    const result = await putAuth(`/rooms/${id}`, room);
    console.log('Room updated successfully:', result);
    return result;
  } catch (error) {
    console.error(`Error updating room with ID ${id}:`, error.message);
    throw error;
  }
};

export const deleteHospitalRoom = async (id) => {
  try {
        console.log('Room deleted successfully:', id);
    const result = await deleteAuth(`/rooms`,id);

    return result;
  } catch (error) {
    console.error(`Error deleting room with ID ${id}:`, error.message);
    throw error;
  }
};