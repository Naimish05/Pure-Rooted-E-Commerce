import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, User, LogOut, Shield, Package, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { cartCount, toggleCart } = useCart();
  const { user, profile, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const displayName = profile?.full_name || user?.name || user?.email?.split("@")[0] || "User";

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* Left: Logo */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/Logo.webp" alt="Pure Rooted" className="h-8 md:h-10 w-auto object-contain" />
            <span className="font-heading text-lg md:text-xl font-semibold text-foreground">Pure Rooted</span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex items-center gap-2 justify-center">
          <Link
            to="/"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive("/") ? "bg-secondary text-primary font-semibold" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive("/shop") ? "bg-secondary text-primary font-semibold" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Shop
          </Link>
          <Link
            to="/about"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive("/about") ? "bg-secondary text-primary font-semibold" : "text-muted-foreground hover:text-primary"
            }`}
          >
            About
          </Link>
        </div>

        {/* Right Actions: Cart & Profile */}
        <div className="flex justify-end items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-xs md:text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Slot */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted text-sm font-medium text-foreground transition-colors cursor-pointer">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Hi, {displayName.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 w-56 opacity-0 scale-95 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto">
                <div className="rounded-2xl border border-border bg-card shadow-xl p-2 flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-muted text-primary transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" /> Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <Package className="h-3.5 w-3.5" /> My Orders
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border hover:bg-muted text-xs md:text-sm font-medium text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex w-full items-center justify-around border-t border-border bg-background/50 py-2 backdrop-blur-sm md:hidden">
        <Link to="/" className={`text-xs font-medium ${isActive("/") ? "text-primary font-bold" : "text-muted-foreground"}`}>
          Home
        </Link>
        <Link to="/shop" className={`text-xs font-medium ${isActive("/shop") ? "text-primary font-bold" : "text-muted-foreground"}`}>
          Shop
        </Link>
        <Link to="/about" className={`text-xs font-medium ${isActive("/about") ? "text-primary font-bold" : "text-muted-foreground"}`}>
          About
        </Link>
      </div>
    </nav>
  );
}
