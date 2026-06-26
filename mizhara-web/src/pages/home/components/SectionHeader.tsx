import { Link } from "react-router-dom";

interface SectionHeaderProps {
  index?: string;
  label?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  index,
  label,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  align = "left",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-5 mb-12 ${
        centered ? "text-center items-center max-w-2xl mx-auto" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "space-y-4" : "max-w-xl space-y-3"}>
        <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
          {index && (
            <span className="text-[10px] font-bold text-accent-gold/80 tabular-nums tracking-widest">
              {index}
            </span>
          )}
          {label && <p className="section-label">{label}</p>}
        </div>
        <h2 className="font-serif text-3xl sm:text-[2.35rem] font-light text-primary-dark tracking-tight leading-tight">
          {title}
        </h2>
        <div className={`gold-divider w-14 ${centered ? "mx-auto" : ""}`} />
        {subtitle && (
          <p className={`text-sm text-muted-custom font-light leading-relaxed ${centered ? "max-w-lg" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>
      {viewAllHref && viewAllLabel && !centered && (
        <Link
          to={viewAllHref}
          className="home-link-arrow shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover"
        >
          {viewAllLabel}
        </Link>
      )}
      {viewAllHref && viewAllLabel && centered && (
        <Link to={viewAllHref} className="home-link-arrow text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
