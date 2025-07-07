import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";

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
    default: "Starknet Transaction Explorer",
    template: "%s | Starknet Explorer"
  },
  description: "Visualize wallet transactions in an interactive graph on Starknet. Explore transaction flows, connections, and patterns with our intuitive transaction explorer.",
  keywords: [
    "Starknet",
    "blockchain",
    "transaction explorer",
    "wallet analysis",
    "crypto",
    "transaction graph",
    "visualization",
    "DeFi",
    "ethereum L2"
  ],
  authors: [{ name: "Adamu Jethro", url: "https://x.com/jaykosai" }],
  creator: "Adamu Jethro",
  publisher: "JayWebtech",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://starknet-explorer-graph.vercel.app",
    title: "Starknet Transaction Explorer",
    description: "Visualize wallet transactions in an interactive graph on Starknet. Explore transaction flows, connections, and patterns with our intuitive transaction explorer.",
    siteName: "Starknet Transaction Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Starknet Transaction Explorer - Visualize blockchain transactions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Starknet Transaction Explorer",
    description: "Visualize wallet transactions in an interactive graph on Starknet",
    creator: "@jaykosai",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  alternates: {
    canonical: "https://starknet-explorer-graph.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-grow">
          {children}
        </div>
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                Built with ❤️ by{' '}
                <a 
                  href="https://x.com/jaykosai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Adamu Jethro
                </a>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <a 
                  href="https://github.com/JayWebtech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>JayWebtech</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
