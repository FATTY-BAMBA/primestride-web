const CORE = { x: 280, y: 235 };

const nodes = [
  { label: "Atlas EIP", cx: 280, cy: 70, w: 150 },
  { label: "LyraAI", cx: 423, cy: 152, w: 120 },
  { label: "EduSense", cx: 423, cy: 318, w: 140 },
  { label: "Customer AI", cx: 280, cy: 400, w: 176 },
  { label: "Pulse", cx: 137, cy: 318, w: 110 },
  { label: "Knowledge AI", cx: 137, cy: 152, w: 186 },
];

const lines = nodes.map((n, i) => ({ id: `lg${i + 1}`, x1: n.cx, y1: n.cy }));

export default function CoreNetwork() {
  return (
    <svg className="net" viewBox="0 0 560 470" role="img" aria-label="PrimeStride core intelligence network">
      <defs>
        <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6B5BFF" />
          <stop offset="100%" stopColor="#3D2CE0" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcfcfe" />
          <stop offset="100%" stopColor="#f4f5f8" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3D2CE0" stopOpacity="0.20" />
          <stop offset="60%" stopColor="#3D2CE0" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#3D2CE0" stopOpacity="0" />
        </radialGradient>
        <filter id="panelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="24" floodColor="#0E1116" floodOpacity="0.08" />
        </filter>
        <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0E1116" floodOpacity="0.11" />
        </filter>
        <filter id="coreBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        {lines.map((l) => (
          <linearGradient key={l.id} id={l.id} gradientUnits="userSpaceOnUse" x1={l.x1} y1={l.y1} x2={CORE.x} y2={CORE.y}>
            <stop offset="0%" stopColor="#3D2CE0" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#3D2CE0" stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      <rect x="6" y="6" width="548" height="458" rx="28" fill="url(#panelGrad)" stroke="#ececf3" strokeWidth="1" filter="url(#panelShadow)" />
      <circle cx={CORE.x} cy={CORE.y} r="185" fill="url(#glow)" />
      <circle cx={CORE.x} cy={CORE.y} r="165" fill="none" stroke="#3D2CE0" strokeOpacity="0.12" strokeDasharray="1 7" />
      <circle cx={CORE.x} cy={CORE.y} r="96" fill="none" stroke="#3D2CE0" strokeOpacity="0.10" strokeDasharray="1 7" />

      <g strokeWidth="1.6" fill="none">
        {lines.map((l) => (
          <line key={l.id} x1={l.x1} y1={l.y1} x2={CORE.x} y2={CORE.y} stroke={`url(#${l.id})`} />
        ))}
      </g>

      <g className="pulses" fill="#6B5BFF">
        {lines.flatMap((l, i) =>
          [0, 1.3].map((off, j) => {
            const begin = `${(i * 0.4 + off).toFixed(1)}s`;
            const path = `M${l.x1},${l.y1} L${CORE.x},${CORE.y}`;
            return (
              <circle key={`${l.id}-${j}`} r="2.7">
                <animateMotion dur="2.7s" begin={begin} repeatCount="indefinite" path={path} />
                <animate attributeName="opacity" values="0;1;1;0" dur="2.7s" begin={begin} repeatCount="indefinite" />
              </circle>
            );
          })
        )}
      </g>

      <g className="rings" fill="none" stroke="#6B5BFF">
        {[0, 1.8].map((b, i) => (
          <circle key={i} cx={CORE.x} cy={CORE.y} r="50">
            <animate attributeName="r" values="50;150" dur="3.6s" begin={`${b}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0" dur="3.6s" begin={`${b}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      <rect x="202" y="196" width="156" height="78" rx="18" fill="#4a39e8" filter="url(#coreBlur)" opacity="0.55" />
      <rect x="202" y="196" width="156" height="78" rx="18" fill="url(#coreGrad)" />
      <text x={CORE.x} y="230" textAnchor="middle" fontSize="21" fontWeight="700" fill="#ffffff" style={{ fontFamily: "var(--font-bricolage)" }}>Core</text>
      <text x={CORE.x} y="252" textAnchor="middle" fontSize="12" fill="#cdc7ff" style={{ fontFamily: "var(--font-noto-tc)" }}>核心智慧平台</text>

      <g fontSize="15" fill="#171B24">
        {nodes.map((n) => {
          const x = n.cx - n.w / 2;
          const y = n.cy - 23;
          return (
            <g key={n.label}>
              <g filter="url(#nodeShadow)">
                <rect x={x} y={y} width={n.w} height="46" rx="13" fill="#fff" stroke="#e6e8ee" />
              </g>
              <circle cx={x + n.w - 14} cy={y + 13} r="3" fill="#1D9E75" />
              <text x={n.cx} y={n.cy + 5} textAnchor="middle">{n.label}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
