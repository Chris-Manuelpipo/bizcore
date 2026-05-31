"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/* Lightweight, dependency-free renderer for the markdown-ish text returned by
   the assistant: ```fenced code```, `inline code`, **bold**, and line breaks. */

function renderInline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded-md px-1.5 py-0.5 text-[12.5px] font-mono"
          style={{ background: "var(--surface-2)", color: "var(--cyan-l)" }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div
      className="my-2 overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[11px]"
        style={{ borderBottom: "0.5px solid var(--border)", color: "var(--text-muted)" }}
      >
        <span className="font-mono">{lang || "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 transition-colors hover:text-[var(--text)]"
          aria-label="Copier le code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 text-[12.5px] leading-relaxed">
        <code className="font-mono" style={{ color: "var(--text)" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

export function MessageContent({ content }: { content: string }) {
  // Split on fenced code blocks; odd segments are code.
  const segments = content.split(/```/);
  return (
    <div className="text-[13.5px] leading-relaxed" style={{ color: "var(--text)" }}>
      {segments.map((segment, i) => {
        if (i % 2 === 1) {
          const newline = segment.indexOf("\n");
          const lang = newline > -1 ? segment.slice(0, newline).trim() : "";
          const code = (newline > -1 ? segment.slice(newline + 1) : segment).replace(/\n$/, "");
          return <CodeBlock key={i} lang={lang} code={code} />;
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {renderInline(segment, String(i))}
          </span>
        );
      })}
    </div>
  );
}
