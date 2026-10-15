import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNeonClient } from "../api/neon";
import { useCart } from "../context/CartContext";
import { ShoppingBag, ArrowLeft, Check, Plus, Minus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const client = await getNeonClient();
        const { data, error } = await client
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setProduct(data);
        }
      } catch (e) {
        console.warn("Product detail fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">The product you are looking for does not exist.</p>
        <Link
          to="/shop"
          className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const cartItem = cartItems.find((item) => item.id === product.id);
  const isOutOfStock = !product.in_stock && product.in_stock !== undefined;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      {/* Back Link */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Collection
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card p-6 md:p-10 rounded-3xl border border-border shadow-xs animate-scale-in">
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
          <img
            src={product.image_url || "/assets/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <span className="bg-card px-4 py-1.5 rounded-full text-xs font-bold text-foreground shadow-sm">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
            {product.category_name || "Wellness"}
          </p>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            {product.title}
          </h1>

          <p className="text-2xl font-bold text-foreground mb-6">
            ₹{Number(product.price).toFixed(2)}
          </p>

          <div className="h-px bg-border my-2"></div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 mt-4">
            Description
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-8">
            {product.description || "Ethically formulated with 100% pure ingredients for your natural wellness journey."}
          </p>

          {/* Action Box */}
          <div className="mt-auto">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-muted text-muted-foreground text-sm font-bold uppercase cursor-not-allowed"
              >
                Currently Out of Stock
              </button>
            ) : cartItem ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-xl bg-muted/40 p-1">
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-background text-foreground transition-all cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 text-sm font-bold">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-background text-foreground transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" /> Added to your Cart
                </span>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
