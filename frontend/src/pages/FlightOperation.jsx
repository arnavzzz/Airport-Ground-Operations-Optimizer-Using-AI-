import { useState, useEffect } from "react";
import { getLiveFlights } from "../api";
import "../styles/flightops.css";

const AIRLINES = ["IndiGo", "Air India", "SpiceJet", "Vistara", "GoFirst", "AirAsia"];
const STATUSES = ["On Time", "Delayed", "Boarding", "Departed", "Arrived", "Cancelled"];
const STATUS_COLOR = {
    "On Time":  "#22d3ee",
    "Delayed":  "#f59e0b",
    "Boarding": "#a78bfa",
    "Departed": "#34d399",
    "Arrived":  "#60a5fa",
    "Cancelled":"#f87171",
};
const RUNWAYS = ["RWY 09L", "RWY 09R", "RWY 27L", "RWY 27R"];
const BAYS = ["Bay A1","Bay A2","Bay A3","Bay B1","Bay B2","Bay C1","Bay C2","Bay D1"];

function randBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pad(n) { return String(n).padStart(2, "0"); }
function fmtTime(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function addMin(d, m) { return new Date(d.getTime() + m * 60000); }

function genFlights(n = 14) {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
        const sched = addMin(now, randBetween(-90, 180));
        const delay = randBetween(-5, 45);
        const actual = addMin(sched, delay);
        const status = STATUSES[randBetween(0, STATUSES.length - 1)];
        const gate = `G${randBetween(1, 24)}`;
        const assignedGate = Math.random() > 0.3 ? gate : `G${randBetween(1, 24)}`;
        const airline = AIRLINES[randBetween(0, AIRLINES.length - 1)];
        const prefix = airline.slice(0, 2).toUpperCase();
        const flightId = `${prefix}${randBetween(100, 999)}`;
        const isArrival = Math.random() > 0.5;
        const runway = RUNWAYS[randBetween(0, RUNWAYS.length - 1)];
        const bay = BAYS[randBetween(0, BAYS.length - 1)];
        const turnaround = randBetween(25, 95);
        return {
            id: `FL-${1000 + i}`,
            flightId, airline, status, gate, assignedGate,
            scheduledTime: fmtTime(sched),
            actualTime: fmtTime(actual),
            scheduledDep: fmtTime(addMin(sched, randBetween(60, 180))),
            actualDep: fmtTime(addMin(actual, randBetween(60, 200))),
            runway, bay, turnaround,
            turnaroundScore: randBetween(55, 100),
            isArrival, delay,
        };
    });
}

function normalizeFlight(f, index) {
    return {
        ...f,
        id: f.id || `FL-BE-${index}`,
        flightId: f.flightId || "N/A",
        airline: f.airline || "Unknown",
        status: f.status || "On Time",
        gate: f.gate || "TBD",
        assignedGate: f.assignedGate || f.gate || "TBD",
        scheduledTime: f.scheduledTime || "N/A",
        actualTime: f.actualTime || f.scheduledTime || "N/A",
        scheduledDep: f.scheduledDep || "N/A",
        actualDep: f.actualDep || f.scheduledDep || "N/A",
        runway: f.runway || "TBD",
        bay: f.bay || "TBD",
        turnaround: Number(f.turnaround ?? 0),
        turnaroundScore: Number(f.turnaroundScore ?? 0),
        isArrival: Boolean(f.isArrival),
        delay: Number(f.delay ?? 0),
    };
}

