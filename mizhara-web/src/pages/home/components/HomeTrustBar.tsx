const pillars = [
  { title: "925 Sterling Silver", desc: "Premium base metal" },
  { title: "Hypoallergenic", desc: "Gentle on skin" },
  { title: "Triple-Plated", desc: "Long-lasting shine" },
  { title: "Gift Ready", desc: "Chic packaging" },
];

export default function HomeTrustBar() {
  return (
    <section className="border-y border-border-custom/70 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border-custom/60">
          {pillars.map((p) => (
            <div key={p.title} className="py-6 sm:py-8 px-4 sm:px-6 text-center lg:text-left">
              <p className="font-serif text-sm sm:text-base text-primary-dark">{p.title}</p>
              <p className="text-[10px] text-muted-custom mt-1 font-light tracking-wide">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
