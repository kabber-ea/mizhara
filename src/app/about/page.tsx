import React from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-accent-pink/10 px-3.5 py-1.5 rounded-full border border-border-custom shadow-3xs">
            Our Story ✦
          </span>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-primary-dark">
            About Mizhara
          </h1>
          <p className="text-xs text-muted-custom max-w-sm mx-auto leading-relaxed">
            Crafting the fine details that add a splash of fancy to your daily life.
          </p>
        </div>

        {/* Brand narrative block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-primary-dark">Daily Elegance</h2>
            <p className="text-xs text-muted-custom leading-relaxed">
              Mizhara was born from a simple observation: beautiful jewelry is often saved only for weddings, gala events, and special dinners. But what about the other 300 days of the year? We believed your everyday outfits deserved their own touch of charm.
            </p>
            <p className="text-xs text-muted-custom leading-relaxed">
              Our designers set out to create fancy, lightweight ornaments — chains that drape perfectly over simple tees, rings that stack effortlessly, waist chains that feel like a whisper, and hypoallergenic nose studs that shine all day.
            </p>
          </div>
          <div className="p-8 bg-accent-pink/10 border border-border-custom rounded-3xl text-center space-y-4">
            <span className="text-5xl animate-sparkle-pulse block">✨</span>
            <p className="font-serif italic text-xs text-foreground/80 leading-relaxed">
              "We don't make items to sit in a vault. We build sparkling accessories that walk with you on coffee runs, dinner dates, and ocean breezes."
            </p>
          </div>
        </div>

        {/* Quality USP Grid */}
        <div className="border-t border-border-custom/50 pt-10">
          <h3 className="font-serif text-lg font-bold text-center text-primary-dark mb-6">Our Material Standard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-border-custom rounded-2xl text-center space-y-2.5">
              <span className="text-2xl block">🥇</span>
              <h4 className="text-xs font-bold text-foreground">Anti-Tarnish Plating</h4>
              <p className="text-[10px] text-muted-custom">
                Triple-plated with 18k Rose Gold or Rhodium so your ornaments stay shiny without fading.
              </p>
            </div>
            <div className="p-5 bg-white border border-border-custom rounded-2xl text-center space-y-2.5">
              <span className="text-2xl block">🌿</span>
              <h4 className="text-xs font-bold text-foreground">Hypoallergenic Base</h4>
              <p className="text-[10px] text-muted-custom">
                Strictly nickel-free and lead-free bases, making them completely safe for highly sensitive skin.
              </p>
            </div>
            <div className="p-5 bg-white border border-border-custom rounded-2xl text-center space-y-2.5">
              <span className="text-2xl block">💎</span>
              <h4 className="text-xs font-bold text-foreground">AAA Cubic Zirconia</h4>
              <p className="text-[10px] text-muted-custom">
                Hand-cut, high-refraction crystals that capture sunlight with dazzling clarity.
              </p>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="text-center pt-8 border-t border-border-custom/50 space-y-4">
          <h3 className="font-serif text-xl font-bold text-primary-dark">Ready to Discover Your Signature Sparkle?</h3>
          <div className="flex justify-center gap-4">
            <Link
              href="/products"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
