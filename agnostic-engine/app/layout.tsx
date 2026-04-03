import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/src/env";
import "./globals.css";
import { ThemeProvider, STORAGE_KEY } from "@/src/lib/theme/theme-context";
import { DEFAULT_THEME_ID, THEME_IDS } from "@/src/lib/theme/themes";
import { SITE_CONFIG } from "@/src/lib/site-config";

// TODO(i18n): replace "latin" with the full subset list once i18n is wired.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
};

/**
 * Builds the anti-flash inline script from the canonical theme constants.
 * All values (storage key, valid IDs, system sentinel) are derived at module
 * evaluation time — adding or renaming a theme in themes.ts is the only
 * change needed; this script stays correct automatically.
 *
 * The script runs synchronously before React hydrates so the correct
 * data-theme is on <html> before the first paint, preventing a flash.
 * It must be a plain string (not a module import) so the bundler never defers it.
 */
function buildAntiFlashScript(
  storageKey: string,
  validIds: Set<string>,
  systemId: string
): string {
  const keyJson = JSON.stringify(storageKey);
  const sysJson = JSON.stringify(systemId);
  const idsJson = JSON.stringify([...validIds]);
  return (
    `(function(){` +
    `var K=${keyJson};` +
    `var S=${sysJson};` +
    `var V=new Set(${idsJson});` +
    `try{` +
    `var s=window.localStorage.getItem(K);` +
    `if(s&&V.has(s)&&s!==S)` +
    `document.documentElement.setAttribute('data-theme',s);` +
    `}catch(e){}` +
    `})();`
  );
}

const ANTI_FLASH_SCRIPT = buildAntiFlashScript(STORAGE_KEY, THEME_IDS, DEFAULT_THEME_ID);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is intentional: the anti-flash script mutates
    // data-theme on <html> before React hydrates, causing a controlled mismatch.
    // Suppressing at this element only; children are unaffected.
    // TODO(i18n): replace lang="en" with a dynamic locale once i18n is wired.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
