import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/src/env";
import "./globals.css";
import { ThemeProvider } from "@/src/lib/theme/theme-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agnostic Metadata CMS",
  description: "Metadata-driven Next.js architecture",
};

// Runs synchronously before React hydrates to prevent a flash of the wrong theme.
// Reads localStorage, validates the value, and sets data-theme on <html> immediately.
// Must stay a plain string (not imported) so it is never deferred by the bundler.
const ANTI_FLASH_SCRIPT = `(function(){
  var K='agnostic-theme';
  var V=new Set(['system','light','dark','ocean','forest']);
  try{
    var s=window.localStorage.getItem(K);
    if(s&&V.has(s)&&s!=='system')
      document.documentElement.setAttribute('data-theme',s);
  }catch(e){}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
