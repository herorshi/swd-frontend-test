import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeEntry } from "@/types/employee";

export type EntriesState = {
  items: EmployeeEntry[];
};

const initialState: EntriesState = {
  items: [],
};

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    addEntry: (state, action: PayloadAction<EmployeeEntry>) => {
      state.items.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<EmployeeEntry>) => {
      const i = state.items.findIndex((x) => x.id === action.payload.id);
      if (i >= 0) state.items[i] = action.payload;
    },
    deleteEntriesByIds: (state, action: PayloadAction<string[]>) => {
      const set = new Set(action.payload);
      state.items = state.items.filter((x) => !set.has(x.id));
    },
    hydrateEntries: (state, action: PayloadAction<EmployeeEntry[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addEntry, updateEntry, deleteEntriesByIds, hydrateEntries } =
  entriesSlice.actions;

export default entriesSlice.reducer;
