import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import SyncUser from '@/components/SyncUser'

export const metadata = {
  title: 'Ushas Products — Authentic Kerala Snacks',
  description: 'Traditional Kerala snacks, health foods and organic products delivered to your doorstep.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SyncUser />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}