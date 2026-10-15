import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getNeonClient } from "../api/neon";
import ProductCard from "../components/ProductCard";
import { Filter, ShoppingBag } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const client = await getNeonClient();

        // 1. Fetch Categories
        const { data: catData } = await client
          .from("categories")
          .select("*")
          .order("name");

        if (catData) setCategories(catData);

        // 2. Fetch Products
        const { data: prodData } = await client
          .from("products")
          .select("*")
          .order("id");

        if (prodData) {
          // Map category_name if missing
          const mapped = prodData.map((p) => {
            if (!p.category_name && p.category_id && catData) {
              const cat = catData.find((c) => c.id === p.category_id);
              return { ...p, category_name: cat ? cat.name : "Uncategorized" };
            }
            return p;
          });
          setProducts(mapped);
        }
      } catch (e) {
        console.warn("Shop catalog load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const handleCategorySelect = (category) => {
    if (category === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) =>
            (p.category_name || "").toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto animate-fade-in">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Our Wellness Collection
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sustainably sourced botanicals, pure organic oils, and sacred daily tools.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "All"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="font-heading text-lg font-bold text-foreground">No Products Found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try selecting a different category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
