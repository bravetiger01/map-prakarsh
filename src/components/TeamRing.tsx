import { memo, useEffect, useRef, useState, useCallback } from "react";
import type { TeamMember } from "@/data/teamData";

/* ── Prakarsh palette ── */
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

/* ── Card width/height (px) — constant regardless of member count ── */
const CARD_W = 200;
const CARD_H = 290;

/* ── Single card ── */
const RingCard = memo(function RingCard({
  member,
  index,
  isActive,
}: {
  member: TeamMember;
  index: number;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const serialNum = `PRK-${String(index + 1).padStart(3, "0")}`;
  const lit = hovered || isActive;

  return (
    <div
      className="w-full h-full relative select-none"
      style={{ backfaceVisibility: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-[2px] rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          opacity: lit ? 0.5 : 0,
          background: `linear-gradient(135deg, ${C.pink}, ${C.blue}, ${C.purple})`,
          filter: "blur(5px)",
        }}
      />

      {/* Card body */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${C.cardBgLight} 0%, ${C.cardBg} 100%)`,
          border: `1.5px solid ${lit ? `${C.pink}90` : `${C.purple}50`}`,
          transition: "border-color 0.35s ease, box-shadow 0.3s ease",
          boxShadow: lit
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
          <span className="text-[9px] font-mono tracking-wider" style={{ color: `${C.gold}AA` }}>
            {serialNum}
          </span>
        </div>

        {/* Image area */}
        <div className="relative mx-3 rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", maxHeight: "52%" }}>
          <div
            className="absolute inset-0 rounded-xl p-[2px]"
            style={{ background: `linear-gradient(160deg, ${C.pink}80, ${C.blue}80, ${C.purple}80)` }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: C.cardBg }}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(circle at 50% 35%, ${C.purple}70 0%, ${C.cardBg} 70%)` }}
                  />
                  <div
                    className="absolute w-16 h-16 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${C.pink}30, ${C.blue}30)`, top: "10%", left: "5%" }}
                  />
                  <div
                    className="absolute w-12 h-12 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${C.blue}25, ${C.cyan}25)`, bottom: "15%", right: "10%" }}
                  />
                  <span
                    className="relative text-5xl font-extrabold select-none"
                    style={{
                      color: lit ? `${C.pink}55` : `${C.purple}45`,
                      fontFamily: "Orbitron, sans-serif",
                      transition: "color 0.4s ease",
                    }}
                  >
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Scan line */}
              {lit && (
                <div
                  className="absolute left-0 right-0 h-[1px] pointer-events-none animate-[scanline_2s_linear_infinite]"
                  style={{ background: `linear-gradient(90deg, transparent, ${C.pink}80, ${C.cyan}80, transparent)` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-3 pt-2 pb-3 flex flex-col gap-0.5 flex-1 justify-end">
          <h3
            className="text-xs font-extrabold tracking-[0.06em] uppercase leading-tight truncate"
            style={{ color: C.white }}
          >
            {member.name}
          </h3>
          <p
            className="text-[9px] font-semibold tracking-[0.1em] uppercase leading-tight truncate"
            style={{ color: `${C.white}70` }}
          >
            {member.role}
          </p>
          {member.nickname && (
            <p
              className="text-[8px] font-semibold tracking-[0.12em] uppercase mt-0.5 truncate"
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
RingCard.displayName = "RingCard";

/* ── Helpers ── */
/**
 * Calculate the radius so cards are evenly spaced around the circle.
 * arc-length between adjacent cards = CARD_W + gap
 * circumference = n * (CARD_W + gap) → radius = circumference / (2π)
 */
function calcRadius(n: number, gap = 32): number {
  if (n <= 1) return 0;
  const circumference = n * (CARD_W + gap);
  return circumference / (2 * Math.PI);
}

/* ── Main ring component ── */
interface TeamRingProps {
  members: TeamMember[];
  /** seconds for one full revolution (default 30) */
  duration?: number;
  /** pause auto-rotation while user hovers */
  pauseOnHover?: boolean;
}

export default function TeamRing({ members, duration = 30, pauseOnHover = true }: TeamRingProps) {
  const n = members.length;
  const anglePerItem = 360 / n;
  const radius = calcRadius(n);

  /* rotation state — driven by requestAnimationFrame */
  const rotRef = useRef(0);
  const [rotation, setRotation] = useState(0);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const paused = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  /* drag state */
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRot = useRef(0);

  const degreesPerMs = 360 / (duration * 1000);

  const tick = useCallback((timestamp: number) => {
    if (!paused.current) {
      if (lastTime.current !== null) {
        const delta = timestamp - lastTime.current;
        rotRef.current = (rotRef.current + degreesPerMs * delta) % 360;
        setRotation(rotRef.current);
        // active = card closest to the front (angle ≈ 0)
        const idx = Math.round(((360 - rotRef.current) % 360) / anglePerItem) % n;
        setActiveIndex(idx);
      }
    }
    lastTime.current = timestamp;
    rafId.current = requestAnimationFrame(tick);
  }, [degreesPerMs, anglePerItem, n]);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [tick]);

  useEffect(() => {
    paused.current = pauseOnHover && hovering;
  }, [hovering, pauseOnHover]);

  /* drag handlers */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartRot.current = rotRef.current;
    paused.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    rotRef.current = ((dragStartRot.current - dx * 0.25) % 360 + 360) % 360;
    setRotation(rotRef.current);
    const idx = Math.round(((360 - rotRef.current) % 360) / anglePerItem) % n;
    setActiveIndex(idx);
  }, [anglePerItem, n]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    if (!hovering) paused.current = false;
    lastTime.current = null; // reset so delta doesn't jump
  }, [hovering]);

  /* viewport height for ring scene */
  const sceneH = Math.max(CARD_H + 120, radius > 0 ? radius + CARD_H / 2 + 80 : 400);

  return (
    <div
      className="relative w-full flex flex-col items-center"
      style={{ userSelect: "none" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Active member label */}
      <div
        className="text-center mb-6 transition-all duration-300"
        style={{ minHeight: "3rem" }}
      >
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ color: C.gold }}>
          NOW FEATURED
        </p>
        <h3
          className="text-xl md:text-2xl font-extrabold tracking-[0.08em] uppercase"
          style={{
            background: `linear-gradient(135deg, ${C.white}, ${C.peach})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          {members[activeIndex]?.name}
        </h3>
        <p className="text-[11px] mt-1 tracking-wider" style={{ color: `${C.cyan}CC` }}>
          {members[activeIndex]?.role}
        </p>
      </div>

      {/* 3-D scene */}
      <div
        style={{
          width: "100%",
          height: `${sceneH}px`,
          perspective: `${Math.max(radius * 2.5, 800)}px`,
          perspectiveOrigin: "50% 50%",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Ring pivot — centred in the scene */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${CARD_W}px`,
            height: `${CARD_H}px`,
            marginLeft: `-${CARD_W / 2}px`,
            marginTop: `-${CARD_H / 2}px`,
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {members.map((member, i) => {
            const angle = i * anglePerItem;
            return (
              <div
                key={member.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                  /* scale up the front card slightly */
                  transition: "opacity 0.4s",
                  opacity: i === activeIndex ? 1 : 0.75,
                }}
              >
                <RingCard member={member} index={i} isActive={i === activeIndex} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${C.pink}50)` }} />
        <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: `rgba(255,255,255,0.3)` }}>
          drag to spin
        </span>
        <div className="h-px w-10" style={{ background: `linear-gradient(90deg, ${C.cyan}50, transparent)` }} />
      </div>
    </div>
  );
}
