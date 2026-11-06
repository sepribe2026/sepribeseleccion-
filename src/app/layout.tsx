import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cambia a false o define NEXT_PUBLIC_SERVICE_SUSPENDED="false" cuando quieras reactivar el sistema
const SERVICE_SUSPENDED = process.env.NEXT_PUBLIC_SERVICE_SUSPENDED !== "false";

export const metadata: Metadata = {
  title: SERVICE_SUSPENDED ? "Servicio Suspendido" : "SEPRIBE CIA.LTDA. - Onboarding",
  description: SERVICE_SUSPENDED
    ? "El acceso a esta plataforma se encuentra suspendido."
    : "Portal de Onboarding y Selección",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        {SERVICE_SUSPENDED ? (
          <main
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "#f8fafc",
              fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
              padding: "24px",
              margin: 0,
            }}
          >
            <div
              style={{
                maxWidth: "480px",
                width: "100%",
                backgroundColor: "rgba(30, 41, 59, 0.85)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "16px",
                padding: "40px 32px",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: "28px",
                }}
              >
                ⚠️
              </div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  margin: "0 0 12px",
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                Servicio Suspendido
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#94a3b8",
                  margin: "0 0 24px",
                }}
              >
                El acceso a esta plataforma y todos sus módulos asociados se encuentra temporalmente suspendido por motivos administrativos.
              </p>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  borderTop: "1px solid rgba(148, 163, 184, 0.15)",
                  paddingTop: "16px",
                }}
              >
                Código de estado: 503 — Service Suspended
              </div>
            </div>
          </main>
        ) : (
          <AuthProvider>
            {children}
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
