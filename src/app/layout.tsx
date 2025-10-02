import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import './drag-drop.css'
import { ThemeProvider } from '@/components/theme-provider'
import { GamificationProvider } from '@/contexts/GamificationContext'
import { TaskGamificationProvider } from '@/contexts/TaskGamificationIntegration'
import { TaskProvider } from '@/contexts/TaskContextV2'
import { Toaster } from '@/components/ui/sonner'
import { GamificationNotifications } from '@/components/GamificationNotifications'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: ':::AATROXX:::',
  description: 'O primeiro SAAS de gerenciamento de tarefas que transforma sua produtividade em uma épica jornada RPG.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TaskProvider>
            <GamificationProvider>
              <TaskGamificationProvider>
                {children}
                <GamificationNotifications />
                <Toaster />
              </TaskGamificationProvider>
            </GamificationProvider>
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
