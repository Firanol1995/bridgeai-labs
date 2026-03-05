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
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-blue-600 focus:px-3 focus:py-2">Skip to content</a>
        <Header />
        <SentryInit />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}