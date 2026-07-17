const C = {
  iris: "#3D2CE0",
  irisBright: "#6B5BFF",
  irisTint: "#EEEBFF",
  ink: "#171B24",
  muted: "#B4BAC6",
  line: "#E3E6EB",
  live: "#1D9E75",
  liveTint: "#E1F5EE",
  amber: "#EF9F27",
  coral: "#E8552B",
  surface: "#FFFFFF",
  paper: "#F5F6F8",
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 440 300" role="img" style={{ width: "100%", height: "auto", display: "block" }}>
      {children}
    </svg>
  );
}

function bar(x: number, y: number, w: number, h: number, fill: string, rx = 4) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} />;
}

function HR() {
  return (
    <Frame>
      <rect x="54" y="34" width="332" height="232" rx="18" fill={C.surface} stroke={C.line} />
      <circle cx="88" cy="70" r="14" fill={C.irisTint} />
      <circle cx="88" cy="70" r="6" fill={C.iris} />
      {bar(112, 62, 90, 8, C.ink)}
      {bar(112, 76, 60, 7, C.muted)}
      <rect x="74" y="104" width="150" height="26" rx="13" fill={C.irisTint} />
      <text x="90" y="121" fontSize="12" fill={C.iris} style={{ fontFamily: "var(--font-plex-mono)" }}>Leave · Mar 3–5</text>
      {bar(74, 146, 292, 8, C.paper)}
      {bar(74, 162, 250, 8, C.paper)}
      <rect x="74" y="192" width="128" height="34" rx="10" fill={C.liveTint} />
      <path d="M90 209 l7 7 l13 -15" fill="none" stroke={C.live} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="118" y="214" fontSize="13" fill={C.live} style={{ fontFamily: "var(--font-plex)" }}>Approved</text>
      <rect x="252" y="196" width="114" height="26" rx="13" fill={C.paper} />
      <circle cx="268" cy="209" r="5" fill={C.live} />
      <text x="280" y="213" fontSize="11" fill={C.ink} style={{ fontFamily: "var(--font-plex-mono)" }}>2026 compliant</text>
    </Frame>
  );
}

function Interview() {
  const heights = [22, 40, 30, 52, 64, 44, 70, 50, 60, 34, 46, 26, 38, 20];
  return (
    <Frame>
      <rect x="54" y="34" width="332" height="232" rx="18" fill={C.surface} stroke={C.line} />
      <circle cx="86" cy="66" r="13" fill={C.iris} />
      <rect x="78" y="60" width="16" height="12" rx="4" fill="#fff" />
      {bar(110, 60, 70, 8, C.ink)}
      {bar(110, 74, 100, 6, C.muted)}
      <g>
        {heights.map((h, i) => (
          <rect key={i} x={78 + i * 18} y={128 - h / 2} width="7" height={h} rx="3.5" fill={i % 3 === 0 ? C.iris : C.irisBright} opacity={0.55 + (h / 140)} />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {bar(78, 176 + i * 26, 60, 8, C.paper)}
          {bar(150, 176 + i * 26, 216, 8, C.paper)}
          {bar(150, 176 + i * 26, [170, 140, 200][i], 8, C.iris)}
        </g>
      ))}
    </Frame>
  );
}

function Edu() {
  return (
    <Frame>
      <rect x="54" y="34" width="332" height="232" rx="18" fill={C.surface} stroke={C.line} />
      <rect x="74" y="54" width="292" height="92" rx="10" fill={C.ink} />
      <circle cx="220" cy="100" r="20" fill="#ffffff" opacity="0.9" />
      <path d="M214 91 l14 9 l-14 9 z" fill={C.iris} />
      <rect x="74" y="156" width="292" height="8" rx="4" fill={C.paper} />
      {[96, 150, 210, 268, 320].map((x, i) => (
        <rect key={i} x={x} y="152" width="4" height="16" rx="2" fill={C.iris} />
      ))}
      {[
        { c: C.live, w: 150 },
        { c: C.amber, w: 120 },
        { c: C.coral, w: 90 },
      ].map((r, i) => (
        <g key={i}>
          <circle cx="86" cy={196 + i * 22} r="5" fill={r.c} />
          {bar(102, 192 + i * 22, r.w, 8, C.paper)}
        </g>
      ))}
    </Frame>
  );
}

