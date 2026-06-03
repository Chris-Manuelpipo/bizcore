// URL du backend BizCore — source de vérité unique.
// Pilotée par NEXT_PUBLIC_API_URL ; à défaut, l'URL de prod (Render).
// En local, définir NEXT_PUBLIC_API_URL=http://localhost:8080 dans .env.local.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://bizcore-api.onrender.com";
