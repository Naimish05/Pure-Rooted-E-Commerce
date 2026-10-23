import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNeonClient } from "../api/neon";
import ProductCard from "../components/ProductCard";
import { ArrowRight, Sparkles, Leaf, Heart } from "lucide-react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const client = await getNeonClient();
        const { data, error } = await client
          .from("products")
          .select("*")
          .limit(6);

        if (!error && data) {
          setFeaturedProducts(data);
        }
      } catch (e) {
        console.warn("Home data fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { name: "Essential Oils", emoji: "🌿", desc: "Pure, therapeutic-grade oils" },
    { name: "Skincare", emoji: "✨", desc: "Rooted in ancient beauty rituals" },
    { name: "Herbal Teas", emoji: "🍵", desc: "Organic blends to calm & heal" },
    { name: "Rituals & Tools", emoji: "🧘", desc: "Sacred tools for self-care" },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/hero-wellness.jpg"
            alt="Natural wellness products"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 flex min-h-125 flex-col items-center justify-center py-20 text-center">
          <h1 className="max-w-3xl font-heading text-4xl font-bold text-white md:text-6xl drop-shadow-xs animate-fade-in">
            Wellness, <span className="italic text-secondary">Rooted</span> in Nature
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 drop-shadow-xs animate-fade-in delay-150">
            Nourish your body with pure, ethically sourced wellness products. From essential oils to herbal teas — everything your ritual needs.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-8 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer animate-fade-in delay-300"
          >
            Browse Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Explore Categories</h2>
          <p className="mt-2 text-sm text-muted-foreground">Crafted for body, mind, and spirit</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={`group p-5 rounded-2xl border border-border bg-card/60 hover:bg-card card-hover-lift text-center flex flex-col items-center justify-center cursor-pointer animate-fade-in delay-${(idx + 1) * 75}`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
              <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hand-picked rituals for everyday wellbeing</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 animate-fade-in">
        <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-12 shadow-xs">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-card card-hover-lift">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground">100% Pure & Ethical</h3>
              <p className="text-xs text-muted-foreground mt-1">Sustainably wild-harvested and verified organic ingredients.</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-card card-hover-lift">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground">Ancient Wisdom</h3>
              <p className="text-xs text-muted-foreground mt-1">Rooted in holistic Ayurveda and natural alchemy traditions.</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-card card-hover-lift">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground">Mindful Wellbeing</h3>
              <p className="text-xs text-muted-foreground mt-1">Designed to calm the mind and revitalize the spirit daily.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
