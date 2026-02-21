import TeamRing from "@/components/TeamRing";
import { coreTeam, websiteTeam, graphicsTeam, type TeamMember } from "@/data/teamData";

const C = {
  pink:   "#E84FAA",
  cyan:   "#6CB4EE",
  purple: "#6B3FA0",
  white:  "#FFFFFF",
  gold:   "#D4A574",
  peach:  "#F1B5A2",
} as const;

/* ── Section wrapper with header ── */
function TeamSection({
  id,
  title,
  tagline,
  members,
  accentColor = C.pink,
  duration = 30,
}: {
  id: string;
  title: string;
  tagline: string;
  members: TeamMember[];
  accentColor?: string;
  duration?: number;
}) {
  return (
    <section id={id} className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24">
      {/* Header */}
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
            background: `linear-gradient(135deg, ${C.white} 0%, ${C.peach} 50%, ${accentColor} 100%)`,
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
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60)` }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${C.cyan})`,
              boxShadow: `0 0 10px ${accentColor}80`,
            }}
          />
          <div
            className="h-px w-16 md:w-24"
            style={{ background: `linear-gradient(90deg, ${C.cyan}60, transparent)` }}
          />
        </div>

        {/* Member count */}
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

      <TeamRing members={members} duration={duration} />
    </section>
  );
}

export default function TeamPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: "linear-gradient(180deg, #2a1a3d 0%, #1a0f2e 40%, #0a0515 100%)",
      }}
    >
      {/* Page hero */}
      <div className="text-center pt-16 pb-4 px-4">
        <p
          className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-3"
          style={{ color: C.gold }}
        >
          ISTE SVIT
        </p>
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.08em] uppercase"
          style={{
            fontFamily: "Orbitron, sans-serif",
            background: `linear-gradient(135deg, ${C.white} 0%, ${C.peach} 45%, ${C.pink} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          OUR TEAM
        </h1>
        <p
          className="mt-3 max-w-lg mx-auto text-sm md:text-base"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          The brilliant minds behind Prakarsh '26
        </p>
      </div>

      {/* Quick-jump nav */}
      <nav
        className="sticky top-0 z-30 flex justify-center gap-3 py-3 px-4"
        style={{
          background: "rgba(10,5,21,0.75)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(107,63,160,0.25)",
        }}
      >
        {[
          { label: "Core Team",     href: "#core",     count: coreTeam.length },
          { label: "Website Team",  href: "#website",  count: websiteTeam.length },
          { label: "Graphics Team", href: "#graphics", count: graphicsTeam.length },
        ].map(({ label, href, count }) => (
          <a
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(107,63,160,0.2)",
              border: "1px solid rgba(107,63,160,0.35)",
              color: C.cyan,
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(107,63,160,0.45)";
              (e.currentTarget as HTMLElement).style.borderColor = `${C.pink}70`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(107,63,160,0.2)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(107,63,160,0.35)";
            }}
          >
            {label}
            <span className="ml-1.5 opacity-60">({count})</span>
          </a>
        ))}
      </nav>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="w-full h-full opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(107,63,160,1) 1px, transparent 1px), linear-gradient(90deg, rgba(107,63,160,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Sections */}
      <div className="relative z-10">
        <div id="core">
          <TeamSection
            id="core-inner"
            title="Core Team"
            tagline="The leadership driving Prakarsh '26 forward."
            members={coreTeam}
            accentColor={C.pink}
            duration={40}
          />
        </div>

        <Divider color={C.pink} />

        <div id="website">
          <TeamSection
            id="website-inner"
            title="Website Team"
            tagline="Engineers and designers powering the digital experience."
            members={websiteTeam}
            accentColor={C.cyan}
            duration={25}
          />
        </div>

        <Divider color={C.cyan} />

        <div id="graphics">
          <TeamSection
            id="graphics-inner"
            title="Graphics Team"
            tagline="The creative minds shaping Prakarsh's visual identity."
            members={graphicsTeam}
            accentColor="#A78BFA"
            duration={20}
          />
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-8 text-[11px] tracking-[0.2em] uppercase"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Prakarsh '26 · ISTE SVIT
      </footer>
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div className="flex items-center px-8 md:px-16 opacity-30">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <div className="w-2 h-2 rounded-full mx-2" style={{ background: color }} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}
