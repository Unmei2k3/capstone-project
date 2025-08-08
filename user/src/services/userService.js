import { getAuth, post, postAuth, putAuth } from "../utils/request";

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

export const updateUser = async (userData) => {
  try {
    const result = await putAuth(`/user/update`, userData);
    console.log(`User updated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating user with ID ${userData.id}:`, error.message);
    throw error;
  }
};


export const registerUser = async (userData) => {
  try {
    const result = await post(`/account/sign-up`, userData);
    console.log('Registration result:', result);
    if (result.email) {
      return 'Đăng ký thành công!';
    } else {
      const data = result.data || result;
      if (data.title === 'USERNAME_ALREADY_EXISTS') {
        return 'Email đã tồn tại. Vui lòng dùng email khác!';
      } else {
        return data.message || 'Đăng ký thất bại!';
      }
    }
  } catch (error) {
    return 'Có lỗi xảy ra, vui lòng thử lại!';
  }
};

export const changePassword = async (payload) => {
  try {
    const result = await postAuth('/user/change-password', payload);
    if (result) {
      return "Đổi mật khẩu thành công!" ;
    } else {
      return 'Mật khẩu cũ không đúng!';
    }
  } catch (error) {
     return 'Mật khẩu cũ không đúng!';
  }
};

export const forgotPassword = async (userData) => {
  try {
    const result = await post(`/account/forgot-password`, userData);
    console.log('Forgotpassword data : ', result);
    if (result.email) {
      return 'Vui lòng kiểm tra email để đặt lại mật khẩu!';
    } else {
      const data = result.data || result;
      if (data.title === 'USERNAME_ALREADY_EXISTS') {
        return 'Email chưa đựợc đăng ký. Vui lòng đăng ký tài khoản!';
      } else {
        return data.message || 'Email chưa đựợc đăng ký. Vui lòng đăng ký tài khoản!';
      }
    }
  } catch (error) {
    return 'Có lỗi xảy ra, vui lòng thử lại!';
  }
};

