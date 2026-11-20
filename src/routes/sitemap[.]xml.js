import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";

const PATHS = [
  { path: "/", priority: "1.0", freq: "weekly" },
  { path: "/safe-to-spend-calculator", priority: "0.9", freq: "weekly" },
  { path: "/old-vs-new-tax-regime-calculator", priority: "0.9", freq: "weekly" },
  { path: "/in-hand-salary-calculator", priority: "0.9", freq: "weekly" },
  { path: "/sip-calculator", priority: "0.9", freq: "weekly" },
  { path: "/hra-calculator", priority: "0.9", freq: "weekly" },
  { path: "/companies", priority: "0.8", freq: "monthly" },
  { path: "/privacy", priority: "0.4", freq: "yearly" },
  { path: "/terms", priority: "0.4", freq: "yearly" },
  { path: "/grievance", priority: "0.4", freq: "yearly" },
];

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PATHS.map(
    (entry) => `  <url>
    <loc>${site.url}${entry.path === "/" ? "/" : entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.freq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemap(), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});