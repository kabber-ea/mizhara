"use client";
import React from "react";
import Link from "next/link";
export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-tr from-accent-mint/30 via-accent-pink/40 to-secondary/30 py-20 sm:py-32">
            {/* Decorative Blur Spheres */}
            <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-secondary/35 blur-3xl" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="lg:col-span-7 text-left space-y-6">
                        {/* Tagline */}
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 text-xs font-semibold uppercase tracking-wider text-primary border border-border-custom shadow-xs animate-sparkle-pulse">
                            ✦ Dainty & Fancy Ornaments ✦
                        </span>
                        {/* Heading */}
                        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                            Sparkle in every <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-accent-gold">
                                fancy detail.
                            </span>
                        </h1>
                        {/* Subheading */}
                        <p className="text-sm text-muted-custom leading-relaxed max-w-xl">
                            Discover Mizhara’s exquisite fancy ornaments. Hand-curated anklets, customized nose pins, layering chains, and sparkling rings crafted to capture your unique elegance.
                        </p>
                        {/* CTA Actions */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href="/products"
                                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm tracking-wide rounded-xl shadow-md transition-all duration-200 shine-sweep text-center"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-accent-mint/30 text-primary-dark border border-border-custom font-semibold text-sm tracking-wide rounded-xl transition-all duration-200 text-center"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    {/* Right Column: Generated Luxury Banner */}
                    <div className="lg:col-span-5 relative flex justify-center">
                        <div className="relative aspect-square w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border-4 border-white shadow-2xl bg-accent-pink/15">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/fancy_ornaments_collection.png"
                                alt="Mizhara Fancy Ornaments Collection"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            {/* Corner Star Sparks */}
                            <div className="absolute top-3 right-3 animate-sparkle-pulse text-accent-gold text-lg">✦</div>
                            <div className="absolute bottom-3 left-3 animate-sparkle-pulse text-primary text-lg">✦</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Rotating Sparkling Star overlay */}
            <div className="hidden lg:block absolute top-1/4 right-20 text-accent-gold animate-bounce">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
                </svg>
            </div>
            <div className="hidden lg:block absolute bottom-1/4 left-20 text-primary animate-pulse">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
                </svg>
            </div>
        </section>
    );
}