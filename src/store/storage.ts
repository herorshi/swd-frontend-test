import type { EmployeeEntry, NationalityLabel } from "@/types/employee";

export const ENTRIES_STORAGE_KEY = "swd-employee-entries-v1";

const NATIONALITY_BY_EN: Record<string, NationalityLabel> = {
  Thai: { en: "Thai", th: "ไทย" },
  American: { en: "American", th: "อเมริกัน" },
  British: { en: "British", th: "อังกฤษ" },
  Japanese: { en: "Japanese", th: "ญี่ปุ่น" },
};

function normalizeNationality(value: unknown): NationalityLabel {
  if (value && typeof value === "object") {
    const obj = value as Partial<NationalityLabel>;
    if (typeof obj.en === "string" && typeof obj.th === "string") {
      return { en: obj.en, th: obj.th };
    }
  }
  if (typeof value === "string" && NATIONALITY_BY_EN[value]) {
    return NATIONALITY_BY_EN[value];
  }
  return { en: "Thai", th: "ไทย" };
}

function normalizeEntry(value: unknown): EmployeeEntry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<EmployeeEntry> & { nationality?: unknown };
  if (
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.firstName !== "string" ||
    typeof item.lastName !== "string" ||
    typeof item.birthday !== "string" ||
    typeof item.citizenId !== "string" ||
    typeof item.gender !== "string" ||
    typeof item.phoneCountryCode !== "string" ||
    typeof item.mobilePhone !== "string" ||
    typeof item.passportNo !== "string" ||
    typeof item.expectedSalary !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    firstName: item.firstName,
    lastName: item.lastName,
    birthday: item.birthday,
    nationality: normalizeNationality(item.nationality),
    citizenId: item.citizenId,
    gender: item.gender as EmployeeEntry["gender"],
    phoneCountryCode: item.phoneCountryCode,
    mobilePhone: item.mobilePhone,
    passportNo: item.passportNo,
    expectedSalary: item.expectedSalary,
  };
}

export function loadEntriesFromStorage(): EmployeeEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizeEntry).filter((item): item is EmployeeEntry => item !== null);
  } catch {
    return null;
  }
}

export function saveEntriesToStorage(items: EmployeeEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}
