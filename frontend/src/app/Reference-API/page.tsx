import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Référence API - BizCore",
  description: "Documentation complète de l'API Business Core as a Service",
};

export default function ReferenceAPIPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
            import "https://cdn.jsdelivr.net/npm/redoc@2.2.0/bundles/redoc.standalone.js";
            window.onload = function() {
              Redoc.init('/openapi.yaml', {
                scrollYOffset: 64,
                hideDownloadButton: false,
                disableSearch: false,
                expandResponses: "200,201",
                expandSingleSchemaField: true,
                sortPropsAlphabetically: true,
                showExtensions: true,
                nativeScrollbars: true,
                pathInMiddlePanel: true,
                requiredPropsFirst: true,
              }, document.getElementById('redoc-container'));
            };
          `,
        }}
      />
      <div id="redoc-container" className="min-h-screen" />
    </div>
  );
}
