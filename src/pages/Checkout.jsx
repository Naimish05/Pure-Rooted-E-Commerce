import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getNeonClient } from "../api/neon";
import { ShoppingBag, CheckCircle, ShieldCheck, Truck, ArrowLeft } from "lucide-react";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xs">
          <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground">Sign In to Checkout</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 mb-6">
            Please log in or create an account to complete your purchase and track your orders.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/login?return=/checkout"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-xs hover:opacity-90 transition-all text-center"
            >
              Sign In
            </Link>
            <Link
              to="/signup?return=/checkout"
              className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-medium transition-all text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center animate-fade-in">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-xs">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Order Confirmed!</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Thank you for your order. We have received your request and are preparing your wellness package.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-muted/30 border border-border text-left space-y-1.5 text-xs">
            <p className="text-muted-foreground">
              Order ID: <span className="font-mono font-bold text-foreground">{orderSuccess.id}</span>
            </p>
            <p className="text-muted-foreground">
              Total Amount: <span className="font-bold text-foreground">₹{orderSuccess.total_amount}</span>
            </p>
            <p className="text-muted-foreground">
              Delivery to: <span className="font-medium text-foreground">{orderSuccess.address}, {orderSuccess.city}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/profile"
              className="py-3 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="py-3 px-6 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h2 className="font-heading text-2xl font-bold text-foreground">Your Cart is Empty</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await getNeonClient();

      // 1. Insert Order
      const { data: order, error: orderErr } = await client
        .from("orders")
        .insert([
          {
            user_id: user.id,
            email: user.email,
            full_name: fullName,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zip: zip,
            total_amount: cartTotal,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert Order Items
      const itemsPayload = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      await client.from("order_items").insert(itemsPayload);

      // 3. Clear cart & show success
      clearCart();
      setOrderSuccess(order);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shopping
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">Delivery Information</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 98765 43210"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Flat, House no., Building, Street"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Mumbai"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                placeholder="Maharashtra"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">PIN Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
                placeholder="400001"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center gap-3 text-xs text-muted-foreground mt-4">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <span>Cash on Delivery (COD) / Pay on Delivery available for all orders.</span>
          </div>
        </div>

        {/* Order Summary (1 col) */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-5">
          <h2 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">Order Summary</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="font-semibold text-muted-foreground">{item.quantity}x</span>
                  <span className="font-medium text-foreground truncate">{item.title}</span>
                </div>
                <span className="font-semibold text-foreground">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-primary font-bold">FREE</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Placing Order..." : "Confirm & Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
