import { Metadata } from "next";
import RedocLoader from "./redoc-loader";

export const metadata: Metadata = {
  title: "Référence API - BizCore",
  description: "Documentation complète de l'API Business Core as a Service",
};

export default function ReferenceAPIPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div id="redoc-container" className="min-h-screen" />
      <RedocLoader />
    </div>
  );
}
