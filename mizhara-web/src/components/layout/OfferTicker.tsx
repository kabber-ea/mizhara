import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOfferTickerText } from "@/lib/offer-label";
import type { Offer } from "@/types/offer";

const ROTATE_MS = 4500;
const FADE_MS = 280;

interface OfferTickerProps {
  offers: Offer[];
}

export default function OfferTicker({ offers }: OfferTickerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (offers.length <= 1) return;
    let swapTimer: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setVisible(false);
      swapTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % offers.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(swapTimer);
    };
  }, [offers.length]);

  if (!offers.length) return null;

  const offer = offers[index];
  const href = offer.code ? `/cart?code=${encodeURIComponent(offer.code)}` : "/products";

  return (
    <div className="w-full bg-primary-dark border-b border-primary-dark">
      <Link
        to={href}
        className="block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center hover:bg-primary-dark/95 transition-colors"
      >
        <p
          className={`text-[11px] sm:text-xs font-medium tracking-[0.1em] text-white/90 transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {getOfferTickerText(offer)}
        </p>
      </Link>
    </div>
  );
}
