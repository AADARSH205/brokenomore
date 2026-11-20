import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageToggle({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`min-h-[44px] min-w-[44px] rounded-full px-3 py-2 transition-all ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`min-h-[44px] min-w-[44px] rounded-full px-3 py-2 transition-all ${
          language === "hi"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        HI
      </button>
    </div>
  );
}
