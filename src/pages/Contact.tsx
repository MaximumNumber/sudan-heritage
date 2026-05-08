import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetaTags } from "@/hooks/useMetaTags";

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

export default function Contact() {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();
  useMetaTags({
    title: "Contact Us",
    description: "Get in touch with Sudan Heritage. Reach us via WhatsApp, email, or social media.",
  });

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hello! I have a question about " + settings.storeName + " store."
    );
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  function toAbsoluteUrl(url: string): string {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  const socialLinks = [
    {
      url: settings.facebookUrl,
      icon: <FacebookIcon />,
      label: "Facebook",
      color: "hover:text-[#1877F2] hover:border-[#1877F2]/40",
    },
    {
      url: settings.instagramUrl,
      icon: <InstagramIcon />,
      label: "Instagram",
      color: "hover:text-[#E1306C] hover:border-[#E1306C]/40",
    },
    {
      url: settings.xUrl,
      icon: <XIcon />,
      label: "X",
      color: "hover:text-foreground hover:border-foreground/40",
    },
  ]
    .filter((s) => s.url)
    .map((s) => ({ ...s, url: toAbsoluteUrl(s.url) }));

  return (
    <PageTransition className="bg-muted/20">
      <div className="container px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* WhatsApp */}
            <Card className="border-border shadow-sm bg-card">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-[#25D366] h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">
                    {t("contact.whatsappTitle")}
                  </h3>
                  <p className="text-muted-foreground mb-1">
                    {t("contact.whatsappText")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    {settings.whatsappNumber}
                  </p>
                  <Button
                    onClick={handleWhatsAppClick}
                    className="bg-[#25D366] hover:bg-[#1ebd57] text-white"
                    data-testid="button-whatsapp-contact"
                  >
                    {t("contact.chatButton")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-border shadow-sm bg-card">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">
                    {t("contact.emailTitle")}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {t("contact.emailText")}
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-primary font-medium hover:underline"
                    data-testid="link-email"
                  >
                    {settings.email}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Location & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-border shadow-sm bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <MapPin className="text-primary mb-3 h-6 w-6" />
                  <h4 className="font-bold mb-1">{t("contact.locationLabel")}</h4>
                  <p className="text-sm text-muted-foreground">{settings.location}</p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm bg-card">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Clock className="text-primary mb-3 h-6 w-6" />
                  <h4 className="font-bold mb-1">{t("contact.hoursLabel")}</h4>
                  <p className="text-sm text-muted-foreground">{settings.hours}</p>
                </CardContent>
              </Card>
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <Card className="border-border shadow-sm bg-card">
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-4">
                    {t("contact.followUs")}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {socialLinks.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground transition-colors ${s.color}`}
                      >
                        {s.icon}
                        <span className="text-sm font-medium">{s.label}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Image */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-orange-700 to-yellow-800" />
            <img
              src="https://picsum.photos/seed/sudanesetea2024/600/900"
              alt="Pouring Sudanese tea"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                  {t("contact.hospitalityTitle")}
                </h3>
                <p className="text-white/80">{t("contact.hospitalityText")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
