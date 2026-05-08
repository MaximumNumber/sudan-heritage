import { Link } from "wouter";
import { Product } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { SmartImage } from "@/components/SmartImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const { settings } = useStoreSettings();
  const isAr = lang === "ar";

  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    isAr && product.descriptionAr ? product.descriptionAr : product.description;

  const displayCategory = isAr
    ? settings.categoryTranslations?.[product.category] ||
      t(`categories.${product.category}`) ||
      product.category
    : product.category;

  return (
    <Link href={`/products/${product.id}`} data-testid={`card-product-${product.id}`}>
      <Card className="overflow-hidden group cursor-pointer border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <SmartImage
            src={product.imageUrl}
            alt={displayName}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
          />
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground font-semibold">
              {t("common.featured")}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
          >
            {displayCategory}
          </Badge>
        </div>
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            <span className="font-bold text-primary whitespace-nowrap text-lg" dir="ltr">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-2 flex-grow">
            {displayDesc}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
