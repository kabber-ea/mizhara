type FormSettingToggleProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
};

export default function FormSettingToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  error,
}: FormSettingToggleProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex items-center justify-between gap-4 rounded-xl border bg-gradient-to-br from-white to-background/80 px-4 py-3.5 transition-all ${
          error
            ? "border-rose-300 ring-1 ring-rose-200"
            : checked
              ? "border-primary/25 ring-1 ring-primary/10"
              : "border-border-custom/80"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30 hover:shadow-xs"}`}
      >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary-dark">{label}</p>
        {description && (
          <p className="text-[10px] text-muted-custom mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="relative h-6 w-11 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-border-custom transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40"
        />
        <span
          aria-hidden
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </div>
    </label>
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 px-1 text-[10px] font-semibold text-rose-600 leading-relaxed">
        {error}
      </p>
    )}
    </div>
  );
}
