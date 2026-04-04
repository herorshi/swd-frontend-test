import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EmployeeEntry, Gender } from "@/types/employee";
import { citizenDigitsFromParts, digitsOnly, splitCitizenDigits } from "@/types/employee";

export type FormState = {
  title: string;
  firstName: string;
  lastName: string;
  birthday: string;
  nationality: string;
  citizenParts: [string, string, string, string, string];
  gender: Gender;
  phoneCountryCode: string;
  mobilePhone: string;
  passportNo: string;
  expectedSalary: string;
  editingId: string | null;
};

export const initialFormState: FormState = {
  title: "Mr.",
  firstName: "",
  lastName: "",
  birthday: "",
  nationality: "Thai",
  citizenParts: ["", "", "", "", ""],
  gender: "male",
  phoneCountryCode: "+66",
  mobilePhone: "",
  passportNo: "",
  expectedSalary: "",
  editingId: null,
};

const formatSalaryInput = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formSlice = createSlice({
  name: "form",
  initialState: initialFormState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload;
    },
    setBirthday: (state, action: PayloadAction<string>) => {
      state.birthday = action.payload;
    },
    setNationality: (state, action: PayloadAction<string>) => {
      state.nationality = action.payload;
    },
    setCitizenPart: (
      state,
      action: PayloadAction<{ index: 0 | 1 | 2 | 3 | 4; value: string }>
    ) => {
      state.citizenParts[action.payload.index] = action.payload.value;
    },
    setGender: (state, action: PayloadAction<Gender>) => {
      state.gender = action.payload;
    },
    setPhoneCountryCode: (state, action: PayloadAction<string>) => {
      state.phoneCountryCode = action.payload;
    },
    setMobilePhone: (state, action: PayloadAction<string>) => {
      state.mobilePhone = action.payload;
    },
    setPassportNo: (state, action: PayloadAction<string>) => {
      state.passportNo = action.payload;
    },
    setExpectedSalary: (state, action: PayloadAction<string>) => {
      state.expectedSalary = action.payload;
    },
    setEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },
    resetForm: () => ({
      ...initialFormState,
      citizenParts: ["", "", "", "", ""] as FormState["citizenParts"],
    }),
    loadEntryIntoForm: (state, action: PayloadAction<EmployeeEntry>) => {
      const e = action.payload;
      state.title = e.title;
      state.firstName = e.firstName;
      state.lastName = e.lastName;
      state.birthday = e.birthday;
      state.nationality = e.nationality.en;
      state.citizenParts = splitCitizenDigits(e.citizenId);
      state.gender = e.gender;
      state.phoneCountryCode = e.phoneCountryCode;
      state.mobilePhone = e.mobilePhone;
      state.passportNo = e.passportNo;
      state.expectedSalary = formatSalaryInput(e.expectedSalary);
      state.editingId = e.id;
    },
  },
});

export const buildCitizenIdFromForm = (parts: FormState["citizenParts"]): string =>
  citizenDigitsFromParts(parts);

export const {
  setTitle,
  setFirstName,
  setLastName,
  setBirthday,
  setNationality,
  setCitizenPart,
  setGender,
  setPhoneCountryCode,
  setMobilePhone,
  setPassportNo,
  setExpectedSalary,
  setEditingId,
  resetForm,
  loadEntryIntoForm,
} = formSlice.actions;

export default formSlice.reducer;
