import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/i18n";
import { Base44Scripts } from "base44:document";
import { site } from "@/config/site";
import appCss from "@/index.css?url";

// Universal polyfill so legacy Base44 DB/analytics calls never throw on static hosting
if (typeof globalThis !== "undefined") {
  const entityMock = () => ({
    list: async () => [],
    filter: async () => [],
    get: async () => null,
    create: async (d) => ({ id: "mock_" + Date.now(), ...d }),
    update: async (id, d) => ({ id, ...d }),
    delete: async () => ({ ok: true }),
    deleteMany: async () => ({ ok: true }),
  });
  globalThis.__B44_DB__ = globalThis.__B44_DB__ || {
    auth: { isAuthenticated: async () => false, me: async () => null, hasToken: () => false },
    entities: new Proxy({}, { get: () => entityMock() }),
    integrations: { Core: { UploadFile: async () => ({ file_url: "" }), SendEmail: async () => ({}) } },
    analytics: { track: () => {} },
  };
}

const themeScript = `try{var t=localStorage.getItem("bnm-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;
const swScript = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})};`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} — one safe number every morning` },
      { name: "description", content: site.description },
      { name: "theme-color", content: "#F7F4D5" },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: "en_IN" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..700&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Outlet />
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}