import Cookies from 'js-cookie';

// export const storeTokens = (accessToken, refreshToken, refreshTokenExpiryTime) => {
//     if (accessToken) {
//         Cookies.set("accessToken", accessToken, { expires: 1 }); 
//     }
//     if (refreshToken && refreshTokenExpiryTime) {
//         const refreshTokenExpiryDate = new Date(refreshTokenExpiryTime);
//         Cookies.set("refreshToken", refreshToken, { expires: refreshTokenExpiryDate }); 
//     }
// };

// export function deleteCookie(name) {
//   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
// }

export const storeTokens = ( refreshToken, refreshTokenExpiryTime) => {
  
    if (refreshToken && refreshTokenExpiryTime) {
        const refreshTokenExpiryDate = new Date(refreshTokenExpiryTime);
        Cookies.set("refreshToken", refreshToken, { expires: refreshTokenExpiryDate }); 
    }
};

export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};
