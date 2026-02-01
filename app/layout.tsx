import type { Metadata } from "next";
import { Bungee, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  variable: "--font-bungee",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Link Shortener",
  description: "Encurte seus links de forma rápida e fácil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { 
          colorPrimary: '#ffffff',
          colorBackground: '#1a1a1a',
        },
        elements: {
          formButtonPrimary: 
            'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 
            'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          formFieldInput: 
            'bg-background border-input text-foreground',
          footerActionLink: 'text-primary hover:text-primary/90',
        },
      }}
    >
      <html lang="pt-BR" className="dark">
        <body
          className={`${bungee.variable} ${geistMono.variable} antialiased`}
        >
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
