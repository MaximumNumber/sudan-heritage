import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";

function SudanHeritageLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#FF3C00" />
      <path
        d="M18 7 L11 14 L11 22 L18 29 L25 22 L25 14 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="3.5" fill="white" />
      <path d="M18 10 L18 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 21.5 L18 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 13 L16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 20 L23.5 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23.5 13 L20 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20 L12.5 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang, t, isRTL } = useLanguage();
  const { settings } = useStoreSettings();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.shop") },
    { href: "/about", label: t("nav.ourStory") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <div className="group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <SudanHeritageLogo size={36} />
          </div>
          <span className="font-serif text-xl font-bold text-foreground">
            {settings.storeName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              data-testid={`nav-link-${link.href}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Language Toggle */}
          <div className="flex items-center border border-border rounded-full overflow-hidden text-sm font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 transition-colors ${
                lang === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              data-testid="lang-toggle-en"
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className={`px-3 py-1 transition-colors ${
                lang === "ar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              data-testid="lang-toggle-ar"
            >
              ع
            </button>
          </div>

          <Link href="/admin" data-testid="nav-link-admin">
            <Button
              variant="outline"
              size="sm"
              className="font-serif rounded-full border-primary/20 hover:bg-primary/5"
            >
              {t("nav.admin")}
            </Button>
          </Link>
        </nav>

        {/* Mobile right side: lang toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center border border-border rounded-full overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 transition-colors ${
                lang === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className={`px-2 py-1 transition-colors ${
                lang === "ar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ع
            </button>
          </div>
          <button
            className="p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t border-border bg-background absolute top-16 left-0 w-full shadow-lg ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-3 text-lg font-medium transition-colors hover:bg-muted ${
                  location === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-6 py-3">
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-center border-primary/20"
                >
                  {t("nav.adminAccess")}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
