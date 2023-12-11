import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_NAME } from "../common/constants";
import axios from "axios";

const apiUrlUsers = "http://localhost:3001/users";

export const fetchUsers = createAsyncThunk("users/fetchUsers", () =>
  axios.get(apiUrlUsers).then((response) => response.data)
);

export const addUser = createAsyncThunk("users/addUser", (newUser) =>
  axios.post(apiUrlUsers, newUser).then((response) => response.data)
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedUser) => {
    const response = await axios.put(
      `${apiUrlUsers}/${updatedUser.id}`,
      updatedUser
    );
    return response.data;
  }
);

export const initialState = {
  users: [],
  user: {},
  token: null,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logIn: (state, action) => {
      let encodedToken = btoa(JSON.stringify(action.payload));
      state.token = encodedToken;
      localStorage.setItem(LOCAL_STORAGE_NAME.TOKEN, encodedToken);
    },
    logOut: (state) => {
      state.token = null;
      state.user = {};
      localStorage.removeItem(LOCAL_STORAGE_NAME.TOKEN);
    },
    getToken: (state) => {
      state.token = localStorage.getItem(LOCAL_STORAGE_NAME.TOKEN);
    },
    getUserId: (state) => {
      const storedToken = localStorage.getItem(LOCAL_STORAGE_NAME.TOKEN);
      if (storedToken) {
        const decodedToken = atob(storedToken);
        const userInfo = JSON.parse(decodedToken);
        const foundUser = state.users.find((user) => user.id === userInfo.id);

        state.user = foundUser || {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users = [action.payload, ...state.users];
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      });
  },
});

export const UserActions = UserSlice.actions;
export default UserSlice.reducer;
