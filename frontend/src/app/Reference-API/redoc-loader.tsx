"use client";
import Script from "next/script";

declare const Redoc: {
  init(specUrl: string, options: Record<string, unknown>, element?: HTMLElement | null): void;
};

function buildTheme() {
  const s = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return {
    colors: {
      primary: { main: s("--indigo") || "#4F46E5" },
      success: { main: "#10B981" },
      warning: { main: "#F59E0B" },
      error: { main: "#EF4444" },
      text: {
        primary: s("--text") || "#F4F4F8",
        secondary: s("--text-muted") || "#8B8FA8",
      },
      border: { ...{ light: s("--border") || "#1F2028", dark: s("--border") || "#1F2028" } },
      responses: {
        success: { color: "#10B981", backgroundColor: "rgba(16,185,129,0.08)" },
        error: { color: "#EF4444", backgroundColor: "rgba(239,68,68,0.08)" },
        redirect: { color: "#F59E0B", backgroundColor: "rgba(245,158,11,0.08)" },
        info: { color: "#6366F1", backgroundColor: "rgba(99,102,241,0.08)" },
      },
      http: {
        get: "#10B981",
        post: "#6366F1",
        put: "#F59E0B",
        patch: "#8B5CF6",
        delete: "#EF4444",
      },
    },
    sidebar: {
      backgroundColor: s("--surface") || "#111118",
      textColor: s("--text-muted") || "#8B8FA8",
      activeTextColor: s("--text") || "#F4F4F8",
      groupBackground: s("--surface-2") || "#16161F",
      indent: "12px",
      width: "280px",
    },
    rightPanel: {
      backgroundColor: s("--surface-2") || "#16161F",
      width: "40%",
    },
    typography: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontSize: "13px",
      lineHeight: "1.6",
      links: { color: s("--indigo") || "#4F46E5", hover: s("--indigo-l") || "#6366F1" },
      headings: { fontFamily: "Syne, sans-serif", fontWeight: "600", lineHeight: "1.25" },
      code: {
        fontSize: "12px",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        backgroundColor: s("--surface") || "#111118",
        color: s("--text") || "#F4F4F8",
      },
    },
    logo: { gutter: "16px" },
    spacing: { unit: 4, sectionHorizontal: 32, sectionVertical: 24 },
  };
}

export default function RedocLoader() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"
      strategy="afterInteractive"
      onLoad={() => {
        const container = document.getElementById("redoc-container");
        if (!container) return;
        Redoc.init("/openapi.yaml", {
          scrollYOffset: 64,
          hideDownloadButton: false,
          disableSearch: false,
          expandResponses: "200,201",
          expandSingleSchemaField: true,
          sortPropsAlphabetically: true,
          showExtensions: false,
          nativeScrollbars: true,
          pathInMiddlePanel: false,
          requiredPropsFirst: true,
          hideLoading: true,
          theme: buildTheme(),
        }, container);
      }}
    />
  );
}
