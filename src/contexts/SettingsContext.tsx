import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  email: string;
  location: string;
  hours: string;
  categories: string[];
  categoryTranslations: Record<string, string>;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Sudan Heritage",
  storeDescription:
    "Bringing the authentic warmth, rich textures, and traditional craftsmanship of Sudan directly to your home. Hand-selected with love and pride.",
  whatsappNumber: "+249912345678",
  email: "hello@sudanheritage.example.com",
  location: "Omdurman Souq, Khartoum, Sudan",
  hours: "Sat - Thu, 9:00 AM - 6:00 PM (CAT)",
  categories: ["Spices", "Textiles", "Crafts", "Natural Products", "Food", "Jewelry", "Other"],
  categoryTranslations: {
    Spices: "التوابل",
    Textiles: "المنسوجات",
    Crafts: "الحرف اليدوية",
    "Natural Products": "المنتجات الطبيعية",
    Food: "الطعام",
    Jewelry: "المجوهرات",
    Other: "أخرى",
  },
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
};

const SETTINGS_ROW_KEY = "store";

function mergeSettings(data: Partial<StoreSettings>): StoreSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    categoryTranslations: {
      ...DEFAULT_SETTINGS.categoryTranslations,
      ...(data.categoryTranslations ?? {}),
    },
  };
}

async function loadFromSupabase(): Promise<StoreSettings | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_ROW_KEY)
    .maybeSingle();
  if (error || !data) return null;
  return data.value as StoreSettings;
}

async function persistToSupabase(settings: StoreSettings): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key: SETTINGS_ROW_KEY, value: settings }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

async function loadFromApi(): Promise<StoreSettings | null> {
  try {
    const res = await fetch("/api/settings");
    if (res.ok) return (await res.json()) as StoreSettings;
  } catch {
  }
  try {
    const res = await fetch("/data/settings.json");
    if (res.ok) return (await res.json()) as StoreSettings;
  } catch {
  }
  return null;
}

async function persistToApi(settings: StoreSettings): Promise<void> {
  const token = localStorage.getItem("sudanese-store-admin-session");
  const res = await fetch("/api/save-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-admin-token": token } : {}),
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Server error (${res.status})`);
  }
}

interface SettingsContextValue {
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
  importSettings: (data: StoreSettings) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const loadSettings = useCallback(async () => {
    const data = isSupabaseConfigured
      ? await loadFromSupabase()
      : await loadFromApi();
    if (data) setSettings(mergeSettings(data));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<StoreSettings>): Promise<void> => {
      const next = await new Promise<StoreSettings>((resolve) => {
        setSettings((prev) => {
          const n = { ...prev, ...updates };
          resolve(n);
          return n;
        });
      });
      if (isSupabaseConfigured) {
        await persistToSupabase(next);
      } else {
        await persistToApi(next);
      }
    },
    []
  );

  const importSettings = useCallback(async (data: StoreSettings): Promise<void> => {
    const merged = mergeSettings(data);
    setSettings(merged);
    if (isSupabaseConfigured) {
      await persistToSupabase(merged);
    } else {
      await persistToApi(merged);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, importSettings, reloadSettings: loadSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useStoreSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useStoreSettings must be used inside SettingsProvider");
  return ctx;
}
