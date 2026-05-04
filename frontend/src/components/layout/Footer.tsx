import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-6 bg-[#111118]">
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
          <span className="text-[13px] font-semibold text-gray-500">BizCore — Business Core as a Service</span>
        </div>
        <div className="flex gap-6">
          {["Documentation","GitHub","Swagger UI","Contact"].map(l=>(
            <Link key={l} href="#" className="text-[12px] text-gray-600 hover:text-white transition-colors">{l}</Link>
          ))}
        </div>
        <span className="text-[11.5px] text-gray-600">3e année génie informatique</span>
      </div>
    </footer>
  );
}
