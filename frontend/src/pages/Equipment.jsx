import { useState, useEffect, useRef } from "react";

/* ─── Static data ──────────────────────────────────────────────── */
const CATEGORY_META = {
  "Baggage Loaders":   { icon: "🧳", color: "#f87171", glow: "rgba(248,113,113,0.22)", desc: "Apron cargo transfer" },
  "Passenger Stairs":  { icon: "🪜", color: "#fb923c", glow: "rgba(251,146,60,0.22)",  desc: "Aerobridge alternatives" },
  "Fuel Tractors":     { icon: "⛽", color: "#facc15", glow: "rgba(250,204,21,0.22)",  desc: "Aviation fuel supply" },
  "Tow Tractors":      { icon: "🚜", color: "#4ade80", glow: "rgba(74,222,128,0.22)",  desc: "Aircraft pushback / tow" },
  "Catering Vans":     { icon: "🍽️", color: "#60a5fa", glow: "rgba(96,165,250,0.22)",  desc: "In-flight meal loading" },
  "Water Truck":       { icon: "💧", color: "#38bdf8", glow: "rgba(56,189,248,0.22)",  desc: "Potable water service" },
  "Food Truck":        { icon: "🚐", color: "#a78bfa", glow: "rgba(167,139,250,0.22)", desc: "Ground crew catering" },
};

const CATEGORIES = Object.keys(CATEGORY_META);

const SEED_INVENTORY = [
  { id: "EQ-001", name: "Baggage Loaders",  units: 12 },
  { id: "EQ-002", name: "Passenger Stairs", units: 6  },
  { id: "EQ-003", name: "Fuel Tractors",    units: 8  },
  { id: "EQ-004", name: "Tow Tractors",     units: 10 },
  { id: "EQ-005", name: "Catering Vans",    units: 5  },
  { id: "EQ-006", name: "Water Truck",      units: 4  },
  { id: "EQ-007", name: "Food Truck",       units: 3  },
];

const SEED_MAINT = [
  { id: "EQ-003", name: "Fuel Tractors",    issue: "Oil pressure low",       severity: "high",   eta: "2h 15m" },
  { id: "EQ-001", name: "Baggage Loaders",  issue: "Belt drive wear",        severity: "medium", eta: "8h 00m" },
  { id: "EQ-006", name: "Water Truck",      issue: "Filter replacement due", severity: "low",    eta: "24h" },
];

const FEED_TEMPLATES = [
  (e) => `${e} dispatched to Gate B7`,
  (e) => `${e} returned to depot`,
  (e) => `${e} maintenance check started`,
  (e) => `${e} refuelling complete`,
  (e) => `${e} repositioned — Zone C`,
  (e) => `${e} allocated to Flight AI-204`,
];

function randomFeed() {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const tmpl = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
  return { id: Date.now() + Math.random(), msg: tmpl(cat), cat, time: new Date().toLocaleTimeString() };
}

const MAP_ZONES = [
  { label: "Zone A",   x: 18, y: 24, count: 8,  status: "active" },
  { label: "Zone B",   x: 48, y: 16, count: 14, status: "busy"   },
  { label: "Zone C",   x: 72, y: 30, count: 5,  status: "active" },
  { label: "Depot",    x: 32, y: 62, count: 22, status: "idle"   },
  { label: "Fuel Pt",  x: 62, y: 68, count: 3,  status: "busy"   },
  { label: "Gate B",   x: 84, y: 54, count: 9,  status: "active" },
];

const STATUS_COLOR = { active: "#4ade80", busy: "#f87171", idle: "#94a3b8" };

