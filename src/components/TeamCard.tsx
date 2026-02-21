import { memo, useState } from "react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  nickname?: string;
  image: string;
}

/* Prakarsh palette — kept as CSS custom-property-independent constants
   since this is a standalone themed page */
const C = {
  cardBg:     "#1A0E2E",
  cardBgLight:"#2D1B4E",
  purple:     "#6B3FA0",
  pink:       "#E84FAA",
  blue:       "#4A90D9",
  cyan:       "#6CB4EE",
  gold:       "#D4A574",
  peach:      "#F1B5A2",
  white:      "#FFFFFF",
} as const;

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const TeamCard = memo(function TeamCard({ member, index }: TeamCardProps) {
  const [hovered, setHovered] = useState(false);
  const serialNum = `PRK-${String(index + 1).padStart(3, "0")}`;

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ backfaceVisibility: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-[2px] rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: hovered ? 0.5 : 0,
          background: `linear-gradient(135deg, ${C.pink}, ${C.blue}, ${C.purple})`,
          filter: "blur(5px)",
        }}
      />

      {/* Card body */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${C.cardBgLight} 0%, ${C.cardBg} 100%)`,
          border: `1.5px solid ${hovered ? `${C.pink}90` : `${C.purple}50`}`,
          transition: "border-color 0.35s ease, transform 0.3s ease, box-shadow 0.3s ease",
          transform: hovered ? "scale(1.03) translateY(-3px)" : "scale(1) translateY(0)",
          boxShadow: hovered
            ? `0 12px 36px -10px ${C.pink}40, 0 4px 20px -6px rgba(0,0,0,0.6)`
            : `0 3px 16px -10px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Top badge */}
        <div className="flex justify-between items-center px-3 pt-3 pb-2">
          <div
            className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-[0.18em] uppercase"
            style={{
              background: `linear-gradient(135deg, ${C.blue}CC, ${C.purple}CC)`,
              color: C.white,
            }}
          >
            PRAKARSH '26
          </div>
          <span
            className="text-[9px] font-mono tracking-wider"
            style={{ color: `${C.gold}AA` }}
          >
            {serialNum}
          </span>
        </div>

        {/* Image area — fixed aspect ratio so cards stay uniform */}
        <div className="relative mx-3 rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", maxHeight: "52%" }}>
          {/* Gradient border wrapper */}
          <div
            className="absolute inset-0 rounded-xl p-[2px]"
            style={{
              background: `linear-gradient(160deg, ${C.pink}80, ${C.blue}80, ${C.purple}80)`,
            }}
          >
            <div
              className="w-full h-full rounded-xl overflow-hidden relative"
              style={{ background: C.cardBg }}
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  style={{
                    transition: "transform 0.5s ease",
                    transform: hovered ? "scale(1.05)" : "scale(1)",
                  }}
                />
              ) : (
                /* Placeholder */
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 35%, ${C.purple}70 0%, ${C.cardBg} 70%)`,
                    }}
                  />
                  {/* Decorative circles */}
                  <div
                    className="absolute w-20 h-20 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${C.pink}30, ${C.blue}30)`,
                      top: "10%", left: "5%",
                      transition: "transform 0.5s ease",
                      transform: hovered ? "translate(4px,-4px) scale(1.1)" : "none",
                    }}
                  />
                  <div
                    className="absolute w-14 h-14 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${C.blue}25, ${C.cyan}25)`,
                      bottom: "15%", right: "10%",
                      transition: "transform 0.5s ease",
                      transform: hovered ? "translate(-4px,3px) scale(1.12)" : "none",
                    }}
                  />
                  {/* Big initial */}
                  <span
                    className="relative text-6xl font-extrabold select-none transition-all duration-400"
                    style={{
                      color: hovered ? `${C.pink}55` : `${C.purple}45`,
                      fontFamily: "Orbitron, sans-serif",
                      transition: "color 0.4s ease",
                    }}
                  >
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Scan line on hover */}
              {hovered && (
                <div
                  className="absolute left-0 right-0 h-[1px] pointer-events-none animate-[scanline_2s_linear_infinite]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${C.pink}80, ${C.cyan}80, transparent)`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="px-3.5 pt-2.5 pb-3 flex flex-col gap-0.5 flex-1 justify-end">
          <h3
            className="text-sm font-extrabold tracking-[0.06em] uppercase leading-tight truncate"
            style={{ color: C.white }}
          >
            {member.name}
          </h3>

          <p
            className="text-[10px] font-semibold tracking-[0.1em] uppercase leading-tight truncate"
            style={{ color: `${C.white}70` }}
          >
            {member.role}
          </p>

          {member.nickname && (
            <p
              className="text-[9px] font-semibold tracking-[0.12em] uppercase mt-0.5 truncate"
              style={{ color: `${C.cyan}CC` }}
            >
              {member.nickname}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

TeamCard.displayName = "TeamCard";
export default TeamCard;
