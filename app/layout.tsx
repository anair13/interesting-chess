import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers/Providers'

export const metadata: Metadata = {
  title: 'Chess Random Positions',
  description: 'Play chess starting from random interesting positions from Grandmaster games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
