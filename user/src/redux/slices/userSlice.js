import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deleteCookie, storeTokens, getCookie } from '../../utils/cookieSettings';
import { fetchToken, refreshToken as refreshTokenService } from '../../services/authService';
import { decodeToken } from '../../utils/jwtUtils';
import { getUserById } from '../../services/userService';
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const refreshTokenValue = getCookie('refreshToken');
            const accessToken = localStorage.getItem('accessToken');

            console.log("refreshTokenValue is " + refreshToken + " accessToken is " + accessToken);
            if (!refreshTokenValue || !accessToken) {
                dispatch(logout());
                throw new Error('No refresh token found');
            }

            const tokenData = await refreshTokenService(accessToken, refreshTokenValue);
            const decoded = decodeToken(tokenData.token);
          
            //dispatch(updateAccessToken(tokenData.token));
            localStorage.setItem('accessToken', tokenData.token);
            if (!decoded) throw new Error('Token decoding failed');

            storeTokens(tokenData.refreshToken, tokenData.refreshTokenExpiryTime);
            const user = await getUserById(decoded.nameidentifier);

            return { accessToken: tokenData.token, user };
        } catch (error) {
            console.error('Refresh token failed:', error);
            if (error.response?.status === 401) dispatch(logout());
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue, dispatch }) => {
        try {
            const tokenData = await fetchToken(email, password);
            console.log('Token data received:', tokenData);
            if (
                tokenData?.token &&
                tokenData?.refreshToken &&
                tokenData?.refreshTokenExpiryTime
            ) {
                const decoded = decodeToken(tokenData.token);
                console.log('Decoded token:', decoded);
                if (decoded) {
                    storeTokens(tokenData.refreshToken, tokenData.refreshTokenExpiryTime);
                    console.log("access token in login : " + tokenData.token);
                    localStorage.setItem('accessToken', tokenData.token);
                    dispatch(updateAccessToken(tokenData.token));
                    const user = await getUserById(decoded.nameidentifier);
                    console.log("user in login sucess : " + user);
                    console.log('User fetched:', user);

                    return { accessToken: tokenData.token, user };
                }
                throw new Error('Token decoding failed');
            }
            throw new Error('Invalid token data');
        } catch (error) {
            console.error('Error fetching user:', error);
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        accessToken: localStorage.getItem('accessToken') || null,
        isLoading: false,
        isInitializing: true,
        error: null,
    },
    reducers: {
        updateAccessToken: (state, action) => {
            console.log("after")
            state.accessToken = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isInitializing = false;
            localStorage.clear();
            deleteCookie('refreshToken');
        },

        updateUserSlice: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            // localStorage.setItem('user', JSON.stringify(state.user));
        },
        setUser(state, action) {
            state.user = action.payload;
            state.isInitializing = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;

            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                // localStorage.setItem('accessToken', state.accessToken);
                console.log('User after login success:', action.payload.accessToken);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
                console.error('Login failed:', action.error.message);
            })

            .addCase(refreshToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                console.log('User after token refresh:', action.payload.user);


            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Token refresh failed';
            });
    },
});

export const { logout, updateAccessToken, updateUserSlice, setUser } = authSlice.actions;
export default authSlice.reducer;