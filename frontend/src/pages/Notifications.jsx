import { useState, useEffect, useRef } from "react";

/* ── SVG icon helper ── */
const Icon = ({ d, size = 16, color = "currentColor", sw = 1.8, fill = "none" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
        strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

/* ── Severity config ── */
const SEV = {
    critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)",  ring: "rgba(239,68,68,0.6)", pulse: true },
    high:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.4)", ring: "rgba(249,115,22,0.5)", pulse: false },
    medium:   { label: "Medium",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)", ring: "rgba(251,191,36,0.4)", pulse: false },
    low:      { label: "Low",      color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.35)", ring: "rgba(52,211,153,0.4)", pulse: false },
};

/* ── Alert categories ── */
const CATS = {
    weather:    { icon: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z", label: "Weather" },
    runway:     { icon: "M3 17l2-8h14l2 8M5 17h14M12 9V3M9 3h6",          label: "Runway" },
    equipment:  { icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", label: "Equipment" },
    security:   { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",   label: "Security" },
    fuel:       { icon: "M3 22V12M3 12V3l5 4 4-4 4 4 5-4v9M3 12h18",      label: "Fuel" },
    flight:     { icon: "M22 16.5l-9-9-4 4-6-6",                           label: "Flight Ops" },
    system:     { icon: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z", label: "System" },
};

/* ── Seed alert pool (used for live simulation) ── */
const ALERT_POOL = [
    { sev: "critical", cat: "weather",   title: "Severe Crosswind Exceeded",          body: "Crosswind component 22kt on RWY 28L — exceeds aircraft limits. Suspend ops immediately." },
    { sev: "critical", cat: "runway",    title: "FOD Detected — RWY 10R",             body: "Foreign object debris confirmed near touchdown zone. RWY 10R closed pending inspection." },
    { sev: "critical", cat: "security",  title: "Unauthorized Vehicle on Apron",       body: "Vehicle ID UNK-447 entered restricted Zone C without clearance. Security dispatched." },
    { sev: "critical", cat: "fuel",      title: "Fuel Bowser Leak Detected",           body: "Fuel spill alert at Stand 14. Emergency response team activated. Area cordoned." },
    { sev: "high",     cat: "weather",   title: "Low Visibility Warning",             body: "Visibility dropped to 3,200m at runway threshold. CAT I minima in effect." },
    { sev: "high",     cat: "equipment", title: "Ground Power Unit Failure",          body: "GPU Unit 7 at Stand 22 offline. Aircraft EI-DVM has no ground power. Spare dispatched." },
    { sev: "high",     cat: "flight",    title: "Pushback Delay — Stand 31",          body: "TUG-09 tow bar failure. AI-234 departure delayed 18 min. Alternate tug assigned." },
    { sev: "high",     cat: "runway",    title: "Brake Fluid Detected on Taxiway B",  body: "Maintenance crew en route. Taxiway B partially restricted pending cleanup." },
    { sev: "high",     cat: "system",    title: "FIDS Outage — Terminal 2",           body: "Flight info displays in T2 departure hall offline. IT team notified. ETA fix: 15 min." },
    { sev: "medium",   cat: "weather",   title: "Wind Shear Advisory",               body: "Moderate wind shear reported at 1,200ft on approach. Crews alerted." },
    { sev: "medium",   cat: "equipment", title: "Conveyor Belt Fault — Belt 5",       body: "Baggage belt 5 intermittent fault. Manual handling activated as contingency." },
    { sev: "medium",   cat: "fuel",      title: "Fuel Truck Queue Exceeding 12 min",  body: "High turnaround demand. 3 aircraft waiting for refuelling at North Apron." },
    { sev: "medium",   cat: "flight",    title: "Gate Change — Flight AI-109",        body: "Gate changed from A12 to B07. Ramp crew and catering redirected." },
    { sev: "medium",   cat: "security",  title: "Passenger Screened — Secondary",     body: "Passenger requiring secondary screening at Gate C4. Departure may be impacted." },
    { sev: "low",      cat: "system",    title: "Routine Backup Completed",           body: "Nightly database backup completed successfully at 02:14 UTC." },
    { sev: "low",      cat: "equipment", title: "Scheduled Maintenance — TUG-03",     body: "TUG-03 due for 500hr service at 06:00. Replacement TUG-11 pre-positioned." },
    { sev: "low",      cat: "weather",   title: "Cloud Ceiling Update",              body: "Ceiling raised to 3,400ft. IFR restrictions lifted on RWY 10L." },
    { sev: "low",      cat: "flight",    title: "Early Arrival — Flight EK-512",      body: "EK-512 estimated 9 min early. Stand 17 prep teams alerted." },
];

let _idCounter = 100;
const makeAlert = (override = {}) => {
    const pool = override.sev
        ? ALERT_POOL.filter(a => a.sev === override.sev)
        : ALERT_POOL;
    const tpl = pool[Math.floor(Math.random() * pool.length)];
    return {
        id: ++_idCounter,
        sev: tpl.sev,
        cat: tpl.cat,
        title: tpl.title,
        body: tpl.body,
        ts: new Date(),
        read: false,
        ...override,
    };
};

/* ── Seed initial alerts ── */
const seed = () => {
    const now = Date.now();
    return ALERT_POOL.slice(0, 14).map((tpl, i) => ({
        id: i + 1,
        sev: tpl.sev,
        cat: tpl.cat,
        title: tpl.title,
        body: tpl.body,
        ts: new Date(now - (14 - i) * 47000),
        read: i > 6,
    }));
};

/* ── Time formatter ── */
const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

/* ── Alert Row ── */
function AlertRow({ alert, onRead, onDismiss }) {
    const s = SEV[alert.sev];
    const cat = CATS[alert.cat] || CATS.system;
    const [visible, setVisible] = useState(true);
    const [fresh, setFresh] = useState(alert.fresh);

    useEffect(() => {
        if (fresh) { const t = setTimeout(() => setFresh(false), 1500); return () => clearTimeout(t); }
    }, [fresh]);

    if (!visible) return null;

    return (
        <div
            onClick={() => onRead(alert.id)}
            style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 18px",
                background: fresh
                    ? s.bg.replace("0.1", "0.22").replace("0.12", "0.22").replace("0.13", "0.22").replace("0.15", "0.28")
                    : alert.read ? "rgba(255,255,255,0.02)" : s.bg,
                border: `1px solid ${alert.read ? "rgba(255,255,255,0.07)" : s.border}`,
                borderRadius: 14, cursor: "pointer",
                transition: "all 0.35s ease",
                opacity: alert.read ? 0.6 : 1,
                transform: fresh ? "translateX(-4px)" : "translateX(0)",
                animation: fresh ? `slideIn 0.35s ease` : "none",
            }}
        >
            {/* Severity dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 2 }}>
                <span style={{
                    width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0,
                    boxShadow: alert.read ? "none" : `0 0 8px ${s.ring}`,
                    animation: s.pulse && !alert.read ? "sevPulse 1.6s ease-in-out infinite" : "none",
                }} />
            </div>

            {/* Cat icon */}
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${s.color}20`, border: `1px solid ${s.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={cat.icon} size={15} color={s.color} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: alert.read ? "rgba(255,255,255,0.5)" : "#fff", fontFamily: "'Syne',sans-serif" }}>{alert.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "1px 7px", textTransform: "uppercase" }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "1px 7px" }}>{cat.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, margin: 0 }}>{alert.body}</p>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{timeAgo(alert.ts)}</span>
                <button
                    onClick={e => { e.stopPropagation(); setVisible(false); setTimeout(() => onDismiss(alert.id), 300); }}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

