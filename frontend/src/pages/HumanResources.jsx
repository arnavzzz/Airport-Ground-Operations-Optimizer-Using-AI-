import { useState, useEffect } from "react";
import "../styles/hr.css";

/* ─── Constants ─────────────────────────────────────────── */
const ROLES = [
    "Ramp Agents","Baggage Handlers","Cleaning Crew",
    "Fuelers","Caterers","Boarding Pass Crew",
    "Technician","Pushback Drivers"
];

const ROLE_ICONS = {
    "Ramp Agents":        "🛬",
    "Baggage Handlers":   "🧳",
    "Cleaning Crew":      "🧹",
    "Fuelers":            "⛽",
    "Caterers":           "🍱",
    "Boarding Pass Crew": "🎫",
    "Technician":         "🔧",
    "Pushback Drivers":   "🚛",
};

const ROLE_COLORS = {
    "Ramp Agents":        "#22d3ee",
    "Baggage Handlers":   "#a78bfa",
    "Cleaning Crew":      "#34d399",
    "Fuelers":            "#f59e0b",
    "Caterers":           "#fb923c",
    "Boarding Pass Crew": "#60a5fa",
    "Technician":         "#f472b6",
    "Pushback Drivers":   "#818cf8",
};

const ACTIVITY_TYPES = ["Checked In","Assigned to Gate","Break","Shift End","Task Complete","Alert"];
const FIRST_NAMES = ["Arjun","Priya","Rahul","Sneha","Vikram","Anita","Raj","Pooja","Suresh","Divya","Karan","Meena","Anil","Nisha","Deepak"];
const LAST_NAMES  = ["Sharma","Patel","Singh","Kumar","Gupta","Mehta","Joshi","Verma","Nair","Reddy"];

