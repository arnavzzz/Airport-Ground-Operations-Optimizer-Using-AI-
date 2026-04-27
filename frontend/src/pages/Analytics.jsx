import { useState, useEffect, useRef } from "react";

/* ── Animated counter ── */
function useCounter(target, duration = 1800, started = false) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!started) return;
        let s = null;
        const tick = (ts) => {
            if (!s) s = ts;
            const p = Math.min((ts - s) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setVal(+(target * e).toFixed(1));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration, started]);
    return val;
}

/* ── Inline SVG Bar ── */
function BarChart({ data, color = "#a78bfa", height = 80 }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${data.length * 44} ${height}`} preserveAspectRatio="none">
            {data.map((d, i) => {
                const bh = (d.value / max) * (height - 20);
                const x = i * 44 + 4;
                const y = height - bh - 16;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={36} height={bh} rx={5}
                            fill={color} opacity={0.7 + (i / data.length) * 0.3} />
                        <text x={x + 18} y={height - 2} textAnchor="middle"
                            fill="rgba(255,255,255,0.35)" fontSize={9}>{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ── Sparkline ── */
function Spark({ data, color, w = 100, h = 32 }) {
    const min = Math.min(...data), max = Math.max(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(" ");
    const id = `sp${color.replace(/[^a-z0-9]/gi, "")}`;
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Line trend ── */
function LineTrend({ datasets, labels, h = 120 }) {
    const allVals = datasets.flatMap(d => d.values);
    const min = Math.min(...allVals), max = Math.max(...allVals);
    const w = (labels.length - 1) || 1;
    const toX = i => (i / w) * 100;
    const toY = v => h - ((v - min) / (max - min || 1)) * (h - 12) - 6;

    return (
        <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none"
            style={{ overflow: "visible" }}>
            {datasets.map((ds, di) => {
                const pts = ds.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
                const id = `lt${di}`;
                return (
                    <g key={di}>
                        <defs>
                            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={ds.color} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#${id})`} />
                        <polyline points={pts} fill="none" stroke={ds.color} strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                        {ds.values.map((v, i) => (
                            <circle key={i} cx={toX(i)} cy={toY(v)} r="1.8" fill={ds.color} />
                        ))}
                    </g>
                );
            })}
            {labels.map((l, i) => (
                <text key={i} x={toX(i)} y={h + 12} textAnchor="middle"
                    fill="rgba(255,255,255,0.25)" fontSize="5">{l}</text>
            ))}
        </svg>
    );
}

/* ── Heatmap ── */
function Heatmap({ data, days, hours }) {
    const max = Math.max(...data.flat());
    const colors = ["#1a1a2e", "#2d1b4e", "#5b21b6", "#7c3aed", "#a78bfa", "#c4b5fd"];
    const getCellColor = (v) => {
        const idx = Math.round((v / max) * (colors.length - 1));
        return colors[Math.max(0, Math.min(idx, colors.length - 1))];
    };
    const cw = 38, ch = 22, pad = 48;
    const svgW = hours.length * cw + pad;
    const svgH = days.length * ch + 36;

    return (
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: "visible" }}>
            {hours.map((h, hi) => (
                <text key={hi} x={pad + hi * cw + cw / 2} y={12}
                    textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7}>{h}</text>
            ))}
            {days.map((day, di) => (
                <g key={di}>
                    <text x={pad - 4} y={24 + di * ch + ch / 2 + 3}
                        textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize={7}>{day}</text>
                    {hours.map((_, hi) => {
                        const v = data[di][hi];
                        return (
                            <g key={hi}>
                                <rect x={pad + hi * cw + 1} y={18 + di * ch + 1}
                                    width={cw - 3} height={ch - 3} rx={3}
                                    fill={getCellColor(v)} opacity={0.85} />
                                {v > 0 && (
                                    <text x={pad + hi * cw + cw / 2} y={18 + di * ch + ch / 2 + 3}
                                        textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={6}>{v}</text>
                                )}
                            </g>
                        );
                    })}
                </g>
            ))}
        </svg>
    );
}

