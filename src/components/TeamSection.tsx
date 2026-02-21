import TeamCard, { TeamMember } from "@/components/TeamCard";

const C = {
  pink:  "#E84FAA",
  cyan:  "#6CB4EE",
  gold:  "#D4A574",
  peach: "#F1B5A2",
  white: "#FFFFFF",
} as const;

interface TeamSectionProps {
  title: string;
  tagline: string;
  members: TeamMember[];
}

export default function TeamSection({ title, tagline, members }: TeamSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Section header */}
      <div className="text-center mb-10 md:mb-14">
        <p
          className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase mb-2"
          style={{ color: C.gold }}
        >
          PRAKARSH '26
        </p>
        <h2
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.05em] uppercase"
          style={{
            fontFamily: "Orbitron, sans-serif",
            background: `linear-gradient(135deg, ${C.white} 0%, ${C.peach} 50%, ${C.pink} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h2>
        <p
          className="max-w-md mx-auto text-xs md:text-sm mt-3 px-4"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {tagline}
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div
            className="h-px w-16 md:w-24"
            style={{ background: `linear-gradient(90deg, transparent, ${C.pink}60)` }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${C.pink}, ${C.cyan})`,
              boxShadow: `0 0 10px ${C.pink}80`,
            }}
          />
          <div
            className="h-px w-16 md:w-24"
            style={{ background: `linear-gradient(90deg, ${C.cyan}60, transparent)` }}
          />
        </div>

        {/* Member count badge */}
        <div className="mt-4 flex justify-center">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{
              background: "rgba(107,63,160,0.25)",
              border: "1px solid rgba(107,63,160,0.4)",
              color: C.cyan,
            }}
          >
            {members.length} Members
          </span>
        </div>
      </div>

      {/*
        ── The key grid trick ──
        • auto-fill + minmax(220px, 1fr): browser fills as many columns as fit
        • Every card gets the SAME width (1fr share) regardless of total count
        • gap is fixed — spacing never changes
        • Each card enforces its own aspect-ratio, so height is also uniform
      */}
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))",
        }}
      >
        {members.map((member, index) => (
          <div
            key={member.id}
            /* Fixed aspect ratio wrapper — guarantees identical card dimensions
               regardless of how many cards are in the grid */
            style={{ aspectRatio: "220 / 320" }}
          >
            <TeamCard member={member} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
