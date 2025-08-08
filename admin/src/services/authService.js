import { post } from "../utils/request";

export const fetchToken = async (email, password) => {
    const path = "/tokens";
    const options = {
        email,
        password,
    };

    try {
        const data = await post(path, options);
        return data; 
    } catch (error) {
        if (error.response) {
            console.error("Backend responded with an error:", error.response.data);
        } else {
            console.error("Failed to fetch token:", error.message);
        }
        throw error;
    }
};

export const register = async (options) => {
    const result = await post('users', options);
    return result;
}
export const refreshToken = async (token, refreshToken) => {
    const path = "/tokens/refresh";
    const options = { token, refreshToken };
    try {
        const data = await post(path, options);
        console.log("Token data in refreshToken:", data);
        return data;
    } catch (error) {
        if (error.response) {
            console.error("Backend responded with an error:", error.response.data);
        } else {
            console.error("Failed to refresh token:", error.message);
        }
        throw error;
    }
};
