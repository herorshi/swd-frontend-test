"use client";

import "flag-icons/css/flag-icons.min.css";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Input,
  Pagination,
  Radio,
  Select,
  Table,
  type TableColumnsType,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import enUS from "antd/locale/en_US";
import thTH from "antd/locale/th_TH";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import {
  loadEntryIntoForm,
  resetForm,
  setBirthday,
  setCitizenPart,
  setExpectedSalary,
  setFirstName,
  setGender,
  setLastName,
  setMobilePhone,
  setNationality,
  setPassportNo,
  setPhoneCountryCode,
  setTitle,
} from "@/store/slices/formSlice";
import { addEntry, deleteEntriesByIds, updateEntry } from "@/store/slices/entriesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { EmployeeEntry, Gender, NationalityLabel } from "@/types/employee";
import { citizenDigitsFromParts, digitsOnly } from "@/types/employee";
import styles from "./page.module.css";

const TITLE_OPTIONS = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Miss", label: "Miss" },
  { value: "Ms.", label: "Ms." },
];

/** สัญชาติ + รหัสโทร + ธง — ชุดเดียวกันเสมอ (จำนวนเท่ากัน) */
const NATIONALITY_PHONE = [
  { value: "Thai", labelEn: "Thai", labelTh: "ไทย", dial: "+66", fiCode: "th" as const },
  {
    value: "American",
    labelEn: "American",
    labelTh: "อเมริกัน",
    dial: "+1",
    fiCode: "us" as const,
  },
  { value: "British", labelEn: "British", labelTh: "อังกฤษ", dial: "+44", fiCode: "gb" as const },
  { value: "Japanese", labelEn: "Japanese", labelTh: "ญี่ปุ่น", dial: "+81", fiCode: "jp" as const },
] as const;

const NATIONALITY_LABELS: Record<string, NationalityLabel> = Object.fromEntries(
  NATIONALITY_PHONE.map((item) => [
    item.value,
    { en: item.labelEn, th: item.labelTh },
  ])
) as Record<string, NationalityLabel>;

/** ธง (flag-icons) + รหัสโทร — ใช้กับ optionRender / labelRender */
type PhoneCodeOption = {
  value: string;
  fiCode: string;
  dial: string;
  label: string;
};

const PHONE_CODES: PhoneCodeOption[] = NATIONALITY_PHONE.map((n) => ({
  value: n.dial,
  fiCode: n.fiCode,
  dial: n.dial,
  label: `${n.dial} ${n.labelEn}`,
}));

const CITIZEN_LIMITS = [1, 4, 5, 2, 1] as const;

/** ความกว้างเดียวกัน: Firstname, Lastname, Nationality */
const FORM_WIDE_INPUT_PX = 320;

const formatSalaryInput = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/** จัดตัวเลข + caret กลางช่อง (แก้ padding ดั้งเดิมของ antd) */
const citizenInputStyles = {
  input: {
    textAlign: "center" as const,
    height: 32,
    lineHeight: "32px",
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 2,
    paddingRight: 2,
    boxSizing: "border-box" as const,
  },
};

