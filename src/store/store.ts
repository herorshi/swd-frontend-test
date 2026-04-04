import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./slices/formSlice";
import entriesReducer from "./slices/entriesSlice";

export const store = configureStore({
  reducer: {
    form: formReducer,
    entries: entriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
