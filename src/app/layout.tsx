import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Grievance AI — AI-Powered Public Grievance Platform",
  description:
    "Register, analyze, and resolve public grievances with AI. Multilingual submissions, automatic classification, prioritization, and department routing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <footer className="border-t border-line bg-navy py-6 text-white" role="contentinfo">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-white/70 sm:flex-row sm:px-6">
                <p>
                  GrievanceAI — built for Hack 2 Ignite (Problem AI-04) by Team
                  Recursion
                </p>
                <p className="text-xs">Powered by Gemini AI · Any language supported</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
