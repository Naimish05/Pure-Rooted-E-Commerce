import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNeonClient } from "../api/neon";
import {
  Package,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Shield,
  X,
  DollarSign,
  Tag,
  Search,
  Filter,
  RefreshCw,
  FolderPlus,
  Layers
} from "lucide-react";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    title: "",
    price: "",
    category_id: "",
    badge: "",
    image_url: "",
    description: "",
    in_stock: true,
  });

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadAllData = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const client = await getNeonClient();

      // 1. Categories
      const { data: catData, error: catErr } = await client
        .from("categories")
        .select("*")
        .order("name");
      if (!catErr && catData) setCategories(catData);

      // 2. Products
      const { data: prodData, error: prodErr } = await client
        .from("products")
        .select("*")
        .order("id");
      if (!prodErr && prodData) {
        const mapped = prodData.map((p) => {
          if (!p.category_name && p.category_id && catData) {
            const cat = catData.find((c) => c.id === p.category_id);
            return { ...p, category_name: cat ? cat.name : "Uncategorized" };
          }
          return p;
        });
        setProducts(mapped);
      }

      // 3. Orders
      const { data: ordData, error: ordErr } = await client
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!ordErr && ordData) setOrders(ordData);
    } catch (err) {
      console.error("Admin data load error:", err);
      setMessage({ type: "error", text: "Failed to load dashboard data: " + err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (isAdmin && mounted) {
        await loadAllData();
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [isAdmin, loadAllData]);

  // ==========================================
  // Category Handlers (Add & Delete)
  // ==========================================
  const handleOpenCategoryModal = () => {
    setCategoryFormData({ name: "", slug: "" });
    setCategoryModalOpen(true);
  };

  const handleCategoryNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setCategoryFormData({ name, slug });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    setSaveLoading(true);
    try {
      const client = await getNeonClient();
      const newCatId = `cat-${Date.now().toString().slice(-6)}`;
      const payload = {
        id: newCatId,
        name: categoryFormData.name.trim(),
        slug: categoryFormData.slug || categoryFormData.name.toLowerCase().trim().replace(/\s+/g, "-"),
      };

      const { error } = await client
        .from("categories")
        .insert([payload])
        .select();

      if (error) throw error;

      setMessage({ type: "success", text: `Category "${payload.name}" created successfully!` });
      setCategoryModalOpen(false);
      await loadAllData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to create category: " + err.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const assignedProductsCount = products.filter((p) => p.category_id === cat.id).length;
    const confirmMessage = assignedProductsCount > 0
      ? `Are you sure you want to delete category "${cat.name}"? It currently contains ${assignedProductsCount} product(s) which will become uncategorized.`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const client = await getNeonClient();
      
      // 1. Delete category from Neon
      const { error } = await client.from("categories").delete().eq("id", cat.id);
      if (error) throw error;

      // 2. Unassign from products if any
      if (assignedProductsCount > 0) {
        await client
          .from("products")
          .update({ category_id: null, category_name: "Uncategorized" })
          .eq("category_id", cat.id);
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setProducts((prev) =>
        prev.map((p) =>
          p.category_id === cat.id ? { ...p, category_id: null, category_name: "Uncategorized" } : p
        )
      );
      setMessage({ type: "success", text: `Category "${cat.name}" deleted successfully.` });
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  // ==========================================
  // Product Handlers (Add, Edit, Delete, Stock)
  // ==========================================
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        title: product.title || "",
        price: product.price || "",
        category_id: product.category_id || "",
        badge: product.badge || "",
        image_url: product.image_url || "",
        description: product.description || "",
        in_stock: product.in_stock !== false,
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        title: "",
        price: "",
        category_id: categories[0]?.id || "",
        badge: "",
        image_url: "",
        description: "",
        in_stock: true,
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const client = await getNeonClient();
      const selectedCat = categories.find((c) => c.id === productFormData.category_id);

      const payload = {
        title: productFormData.title.trim(),
        price: parseFloat(productFormData.price),
        category_id: productFormData.category_id || null,
        category_name: selectedCat ? selectedCat.name : "Uncategorized",
        badge: productFormData.badge.trim() || null,
        image_url: productFormData.image_url.trim() || "/assets/placeholder.svg",
        description: productFormData.description.trim() || null,
        in_stock: productFormData.in_stock,
      };

      if (editingProduct) {
        const { error } = await client
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        setMessage({ type: "success", text: `Product "${payload.title}" updated successfully!` });
      } else {
        const newId = `p-${Date.now().toString().slice(-4)}`;
        const { error } = await client
          .from("products")
          .insert([{ id: newId, ...payload }]);
        if (error) throw error;
        setMessage({ type: "success", text: `Product "${payload.title}" created successfully!` });
      }

      setProductModalOpen(false);
      await loadAllData();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save product" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete product "${title || id}"?`)) return;

    try {
      const client = await getNeonClient();
      const { error } = await client.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ type: "success", text: `Product deleted successfully.` });
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleToggleStock = async (product) => {
    try {
      const client = await getNeonClient();
      const newStock = !product.in_stock;
      const { error } = await client
        .from("products")
        .update({ in_stock: newStock })
        .eq("id", product.id);

      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, in_stock: newStock } : p))
      );
    } catch (err) {
      alert("Failed to update stock: " + err.message);
    }
  };

  // ==========================================
  // Order Handlers
  // ==========================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const client = await getNeonClient();
      const { data, error } = await client
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Database blocked the update (RLS permissions). Please verify Neon SQL Editor.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setMessage({ type: "success", text: `Order #${orderId.slice(0, 8)} status updated to "${newStatus}"` });
    } catch (err) {
      alert("Failed to update order: " + err.message);
    }
  };

  // Status Badge Helper (Botanical Heritage Design System Palette)
  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "completed":
        return "bg-emerald-500/12 text-emerald-800 border-emerald-500/25";
      case "shipped":
        return "bg-blue-500/12 text-blue-800 border-blue-500/25";
      case "processing":
        return "bg-purple-500/12 text-purple-800 border-purple-500/25";
      case "cancelled":
        return "bg-rose-500/12 text-rose-800 border-rose-500/25";
      default:
        return "bg-[#bc7746]/15 text-[#8f5022] border-[#bc7746]/30";
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xs animate-fade-in">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h2 className="font-heading text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground mt-2 mb-6">
            You must be signed in with an administrator account to view the Pure Rooted Dashboard.
          </p>
          <Link
            to="/login?return=/admin"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all inline-block"
          >
            Sign in as Admin
          </Link>
        </div>
      </div>
    );
  }

  // Derived filtered items
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      productCategoryFilter === "All" ||
      (p.category_name || "").toLowerCase() === productCategoryFilter.toLowerCase();
    const matchesSearch =
      productSearch === "" ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "All" ||
      (o.status || "pending").toLowerCase() === orderStatusFilter.toLowerCase();
    const matchesSearch =
      orderSearch === "" ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.full_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.city || "").toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const outOfStockCount = products.filter((p) => !p.in_stock).length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                Botanical Admin Studio
              </h1>
              <p className="text-xs text-muted-foreground">
                Store inventory, category taxonomy, and customer fulfillment
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadAllData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-all cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenCategoryModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary text-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-primary" />
            New Category
          </button>
          <button
            onClick={() => handleOpenProductModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/25"
              : "bg-destructive/10 text-destructive border border-destructive/25"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:opacity-70 rounded-full transition-opacity cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Botanical Heritage Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 card-hover-lift shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-[#345a4b]/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate">
              Total Revenue
            </span>
            <span className="font-heading text-xl font-bold text-foreground">
              ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 card-hover-lift shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate">
              Total Orders
            </span>
            <span className="font-heading text-xl font-bold text-foreground">
              {orders.length}
            </span>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 card-hover-lift shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate">
              Catalog Items
            </span>
            <span className="font-heading text-xl font-bold text-foreground">
              {products.length}
            </span>
          </div>
        </div>

        {/* Categories Count & Stock */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 card-hover-lift shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-[#bc7746]/10 text-[#bc7746] flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate">
              Categories / Stock Alert
            </span>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold text-foreground">
                {categories.length}
              </span>
              {outOfStockCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-bold">
                  {outOfStockCount} out of stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Products & Inventory
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="h-4 w-4" />
          Categories
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Customer Orders
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
            {orders.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PRODUCTS & INVENTORY */}
      {/* ======================================================== */}
      {activeTab === "products" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or ID..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-center">In Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url || "/assets/placeholder.svg"}
                              alt={p.title}
                              className="h-10 w-10 rounded-lg object-cover border border-border shrink-0 bg-muted/20"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground block truncate max-w-50 md:max-w-70">
                                {p.title}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[10px]">
                            {p.category_name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          ₹{Number(p.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {p.badge ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#bc7746]/10 text-[#bc7746] font-bold text-[9px] uppercase tracking-wider">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                              p.in_stock
                                ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.in_stock ? "bg-emerald-600" : "bg-destructive"
                              }`}
                            />
                            {p.in_stock ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CATEGORIES MANAGEMENT (NEW FEATURE) */}
      {/* ======================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Product Taxonomy & Categories
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organize your wellness offerings into clean collections.
              </p>
            </div>
            <button
              onClick={handleOpenCategoryModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          {/* Categories Grid / Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.category_id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-card border border-border shadow-xs card-hover-lift flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#345a4b]/10 text-primary flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-heading text-base font-bold text-foreground">
                          {cat.name}
                        </h4>
                        <span className="font-mono text-[10px] text-muted-foreground block">
                          slug: {cat.slug || cat.id}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Assigned Products</span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-muted text-[11px] text-foreground">
                      {productCount} item{productCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CUSTOMER ORDERS */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-4 animate-fade-in">
          {/* Orders Filter Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order ID, name, city..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
              {["All", "Pending", "Processing", "Shipped", "Completed", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter.toLowerCase() === st.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-foreground block">
                            #{o.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString()} {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-foreground block">
                            {o.full_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {o.email}
                          </span>
                          {o.phone && (
                            <span className="text-[10px] text-muted-foreground">
                              {o.phone}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-foreground block truncate max-w-50">
                            {o.address}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {o.city}{o.state ? `, ${o.state}` : ""} {o.zip}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-heading text-sm font-bold text-primary">
                            ₹{Number(o.total_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                                o.status
                              )}`}
                            >
                              {o.status || "Pending"}
                            </span>
                            <select
                              value={o.status || "pending"}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-border bg-background text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full cursor-pointer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Product Title</label>
                <input
                  type="text"
                  required
                  value={productFormData.title}
                  onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                  placeholder="e.g. Pure Himalayan Rosemary Oil"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="999.00"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={productFormData.category_id}
                    onChange={(e) => setProductFormData({ ...productFormData, category_id: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Badge (Optional)</label>
                  <input
                    type="text"
                    value={productFormData.badge}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    placeholder="e.g. Bestseller, Pure, New"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Image URL</label>
                  <input
                    type="text"
                    value={productFormData.image_url}
                    onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                    placeholder="/assets/Products/product-oil.webp"
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows="3"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Holistic botanical benefits, ingredients, and ritual usage instructions..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prod-in-stock"
                  checked={productFormData.in_stock}
                  onChange={(e) => setProductFormData({ ...productFormData, in_stock: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
                />
                <label htmlFor="prod-in-stock" className="text-xs font-medium text-foreground cursor-pointer">
                  Available in Stock
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CATEGORY (NEW FEATURE) */}
      {/* ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Add New Category
                </h2>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full cursor-pointer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="e.g. Aromatherapy & Mists"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">URL Slug</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="aromatherapy-mists"
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <p className="text-[10px] text-muted-foreground">
                  Used for clean collection URLs (e.g. /shop?category=...)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
