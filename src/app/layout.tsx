import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://radar.codigointraempreendedor.com.br'),
  title: 'Radar CI — Código Intraempreendedor',
  description: 'Inteligência estratégica sobre negócios, inovação, empreendedorismo e tecnologia',
  openGraph: {
    title: 'Radar CI',
    description: 'Inteligência que move decisões reais. Curadoria estratégica para líderes e founders.',
    url: 'https://radar.codigointraempreendedor.com.br',
    siteName: 'Radar CI',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Radar CI — Inteligência que move decisões reais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar CI',
    description: 'Inteligência que move decisões reais. Curadoria estratégica para líderes e founders.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
