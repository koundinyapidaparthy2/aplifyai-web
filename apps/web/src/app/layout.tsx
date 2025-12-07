import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import VersionDisplay from "@/components/VersionDisplay";
import GoogleOneTap from "@/components/GoogleOneTap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AplifyAI - Find Your Dream Job with AI-Powered Resume Builder",
    template: "%s | AplifyAI"
  },
  description: "Transform your job search with AplifyAI. Create professional, ATS-friendly resumes and cover letters tailored to any job description. Trusted by 20,000+ job seekers. Start for free today!",
  keywords: ["resume builder", "AI resume", "cover letter generator", "job application", "ATS resume", "career tools", "job search", "resume optimization", "AI job tools"],
  authors: [{ name: "AplifyAI Team" }],
  creator: "AplifyAI",
  publisher: "AplifyAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aplifyai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AplifyAI - Find Your Dream Job with AI-Powered Resume Builder",
    description: "Transform your job search with AplifyAI. Create professional, ATS-friendly resumes and cover letters in minutes.",
    url: 'https://aplifyai.com',
    siteName: 'AplifyAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AplifyAI - AI-Powered Resume Builder',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AplifyAI - AI-Powered Resume Builder',
    description: 'Create professional resumes and cover letters tailored to any job. Join 20,000+ successful job seekers.',
    images: ['/twitter-image.png'],
    creator: '@aplifyai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'yandex-verification-code',
    // yahoo: 'yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AplifyAI',
    description: 'AI-powered resume and cover letter generator',
    url: 'https://aplifyai.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '20000',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <VersionDisplay />
          <GoogleOneTap />
        </AuthProvider>
      </body>
    </html>
  );
}
