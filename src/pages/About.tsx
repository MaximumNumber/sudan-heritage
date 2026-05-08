import { PageTransition } from "@/components/layout/PageTransition";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetaTags } from "@/hooks/useMetaTags";

export default function About() {
  const { t } = useLanguage();
  useMetaTags({
    title: "Our Story",
    description: "Learn about Sudan Heritage — our vision, how we source authentic Sudanese goods, and our promise to you.",
  });

  return (
    <PageTransition className="bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900" />
        <img
          src="https://picsum.photos/seed/africamarket2024/2000/600"
          alt="Sudanese culture"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
              {t("about.title")}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-20 max-w-4xl mx-auto">
        <div className="prose prose-lg prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed mx-auto">
          <p className="text-2xl font-serif text-foreground leading-snug mb-10 text-center">
            {t("about.quote")}
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">
            {t("about.visionTitle")}
          </h2>
          <p>{t("about.vision1")}</p>
          <p>{t("about.vision2")}</p>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">
            {t("about.sourcingTitle")}
          </h2>
          <p>{t("about.sourcing1")}</p>
          <p>{t("about.sourcing2")}</p>

          <div className="my-16 bg-muted p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
              {t("about.whyWhatsappTitle")}
            </h3>
            <p className="mb-0">{t("about.whyWhatsapp")}</p>
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-primary">
            {t("about.promiseTitle")}
          </h2>
          <p>{t("about.promise1")}</p>
          <p>{t("about.promise2")}</p>
        </div>
      </div>
    </PageTransition>
  );
}
