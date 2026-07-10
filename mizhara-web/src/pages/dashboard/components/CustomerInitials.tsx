export default function CustomerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-pink text-[10px] font-bold text-primary-dark ring-1 ring-border-custom/60">
      {initials}
    </span>
  );
}
