import { Link } from "react-router-dom";

export default function ShopCTA() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(201,160,99,0.12)_0%,transparent_60%),linear-gradient(180deg,var(--background)_0%,var(--secondary)_100%)]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-custom mb-4">Your Next Favourite Piece</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-light text-primary-dark leading-snug">
          Ready to find something that sparkles with you?
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent w-16 mx-auto my-6" />
        <p className="text-sm text-muted-custom font-light leading-relaxed mb-8">
          Explore the full Mizhara collection — rings, chains, anklets, nose pins and more.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/products"
            className="w-full sm:w-auto min-w-[200px] px-10 py-3.5 bg-primary-dark text-white text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-primary transition-colors shine-sweep"
          >
            Shop Collection
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto min-w-[200px] px-10 py-3.5 border border-primary-dark/30 text-primary-dark text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-white transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
