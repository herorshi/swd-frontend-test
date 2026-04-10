"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Col, Flex, Row, Select } from "antd";
import i18n from "@/i18n/i18n";
import styles from "./page.module.css";

type ShapeId =
  | "trapezoid"
  | "parallelogram"
  | "rectangle"
  | "oval"
  | "square"
  | "circle";

const DEFAULT_ORDER: ShapeId[] = [
  "square",
  "circle",
  "oval",
  "trapezoid",
  "rectangle",
  "parallelogram",
];

function rotateLeft(ids: ShapeId[]): ShapeId[] {
  if (ids.length === 0) return ids;
  return [...ids.slice(1), ids[0]];
}

function rotateRight(ids: ShapeId[]): ShapeId[] {
  if (ids.length === 0) return ids;
  return [ids[ids.length - 1], ...ids.slice(0, -1)];
}

function shuffleOrder(ids: ShapeId[]): ShapeId[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ShapeGraphic({
  id,
}: {
  id: ShapeId;
}) {
  const inner = useMemo(() => {
    switch (id) {
      case "trapezoid":
        return <div className={`${styles.trapezoid} ${styles.shapeFill}`} />;
      case "parallelogram":
        return <div className={`${styles.parallelogram} ${styles.shapeFill}`} />;
      case "rectangle":
        return <div className={`${styles.rectangle} ${styles.shapeFill}`} />;
      case "oval":
        return <div className={`${styles.oval} ${styles.shapeFill}`} />;
      case "square":
        return <div className={`${styles.square} ${styles.shapeFill}`} />;
      case "circle":
        return <div className={`${styles.circle} ${styles.shapeFill}`} />;
      default:
        return null;
    }
  }, [id]);

  return (
    <div className={`${styles.shapeCardInner} ${styles.shapeFill}`}>
      {inner}
    </div>
  );
}

function useI18nRerender() {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const handler = () => tick();
    i18n.on("languageChanged", handler);

    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  return useCallback((key: string) => String(i18n.t(key)), []);
}

function Triangle({
  dir,
  inline,
}: {
  dir: "left" | "right" | "up" | "down";
  inline?: boolean;
}) {
  const triangleDirClass =
    dir === "left"
      ? styles.triangleDirLeft
      : dir === "up"
        ? styles.triangleDirUp
        : dir === "right"
          ? styles.triangleDirRight
          : styles.triangleDirDown;

  const core = (
    <div
      className={`${styles.triangleRotate} ${triangleDirClass} ${styles.shapeFill}`}
    >
      <div className={styles.triangle} />
    </div>
  );

  if (inline) return core;
  return <div className={styles.shapeCardInner}>{core}</div>;
}

export default function LayoutClient() {
  const t = useI18nRerender();
  const router = useRouter();
  const [order, setOrder] = useState<ShapeId[]>(DEFAULT_ORDER);
  const [lang, setLang] = useState(() =>
    i18n.language.startsWith("th") ? "th" : "en"
  );
  const [bottomRowsStaggerSwapped, setBottomRowsStaggerSwapped] =
    useState(false);

  const row1 = order.slice(0, 3);
  const row2 = order.slice(3, 6);
  const shapeRows = [
    {
      ids: row1,
      keyPrefix: "r1",
      leadingSpacer: !bottomRowsStaggerSwapped,
      className: styles.gridRowTop,
    },
    {
      ids: row2,
      keyPrefix: "r2",
      leadingSpacer: bottomRowsStaggerSwapped,
    },
  ];

  return (
    <div className={styles.page}>
      <Flex
        className={styles.header}
        align="flex-start"
        justify="space-between"
        wrap
      >
        <h1 className={styles.title}>{t("layoutTitle")}</h1>
        <div className={styles.headerRight}>
          <Select
            className={styles.langSelect}
            value={lang}
            options={[
              { value: "en", label: t("langEn") },
              { value: "th", label: t("langTh") },
            ]}
            onChange={(nextLang) => {
              void i18n.changeLanguage(nextLang);
              setLang(nextLang);
            }}
          />
          <Button className={styles.homeBtn} onClick={() => router.push("/home")}>
            {t("home")}
          </Button>
        </div>
      </Flex>

      <div className={styles.mainBox}>
        <section className={styles.controlsSection} aria-label="Controls">
          <Row gutter={[18, 0]} className={styles.controlsRow} align="stretch">
            <Col span={6}>
              <Flex vertical align="center" className={styles.controlStack}>
                <Button
                  htmlType="button"
                  block
                  aria-label={t("moveShapeLeft")}
                  className={styles.shapeCard}
                  onClick={() => setOrder((o) => rotateLeft(o))}
                >
                  <div className={styles.shapeCardBody}>
                    <Triangle dir="left" />
                  </div>
                </Button>
                <div className={styles.pillWrap}>
                  <Button
                    htmlType="button"
                    className={styles.pill}
                    onClick={() => setOrder((o) => rotateLeft(o))}
                  >
                    {t("moveShapeLeft")}
                  </Button>
                </div>
              </Flex>
            </Col>

            <Col span={12}>
              <Flex vertical align="center" className={styles.controlStack}>
                <Button
                  htmlType="button"
                  block
                  aria-label={t("movePosition")}
                  className={styles.shapeCard}
                  onClick={() => setBottomRowsStaggerSwapped((prev) => !prev)}
                >
                  <div className={styles.shapeCardBody}>
                    <div className={styles.dualTriangles}>
                      <Triangle dir="up" inline />
                      <Triangle dir="down" inline />
                    </div>
                  </div>
                </Button>
                <div className={styles.pillWrap}>
                  <Button
                    htmlType="button"
                    className={styles.pill}
                    onClick={() => setBottomRowsStaggerSwapped((prev) => !prev)}
                  >
                    {t("movePosition")}
                  </Button>
                </div>
              </Flex>
            </Col>

            <Col span={6}>
              <Flex vertical align="center" className={styles.controlStack}>
                <Button
                  htmlType="button"
                  block
                  aria-label={t("moveShapeRight")}
                  className={styles.shapeCard}
                  onClick={() => setOrder((o) => rotateRight(o))}
                >
                  <div className={styles.shapeCardBody}>
                    <Triangle dir="right" />
                  </div>
                </Button>
                <div className={styles.pillWrap}>
                  <Button
                    htmlType="button"
                    className={styles.pill}
                    onClick={() => setOrder((o) => rotateRight(o))}
                  >
                    {t("moveShapeRight")}
                  </Button>
                </div>
              </Flex>
            </Col>
          </Row>
        </section>

        <div className={styles.sectionDivider} />

        <div className={styles.gridWrap}>
          {shapeRows.map(({ ids, keyPrefix, leadingSpacer, className }) => (
            <Row
              key={keyPrefix}
              gutter={[20, 20]}
              wrap={false}
              className={`${styles.gridRow} ${className ?? ""}`}
            >
              {leadingSpacer ? <Col span={6} /> : null}
              {ids.map((id, index) => (
                <Col span={6} key={`${id}-${keyPrefix}-${index}`}>
                  <Button
                    htmlType="button"
                    block
                    className={styles.gridCell}
                    onClick={() => setOrder((o) => shuffleOrder(o))}
                  >
                    <div className={styles.gridCard}>
                      <div className={styles.gridCardBody}>
                        <ShapeGraphic id={id} />
                      </div>
                    </div>
                  </Button>
                </Col>
              ))}
              {!leadingSpacer ? <Col span={6} /> : null}
            </Row>
          ))}
        </div>
      </div>
    </div>
  );
}
