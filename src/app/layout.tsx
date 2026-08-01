import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Curling Strategy Board";
const description =
  "Interactive curling strategy board from Team Hocevar. Place rocks and markers on a regulation hog-to-house sheet in 2D or 3D.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${title} | Team Hocevar`,
    template: `%s | ${title}`,
  },
  description,
  applicationName: title,
  keywords: [
    "curling",
    "strategy board",
    "curling rocks",
    "hog to house",
    "Team Hocevar",
    "curling tactics",
    "2D",
    "3D",
  ],
  authors: [
    { name: "Team Hocevar", url: "https://www.instagram.com/teamhocevar/" },
  ],
  creator: "Team Hocevar",
  publisher: "Team Hocevar",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/th_logo.svg", type: "image/svg+xml" }],
    shortcut: ["/th_logo.svg"],
    apple: [{ url: "/th_logo.svg" }],
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: title,
    title: `${title} | Team Hocevar`,
    description,
    images: [
      {
        url: "/preview.png",
        width: 1270,
        height: 718,
        alt: "Curling Strategy Board preview with rocks and markers on the sheet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Team Hocevar`,
    description,
    images: ["/preview.png"],
  },
  category: "sports",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
