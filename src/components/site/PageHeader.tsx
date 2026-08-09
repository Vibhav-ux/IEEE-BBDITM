export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-border bg-secondary/40 relative overflow-hidden">
      {/* Subtle blue gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 60% at 80% 30%, oklch(0.52 0.17 255 / 0.05) 0%, transparent 70%)",
        }}
      />
      <div className="section-shell relative py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl text-shimmer">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
