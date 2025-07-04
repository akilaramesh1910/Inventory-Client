import './globals.css'
import { ReactNode } from 'react'
import { Metadata } from 'next'
import { SnackbarProvider } from '../context/SnackbarContext'

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description:
    'A streamlined web application designed to manage product inventory, stock levels, and sales operations efficiently for small-sized businesses.',
}


export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  )
}
