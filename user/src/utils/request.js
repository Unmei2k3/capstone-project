import axios from 'axios';
import { API_DOMAIN, PATH } from '../constant/api/api';

import api from '../constant/api/apiInterceptors';

export const get = async (path) => {
    const response = await axios.get(API_DOMAIN + PATH + path);
    const result = response.data;
    return result;
}

export const getAuth = async (path) => {
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
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data; 
        }
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
// export const checkExist = async (key, value) => {
//     const result = await get(`users?${key}=${value}`);
//     return result;
// }