function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pad(n){ return String(n).padStart(2,"0"); }
function fmtTime(d){ return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function randName(){ return `${FIRST_NAMES[rand(0,FIRST_NAMES.length-1)]} ${LAST_NAMES[rand(0,LAST_NAMES.length-1)]}`; }

function genStaff(){
    let id = 1001;
    return ROLES.flatMap(role => {
        const total = rand(8,18);
        return Array.from({length: total}, (_,i) => {
            const fatigue = rand(10,98);
            const status = rand(0,9) < 2 ? (rand(0,1)===0 ? "on_leave" : "sick")
                         : fatigue > 80 ? "critical" : rand(0,3)===0 ? "available" : "active";
            return {
                empId: `EMP-${id++}`,
                name: randName(),
                role,
                status,
                fatigue,
                shift: rand(0,1)===0 ? "Morning" : "Evening",
                hoursWorked: rand(1,9),
            };
        });
    });
}

function genFeed(staff){
    return Array.from({length: 20}, (_,i) => {
        const member = staff[rand(0, staff.length-1)];
        const now = new Date();
        const time = new Date(now.getTime() - rand(0, 3600000));
        const type = ACTIVITY_TYPES[rand(0, ACTIVITY_TYPES.length-1)];
        return {
            id: i,
            empId: member.empId,
            name: member.name,
            role: member.role,
            type,
            time: fmtTime(time),
            timestamp: time.getTime(),
        };
    }).sort((a,b) => b.timestamp - a.timestamp);
}

/* ─── Staff Category Overview ────────────────────────────── */
function StaffCategoryOverview({ staff }){
    const categories = ROLES.map(role => {
        const group = staff.filter(s => s.role === role);
        return {
            role,
            total: group.length,
            active: group.filter(s => s.status === "active").length,
            available: group.filter(s => s.status === "available").length,
            critical: group.filter(s => s.status === "critical" || s.status === "sick").length,
            onLeave: group.filter(s => s.status === "on_leave").length,
        };
    });

    return (
        <section className="hr-section">
            <div className="hr-section-header">
                <div className="hr-section-title"><span className="hr-pulse-dot"/>Staff Category Overview</div>
                <div className="hr-legend">
                    <span className="hr-leg active">Active</span>
                    <span className="hr-leg available">Available</span>
                    <span className="hr-leg critical">Critical</span>
                </div>
            </div>
            <div className="hr-category-grid">
                {categories.map(cat => {
                    const clr = ROLE_COLORS[cat.role];
                    const activePct   = cat.total ? (cat.active / cat.total)*100 : 0;
                    const availPct    = cat.total ? (cat.available / cat.total)*100 : 0;
                    const critPct     = cat.total ? (cat.critical / cat.total)*100 : 0;
                    return (
                        <div className="hr-cat-card" key={cat.role} style={{"--cc": clr}}>
                            <div className="hr-cat-top">
                                <span className="hr-cat-icon">{ROLE_ICONS[cat.role]}</span>
                                <div className="hr-cat-info">
                                    <div className="hr-cat-name">{cat.role}</div>
                                    <div className="hr-cat-total">{cat.total} staff</div>
                                </div>
                                {cat.critical > 0 && <span className="hr-alert-dot" title={`${cat.critical} critical`}>{cat.critical}</span>}
                            </div>
                            <div className="hr-triple-bar">
                                <div className="hr-bar-track">
                                    <div className="hr-bar-fill" style={{width:`${activePct}%`, background:"#34d399"}} />
                                </div>
                                <div className="hr-bar-track">
                                    <div className="hr-bar-fill" style={{width:`${availPct}%`, background:"#22d3ee"}} />
                                </div>
                                <div className="hr-bar-track">
                                    <div className="hr-bar-fill" style={{width:`${critPct}%`, background:"#f87171"}} />
                                </div>
                            </div>
                            <div className="hr-cat-stats">
                                <div className="hr-cat-stat"><span className="hr-dot-active"/>Active<strong>{cat.active}</strong></div>
                                <div className="hr-cat-stat"><span className="hr-dot-avail"/>Avail<strong>{cat.available}</strong></div>
                                <div className="hr-cat-stat"><span className="hr-dot-crit"/>Critical<strong>{cat.critical}</strong></div>
                                <div className="hr-cat-stat"><span className="hr-dot-leave"/>Leave<strong>{cat.onLeave}</strong></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ─── Crew Fatigue Monitor ───────────────────────────────── */
function CrewFatigueMonitor({ staff }){
    const sorted = [...staff].sort((a,b) => b.fatigue - a.fatigue).slice(0,12);
    return (
        <section className="hr-section hr-half">
            <div className="hr-section-header">
                <div className="hr-section-title">🧠 Crew Fatigue Monitor</div>
                <span className="hr-warn-tag">⚠ {staff.filter(s=>s.fatigue>80).length} High Risk</span>
            </div>
            <div className="hr-fatigue-list">
                {sorted.map(s => {
                    const clr = s.fatigue >= 80 ? "#f87171" : s.fatigue >= 60 ? "#f59e0b" : "#34d399";
                    const label = s.fatigue >= 80 ? "HIGH" : s.fatigue >= 60 ? "MED" : "LOW";
                    return (
                        <div className="hr-fatigue-row" key={s.empId}>
                            <div className="hr-fat-left">
                                <div className="hr-fat-avatar" style={{"--ac": ROLE_COLORS[s.role]}}>
                                    {s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                                </div>
                                <div>
                                    <div className="hr-fat-name">{s.name}</div>
                                    <div className="hr-fat-role">{s.role} · {s.hoursWorked}h worked</div>
                                </div>
                            </div>
                            <div className="hr-fat-right">
                                <div className="hr-fat-bar">
                                    <div className="hr-fat-fill" style={{width:`${s.fatigue}%`, background: clr}}/>
                                </div>
                                <span className="hr-fat-label" style={{color: clr}}>{label} {s.fatigue}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ─── Live Crew Activity Feed ────────────────────────────── */
function LiveCrewActivityFeed({ staff }){
    const [feed, setFeed] = useState(() => genFeed(staff));
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => {
            setClock(new Date());
            if(Math.random() > 0.4){
                const member = staff[rand(0, staff.length-1)];
                const type = ACTIVITY_TYPES[rand(0, ACTIVITY_TYPES.length-1)];
                const newEntry = {
                    id: Date.now(),
                    empId: member.empId,
                    name: member.name,
                    role: member.role,
                    type,
                    time: fmtTime(new Date()),
                    timestamp: Date.now(),
                };
                setFeed(prev => [newEntry, ...prev].slice(0,30));
            }
        }, 3000);
        return () => clearInterval(t);
    }, [staff]);

    const ACT_COLOR = {
        "Checked In":       "#34d399",
        "Assigned to Gate": "#22d3ee",
        "Break":            "#f59e0b",
        "Shift End":        "#94a3b8",
        "Task Complete":    "#60a5fa",
        "Alert":            "#f87171",
    };

    return (
        <section className="hr-section hr-half">
            <div className="hr-section-header">
                <div className="hr-section-title"><span className="hr-pulse-dot"/>Live Crew Activity</div>
                <span className="hr-time-tag">{fmtTime(clock)}</span>
            </div>
            <div className="hr-feed-list">
                {feed.map((item,i) => (
                    <div className="hr-feed-item" key={item.id} style={{"--delay": `${i*0.03}s`}}>
                        <div className="hr-feed-avatar" style={{"--ac": ROLE_COLORS[item.role]}}>
                            {item.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                        </div>
                        <div className="hr-feed-body">
                            <div className="hr-feed-top">
                                <span className="hr-feed-name">{item.name}</span>
                                <span className="hr-feed-type" style={{color: ACT_COLOR[item.type]||"#94a3b8"}}>
                                    {item.type}
                                </span>
                            </div>
                            <div className="hr-feed-bottom">
                                <span className="hr-feed-role">{item.role}</span>
                                <span className="hr-feed-id">{item.empId}</span>
                            </div>
                        </div>
                        <div className="hr-feed-time">{item.time}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ─── Input / Update Crew Monitor ────────────────────────── */
function CrewMonitorInput({ onUpdate }){
    const empty = {empId:"", name:"", role: ROLES[0], onLeave: false, sick: false};
    const [form, setForm] = useState(empty);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null);
    const [log, setLog] = useState([]);

    const set = e => {
        const {name, value, type, checked} = e.target;
        setForm(f => ({...f, [name]: type==="checkbox" ? checked : value}));
    };

    const update = async () => {
        if(!form.empId || !form.name) return;
        setSubmitting(true);
        try {
            const resp = await fetch("https://api.anthropic.com/v1/messages",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                },
                body: JSON.stringify({
                    model:"claude-sonnet-4-20250514",
                    max_tokens:200,
                    messages:[{role:"user",content:
                        `An airport HR system is updating crew member ${form.empId} (${form.name}), role: ${form.role}. ` +
                        `On Leave: ${form.onLeave}, Sick: ${form.sick}. ` +
                        `Return ONLY a JSON object (no markdown) with keys: status (string like "Updated","On Leave","Sick","Active"), recommendation (one short sentence action for the HR manager), fatigue (number 10-95).`
                    }]
                })
            });
            const data = await resp.json();
            const raw = data.content?.find(b=>b.type==="text")?.text || "{}";
            let ai = {};
            try { ai = JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch{}
            const entry = {
                ...form,
                status: ai.status || (form.sick?"Sick": form.onLeave?"On Leave":"Active"),
                recommendation: ai.recommendation || "No action needed.",
                fatigue: ai.fatigue || 50,
                ts: fmtTime(new Date()),
            };
            setLog(prev => [entry, ...prev].slice(0,8));
            onUpdate(entry);
            setMsg({type:"success", text:`✓ ${form.name} updated · AI: ${entry.recommendation}`});
            setTimeout(()=>setMsg(null), 5000);
        } catch(err){ console.error(err); }
        setSubmitting(false);
    };

    const reset = () => { setForm(empty); setMsg(null); };

    return (
        <section className="hr-section">
            <div className="hr-section-header">
                <div className="hr-section-title">📋 Input / Update Crew Monitor</div>
                {msg && <span className={`hr-msg-tag ${msg.type}`}>{msg.text}</span>}
            </div>
            <div className="hr-monitor-wrap">
                <div className="hr-monitor-form">
                    <div className="hr-form-grid">
                        <div className="hr-field">
                            <label className="hr-label">Employee ID</label>
                            <input className="hr-input" name="empId" placeholder="e.g. EMP-1042" value={form.empId} onChange={set}/>
                        </div>
                        <div className="hr-field">
                            <label className="hr-label">Staff Name</label>
                            <input className="hr-input" name="name" placeholder="Full name" value={form.name} onChange={set}/>
                        </div>
                        <div className="hr-field hr-full">
                            <label className="hr-label">Crew Role</label>
                            <select className="hr-input hr-select" name="role" value={form.role} onChange={set}>
                                {ROLES.map(r => <option key={r} value={r}>{ROLE_ICONS[r]} {r}</option>)}
                            </select>
                        </div>
                        <div className="hr-field hr-checks">
                            <label className="hr-check-box">
                                <input type="checkbox" name="onLeave" checked={form.onLeave} onChange={set}/>
                                <span className="hr-check-label">On Leave</span>
                            </label>
                            <label className="hr-check-box">
                                <input type="checkbox" name="sick" checked={form.sick} onChange={set}/>
                                <span className="hr-check-label">Sick</span>
                            </label>
                        </div>
                    </div>
                    <div className="hr-form-btns">
                        <button className={`hr-btn-update ${submitting?"loading":""}`} onClick={update} disabled={submitting}>
                            {submitting ? <><span className="hr-spinner"/>AI Syncing…</> : "Update Crew"}
                        </button>
                        <button className="hr-btn-reset" onClick={reset}>Reset</button>
                    </div>
                </div>

                {log.length > 0 && (
                    <div className="hr-update-log">
                        <div className="hr-log-title">Recent Updates</div>
                        {log.map((e,i) => (
                            <div className="hr-log-row" key={i}>
                                <div className="hr-log-avatar" style={{"--ac": ROLE_COLORS[e.role]}}>
                                    {e.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                                </div>
                                <div className="hr-log-body">
                                    <div className="hr-log-top">
                                        <span className="hr-log-name">{e.name}</span>
                                        <span className="hr-log-status" style={{color: e.status==="Sick"?"#f87171":e.status==="On Leave"?"#f59e0b":"#34d399"}}>{e.status}</span>
                                    </div>
                                    <div className="hr-log-rec">🤖 {e.recommendation}</div>
                                    <div className="hr-log-meta">{e.role} · {e.empId} · {e.ts}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export function HumanResources(){
    const [staff, setStaff] = useState(() => genStaff());
    const [clock, setClock] = useState(new Date());

    useEffect(()=>{ const t = setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(t); },[]);

    const handleUpdate = (entry) => {
        setStaff(prev => {
            const idx = prev.findIndex(s => s.empId === entry.empId);
            const newMember = {
                empId: entry.empId,
                name: entry.name,
                role: entry.role,
                status: entry.sick ? "sick" : entry.onLeave ? "on_leave" : "active",
                fatigue: entry.fatigue || 50,
                shift: "Morning",
                hoursWorked: rand(1,9),
            };
            if(idx >= 0){ const n=[...prev]; n[idx]=newMember; return n; }
            return [newMember, ...prev];
        });
    };

    const totalStaff   = staff.length;
    const activeStaff  = staff.filter(s=>s.status==="active").length;
    const onLeave      = staff.filter(s=>s.status==="on_leave").length;
    const criticalStaff= staff.filter(s=>s.status==="critical"||s.status==="sick").length;
    const highFatigue  = staff.filter(s=>s.fatigue>80).length;

    return (
        <div className="hr-page">
            <div className="hr-topbar">
                <div className="hr-topbar-left">
                    <h1 className="hr-title">Human Resources</h1>
                    <span className="hr-live-tag"><span className="hr-live-dot"/>LIVE</span>
                </div>
                <div className="hr-clock">
                    {pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())} · {clock.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short"})}
                </div>
            </div>

            <div className="hr-stats-bar">
                {[
                    {label:"Total Staff",  value:totalStaff,    icon:"👥", color:"#22d3ee"},
                    {label:"Active",       value:activeStaff,   icon:"✅", color:"#34d399"},
                    {label:"On Leave",     value:onLeave,        icon:"🏖", color:"#f59e0b"},
                    {label:"Critical",     value:criticalStaff, icon:"🚨", color:"#f87171"},
                    {label:"High Fatigue", value:highFatigue,   icon:"🧠", color:"#a78bfa"},
                ].map(s=>(
                    <div className="hr-stat" key={s.label} style={{"--sc":s.color}}>
                        <span className="hr-stat-icon">{s.icon}</span>
                        <div>
                            <div className="hr-stat-val" style={{color:s.color}}>{s.value}</div>
                            <div className="hr-stat-lbl">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hr-content">
                <StaffCategoryOverview staff={staff}/>
                <div className="hr-row">
                    <CrewFatigueMonitor staff={staff}/>
                    <LiveCrewActivityFeed staff={staff}/>
                </div>
                <CrewMonitorInput onUpdate={handleUpdate}/>
            </div>
        </div>
    );
}