const S = {
  page: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflowY: "auto",
    padding: "28px 32px",
    background: "rgba(185,28,28,0.04)",
    fontFamily: "'DM Sans', sans-serif",
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 14,
  },
  glass: (extra) => ({
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    ...(extra || {}),
  }),
};

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)", marginBottom: 8,
};
const inputStyle = {
  width: "100%", padding: "12px 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10, fontSize: 14, color: "#fff",
  outline: "none", fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

export function Equipments() {
  const [inventory, setInventory] = useState(SEED_INVENTORY);
  const [feed, setFeed]           = useState([randomFeed(), randomFeed(), randomFeed()]);
  const [form, setForm]           = useState({ id: "", name: CATEGORIES[0], units: "" });
  const [errors, setErrors]       = useState({});
  const [toast, setToast]         = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const feedRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => [randomFeed(), ...prev].slice(0, 20));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const totalsMap = {};
  inventory.forEach(r => { totalsMap[r.name] = (totalsMap[r.name] || 0) + Number(r.units); });

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.id.trim()) errs.id = "Equipment ID is required";
    if (!form.units || Number(form.units) <= 0) errs.units = "Enter a valid unit count";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const exists = inventory.find(r => r.id === form.id.trim());
    if (exists) {
      setInventory(prev => prev.map(r =>
        r.id === form.id.trim() ? { ...r, units: Number(r.units) + Number(form.units) } : r
      ));
      showToast("Updated " + form.name + " (" + form.id + ")");
    } else {
      setInventory(prev => [...prev, { id: form.id.trim(), name: form.name, units: Number(form.units) }]);
      showToast("Added " + form.name + " (" + form.id + ")");
    }
    setForm({ id: "", name: CATEGORIES[0], units: "" });
    setErrors({});
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const totalEquipment = inventory.reduce((s, r) => s + Number(r.units), 0);
  const TABS = [
    { key: "overview",    label: "Category Overview" },
    { key: "input",       label: "Add / Update Equipment" },
    { key: "maintenance", label: "Predictive Maintenance" },
    { key: "map",         label: "Auto-Relocation Map" },
    { key: "feed",        label: "Live Equipment Feed" },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.18)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed",top:24,right:32,zIndex:9999,
          background:"rgba(74,222,128,0.15)",border:"1px solid rgba(74,222,128,0.5)",
          borderRadius:12,padding:"12px 20px",color:"#4ade80",fontSize:13,fontWeight:600,
          backdropFilter:"blur(16px)",animation:"fadeIn .25s ease",
          display:"flex",alignItems:"center",gap:10,
        }}>✓ {toast}</div>
      )}

      {/* KPI strip */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>
        {[
          {label:"Total Equipment",    value:totalEquipment,          accent:"#f87171"},
          {label:"Categories",         value:CATEGORIES.length,       accent:"#fb923c"},
          {label:"Maintenance Alerts", value:SEED_MAINT.length,       accent:"#facc15"},
          {label:"Active Zones",       value:MAP_ZONES.filter(z=>z.status!=="idle").length, accent:"#4ade80"},
        ].map(k=>(
          <div key={k.label} style={S.glass({padding:"18px 24px",flex:"1 1 160px",borderColor:k.accent+"30"})}>
            <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:6}}>{k.label}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:700,color:k.accent}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{
            padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",
            fontSize:13,fontWeight:600,transition:"all .2s",
            background:activeTab===tab.key?"linear-gradient(135deg,#f87171,#fb923c)":"rgba(255,255,255,0.06)",
            color:activeTab===tab.key?"#fff":"rgba(255,255,255,0.5)",
            boxShadow:activeTab===tab.key?"0 4px 20px rgba(248,113,113,0.35)":"none",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab==="overview" && (
        <>
          <div style={S.sectionTitle}>Equipment Category Overview</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,marginBottom:32}}>
            {CATEGORIES.map(cat=>{
              const meta=CATEGORY_META[cat];
              const total=totalsMap[cat]||0;
              const inUse=Math.floor(total*0.55);
              const pct=total?Math.round((inUse/total)*100):0;
              return (
                <div key={cat} style={S.glass({padding:"22px",borderColor:meta.color+"35",boxShadow:"0 0 28px "+meta.glow,position:"relative",overflow:"hidden"})}>
                  <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:meta.glow,filter:"blur(20px)",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:12,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",background:meta.color+"18",border:"1px solid "+meta.color+"40"}}>{meta.icon}</div>
                    <div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{cat}</div>
                      <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{meta.desc}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:2}}>Total Units</div>
                      <div style={{fontSize:24,fontWeight:700,fontFamily:"'Syne',sans-serif",color:meta.color}}>{total}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:2}}>In Use</div>
                      <div style={{fontSize:24,fontWeight:700,fontFamily:"'Syne',sans-serif",color:"#fff"}}>{inUse}</div>
                    </div>
                  </div>
                  <div style={{height:5,borderRadius:4,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:pct+"%",borderRadius:4,background:"linear-gradient(90deg,"+meta.color+","+meta.color+"80)"}}/>
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6}}>{pct}% utilization</div>
                </div>
              );
            })}
          </div>

          <div style={S.sectionTitle}>Inventory Register</div>
          <div style={S.glass({overflow:"hidden"})}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  {["Equipment ID","Category","Total Units","Status"].map(h=>(
                    <th key={h} style={{padding:"12px 20px",textAlign:"left",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((row,i)=>{
                  const meta=CATEGORY_META[row.name]||{color:"#94a3b8",icon:"📦"};
                  return (
                    <tr key={row.id} style={{borderBottom:i<inventory.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                      <td style={{padding:"13px 20px",fontFamily:"monospace",fontSize:13,color:meta.color}}>{row.id}</td>
                      <td style={{padding:"13px 20px",color:"#fff",fontSize:13}}>
                        <span style={{marginRight:8}}>{meta.icon}</span>{row.name}
                      </td>
                      <td style={{padding:"13px 20px"}}>
                        <span style={{background:meta.color+"18",border:"1px solid "+meta.color+"40",borderRadius:8,padding:"3px 12px",fontSize:13,fontWeight:700,color:meta.color}}>{row.units}</span>
                      </td>
                      <td style={{padding:"13px 20px"}}>
                        <span style={{background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.3)",borderRadius:20,padding:"3px 12px",fontSize:11,color:"#4ade80",fontWeight:600}}>● Operational</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── INPUT FORM ── */}
      {activeTab==="input" && (
        <div style={{maxWidth:580}}>
          <div style={S.sectionTitle}>Add / Update Equipment</div>
          <div style={S.glass({padding:32})}>
            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:22}}>

              {/* Equipment ID */}
              <div>
                <label style={labelStyle}>Equipment ID</label>
                <input
                  placeholder="e.g. EQ-008"
                  value={form.id}
                  onChange={e=>{setForm(p=>({...p,id:e.target.value}));setErrors(p=>({...p,id:""}));}}
                  style={{...inputStyle,borderColor:errors.id?"#f87171":"rgba(255,255,255,0.12)"}}
                />
                {errors.id && <div style={{marginTop:5,fontSize:12,color:"#f87171"}}>{errors.id}</div>}
                <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:6}}>
                  If ID already exists, units will be added to the existing record.
                </div>
              </div>

              {/* Equipment Name */}
              <div>
                <label style={labelStyle}>Equipment Name</label>
                <select
                  value={form.name}
                  onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                  style={{...inputStyle,appearance:"none",cursor:"pointer"}}
                >
                  {CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_META[c].icon} {c}</option>)}
                </select>
                {form.name && (()=>{
                  const meta=CATEGORY_META[form.name];
                  return (
                    <div style={{marginTop:10,padding:"10px 14px",borderRadius:10,background:meta.color+"10",border:"1px solid "+meta.color+"30",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>{meta.icon}</span>
                      <div>
                        <div style={{color:meta.color,fontWeight:600,fontSize:13}}>{form.name}</div>
                        <div style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{meta.desc}</div>
                      </div>
                      <div style={{marginLeft:"auto",textAlign:"right"}}>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>Current stock</div>
                        <div style={{color:meta.color,fontWeight:700,fontSize:16}}>{totalsMap[form.name]||0} units</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Total Units */}
              <div>
                <label style={labelStyle}>Total Units</label>
                <input
                  type="number" min="1" placeholder="e.g. 4"
                  value={form.units}
                  onChange={e=>{setForm(p=>({...p,units:e.target.value}));setErrors(p=>({...p,units:""}));}}
                  style={{...inputStyle,borderColor:errors.units?"#f87171":"rgba(255,255,255,0.12)"}}
                />
                {errors.units && <div style={{marginTop:5,fontSize:12,color:"#f87171"}}>{errors.units}</div>}
              </div>

              <button type="submit" style={{
                padding:"13px",borderRadius:12,border:"none",cursor:"pointer",
                background:"linear-gradient(135deg,#f87171,#fb923c)",
                color:"#fff",fontWeight:700,fontSize:14,fontFamily:"'Syne',sans-serif",
                letterSpacing:"0.04em",boxShadow:"0 6px 24px rgba(248,113,113,0.35)",
              }}>
                Register Equipment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MAINTENANCE ── */}
      {activeTab==="maintenance" && (
        <>
          <div style={S.sectionTitle}>Predictive Maintenance Alerts</div>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
            {SEED_MAINT.map(m=>{
              const sev={high:{color:"#f87171",label:"HIGH"},medium:{color:"#facc15",label:"MED"},low:{color:"#4ade80",label:"LOW"}}[m.severity];
              const meta=CATEGORY_META[m.name];
              return (
                <div key={m.id} style={S.glass({padding:"20px 24px",display:"flex",alignItems:"center",gap:18,borderColor:sev.color+"35",boxShadow:"0 0 20px "+sev.color+"15"})}>
                  <div style={{fontSize:28}}>{meta.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{m.name} — <span style={{fontFamily:"monospace",color:meta.color}}>{m.id}</span></div>
                    <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginTop:3}}>{m.issue}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{background:sev.color+"18",border:"1px solid "+sev.color+"50",borderRadius:20,padding:"3px 12px",fontSize:11,color:sev.color,fontWeight:700,marginBottom:6,display:"inline-block"}}>{sev.label}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Est. downtime: {m.eta}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={S.sectionTitle}>Fleet Health Scores</div>
          <div style={S.glass({padding:28})}>
            {CATEGORIES.map((cat,i)=>{
              const meta=CATEGORY_META[cat];
              const health=[88,76,52,91,83,67,79][i];
              const hcolor=health>=80?"#4ade80":health>=60?"#facc15":"#f87171";
              return (
                <div key={cat} style={{display:"flex",alignItems:"center",gap:16,marginBottom:i<CATEGORIES.length-1?16:0}}>
                  <div style={{width:28,textAlign:"center",fontSize:16}}>{meta.icon}</div>
                  <div style={{width:170,fontSize:13,color:"rgba(255,255,255,0.7)"}}>{cat}</div>
                  <div style={{flex:1,height:8,borderRadius:4,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:health+"%",borderRadius:4,background:"linear-gradient(90deg,"+hcolor+","+hcolor+"80)"}}/>
                  </div>
                  <div style={{width:48,textAlign:"right",fontSize:13,fontWeight:700,color:hcolor}}>{health}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── MAP ── */}
      {activeTab==="map" && (
        <>
          <div style={S.sectionTitle}>Auto Relocation Map — Apron Overview</div>
          <div style={S.glass({padding:0,overflow:"hidden",marginBottom:20})}>
            <div style={{position:"relative",height:380,background:"linear-gradient(135deg,rgba(15,15,27,0.95),rgba(30,20,50,0.95))",overflow:"hidden"}}>
              {[...Array(10)].map((_,i)=><div key={"h"+i} style={{position:"absolute",left:0,right:0,top:i*10+"%",borderTop:"1px solid rgba(255,255,255,0.04)"}}/>)}
              {[...Array(10)].map((_,i)=><div key={"v"+i} style={{position:"absolute",top:0,bottom:0,left:i*10+"%",borderLeft:"1px solid rgba(255,255,255,0.04)"}}/>)}
              <div style={{position:"absolute",bottom:"8%",left:"5%",right:"5%",height:18,borderRadius:4,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",paddingLeft:12,fontSize:10,letterSpacing:"0.12em",color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>
                ✈ Runway 28L / 10R
              </div>
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
                {[[0,3],[1,3],[2,5],[3,4],[4,5]].map(([a,b],i)=>(
                  <line key={i} x1={MAP_ZONES[a].x+"%"} y1={MAP_ZONES[a].y+"%"} x2={MAP_ZONES[b].x+"%"} y2={MAP_ZONES[b].y+"%"} stroke="rgba(248,113,113,0.2)" strokeWidth="1.5" strokeDasharray="6 4"/>
                ))}
              </svg>
              {MAP_ZONES.map(z=>(
                <div key={z.label} style={{position:"absolute",left:z.x+"%",top:z.y+"%",transform:"translate(-50%,-50%)"}}>
                  <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:"2px solid "+STATUS_COLOR[z.status],opacity:.3,animation:"pulse 2s ease infinite"}}/>
                  <div style={{width:42,height:42,borderRadius:"50%",background:STATUS_COLOR[z.status]+"22",border:"2px solid "+STATUS_COLOR[z.status],display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:STATUS_COLOR[z.status],boxShadow:"0 0 16px "+STATUS_COLOR[z.status]+"55"}}>{z.count}</div>
                  <div style={{position:"absolute",top:46,left:"50%",transform:"translateX(-50%)",background:"rgba(15,15,27,0.9)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"2px 8px",whiteSpace:"nowrap",fontSize:10,color:"rgba(255,255,255,0.6)"}}>{z.label}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"14px 24px",display:"flex",gap:24,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"}}>
              {Object.entries(STATUS_COLOR).map(([s,c])=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:c}}/>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.45)",textTransform:"capitalize"}}>{s}</span>
                </div>
              ))}
              <div style={{marginLeft:"auto",fontSize:12,color:"rgba(255,255,255,0.25)"}}>Numbers = units in zone</div>
            </div>
          </div>

          <div style={S.glass({overflow:"hidden"})}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  {["Zone","Units","Status","AI Recommendation"].map(h=>(
                    <th key={h} style={{padding:"11px 20px",textAlign:"left",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MAP_ZONES.map((z,i)=>{
                  const recs={active:"Hold position — optimal coverage",busy:"Request 2 additional units",idle:"Redeploy 3 units to Zone B"};
                  return (
                    <tr key={z.label} style={{borderBottom:i<MAP_ZONES.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                      <td style={{padding:"12px 20px",color:"#fff",fontWeight:600}}>{z.label}</td>
                      <td style={{padding:"12px 20px",color:STATUS_COLOR[z.status],fontWeight:700}}>{z.count}</td>
                      <td style={{padding:"12px 20px"}}>
                        <span style={{background:STATUS_COLOR[z.status]+"18",border:"1px solid "+STATUS_COLOR[z.status]+"40",borderRadius:20,padding:"3px 12px",fontSize:11,color:STATUS_COLOR[z.status],fontWeight:600,textTransform:"capitalize"}}>● {z.status}</span>
                      </td>
                      <td style={{padding:"12px 20px",fontSize:12,color:"rgba(255,255,255,0.45)"}}>{recs[z.status]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── LIVE FEED ── */}
      {activeTab==="feed" && (
        <>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={S.sectionTitle}>Live Equipment Feed</div>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.3)",borderRadius:20,padding:"3px 12px",fontSize:11,color:"#4ade80",fontWeight:600}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"blink 1.5s ease infinite"}}/>
              LIVE
            </div>
          </div>
          <div ref={feedRef} style={S.glass({padding:0,overflow:"hidden",maxHeight:520,overflowY:"auto"})}>
            {feed.map((f,i)=>{
              const meta=CATEGORY_META[f.cat]||{color:"#94a3b8",icon:"📦"};
              return (
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 22px",borderBottom:i<feed.length-1?"1px solid rgba(255,255,255,0.04)":"none",background:i===0?meta.color+"08":"transparent",transition:"background .4s"}}>
                  <div style={{fontSize:20}}>{meta.icon}</div>
                  <div style={{flex:1,fontSize:13,color:i===0?"#fff":"rgba(255,255,255,0.6)"}}>{f.msg}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",whiteSpace:"nowrap"}}>{f.time}</div>
                  {i===0&&<div style={{background:meta.color+"18",border:"1px solid "+meta.color+"40",borderRadius:20,padding:"2px 10px",fontSize:10,color:meta.color,fontWeight:700}}>NEW</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}