import './globals.css'
import { Limelight, Bebas_Neue, Barlow } from 'next/font/google'
const display = Limelight({ subsets: ['latin'], weight: '400', variable: '--font-display' })
const label = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-label' })
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })
export const metadata = { title: 'Arya and Nikhil: The Wedding', description: 'In theatres 14 April 2027.' }
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#061A1C' }
export default function RootLayout({ children }) {
  return (<html lang="en" className={`${display.variable} ${label.variable} ${body.variable}`}><body>{children}</body></html>)
}
