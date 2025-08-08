import axios from "axios";
import { API_DISTRICTS, API_PROVINCES, API_WARDS } from "../constant/api/api";

export const getProvinces = async () => {
    try {
        const response = await axios.get(API_PROVINCES);
        if (!response.data) {
            throw new Error("No province data found.");
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching provinces:", error.message);
        throw error;
    }
};

export const getDistricts = async (provinceCode) => {
    const response = await axios.get(API_DISTRICTS(provinceCode));
    return response.data.districts;
};

export const getWards = async (districtCode) => {
    const response = await axios.get(API_WARDS(districtCode));
    return response.data.wards;
};