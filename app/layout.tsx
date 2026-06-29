import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InvoicePK — Professional Invoice Generator',
  description: 'Free Urdu & English invoice generator for Pakistani freelancers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
