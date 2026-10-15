import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/assets/Logo.webp" alt="Pure Rooted" className="h-8 w-auto object-contain" />
              <span className="font-heading text-lg font-semibold text-foreground">Pure Rooted</span>
            </div>
            <p className="mt-3 max-w-xs text-xs md:text-sm text-muted-foreground leading-relaxed">
              Natural wellness products rooted in science and ancient wisdom. Nourish your body, calm your mind.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=Essential%20Oils" className="hover:text-primary transition-colors">Essential Oils</Link>
              </li>
              <li>
                <Link to="/shop?category=Skincare" className="hover:text-primary transition-colors">Skincare</Link>
              </li>
              <li>
                <Link to="/shop?category=Herbal%20Teas" className="hover:text-primary transition-colors">Herbal Teas</Link>
              </li>
              <li>
                <Link to="/shop?category=Rituals%20%26%20Tools" className="hover:text-primary transition-colors">Rituals & Tools</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/about#contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Pure Rooted. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
