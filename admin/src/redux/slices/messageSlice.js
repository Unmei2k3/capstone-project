import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'message',
  initialState: null, 
  reducers: {
    setMessage: (state, action) => action.payload, 
    clearMessage: () => null, 
  },
});

export const { setMessage, clearMessage } = messageSlice.actions;
export default messageSlice.reducer;