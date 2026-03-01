import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SentryInit from '../components/SentryInit'
import { initSentryServer } from '../lib/sentry'

export const metadata = {
  title: 'BridgeAI Labs',
  description: 'Advanced AI-powered lab platform',
}

// Initialize Sentry on the server when a DSN is present.
initSentryServer()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Header />
        <SentryInit />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}