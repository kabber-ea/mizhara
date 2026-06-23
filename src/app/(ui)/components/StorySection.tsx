"use client";
import React from "react";
import Link from "next/link";
export default function StorySection() {
    return (
        <section className="py-20 bg-accent-pink/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-mint/10 rounded-full blur-3xl" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="space-y-6">
                        <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-white px-3 py-1 rounded-full border border-border-custom shadow-2xs">
                            Mizhara Philosophy ✦
                        </span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-dark">
                            Dainty Ornaments Crafted for Everyday Sparkle
                        </h2>
                        <p className="text-xs text-muted-custom leading-relaxed">
                            We believe ornaments aren’t just accessories for special events — they are a daily expression of your inner light. Each piece at Mizhara is thoughtfully designed to be incredibly lightweight, hypoallergenic, and elegantly fancy.
                        </p>
                        <p className="text-xs text-muted-custom leading-relaxed">
                            Whether you are accenting a casual look with our Sweetheart Anklet or standing out with a Celestial Starlet Chain, we assure premium sterling silver base detailing, triple-plated finish, and high-shine cubic zirconia that rival fine diamonds.
                        </p>
                        {/* Quality USP Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center space-x-3">
                                <span className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">✓</span>
                                <span className="text-xs font-semibold text-foreground">Anti-Tarnish Polish</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">✓</span>
                                <span className="text-xs font-semibold text-foreground">Skin-friendly Sterling Base</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">✓</span>
                                <span className="text-xs font-semibold text-foreground">Free Global Shipping</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">✓</span>
                                <span className="text-xs font-semibold text-foreground">Chic Premium Packing</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-hover border-b border-primary hover:border-primary-hover pb-1 transition-all"
                            >
                                Questions? Get in touch &rarr;
                            </Link>
                        </div>
                    </div>
                    {/* Right Column: Dynamic Visual Showcase */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-border-custom shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/15 rounded-bl-full" />
                            <div className="space-y-6 relative z-10">
                                {/* Quote block */}
                                <span className="text-3xl text-primary animate-sparkle-pulse font-serif">“</span>
                                <p className="font-serif italic text-sm text-foreground/80 leading-relaxed -mt-4">
                                    My waist chain and nose stud from Mizhara always get noticed. They are so delicate, sparkling, and don't irritate my sensitive skin at all. I am absolutely obsessed!
                                </p>
                                <div className="flex items-center space-x-3 border-t border-border-custom/50 pt-4">
                                    <div className="h-10 w-10 rounded-full bg-accent-mint flex items-center justify-center text-xs font-bold text-primary-dark">
                                        AR
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-foreground">Alisha R.</h4>
                                        <p className="text-[10px] text-muted-custom">Verified Sparkler</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}