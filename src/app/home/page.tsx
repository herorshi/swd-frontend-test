"use client";

import { Select, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import styles from "./page.module.css";

const PREFETCH_HREFS = ["/layout", "/form"] as const;

function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>) {
  return (
    e.button === 0 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      ...PREFETCH_HREFS.map((href) => router.prefetch(href)),
      import("../layout/LayoutClient"),
      import("../page"),
    ]);
  }, [router]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerSpacer} />
        <Select
          className={styles.langSelect}
          value={i18n.language.startsWith("th") ? "th" : "en"}
          onChange={(lng) => void i18n.changeLanguage(lng)}
          options={[
            { value: "en", label: t("langEn") },
            { value: "th", label: t("langTh") },
          ]}
        />
      </header>

      <main className={styles.main}>
        <div className={styles.cardGrid}>
          <div className={styles.cardWrap}>
            <Link
              className={`${styles.card} ${pendingHref === "/layout" ? styles.cardBusy : ""}`}
              href="/layout"
              prefetch={true}
              aria-busy={pendingHref === "/layout"}
              onClick={(e) => {
                if (!isPlainLeftClick(e)) return;
                setPendingHref("/layout");
              }}
            >
              <span className={styles.cardTitle}>{t("test1")}</span>
              <span className={styles.cardSubtitle}>{t("layoutTitle")}</span>
            </Link>
            {pendingHref === "/layout" ? (
              <div className={styles.cardLoading} aria-live="polite">
                <Spin size="small" tip={t("loading")} />
              </div>
            ) : null}
          </div>

          <div className={styles.cardWrap}>
            <Link
              className={`${styles.card} ${pendingHref === "/form" ? styles.cardBusy : ""}`}
              href="/form"
              prefetch={true}
              aria-busy={pendingHref === "/form"}
              onClick={(e) => {
                if (!isPlainLeftClick(e)) return;
                setPendingHref("/form");
              }}
            >
              <span className={styles.cardTitle}>{t("test2")}</span>
              <span className={styles.cardSubtitle}>{t("appTitle")}</span>
            </Link>
            {pendingHref === "/form" ? (
              <div className={styles.cardLoading} aria-live="polite">
                <Spin size="small" tip={t("loading")} />
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
