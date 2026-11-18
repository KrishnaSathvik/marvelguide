import { C } from "@/content";

/** The Sacred Timeline → Loki → multiverse diagram (legacy `#tsvg`). Branches animate in via `.tsvg.in`. */
export function SacredTimeline() {
  const pruned: [number, number][] = [
    [130, -1],
    [250, 1],
    [370, -1],
  ];
  const branchColors = [C.orange, C.purple, C.green, C.red, C.teal, C.pink, C.blue];
  const label = { style: { fontFamily: "var(--label)", fontWeight: 700 } } as const;
  const body = { style: { fontFamily: "var(--body)" } } as const;
  return (
    <div className="tsvg rv" id="tsvg">
      <svg viewBox="0 0 1000 360" role="img" aria-label="Diagram: the Sacred Timeline, Loki's choice, and the branching multiverse">
        <rect x="0" y="0" width="470" height="360" fill="#f6f1e3" />
        <rect x="470" y="0" width="110" height="360" fill="#efe9fb" />
        <rect x="580" y="0" width="420" height="360" fill="#e8eefb" />
        <line x1="470" y1="0" x2="470" y2="360" stroke="#111" strokeWidth="2" strokeDasharray="5 5" />
        <line x1="580" y1="0" x2="580" y2="360" stroke="#111" strokeWidth="2" strokeDasharray="5 5" />
        <g {...label} letterSpacing="2" fill="#111">
          <text x="24" y="38" fontSize="12" fill={C.red}>1 · BEFORE</text>
          <text x="24" y="60" fontSize="18">THE SACRED TIMELINE</text>
          <text x="525" y="38" fontSize="12" textAnchor="middle" fill={C.purple}>2 · BREAK</text>
          <text x="525" y="60" fontSize="18" textAnchor="middle">LOKI</text>
          <text x="604" y="38" fontSize="12" fill={C.blue}>3 · NOW</text>
          <text x="604" y="60" fontSize="18">THE MULTIVERSE</text>
        </g>
        <line x1="24" y1="200" x2="499" y2="200" stroke={C.red} strokeWidth="10" strokeLinecap="round" />
        {pruned.map(([x, d]) => (
          <g key={x}>
            <path
              d={`M${x} 200 C ${x + 20} 200, ${x + 30} ${200 + d * 55}, ${x + 55} ${200 + d * 62}`}
              fill="none"
              stroke="#9a9384"
              strokeWidth="5"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
            <g transform={`translate(${x + 62},${200 + d * 64})`}>
              <circle r="13" fill="#fffdf7" stroke={C.red} strokeWidth="3" />
              <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke={C.red} strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        ))}
        <text x="24" y="318" {...label} fontSize="13" letterSpacing="1.5" fill="#111">✕ = A BRANCH THE TVA PRUNED</text>
        <text x="24" y="338" {...body} fontSize="13" fill="#6b6658">
          One &quot;correct&quot; timeline. Anything that strayed was cut.
        </text>
        {branchColors.map((col, k) => {
          const y = 200 + (k - 3) * 36;
          return (
            <g key={k}>
              <path
                className="br"
                d={`M551 200 C 640 200, 680 ${y}, 760 ${y} L 950 ${y}`}
                fill="none"
                stroke={col}
                strokeWidth={k === 3 ? 8 : 5}
                strokeLinecap="round"
                style={{ animationDelay: `${0.2 + k * 0.08}s` }}
              />
              <circle cx="954" cy={y} r="7" fill={col} stroke="#111" strokeWidth="2" />
            </g>
          );
        })}
        <g {...label} fontSize="13" letterSpacing="1.2" fill="#111" textAnchor="end">
          <text x="940" y="83">EARTH-828 · FANTASTIC FOUR</text>
          <text x="940" y="191">EARTH-616 · THE MCU</text>
          <text x="940" y="299">EARTH-10005 · FOX X-MEN</text>
        </g>
        <circle cx="525" cy="200" r="28" fill={C.purple} stroke="#111" strokeWidth="5" />
        <text x="525" y="208" textAnchor="middle" style={{ fontFamily: "var(--head)" }} fontSize="22" fill="#fff">L</text>
        <text x="525" y="258" textAnchor="middle" {...label} fontSize="13" letterSpacing="1.2" fill="#111">HOLDS THE</text>
        <text x="525" y="275" textAnchor="middle" {...label} fontSize="13" letterSpacing="1.2" fill="#111">BRANCHES</text>
        <text x="604" y="326" {...body} fontSize="13" fill="#6b6658">Every branch is its own universe.</text>
        <text x="604" y="344" {...body} fontSize="13" fill="#6b6658">Doomsday pulls three of them together.</text>
      </svg>
    </div>
  );
}

