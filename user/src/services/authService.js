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


export const verifyEmail = async (payload) => {
  try {
    const result = await post('/account/verify-email', payload);

    if (!result || Object.keys(result).length === 0) {
      return "Xác thực thành công!";
    }

    if (result.success === false)
      return "Xác thực thất bại!";

  } catch (error) {
    return "Có lỗi xảy ra, vui lòng thử lại!";
  }
};


export const verifyEmailResetPassword = async (payload) => {
  try {
    const result = await post('/account/validate-reset-password-code', payload);
    return result;

  } catch (error) {
    console.error("Error in verifyEmailResetPassword:", error);
    return;
  }
};

export const resetPassword = async (payload) => {
  try {
    const result = await post('/account/reset-password', payload);
    if (result) {
      return "Đặt lại mật khẩu thành công!" ;
    } else {
      return 'Xác thực thất bại hoặc mật khẩu không hợp lệ!';
    }
  } catch (error) {
     return 'Xác thực thất bại hoặc mật khẩu không hợp lệ!';
  }
};
