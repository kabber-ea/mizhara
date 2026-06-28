export const fieldInputClass = (hasError?: boolean) =>
  `w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary ${
    hasError ? "border-rose-400 ring-1 ring-rose-200 bg-rose-50/30" : "border-border-custom"
  }`;

export const fieldSectionClass = (hasError?: boolean) =>
  hasError ? "rounded-xl border border-rose-400 ring-1 ring-rose-200 p-3" : "";

export const filePickerClass = (hasError?: boolean, disabled?: boolean) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold text-primary-dark transition-all ${
    hasError ? "border-rose-400 ring-1 ring-rose-200 bg-rose-50/30" : "border-border-custom bg-background/40"
  } ${
    disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer hover:border-primary/40 hover:bg-accent-pink/30 hover:text-primary"
  }`;
