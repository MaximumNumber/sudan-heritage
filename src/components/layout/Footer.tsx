import { Link } from "wouter";
import { MessageCircle } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useLanguage } from "@/contexts/LanguageContext";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello! I'd like to place a direct order from " + settings.storeName + "."
    );
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  function toAbsoluteUrl(url: string): string {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  const socialLinks = [
    { url: settings.facebookUrl, icon: <FacebookIcon />, label: "Facebook" },
    { url: settings.instagramUrl, icon: <InstagramIcon />, label: "Instagram" },
    { url: settings.xUrl, icon: <XIcon />, label: "X" },
  ]
    .filter((s) => s.url)
    .map((s) => ({ ...s, url: toAbsoluteUrl(s.url) }));

  return (
    <footer className="bg-muted py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-foreground mb-4 inline-block"
          >
            {settings.storeName}
          </Link>
          <p className="text-muted-foreground max-w-sm">{settings.storeDescription}</p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-foreground">{t("footer.explore")}</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.shopAll")}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.ourStory")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-foreground">{t("footer.contactSection")}</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 text-[#25D366] hover:underline font-medium transition-colors"
                data-testid="footer-link-whatsapp"
              >
                <MessageCircle size={16} />
                {t("footer.directOrders")}
              </button>
            </li>
            <li className="text-sm">{settings.whatsappNumber}</li>
            <li className="text-sm">{settings.location}</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} {settings.storeName}.{" "}
          {t("footer.rights")}
        </span>
        <span>
          {t("footer.developedBy")}{" "}
          <a
            href="https://v3xlrm1nowo1.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Mohammed Khalil
          </a>
        </span>
      </div>
    </footer>
  );
}
