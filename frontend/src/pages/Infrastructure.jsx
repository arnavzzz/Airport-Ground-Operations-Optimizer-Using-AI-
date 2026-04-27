import { useState, useEffect } from "react";

/* ─── Palette ─────────────────────────────────────────── */
const C = {
  green:  "#4ade80", greenG: "rgba(74,222,128,0.18)",
  red:    "#f87171", redG:   "rgba(248,113,113,0.18)",
  yellow: "#facc15", yellowG:"rgba(250,204,21,0.18)",
  blue:   "#60a5fa", blueG:  "rgba(96,165,250,0.18)",
  cyan:   "#22d3ee", cyanG:  "rgba(34,211,238,0.18)",
  purple: "#a78bfa", purpleG:"rgba(167,139,250,0.18)",
  orange: "#fb923c", orangeG:"rgba(251,146,60,0.18)",
  muted:  "rgba(255,255,255,0.38)",
  dim:    "rgba(255,255,255,0.14)",
};

/* ─── Gate data ───────────────────────────────────────── */
const GATES = [
  { id:"A1", terminal:"T1", status:"occupied", flight:"AI-204", airline:"Air India",    dep:"14:35", x:12, y:20 },
  { id:"A2", terminal:"T1", status:"available",flight:null,     airline:null,           dep:null,    x:12, y:38 },
  { id:"A3", terminal:"T1", status:"occupied", flight:"6E-811", airline:"IndiGo",       dep:"15:10", x:12, y:56 },
  { id:"A4", terminal:"T1", status:"cleaning", flight:null,     airline:null,           dep:null,    x:12, y:74 },
  { id:"B1", terminal:"T2", status:"occupied", flight:"SG-301", airline:"SpiceJet",     dep:"14:55", x:38, y:20 },
  { id:"B2", terminal:"T2", status:"boarding", flight:"UK-823", airline:"Vistara",      dep:"15:25", x:38, y:38 },
  { id:"B3", terminal:"T2", status:"available",flight:null,     airline:null,           dep:null,    x:38, y:56 },
  { id:"B4", terminal:"T2", status:"occupied", flight:"IX-362", airline:"Air Asia",     dep:"16:00", x:38, y:74 },
  { id:"C1", terminal:"T3", status:"boarding", flight:"AI-101", airline:"Air India",    dep:"14:40", x:64, y:20 },
  { id:"C2", terminal:"T3", status:"occupied", flight:"6E-445", airline:"IndiGo",       dep:"15:50", x:64, y:38 },
  { id:"C3", terminal:"T3", status:"available",flight:null,     airline:null,           dep:null,    x:64, y:56 },
  { id:"C4", terminal:"T3", status:"maintenance",flight:null,   airline:null,           dep:null,    x:64, y:74 },
  { id:"D1", terminal:"T4", status:"occupied", flight:"QP-201", airline:"Akasa",        dep:"16:30", x:88, y:20 },
  { id:"D2", terminal:"T4", status:"available",flight:null,     airline:null,           dep:null,    x:88, y:38 },
  { id:"D3", terminal:"T4", status:"boarding", flight:"AI-540", airline:"Air India",    dep:"15:05", x:88, y:56 },
  { id:"D4", terminal:"T4", status:"occupied", flight:"6E-788", airline:"IndiGo",       dep:"17:00", x:88, y:74 },
];

const GATE_STATUS_COLOR = {
  occupied:    C.red,
  available:   C.green,
  boarding:    C.blue,
  cleaning:    C.yellow,
  maintenance: C.orange,
};

const GATE_STATUS_LABEL = {
  occupied: "Occupied",
  available: "Available",
  boarding: "Boarding",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

const TERMINALS = ["T1", "T2", "T3", "T4"];

/* ─── Runway data ─────────────────────────────────────── */
const RUNWAYS = [
  { id:"28L/10R", length:"3900m", surface:"Asphalt", ops:[8,12,15,11,9,14,10,13,16,12,8,11], status:"active",  utilization:78 },
  { id:"28R/10L", length:"3200m", surface:"Concrete",ops:[5, 7, 9, 6, 8,10, 7, 9,11, 8,5, 7], status:"active",  utilization:62 },
  { id:"14/32",   length:"2800m", surface:"Asphalt", ops:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0], status:"closed",  utilization:0  },
];

