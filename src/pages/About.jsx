import { Leaf, Sparkles, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16 animate-fade-in">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
          Our Philosophy
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
          Rooted in Nature, Grounded in Science
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Pure Rooted was born from a desire to bring mindful, pure, and intentional self-care rituals back into everyday modern life.
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-card border border-border p-6 md:p-10 rounded-3xl animate-fade-in card-hover-lift">
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-border">
          <img
            src="/assets/hero-wellness.jpg"
            alt="Botanical herbs"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">Our Story</h2>
          <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
            We believe wellness shouldn't be complicated or artificial. True nourishment comes from respecting the natural rhythm of our bodies and honoring ingredients harvested sustainably with love.
          </p>
          <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
            Every bottle of oil, herbal tea blend, and handcrafted massage tool is ethically crafted to inspire tranquility, health, and a deep connection with mother nature.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center card-hover-lift animate-fade-in delay-100">
          <Leaf className="h-8 w-8 text-primary mb-3 transition-transform hover:scale-110" />
          <h3 className="font-heading text-base font-bold text-foreground">100% Organic</h3>
          <p className="text-xs text-muted-foreground mt-1">Ethically sourced, preservative-free, and wild-harvested botanicals.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center card-hover-lift animate-fade-in delay-200">
          <Sparkles className="h-8 w-8 text-primary mb-3 transition-transform hover:scale-110" />
          <h3 className="font-heading text-base font-bold text-foreground">Time-Tested Rituals</h3>
          <p className="text-xs text-muted-foreground mt-1">Formulations inspired by centuries-old Ayurvedic traditions.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center card-hover-lift animate-fade-in delay-300">
          <ShieldCheck className="h-8 w-8 text-primary mb-3 transition-transform hover:scale-110" />
          <h3 className="font-heading text-base font-bold text-foreground">Cruelty Free</h3>
          <p className="text-xs text-muted-foreground mt-1">Never tested on animals, 100% vegan, and eco-friendly packaging.</p>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="rounded-3xl border border-border bg-card/60 p-8 md:p-10 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-foreground">Get in Touch</h2>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
          Have questions about our botanical products or your wellness routine? We are always here to help.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> support@purerooted.com
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Mumbai, India
          </div>
        </div>
      </div>
    </div>
  );
}
