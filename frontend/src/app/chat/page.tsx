"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Bot,
  User,
  Trash2,
  KeyRound,
  Building2,
  Workflow,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { ChatComposer, TypingDots, type CommandSuggestion } from "@/components/ui/animated-ai-chat";
import { MessageContent } from "@/components/ui/message-content";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

function getFriendlyChatError() {
  return "Vous avez atteint la limite d'utilisation de BizCore AI. Réessayez plus tard.";
}

function AssistantResponseBubble({ content, error }: { content: string; error?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [visibleContent, setVisibleContent] = useState("");

  useEffect(() => {
    if (reduceMotion) {
      setVisibleContent(content);
      return;
    }

    setVisibleContent("");

    let index = 0;
    let frame = 0;
    let timer: number | undefined;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;

      frame += 1;
      const nextIndex = Math.min(
        content.length,
        frame < 18 ? Math.ceil(index + 2) : Math.ceil(index + Math.max(1, content.length / 70)),
      );

      if (nextIndex !== index) {
        index = nextIndex;
        setVisibleContent(content.slice(0, index));
      }

      if (index < content.length) {
        timer = window.setTimeout(step, frame < 18 ? 18 : 14);
      }
    };

    timer = window.setTimeout(step, 12);

    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [content, reduceMotion]);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={reduceMotion ? { duration: 0.18 } : { type: "spring", stiffness: 260, damping: 24, mass: 0.9 }}
      className="relative overflow-hidden rounded-2xl rounded-bl-sm px-4 py-3 glass"
      style={error ? { borderColor: "var(--destructive, #EF4444)" } : undefined}
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "320%", opacity: [0, 0.55, 0] }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.08 }}
        />
      )}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.05 }}
        className="relative"
      >
        <MessageContent content={visibleContent} />
      </motion.div>
    </motion.div>
  );
}

const COMMANDS: CommandSuggestion[] = [
  {
    icon: <KeyRound className="h-4 w-4" />,
    label: "Authentification",
    description: "Obtenir un token JWT",
    prefix: "/auth",
    prompt: "Comment s'authentifier et obtenir un token JWT ?",
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    label: "Tenant",
    description: "Créer un tenant et un acteur PROVIDER",
    prefix: "/tenant",
    prompt: "Comment créer un tenant et configurer un acteur PROVIDER ?",
  },
  {
    icon: <Workflow className="h-4 w-4" />,
    label: "Workflow",
    description: "Cycle de vie d'un ServiceRequest",
    prefix: "/workflow",
    prompt: "Explique-moi le cycle de vie d'un ServiceRequest avec les transitions d'état.",
  },
  {
    icon: <ReceiptText className="h-4 w-4" />,
    label: "Facture",
    description: "Exemple complet de facturation",
    prefix: "/facture",
    prompt: "Donne-moi un exemple complet de création et de paiement d'une facture.",
  },
];

const SUGGESTIONS = [
  "Comment s'authentifier et obtenir un token JWT ?",
  "Explique-moi le cycle de vie d'un ServiceRequest",
  "Comment créer un tenant et configurer un acteur PROVIDER ?",
  "Qu'est-ce que le multi-tenant dans BizCore ?",
];

export default function ChatPage() {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, loading, reduceMotion]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "Désolé, je n'ai pas pu générer de réponse.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: getFriendlyChatError(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden pt-14">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 left-1/4 h-80 w-80 rounded-full blur-[120px] ${
            reduceMotion ? "" : "animate-pulse"
          }`}
          style={{ background: "rgba(79,70,229,0.12)" }}
        />
        <div
          className={`absolute -bottom-32 right-1/4 h-80 w-80 rounded-full blur-[120px] ${
            reduceMotion ? "" : "animate-pulse"
          }`}
          style={{ background: "rgba(6,182,212,0.10)", animationDelay: "1.2s" }}
        />
      </div>

      {/* Bouton flottant « Effacer » — uniquement en conversation */}
      <AnimatePresence>
        {!isEmpty && (
          <motion.button
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onClick={() => setMessages([])}
            className="glass absolute right-4 top-3 z-20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={12} /> Effacer
          </motion.button>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex min-h-[55vh] flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-xl shadow-indigo-500/25"
              >
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h2 className="font-display text-[26px] font-bold">
                Comment puis-je <span className="gradient-text">vous aider</span> ?
              </h2>
              <p className="mt-2 max-w-md text-[14px]" style={{ color: "var(--text-muted)" }}>
                Je connais toute la documentation de l&apos;API BizCore — endpoints, intégration,
                architecture multi-tenant et workflows.
              </p>

              <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    onClick={() => send(s)}
                    className="glass rounded-xl px-4 py-3 text-left text-[13px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ color: "var(--text)" }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout={!reduceMotion}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                        msg.role === "assistant" ? "bg-gradient-brand" : "border"
                      }`}
                      style={
                        msg.role === "user"
                          ? { background: "var(--surface-2)", borderColor: "var(--border)" }
                          : undefined
                      }
                    >
                      {msg.role === "assistant" ? (
                        <Bot size={15} className="text-white" />
                      ) : (
                        <User size={15} style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl ${
                        msg.role === "user" ? "rounded-br-sm bg-gradient-brand px-4 py-3 text-white" : "p-0"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <AssistantResponseBubble content={msg.content} error={msg.error} />
                      ) : (
                        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-brand">
                      <Bot size={15} className="text-white" />
                    </div>
                    <div className="glass flex items-center gap-2.5 rounded-2xl rounded-bl-sm px-4 py-3">
                      <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        BizCore AI réfléchit
                      </span>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-5 pt-1">
        <div className="mx-auto w-full max-w-3xl">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={() => send()}
            loading={loading}
            commands={COMMANDS}
            placeholder="Posez votre question sur l'API BizCore…"
          />
          <p className="mt-2 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            BizCore AI peut faire des erreurs, vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
