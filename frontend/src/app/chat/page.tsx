"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { ENDPOINTS } from "@/lib/endpoints";
import { GUIDES } from "@/lib/guides";

interface Message { id: string; role: "user" | "assistant"; content: string; }

const ENDPOINTS_DOCS = ENDPOINTS.map((e) => {
  const params = e.params.map((p) => `    • ${p.name} (${p.in}, ${p.required ? "requis" : "optionnel"}, ${p.type}) : ${p.description}`).join("\n");
  const responses = e.responses.map((r) => `    • ${r.status} : ${r.description}`).join("\n");
  return `- ${e.method} ${e.path}
  Catégorie : ${e.category}
  Résumé : ${e.summary}
  Description : ${e.description}
  Auth requise : ${e.requiresAuth} | Tenant requis : ${e.requiresTenant}
  Paramètres :
${params || "    (aucun)"}
  Réponses :
${responses}`;
}).join("\n\n");

const GUIDES_DOCS = GUIDES.map((g) => {
  const steps = g.steps.map((s, i) => {
    let stepText = `    Étape ${i + 1} : ${s.title}\n    ${s.content}`;
    if (s.code) {
      stepText += `\n    Exemple (${s.code.lang}) :\n${s.code.body}`;
    }
    return stepText;
  }).join("\n\n");
  return `## ${g.title} (${g.category} - ${g.difficulty} - ${g.duration})
${g.description}
Tags : ${g.tags.join(", ")}

${steps}`;
}).join("\n\n");

const SYSTEM_PROMPT = `Tu es BizCore AI, l'assistant expert de la plateforme BizCore — Business Core as a Service (BCaaS).

CONTEXTE BIZCORE :
BizCore est une plateforme API générique multi-tenant qui modélise les interactions métier sous forme de protocoles réseau :
• Émetteur = Consumer Actor (demandeur de service)
• Récepteur = Provider Actor (fournisseur de service)
• Protocole = Business Rules (règles métier configurables)
• Message/Requête = ServiceRequest (demande de service)
• ACK = Invoice (facture automatique)

ARCHITECTURE :
- Backend : Spring Boot 3.5.12 (Java 21), PostgreSQL, Redis, JWT
- Frontend : Next.js 16 avec React 19, Tailwind CSS, Zustand
- Multi-tenant : isolation totale des données par X-Tenant-Id
- Workflow ServiceRequest : PENDING → ACCEPTED → IN_PROGRESS → FULFILLED → PAID
- Facture auto-générée à FULFILLED
- Devises supportées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP

TOUS LES ENDPOINTS API (${ENDPOINTS.length} endpoints) :
${ENDPOINTS_DOCS}

GUIDES D'INTÉGRATION :
${GUIDES_DOCS}

TYPES D'ENTITÉS :
• Tenant : espace métier isolé (id, name, domain, plan)
• Person : personne physique (id, firstName, lastName, email, phone)
• Actor : rôle dans un tenant (PROVIDER ou CONSUMER lié à une Person)
• Business : entreprise métier (id, name, type, description)
• ServiceCatalogue : services disponibles (id, name, price, currency, providerId)
• ServiceRequest : demande de service (id, status, serviceId, consumerId, notes)
• Invoice : facture (id, status, amount, currency, serviceRequestId)
• BusinessRule : règle configurable (name, value, type, description)

RÈGLES DE RÉPONSE :
1. Toujours répondre en français, clairement et professionnellement
2. Donner des exemples concrets (curl, JSON, JavaScript/TypeScript)
3. Expliquer le concept réseau (émetteur/récepteur/protocole) quand pertinent
4. Préciser les headers requis (Authorization, X-Tenant-Id)
5. Si hors périmètre BizCore, expliquer poliment ta spécialisation
6. Pour les erreurs 409 (conflit), expliquer les transitions d'état valides
7. Utiliser des emojis pertinents pour structurer la réponse (📡, 🔐, 📋, ✅, ❌)`;

const SUGGESTIONS = [
  "Comment s'authentifier et obtenir un token JWT ?",
  "Explique-moi le cycle de vie d'un ServiceRequest",
  "Comment créer un tenant et configurer un acteur PROVIDER ?",
  "Donne-moi un exemple complet de création de facture",
  "Qu'est-ce que le multi-tenant dans BizCore ?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Erreur ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: reply }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `Erreur de connexion à BizCore AI : ${errorMessage}. Vérifiez votre clé API.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Bot size={17} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-[16px]">BizCore AI</h1>
            <p className="text-[11px] text-emerald-400">● En ligne — Spécialiste de l'API BizCore</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}>
            <Trash2 size={12} /> Effacer
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-white" />
            </div>
            <h2 className="font-display text-[22px] font-bold mb-2">BizCore AI</h2>
            <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Je connais toute la documentation de l'API BizCore. Posez-moi vos questions sur les endpoints, l'intégration ou l'architecture.
            </p>
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-[13px] px-4 py-2.5 rounded-xl border transition-all hover:-translate-y-px"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === "assistant" ? "bg-gradient-brand" : "border"
              }`} style={msg.role === "user" ? { background: "var(--surface-2)", borderColor: "var(--border)" } : {}}>
                {msg.role === "assistant" ? <Bot size={13} className="text-white" /> : <User size={13} style={{ color: "var(--text-muted)" }} />}
              </div>
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[var(--indigo)] text-white rounded-br-sm"
                  : "rounded-bl-sm border"
              }`} style={msg.role === "assistant" ? { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" } : {}}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm border flex items-center gap-2"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <Loader2 size={13} className="animate-spin" />
              <span className="text-[13px]">BizCore AI réfléchit…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-2 flex-shrink-0 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-3 items-center px-4 py-3 rounded-2xl border transition-colors focus-within:border-[var(--indigo)]"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Posez votre question sur l'API BizCore…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: "var(--text)" }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-[var(--indigo)] hover:bg-[#4338CA] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95">
            <Send size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[11px] text-center mt-2" style={{ color: "var(--text-muted)" }}>
          BizCore AI est entraîné sur la documentation de l'API — les réponses peuvent varier.
        </p>
      </div>
    </div>
  );
}