/* ─── Parking bays ────────────────────────────────────── */
const BAYS = Array.from({length:24},(_,i)=>({
  id:`P${String(i+1).padStart(2,"0")}`,
  status: i<10?"occupied": i<14?"available": i<16?"reserved": "maintenance",
  aircraft: i<10 ? ["A320","B737","A321","B777","A380","B737","A320","A321","B737","A320"][i] : null,
  since: i<10 ? `${10+i}:${i%2===0?"00":"30"}` : null,
}));

/* ─── GPU data ────────────────────────────────────────── */
const GPUS = [
  { id:"GPU-01", gate:"A1", status:"active",  voltage:"115V", current:"90A",  load:82, health:94 },
  { id:"GPU-02", gate:"A3", status:"active",  voltage:"115V", current:"85A",  load:76, health:88 },
  { id:"GPU-03", gate:"B1", status:"active",  voltage:"115V", current:"92A",  load:89, health:91 },
  { id:"GPU-04", gate:"B2", status:"active",  voltage:"115V", current:"78A",  load:71, health:97 },
  { id:"GPU-05", gate:"C1", status:"active",  voltage:"115V", current:"88A",  load:80, health:85 },
  { id:"GPU-06", gate:"C2", status:"active",  voltage:"115V", current:"95A",  load:93, health:79 },
  { id:"GPU-07", gate:"D1", status:"standby", voltage:"0V",   current:"0A",   load:0,  health:100},
  { id:"GPU-08", gate:"D3", status:"active",  voltage:"115V", current:"81A",  load:74, health:90 },
  { id:"GPU-09", gate:"—",  status:"fault",   voltage:"—",    current:"—",    load:0,  health:22 },
  { id:"GPU-10", gate:"—",  status:"standby", voltage:"0V",   current:"0A",   load:0,  health:98 },
];

/* ─── AI Insights ─────────────────────────────────────── */
const AI_INSIGHTS = [
  { type:"warning",  icon:"⚠️",  title:"Gate B2 Bottleneck Predicted",       body:"Boarding overlap with B1 at 15:10–15:25 may cause jetway congestion. Suggest delaying B2 boarding call by 12 minutes.",  confidence:91 },
  { type:"success",  icon:"✅",  title:"Runway 28R Optimal for Next Window",  body:"Wind vector at 270° favours 28R/10L for the 15:00–16:30 slot. Switching primary ops from 28L could reduce taxi time by ~4 min/flight.", confidence:87 },
  { type:"error",    icon:"🚨",  title:"GPU-09 Critical Fault",               body:"Ground Power Unit 09 shows undervoltage and overheating signature. Recommend immediate inspection. Gate reassignment advised.", confidence:99 },
  { type:"info",     icon:"💡",  title:"Bay P11–P14 Reallocation Opportunity",body:"4 available bays near terminal T3 are idle for 3+ hours. AI recommends pre-positioning 2 widebodies to reduce remote stand ops.", confidence:78 },
  { type:"warning",  icon:"⚠️",  title:"Runway 14/32 Closure Impact",         body:"Closure increases average taxi distance by 1.4 km. Suggest re-optimising pushback sequence for afternoon peak (16:00–18:00).", confidence:83 },
];

const INSIGHT_COLORS = { warning: C.yellow, success: C.green, error: C.red, info: C.cyan };

/* ─── Micro helpers ───────────────────────────────────── */
const glass = (extra) => ({
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  ...(extra||{}),
});

const badge = (color) => ({
  background: color+"18", border: "1px solid "+color+"45",
  borderRadius: 20, padding: "2px 11px",
  fontSize: 11, fontWeight: 700, color,
  display: "inline-block",
});

const sectionTitle = {
  fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700,
  letterSpacing:"0.12em", textTransform:"uppercase",
  color:"rgba(255,255,255,0.35)", marginBottom:14,
};

const TABS = [
  { key:"gates",   label:"Gate Allocation" },
  { key:"runway",  label:"Runway Usage" },
  { key:"parking", label:"Parking Bay Status" },
  { key:"gpu",     label:"GPU Allocation" },
  { key:"ai",      label:"AI Insights" },
];

