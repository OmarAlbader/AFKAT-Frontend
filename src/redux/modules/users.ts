import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../config/axios.config";
import { IForm, IUser } from "../../interfaces";
import { setAuthToken } from "../../utils";
import { showAlert } from "./Alerts";
import { startLoading, stopLoading } from "./loading";

export const registerUser = createAsyncThunk(
  "users/register",
  async (userData: IForm, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/register"));

      const res = await api.post("/auth/register/", userData);

      dispatch(showAlert({ msg: "Registration successful", type: "success" }));

      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const loginUser = createAsyncThunk(
  "users/login",
  async (userData: IForm, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/login"));

      const res = await api.post("/auth/login", userData);

      dispatch(showAlert({ msg: "Login successful", type: "success" }));

      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const loadMyUser = createAsyncThunk(
  "users/loadMyUser",
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(startLoading("users/me"));

    try {
      const res = await api.get(`/auth/user`);

      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      console.log("ERROR:", error.response);
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const loadUserById = createAsyncThunk(
  "users/loadUserById",
  async (id: string, { dispatch, rejectWithValue }) => {
    dispatch(startLoading("users/view"));

    try {
      const res = await api.get(`/auth/users/${id}`);

      // console.log(res);

      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      console.log("ERROR:", error.response);
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async (userData: FormData | null, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/update"));

      const res = await api.patch("/auth/user", userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(showAlert({ msg: "Changes Saved!", type: "success" }));

      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const followUser = createAsyncThunk(
  "users/followUser",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/followUser"));

      const res = await api.post(`/auth/follow/${id}/`);

      // dispatch(showAlert({ msg: res.data.detail, type: "success" }));

      // console.log(res.status);

      return res.status;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "users/unfollowUser",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/unfollowUser"));

      const res = await api.delete(`/auth/unfollow/${id}/`);

      // dispatch(showAlert({ msg: res.data.detail, type: "success" }));

      // console.log(res.status);

      return res.status;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

export const changePassword = createAsyncThunk(
  "users/changePassword",
  async (userData: FormData | null, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading("users/changePassword"));

      const res = await api.post("/auth/password/change", userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(showAlert({ msg: res.data.detail, type: "success" }));

      console.log(res);

      // return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      dispatch(showAlert({ msg: error.response?.data, type: "error" }));
      return rejectWithValue(error.response?.data); //TODO: errors should be in Error redux module
    } finally {
      dispatch(stopLoading());
    }
  },
);

const resetAuthState = (state: typeof initialState) => {
  setAuthToken();
  state.user = null;
  state.isAuth = false;
  state.token = {
    access: null,
    refresh: null,
  };
};

const initialState = {
  token: {
    access: null as string | null,
    refresh: null as string | null,
  },
  author: null as IUser | null,
  user: null as IUser | null,
  isAuth: false,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    logout: resetAuthState,
  },
  extraReducers: (builder) => {
    builder.addCase(loadUserById.fulfilled, (state, action) => {
      state.author = action.payload;
    });

    builder.addCase(loadUserById.rejected, (state) => {
      state.author = null;
    });

    builder.addCase(followUser.fulfilled, (state, action) => {
      if (action.payload === 201 && state.author) {
        state.author.is_following = true;
        state.author.followers_count++;
      }
    });

    builder.addCase(unfollowUser.fulfilled, (state, action) => {
      if (action.payload === 200 && state.author) {
        state.author.is_following = false;
        state.author.followers_count--;
      }
    });

    builder.addMatcher(
      isAnyOf(loadMyUser.fulfilled, updateUserProfile.fulfilled),
      (state, action) => {
        state.isAuth = true;
        state.user = action.payload;
      },
    );

    builder.addMatcher(
      isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
      (state, action) => {
        const token = {
          access: action.payload.access,
          refresh: action.payload.refresh,
        };
        setAuthToken(token);
        state.token = token;
        state.user = action.payload.user;
        state.isAuth = true;
      },
    );

    builder.addMatcher(
      isAnyOf(
        loginUser.rejected,
        registerUser.rejected,
        loadMyUser.rejected,
        updateUserProfile.rejected,
      ),
      (state) => {
        resetAuthState(state);
      },
    );
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
