import { useState, useEffect, useCallback } from "react";
import { Product, initialProducts } from "../data/products";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { deleteImage, isServerImageUrl } from "@/lib/imageStorage";

async function loadFromSupabase(): Promise<Product[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("createdAt", { ascending: false });
  if (error || !data) return null;
  return data as Product[];
}

async function saveToSupabase(products: Product[]): Promise<void> {
  const { error: delErr } = await supabase
    .from("products")
    .delete()
    .neq("id", "__never__");
  if (delErr) throw new Error(delErr.message);
  if (products.length > 0) {
    const { error: insErr } = await supabase.from("products").insert(products);
    if (insErr) throw new Error(insErr.message);
  }
}

async function loadFromApi(): Promise<Product[] | null> {
  try {
    const res = await fetch("/api/products");
    if (res.ok) return (await res.json()) as Product[];
  } catch {
  }
  try {
    const res = await fetch("/data/products.json");
    if (res.ok) return (await res.json()) as Product[];
  } catch {
  }
  return null;
}

async function saveToApi(products: Product[]): Promise<void> {
  const token = localStorage.getItem("sudanese-store-admin-session");
  const res = await fetch("/api/save-products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-admin-token": token } : {}),
    },
    body: JSON.stringify(products),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Server error (${res.status})`);
  }
}

function deleteImageIfOwned(imgUrl: string): void {
  if (!imgUrl) return;
  if (isServerImageUrl(imgUrl)) {
    deleteImage(imgUrl).catch(() => {});
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (isSupabaseConfigured ? loadFromSupabase() : loadFromApi())
      .then((data) => {
        setProducts(data ?? initialProducts);
        setIsLoaded(true);
      })
      .catch(() => {
        setProducts(initialProducts);
        setIsLoaded(true);
      });
  }, []);

  const saveProducts = useCallback(async (newProducts: Product[]): Promise<void> => {
    setProducts(newProducts);
    if (isSupabaseConfigured) {
      await saveToSupabase(newProducts);
    } else {
      await saveToApi(newProducts);
    }
  }, []);

  const addProduct = useCallback(
    async (productData: Omit<Product, "id" | "createdAt">) => {
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const newProducts = [newProduct, ...products];
      await saveProducts(newProducts);
      return newProduct;
    },
    [products, saveProducts]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const existing = products.find((p) => p.id === id);
      if (
        updates.imageUrl !== undefined &&
        existing?.imageUrl &&
        existing.imageUrl !== updates.imageUrl
      ) {
        deleteImageIfOwned(existing.imageUrl);
      }
      const newProducts = products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      await saveProducts(newProducts);
    },
    [products, saveProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (product?.imageUrl) deleteImageIfOwned(product.imageUrl);
      const newProducts = products.filter((p) => p.id !== id);
      await saveProducts(newProducts);
    },
    [products, saveProducts]
  );

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const importProducts = useCallback(
    async (data: Product[]) => {
      await saveProducts(data);
    },
    [saveProducts]
  );

  return {
    products,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    importProducts,
  };
}