function Chat() {
  return (
    <Frame>
      <rect x="94" y="26" width="252" height="248" rx="20" fill={C.surface} stroke={C.line} />
      <rect x="94" y="26" width="252" height="40" rx="20" fill={C.paper} />
      <circle cx="120" cy="46" r="9" fill={C.iris} />
      <text x="136" y="50" fontSize="12" fill={C.ink} style={{ fontFamily: "var(--font-plex)" }}>PrimeStride</text>
      <rect x="304" y="38" width="30" height="16" rx="8" fill={C.liveTint} />
      <text x="309" y="50" fontSize="9" fill={C.live} style={{ fontFamily: "var(--font-plex-mono)" }}>0.5s</text>
      <rect x="112" y="84" width="150" height="42" rx="12" fill={C.irisTint} />
      {bar(126, 96, 120, 7, C.iris)}
      {bar(126, 109, 90, 7, C.irisBright)}
      <rect x="180" y="140" width="148" height="30" rx="12" fill={C.paper} />
      {bar(196, 151, 116, 7, C.muted)}
      <rect x="112" y="184" width="130" height="30" rx="12" fill={C.irisTint} />
      {bar(126, 195, 100, 7, C.iris)}
      <g>
        <circle cx="124" cy="238" r="3.5" fill={C.muted} />
        <circle cx="136" cy="238" r="3.5" fill={C.muted} />
        <circle cx="148" cy="238" r="3.5" fill={C.muted} />
      </g>
    </Frame>
  );
}

function Marketing() {
  const bars = [40, 62, 50, 78, 58];
  return (
    <Frame>
      <rect x="46" y="70" width="150" height="70" rx="14" fill={C.live} />
      <rect x="60" y="88" width="118" height="34" rx="9" fill="#ffffff" opacity="0.95" />
      <text x="72" y="103" fontSize="11" fill={C.ink} style={{ fontFamily: "var(--font-plex-mono)" }}>“pause ad set”</text>
      <text x="72" y="117" fontSize="9" fill={C.muted} style={{ fontFamily: "var(--font-plex-mono)" }}>via LINE</text>
      <path d="M204 105 h34" stroke={C.iris} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M232 99 l8 6 l-8 6" fill="none" stroke={C.iris} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="250" y="44" width="140" height="212" rx="16" fill={C.surface} stroke={C.line} />
      {bar(266, 60, 70, 8, C.ink)}
      <rect x="330" y="56" width="46" height="18" rx="9" fill={C.irisTint} />
      <text x="337" y="69" fontSize="9" fill={C.iris} style={{ fontFamily: "var(--font-plex-mono)" }}>Mon 8am</text>
      <g>
        {bars.map((h, i) => (
          <rect key={i} x={268 + i * 24} y={190 - h} width="14" height={h} rx="4" fill={i === 3 ? C.iris : C.irisBright} opacity={i === 3 ? 1 : 0.5} />
        ))}
      </g>
      <path d="M268 210 h108" stroke={C.line} strokeWidth="1" />
      <path d="M268 232 q40 -14 108 -4" fill="none" stroke={C.coral} strokeWidth="2.2" strokeLinecap="round" />
    </Frame>
  );
}

function Knowledge() {
  return (
    <Frame>
      <rect x="46" y="40" width="196" height="220" rx="14" fill={C.surface} stroke={C.line} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x="66" y={66 + i * 24} width={i % 3 === 2 ? 120 : 156} height="8" rx="4" fill={C.paper} />
      ))}
      <rect x="66" y="138" width="156" height="8" rx="4" fill={C.irisTint} />
      <rect x="222" y="96" width="172" height="108" rx="14" fill={C.iris} />
      <text x="240" y="126" fontSize="13" fill="#ffffff" style={{ fontFamily: "var(--font-plex)" }}>Answer</text>
      {bar(240, 138, 138, 7, "#8f83f2")}
      {bar(240, 152, 110, 7, "#8f83f2")}
      <rect x="240" y="172" width="70" height="20" rx="10" fill="#ffffff" opacity="0.92" />
      <text x="252" y="186" fontSize="10" fill={C.iris} style={{ fontFamily: "var(--font-plex-mono)" }}>SOP · p.42</text>
      <path d="M222 150 l-14 -8 v16 z" fill={C.iris} />
    </Frame>
  );
}

const map: Record<string, () => JSX.Element> = {
  hr: HR,
  interview: Interview,
  edu: Edu,
  chat: Chat,
  marketing: Marketing,
  knowledge: Knowledge,
};

export default function ProductVisual({ variant }: { variant: string }) {
  const V = map[variant] ?? HR;
  return <V />;
}
