import { jwtDecode } from 'jwt-decode';
import { updateAccessToken } from '../redux/slices/userSlice';
export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};


export const setCookieWithExpiryFromToken = (name, token, dispatch) => {
    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token in setCookieWithExpiryFromToken:', decoded);
        const exp = decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        const expiryTimeInSeconds = exp - currentTime;

        console.log('Decoded token:', decoded);
        console.log('Current Time (seconds):', currentTime);
        console.log('Token Expiry Time (seconds):', exp);
        console.log('Time until expiry (seconds):', expiryTimeInSeconds);

        if (expiryTimeInSeconds > 0) {
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + expiryTimeInSeconds * 1000);
            document.cookie = `${name}=${token}; expires=${expiryDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
            if (dispatch) {
                dispatch(updateAccessToken(token)); 
            }
        } else {
            console.error('JWT has already expired, cannot set cookie.');
        }
    } catch (error) {
        console.error('Error decoding token or setting cookie:', error);
        throw new Error('Invalid token');
    }
};


export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Invalid token in isTokenExpired:', error);
        return true;
    }
};