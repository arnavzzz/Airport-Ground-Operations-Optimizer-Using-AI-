import { useState, useEffect, useRef } from "react";
import "../styles/commandcenter.css";

/* ── Static seed data ── */
const ARRIVING_FLIGHTS = [
    { id: "AI-202",  airline: "Air India",      from: "DEL",  eta: "14:05", gate: "A3",  status: "ontime",   pax: 168, runway: "R1" },
    { id: "6E-451",  airline: "IndiGo",          from: "BOM",  eta: "14:22", gate: "B7",  status: "delayed",  pax: 210, runway: "R2" },
    { id: "SG-310",  airline: "SpiceJet",        from: "HYD",  eta: "14:40", gate: "C2",  status: "boarding",  pax: 152, runway: "R1" },
    { id: "UK-831",  airline: "Vistara",         from: "CCU",  eta: "15:10", gate: "A9",  status: "ontime",   pax: 188, runway: "R3" },
    { id: "IX-213",  airline: "Air Asia India",  from: "MAA",  eta: "15:35", gate: "D4",  status: "landed",   pax: 174, runway: "R2" },
    { id: "G8-714",  airline: "Go First",        from: "PNQ",  eta: "15:50", gate: "B3",  status: "ontime",   pax: 146, runway: "R1" },
    { id: "AI-560",  airline: "Air India",       from: "AMD",  eta: "16:15", gate: "A5",  status: "delayed",  pax: 192, runway: "R3" },
];

const INITIAL_FEED = [
    { id: 1,  icon: "✈️",  color: "purple", text: "AI-202 cleared for Gate A3 — ground crew dispatched",        bold: "AI-202",    time: "Just now"   },
    { id: 2,  icon: "⛽",  color: "cyan",   text: "Fuel truck #07 completed service on 6E-451 — 18,400 L",      bold: "Fuel truck #07", time: "1 min ago"  },
    { id: 3,  icon: "⚠️",  color: "amber",  text: "Delay alert: SG-310 boarding extended 12 min at Gate C2",    bold: "Delay alert:", time: "3 min ago"  },
    { id: 4,  icon: "🤖",  color: "purple", text: "AI Optimizer reallocated Runway R2 — saving 8 min turnaround", bold: "AI Optimizer", time: "5 min ago"  },
    { id: 5,  icon: "🧳",  color: "green",  text: "Baggage unit #3 completed UK-831 — 128 bags in 18 min",      bold: "Baggage unit #3", time: "7 min ago"  },
    { id: 6,  icon: "🛬",  color: "amber",  text: "IX-213 landed on R2 — taxiing to gate D4",                   bold: "IX-213 landed", time: "9 min ago"  },
    { id: 7,  icon: "👷",  color: "blue",   text: "Crew team 5 assigned to G8-714 arrival — ETA 15 min",        bold: "Crew team 5", time: "11 min ago" },
    { id: 8,  icon: "✅",  color: "green",  text: "AI-560 gate conflict resolved — reassigned from A3 to A5",    bold: "AI-560",    time: "14 min ago" },
];

const NEW_FEED_POOL = [
    { icon: "⛽",  color: "cyan",   bold: "Fuel truck #12",  tail: "en route to Gate B7 for refuelling" },
    { icon: "🤖",  color: "purple", bold: "AI model",        tail: "flagged slot conflict at D4 — auto-resolved" },
    { icon: "🧳",  color: "green",  bold: "Baggage belt",    tail: "activated at Gate A3 — crew standing by" },
    { icon: "👷",  color: "blue",   bold: "Ground crew",     tail: "Team 4 clocked in — 3 members on standby" },
    { icon: "✈️",  color: "purple", bold: "Pushback cleared", tail: "for AI-202 — taxi route optimised by AI" },
    { icon: "⚠️",  color: "rose",   bold: "Weather alert:",  tail: "Runway R1 inspection initiated" },
];

/* ── Animated counter hook ── */
function useCounter(target, duration) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / ((duration || 1300) / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return val;
}

