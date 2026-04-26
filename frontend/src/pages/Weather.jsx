import { useState, useEffect, useCallback } from "react";

const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.8 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const ICONS = {
    wind:      "M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2",
    eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    droplet:   "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
    key:       "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    map:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    save:      "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
    check:     "M20 6L9 17l-5-5",
    refresh:   "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15",
    gauge:     "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 6v6l4 2",
    crosswind: "M5 12h14M12 5l7 7-7 7",
};

const degToCompass = (deg) => {
    const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
};
const mpsToKnots = (mps) => (mps * 1.94384).toFixed(1);
const kelvinToCelsius = (k) => (k - 273.15).toFixed(1);
const metersToFt = (m) => Math.round(m * 3.28084);

function AlertBadge({ type, message, detail }) {
    const cfg = {
        danger:  { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)",  dot: "#ef4444", label: "ALERT" },
        warning: { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.4)", dot: "#fbbf24", label: "WARNING" },
        ok:      { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.4)", dot: "#34d399", label: "NORMAL" },
    };
    const c = cfg[type] || cfg.ok;
    return (
        <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${c.dot}` }} />
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: c.dot, marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{message}</div>
                {detail && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{detail}</div>}
            </div>
        </div>
    );
}

function StatTile({ icon, label, value, unit, sub }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={icon} size={14} color="rgba(167,139,250,0.9)" />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{value ?? "—"}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{unit}</span>
            </div>
            {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{sub}</div>}
        </div>
    );
}

function HourlyCard({ time, icon, temp, wind, desc, pop }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", minWidth: 120, flex: "0 0 120px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{time}</div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{temp}°</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{desc}</div>
            <div style={{ fontSize: 11, color: "rgba(96,165,250,0.8)", marginTop: 3 }}>💨 {wind}kt</div>
            {pop > 0 && <div style={{ fontSize: 11, color: "rgba(96,165,250,0.7)", marginTop: 2 }}>🌧 {pop}%</div>}
        </div>
    );
}

function ApiConfigPanel({ config, onChange, onSave, saved }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Icon d={ICONS.key} size={16} color="#a78bfa" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif", margin: 0 }}>API Configuration</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                    { key: "apiKey", label: "OpenWeatherMap API Key", placeholder: "Enter your API key…", type: "password", icon: ICONS.key, full: true },
                    { key: "lat", label: "Latitude", placeholder: "e.g. 28.5562", type: "text", icon: ICONS.map },
                    { key: "lon", label: "Longitude", placeholder: "e.g. 77.1000", type: "text", icon: ICONS.map },
                ].map(({ key, label, placeholder, type, icon, full }) => (
                    <div key={key} style={{ gridColumn: full ? "1/-1" : "auto" }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>{label}</label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(167,139,250,0.6)" }}>
                                <Icon d={icon} size={14} />
                            </span>
                            <input
                                type={type}
                                value={config[key] || ""}
                                onChange={e => onChange(key, e.target.value)}
                                placeholder={placeholder}
                                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px 10px 36px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
                <button onClick={onSave}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
                    <Icon d={ICONS.save} size={14} />Save & Fetch
                </button>
                {saved && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#34d399" }}><Icon d={ICONS.check} size={13} color="#34d399" /> Saved</span>}
            </div>
        </div>
    );
}

const owmEmoji = (icon) => {
    if (!icon) return "🌡️";
    if (icon.startsWith("01")) return "☀️";
    if (icon.startsWith("02")) return "🌤️";
    if (icon.startsWith("03")) return "🌥️";
    if (icon.startsWith("04")) return "☁️";
    if (icon.startsWith("09")) return "🌧️";
    if (icon.startsWith("10")) return "🌦️";
    if (icon.startsWith("11")) return "⛈️";
    if (icon.startsWith("13")) return "❄️";
    if (icon.startsWith("50")) return "🌫️";
    return "🌡️";
};

const DEMO = {
    current: { temp: 28.4, feelsLike: 31.2, humidity: 62, pressure: 1012, windSpeed: 6.2, windDeg: 220, windGust: 9.1, visibility: 4200, clouds: 30, desc: "Broken Clouds", icon: "03d", name: "Demo Airport (VIDP)" },
    hourly: [
        { dt: 0, temp: 28, windSpeed: 6.1, windDeg: 215, pop: 0, icon: "03d", desc: "Partly Cloudy" },
        { dt: 3, temp: 29, windSpeed: 7.4, windDeg: 228, pop: 5,  icon: "02d", desc: "Mostly Clear" },
        { dt: 6, temp: 31, windSpeed: 8.0, windDeg: 230, pop: 10, icon: "01d", desc: "Sunny" },
        { dt: 9, temp: 32, windSpeed: 9.2, windDeg: 240, pop: 15, icon: "01d", desc: "Sunny" },
        { dt: 12, temp: 30, windSpeed: 10.1, windDeg: 250, pop: 25, icon: "10d", desc: "Light Rain" },
        { dt: 15, temp: 27, windSpeed: 8.5, windDeg: 260, pop: 40, icon: "09d", desc: "Showers" },
        { dt: 18, temp: 25, windSpeed: 7.0, windDeg: 245, pop: 20, icon: "04n", desc: "Cloudy" },
        { dt: 21, temp: 24, windSpeed: 5.5, windDeg: 210, pop: 10, icon: "02n", desc: "Clear Night" },
    ],
};

export function WeatherPage() {
    const [config, setConfig] = useState(() => { try { return JSON.parse(localStorage.getItem("wx_config") || "{}"); } catch { return {}; } });
    const [configDraft, setConfigDraft] = useState({ apiKey: "", lat: "", lon: "" });
    const [saved, setSaved] = useState(false);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showConfig, setShowConfig] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        setConfigDraft({ apiKey: config.apiKey || "", lat: config.lat || "", lon: config.lon || "" });
    }, [config]);

    const fetchWeather = useCallback(async (cfg) => {
        if (!cfg.apiKey || !cfg.lat || !cfg.lon) { setWeather(DEMO); setIsDemo(true); return; }
        setLoading(true); setError(null); setIsDemo(false);
        try {
            const [curRes, foreRes] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cfg.lat}&lon=${cfg.lon}&appid=${cfg.apiKey}`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cfg.lat}&lon=${cfg.lon}&appid=${cfg.apiKey}&cnt=8`),
            ]);
            if (!curRes.ok) throw new Error(`API Error ${curRes.status} — check key / coords`);
            const cur = await curRes.json();
            const fore = await foreRes.json();
            setWeather({
                current: {
                    temp: parseFloat(kelvinToCelsius(cur.main.temp)),
                    feelsLike: parseFloat(kelvinToCelsius(cur.main.feels_like)),
                    humidity: cur.main.humidity, pressure: cur.main.pressure,
                    windSpeed: cur.wind.speed, windDeg: cur.wind.deg,
                    windGust: cur.wind.gust || cur.wind.speed,
                    visibility: cur.visibility, clouds: cur.clouds.all,
                    desc: cur.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
                    icon: cur.weather[0].icon, name: cur.name,
                },
                hourly: fore.list.map(h => ({
                    dt: h.dt, temp: parseFloat(kelvinToCelsius(h.main.temp)),
                    windSpeed: h.wind.speed, windDeg: h.wind.deg,
                    pop: Math.round((h.pop || 0) * 100),
                    icon: h.weather[0].icon,
                    desc: h.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
                })),
            });
            setLastUpdated(new Date());
        } catch (e) { setError(e.message); setWeather(DEMO); setIsDemo(true); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (config.apiKey) fetchWeather(config);
        else { setWeather(DEMO); setIsDemo(true); }
    }, []);

    const handleSave = () => {
        const newCfg = { apiKey: configDraft.apiKey.trim(), lat: configDraft.lat.trim(), lon: configDraft.lon.trim() };
        localStorage.setItem("wx_config", JSON.stringify(newCfg));
        setConfig(newCfg); setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setShowConfig(false);
        fetchWeather(newCfg);
    };

    const wx = weather?.current;
    const hourly = weather?.hourly || [];
    const windKt = wx ? parseFloat(mpsToKnots(wx.windSpeed)) : 0;
    const gustKt = wx ? parseFloat(mpsToKnots(wx.windGust)) : 0;
    const rwyHeading = 280;
    const crosswindAngle = wx ? Math.abs(Math.sin(((wx.windDeg - rwyHeading) * Math.PI) / 180)) : 0;
    const crosswindKt = (windKt * crosswindAngle).toFixed(1);
    const lowVis = wx && wx.visibility < 5000;
    const veryLowVis = wx && wx.visibility < 1000;
    const highCrosswind = parseFloat(crosswindKt) > 15;
    const moderateCrosswind = !highCrosswind && parseFloat(crosswindKt) > 8;
    const highWind = windKt > 25;

    const hourFmt = (dt) => {
        if (isDemo) return `+${dt}h`;
        return new Date(dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    return (
        <div className="page settings" style={{ alignItems: "flex-start" }}>
            <div style={{ width: "100%", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans',sans-serif", overflowY: "auto" }}>

                {/* Top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
                            {wx ? wx.name : "Weather Intelligence"}
                        </h2>
                        {lastUpdated && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Updated {lastUpdated.toLocaleTimeString()}</p>}
                        {isDemo && <p style={{ fontSize: 12, color: "#fbbf24", marginTop: 2 }}>⚡ Demo data — configure API key to fetch live weather</p>}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => fetchWeather(config)} disabled={loading}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 13, cursor: "pointer" }}>
                            <Icon d={ICONS.refresh} size={14} color={loading ? "#a78bfa" : "currentColor"} />
                            {loading ? "Fetching…" : "Refresh"}
                        </button>
                        <button onClick={() => setShowConfig(v => !v)}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: showConfig ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)", border: `1px solid ${showConfig ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, color: "#fff", fontSize: 13, cursor: "pointer" }}>
                            <Icon d={ICONS.key} size={14} />API Config
                        </button>
                    </div>
                </div>

                {/* API Config */}
                {showConfig && (
                    <ApiConfigPanel config={configDraft} onChange={(k, v) => setConfigDraft(p => ({ ...p, [k]: v }))} onSave={handleSave} saved={saved} />
                )}

                {/* Error */}
                {error && <AlertBadge type="warning" message="Fetch failed — showing demo data" detail={error} />}

                {/* Alerts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Operational Alerts</div>
                    {veryLowVis && <AlertBadge type="danger" message="Severe Low Visibility — CAT III conditions" detail={`Current: ${wx.visibility}m — Ground ops severely restricted. All vehicles require escort.`} />}
                    {!veryLowVis && lowVis && <AlertBadge type="warning" message="Low Visibility Alert — Reduced operations" detail={`Visibility: ${wx.visibility}m (${metersToFt(wx.visibility)}ft) — Below 5,000m threshold. Enhanced lighting required.`} />}
                    {!lowVis && wx && <AlertBadge type="ok" message="Visibility Normal" detail={`${wx.visibility.toLocaleString()}m (${metersToFt(wx.visibility).toLocaleString()}ft) — No restrictions`} />}
                    {highCrosswind && <AlertBadge type="danger" message={`High Crosswind Alert — ${crosswindKt}kt crosswind component`} detail={`Wind ${Math.round(windKt)}kt from ${wx?.windDeg}° (${degToCompass(wx?.windDeg || 0)}). Exceeds 15kt limit for active runway.`} />}
                    {moderateCrosswind && <AlertBadge type="warning" message={`Crosswind Advisory — ${crosswindKt}kt component`} detail={`Wind ${Math.round(windKt)}kt from ${wx?.windDeg}° — Monitor crosswind on active runway.`} />}
                    {!highCrosswind && !moderateCrosswind && wx && <AlertBadge type="ok" message="Crosswind Within Limits" detail={`Crosswind component: ${crosswindKt}kt — Normal operations`} />}
                    {highWind && wx && <AlertBadge type="danger" message={`High Wind Warning — ${Math.round(windKt)}kt sustained`} detail={`Gusting to ${Math.round(gustKt)}kt. Ramp operations and aircraft pushback restricted.`} />}
                </div>

                {/* Current + Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
                    <div style={{ background: "linear-gradient(145deg,rgba(124,58,237,0.2),rgba(79,70,229,0.12))", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 18, padding: "28px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 52, marginBottom: 8 }}>{owmEmoji(wx?.icon)}</div>
                        <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{wx ? `${wx.temp}°` : "—"}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Feels like {wx?.feelsLike ?? "—"}°C</div>
                        <div style={{ fontSize: 13, color: "rgba(167,139,250,0.9)", marginTop: 8, fontWeight: 600 }}>{wx?.desc ?? "—"}</div>
                        <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>☁️ {wx?.clouds ?? "—"}% cloud cover</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                        <StatTile icon={ICONS.wind} label="Wind Speed" value={wx ? Math.round(windKt) : null} unit="kt" sub={`${wx?.windSpeed ?? "—"} m/s · ${degToCompass(wx?.windDeg || 0)} (${wx?.windDeg ?? "—"}°)`} />
                        <StatTile icon={ICONS.wind} label="Wind Gust" value={wx ? Math.round(gustKt) : null} unit="kt" sub={`${wx?.windGust ?? "—"} m/s peak`} />
                        <StatTile icon={ICONS.crosswind} label="Crosswind" value={crosswindKt} unit="kt" sub={`Active RWY · ${highCrosswind ? "⚠ Exceeds limit" : "Within limits"}`} />
                        <StatTile icon={ICONS.eye} label="Visibility" value={wx ? wx.visibility.toLocaleString() : null} unit="m" sub={wx ? `${metersToFt(wx.visibility).toLocaleString()} ft` : null} />
                        <StatTile icon={ICONS.droplet} label="Humidity" value={wx?.humidity} unit="%" sub="Relative humidity" />
                        <StatTile icon={ICONS.gauge} label="Pressure" value={wx?.pressure} unit="hPa" sub="QNH (approx)" />
                    </div>
                </div>

                {/* Hourly Forecast */}
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Hourly Forecast</div>
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                        {hourly.map((h, i) => (
                            <HourlyCard key={i} time={hourFmt(h.dt)} icon={owmEmoji(h.icon)} temp={h.temp} wind={mpsToKnots(h.windSpeed)} desc={h.desc} pop={h.pop} />
                        ))}
                    </div>
                </div>

                {/* Wind Compass + Visibility CAT */}
                {wx && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "20px 24px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Wind Direction Compass</div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <svg width="150" height="150" viewBox="0 0 150 150">
                                    <circle cx="75" cy="75" r="68" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                                    <circle cx="75" cy="75" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                                    {["N","E","S","W"].map((d, i) => {
                                        const angle = i * 90;
                                        const rad = (angle - 90) * Math.PI / 180;
                                        return <text key={d} x={75 + 62 * Math.cos(rad)} y={75 + 62 * Math.sin(rad) + 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Syne">{d}</text>;
                                    })}
                                    <g transform={`rotate(${wx.windDeg}, 75, 75)`}>
                                        <line x1="75" y1="75" x2="75" y2="28" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                                        <polygon points="75,22 70,36 80,36" fill="#a78bfa" />
                                        <line x1="75" y1="75" x2="75" y2="120" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <circle cx="75" cy="75" r="4" fill="#a78bfa" />
                                    <text x="75" y="96" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Syne" fontWeight="bold">{degToCompass(wx.windDeg)} {Math.round(windKt)}kt</text>
                                </svg>
                            </div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "20px 24px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Visibility Category</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[{ label: "CAT I", min: 5000, color: "#34d399" }, { label: "CAT II", min: 2000, color: "#fbbf24" }, { label: "CAT III", min: 800, color: "#ef4444" }].map(({ label, min, color }) => {
                                    const active = wx.visibility >= min;
                                    return (
                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: active ? `${color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? color : "rgba(255,255,255,0.15)", boxShadow: active ? `0 0 6px ${color}` : "none" }} />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "rgba(255,255,255,0.3)" }}>{label}</span>
                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>≥ {min.toLocaleString()}m</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: active ? color : "rgba(255,255,255,0.2)" }}>{active ? "OK" : "BELOW"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}