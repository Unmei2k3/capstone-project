import axios from 'axios';
import { API_DOMAIN } from '../constants/api/api';
import { deleteAuth, getAuth, postAuth, putAuth, } from '../utils/request';



// Get all users with pagination and optional filters
export const getAllUsers = async (parms) => {
  try {
    const response = await getAuth(`/user`);;
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
};

// Get user by ID

export const getUserById = async (id) => {
  try {
    const result = await getAuth(`/user/${id}`);
    console.log(`User with ID ${id} fetched successfully:`, result.result);
    if (!result || !result.result) {
      throw new Error('User data is missing in the response.');
    }

    return result.result;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error.message);
    throw error;
  }
};

// Create new user
export const createUser = async (userData) => {
  console.log('🚀 userService: Creating user with data:', userData);

  try {
    const result = await postAuth('/user/create', userData);
    console.log('✅ User created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating user:', error);

    // ✅ Log chi tiết response để debug
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ Request error:', error.request);
    } else {
      console.error('❌ Setup error:', error.message);
    }

    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  
  try {
   
    const updatePayload = {
      id: userId,
      ...userData
    };
    
    
    
    const result = await putAuth('/user/update', updatePayload);
    
    
    // ✅ Return the response as-is, let component handle it
    return result;
  } catch (error) {
    console.error('❌ Error updating user with ID', userId, ':', error);
    
    // Log chi tiết response để debug
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ Request error:', error.request);
    } else {
      console.error('❌ Setup error:', error.message);
    }
    
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await deleteAuth('/user', id);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return null;
  }
};


export const updateNurseStaff = async (userData) => {
  try {
    console.log('userService: Updating nurse staff with data:', JSON.stringify(userData));
    const result = await putAuth(`/user/update`, userData);
    console.log(`User updated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating user with ID ${userData.id}:`, error.message);
    throw error;
  }
};


export const getAllPatients = async () => {
  try {
    const response = await getAuth(`/user`);;
    return response.result.filter(user => user.role.name === 'Patient');
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
};


export const getPatientByHospitalId = async (id) => {
  try {
    const response = await getAuth(`/user/patient/by-hospital/${id}`);
    return response.result;
  } catch (error) {
    console.error(`Error get user ${id}:`, error);
    return null;
  }
};