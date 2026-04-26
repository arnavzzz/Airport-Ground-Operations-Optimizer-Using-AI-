import { useState, useEffect, useRef } from "react";

/* ── Animated counter hook ── */
function useCounter(target, duration = 1800, started = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!started) return;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - prog, 3);
            setValue(+(target * ease).toFixed(1));
            if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, started]);
    return value;
}

/* ── Radial progress ring ── */
function Ring({ pct, color, size = 96, stroke = 7 }) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </svg>
    );
}

/* ── Sparkline ── */
function Sparkline({ data, color }) {
    const w = 120, h = 36;
    const min = Math.min(...data), max = Math.max(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(" ");
    const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Main ── */
export function AIEnginePage() {
    const [visible, setVisible] = useState(false);
    const [tab, setTab] = useState("overview");
    const ref = useRef();

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const turnaround = useCounter(87.4, 1800, visible);
    const resource = useCounter(92.1, 1800, visible);
    const delayPrev = useCounter(78.6, 1800, visible);
    const predAcc = useCounter(94.3, 1800, visible);
    const delayCost = useCounter(24800, 2000, visible);

    const delayHistory = [
        { flight: "AI-202", route: "DEL→BOM", delay: 18, cause: "Gate conflict", saved: "₹1,240", status: "resolved" },
        { flight: "AI-317", route: "BOM→CCU", delay: 31, cause: "Fueling overlap", saved: "₹2,180", status: "resolved" },
        { flight: "AI-089", route: "CCU→HYD", delay: 7,  cause: "Baggage queue",  saved: "₹490",   status: "resolved" },
        { flight: "AI-455", route: "HYD→DEL", delay: 44, cause: "Crew positioning", saved: "₹3,090", status: "flagged" },
        { flight: "AI-128", route: "DEL→AMD", delay: 12, cause: "Pushback conflict", saved: "₹840",  status: "resolved" },
        { flight: "AI-601", route: "AMD→CCU", delay: 26, cause: "ATC slot miss",  saved: "₹1,820", status: "monitoring" },
    ];

    const scoreCards = [
        { label: "Turnaround Optimizer", key: "t", value: turnaround, unit: "%", color: "#a78bfa", target: 87.4, spark: [72,75,80,78,83,82,87,85,88,87], detail: "Avg gate clearance: 28 min", icon: "⟳" },
        { label: "Resource Optimizer",   key: "r", value: resource,   unit: "%", color: "#38bdf8", target: 92.1, spark: [85,87,89,88,91,90,93,92,94,92], detail: "Utilization across 14 zones", icon: "◈" },
        { label: "Delay Prevent Rate",   key: "d", value: delayPrev,  unit: "%", color: "#34d399", target: 78.6, spark: [65,68,72,70,74,76,78,77,80,79], detail: "47 incidents averted today",  icon: "⚡" },
        { label: "Predictive Accuracy",  key: "p", value: predAcc,    unit: "%", color: "#fb923c", target: 94.3, spark: [88,90,91,89,93,92,94,93,96,94], detail: "2h lookahead window",         icon: "◎" },
    ];

    return (
        <div className="aie-root" ref={ref}>
            <style>{`
                .aie-root{flex:1;display:flex;flex-direction:column;padding:28px 32px;gap:24px;overflow-y:auto;background:transparent;font-family:'DM Sans',sans-serif}
                .aie-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
                .aie-heading{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(120deg,#e0d7ff,#93c5fd 60%,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
                .aie-sub{font-size:12px;color:rgba(255,255,255,.35);margin-top:3px}
                .aie-tabs{display:flex;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:4px}
                .aie-tab{padding:7px 18px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,.4);transition:all .2s;letter-spacing:.03em}
                .aie-tab.active{background:rgba(167,139,250,.18);color:#c4b5fd;border:1px solid rgba(167,139,250,.3)}
                .aie-scores{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
                .aie-score-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:20px 22px 16px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden;transition:transform .22s,border-color .22s;animation:fadeUp .6s both}
                .aie-score-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--card-color);opacity:.7;border-radius:18px 18px 0 0}
                .aie-score-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.15)}
                .aie-card-top{display:flex;justify-content:space-between;align-items:flex-start}
                .aie-card-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.06);color:var(--card-color)}
                .aie-card-label{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.06em;text-transform:uppercase;margin-top:8px}
                .aie-card-middle{display:flex;align-items:center;gap:16px}
                .aie-ring-wrap{position:relative;flex-shrink:0}
                .aie-ring-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff}
                .aie-card-right{flex:1;display:flex;flex-direction:column;gap:6px}
                .aie-big-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;line-height:1}
                .aie-big-unit{font-size:14px;color:rgba(255,255,255,.45);font-weight:400}
                .aie-card-detail{font-size:11px;color:rgba(255,255,255,.3);margin-top:2px}
                .aie-bottom{display:grid;grid-template-columns:1fr 1.6fr;gap:16px}
                @media(max-width:900px){.aie-bottom{grid-template-columns:1fr}}
                .aie-panel{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:22px 24px;display:flex;flex-direction:column;gap:16px;animation:fadeUp .7s .2s both}
                .aie-panel-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,.7);letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;gap:8px}
                .aie-panel-title span{width:8px;height:8px;border-radius:50%;background:#fb923c;box-shadow:0 0 8px #fb923c;animation:pulse 2s infinite;flex-shrink:0}
                .aie-cost-big{text-align:center;padding:20px 0}
                .aie-cost-num{font-family:'Syne',sans-serif;font-size:42px;font-weight:900;background:linear-gradient(120deg,#fb923c,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
                .aie-cost-label{font-size:11px;color:rgba(255,255,255,.3);margin-top:4px;letter-spacing:.05em;text-transform:uppercase}
                .aie-cost-bar-wrap{display:flex;flex-direction:column;gap:8px}
                .aie-cost-bar-row{display:flex;flex-direction:column;gap:4px}
                .aie-cost-bar-header{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4)}
                .aie-cost-bar-track{height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}
                .aie-cost-bar-fill{height:100%;border-radius:99px;transition:width 2s cubic-bezier(0.34,1.56,0.64,1)}
                .aie-history{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:22px 24px;display:flex;flex-direction:column;gap:16px;animation:fadeUp .7s .3s both}
                .aie-history-table{display:flex;flex-direction:column;gap:6px}
                .aie-history-header{display:grid;grid-template-columns:80px 100px 60px 1fr 70px 90px;gap:8px;padding:0 4px 8px;border-bottom:1px solid rgba(255,255,255,.07);font-size:10px;font-weight:700;color:rgba(255,255,255,.25);letter-spacing:.08em;text-transform:uppercase}
                .aie-history-row{display:grid;grid-template-columns:80px 100px 60px 1fr 70px 90px;gap:8px;padding:10px 4px;border-radius:10px;font-size:12px;color:rgba(255,255,255,.65);transition:background .18s;align-items:center}
                .aie-history-row:hover{background:rgba(255,255,255,.04)}
                .aie-flight-code{font-family:'Syne',sans-serif;font-weight:700;color:#c4b5fd;font-size:12px}
                .aie-delay-badge{background:rgba(251,146,60,.15);color:#fb923c;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;text-align:center}
                .aie-saved{color:#34d399;font-weight:600;font-size:12px}
                .aie-status{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;text-align:center;letter-spacing:.04em}
                .aie-status.resolved{background:rgba(52,211,153,.12);color:#34d399}
                .aie-status.flagged{background:rgba(239,68,68,.12);color:#f87171}
                .aie-status.monitoring{background:rgba(251,191,36,.12);color:#fbbf24}
                @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
            `}</style>

            {/* Top bar */}
            <div className="aie-topbar">
                <div>
                    <div className="aie-heading">AI Engine Dashboard</div>
                    <div className="aie-sub">Real-time intelligence · Updated every 30s</div>
                </div>
                <div className="aie-tabs">
                    {["overview","predictions","reports"].map(t => (
                        <button key={t} className={`aie-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Score Cards */}
            <div className="aie-scores">
                {scoreCards.map((c,i) => (
                    <div className="aie-score-card" key={c.key}
                        style={{"--card-color":c.color, animationDelay:`${i*0.08}s`}}>
                        <div className="aie-card-top">
                            <div>
                                <div className="aie-card-icon">{c.icon}</div>
                                <div className="aie-card-label">{c.label}</div>
                            </div>
                        </div>
                        <div className="aie-card-middle">
                            <div className="aie-ring-wrap">
                                <Ring pct={visible ? c.target : 0} color={c.color} />
                                <div className="aie-ring-val" style={{color:c.color,fontSize:14}}>
                                    {Math.round(c.value)}%
                                </div>
                            </div>
                            <div className="aie-card-right">
                                <div className="aie-big-num">
                                    {c.value.toFixed(1)}<span className="aie-big-unit">{c.unit}</span>
                                </div>
                                <div className="aie-card-detail">{c.detail}</div>
                                <Sparkline data={c.spark} color={c.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom row */}
            <div className="aie-bottom">

                {/* Delay Penalty Cost */}
                <div className="aie-panel">
                    <div className="aie-panel-title"><span />Delay Penalty Cost</div>
                    <div className="aie-cost-big">
                        <div className="aie-cost-num">
                            ₹{Math.round(delayCost).toLocaleString("en-IN")}
                        </div>
                        <div className="aie-cost-label">Estimated today · Rolling 24h</div>
                    </div>
                    <div className="aie-cost-bar-wrap">
                        {[
                            {label:"Gate Conflicts",   pct:38, color:"#f87171", amt:"₹9,424"},
                            {label:"Crew Delays",      pct:27, color:"#fb923c", amt:"₹6,696"},
                            {label:"Fueling Issues",   pct:21, color:"#fbbf24", amt:"₹5,208"},
                            {label:"ATC Misses",       pct:14, color:"#a78bfa", amt:"₹3,472"},
                        ].map(b => (
                            <div className="aie-cost-bar-row" key={b.label}>
                                <div className="aie-cost-bar-header"><span>{b.label}</span><span>{b.amt}</span></div>
                                <div className="aie-cost-bar-track">
                                    <div className="aie-cost-bar-fill"
                                        style={{width: visible ? `${b.pct}%`:"0%", background:b.color}} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delay History */}
                <div className="aie-history">
                    <div className="aie-panel-title">
                        <span style={{background:"#38bdf8",boxShadow:"0 0 8px #38bdf8"}} />
                        Past Delay Insights
                    </div>
                    <div className="aie-history-table">
                        <div className="aie-history-header">
                            <span>Flight</span><span>Route</span><span>Delay</span>
                            <span>Cause</span><span>Saved</span><span>Status</span>
                        </div>
                        {delayHistory.map(row => (
                            <div className="aie-history-row" key={row.flight}>
                                <span className="aie-flight-code">{row.flight}</span>
                                <span>{row.route}</span>
                                <span className="aie-delay-badge">{row.delay}m</span>
                                <span>{row.cause}</span>
                                <span className="aie-saved">{row.saved}</span>
                                <span className={`aie-status ${row.status}`}>{row.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}