function LiveFlightFeed({ flights }) {
    const [filter, setFilter] = useState("All");
    const filters = ["All", "Arrivals", "Departures", "Delayed", "Boarding"];
    const filtered = flights.filter(f => {
        if (filter === "All") return true;
        if (filter === "Arrivals") return f.isArrival;
        if (filter === "Departures") return !f.isArrival;
        if (filter === "Delayed") return f.status === "Delayed";
        if (filter === "Boarding") return f.status === "Boarding";
        return true;
    });
    return (
        <section className="fo-section">
            <div className="fo-section-header">
                <div className="fo-section-title"><span className="fo-pulse-dot" />Live Flight Feed</div>
                <div className="fo-filter-tabs">
                    {filters.map(f => (
                        <button key={f} className={`fo-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                    ))}
                </div>
            </div>
            <div className="fo-table-wrap">
                <table className="fo-table">
                    <thead><tr>
                        <th>Flight</th><th>Airline</th><th>Status</th>
                        <th>Gate</th><th>Arrival</th><th>Departure</th><th>Runway</th>
                    </tr></thead>
                    <tbody>
                        {filtered.map(f => (
                            <tr key={f.id} className="fo-flight-row">
                                <td><span className="fo-flight-id">{f.flightId}</span></td>
                                <td>{f.airline}</td>
                                <td><span className="fo-badge" style={{"--bclr": STATUS_COLOR[f.status]}}>{f.status}</span></td>
                                <td>{f.gate}</td>
                                <td>
                                    <div className="fo-time-cell">
                                        <span className="fo-sched">{f.scheduledTime}</span>
                                        <span className="fo-actual" style={{color: f.delay > 5 ? "#f59e0b" : "#34d399"}}>{f.actualTime}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="fo-time-cell">
                                        <span className="fo-sched">{f.scheduledDep}</span>
                                        <span className="fo-actual" style={{color: f.delay > 5 ? "#f59e0b" : "#34d399"}}>{f.actualDep}</span>
                                    </div>
                                </td>
                                <td><span className="fo-runway-tag">{f.runway}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function TurnaroundTimer({ flights }) {
    return (
        <section className="fo-section fo-half">
            <div className="fo-section-header"><div className="fo-section-title">⏱ Turnaround Timer &amp; Score</div></div>
            <div className="fo-turnaround-grid">
                {flights.slice(0, 6).map(f => {
                    const pct = f.turnaroundScore;
                    const color = pct >= 80 ? "#34d399" : pct >= 60 ? "#f59e0b" : "#f87171";
                    return (
                        <div className="fo-turn-card" key={f.id}>
                            <div className="fo-turn-top">
                                <span className="fo-turn-flight">{f.flightId}</span>
                                <span className="fo-turn-score" style={{color}}>{pct}</span>
                            </div>
                            <div className="fo-turn-bar"><div className="fo-turn-fill" style={{width: `${pct}%`, background: color}} /></div>
                            <div className="fo-turn-bottom">
                                <span>{f.airline}</span>
                                <span style={{color: "#94a3b8"}}>{f.turnaround} min</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function RunwayScheduling({ flights }) {
    const runwayFlights = RUNWAYS.map(r => ({runway: r, flights: flights.filter(f => f.runway === r)}));
    return (
        <section className="fo-section fo-half">
            <div className="fo-section-header"><div className="fo-section-title">✈ Runway Scheduling</div></div>
            <div className="fo-runway-lanes">
                {runwayFlights.map(({runway, flights: rFlights}) => (
                    <div className="fo-runway-lane" key={runway}>
                        <div className="fo-runway-label">{runway}</div>
                        <div className="fo-runway-slots">
                            {rFlights.length === 0
                                ? <span className="fo-empty-slot">No flights</span>
                                : rFlights.map(f => (
                                    <div key={f.id} className="fo-slot" style={{"--sc": STATUS_COLOR[f.status]}}>
                                        <span>{f.flightId}</span>
                                        <span className="fo-slot-time">{f.isArrival ? f.actualTime : f.actualDep}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function GateAssignmentMap({ flights }) {
    const gates = Array.from({length: 24}, (_, i) => {
        const gName = `G${i + 1}`;
        const assigned = flights.find(f => f.assignedGate === gName);
        return {gate: gName, flight: assigned || null};
    });
    return (
        <section className="fo-section">
            <div className="fo-section-header"><div className="fo-section-title">🗺 Gate Assignment Map</div></div>
            <div className="fo-gate-grid">
                {gates.map(({gate, flight}) => (
                    <div key={gate} className={`fo-gate-cell ${flight ? "occupied" : "free"}`}
                        title={flight ? `${flight.flightId} — ${flight.airline}` : "Available"}
                        style={flight ? {"--gc": STATUS_COLOR[flight.status]} : {}}>
                        <div className="fo-gate-name">{gate}</div>
                        {flight && <>
                            <div className="fo-gate-flight">{flight.flightId}</div>
                            <div className="fo-gate-airline">{flight.airline.slice(0,3)}</div>
                        </>}
                        {!flight && <div className="fo-gate-free">Free</div>}
                    </div>
                ))}
            </div>
        </section>
    );
}

function ParkingBayAllocation({ flights }) {
    return (
        <section className="fo-section fo-half">
            <div className="fo-section-header"><div className="fo-section-title">🅿 Parking Bay Allocation</div></div>
            <div className="fo-bay-grid">
                {BAYS.map(bay => {
                    const occupied = flights.filter(f => f.bay === bay);
                    const pct = Math.min(100, (occupied.length / 3) * 100);
                    const clr = pct >= 80 ? "#f87171" : pct >= 50 ? "#f59e0b" : "#34d399";
                    return (
                        <div className="fo-bay-card" key={bay}>
                            <div className="fo-bay-header">
                                <span className="fo-bay-name">{bay}</span>
                                <span className="fo-bay-count" style={{color: clr}}>{occupied.length}/3</span>
                            </div>
                            <div className="fo-bay-bar"><div className="fo-bay-fill" style={{width: `${pct}%`, background: clr}} /></div>
                            <div className="fo-bay-flights">
                                {occupied.slice(0,3).map(f => <span key={f.id} className="fo-bay-tag">{f.flightId}</span>)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function FlightInputForm({ onAdd }) {
    const [form, setForm] = useState({flightId:"",flightName:"",airline:"",gate:"",scheduledTime:"",scheduledDep:""});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    const handle = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

    const submit = async () => {
        if (!form.flightId || !form.airline || !form.gate) return;
        setSubmitting(true);
        setAiResult(null);
        try {
            const resp = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 300,
                    messages: [{
                        role: "user",
                        content: `Given flight ${form.flightId} (${form.airline}) scheduled arrival ${form.scheduledTime || "unknown"} at gate ${form.gate}, return ONLY a JSON object (no markdown) with keys: actualArrival (HH:MM), actualDeparture (HH:MM), assignedGate (like G14), delayReason (brief string). Make it realistic with small variations.`
                    }]
                })
            });
            const data = await resp.json();
            const raw = data.content?.find(b => b.type === "text")?.text || "{}";
            let synced = {};
            try { synced = JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { synced = {}; }
            setAiResult(synced);
            const newFlight = {
                id: `FL-${Date.now()}`,
                flightId: form.flightId,
                flightName: form.flightName || form.flightId,
                airline: form.airline,
                gate: form.gate,
                assignedGate: synced.assignedGate || form.gate,
                scheduledTime: form.scheduledTime || "N/A",
                actualTime: synced.actualArrival || form.scheduledTime || "N/A",
                scheduledDep: form.scheduledDep || "N/A",
                actualDep: synced.actualDeparture || form.scheduledDep || "N/A",
                delayReason: synced.delayReason || "None",
                status: STATUSES[randBetween(0,3)],
                runway: RUNWAYS[randBetween(0,3)],
                bay: BAYS[randBetween(0, BAYS.length-1)],
                turnaround: randBetween(25, 95),
                turnaroundScore: randBetween(60, 100),
                isArrival: true, delay: 0,
                aiSynced: synced,
            };
            onAdd(newFlight);
            setForm({flightId:"",flightName:"",airline:"",gate:"",scheduledTime:"",scheduledDep:""});
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch(err) { console.error(err); }
        setSubmitting(false);
    };

    return (
        <section className="fo-section fo-half">
            <div className="fo-section-header">
                <div className="fo-section-title">➕ Flight Input</div>
                {success && <span className="fo-success-tag">✓ Added &amp; AI Synced</span>}
            </div>
            <div className="fo-form-grid">
                {[
                    ["flightId",     "Flight ID",        "e.g. AI302"],
                    ["flightName",   "Flight Name",      "e.g. Mumbai Express"],
                    ["airline",      "Airline Name",     "e.g. Air India"],
                    ["gate",         "Gate",             "e.g. G14"],
                    ["scheduledTime","Scheduled Arrival","HH:MM"],
                    ["scheduledDep", "Scheduled Depart", "HH:MM"],
                ].map(([name, label, ph]) => (
                    <div className="fo-field" key={name}>
                        <label className="fo-label">{label}</label>
                        <input className="fo-input" name={name} placeholder={ph} value={form[name]} onChange={handle} />
                    </div>
                ))}
            </div>
            <button className={`fo-submit-btn ${submitting ? "loading" : ""}`} onClick={submit} disabled={submitting}>
                {submitting ? <><span className="fo-spinner" /> AI Syncing…</> : "Add Flight & Sync with AI"}
            </button>
            {aiResult && (
                <div className="fo-ai-preview">
                    <div className="fo-ai-preview-title">🤖 AI Synced Response</div>
                    <div className="fo-ai-preview-grid">
                        <div><span>Actual Arrival</span><strong>{aiResult.actualArrival}</strong></div>
                        <div><span>Actual Departure</span><strong>{aiResult.actualDeparture}</strong></div>
                        <div><span>Assigned Gate</span><strong style={{color:"#a78bfa"}}>{aiResult.assignedGate}</strong></div>
                        <div><span>Delay Reason</span><strong style={{color:"#f59e0b"}}>{aiResult.delayReason}</strong></div>
                    </div>
                </div>
            )}
        </section>
    );
}

function AISyncedPanel({ flights }) {
    const autoItems = flights.slice(0, 6).map(f => ({
        ...f,
        aiSynced: f.aiSynced || {
            actualArrival: f.actualTime,
            actualDeparture: f.actualDep,
            assignedGate: f.assignedGate,
            delayReason: f.delay > 10 ? "Weather / ATC Hold" : "On Schedule",
        }
    }));

    return (
        <section className="fo-section">
            <div className="fo-section-header">
                <div className="fo-section-title">🤖 AI Synced Data</div>
                <span className="fo-ai-badge">AI Powered</span>
            </div>
            <div className="fo-ai-list">
                {autoItems.map((f, i) => (
                    <div className="fo-ai-row" key={f.id + i}>
                        <div className="fo-ai-flight">
                            <span className="fo-ai-id">{f.flightId}</span>
                            <span className="fo-ai-airline">{f.airline}</span>
                        </div>
                        <div className="fo-ai-data">
                            <div className="fo-ai-item">
                                <span className="fo-ai-lbl">Actual Arrival</span>
                                <span className="fo-ai-val">{f.aiSynced.actualArrival}</span>
                            </div>
                            <div className="fo-ai-item">
                                <span className="fo-ai-lbl">Actual Departure</span>
                                <span className="fo-ai-val">{f.aiSynced.actualDeparture}</span>
                            </div>
                            <div className="fo-ai-item">
                                <span className="fo-ai-lbl">Assigned Gate</span>
                                <span className="fo-ai-val" style={{color:"#a78bfa"}}>{f.aiSynced.assignedGate}</span>
                            </div>
                            <div className="fo-ai-item fo-ai-wide">
                                <span className="fo-ai-lbl">Delay Reason</span>
                                <span className="fo-ai-val" style={{color:"#f59e0b"}}>{f.aiSynced.delayReason}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function FlightOperations() {
    const [flights, setFlights] = useState(() => genFlights(14));
    const [clock, setClock] = useState(new Date());
    const [feedStatus, setFeedStatus] = useState("Loading feed...");

    useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => {
        let cancelled = false;

        getLiveFlights()
            .then(data => {
                if (cancelled) return;
                const backendFlights = Array.isArray(data.flights) ? data.flights.map(normalizeFlight) : [];
                if (backendFlights.length > 0) {
                    setFlights(backendFlights);
                    setFeedStatus("Django feed connected");
                } else {
                    setFeedStatus("Using demo feed");
                }
            })
            .catch(() => {
                if (!cancelled) setFeedStatus("Using demo feed");
            });

        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        const t = setInterval(() => {
            setFlights(prev => prev.map(f =>
                Math.random() > 0.85 ? {...f, status: STATUSES[randBetween(0, STATUSES.length-1)]} : f
            ));
        }, 5000);
        return () => clearInterval(t);
    }, []);

    const addFlight = f => setFlights(prev => [f, ...prev]);

    const stats = [
        {label: "Total Flights", value: flights.length, icon: "✈"},
        {label: "On Time",       value: flights.filter(f => f.status === "On Time").length,  icon: "✅"},
        {label: "Delayed",       value: flights.filter(f => f.status === "Delayed").length,  icon: "⚠"},
        {label: "Boarding",      value: flights.filter(f => f.status === "Boarding").length, icon: "🚪"},
    ];

    return (
        <div className="fo-page">
            <div className="fo-topbar">
                <div className="fo-topbar-left">
                    <h1 className="fo-title">Flight Operations</h1>
                    <span className="fo-live-tag"><span className="fo-dot" />LIVE</span>
                    <span className="fo-feed-status">{feedStatus}</span>
                </div>
                <div className="fo-clock">
                    {pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())} · {clock.toLocaleDateString("en-IN", {weekday:"short", day:"2-digit", month:"short"})}
                </div>
            </div>
            <div className="fo-stats-bar">
                {stats.map(s => (
                    <div className="fo-stat" key={s.label}>
                        <span className="fo-stat-icon">{s.icon}</span>
                        <div>
                            <div className="fo-stat-val">{s.value}</div>
                            <div className="fo-stat-lbl">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="fo-content">
                <LiveFlightFeed flights={flights} />
                <div className="fo-content-row">
                    <TurnaroundTimer flights={flights} />
                    <RunwayScheduling flights={flights} />
                </div>
                <GateAssignmentMap flights={flights} />
                <div className="fo-content-row">
                    <ParkingBayAllocation flights={flights} />
                    <FlightInputForm onAdd={addFlight} />
                </div>
                <AISyncedPanel flights={flights} />
            </div>
        </div>
    );
}
