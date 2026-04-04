export type Gender = "male" | "female" | "unsex";

export type NationalityLabel = {
  en: string;
  th: string;
};

export type EmployeeEntry = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  birthday: string;
  nationality: NationalityLabel;
  citizenId: string;
  gender: Gender;
  phoneCountryCode: string;
  mobilePhone: string;
  passportNo: string;
  expectedSalary: string;
};

export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function citizenDigitsFromParts(parts: readonly string[]): string {
  return parts.map(digitsOnly).join("");
}

export function splitCitizenDigits(id: string): [string, string, string, string, string] {
  const d = digitsOnly(id).slice(0, 13);
  return [d.slice(0, 1), d.slice(1, 5), d.slice(5, 10), d.slice(10, 12), d.slice(12, 13)];
}
