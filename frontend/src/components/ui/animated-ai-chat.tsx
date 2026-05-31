"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUp, Command as CommandIcon, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Auto-resize textarea hook                                                  */
/* -------------------------------------------------------------------------- */

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      if (reset) {
        el.style.height = `${minHeight}px`;
        return;
      }
      el.style.height = `${minHeight}px`;
      el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (el) el.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  /** Slash trigger, e.g. "/auth" */
  prefix: string;
  /** Full prompt inserted when the command is chosen */
  prompt: string;
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  placeholder?: string;
  commands?: CommandSuggestion[];
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  ChatComposer — glassmorphism input with slash command palette              */
/* -------------------------------------------------------------------------- */

export function ChatComposer({
  value,
  onChange,
  onSend,
  loading = false,
  placeholder = "Posez votre question…",
  commands = [],
  className,
}: ChatComposerProps) {
  const reduceMotion = useReducedMotion();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(52, 200);
  const [focused, setFocused] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const paletteRef = useRef<HTMLDivElement>(null);

  const canSend = value.trim().length > 0 && !loading;

  // Open the palette when typing a bare "/command"
  useEffect(() => {
    if (commands.length > 0 && value.startsWith("/") && !value.includes(" ")) {
      setShowPalette(true);
      const i = commands.findIndex((c) => c.prefix.startsWith(value));
      setActiveIndex(i >= 0 ? i : 0);
    } else {
      setShowPalette(false);
    }
  }, [value, commands]);

  // Dismiss palette on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setShowPalette(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pickCommand = (index: number) => {
    const cmd = commands[index];
    if (!cmd) return;
    onChange(cmd.prompt);
    setShowPalette(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      adjustHeight();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((p) => (p < commands.length - 1 ? p + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((p) => (p > 0 ? p - 1 : commands.length - 1));
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        pickCommand(activeIndex);
        return;
      }
      if (e.key === "Escape") {
        setShowPalette(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Slash command palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            ref={paletteRef}
            role="listbox"
            className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-xl border shadow-2xl"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            {commands.map((cmd, i) => (
              <button
                key={cmd.prefix}
                role="option"
                aria-selected={activeIndex === i}
                onClick={() => pickCommand(i)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors",
                  activeIndex === i ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]",
                )}
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
                  {cmd.icon}
                </span>
                <span className="flex-1">
                  <span className="font-medium" style={{ color: "var(--text)" }}>
                    {cmd.label}
                  </span>
                  <span className="block text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {cmd.description}
                  </span>
                </span>
                <kbd
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ background: "var(--surface)", color: "var(--text-muted)" }}
                >
                  {cmd.prefix}
                </kbd>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input shell */}
      <div
        className="glass relative rounded-2xl transition-shadow duration-300"
        style={{
          boxShadow: focused
            ? "0 0 0 1px var(--indigo-l), 0 8px 40px -12px rgba(79,70,229,0.45)"
            : "0 8px 30px -18px rgba(0,0,0,0.6)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          placeholder={placeholder}
          aria-label="Message à BizCore AI"
          className="block w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[14px] leading-relaxed outline-none placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text)" }}
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <span
            className="flex items-center gap-1.5 px-2 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <CommandIcon size={12} />
            Tapez <kbd className="font-medium">/</kbd> pour les commandes
          </span>

          <motion.button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            aria-label="Envoyer"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
              canSend
                ? "bg-gradient-brand text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
                : "cursor-not-allowed text-[var(--text-muted)]",
            )}
            style={canSend ? undefined : { background: "var(--surface-2)" }}
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TypingDots — animated "thinking" indicator                                 */
/* -------------------------------------------------------------------------- */

export function TypingDots() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gradient-brand"
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
