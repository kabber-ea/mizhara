import { useEffect, useRef, useState } from "react";

export type SortOption = { value: string; label: string };

interface SortDropdownProps {
  value: string;
  options: readonly SortOption[];
  onChange: (value: string) => void;
}

function SortIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden className="shrink-0">
      <rect x="0" y="1" width="18" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="6.25" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="11.5" width="6" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

export default function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark hover:text-primary transition-colors cursor-pointer"
      >
        <span>{current.label.toUpperCase()}</span>
        <SortIcon />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 top-full mt-2 z-30 min-w-[13.5rem] bg-white border border-border-custom shadow-[0_4px_20px_rgba(42,36,32,0.08)] py-2"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-5 py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                  active
                    ? "text-primary-dark border-b border-primary-dark/25"
                    : "text-muted-custom hover:text-primary-dark hover:bg-accent-pink/30"
                }`}
              >
                {opt.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