/* ── Filter chip ── */
function FilterChip({ label, color, count, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 14px",
            background: active ? `${color}22` : "rgba(255,255,255,0.04)",
            border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
            color: active ? color : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? color : "rgba(255,255,255,0.2)", boxShadow: active ? `0 0 5px ${color}` : "none" }} />
            {label}
            {count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: active ? color : "rgba(255,255,255,0.1)", color: active ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 20, padding: "0 6px", lineHeight: "18px" }}>
                    {count}
                </span>
            )}
        </button>
    );
}

/* ── Stat badge ── */
function StatBadge({ label, value, color }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 600, letterSpacing: "0.05em" }}>{label}</div>
        </div>
    );
}

/* ── Main Component ── */
export function Notifications() {
    const [alerts, setAlerts] = useState(seed);
    const [filters, setFilters] = useState({ critical: true, high: true, medium: true, low: true });
    const [catFilter, setCatFilter] = useState("all");
    const [live, setLive] = useState(true);
    const [search, setSearch] = useState("");
    const [, tick] = useState(0);
    const liveRef = useRef(live);
    liveRef.current = live;

    /* Re-render timestamps every 30s */
    useEffect(() => { const t = setInterval(() => tick(n => n + 1), 30000); return () => clearInterval(t); }, []);

    /* Live feed simulation */
    useEffect(() => {
        const t = setInterval(() => {
            if (!liveRef.current) return;
            const newAlert = { ...makeAlert(), fresh: true };
            setAlerts(prev => [newAlert, ...prev].slice(0, 80));
        }, 7000);
        return () => clearInterval(t);
    }, []);

    const toggleFilter = (sev) => setFilters(f => ({ ...f, [sev]: !f[sev] }));
    const markRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
    const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    const clearRead = () => setAlerts(prev => prev.filter(a => !a.read));

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    alerts.forEach(a => { if (!a.read) counts[a.sev]++; });
    const totalUnread = Object.values(counts).reduce((s, v) => s + v, 0);

    const visible = alerts.filter(a => {
        if (!filters[a.sev]) return false;
        if (catFilter !== "all" && a.cat !== catFilter) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.body.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="page notifications" style={{ alignItems: "flex-start" }}>
            <style>{`
                @keyframes sevPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
            `}</style>

            <div style={{ width: "100%", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22, fontFamily: "'DM Sans',sans-serif", overflowY: "auto", maxHeight: "100%" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div>
                        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
                            Live Alert Feed
                            {totalUnread > 0 && (
                                <span style={{ marginLeft: 10, fontSize: 13, background: "#ef4444", color: "#fff", borderRadius: 20, padding: "2px 9px", fontWeight: 700, verticalAlign: "middle", boxShadow: "0 0 10px rgba(239,68,68,0.5)", animation: "sevPulse 2s ease-in-out infinite" }}>
                                    {totalUnread}
                                </span>
                            )}
                        </h2>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Real-time ground operations alerts · {alerts.length} total</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => setLive(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: live ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${live ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, color: live ? "#34d399" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: live ? "#34d399" : "rgba(255,255,255,0.2)", boxShadow: live ? "0 0 6px #34d399" : "none", animation: live ? "sevPulse 1.5s ease-in-out infinite" : "none" }} />
                            {live ? "Live" : "Paused"}
                        </button>
                        <button onClick={markAllRead} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>Mark all read</button>
                        <button onClick={clearRead} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>Clear read</button>
                    </div>
                </div>

                {/* ── Stats row ── */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <StatBadge label="Critical" value={alerts.filter(a => a.sev === "critical" && !a.read).length} color="#ef4444" />
                    <StatBadge label="High"     value={alerts.filter(a => a.sev === "high"     && !a.read).length} color="#f97316" />
                    <StatBadge label="Medium"   value={alerts.filter(a => a.sev === "medium"   && !a.read).length} color="#fbbf24" />
                    <StatBadge label="Low"      value={alerts.filter(a => a.sev === "low"      && !a.read).length} color="#34d399" />
                    <div style={{ flex: 1 }} />
                    {/* Search */}
                    <div style={{ position: "relative", alignSelf: "center" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search alerts…"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px 8px 34px", fontSize: 13, color: "#fff", outline: "none", width: 200, fontFamily: "'DM Sans',sans-serif" }}
                        />
                    </div>
                </div>

                {/* ── Severity Filters ── */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginRight: 4 }}>Severity</span>
                    {Object.entries(SEV).map(([key, s]) => (
                        <FilterChip key={key} label={s.label} color={s.color} count={counts[key]} active={filters[key]} onClick={() => toggleFilter(key)} />
                    ))}
                    <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginRight: 4 }}>Category</span>
                    {[{ id: "all", label: "All" }, ...Object.entries(CATS).map(([id, c]) => ({ id, label: c.label }))].map(({ id, label }) => (
                        <button key={id} onClick={() => setCatFilter(id)} style={{ padding: "7px 12px", background: catFilter === id ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${catFilter === id ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.09)"}`, borderRadius: 10, fontSize: 12, color: catFilter === id ? "#c4b5fd" : "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: catFilter === id ? 700 : 400 }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Alert list ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {visible.length === 0 ? (
                        <div style={{ padding: "48px 24px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🔕</div>
                            No alerts match your current filters
                        </div>
                    ) : visible.map(alert => (
                        <AlertRow key={alert.id} alert={alert} onRead={markRead} onDismiss={dismiss} />
                    ))}
                </div>

                {visible.length > 0 && (
                    <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", paddingBottom: 8 }}>
                        Showing {visible.length} of {alerts.length} alerts · New alerts appear every ~7 seconds when Live is on
                    </div>
                )}
            </div>
        </div>
    );
}