/* ═══════════════════════════════════════════════════════ */
export function Infrastructures() {
  const [tab, setTab]     = useState("gates");
  const [selGate, setSelGate] = useState(null);
  const [, setTick]   = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x+1), 60000);
    return () => clearInterval(t);
  }, []);

  /* KPI counts */
  const selectedGate = selGate || GATES.find(g => g.status === "boarding") || GATES[0];
  const gateTotals = TERMINALS.map(terminal => {
    const gates = GATES.filter(g => g.terminal === terminal);
    const busy = gates.filter(g => ["occupied", "boarding"].includes(g.status)).length;
    return {
      terminal,
      gates,
      busy,
      available: gates.filter(g => g.status === "available").length,
      utilization: Math.round((busy / gates.length) * 100),
    };
  });
  const occupiedPct = Math.round((GATES.filter(g => ["occupied", "boarding"].includes(g.status)).length / GATES.length) * 100);

  const kpi = {
    gatesAvail: GATES.filter(g=>g.status==="available").length,
    gatesOcc:   GATES.filter(g=>g.status==="occupied"||g.status==="boarding").length,
    baysAvail:  BAYS.filter(b=>b.status==="available").length,
    gpuActive:  GPUS.filter(g=>g.status==="active").length,
    gpuFault:   GPUS.filter(g=>g.status==="fault").length,
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto",
      padding:"28px 32px", background:"rgba(21,128,61,0.04)", fontFamily:"'DM Sans',sans-serif" }}>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(1.2)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bar    { from{width:0} to{width:var(--w)} }
        .gate-dot:hover   { transform:scale(1.35)!important; z-index:10; }
        .tab-btn:hover    { background:rgba(255,255,255,0.1)!important; }
        .bay-cell:hover   { filter:brightness(1.3); cursor:default; }
      `}</style>

      {/* ── KPI strip ──────────────────────────────── */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>
        {[
          { label:"Gates Available", value:kpi.gatesAvail, accent:C.green  },
          { label:"Gates Active",    value:kpi.gatesOcc,   accent:C.blue   },
          { label:"Bays Free",       value:kpi.baysAvail,  accent:C.cyan   },
          { label:"GPUs Online",     value:kpi.gpuActive,  accent:C.purple },
          { label:"GPU Faults",      value:kpi.gpuFault,   accent:C.red    },
        ].map(k=>(
          <div key={k.label} style={glass({padding:"18px 24px",flex:"1 1 140px",borderColor:k.accent+"30"})}>
            <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:6}}>{k.label}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,color:k.accent}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ────────────────────────────────── */}
      <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.key} className="tab-btn" onClick={()=>setTab(t.key)} style={{
            padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",
            fontSize:13,fontWeight:600,transition:"all .2s",
            background:tab===t.key?"linear-gradient(135deg,#22d3ee,#4ade80)":"rgba(255,255,255,0.06)",
            color:tab===t.key?"#0f172a":"rgba(255,255,255,0.5)",
            boxShadow:tab===t.key?"0 4px 20px rgba(34,211,238,0.3)":"none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          GATE ALLOCATION MAP
      ══════════════════════════════════════════ */}
      {tab==="gates" && (
        <>
          <div style={sectionTitle}>Gate Allocation Map</div>

          {/* Map canvas */}
          <div style={glass({padding:0,overflow:"hidden",marginBottom:20,borderRadius:18})}>
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 280px",minHeight:430,background:"linear-gradient(160deg,rgba(8,13,28,.98),rgba(15,23,42,.96))"}}>
              <div style={{position:"relative",padding:"28px 28px 72px",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(90deg,rgba(148,163,184,.035) 1px,transparent 1px),linear-gradient(0deg,rgba(148,163,184,.03) 1px,transparent 1px)",backgroundSize:"42px 42px",maskImage:"linear-gradient(to bottom,rgba(0,0,0,.9),rgba(0,0,0,.35))"}}/>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:20,position:"relative",zIndex:1}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#fff"}}>Terminal Gate Allocation</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.42)",marginTop:3}}>Operational stand map with live gate states and departure assignments</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <div style={{padding:"8px 12px",borderRadius:10,background:"rgba(96,165,250,.12)",border:"1px solid rgba(96,165,250,.24)"}}>
                      <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.42)"}}>Utilization</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.blue}}>{occupiedPct}%</div>
                    </div>
                    <div style={{padding:"8px 12px",borderRadius:10,background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.22)"}}>
                      <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.42)"}}>Available</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.green}}>{kpi.gatesAvail}</div>
                    </div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(132px,1fr))",gap:14,position:"relative",zIndex:1}}>
                  {gateTotals.map(({terminal,gates,busy,available,utilization})=>(
                    <div key={terminal} style={{minHeight:250,padding:"14px",borderRadius:16,background:"rgba(255,255,255,.045)",border:"1px solid rgba(255,255,255,.08)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                        <div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#fff"}}>{terminal}</div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,.38)"}}>{busy}/{gates.length} busy</div>
                        </div>
                        <span style={{...badge(utilization>75?C.red:utilization>50?C.yellow:C.green),padding:"2px 8px"}}>{utilization}%</span>
                      </div>
                      <div style={{height:5,borderRadius:99,background:"rgba(255,255,255,.08)",overflow:"hidden",marginBottom:14}}>
                        <div style={{height:"100%",width:`${utilization}%`,background:utilization>75?C.red:utilization>50?C.yellow:C.green,borderRadius:99}}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9}}>
                        {gates.map(g=>{
                          const color = GATE_STATUS_COLOR[g.status]||C.muted;
                          const selected = selectedGate?.id===g.id;
                          return (
                            <button key={g.id} type="button" onClick={()=>setSelGate(g)} style={{
                              display:"grid",gridTemplateColumns:"42px minmax(0,1fr)",gap:10,alignItems:"center",width:"100%",
                              padding:"9px 10px",borderRadius:12,border:`1px solid ${selected?color+"80":"rgba(255,255,255,.08)"}`,
                              background:selected?color+"18":"rgba(15,23,42,.55)",color:"#fff",cursor:"pointer",textAlign:"left",
                              boxShadow:selected?`0 0 0 3px ${color}16, 0 12px 28px rgba(0,0,0,.28)`:"none",
                              transition:"border-color .18s, background .18s, transform .18s, box-shadow .18s",
                            }}>
                              <span style={{width:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:color+"18",border:"1px solid "+color+"66",color,fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800}}>{g.id}</span>
                              <span style={{minWidth:0}}>
                                <span style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                                  <span style={{width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>
                                  <span style={{fontSize:11,fontWeight:800,color,textTransform:"uppercase",letterSpacing:".06em"}}>{GATE_STATUS_LABEL[g.status]}</span>
                                </span>
                                <span style={{display:"block",fontSize:12,color:"rgba(255,255,255,.78)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {g.flight ? `${g.flight} - ${g.airline}` : "No aircraft assigned"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:11,color:"rgba(255,255,255,.34)"}}>
                        <span>{available} free</span>
                        <span>{gates.filter(g=>g.status==="boarding").length} boarding</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{position:"absolute",left:28,right:28,bottom:24,height:28,borderRadius:9,background:"repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 18px,rgba(255,255,255,.035) 18px 36px)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(255,255,255,.32)"}}>
                  <span>Taxiway Alpha</span>
                  <span>Pushback corridor clear</span>
                </div>
              </div>

              <aside style={{borderLeft:"1px solid rgba(255,255,255,.08)",background:"rgba(2,6,23,.32)",padding:22,display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.36)",marginBottom:7}}>Selected Gate</div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:52,height:52,borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",background:(GATE_STATUS_COLOR[selectedGate.status]||C.muted)+"18",border:"1px solid "+(GATE_STATUS_COLOR[selectedGate.status]||C.muted)+"70",color:GATE_STATUS_COLOR[selectedGate.status]||C.muted,fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{selectedGate.id}</div>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#fff"}}>{selectedGate.terminal}</div>
                      <span style={badge(GATE_STATUS_COLOR[selectedGate.status]||C.muted)}>{GATE_STATUS_LABEL[selectedGate.status]}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gap:10}}>
                  {[["Flight", selectedGate.flight || "Unassigned"],["Airline", selectedGate.airline || "None"],["Departure", selectedGate.dep || "No slot"],["Stand Type", selectedGate.terminal==="T4" ? "Widebody ready" : "Narrowbody"]].map(([label,value])=>(
                    <div key={label} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.045)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".08em",color:"rgba(255,255,255,.34)",marginBottom:3}}>{label}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.86)"}}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"12px",borderRadius:12,background:"rgba(34,211,238,.08)",border:"1px solid rgba(34,211,238,.18)"}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase",color:C.cyan,marginBottom:6}}>AI Allocation Note</div>
                  <div style={{fontSize:12,lineHeight:1.5,color:"rgba(255,255,255,.62)"}}>
                    {selectedGate.status==="available" ? "Best candidate for short-turn narrowbody arrivals within the next 30 minutes." : selectedGate.status==="maintenance" ? "Keep unavailable for allocation until engineering clears the stand." : selectedGate.status==="cleaning" ? "Hold for next assignment after cleaning completion confirmation." : "Monitor turnaround progress and keep adjacent support equipment pre-positioned."}
                  </div>
                </div>
              </aside>
            </div>

            <div style={{padding:"13px 22px",display:"flex",gap:18,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",alignItems:"center"}}>
              {Object.entries(GATE_STATUS_COLOR).map(([s,c])=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`}}/>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{GATE_STATUS_LABEL[s]}</span>
                </div>
              ))}
              <div style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.28)"}}>Select a gate to inspect allocation details</div>
            </div>
          </div>

          {/* Gate table */}
          <div style={glass({overflow:"hidden"})}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  {["Gate","Terminal","Status","Flight","Airline","Departure"].map(h=>(
                    <th key={h} style={{padding:"11px 18px",textAlign:"left",fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GATES.map((g,i)=>{
                  const color=GATE_STATUS_COLOR[g.status]||C.muted;
                  return (
                    <tr key={g.id} onClick={()=>setSelGate(selGate?.id===g.id?null:g)}
                      style={{borderBottom:i<GATES.length-1?"1px solid rgba(255,255,255,0.04)":"none",cursor:"pointer",
                        background:selGate?.id===g.id?color+"0a":"transparent",transition:"background .15s"}}>
                      <td style={{padding:"11px 18px",fontWeight:700,color,fontFamily:"monospace"}}>{g.id}</td>
                      <td style={{padding:"11px 18px",fontSize:13,color:"rgba(255,255,255,0.6)"}}>{g.terminal}</td>
                      <td style={{padding:"11px 18px"}}><span style={badge(color)}>{g.status.toUpperCase()}</span></td>
                      <td style={{padding:"11px 18px",fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.8)"}}>{g.flight||"—"}</td>
                      <td style={{padding:"11px 18px",fontSize:13,color:"rgba(255,255,255,0.55)"}}>{g.airline||"—"}</td>
                      <td style={{padding:"11px 18px",fontSize:13,color:"rgba(255,255,255,0.55)"}}>{g.dep||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          RUNWAY USAGE
      ══════════════════════════════════════════ */}
      {tab==="runway" && (
        <>
          <div style={sectionTitle}>Runway Usage</div>

          {RUNWAYS.map(rwy=>{
            const color = rwy.status==="active"?C.green:rwy.status==="closed"?C.red:C.yellow;
            const hours = ["09","10","11","12","13","14","15","16","17","18","19","20"];
            const maxOps = Math.max(...rwy.ops,1);
            return (
              <div key={rwy.id} style={glass({padding:"24px 28px",marginBottom:18,borderColor:color+"30"})}>
                <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#fff"}}>{rwy.id}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{rwy.length} · {rwy.surface}</div>
                  </div>
                  <span style={badge(color)}>{rwy.status.toUpperCase()}</span>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:700,color}}>{rwy.utilization}%</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>utilization</div>
                  </div>
                </div>

                {/* Utilization bar */}
                <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:20}}>
                  <div style={{height:"100%",width:rwy.utilization+"%",borderRadius:4,
                    background:"linear-gradient(90deg,"+color+","+color+"80)",transition:"width 1s"}}/>
                </div>

                {/* Ops histogram */}
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:10,letterSpacing:"0.08em",textTransform:"uppercase"}}>Movements per hour</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,height:70}}>
                  {rwy.ops.map((ops,i)=>{
                    const h = maxOps>0?(ops/maxOps)*60:0;
                    return (
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",
                          background:"linear-gradient(180deg,"+color+","+color+"55)",
                          transition:"height .8s ease",minHeight:ops>0?4:0}}/>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{hours[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Status summary */}
          <div style={glass({padding:"20px 24px"})}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
              <span style={{color:C.green,fontWeight:700}}>2 runways active</span> · 1 closed for resurfacing ·{" "}
              Total ops today: <span style={{color:C.cyan,fontWeight:700}}>247</span> movements ·{" "}
              Peak hour: <span style={{color:C.yellow,fontWeight:700}}>17:00 (16 movements)</span>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          PARKING BAY STATUS
      ══════════════════════════════════════════ */}
      {tab==="parking" && (
        <>
          <div style={sectionTitle}>Parking Bay Status</div>

          {/* Grid */}
          <div style={glass({padding:"24px",marginBottom:18})}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:10}}>
              {BAYS.map(b=>{
                const colorMap={occupied:C.red,available:C.green,reserved:C.yellow,maintenance:C.orange};
                const color=colorMap[b.status];
                return (
                  <div key={b.id} className="bay-cell" style={{
                    background:color+"15",border:"1px solid "+color+"40",
                    borderRadius:10,padding:"10px 6px",textAlign:"center",
                    transition:"filter .15s",
                  }}>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color,marginBottom:4}}>{b.id}</div>
                    {b.aircraft&&<div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginBottom:2}}>{b.aircraft}</div>}
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",textTransform:"capitalize"}}>{b.status}</div>
                    {b.since&&<div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{b.since}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend + stats */}
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:18}}>
            {["occupied","available","reserved","maintenance"].map(s=>{
              const colorMap={occupied:C.red,available:C.green,reserved:C.yellow,maintenance:C.orange};
              const color=colorMap[s];
              const count=BAYS.filter(b=>b.status===s).length;
              return (
                <div key={s} style={glass({padding:"14px 20px",flex:"1 1 120px",borderColor:color+"30"})}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",textTransform:"capitalize"}}>{s}</span>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:700,color}}>{count}</div>
                </div>
              );
            })}
          </div>

          {/* Occupied table */}
          <div style={sectionTitle}>Occupied Bays Detail</div>
          <div style={glass({overflow:"hidden"})}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  {["Bay","Aircraft","Parked Since","Duration"].map(h=>(
                    <th key={h} style={{padding:"11px 18px",textAlign:"left",fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BAYS.filter(b=>b.status==="occupied").map((b,i,arr)=>{
                  const hrs = 14-parseInt(b.since||"14");
                  return (
                    <tr key={b.id} style={{borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                      <td style={{padding:"11px 18px",fontFamily:"monospace",color:C.red,fontWeight:700}}>{b.id}</td>
                      <td style={{padding:"11px 18px",fontSize:13,color:"rgba(255,255,255,0.8)"}}>{b.aircraft}</td>
                      <td style={{padding:"11px 18px",fontSize:13,color:"rgba(255,255,255,0.55)"}}>{b.since}</td>
                      <td style={{padding:"11px 18px"}}>
                        <span style={badge(hrs>3?C.red:hrs>1?C.yellow:C.green)}>{hrs}h {hrs>3?"⚠ Long stay":""}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          GPU ALLOCATION
      ══════════════════════════════════════════ */}
      {tab==="gpu" && (
        <>
          <div style={sectionTitle}>Ground Power Unit (GPU) Allocation</div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16,marginBottom:28}}>
            {GPUS.map(g=>{
              const colorMap={active:C.green,standby:C.yellow,fault:C.red};
              const color=colorMap[g.status]||C.muted;
              return (
                <div key={g.id} style={glass({padding:"20px",borderColor:color+"35",boxShadow:"0 0 20px "+color+"12"})}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>{g.id}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Gate: {g.gate}</div>
                    </div>
                    <span style={badge(color)}>{g.status.toUpperCase()}</span>
                  </div>

                  {g.status!=="fault"&&(
                    <div style={{display:"flex",gap:12,marginBottom:14}}>
                      <div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2}}>Voltage</div>
                        <div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{g.voltage}</div>
                      </div>
                      <div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2}}>Current</div>
                        <div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{g.current}</div>
                      </div>
                    </div>
                  )}

                  {g.status==="fault"&&(
                    <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:C.red}}>
                      ⚡ Critical fault detected — immediate inspection required
                    </div>
                  )}

                  {/* Load bar */}
                  <div style={{marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Load</span>
                      <span style={{fontSize:11,fontWeight:700,color:g.load>85?C.red:g.load>70?C.yellow:C.green}}>{g.load}%</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:g.load+"%",borderRadius:3,
                        background:g.load>85?"linear-gradient(90deg,"+C.red+","+C.orange+")":
                                   g.load>70?"linear-gradient(90deg,"+C.yellow+","+C.orange+")":
                                            "linear-gradient(90deg,"+C.green+","+C.cyan+")"}}/>
                    </div>
                  </div>

                  {/* Health bar */}
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Health</span>
                      <span style={{fontSize:11,fontWeight:700,color:g.health<50?C.red:g.health<75?C.yellow:C.green}}>{g.health}%</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:g.health+"%",borderRadius:3,
                        background:g.health<50?"linear-gradient(90deg,"+C.red+","+C.orange+")":
                                   g.health<75?"linear-gradient(90deg,"+C.yellow+","+C.orange+")":
                                             "linear-gradient(90deg,"+C.purple+","+C.blue+")"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={glass({padding:"20px 24px",display:"flex",gap:32,flexWrap:"wrap"})}>
            {[
              {label:"Active",  val:GPUS.filter(g=>g.status==="active").length,  color:C.green},
              {label:"Standby", val:GPUS.filter(g=>g.status==="standby").length, color:C.yellow},
              {label:"Fault",   val:GPUS.filter(g=>g.status==="fault").length,   color:C.red},
              {label:"Avg Load",val:Math.round(GPUS.filter(g=>g.status==="active").reduce((s,g)=>s+g.load,0)/GPUS.filter(g=>g.status==="active").length)+"%", color:C.cyan},
            ].map(s=>(
              <div key={s.label}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:4}}>{s.label}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          AI INSIGHTS
      ══════════════════════════════════════════ */}
      {tab==="ai" && (
        <>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={sectionTitle}>AI Infrastructure Insights</div>
            <div style={{display:"flex",alignItems:"center",gap:6,
              background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.35)",
              borderRadius:20,padding:"3px 12px",fontSize:11,color:C.purple,fontWeight:700}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:C.purple,display:"inline-block",animation:"blink 1.5s ease infinite"}}/>
              LIVE ANALYSIS
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
            {AI_INSIGHTS.map((ins,i)=>{
              const color=INSIGHT_COLORS[ins.type];
              return (
                <div key={i} style={glass({padding:"22px 26px",borderColor:color+"35",
                  boxShadow:"0 0 24px "+color+"12",animation:"fadeUp .3s ease "+i*0.08+"s both"})}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                    <div style={{fontSize:24,flexShrink:0}}>{ins.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{ins.title}</div>
                        <span style={badge(color)}>{ins.type.toUpperCase()}</span>
                        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
                          <div style={{height:5,width:80,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                            <div style={{height:"100%",width:ins.confidence+"%",borderRadius:3,background:"linear-gradient(90deg,"+color+","+color+"80)"}}/>
                          </div>
                          <span style={{fontSize:11,color:color,fontWeight:700}}>{ins.confidence}%</span>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>confidence</span>
                        </div>
                      </div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65}}>{ins.body}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI summary card */}
          <div style={glass({padding:"22px 26px",borderColor:C.purple+"40",background:"rgba(167,139,250,0.06)"})}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{fontSize:28}}>🤖</div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.purple,marginBottom:6}}>Infrastructure AI Summary</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
                  Infrastructure health is <span style={{color:C.green,fontWeight:700}}>good overall</span> with 2 action items requiring immediate attention:{" "}
                  <span style={{color:C.red,fontWeight:700}}>GPU-09 fault</span> and potential{" "}
                  <span style={{color:C.yellow,fontWeight:700}}>Gate B2 boarding congestion</span>.
                  Runway switching to 28R/10L is recommended for the afternoon slot.
                  14 of 24 parking bays occupied — within normal range.
                  AI confidence average: <span style={{color:C.cyan,fontWeight:700}}>87.6%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
