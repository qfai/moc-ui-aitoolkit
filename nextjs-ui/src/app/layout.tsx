import React from 'react'
import '../styles/globals.css'

export const metadata = {
  title: 'Kaito UI',
  description: 'Kaito VS Code Extension UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