const NODES: [string, string, string][] = [
  ["Iron Man", "where it began", C.red],
  ["The Avengers", "assembled by Fury", C.gold],
  ["Thanos", "the Snap & Blip", C.purple],
  ["Time Heist", "cracks the timeline", C.teal],
  ["The Multiverse", "infinite branches", C.blue],
  ["Doomsday", "the collision point", C.green],
];

/** Connection map: 1→6 flow across the two saga bands (legacy `#cmap`). */
export function ConnectionMap() {
  const label = { style: { fontFamily: "var(--label)", fontWeight: 700 } } as const;
  return (
    <div className="map rv" id="cmap">
      <svg viewBox="0 0 1000 480" role="img" aria-label="Connection map: how the MCU's big events lead to Doomsday">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10z" fill="#111" />
          </marker>
        </defs>
        <rect x="12" y="12" width="976" height="208" fill="#fbefc4" stroke="#111" strokeWidth="3" />
        <rect x="12" y="258" width="976" height="208" fill="#e3eafb" stroke="#111" strokeWidth="3" />
        <g {...label} letterSpacing="2" fill="#111">
          <text x="32" y="44" fontSize="15">INFINITY SAGA · 2008–2019</text>
          <text x="968" y="44" fontSize="12" textAnchor="end" fill="#6b5a1e">THREAD: THE SIX INFINITY STONES</text>
          <text x="32" y="290" fontSize="15">MULTIVERSE SAGA · 2021–2027</text>
          <text x="968" y="290" fontSize="12" textAnchor="end" fill="#2a4a9a">THREAD: THE TVA &amp; INCURSIONS</text>
        </g>
        {NODES.map(([title, sub, col], i) => {
          const row = i < 4 ? 0 : 1;
          const x = row ? [280, 520][i - 4] : 40 + i * 240;
          const y = row ? 318 : 72;
          const arrow = i < 3 || i === 4;
          return (
            <g key={title}>
              {arrow && (
                <line x1={x + 208} y1={y + 56} x2={x + 232} y2={y + 56} stroke="#111" strokeWidth="4" markerEnd="url(#ah)" />
              )}
              <g className="node">
                <rect x={x + 5} y={y + 5} width="200" height="112" fill="#111" />
                <rect x={x} y={y} width="200" height="112" fill="#fffdf7" stroke="#111" strokeWidth="4" />
                <rect x={x} y={y} width="200" height="12" fill={col} stroke="#111" strokeWidth="4" />
                <circle cx={x + 4} cy={y + 4} r="17" fill="#111" />
                <text x={x + 4} y={y + 11} textAnchor="middle" style={{ fontFamily: "var(--head)" }} fontSize="18" fill="#fff">
                  {i + 1}
                </text>
                <text x={x + 100} y={y + 62} textAnchor="middle" style={{ fontFamily: "var(--head)" }} fontSize="23" fill="#111">
                  {title.toUpperCase()}
                </text>
                <text x={x + 100} y={y + 90} textAnchor="middle" {...label} fontSize="13" letterSpacing="1.2" fill="#6b6658">
                  {sub.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}
        <path d="M860 190 V 239 H 380 V 304" fill="none" stroke="#111" strokeWidth="4" markerEnd="url(#ah)" />
      </svg>
    </div>
  );
}
