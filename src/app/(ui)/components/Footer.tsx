"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-accent-mint/30 border-t border-border-custom mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Philosophy */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-widest text-primary-dark font-extrabold">
              MIZHARA<span className="text-primary">✦</span>
            </h3>
            <p className="text-xs text-muted-custom leading-relaxed max-w-xs">
              Mizhara designs fancy, chic ornaments for the modern dreamer. From sparkling anklets to delicate nose pins, our creations celebrate dynamic personality and playful style.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 bg-white rounded-full border border-border-custom text-primary hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-white rounded-full border border-border-custom text-primary hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.01 3.796.046 1.077.049 1.664.228 2.083.386.556.217.973.483 1.392.901.418.419.685.836.902 1.393.158.417.328 1.004.377 2.082.047 1.013.047 1.348.047 3.797 0 2.43-.01 2.784-.047 3.796-.049 1.077-.228 1.664-.386 2.083-.217.556-.483.973-.901 1.392-.419.418-.836.686-1.393.902-.417.158-1.004.329-2.082.378-1.013.047-1.348.047-3.797.047-2.43 0-2.784-.01-3.796-.047-1.077-.049-1.664-.228-2.083-.386-.556-.217-.973-.483-1.392-.901-.418-.419-.685-.836-.902-1.393-.158-.417-.329-1.004-.378-2.082-.047-1.013-.047-1.348-.047-3.797 0-2.43.01-2.784.047-3.796.049-1.077.228-1.664.386-2.083.217-.556.483-.973.901-1.392.419-.418.836-.686 1.393-.902.417-.158 1.004-.329 2.082-.378 1.013-.047 1.348-.047 3.797-.047M12 2C9.307 2 9.037 2.01 7.97 2.059c-1.127.051-1.97.23-2.678.506a4.84 4.84 0 00-1.748 1.138 4.84 4.84 0 00-1.137 1.749c-.276.708-.455 1.55-.506 2.678C1.902 8.784 1.9 9.177 1.9 12c0 2.822.002 3.216.059 4.316.051 1.127.23 1.97.506 2.679a4.84 4.84 0 001.137 1.748 4.84 4.84 0 001.749 1.138c.708.276 1.55.455 2.678.506 1.1.057 1.493.059 4.316.059 2.822 0 3.216-.002 4.316-.059 1.128-.051 1.97-.23 2.679-.506a4.84 4.84 0 001.748-1.138 4.84 4.84 0 001.138-1.749c.276-.708.455-1.55.506-2.679.057-1.1.059-1.493.059-4.316 0-2.822-.002-3.216-.059-4.316-.051-1.127-.23-1.97-.506-2.679a4.84 4.84 0 00-1.138-1.748 4.84 4.84 0 00-1.749-1.138c-.708-.276-1.55-.455-2.679-.506C15.016 2.009 14.623 2 12 2z" />
                  <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-white rounded-full border border-border-custom text-primary hover:bg-primary hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-primary-dark">Quick Shop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=Rings" className="text-muted-custom hover:text-primary transition-colors">Fancy Rings</Link>
              </li>
              <li>
                <Link href="/products?category=Anklets" className="text-muted-custom hover:text-primary transition-colors">Shimmering Anklets</Link>
              </li>
              <li>
                <Link href="/products?category=Chains" className="text-muted-custom hover:text-primary transition-colors">Layering Chains</Link>
              </li>
              <li>
                <Link href="/products?category=Waist%20Chains" className="text-muted-custom hover:text-primary transition-colors">Waist Chains</Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-primary-dark">Information</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="text-muted-custom hover:text-primary transition-colors">Customer Care</Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-custom hover:text-primary transition-colors">Admin Dashboard</Link>
              </li>
              <li>
                <span className="text-muted-custom">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-primary-dark">Join the Glow</h4>
            <p className="text-xs text-muted-custom leading-relaxed">
              Subscribe to get exclusive previews of new fancy ornaments and sparkle updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                required
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border-custom rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-wider rounded-lg transition-colors shadow-xs"
              >
                {subscribed ? "Subscribed! ✦" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border-custom/50 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-muted-custom">
          <p>© {new Date().getFullYear()} Mizhara Store. Handcrafted with love.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
