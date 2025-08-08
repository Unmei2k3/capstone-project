// src/api/axiosInstance.js
import axios from 'axios';
import { API_DOMAIN, PATH } from './api';
import { isTokenExpired } from '../../utils/jwtUtils';


const api = axios.create({
  baseURL: `${API_DOMAIN}${PATH}`,
});

let refreshTokenCallback = null;
let logoutCallback = null;

export const setAuthHandlers = ({ getAccessToken, refreshToken, logout }) => {
  refreshTokenCallback = refreshToken;
  logoutCallback = logout;

  api.interceptors.request.use(async (config) => {
    let token = getAccessToken();
    console.log("token in api intercetors : " + token);
    if (token && isTokenExpired(token)) {
      console.log("Token expired, refreshing...");
      try {
        token = await refreshTokenCallback();
      } catch (e) {
        logoutCallback();
        throw new axios.Cancel('Session expired');
      }
    }

    if (token) {
      console.log("Setting Authorization header with token: " + token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export default api;
