export const API_DOMAIN = "https://localhost:8175";
export const PATH = "/api/v1";

export const API_PROVINCES = "https://vietnamlabs.com/api/vietnamprovince";
export const API_DISTRICTS = (provinceCode) => `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`;
export const API_WARDS = (districtCode) => `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`;