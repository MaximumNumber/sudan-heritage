import { useState, useRef, useCallback, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Copy, Check, Lock, LogOut,
  Settings, Shield, Tag, ImagePlus, Link2, Eye, EyeOff, X, Save,
  Upload, Database, AlertTriangle,
} from "lucide-react";
import { serverLogin, serverLogout, serverChangePassword, getSupabaseSession, onAuthStateChange } from "@/lib/adminToken";
import { isServerImageUrl } from "@/lib/imageStorage";
import { PageTransition } from "@/components/layout/PageTransition";
import { useProducts } from "@/hooks/useProducts";
import { useStoreSettings, StoreSettings } from "@/hooks/useStoreSettings";
import { uploadImageToServer } from "@/lib/imageStorage";
import { SmartImage } from "@/components/SmartImage";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ─── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await serverLogin(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      onLogin();
    } else {
      setError(result.error);
    }
  };

  return (
    <PageTransition className="flex items-center justify-center bg-muted/30 flex-1 py-20">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Enter your credentials to manage the store.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              data-testid="input-admin-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className={error ? "border-destructive pr-10" : "pr-10"}
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="button-admin-login"
          >
            {loading ? "Verifying..." : "Login"}
          </Button>
        </form>

      </div>
    </PageTransition>
  );
}

// ─── Product Form Dialog ────────────────────────────────────────────────────────

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  categories: string[];
  defaultWhatsapp: string;
  onSave: (data: Omit<Product, "id" | "createdAt">) => void;
}

