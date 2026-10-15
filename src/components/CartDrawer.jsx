import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Content */}
      <div className="relative z-[70] w-full max-w-md h-full bg-card shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-semibold text-foreground">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-heading text-base font-medium text-foreground">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Explore our wellness collection to add items.</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/shop");
                }}
                className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl border border-border bg-background/50">
                <img
                  src={item.image_url || "/assets/placeholder.svg"}
                  alt={item.title}
                  className="h-16 w-16 object-cover rounded-xl border border-border"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading text-xs font-bold text-foreground line-clamp-1">{item.title}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-primary">₹{Number(item.price).toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-border rounded-full bg-muted/40">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-5 w-5 flex items-center justify-center hover:bg-background rounded-full transition-colors"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-5 w-5 flex items-center justify-center hover:bg-background rounded-full transition-colors"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
              <span className="font-heading text-lg font-bold text-foreground">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate("/checkout");
              }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
