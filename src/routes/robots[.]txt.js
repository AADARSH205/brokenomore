import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=3600",
            },
          },
        ),
    },
  },
});