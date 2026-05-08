import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { useProducts } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { useMetaTags } from "@/hooks/useMetaTags";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const { products, isLoaded } = useProducts();
  const { settings } = useStoreSettings();
  const { t, lang } = useLanguage();
  useMetaTags({
    title: "Our Collection",
    description: "Browse our full collection of authentic Sudanese spices, crafts, textiles, natural products, and more.",
  });

  const [rawSearch, setRawSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [searchQuery, setSearchQuery] = useState(rawSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "All";
  });

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 200;
    return Math.ceil(Math.max(...products.map((p) => p.price)));
  }, [products]);

  const [sliderValue, setSliderValue] = useState<[number, number]>([0, 200]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isLoaded) {
      setSliderValue([0, maxPrice]);
      setPriceRange([0, maxPrice]);
    }
  }, [isLoaded, maxPrice]);

  // Debounce search input — only filter after user pauses typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(rawSearch);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter((product) => {
      const nameEn = product.name.toLowerCase();
      const nameAr = (product.nameAr || "").toLowerCase();
      const descEn = product.description.toLowerCase();
      const descAr = (product.descriptionAr || "").toLowerCase();
      const matchesSearch =
        !q ||
        nameEn.includes(q) ||
        nameAr.includes(q) ||
        descEn.includes(q) ||
        descAr.includes(q);
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = useCallback(() => {
    setRawSearch("");
    setSearchQuery("");
    setSelectedCategory("All");
    setSliderValue([0, maxPrice]);
    setPriceRange([0, maxPrice]);
    setCurrentPage(1);
  }, [maxPrice]);

  const hasActiveFilters =
    rawSearch !== "" ||
    selectedCategory !== "All" ||
    sliderValue[0] !== 0 ||
    sliderValue[1] !== maxPrice;

  const getCategoryLabel = (cat: string) => {
    if (lang === "ar") {
      const dynamic = settings.categoryTranslations?.[cat];
      if (dynamic) return dynamic;
      const tr = t(`categories.${cat}`);
      return tr !== `categories.${cat}` ? tr : cat;
    }
    return cat;
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-foreground">{t("products.categories")}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("All")}
            className="rounded-full"
          >
            {t("products.all")}
          </Button>
          {settings.categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
              data-testid={`button-category-${category}`}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-foreground">{t("products.priceRange")}</h3>
          <span className="text-sm font-medium tabular-nums" dir="ltr">
            ${sliderValue[0]} – ${sliderValue[1]}
          </span>
        </div>
        {/* Always render slider LTR to prevent reversed thumb behaviour in Arabic mode */}
        <div dir="ltr">
          <Slider
            value={[sliderValue[0], sliderValue[1]]}
            max={maxPrice}
            step={1}
            onValueChange={(val) =>
              setSliderValue([val[0], val[1]] as [number, number])
            }
            onValueCommit={(val) => {
              setPriceRange([val[0], val[1]] as [number, number]);
            }}
            className="mb-2"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-medium"
          data-testid="button-reset-filters"
        >
          <RotateCcw size={15} />
          {t("products.resetFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <PageTransition className="bg-muted/10">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              {t("products.title")}
            </h1>
            <p className="text-muted-foreground">{t("products.subtitle")}</p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("products.searchPlaceholder")}
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                className="pl-9 bg-background"
                data-testid="input-search"
              />
              {rawSearch && (
                <button
                  onClick={() => setRawSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className={`md:hidden flex gap-2 ${hasActiveFilters ? "border-primary text-primary" : ""}`}
                >
                  <Filter className="h-4 w-4" /> {t("products.filterProducts")}
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mb-8">
                  <SheetTitle>{t("products.filterProducts")}</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-fit pr-6 border-r border-border">
            <FilterContent />
          </aside>

          <div className="flex-1">
            {!isLoaded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-xl border border-border border-dashed">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("products.noProducts")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("products.noProductsText")}
                </p>
                <Button onClick={resetFilters} className="gap-2">
                  <RotateCcw size={15} />
                  {t("products.clearFilters")}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center border-t border-border pt-8 mt-auto">
                    <p className="text-sm text-muted-foreground mb-4" dir="ltr">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredProducts.length
                      )}{" "}
                      / {filteredProducts.length} {t("products.productsLabel")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
                      >
                        {t("products.previous")}
                      </Button>
                      <div className="flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => setCurrentPage(page)}
                            data-testid={`button-page-${page}`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        {t("products.next")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