function ProductFormDialog({
  open, onOpenChange, editingProduct, categories, defaultWhatsapp, onSave,
}: ProductFormProps) {
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = useCallback(() => ({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    category: categories[0] || "Other",
    imageUrl: "",
    quantity: "",
    whatsappNumber: defaultWhatsapp,
    featured: false,
  }), [categories, defaultWhatsapp]);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          nameAr: editingProduct.nameAr || "",
          description: editingProduct.description,
          descriptionAr: editingProduct.descriptionAr || "",
          price: editingProduct.price.toString(),
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl,
          quantity: editingProduct.quantity.toString(),
          whatsappNumber: editingProduct.whatsappNumber,
          featured: editingProduct.featured,
        });
        const isServer = isServerImageUrl(editingProduct.imageUrl);
        setImageSource(isServer ? "upload" : "url");
        setImagePreview(editingProduct.imageUrl);
      } else {
        setFormData(emptyForm());
        setImagePreview("");
        setImageSource("url");
      }
    }
  }, [open, editingProduct, emptyForm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToServer(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (err) {
      console.error("Upload failed:", err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      description: formData.description,
      descriptionAr: formData.descriptionAr || undefined,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      imageUrl:
        formData.imageUrl ||
        `https://picsum.photos/seed/${encodeURIComponent(formData.name)}/600/400`,
      quantity: parseInt(formData.quantity) || 0,
      whatsappNumber: formData.whatsappNumber,
      featured: formData.featured,
    });
    onOpenChange(false);
  };

  const currentPreview = imageSource === "url" ? formData.imageUrl : imagePreview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Image Section */}
          <div className="space-y-3">
            <Label>Product Image</Label>
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                size="sm"
                variant={imageSource === "url" ? "default" : "outline"}
                onClick={() => setImageSource("url")}
                className="gap-2"
              >
                <Link2 size={14} /> Image URL
              </Button>
              <Button
                type="button"
                size="sm"
                variant={imageSource === "upload" ? "default" : "outline"}
                onClick={() => setImageSource("upload")}
                className="gap-2"
              >
                <ImagePlus size={14} /> Upload Image
              </Button>
            </div>

            {imageSource === "url" ? (
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl.startsWith("data:") || isServerImageUrl(formData.imageUrl) ? "" : formData.imageUrl}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
                  setImagePreview(e.target.value);
                }}
                data-testid="input-image-url"
              />
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed h-12 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus size={16} />
                  {uploading
                    ? "Uploading..."
                    : imagePreview && imageSource === "upload"
                    ? "Change Image"
                    : "Choose an image file"}
                </Button>
                {uploading && (
                  <p className="text-xs text-muted-foreground mt-1">Saving image to server…</p>
                )}
              </div>
            )}

            {currentPreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={currentPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Product Name *</Label>
              <Input
                id="prod-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger id="prod-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-price">Price (USD) *</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                data-testid="input-product-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-qty">Quantity in Stock *</Label>
              <Input
                id="prod-qty"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                data-testid="input-product-quantity"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prod-whatsapp">WhatsApp Number</Label>
              <Input
                id="prod-whatsapp"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="+249912345678"
              />
              <p className="text-xs text-muted-foreground">
                Format: +[country code][number], e.g. +249912345678
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prod-desc">Description *</Label>
              <Textarea
                id="prod-desc"
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                data-testid="input-product-description"
              />
            </div>

            <div className="md:col-span-2 border-t border-border pt-4 mt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Arabic Translation (Optional)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="prod-name-ar">Product Name (Arabic)</Label>
                  <Input
                    id="prod-name-ar"
                    dir="rtl"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="اسم المنتج بالعربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-desc-ar">Description (Arabic)</Label>
                  <Textarea
                    id="prod-desc-ar"
                    dir="rtl"
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({ ...formData, descriptionAr: e.target.value })
                    }
                    placeholder="وصف المنتج بالعربية"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 md:col-span-2 bg-muted p-4 rounded-lg">
              <Switch
                id="prod-featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <div>
                <Label htmlFor="prod-featured" className="cursor-pointer font-medium">
                  Featured Product
                </Label>
                <p className="text-xs text-muted-foreground">
                  Featured products appear on the homepage.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading} data-testid="button-save-product">
              <Save size={16} className="mr-2" />
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const {
    products, addProduct, updateProduct, deleteProduct, importProducts,
  } = useProducts();
  const {
    settings, updateSettings, importSettings,
  } = useStoreSettings();
  const importProductsRef = useRef<HTMLInputElement>(null);
  const importSettingsRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const [newCategory, setNewCategory] = useState("");
  const [newCategoryAr, setNewCategoryAr] = useState("");
  const [editingTranslations, setEditingTranslations] = useState<Record<string, string>>({});

  const [secForm, setSecForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [secError, setSecError] = useState("");
  const [showSecPasswords, setShowSecPasswords] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteProduct(deletingId);
        toast({ title: "Product deleted." });
      } catch (err) {
        toast({ title: "Failed to delete product.", description: String(err), variant: "destructive" });
      }
    }
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleSaveProduct = async (data: Omit<Product, "id" | "createdAt">) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast({ title: "Product updated successfully." });
      } else {
        await addProduct(data);
        toast({ title: "Product added successfully." });
      }
    } catch (err) {
      toast({ title: "Failed to save product.", description: String(err), variant: "destructive" });
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setCopied(true);
    toast({ title: "Product data copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          await importProducts(data);
          toast({ title: `Imported ${data.length} products successfully.` });
        } else {
          toast({ title: "Invalid file format.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Failed to parse JSON file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data && typeof data === "object" && !Array.isArray(data)) {
          await importSettings(data);
          toast({ title: "Settings imported successfully." });
        } else {
          toast({ title: "Invalid settings file.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Failed to parse JSON file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const saveSettings = async () => {
    try {
      await updateSettings(settingsForm);
      toast({ title: "Store settings saved." });
    } catch (err) {
      toast({ title: "Failed to save settings.", description: String(err), variant: "destructive" });
    }
  };

  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (settings.categories.includes(trimmed)) {
      toast({ title: "Category already exists.", variant: "destructive" });
      return;
    }
    const arTrimmed = newCategoryAr.trim();
    const updatedTranslations = { ...settings.categoryTranslations };
    if (arTrimmed) updatedTranslations[trimmed] = arTrimmed;
    try {
      await updateSettings({
        categories: [...settings.categories, trimmed],
        categoryTranslations: updatedTranslations,
      });
      setNewCategory("");
      setNewCategoryAr("");
      toast({ title: `Category "${trimmed}" added.` });
    } catch (err) {
      toast({ title: "Failed to add category.", description: String(err), variant: "destructive" });
    }
  };

  const removeCategory = async (cat: string) => {
    if (settings.categories.length <= 1) {
      toast({ title: "You must keep at least one category.", variant: "destructive" });
      return;
    }
    const updatedTranslations = { ...settings.categoryTranslations };
    delete updatedTranslations[cat];
    try {
      await updateSettings({
        categories: settings.categories.filter((c) => c !== cat),
        categoryTranslations: updatedTranslations,
      });
      toast({ title: `Category "${cat}" removed.` });
    } catch (err) {
      toast({ title: "Failed to remove category.", description: String(err), variant: "destructive" });
    }
  };

  const saveCategoryTranslation = async (cat: string) => {
    const ar = (editingTranslations[cat] ?? settings.categoryTranslations?.[cat] ?? "").trim();
    try {
      await updateSettings({
        categoryTranslations: { ...settings.categoryTranslations, [cat]: ar },
      });
      toast({ title: `Translation for "${cat}" saved.` });
    } catch (err) {
      toast({ title: "Failed to save translation.", description: String(err), variant: "destructive" });
    }
  };

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecError("");
    if (!secForm.newPassword) {
      setSecError("Please enter a new password.");
      return;
    }
    if (secForm.newPassword.length < 8) {
      setSecError("New password must be at least 8 characters.");
      return;
    }
    if (secForm.newPassword !== secForm.confirmPassword) {
      setSecError("New passwords do not match.");
      return;
    }
    const result = await serverChangePassword(secForm.newPassword);
    if (result.ok) {
      setSecForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Credentials updated successfully." });
    } else {
      setSecError(result.error);
    }
  };

  return (
    <PageTransition className="bg-background">
      <div className="container px-4 pt-24 pb-32 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Store Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your inventory, settings, and account.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="gap-2 text-muted-foreground hover:text-destructive"
            data-testid="button-logout"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-8 bg-muted/50 p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="gap-2">
              Products
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings size={14} /> Store Settings
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag size={14} /> Categories
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database size={14} /> Data
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={14} /> Security
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ── */}
          <TabsContent value="products">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pr-8"
                  data-testid="input-admin-search"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={copyJson} className="gap-2">
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                  Copy JSON
                </Button>
                <Button onClick={openAddForm} className="gap-2" data-testid="button-add-product">
                  <Plus size={16} /> Add Product
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`admin-row-${product.id}`}>
                        <TableCell>
                          <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                            <SmartImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-center">
                          {product.featured ? (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Standard</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditForm(product)}
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit2 size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(product.id)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          {productSearch
                            ? "No products match your search."
                            : "No products yet. Click 'Add Product' to get started."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Store Settings Tab ── */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Update your store details. These appear on the website, contact page,
                  and footer. Changes are saved automatically to the server.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Store Name</Label>
                    <Input
                      value={settingsForm.storeName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, storeName: e.target.value })
                      }
                      data-testid="input-store-name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Store Description</Label>
                    <Textarea
                      rows={3}
                      value={settingsForm.storeDescription}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          storeDescription: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown in the footer of every page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="+249912345678"
                      data-testid="input-settings-whatsapp"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: +[country code][number]
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, email: e.target.value })
                      }
                      data-testid="input-settings-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={settingsForm.location}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, location: e.target.value })
                      }
                      data-testid="input-settings-location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Hours</Label>
                    <Input
                      value={settingsForm.hours}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, hours: e.target.value })
                      }
                      placeholder="e.g. Sat - Thu, 9:00 AM - 6:00 PM"
                      data-testid="input-settings-hours"
                    />
                  </div>

                  <div className="md:col-span-2 border-t border-border pt-6 mt-2">
                    <p className="text-sm font-semibold text-foreground mb-4">Social Media Links</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Facebook URL</Label>
                        <Input
                          value={settingsForm.facebookUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })
                          }
                          placeholder="https://facebook.com/yourpage"
                          data-testid="input-settings-facebook"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram URL</Label>
                        <Input
                          value={settingsForm.instagramUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                          }
                          placeholder="https://instagram.com/yourhandle"
                          data-testid="input-settings-instagram"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>X (Twitter) URL</Label>
                        <Input
                          value={settingsForm.xUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, xUrl: e.target.value })
                          }
                          placeholder="https://x.com/yourhandle"
                          data-testid="input-settings-x"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Leave blank to hide a social link.
                    </p>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <Button onClick={saveSettings} className="gap-2" data-testid="button-save-settings">
                      <Save size={16} /> Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Categories Tab ── */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Manage the categories available when adding or editing products.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-border">
                  <p className="text-sm font-semibold text-foreground">Add New Category</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">English Name *</label>
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Accessories"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addCategory(); }
                        }}
                        data-testid="input-new-category"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Arabic Translation (Optional)</label>
                      <Input
                        dir="rtl"
                        value={newCategoryAr}
                        onChange={(e) => setNewCategoryAr(e.target.value)}
                        placeholder="مثال: إكسسوارات"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addCategory(); }
                        }}
                      />
                    </div>
                  </div>
                  <Button onClick={addCategory} className="gap-2" data-testid="button-add-category">
                    <Plus size={16} /> Add Category
                  </Button>
                </div>

                {settings.categories.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No categories yet. Add one above.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Existing Categories</p>
                    {settings.categories.map((cat) => {
                      const currentAr =
                        editingTranslations[cat] !== undefined
                          ? editingTranslations[cat]
                          : settings.categoryTranslations?.[cat] ?? "";
                      return (
                        <div
                          key={cat}
                          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-4 bg-background rounded-xl border border-border"
                        >
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground font-medium">English Name</label>
                            <div className="flex items-center h-10 px-3 bg-muted rounded-md border border-border text-sm font-medium">
                              {cat}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground font-medium">Arabic Translation</label>
                            <Input
                              dir="rtl"
                              value={currentAr}
                              onChange={(e) =>
                                setEditingTranslations((prev) => ({
                                  ...prev,
                                  [cat]: e.target.value,
                                }))
                              }
                              placeholder="أضف ترجمة عربية..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); saveCategoryTranslation(cat); }
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => saveCategoryTranslation(cat)}
                            >
                              <Save size={13} /> Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCategory(cat)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              data-testid={`button-remove-category-${cat}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Data Tab ── */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Database size={18} /> How Data is Saved
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>All changes you make in this dashboard are <strong className="text-foreground">saved immediately to the server</strong> and reflected on the website for all visitors.</p>
                  <p>Products are stored in <code className="bg-muted px-1 rounded">public/data/products.json</code>, settings in <code className="bg-muted px-1 rounded">public/data/settings.json</code>, and uploaded images in <code className="bg-muted px-1 rounded">public/images/</code>.</p>
                  <p>You do not need to export or redeploy anything — changes take effect immediately.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload size={18} /> Import / Export Data
                  </CardTitle>
                  <CardDescription>
                    Import a previously exported JSON file to restore or overwrite your data. You can also copy the current product list as JSON.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2" onClick={copyJson}>
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    Copy Products JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => importProductsRef.current?.click()}
                  >
                    <Upload size={16} /> Import products.json
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => importSettingsRef.current?.click()}
                  >
                    <Upload size={16} /> Import settings.json
                  </Button>
                  <input
                    ref={importProductsRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportProducts}
                  />
                  <input
                    ref={importSettingsRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportSettings}
                  />
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle size={18} /> Reset to Default Data
                  </CardTitle>
                  <CardDescription>
                    This will overwrite the server data files with the initial default products and settings. This cannot be undone.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* ── Security Tab ── */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Credentials</CardTitle>
                <CardDescription>
                  Update your admin username and/or password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySave} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="sec-current">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="sec-current"
                        type={showSecPasswords ? "text" : "password"}
                        required
                        value={secForm.currentPassword}
                        onChange={(e) =>
                          setSecForm({ ...secForm, currentPassword: e.target.value })
                        }
                        data-testid="input-current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecPasswords((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showSecPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sec-newpass">
                      New Password{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (leave blank to keep current)
                      </span>
                    </Label>
                    <Input
                      id="sec-newpass"
                      type={showSecPasswords ? "text" : "password"}
                      value={secForm.newPassword}
                      onChange={(e) =>
                        setSecForm({ ...secForm, newPassword: e.target.value })
                      }
                      placeholder="Min. 8 characters"
                      data-testid="input-new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sec-confirm">Confirm New Password</Label>
                    <Input
                      id="sec-confirm"
                      type={showSecPasswords ? "text" : "password"}
                      value={secForm.confirmPassword}
                      onChange={(e) =>
                        setSecForm({ ...secForm, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password"
                      data-testid="input-confirm-password"
                    />
                  </div>

                  {secError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                      {secError}
                    </p>
                  )}

                  <Button type="submit" className="gap-2" data-testid="button-save-security">
                    <Shield size={16} /> Update Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingProduct={editingProduct}
        categories={settings.categories}
        defaultWhatsapp={settings.whatsappNumber}
        onSave={handleSaveProduct}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    getSupabaseSession().then((session) => {
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });
    const sub = onAuthStateChange((loggedIn) => {
      setIsAuthenticated(loggedIn);
      setAuthChecked(true);
    });
    return () => sub.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await serverLogout();
    setIsAuthenticated(false);
  };

  if (!authChecked) return null;

  return isAuthenticated ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  );
}
