import { Link } from "wouter";
import { ArrowRight, Star, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/PageTransition";
import { useProducts } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useMetaTags } from "@/hooks/useMetaTags";

export default function Home() {
  const { products, isLoaded } = useProducts();
  const { settings } = useStoreSettings();
  const { t } = useLanguage();
  useMetaTags({
    title: settings.storeName,
    description: settings.storeDescription,
  });

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/45 z-10" />
          <img
            src="https://picsum.photos/seed/spicemarket2024/1600/900"
            alt="Spice market in Sudan"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900" />
        </div>

        <div className="container relative z-20 px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {t("home.heroTitle1")}{" "}
              <span className="text-secondary">{t("home.heroTitleHighlight")}</span>
              {t("home.heroTitle2")}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-10 font-light drop-shadow-md">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
                  data-testid="button-shop-collection"
                >
                  {t("home.shopCollection")}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                  data-testid="button-our-story"
                >
                  {t("home.ourStory")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center px-4 pt-4 md:pt-0">
              <Star className="text-primary mb-3" size={32} />
              <h3 className="font-serif font-semibold text-xl mb-2">{t("home.authenticOrigins")}</h3>
              <p className="text-muted-foreground text-sm">{t("home.authenticOriginsText")}</p>
            </div>
            <div className="flex flex-col items-center px-4 pt-4 md:pt-0">
              <Heart className="text-primary mb-3" size={32} />
              <h3 className="font-serif font-semibold text-xl mb-2">{t("home.handcrafted")}</h3>
              <p className="text-muted-foreground text-sm">{t("home.handcraftedText")}</p>
            </div>
            <div className="flex flex-col items-center px-4 pt-4 md:pt-0">
              <ShieldCheck className="text-primary mb-3" size={32} />
              <h3 className="font-serif font-semibold text-xl mb-2">{t("home.directTrusted")}</h3>
              <p className="text-muted-foreground text-sm">{t("home.directTrustedText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                {t("home.featuredTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                {t("home.featuredSubtitle")}
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center text-primary font-medium hover:underline gap-1"
            >
              {t("home.viewAll")} <ArrowRight size={16} />
            </Link>
          </div>

          {!isLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full">
                {t("home.viewAllProducts")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-foreground mb-12">
            {t("home.shopByCategory")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {settings.categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
              >
                <div className="px-8 py-4 bg-card rounded-full shadow-sm border border-border hover:border-primary/50 hover:shadow-md hover:text-primary transition-all font-medium text-lg cursor-pointer">
                  {category}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 bg-card overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-tl-full rounded-br-full -rotate-6 transform scale-105" />
              <img
                src="https://picsum.photos/seed/sudaneselandscape/1000/1000"
                alt="Sudanese landscape"
                className="relative z-10 w-full h-auto aspect-square object-cover rounded-tl-[100px] rounded-br-[100px] shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/landscape2024/1000/1000";
                }}
              />
            </div>
            <div className="flex-1 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                {t("home.moreTitle")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("home.moreText1").replace("%s", settings.storeName)}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("home.moreText2")}
              </p>
              <Link href="/about">
                <Button size="lg" className="rounded-full px-8">
                  {t("home.readOurStory")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
