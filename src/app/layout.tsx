import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Radar CI — Código Intraempreendedor',
  description: 'Inteligência estratégica sobre negócios, inovação, empreendedorismo e tecnologia',
  openGraph: {
    title: 'Radar CI',
    description: 'Curadoria estratégica para líderes e founders',
    url: 'https://radar.codigointraempreendedor.com.br',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
