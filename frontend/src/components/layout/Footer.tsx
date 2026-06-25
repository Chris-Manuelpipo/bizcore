import Link from "next/link";
import { API_BASE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] py-8 px-6 bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-gradient-brand flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.9"/>
              <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55"/>
              <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55"/>
              <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.25"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-[var(--text-muted)]">BizCore — Business Core as a Service</span>
        </div>
        <div className="flex gap-6">
          <Link href="/docs" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Documentation</Link>
          <a href="https://github.com/Chris-Manuelpipo/bizcore.git" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">GitHub</a>
          <a href={`${API_BASE}/swagger-ui.html`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Swagger UI</a>
        </div>
        <span className="text-[11.5px] text-[var(--text-muted)]">3e année génie informatique</span>
      </div>
    </footer>
  );
}
