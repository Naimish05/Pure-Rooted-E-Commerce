import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNeonClient } from "../api/neon";
import { User, Package, Calendar, LogOut, ArrowRight, Shield } from "lucide-react";

export default function Profile() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login?return=/profile");
      return;
    }

    async function fetchOrders() {
      try {
        setLoading(true);
        const client = await getNeonClient();
        const { data, error } = await client
          .from("orders")
          .select("*, order_items(*, products(*))")
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch (e) {
        console.warn("Orders fetch error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  const displayName = profile?.full_name || user?.name || user?.email?.split("@")[0] || "User";

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "completed" || s === "delivered") {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
    if (s === "shipped") {
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xs card-hover-lift">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">{displayName}</h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all"
            >
              <Shield className="h-3.5 w-3.5" /> Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="px-4 py-2 rounded-xl border border-border text-destructive hover:bg-destructive/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-xl font-bold text-foreground">My Order History</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-muted/40 animate-pulse border border-border" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-border bg-card/40">
            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <h3 className="font-heading text-base font-bold text-foreground">No Orders Yet</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">When you place an order, it will appear here.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
            >
              Start Shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-5 md:p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3 card-hover-lift animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Order ID
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <div className="text-muted-foreground">
                    Delivering to: <span className="font-medium text-foreground">{order.address}, {order.city}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px]">Total Amount</span>
                    <span className="font-heading text-base font-bold text-primary">₹{Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
