import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BizCore - Business as a Service',
  description: 'Plateforme générique de gestion des métiers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