/* ── Donut chart component ── */
function DonutChart({ onTime, delayed, boarding }) {
    const total = onTime + delayed + boarding;
    const r = 44, cx = 55, cy = 55;
    const circ = 2 * Math.PI * r;
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

    const segments = [
        { value: onTime,   color: "#34d399" },
        { value: delayed,  color: "#f87171" },
        { value: boarding, color: "#60a5fa" },
    ];

    let cumOffset = 0;
    const arcs = segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = animated ? Math.max(pct * circ - 2, 0) : 0;
        const gap = circ - dash;
        const arc = { ...seg, dash, gap, offset: cumOffset, delay: i * 0.15 };
        cumOffset += pct * circ;
        return arc;
    });

    const legendItems = [
        { label: "On-Time",  color: "#34d399", value: onTime   },
        { label: "Delayed",  color: "#f87171", value: delayed  },
        { label: "Boarding", color: "#60a5fa", value: boarding },
    ];

    return (
        <div className="cc-donut-wrap">
            <div className="cc-donut-svg-wrap">
                <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    {arcs.map((seg, i) => (
                        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                            stroke={seg.color} strokeWidth="10"
                            strokeDasharray={`${seg.dash} ${seg.gap}`}
                            strokeDashoffset={-seg.offset}
                            strokeLinecap="round"
                            style={{
                                transformOrigin: `${cx}px ${cy}px`,
                                transform: "rotate(-90deg)",
                                transition: `stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1) ${seg.delay}s`,
                                filter: `drop-shadow(0 0 6px ${seg.color}88)`,
                            }}
                        />
                    ))}
                </svg>
                <div className="cc-donut-center">
                    <span className="cc-donut-total">{total}</span>
                    <span className="cc-donut-total-label">Total</span>
                </div>
            </div>
            <div className="cc-donut-legend">
                {legendItems.map((item, i) => (
                    <div className="cc-legend-item" key={i}>
                        <div className="cc-legend-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}88` }} />
                        <div className="cc-legend-info">
                            <span className="cc-legend-name">{item.label}</span>
                            <span className="cc-legend-val">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Status badge ── */
function StatusBadge({ status }) {
    const map = {
        ontime:   { cls: "badge-ontime",   icon: "●", label: "On-Time"  },
        delayed:  { cls: "badge-delayed",  icon: "▲", label: "Delayed"  },
        boarding: { cls: "badge-boarding", icon: "◆", label: "Boarding" },
        landed:   { cls: "badge-landed",   icon: "✔", label: "Landed"   },
    };
    const s = map[status] || map.ontime;
    return <span className={`cc-badge ${s.cls}`}>{s.icon} {s.label}</span>;
}

/* ── KPI Card ── */
function KpiCard({ theme, icon, value, suffix, label, sub, badge, badgeType, barPct }) {
    const isNum = typeof value === "number";
    const count = useCounter(isNum ? value : 0, 1300);
    return (
        <div className={`cc-kpi-card kpi-${theme}`}>
            <div className="cc-kpi-top">
                <div className="cc-kpi-icon">{icon}</div>
                {badge && <span className={`cc-kpi-badge badge-${badgeType || "up"}`}>{badge}</span>}
            </div>
            <div>
                <div className="cc-kpi-value">{isNum ? `${count}${suffix || ""}` : value}</div>
                <div className="cc-kpi-label">{label}</div>
                {sub && <div className="cc-kpi-sub">{sub}</div>}
            </div>
            {barPct !== undefined && (
                <div className="cc-kpi-bar">
                    <div className="cc-kpi-bar-fill" style={{ width: `${barPct}%` }} />
                </div>
            )}
        </div>
    );
}

/* ── Feed item text renderer ── */
function FeedText({ bold, text }) {
    const idx = text.indexOf(bold);
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}<strong>{bold}</strong>{text.slice(idx + bold.length)}
        </span>
    );
}

/* ── Main Component ── */
export function CommandCenter() {
    const [feed, setFeed] = useState(INITIAL_FEED);
    const feedRef = useRef(null);

    useEffect(() => {
        let idx = 0;
        const interval = setInterval(() => {
            const tmpl = NEW_FEED_POOL[idx % NEW_FEED_POOL.length];
            const newItem = {
                id: Date.now(),
                icon: tmpl.icon,
                color: tmpl.color,
                bold: tmpl.bold,
                text: `${tmpl.bold} ${tmpl.tail}`,
                time: "Just now",
            };
            setFeed(prev => [newItem, ...prev.slice(0, 11)]);
            idx++;
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (feedRef.current) feedRef.current.scrollTop = 0;
    }, [feed.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFeed(prev => prev.map(item => {
                if (item.time === "Just now") return { ...item, time: "1 min ago" };
                const m = item.time.match(/^(\d+) min ago$/);
                if (m) return { ...item, time: `${parseInt(m[1]) + 1} min ago` };
                return item;
            }));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="cc-page">

            {/* KPI Row */}
            <div>
                <div className="cc-section-label">AI Performance Metrics</div>
                <div className="cc-kpi-row">
                    <KpiCard theme="purple" icon="🤖" value={94} suffix="%" label="AI Optimizer Score"   sub="vs 88% yesterday"          badge="▲ 6.8%" badgeType="up"   barPct={94} />
                    <KpiCard theme="cyan"   icon="🔄" value={87} suffix="%" label="Turnaround Score"     sub="Avg 23 min gate-to-gate"    badge="▲ 3.2%" badgeType="up"   barPct={87} />
                    <KpiCard theme="green"  icon="⚙️" value={91} suffix="%" label="Resource Optimizer"  sub="Fleet & crew utilization"   badge="Live"   badgeType="live" barPct={91} />
                    <KpiCard theme="amber"  icon="⛽" value={124} suffix="K L" label="Fuel Cost Saved"  sub="₹2.18 Cr today"             badge="▲ 11%"  badgeType="up"   barPct={72} />
                    <KpiCard theme="rose"   icon="⏱️" value={38}  suffix="K"  label="Delay Penalty Saved" sub="₹38K avoided today"       badge="▼ 22%"  badgeType="up"   barPct={62} />
                </div>
            </div>

            {/* Mid Row */}
            <div className="cc-mid-row">

                {/* Flight Overview */}
                <div className="cc-glass-card">
                    <div className="cc-card-header">
                        <span className="cc-card-title">Total Flight Overview</span>
                        <div className="cc-card-dot dot-green" />
                    </div>
                    <DonutChart onTime={4} delayed={2} boarding={1} />
                    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                        {[
                            { label: "On-Time",  count: 4, cls: "badge-ontime"   },
                            { label: "Delayed",  count: 2, cls: "badge-delayed"  },
                            { label: "Boarding", count: 1, cls: "badge-boarding" },
                        ].map(p => (
                            <div key={p.label} className={`cc-badge ${p.cls}`}
                                style={{ flex: 1, justifyContent: "center", padding: "7px 6px", fontSize: 11 }}>
                                {p.count} {p.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Arriving Flights */}
                <div className="cc-glass-card">
                    <div className="cc-card-header">
                        <span className="cc-card-title">Arriving Flights</span>
                        <div className="cc-card-dot dot-amber" />
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="cc-flights-table">
                            <thead>
                                <tr>
                                    <th>Flight</th>
                                    <th>From</th>
                                    <th>ETA</th>
                                    <th>Gate</th>
                                    <th>PAX</th>
                                    <th>Runway</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ARRIVING_FLIGHTS.map(f => (
                                    <tr key={f.id}>
                                        <td>
                                            <div className="cc-flight-num">{f.id}</div>
                                            <div className="cc-flight-airline">{f.airline}</div>
                                        </td>
                                        <td>{f.from}</td>
                                        <td style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{f.eta}</td>
                                        <td><span className="cc-gate-pill">{f.gate}</span></td>
                                        <td>{f.pax}</td>
                                        <td style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{f.runway}</td>
                                        <td><StatusBadge status={f.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="cc-glass-card">
                <div className="cc-card-header">
                    <span className="cc-card-title">Live Activity Feed</span>
                    <span className="cc-live-chip">Live</span>
                </div>
                <div className="cc-feed-list" ref={feedRef}>
                    {feed.map(item => (
                        <div className="cc-feed-item" key={item.id}>
                            <div className={`cc-feed-icon feed-icon-${item.color}`}>{item.icon}</div>
                            <div className="cc-feed-body">
                                <div className="cc-feed-text">
                                    <FeedText bold={item.bold} text={item.text} />
                                </div>
                                <div className="cc-feed-time">{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}