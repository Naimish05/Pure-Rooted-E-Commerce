import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Plus, Minus } from "lucide-react";

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find((item) => item.id === product.id);
  const isOutOfStock = !product.in_stock && product.in_stock !== undefined;

  return (
    <div
      className={`group rounded-xl border border-border bg-card animate-fade-in card-hover-lift flex flex-col h-full ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-primary aspect-square"
      >
        <img
          src={product.image_url || "/assets/placeholder.svg"}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-card/90 px-3 py-1 rounded-full text-[10px] font-bold text-foreground shadow-sm">
              SOLD OUT
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title - Single line with truncate */}
        <Link
          to={`/product/${product.id}`}
          className="outline-none focus-visible:underline hover:underline block"
          title={product.title}
        >
          <h3 className="font-heading text-sm font-semibold text-foreground truncate">
            {product.title}
          </h3>
        </Link>

        {/* Tag - Below product title */}
        {product.badge ? (
          <div className="mt-1.5 flex items-center min-h-[20px]">
            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {product.badge}
            </span>
          </div>
        ) : (
          <div className="mt-1.5 min-h-[20px]" />
        )}

        {/* Price & Action Button */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border/40">
          <span className="text-sm font-semibold text-foreground">
            ₹{Number(product.price).toFixed(2)}
          </span>

          {isOutOfStock ? (
            <button
              disabled
              className="flex h-8 px-3 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-not-allowed text-[10px] font-bold uppercase tracking-wider"
            >
              Out of Stock
            </button>
          ) : cartItem ? (
            <div className="flex h-8 items-center rounded-full border border-border bg-muted/40 px-1">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="mx-2 min-w-[12px] text-center text-xs font-semibold tabular-nums">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-xs transition-all cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