/* ── Donut ── */
function Donut({ slices, size = 90 }) {
    const total = slices.reduce((a, s) => a + s.value, 0);
    const r = 34, cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const starts = slices.reduce((sum, slice) => {
        const next = [...sum.values, sum.total];
        return { total: sum.total + slice.value, values: next };
    }, { total: 0, values: [] }).values;
    return (
        <svg width={size} height={size}>
            {slices.map((s, i) => {
                const pct = s.value / total;
                const offset = circ - pct * circ;
                const rotation = (starts[i] / total) * 360 - 90;
                return (
                    <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={s.color} strokeWidth={12}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        transform={`rotate(${rotation} ${cx} ${cy})`}
                        style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                );
            })}
            <circle cx={cx} cy={cy} r={22} fill="rgba(15,15,27,0.9)" />
        </svg>
    );
}

/* ── Main ── */
export function AnalyticsPage() {
    const [visible, setVisible] = useState(false);
    const [period, setPeriod] = useState("7d");
    const ref = useRef();

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.05 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    /* counters */
    const fuelSaving   = useCounter(1.84, 1800, visible);   // ₹ Cr
    const delayCost    = useCounter(46.2, 1800, visible);   // ₹ L avoided
    const avgTurnaround = useCounter(27.4, 1800, visible);  // min

    /* Top-5 causes */
    const causes = [
        { label: "Gate conflict",   value: 134, color: "#a78bfa", pct: 31 },
        { label: "Fueling overlap", value: 98,  color: "#38bdf8", pct: 23 },
        { label: "Crew position",   value: 87,  color: "#34d399", pct: 20 },
        { label: "Baggage delay",   value: 63,  color: "#fb923c", pct: 15 },
        { label: "ATC slot miss",   value: 47,  color: "#f472b6", pct: 11 },
    ];

    /* Turnaround trend */
    const trendLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const trendDatasets = [
        { label: "This week", color: "#a78bfa", values: [32, 30, 28, 29, 27, 26, 27] },
        { label: "Last week", color: "rgba(167,139,250,0.3)", values: [38, 36, 35, 34, 32, 30, 31] },
    ];

    /* Fuel spark */
    const fuelSpark = [1.2, 1.35, 1.5, 1.42, 1.6, 1.72, 1.84];

    /* Delay heatmap */
    const heatDays  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const heatHours = ["6am", "8am", "10a", "12p", "2pm", "4pm", "6pm", "8pm"];
    const heatData  = [
        [2, 5, 8,  12, 7,  15, 18, 6],
        [1, 4, 11, 9,  13, 19, 14, 4],
        [3, 6, 7,  14, 10, 17, 22, 8],
        [0, 3, 9,  11, 8,  12, 16, 5],
        [4, 7, 10, 13, 11, 20, 24, 9],
        [1, 2, 5,  7,  6,  10, 13, 3],
        [0, 1, 3,  5,  4,  7,  9,  2],
    ];

    return (
        <div className="an-root" ref={ref}>
            <style>{`
                .an-root{flex:1;display:flex;flex-direction:column;padding:28px 32px;gap:22px;overflow-y:auto;background:transparent;font-family:'DM Sans',sans-serif}
                .an-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
                .an-heading{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(120deg,#93c5fd,#a78bfa 55%,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
                .an-sub{font-size:12px;color:rgba(255,255,255,.35);margin-top:3px}
                .an-period{display:flex;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:3px}
                .an-pbtn{padding:5px 14px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,.35);transition:all .18s}
                .an-pbtn.active{background:rgba(96,165,250,.18);color:#93c5fd;border:1px solid rgba(96,165,250,.3)}

                /* ── KPI strip ── */
                .an-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
                @media(max-width:700px){.an-kpi{grid-template-columns:1fr}}
                .an-kcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden;animation:anFade .55s both;transition:transform .2s,border-color .2s}
                .an-kcard::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--kc);opacity:.6;border-radius:0 0 16px 16px}
                .an-kcard:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.14)}
                .an-klabel{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.35)}
                .an-krow{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}
                .an-knum{font-family:'Syne',sans-serif;font-size:30px;font-weight:900;color:#fff;line-height:1}
                .an-kunit{font-size:12px;color:rgba(255,255,255,.4);font-weight:400;margin-left:2px}
                .an-kdelta{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(52,211,153,.12);color:#34d399}

                /* ── 2-col layout ── */
                .an-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
                @media(max-width:860px){.an-grid2{grid-template-columns:1fr}}
                .an-grid3{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
                @media(max-width:860px){.an-grid3{grid-template-columns:1fr}}

                /* ── Panel base ── */
                .an-panel{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:14px;animation:anFade .6s .15s both}
                .an-ptitle{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,.6);letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center;gap:7px}
                .an-ptitle-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;animation:anPulse 2s infinite}

                /* ── Trend chart ── */
                .an-trend-legend{display:flex;gap:14px;flex-wrap:wrap}
                .an-legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,.4)}
                .an-legend-dot{width:8px;height:8px;border-radius:50%}

                /* ── Causes ── */
                .an-causes{display:flex;flex-direction:column;gap:10px}
                .an-cause-row{display:flex;align-items:center;gap:10px}
                .an-cause-rank{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;color:rgba(255,255,255,.25);width:16px;text-align:center}
                .an-cause-info{flex:1;display:flex;flex-direction:column;gap:3px}
                .an-cause-header{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.55)}
                .an-cause-val{font-weight:700;color:rgba(255,255,255,.75)}
                .an-cause-track{height:5px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}
                .an-cause-fill{height:100%;border-radius:99px;transition:width 1.8s cubic-bezier(.34,1.56,.64,1)}

                /* ── Donut legend ── */
                .an-donut-wrap{display:flex;align-items:center;gap:16px}
                .an-donut-legend{display:flex;flex-direction:column;gap:7px;flex:1}
                .an-dl-row{display:flex;align-items:center;gap:7px;font-size:11px;color:rgba(255,255,255,.5)}
                .an-dl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
                .an-dl-val{margin-left:auto;font-weight:700;color:rgba(255,255,255,.7)}

                /* ── Heatmap panel ── */
                .an-heatmap-wrap{overflow-x:auto;padding-bottom:4px}

                /* ── Legend bar for heatmap ── */
                .an-hm-legend{display:flex;align-items:center;gap:6px;font-size:10px;color:rgba(255,255,255,.3)}
                .an-hm-grad{flex:1;height:6px;border-radius:3px;background:linear-gradient(90deg,#1a1a2e,#5b21b6,#c4b5fd)}

                @keyframes anFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
                @keyframes anPulse{0%,100%{opacity:1}50%{opacity:.35}}
            `}</style>

            {/* Top bar */}
            <div className="an-topbar">
                <div>
                    <div className="an-heading">Analytics</div>
                    <div className="an-sub">Operational intelligence · Ground ops metrics</div>
                </div>
                <div className="an-period">
                    {["24h","7d","30d","90d"].map(p => (
                        <button key={p} className={`an-pbtn ${period===p?"active":""}`}
                            onClick={() => setPeriod(p)}>{p}</button>
                    ))}
                </div>
            </div>

            {/* KPI Strip */}
            <div className="an-kpi">
                {/* Fuel Cost Saving */}
                <div className="an-kcard" style={{"--kc":"#34d399", animationDelay:"0s"}}>
                    <div className="an-klabel">⛽ Fuel Cost Saving</div>
                    <div className="an-krow">
                        <div className="an-knum">
                            ₹{fuelSaving.toFixed(2)}<span className="an-kunit">Cr</span>
                        </div>
                        <div>
                            <Spark data={fuelSpark} color="#34d399" />
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span className="an-kdelta">↑ 12.4% vs last period</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>14 routes optimized</span>
                    </div>
                </div>

                {/* Delay Penalty Cost Avoidance */}
                <div className="an-kcard" style={{"--kc":"#fb923c", animationDelay:"0.08s"}}>
                    <div className="an-klabel">🚫 Delay Penalty Avoided</div>
                    <div className="an-krow">
                        <div className="an-knum">
                            ₹{delayCost.toFixed(1)}<span className="an-kunit">L</span>
                        </div>
                        <div>
                            <Spark data={[28,32,35,38,40,43,46]} color="#fb923c" />
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span className="an-kdelta" style={{background:"rgba(251,146,60,.12)",color:"#fb923c"}}>↑ 8.7% vs last period</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>429 flights protected</span>
                    </div>
                </div>

                {/* Avg Turnaround */}
                <div className="an-kcard" style={{"--kc":"#38bdf8", animationDelay:"0.16s"}}>
                    <div className="an-klabel">⟳ Avg Turnaround Time</div>
                    <div className="an-krow">
                        <div className="an-knum">
                            {avgTurnaround.toFixed(1)}<span className="an-kunit">min</span>
                        </div>
                        <div>
                            <Spark data={[38,36,34,33,31,29,27]} color="#38bdf8" />
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span className="an-kdelta" style={{background:"rgba(56,189,248,.12)",color:"#38bdf8"}}>↓ 6.1 min improvement</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>Target: 25 min</span>
                    </div>
                </div>
            </div>

            {/* Row 2: Turnaround Trend + Causes */}
            <div className="an-grid3">

                {/* Turnaround Time Trend */}
                <div className="an-panel">
                    <div className="an-ptitle">
                        <span className="an-ptitle-dot" style={{background:"#38bdf8",boxShadow:"0 0 7px #38bdf8"}} />
                        Turnaround Time Trend
                    </div>
                    <div className="an-trend-legend">
                        {trendDatasets.map(ds => (
                            <div className="an-legend-item" key={ds.label}>
                                <div className="an-legend-dot" style={{background:ds.color}} />
                                {ds.label}
                            </div>
                        ))}
                    </div>
                    <div style={{flex:1,minHeight:120,paddingBottom:16}}>
                        <LineTrend datasets={trendDatasets} labels={trendLabels} h={120} />
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:12}}>
                        {[
                            {label:"Best",  val:"22 min", color:"#34d399"},
                            {label:"Avg",   val:"27.4 min", color:"#38bdf8"},
                            {label:"Worst", val:"48 min", color:"#f87171"},
                        ].map(s => (
                            <div key={s.label} style={{textAlign:"center"}}>
                                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:s.color}}>{s.val}</div>
                                <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top 5 Delayed Causes */}
                <div className="an-panel">
                    <div className="an-ptitle">
                        <span className="an-ptitle-dot" style={{background:"#a78bfa",boxShadow:"0 0 7px #a78bfa"}} />
                        Top 5 Delay Causes
                    </div>
                    <div className="an-donut-wrap">
                        <Donut slices={causes.map(c => ({value:c.value,color:c.color}))} size={84} />
                        <div className="an-donut-legend">
                            {causes.map(c => (
                                <div className="an-dl-row" key={c.label}>
                                    <div className="an-dl-dot" style={{background:c.color}} />
                                    <span>{c.label}</span>
                                    <span className="an-dl-val">{c.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="an-causes">
                        {causes.map((c, i) => (
                            <div className="an-cause-row" key={c.label}>
                                <div className="an-cause-rank">{i + 1}</div>
                                <div className="an-cause-info">
                                    <div className="an-cause-header">
                                        <span>{c.label}</span>
                                        <span className="an-cause-val">{c.value} flights</span>
                                    </div>
                                    <div className="an-cause-track">
                                        <div className="an-cause-fill"
                                            style={{width: visible ? `${c.pct}%`:"0%", background:c.color}} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Heatmap */}
            <div className="an-panel" style={{animationDelay:"0.25s"}}>
                <div className="an-ptitle">
                    <span className="an-ptitle-dot" style={{background:"#f472b6",boxShadow:"0 0 7px #f472b6"}} />
                    Delay Pattern Heatmap
                    <span style={{marginLeft:"auto",fontSize:10,color:"rgba(255,255,255,.25)",textTransform:"none",letterSpacing:0}}>
                        Incidents per time slot · darker = more delays
                    </span>
                </div>
                <div className="an-heatmap-wrap">
                    <Heatmap data={heatData} days={heatDays} hours={heatHours} />
                </div>
                <div className="an-hm-legend">
                    <span>Low</span>
                    <div className="an-hm-grad" />
                    <span>High</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:12}}>
                    {[
                        {label:"Peak hour",   val:"6pm–8pm",   color:"#c4b5fd"},
                        {label:"Peak day",    val:"Friday",     color:"#f472b6"},
                        {label:"Quietest",    val:"Sunday AM",  color:"#34d399"},
                        {label:"Total slots", val:"56 tracked", color:"#38bdf8"},
                    ].map(s => (
                        <div key={s.label} style={{textAlign:"center",background:"rgba(255,255,255,.03)",borderRadius:10,padding:"10px 6px"}}>
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:s.color}}>{s.val}</div>
                            <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
