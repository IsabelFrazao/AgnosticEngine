import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "@/src/env";
import "./globals.css";
import { ThemeProvider, STORAGE_KEY } from "@/src/lib/theme/theme-context";
import { DEFAULT_THEME_ID, THEME_IDS } from "@/src/lib/theme/themes";
import { SITE_CONFIG } from "@/src/lib/site-config";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { Sidebar } from "@/src/components/organisms/Sidebar";
import { getLayout } from "@/src/lib/services/layout";
import { getAuthorizedNavManifest } from "@/src/lib/services/pages";
import { getCurrentUserPermissions } from "@/src/lib/services/current-user";
import "@/src/registry/registered-actions";

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

const shellLayout = getLayout();

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUserPermissions = await getCurrentUserPermissions();
  const navManifest = getAuthorizedNavManifest([...currentUserPermissions]);

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
      <Script id="theme-init" strategy="beforeInteractive">
        {ANTI_FLASH_SCRIPT}
      </Script>
      <body className="flex h-full">
        <QueryProvider>
          <ThemeProvider>
            {/* Law of Derivation: sidebar nav is derived from the pages manifest.
                NAV_MANIFEST is computed server-side; extras come from layout config. */}
            <Sidebar
              navManifest={navManifest}
              extras={shellLayout.sidebar.extras}
            />
            <div className="flex min-h-full flex-1 flex-col overflow-y-auto">
              {children}
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
