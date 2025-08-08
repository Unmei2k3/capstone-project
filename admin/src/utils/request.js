import axios from 'axios';

import { API_DOMAIN, PATH } from '../constants/api/api';
import api from '../constants/api/apiInterceptors';

export const get = async (path) => {
  const response = await axios.get(API_DOMAIN + PATH + path);
  const result = response.data;
  return result;
}

export const getAuth = async (path) => {

  console.log('getAuth called with path:', path);
  console.log('Token from localStorage:', localStorage.getItem('accessToken'));
  const response = await api.get(path);
  return response.data;
};

export const postAuth = async (path, data) => {
  const response = await api.post(path, data);
  return response.data;
};


export const post = async (path, data) => {
  try {
    const url = `${API_DOMAIN}${PATH}${path}`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error in POST request to ${path}:`, error.message);
    throw error;
  }
};

export const putAuth = async (path, data) => {
  try {
    const response = await api.put(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error in PUT request to ${path}:`, error.message);
    throw error;
  }
};

export const putAuthNum = async (path, data, headers = {}) => {
  try {
    console.log('PUT request to:', path);
    console.log('Payload:', data);
    console.log('Headers:', headers);

    const response = await api.put(path, data, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error in PUT request to ${path}:`, error.message);
    throw error;
  }
};

export const deleteAuth = async (path, id) => {
  try {
    const response = await api.delete(`${path}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in DELETE request to ${path}/${id}:`, error.message);
    throw error;
  }
};