const DEFAULT_PAGE_SIZE = 5;

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const form = useAppSelector((s) => s.form);
  const items = useAppSelector((s) => s.entries.items);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sortField, setSortField] = useState<
    "name" | "gender" | "phone" | "nationality" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);

  const antdLocale = i18n.language.startsWith("th") ? thTH : enUS;
  const isThai = i18n.language.startsWith("th");

  const nationalityOptions = useMemo(
    () =>
      NATIONALITY_PHONE.map(({ value, labelEn, labelTh }) => ({
        value,
        label: isThai ? labelTh : labelEn,
      })),
    [isThai]
  );

  const getNationalityLabel = useCallback(
    (nationality: NationalityLabel) => (isThai ? nationality.th : nationality.en),
    [isThai]
  );

  const sortedItems = useMemo(() => {
    const list = [...items];
    if (!sortField || !sortOrder) return list;
    const dir = sortOrder === "ascend" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      } else if (sortField === "gender") {
        cmp = a.gender.localeCompare(b.gender);
      } else if (sortField === "phone") {
        cmp = `${a.phoneCountryCode}${a.mobilePhone}`.localeCompare(
          `${b.phoneCountryCode}${b.mobilePhone}`
        );
      } else if (sortField === "nationality") {
        cmp = getNationalityLabel(a.nationality).localeCompare(
          getNationalityLabel(b.nationality)
        );
      }
      return cmp * dir;
    });
    return list;
  }, [getNationalityLabel, items, sortField, sortOrder]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, pageSize, sortedItems.length]);

  const pageIds = useMemo(() => pagedItems.map((r) => r.id), [pagedItems]);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRowKeys.includes(id));
  const somePageSelected = pageIds.some((id) => selectedRowKeys.includes(id));

  const validateAndBuildEntry = useCallback((): EmployeeEntry | null => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const birthday = form.birthday.trim();
    const mobilePhone = digitsOnly(form.mobilePhone.trim());
    const passportNo = digitsOnly(form.passportNo.trim());
    const salaryDigits = digitsOnly(form.expectedSalary.trim());
    const citizenId = citizenDigitsFromParts(form.citizenParts);

    if (!firstName || !lastName || !birthday) {
      void Swal.fire({
        icon: "warning",
        title: t("required"),
        confirmButtonColor: "#333",
      });
      return null;
    }
    if (!mobilePhone) {
      void Swal.fire({
        icon: "warning",
        title: t("required"),
        confirmButtonColor: "#333",
      });
      return null;
    }
    if (mobilePhone.length !== 10) {
      void Swal.fire({
        icon: "warning",
        title: t("mobileInvalid"),
        confirmButtonColor: "#333",
      });
      return null;
    }
    if (salaryDigits === "" || Number.isNaN(Number(salaryDigits))) {
      void Swal.fire({
        icon: "warning",
        title: t("salaryInvalid"),
        confirmButtonColor: "#333",
      });
      return null;
    }

    const base: EmployeeEntry = {
      id: form.editingId ?? newId(),
      title: form.title,
      firstName,
      lastName,
      birthday,
      nationality: NATIONALITY_LABELS[form.nationality] ?? {
        en: form.nationality,
        th: form.nationality,
      },
      citizenId,
      gender: form.gender,
      phoneCountryCode: form.phoneCountryCode,
      mobilePhone,
      passportNo,
      expectedSalary: salaryDigits,
    };
    return base;
  }, [form, t]);

  const handleSubmit = async () => {
    const entry = validateAndBuildEntry();
    if (!entry) return;

    if (form.editingId) {
      dispatch(updateEntry(entry));
      dispatch(resetForm());
      await Swal.fire({
        icon: "success",
        title: t("submitEditSuccess"),
        confirmButtonColor: "#333",
      });
    } else {
      dispatch(addEntry(entry));
      dispatch(resetForm());
      await Swal.fire({
        icon: "success",
        title: t("submitSuccess"),
        confirmButtonColor: "#333",
      });
    }
    setPage(1);
    setSelectedRowKeys([]);
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const handleEdit = useCallback(
    (record: EmployeeEntry) => {
      dispatch(loadEntryIntoForm(record));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch]
  );

  const handleDeleteOne = useCallback(
    async (record: EmployeeEntry) => {
      const res = await Swal.fire({
        icon: "question",
        title: t("deleteOneConfirm"),
        showCancelButton: true,
        confirmButtonText: t("confirm"),
        cancelButtonText: t("cancel"),
        confirmButtonColor: "#333",
        cancelButtonColor: "#888",
      });
      if (!res.isConfirmed) return;
      dispatch(deleteEntriesByIds([record.id]));
      setSelectedRowKeys((keys) => keys.filter((k) => k !== record.id));
      await Swal.fire({
        icon: "success",
        title: t("deleteSuccess"),
        confirmButtonColor: "#333",
      });
    },
    [dispatch, t]
  );

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    const res = await Swal.fire({
      icon: "question",
      title: t("deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      confirmButtonColor: "#333",
      cancelButtonColor: "#888",
    });
    if (!res.isConfirmed) return;
    dispatch(deleteEntriesByIds(selectedRowKeys as string[]));
    setSelectedRowKeys([]);
    await Swal.fire({
      icon: "success",
      title: t("deleteSuccess"),
      confirmButtonColor: "#333",
    });
  };

  const toggleSelectAllPage = (checked: boolean) => {
    if (checked) {
      const merged = new Set([...selectedRowKeys.map(String), ...pageIds]);
      setSelectedRowKeys(Array.from(merged));
    } else {
      setSelectedRowKeys((keys) => keys.filter((k) => !pageIds.includes(String(k))));
    }
  };

  const handleTableChange = (
    _pagination: unknown,
    _filters: unknown,
    sorter: SorterResult<EmployeeEntry> | SorterResult<EmployeeEntry>[]
  ) => {
    if (Array.isArray(sorter)) return;
    const key = String(sorter.columnKey ?? sorter.field ?? "");
    if (!key || !["name", "gender", "phone", "nationality"].includes(key)) return;
    setSortField(key as "name" | "gender" | "phone" | "nationality");
    setSortOrder(sorter.order ?? null);
  };

  const columns: TableColumnsType<EmployeeEntry> = useMemo(
    () => [
      {
        title: t("name"),
        key: "name",
        columnKey: "name",
        sorter: true,
        sortOrder: sortField === "name" ? sortOrder ?? undefined : undefined,
        render: (_, r) => `${r.firstName} ${r.lastName}`,
      },
      {
        title: t("gender"),
        key: "gender",
        columnKey: "gender",
        sorter: true,
        sortOrder: sortField === "gender" ? sortOrder ?? undefined : undefined,
        render: (_, r) =>
          r.gender === "male"
            ? t("male")
            : r.gender === "female"
              ? t("female")
              : t("unsex"),
      },
      {
        title: t("mobilePhone"),
        key: "phone",
        columnKey: "phone",
        sorter: true,
        sortOrder: sortField === "phone" ? sortOrder ?? undefined : undefined,
        render: (_, r) => `${r.phoneCountryCode} ${r.mobilePhone}`,
      },
      {
        title: t("nationality"),
        key: "nationality",
        columnKey: "nationality",
        sorter: true,
        sortOrder:
          sortField === "nationality" ? sortOrder ?? undefined : undefined,
        render: (_, record) => getNationalityLabel(record.nationality),
      },
      {
        title: t("manage"),
        key: "manage",
        render: (_, record) => (
          <div className={styles.manageCell}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => handleEdit(record)}
            >
              {t("edit")}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => void handleDeleteOne(record)}
            >
              {t("deleteRow")}
            </button>
          </div>
        ),
      },
    ],
    [t, sortField, sortOrder, handleEdit, handleDeleteOne, getNationalityLabel]
  );

  return (
    <ConfigProvider locale={antdLocale}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.appTitle}>{t("appTitle")}</h1>
          <div className={styles.headerRight}>
            <Select
              className={styles.langSelect}
              value={i18n.language.startsWith("th") ? "th" : "en"}
              onChange={(lng) => void i18n.changeLanguage(lng)}
              options={[
                { value: "en", label: t("langEn") },
                { value: "th", label: t("langTh") },
              ]}
            />
            <Button
              className={styles.homeBtn}
              onClick={() => router.push("/home")}
            >
              {t("home")}
            </Button>
          </div>
        </header>

        <div className={styles.formOuter}>
          <section className={styles.formCard} id="top">
            <div className={styles.formGrid}>
              <div className={styles.formRowTop}>
                <div className={styles.inlineField}>
                  <label
                    className={`${styles.fieldLabel} ${styles.fieldLabelCompact}`}
                    htmlFor="fld-title"
                  >
                    <span className={styles.required}>*</span>
                    {t("title")}:
                  </label>
                  <div className={styles.fieldControl}>
                    <Select
                      id="fld-title"
                      style={{ width: 118 }}
                      value={form.title}
                      onChange={(v) => dispatch(setTitle(v))}
                      options={TITLE_OPTIONS}
                    />
                  </div>
                </div>
                <div className={styles.inlineField}>
                  <label
                    className={`${styles.fieldLabel} ${styles.fieldLabelCompact}`}
                    htmlFor="fld-first"
                  >
                    <span className={styles.required}>*</span>
                    {t("firstName")}:
                  </label>
                  <div className={styles.fieldControl}>
                    <Input
                      id="fld-first"
                      style={{
                        width: FORM_WIDE_INPUT_PX,
                        maxWidth: "100%",
                      }}
                      value={form.firstName}
                      onChange={(e) => dispatch(setFirstName(e.target.value))}
                    />
                  </div>
                </div>
                <div className={styles.inlineField}>
                  <label
                    className={`${styles.fieldLabel} ${styles.fieldLabelCompact}`}
                    htmlFor="fld-last"
                  >
                    <span className={styles.required}>*</span>
                    {t("lastName")}:
                  </label>
                  <div className={styles.fieldControl}>
                    <Input
                      id="fld-last"
                      style={{
                        width: FORM_WIDE_INPUT_PX,
                        maxWidth: "100%",
                      }}
                      value={form.lastName}
                      onChange={(e) => dispatch(setLastName(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formRowPair}>
                <div className={styles.inlineField}>
                  <label className={styles.fieldLabel} htmlFor="fld-bday">
                    <span className={styles.required}>*</span>
                    {t("birthday")}:
                  </label>
                  <div className={styles.fieldControl}>
                    <DatePicker
                      id="fld-bday"
                      style={{ width: 200, maxWidth: "100%" }}
                      placeholder="mm/dd/yy"
                      format="MM/DD/YY"
                      value={form.birthday ? dayjs(form.birthday) : null}
                      onChange={(d) =>
                        dispatch(setBirthday(d ? d.format("YYYY-MM-DD") : ""))
                      }
                    />
                  </div>
                </div>
                <div className={styles.inlineField}>
                  <label className={styles.fieldLabel} htmlFor="fld-nation">
                    <span className={styles.required}>*</span>
                    {t("nationality")}:
                  </label>
                  <div className={styles.fieldControl}>
                    <Select
                      id="fld-nation"
                      style={{
                        width: FORM_WIDE_INPUT_PX,
                        maxWidth: "100%",
                      }}
                      value={form.nationality}
                      onChange={(v) => dispatch(setNationality(v))}
                      options={nationalityOptions}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`${styles.inlineField} ${styles.inlineFieldLabelTight}`}
              >
                <label className={styles.fieldLabel} htmlFor="fld-citizen-0">
                  {t("citizenId")}:
                </label>
                <div className={styles.fieldControl}>
                  <div className={styles.citizenRow}>
                    {CITIZEN_LIMITS.map((max, idx) => {
                      const widths = [84, 122, 152, 96, 84];
                      return (
                        <Fragment key={idx}>
                          {idx > 0 ? (
                            <span
                              className={styles.citizenGap}
                              aria-hidden
                            >
                              <span className={styles.citizenDash}>-</span>
                            </span>
                          ) : null}
                          <Input
                            id={idx === 0 ? "fld-citizen-0" : undefined}
                            className={styles.citizenInput}
                            styles={citizenInputStyles}
                            style={{ width: widths[idx] }}
                            inputMode="numeric"
                            maxLength={max}
                            value={form.citizenParts[idx]}
                            onChange={(e) => {
                              const v = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, max);
                              dispatch(
                                setCitizenPart({
                                  index: idx as 0 | 1 | 2 | 3 | 4,
                                  value: v,
                                })
                              );
                            }}
                          />
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                className={`${styles.inlineField} ${styles.inlineFieldLabelTight}`}
              >
                <label className={styles.fieldLabel}>
                  <span className={styles.required}>*</span>
                  {t("gender")}:
                </label>
                <div className={styles.fieldControl}>
                  <Radio.Group
                    className={styles.radioRow}
                    value={form.gender}
                    onChange={(e) =>
                      dispatch(setGender(e.target.value as Gender))
                    }
                  >
                    <Radio value="male">{t("male")}</Radio>
                    <Radio value="female">{t("female")}</Radio>
                    <Radio value="unsex">{t("unsex")}</Radio>
                  </Radio.Group>
                </div>
              </div>

              <div
                className={`${styles.inlineField} ${styles.inlineFieldLabelTight}`}
              >
                <label className={styles.fieldLabel} htmlFor="fld-phone">
                  <span className={styles.required}>*</span>
                  {t("mobilePhone")}:
                </label>
                <div className={styles.fieldControl}>
                  <div className={styles.phoneRow}>
                    <Select
                      className={styles.phoneCode}
                      value={form.phoneCountryCode}
                      onChange={(v) => dispatch(setPhoneCountryCode(v))}
                      options={PHONE_CODES}
                      optionRender={(option) => {
                        const data = option.data as PhoneCodeOption;
                        return (
                          <span className={styles.phoneOption}>
                            <span
                              className={`fi fi-${data.fiCode} ${styles.phoneFiFlag}`}
                              aria-hidden
                            />
                            <span>{data.dial}</span>
                          </span>
                        );
                      }}
                      labelRender={(props) => {
                        const opt = PHONE_CODES.find(
                          (p) => p.value === props.value
                        );
                        if (!opt) {
                          return <span>{props.label}</span>;
                        }
                        return (
                          <span className={styles.phoneOption}>
                            <span
                              className={`fi fi-${opt.fiCode} ${styles.phoneFiFlag}`}
                              aria-hidden
                            />
                            <span>{opt.dial}</span>
                          </span>
                        );
                      }}
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) => {
                        const q = input.trim().toLowerCase();
                        if (!q) return true;
                        const lab = String(option?.label ?? "").toLowerCase();
                        const val = String(option?.value ?? "");
                        return (
                          lab.includes(q) ||
                          val.includes(q) ||
                          val.replace("+", "").includes(q)
                        );
                      }}
                    />
                    <span className={styles.phoneDash} aria-hidden>
                      -
                    </span>
                    <Input
                      id="fld-phone"
                      className={styles.phoneNumber}
                      inputMode="tel"
                      maxLength={10}
                      value={form.mobilePhone}
                      onChange={(e) => {
                        const next = digitsOnly(e.target.value).slice(0, 10);
                        dispatch(setMobilePhone(next));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`${styles.inlineField} ${styles.inlineFieldLabelTight} ${styles.inlineFieldSalaryPassport} ${styles.inlineFieldPassportWide}`}
              >
                <label className={styles.fieldLabel} htmlFor="fld-passport">
                  {t("passportNo")}:
                </label>
                <div className={styles.fieldControl}>
                  <Input
                    id="fld-passport"
                    className={styles.passportInput}
                    value={form.passportNo}
                    onChange={(e) =>
                      dispatch(setPassportNo(digitsOnly(e.target.value)))
                    }
                  />
                </div>
              </div>

              <div
                className={`${styles.inlineField} ${styles.inlineFieldLabelTight} ${styles.inlineFieldSalaryPassport}`}
              >
                <label className={styles.fieldLabel} htmlFor="fld-salary">
                  <span className={styles.required}>*</span>
                  {t("expectedSalary")}:
                </label>
                <div className={styles.fieldControl}>
                  <Input
                    id="fld-salary"
                    className={styles.salaryInput}
                    inputMode="decimal"
                    value={form.expectedSalary}
                    onChange={(e) =>
                      dispatch(setExpectedSalary(formatSalaryInput(e.target.value)))
                    }
                  />
                </div>
              </div>

              <div className={styles.formActionsRow}>
                <div className={styles.formActions}>
                  <Button className={styles.actionBtn} onClick={handleReset}>
                    {t("reset")}
                  </Button>
                  <Button
                    className={styles.actionBtn}
                    onClick={() => void handleSubmit()}
                  >
                    {t("submit")}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.tableOuter}>
          <div className={styles.tableToolbar}>
            <div className={styles.bulkBarLeft}>
              <Checkbox
                checked={allPageSelected}
                indeterminate={somePageSelected && !allPageSelected}
                onChange={(e) => toggleSelectAllPage(e.target.checked)}
              >
                <span className={styles.selectAllLabel}>{t("selectAll")}</span>
              </Checkbox>
              <Button
                className={styles.bulkDeleteBtn}
                disabled={selectedRowKeys.length === 0}
                onClick={() => void handleBulkDelete()}
              >
                {t("delete")}
              </Button>
            </div>
            <div className={styles.tableToolbarRight}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={sortedItems.length}
                showSizeChanger
                pageSizeOptions={[5, 10, 20]}
                onChange={(p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                }}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} / ${total}`
                }
                prevIcon={
                  <span style={{ padding: "0 8px", fontWeight: 600 }}>
                    {t("prev")}
                  </span>
                }
                nextIcon={
                  <span style={{ padding: "0 8px", fontWeight: 600 }}>
                    {t("next")}
                  </span>
                }
              />
            </div>
          </div>

          <section className={styles.tableCard}>
            <Table<EmployeeEntry>
              rowKey="id"
              columns={columns}
              dataSource={pagedItems}
              pagination={false}
              onChange={handleTableChange}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
            />
          </section>
        </div>
      </div>
    </ConfigProvider>
  );
}
