import { useParams, Link } from "wouter";
import { ArrowLeft, MessageCircle, MapPin, ShieldCheck, Tag, Share2, Check } from "lucide-react";
import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetaTags } from "@/hooks/useMetaTags";
import { SmartImage } from "@/components/SmartImage";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProductById, isLoaded, products } = useProducts();
  const { t, lang } = useLanguage();
  const product = id ? getProductById(id) : null;
  const [shared, setShared] = useState(false);

  const isAr = lang === "ar";

  const displayNameForMeta = product ? (isAr && product.nameAr ? product.nameAr : product.name) : "";
  const displayDescForMeta = product ? (isAr && product.descriptionAr ? product.descriptionAr : product.description) : "";

  useMetaTags(
    product
      ? {
          title: displayNameForMeta,
          description: displayDescForMeta,
          image: product.imageUrl,
          type: "product",
        }
      : {}
  );

  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const name = isAr && product.nameAr ? product.nameAr : product.name;
    const desc = isAr && product.descriptionAr ? product.descriptionAr : product.description;
    const shortDesc = desc.length > 120 ? desc.slice(0, 117) + "…" : desc;
    const shareTitle = `${name} — Sudan Heritage`;
    const shareText = `${name}\n$${product.price.toFixed(2)}\n\n${shortDesc}\n\nView product:`;
    const clipboardText = `${shareTitle}\n\n${shareText}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch {
        // user dismissed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(clipboardText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!isLoaded) {
    return (
      <PageTransition className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <Skeleton className="w-full lg:w-1/2 aspect-square rounded-2xl" />
          <div className="w-full lg:w-1/2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full mt-8" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">{t("product.notFound")}</h1>
        <p className="text-muted-foreground mb-8">{t("product.notFoundText")}</p>
        <Link href="/products">
          <Button>{t("product.returnToShop")}</Button>
        </Link>
      </PageTransition>
    );
  }

  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const displayCategory = isAr
    ? t(`categories.${product.category}`) || product.category
    : product.category;

  const generateWhatsAppLink = () => {
    const message = `Hello! I'm interested in ordering the "${product.name}" priced at $${product.price.toFixed(2)}. Is it available?`;
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = product.whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <PageTransition className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("product.backToCollection")}
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 rounded-full border-border/60"
            data-testid="button-share-product"
          >
            {shared ? (
              <>
                <Check size={15} className="text-green-500" />
                <span className="text-green-600 text-xs">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={15} />
                <span className="text-xs">Share</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-lg">
              <SmartImage
                src={product.imageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <Badge className="absolute top-4 left-4 text-sm px-3 py-1 bg-secondary text-secondary-foreground font-semibold">
                  {t("common.featured")}
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5"
              >
                {displayCategory}
              </Badge>
              {product.quantity > 0 ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600/30 bg-green-600/5"
                >
                  {t("product.inStock")} ({product.quantity})
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-destructive border-destructive/30 bg-destructive/5"
                >
                  {t("product.outOfStock")}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
              {displayName}
            </h1>

            <p className="text-3xl font-semibold text-primary mb-8" dir="ltr">
              ${product.price.toFixed(2)}
            </p>

            <div className="prose prose-p:text-muted-foreground prose-p:leading-relaxed mb-10 max-w-none">
              <p className="text-lg">{displayDesc}</p>
            </div>

            <div className="space-y-6 mb-10 border-y border-border py-8">
              <div className="flex items-center gap-4 text-muted-foreground">
                <MapPin className="text-primary h-6 w-6 flex-shrink-0" />
                <span>{t("product.worldwide")}</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <ShieldCheck className="text-primary h-6 w-6 flex-shrink-0" />
                <span>{t("product.authentic")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  size="lg"
                  className="w-full text-lg py-8 rounded-xl shadow-xl hover:shadow-2xl transition-all bg-[#25D366] hover:bg-[#1ebd57] text-white flex gap-3"
                  disabled={product.quantity === 0}
                  data-testid="button-order-whatsapp"
                >
                  <MessageCircle size={24} />
                  {product.quantity === 0
                    ? t("product.outOfStock")
                    : t("product.orderWhatsApp")}
                </Button>
              </a>

              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="w-full gap-2 rounded-xl"
              >
                {shared ? (
                  <>
                    <Check size={18} className="text-green-500" />
                    Link Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    Share This Product
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("product.handling")}
            </p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-border">
            <div className="flex items-center gap-2 mb-8">
              <Tag className="text-primary" />
              <h2 className="text-2xl font-serif font-bold">
                {t("product.relatedTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => {
                const rName = isAr && p.nameAr ? p.nameAr : p.name;
                return (
                  <Link key={p.id} href={`/products/${p.id}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                        <SmartImage
                          src={p.imageUrl}
                          alt={rName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-serif font-semibold text-lg">{rName}</h3>
                      <p className="text-primary font-bold" dir="ltr">
                        ${p.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
