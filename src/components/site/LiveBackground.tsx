/**
 * LiveBackground — subtle breathing orb layer
 *
 * Four large radial-gradient blobs in deep-navy tones.
 * Opacity is deliberately kept very low (~0.06–0.10) so the effect is
 * "alive" without ever competing with text or images.
 *
 * Rendered fixed behind all content (z-index: 0, pointer-events: none).
 */
export function LiveBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* ─── Orb 1 — top-left, large deep-navy ─── */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-20%",
          width: "75vw",
          height: "75vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.40 0.22 258 / 0.10) 0%, oklch(0.50 0.18 255 / 0.05) 50%, transparent 72%)",
          animation: "lbOrb1 18s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />

      {/* ─── Orb 2 — bottom-right, richer navy ─── */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-18%",
          width: "80vw",
          height: "80vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.38 0.24 260 / 0.09) 0%, oklch(0.48 0.18 257 / 0.04) 50%, transparent 72%)",
          animation: "lbOrb2 22s ease-in-out infinite 4s",
          willChange: "transform, opacity",
        }}
      />

      {/* ─── Orb 3 — top-right, sky-navy ─── */}
      <div
        style={{
          position: "absolute",
          top: "0%",
          right: "-12%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.55 0.16 252 / 0.07) 0%, oklch(0.65 0.12 250 / 0.03) 55%, transparent 72%)",
          animation: "lbOrb3 14s ease-in-out infinite 2s",
          willChange: "transform, opacity",
        }}
      />

      {/* ─── Orb 4 — lower-centre, very soft mid-blue ─── */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "25%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.45 0.20 255 / 0.07) 0%, oklch(0.60 0.14 252 / 0.03) 55%, transparent 72%)",
          animation: "lbOrb4 20s ease-in-out infinite 7s",
          willChange: "transform, opacity",
        }}
      />

      {/* Keyframes: each orb drifts + scales independently */}
      <style>{`
        @keyframes lbOrb1 {
          0%   { transform: translate(0px,   0px)  scale(1);    opacity: 1; }
          25%  { transform: translate(50px,  70px) scale(1.18); opacity: 0.55; }
          50%  { transform: translate(90px,  25px) scale(1.30); opacity: 1; }
          75%  { transform: translate(25px,  90px) scale(0.88); opacity: 0.45; }
          100% { transform: translate(0px,   0px)  scale(1);    opacity: 1; }
        }
        @keyframes lbOrb2 {
          0%   { transform: translate(0px,    0px)  scale(1);    opacity: 1; }
          30%  { transform: translate(-65px, -45px) scale(1.22); opacity: 0.50; }
          60%  { transform: translate(-35px, -85px) scale(0.86); opacity: 1; }
          85%  { transform: translate(-75px, -20px) scale(1.14); opacity: 0.60; }
          100% { transform: translate(0px,    0px)  scale(1);    opacity: 1; }
        }
        @keyframes lbOrb3 {
          0%   { transform: translate(0px,   0px)  scale(1);    opacity: 0.75; }
          40%  { transform: translate(-55px, 55px) scale(1.20); opacity: 1; }
          70%  { transform: translate(-25px, 30px) scale(0.84); opacity: 0.45; }
          100% { transform: translate(0px,   0px)  scale(1);    opacity: 0.75; }
        }
        @keyframes lbOrb4 {
          0%   { transform: translate(0px,  0px)   scale(1);    opacity: 0.65; }
          35%  { transform: translate(55px, -45px) scale(1.24); opacity: 1; }
          65%  { transform: translate(-35px,-65px) scale(0.90); opacity: 0.45; }
          100% { transform: translate(0px,  0px)   scale(1);    opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}
