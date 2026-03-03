import React, { useState, useEffect, useCallback, useMemo } from "react";

const APP_VERSION = 'v1.20.0';

/* ─── POSITIONS & FORMATIONS ────────────────────────────────────────────────── */
const ALL_POS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];

const PRESET_FORMATIONS = {
  '4-3-3': [
    {id:'s1',posType:'GK',label:'GK',x:50,y:88},{id:'s2',posType:'LB',label:'LB',x:12,y:70},
    {id:'s3',posType:'CB',label:'CB',x:35,y:70},{id:'s4',posType:'CB',label:'CB',x:65,y:70},
    {id:'s5',posType:'RB',label:'RB',x:88,y:70},{id:'s6',posType:'CM',label:'CM',x:22,y:50},
    {id:'s7',posType:'CM',label:'CM',x:50,y:52},{id:'s8',posType:'CM',label:'CM',x:78,y:50},
    {id:'s9',posType:'LW',label:'LW',x:14,y:25},{id:'s10',posType:'ST',label:'ST',x:50,y:15},
    {id:'s11',posType:'RW',label:'RW',x:86,y:25},
  ],
  '4-4-2': [
    {id:'s1',posType:'GK',label:'GK',x:50,y:88},{id:'s2',posType:'LB',label:'LB',x:12,y:70},
    {id:'s3',posType:'CB',label:'CB',x:35,y:70},{id:'s4',posType:'CB',label:'CB',x:65,y:70},
    {id:'s5',posType:'RB',label:'RB',x:88,y:70},{id:'s6',posType:'LM',label:'LM',x:12,y:50},
    {id:'s7',posType:'CM',label:'CM',x:37,y:50},{id:'s8',posType:'CM',label:'CM',x:63,y:50},
    {id:'s9',posType:'RM',label:'RM',x:88,y:50},{id:'s10',posType:'ST',label:'ST',x:35,y:20},
    {id:'s11',posType:'ST',label:'ST',x:65,y:20},
  ],
  '4-2-3-1': [
    {id:'s1',posType:'GK',label:'GK',x:50,y:88},{id:'s2',posType:'LB',label:'LB',x:12,y:70},
    {id:'s3',posType:'CB',label:'CB',x:35,y:70},{id:'s4',posType:'CB',label:'CB',x:65,y:70},
    {id:'s5',posType:'RB',label:'RB',x:88,y:70},{id:'s6',posType:'CDM',label:'CDM',x:35,y:54},
    {id:'s7',posType:'CDM',label:'CDM',x:65,y:54},{id:'s8',posType:'LW',label:'LW',x:14,y:34},
    {id:'s9',posType:'CAM',label:'CAM',x:50,y:32},{id:'s10',posType:'RW',label:'RW',x:86,y:34},
    {id:'s11',posType:'ST',label:'ST',x:50,y:13},
  ],
  '3-5-2': [
    {id:'s1',posType:'GK',label:'GK',x:50,y:88},{id:'s2',posType:'CB',label:'CB',x:25,y:72},
    {id:'s3',posType:'CB',label:'CB',x:50,y:72},{id:'s4',posType:'CB',label:'CB',x:75,y:72},
    {id:'s5',posType:'LWB',label:'LWB',x:8,y:52},{id:'s6',posType:'CDM',label:'CDM',x:30,y:52},
    {id:'s7',posType:'CM',label:'CM',x:50,y:50},{id:'s8',posType:'CDM',label:'CDM',x:70,y:52},
    {id:'s9',posType:'RWB',label:'RWB',x:92,y:52},{id:'s10',posType:'ST',label:'ST',x:35,y:20},
    {id:'s11',posType:'ST',label:'ST',x:65,y:20},
  ],
};

/* ─── INITIAL DATA ──────────────────────────────────────────────────────────── */
function createInitialData() {
  const playerDefs = [
    {id:'p1',uid:'u3',name:'Alex Johnson',prefs:[{pos:'ST',r:1},{pos:'CF',r:2},{pos:'LW',r:3}],skills:{GK:20,CB:50,LB:55,RB:52,CDM:58,CM:62,CAM:68,LW:74,RW:70,ST:85,CF:80,LM:65,RM:63,LWB:50,RWB:48}},
    {id:'p2',uid:'u4',name:'Marco Silva',prefs:[{pos:'GK',r:1}],skills:{GK:89,CB:30,LB:25,RB:25,CDM:22,CM:20,CAM:18,LW:15,RW:15,ST:12,CF:12,LM:18,RM:18,LWB:28,RWB:28}},
    {id:'p3',uid:'u5',name:'Tom Baker',prefs:[{pos:'CB',r:1},{pos:'CDM',r:2}],skills:{GK:32,CB:83,LB:68,RB:70,CDM:75,CM:62,CAM:45,LW:30,RW:30,ST:28,CF:25,LM:40,RM:40,LWB:65,RWB:65}},
    {id:'p4',uid:'u6',name:'James Wilson',prefs:[{pos:'CM',r:1},{pos:'CDM',r:2},{pos:'CAM',r:3}],skills:{GK:25,CB:55,LB:58,RB:58,CDM:80,CM:86,CAM:78,LW:62,RW:62,ST:50,CF:48,LM:70,RM:70,LWB:55,RWB:55}},
    {id:'p5',uid:'u7',name:'Chris Evans',prefs:[{pos:'LB',r:1},{pos:'LWB',r:2},{pos:'CB',r:3}],skills:{GK:28,CB:72,LB:86,RB:60,CDM:65,CM:55,CAM:42,LW:58,RW:40,ST:30,CF:28,LM:62,RM:42,LWB:83,RWB:55}},
    {id:'p6',uid:'u8',name:'David Lee',prefs:[{pos:'RB',r:1},{pos:'RWB',r:2},{pos:'CB',r:3}],skills:{GK:25,CB:70,LB:58,RB:85,CDM:62,CM:55,CAM:40,LW:42,RW:60,ST:32,CF:28,LM:42,RM:65,LWB:55,RWB:81}},
    {id:'p7',uid:'u9',name:'Ryan Murphy',prefs:[{pos:'CAM',r:1},{pos:'CM',r:2},{pos:'LW',r:3}],skills:{GK:20,CB:40,LB:45,RB:45,CDM:62,CM:76,CAM:87,LW:78,RW:72,ST:65,CF:62,LM:74,RM:70,LWB:42,RWB:42}},
    {id:'p8',uid:'u10',name:'Sam Taylor',prefs:[{pos:'LW',r:1},{pos:'RW',r:2},{pos:'CAM',r:3}],skills:{GK:18,CB:38,LB:50,RB:48,CDM:55,CM:65,CAM:75,LW:89,RW:83,ST:70,CF:68,LM:81,RM:76,LWB:48,RWB:45}},
    {id:'p9',uid:'u11',name:'Jake Brown',prefs:[{pos:'RW',r:1},{pos:'LW',r:2},{pos:'ST',r:3}],skills:{GK:18,CB:35,LB:45,RB:52,CDM:52,CM:62,CAM:72,LW:80,RW:86,ST:72,CF:68,LM:72,RM:83,LWB:45,RWB:50}},
    {id:'p10',uid:'u12',name:'Luke Davis',prefs:[{pos:'CB',r:1},{pos:'RB',r:2}],skills:{GK:30,CB:81,LB:62,RB:68,CDM:70,CM:58,CAM:40,LW:28,RW:32,ST:25,CF:22,LM:38,RM:42,LWB:60,RWB:65}},
    {id:'p11',uid:'u13',name:'Ben Clark',prefs:[{pos:'CDM',r:1},{pos:'CM',r:2},{pos:'CB',r:3}],skills:{GK:28,CB:68,LB:55,RB:55,CDM:85,CM:78,CAM:60,LW:45,RW:45,ST:40,CF:38,LM:58,RM:58,LWB:52,RWB:52}},
    {id:'p12',uid:'u14',name:'Will Harris',prefs:[{pos:'ST',r:1},{pos:'CF',r:2},{pos:'CAM',r:3}],skills:{GK:22,CB:42,LB:45,RB:45,CDM:52,CM:60,CAM:72,LW:68,RW:65,ST:83,CF:86,LM:55,RM:55,LWB:42,RWB:42}},
    {id:'p13',uid:'u15',name:'Oliver King',prefs:[{pos:'LM',r:1},{pos:'LW',r:2},{pos:'CM',r:3}],skills:{GK:20,CB:42,LB:55,RB:48,CDM:58,CM:72,CAM:68,LW:78,RW:65,ST:60,CF:58,LM:86,RM:68,LWB:52,RWB:45}},
  ];

  const users = [
    {id:'u1',name:'Admin',role:'admin',playerId:null},
    {id:'u2',name:'Coach Mike',role:'manager',playerId:null},
    ...playerDefs.map(p => ({id:p.uid,name:p.name,role:'player',playerId:p.id})),
  ];

  const players = playerDefs.map(p => ({
    id:p.id, userId:p.uid, name:p.name,
    positionPreferences: p.prefs.map(x=>({pos:x.pos,rank:x.r})),
    skillRatings: p.skills,
    managerPreference: {},
    unavailable: false,
    trainingAttended: [],
    gamesPlayed: [],
    discordName: '',
    gamingId: '',
  }));

  const formations = Object.entries(PRESET_FORMATIONS).map(([name,slots],i) => ({
    id:`f${i+1}`, name, slots: slots.map(s=>({...s}))
  }));

  const today = new Date();
  const events = [
    {id:'ev1',type:'training',title:'Tuesday Training',date:fmtDate(addDays(today,2)),time:'19:00',location:'City Sports Ground',attendees:[],confirmedAttendees:[]},
    {id:'ev2',type:'training',title:'Thursday Training',date:fmtDate(addDays(today,4)),time:'19:00',location:'City Sports Ground',attendees:[],confirmedAttendees:[]},
    {id:'ev3',type:'competitive',title:'League Match vs FC United',date:fmtDate(addDays(today,6)),time:'15:00',location:'Home Ground',attendees:[],confirmedAttendees:[],formationId:'f1',confirmedLineup:null},
  ];

  return { users, players, formations, events, lineupHistory:[], initialized:true };
}

function fmtDate(d) { return d.toISOString().split('T')[0]; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function formatDisplayDate(s) {
  if (!s) return '';
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
}
function isPast(dateStr) { return new Date(dateStr+'T23:59:59') < new Date(); }

/* ─── SCORING WEIGHTS ───────────────────────────────────────────────────────── */
const DEFAULT_WEIGHTS = {
  skillMultiplier:       7,    // Skill rating (0-99) × this value
  managerPriorityBonus:  500,  // Flat bonus when manager has flagged player for this position
  trainingReliabilityMax:1.2,  // Attendance rate (0-100) × this value  → max 120 pts
  prefRankMultiplier:    3,    // Position preference rank bonus: (6-rank) × this value
  performanceMultiplier: 15,   // Avg match performance rating (1-10) × this value → max 150 pts
};
function getWeights(data) { return {...DEFAULT_WEIGHTS,...(data?.scoringWeights||{})}; }

/* ─── SCORING LOGIC ─────────────────────────────────────────────────────────── */
function calcScore(player, posType, events, weights={}) {
  const W = {...DEFAULT_WEIGHTS, ...weights};
  let score = 0;
  if (player.managerPreference[posType]) score += W.managerPriorityBonus;
  const skill = player.skillRatings[posType] ?? 0;
  score += skill * W.skillMultiplier;
  const pastTrainings = events.filter(e=>e.type==='training'&&isPast(e.date));
  const total = pastTrainings.length;
  const attended = pastTrainings.filter(e=>(e.confirmedAttendees||[]).includes(player.id)).length;
  const reliability = total > 0 ? (attended/total)*100 : 50;
  score += reliability * W.trainingReliabilityMax;
  const pref = player.positionPreferences.find(p=>p.pos===posType);
  if (pref) score += Math.max(0,(6-pref.rank))*W.prefRankMultiplier;
  // Match performance bonus: avg rating (1-10) across rated past matches
  const ratedMatches = events.filter(e=>
    e.type==='competitive' && (isPast(e.date) || e.gameCompleted || e.matchConfirmed) &&
    e.performanceScores && e.performanceScores[player.id] != null
  );
  if (ratedMatches.length > 0) {
    const avgRating = ratedMatches.reduce((sum,e)=>sum+(e.performanceScores[player.id]||0),0) / ratedMatches.length;
    score += Math.round(avgRating * W.performanceMultiplier);
  }
  return Math.round(score);
}

function generateLineup(formation, attendingPlayers, events, weights={}) {
  const slots = formation.slots;
  const scoreMatrix = {};
  for (const p of attendingPlayers) {
    scoreMatrix[p.id] = {};
    for (const slot of slots) {
      scoreMatrix[p.id][slot.id] = calcScore(p, slot.posType, events, weights);
    }
  }
  // Greedy assignment sorted by score
  const pairs = [];
  for (const p of attendingPlayers)
    for (const slot of slots)
      pairs.push({playerId:p.id,slotId:slot.id,score:scoreMatrix[p.id][slot.id]});
  pairs.sort((a,b)=>b.score-a.score);
  const usedPlayers = new Set(), usedSlots = new Set();
  const lineup = [];
  for (const pair of pairs) {
    if (usedPlayers.has(pair.playerId)||usedSlots.has(pair.slotId)) continue;
    usedPlayers.add(pair.playerId); usedSlots.add(pair.slotId);
    lineup.push({...pair, posType: slots.find(s=>s.id===pair.slotId).posType});
    if (lineup.length===slots.length) break;
  }
  const subs = attendingPlayers.filter(p=>!usedPlayers.has(p.id));
  return { lineup, subs };
}

/* ─── STORAGE ───────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'ftm-appdata';

async function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.initialized) return parsed;
    }
  } catch(e) { console.warn('storage error', e); }
  return null;
}

async function saveData(data) {
  try { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
  } catch(e) { 
    console.warn('storage save error', e); 
  }
}

/* ─── UI HELPERS ────────────────────────────────────────────────────────────── */
const C = {
  bg:'#0c1220', sidebar:'#0e1628', card:'#131e30', card2:'#172236',
  border:'#1e2e45', accent:'#4ade80', accent2:'#22c55e', muted:'#5a6f8a',
  text:'#e8edf5', textSm:'#7a90aa'
};
const roleColor = { admin:'#f59e0b', manager:'#60a5fa', player:'#4ade80' };
const roleBg = { admin:'rgba(245,158,11,0.12)', manager:'rgba(96,165,250,0.12)', player:'rgba(74,222,128,0.12)' };

function RolePill({role}) {
  return <span className="pill" style={{background:roleBg[role],color:roleColor[role]}}>{role}</span>;
}
function SkillBar({value,max=99}) {
  const pct = (value/max)*100;
  const c = value>=80?'#4ade80':value>=65?'#facc15':value>=50?'#f97316':'#f87171';
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,height:5,background:'#1e2d42',borderRadius:3,overflow:'hidden'}}>
        <div className="rating-bar" style={{width:`${pct}%`,height:'100%',background:c,borderRadius:3}}/>
      </div>
      <span style={{fontSize:12,color:c,fontWeight:700,fontFamily:'Barlow Condensed',width:22,textAlign:'right'}}>{value}</span>
    </div>
  );
}
function Card({children,style:s={},className='',onClick}) {
  return <div className={`card-hover ${className}`} onClick={onClick}
    style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,transition:'all 0.2s',...s}}>{children}</div>;
}
function Modal({title,onClose,children,width=520,zIndex=100}) {
  return (
    <div className="modal-overlay" style={{zIndex}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="fade-in" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,width,maxWidth:'95vw',maxHeight:'90vh',overflow:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:17,letterSpacing:'0.02em',color:C.text}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:18,lineHeight:1,padding:4}}>✕</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}
function FormRow({label,children}) {
  return <div style={{marginBottom:14}}>
    <label style={{display:'block',fontSize:11,fontWeight:700,letterSpacing:'0.07em',color:C.muted,marginBottom:5,fontFamily:'Barlow Condensed',textTransform:'uppercase'}}>{label}</label>
    {children}
  </div>;
}
function Input({...props}) {
  return <input {...props} style={{width:'100%',background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:'9px 12px',color:C.text,fontSize:14,fontFamily:'Barlow',...(props.style||{})}}/>;
}
function Select({...props}) {
  return <select {...props} style={{width:'100%',background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:'9px 12px',color:C.text,fontSize:14,fontFamily:'Barlow',...(props.style||{})}}/>;
}
function Btn({variant='primary',children,...props}) {
  return <button className={`btn-${variant}`} {...props} style={{padding:'9px 18px',borderRadius:7,fontSize:14,...(props.style||{})}}>{children}</button>;
}
function Badge({c='#4ade80',bg,children}) {
  return <span style={{background:bg||`${c}18`,color:c,padding:'2px 8px',borderRadius:5,fontSize:11,fontWeight:700,fontFamily:'Barlow Condensed',letterSpacing:'0.04em'}}>{children}</span>;
}
function SectionTitle({children}) {
  return <h2 style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:20,letterSpacing:'0.04em',color:C.text,marginBottom:20,textTransform:'uppercase'}}>{children}</h2>;
}
function Tabs({tabs,active,onChange}) {
  return <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,marginBottom:22,gap:2}}>
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>onChange(t.id)}
        className={active===t.id?'tab-active':''}
        style={{padding:'9px 16px',background:'none',border:'none',borderBottom:`2px solid transparent`,cursor:'pointer',color:active===t.id?C.accent:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,letterSpacing:'0.04em',transition:'all 0.15s'}}>
        {t.label}
      </button>
    ))}
  </div>;
}

/* ─── PITCH VISUALIZATION ───────────────────────────────────────────────────── */
function PitchDisplay({formation, lineup, players, subPlayers=[], interactive, highlightSlot, onSlotClick}) {
  const findPlayer = slotId => {
    const entry = (lineup||[]).find(l=>l.slotId===slotId);
    if (!entry) return null;
    return players.find(p=>p.id===entry.playerId)||null;
  };
  return (
    <div style={{position:'relative',width:'100%',maxWidth:360,margin:'0 auto'}}>
      <div className="pitch-bg" style={{width:'100%',paddingBottom:'145%',position:'relative',borderRadius:10,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
        {/* Pitch markings */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} viewBox="0 0 100 145" preserveAspectRatio="none">
          {/* Outer boundary */}
          <rect x="4" y="4" width="92" height="137" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" rx="0.5"/>
          {/* Halfway line */}
          <line x1="4" y1="72.5" x2="96" y2="72.5" stroke="rgba(255,255,255,0.22)" strokeWidth="0.7"/>
          {/* Centre circle */}
          <circle cx="50" cy="72.5" r="11" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7"/>
          <circle cx="50" cy="72.5" r="0.8" fill="rgba(255,255,255,0.4)"/>
          {/* Top penalty area */}
          <rect x="22" y="4" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
          <rect x="34" y="4" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6"/>
          <circle cx="50" cy="16" r="0.8" fill="rgba(255,255,255,0.35)"/>
          {/* Bottom penalty area */}
          <rect x="22" y="121" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
          <rect x="34" y="131" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6"/>
          <circle cx="50" cy="129" r="0.8" fill="rgba(255,255,255,0.35)"/>
        </svg>

        {/* Player slots */}
        {formation.slots.map(slot => {
          const p = findPlayer(slot.id);
          const isHighlighted = highlightSlot === slot.id;
          const firstName = p ? p.name.split(' ')[0] : '';
          const initials = p ? p.name.split(' ').map(w=>w[0]).join('').slice(0,2) : '';

          return (
            <div key={slot.id} className="slot-marker"
              onClick={()=>interactive&&onSlotClick&&onSlotClick(slot)}
              style={{
                position:'absolute', left:`${slot.x}%`, top:`${slot.y}%`,
                transform:'translate(-50%,-50%)',
                cursor:interactive?'pointer':'default',
                textAlign:'center', zIndex:10,
              }}>

              {/* Token circle */}
              <div style={{
                width: 40, height: 40,
                borderRadius:'50%',
                margin:'0 auto',
                background: isHighlighted
                  ? '#f59e0b'
                  : p ? '#22c55e' : 'rgba(255,255,255,0.08)',
                border: isHighlighted
                  ? '2px solid #fde68a'
                  : p ? '2px solid rgba(255,255,255,0.35)' : '1.5px dashed rgba(255,255,255,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: p ? '0 2px 8px rgba(0,0,0,0.35)' : 'none',
                transition:'all 0.15s',
              }}>
                {p ? (
                  <span style={{fontSize:11,fontWeight:800,color:'#fff',fontFamily:'Barlow Condensed',letterSpacing:'0.02em'}}>
                    {initials}
                  </span>
                ) : (
                  <span style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,0.35)',fontFamily:'Barlow Condensed'}}>{slot.posType}</span>
                )}
              </div>

              {/* Name label */}
              {p ? (
                <div style={{
                  marginTop:4,
                  fontSize:9, fontWeight:700, fontFamily:'Barlow Condensed',
                  color:'#fff', letterSpacing:'0.03em',
                  textShadow:'0 1px 4px rgba(0,0,0,0.9)',
                  whiteSpace:'nowrap',
                  background:'rgba(0,0,0,0.4)',
                  padding:'1px 5px', borderRadius:3,
                  display:'inline-block',
                }}>
                  {firstName}
                </div>
              ) : (
                <div style={{marginTop:4,fontSize:8,color:'rgba(255,255,255,0.2)',fontFamily:'Barlow Condensed'}}>{slot.posType}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Substitutes bench */}
      {subPlayers.length > 0 && (
        <div style={{marginTop:10,background:C.card2,borderRadius:8,padding:'10px 12px',border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,fontFamily:'Barlow Condensed',letterSpacing:'0.08em',marginBottom:8,textTransform:'uppercase'}}>Bench</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {subPlayers.map(p=>(
              <div key={p.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:5,padding:'3px 8px',fontSize:11,fontFamily:'Barlow Condensed',fontWeight:600,color:C.textSm}}>
                {p.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── NAV ───────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {id:'dashboard',label:'Dashboard',icon:'⚡',roles:['admin','manager','player']},
  {id:'roster',label:'Roster',icon:'👥',roles:['admin','manager','player']},
  {id:'lineup',label:'Lineup Generator',icon:'🧩',roles:['admin','manager']},
  {id:'trainings',label:'Trainings',icon:'🏃',roles:['admin','manager','player']},
  {id:'games',label:'Matches',icon:'⚽',roles:['admin','manager','player']},
  {id:'formations',label:'Formations',icon:'📋',roles:['admin','manager']},
  {id:'users',label:'User Management',icon:'🔑',roles:['admin']},
];

/* ─── PAGES ─────────────────────────────────────────────────────────────────── */

function DashboardPage({data, currentUser, setPage}) {
  const now = new Date();
  const upcoming = data.events.filter(e=>!isPast(e.date)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  const myPlayer = data.players.find(p=>p.id===currentUser.playerId);
  const totalTrainings = data.events.filter(e=>e.type==='training').length;
  const myAttended = myPlayer ? data.events.filter(e=>e.type==='training'&&isPast(e.date)&&(e.confirmedAttendees||[]).includes(myPlayer.id)).length : 0;

  return (
    <div className="fade-in">
      <div style={{marginBottom:32}}>
        <div style={{fontFamily:'Barlow Condensed',fontSize:13,color:C.accent,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:6}}>Welcome back</div>
        <h1 style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:38,letterSpacing:'0.03em',textTransform:'uppercase',color:C.text,lineHeight:1}}>
          {currentUser.name}
        </h1>
        <div style={{marginTop:6}}><RolePill role={currentUser.role}/></div>
      </div>

      <div className="stats-grid" style={{marginBottom:24}}>
        {[
          {label:'Players',value:data.players.length,icon:'👥',c:'#60a5fa'},
          {label:'Upcoming Events',value:data.events.filter(e=>!isPast(e.date)).length,icon:'📅',c:'#f59e0b'},
          {label:'Formations',value:data.formations.length,icon:'📋',c:'#a78bfa'},
          ...(myPlayer?[{label:'My Attendance',value:`${myAttended}/${data.events.filter(e=>e.type==='training'&&isPast(e.date)).length}`,icon:'✅',c:C.accent}]:[]),
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:'14px 16px',display:'flex',alignItems:'center',gap:14}}>
            <div style={{fontSize:22,lineHeight:1}}>{s.icon}</div>
            <div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:26,fontWeight:800,color:s.c,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:3}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',color:C.muted,marginBottom:12}}>Upcoming Events</div>
          {upcoming.length===0 && <div style={{color:C.muted,fontSize:13}}>No upcoming events.</div>}
          {upcoming.map(e=>(
            <div key={e.id}
              onClick={()=>setPage(e.type==='training'?'trainings':'games')}
              style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${e.type==='training'?'#3b82f6':'#f59e0b'}`,borderRadius:6,padding:'10px 14px',marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'all 0.15s'}}
              className="card-hover">
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.title}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{formatDisplayDate(e.date)} · {e.time}</div>
              </div>
              <div style={{fontSize:11,color:C.muted,flexShrink:0}}>{(e.attendees||[]).length}</div>
            </div>
          ))}
        </div>

        {(currentUser.role==='admin'||currentUser.role==='manager') && (
          <div>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',color:C.muted,marginBottom:12}}>Quick Actions</div>
            {[
              {label:'Generate Lineup',icon:'🧩',page:'lineup',desc:'Build your starting 11'},
              {label:'Add Training',icon:'🏃',page:'trainings',desc:'Schedule a session'},
              {label:'Add Match',icon:'⚽',page:'games',desc:'Plan a fixture'},
            ].map((a,i)=>(
              <div key={i} onClick={()=>setPage(a.page)}
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:'10px 14px',marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}
                className="card-hover">
                <span style={{fontSize:20,flexShrink:0}}>{a.icon}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:C.text}}>{a.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── GAUGE ARC ──────────────────────────────────────────────────────────────── */
function GaugeArc({ score, size=84, label, sublabel, noScore=false }) {
  const cx = size / 2;
  const cy = size * 0.54;
  const r  = size * 0.37;
  const sw = size * 0.095;
  const START_DEG = 150;
  const SPAN_DEG  = 240;

  const toRad = d => d * Math.PI / 180;
  function arcPath(fromDeg, toDeg) {
    const diff = ((toDeg - fromDeg) % 360 + 360) % 360;
    if (diff < 0.5) return '';
    const s = toRad(fromDeg), e = toRad(toDeg);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${diff > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  const endDeg   = START_DEG + (Math.min(10, Math.max(0, score)) / 10) * SPAN_DEG;
  const bgPath   = arcPath(START_DEG, START_DEG + SPAN_DEG);
  const fillPath = !noScore && score > 0 ? arcPath(START_DEG, endDeg) : null;
  const c = score >= 9 ? '#4ade80' : score >= 7 ? '#86efac' : score >= 5 ? '#facc15' : score >= 3 ? '#f97316' : '#f87171';
  const h = Math.round(size * 0.78);

  return (
    <div style={{textAlign:'center'}}>
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} style={{overflow:'visible'}}>
        <path d={bgPath} fill="none" stroke="#1e2d42" strokeWidth={sw} strokeLinecap="round"/>
        {fillPath && <path d={fillPath} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" style={{transition:'stroke-dashoffset 0.4s ease'}}/>}
        {!noScore && (
          <text x={cx} y={cy+size*0.07} textAnchor="middle" dominantBaseline="middle"
            fill={score>0?c:'#334155'} fontSize={size*0.23}
            fontFamily="'Barlow Condensed',sans-serif" fontWeight="900">
            {score > 0 ? score : '—'}
          </text>
        )}
      </svg>
      {label    && <div style={{fontSize:10,color:'#5a6f8a',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginTop:-2,letterSpacing:'0.04em',textTransform:'uppercase',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:size}}>{label}</div>}
      {sublabel && <div style={{fontSize:9,color:'#334155',fontFamily:"'Barlow Condensed',sans-serif",marginTop:1}}>{sublabel}</div>}
    </div>
  );
}

/* ─── FUT PLAYER CARD ────────────────────────────────────────────────────────── */
function FUTPlayerCard({ player, onClick, compact = false }) {
  const attrs = player.futAttributes || { PAC: 50, SHO: 50, PAS: 50, DRI: 50, DEF: 50, PHY: 50 };
  const overall = Math.round((attrs.PAC + attrs.SHO + attrs.PAS + attrs.DRI + attrs.DEF + attrs.PHY) / 6);
  const position = player.positionPreferences?.[0]?.pos || 'CM';
  
  // Card tier based on overall
  const tier = overall >= 85 ? 'gold' : overall >= 70 ? 'silver' : 'bronze';
  const tierColors = {
    gold: { primary: '#d4af37', secondary: '#f4e4a6', bg: 'rgba(212,175,55,0.1)' },
    silver: { primary: '#c0c0c0', secondary: '#e8e8e8', bg: 'rgba(192,192,192,0.1)' },
    bronze: { primary: '#cd7f32', secondary: '#e8c496', bg: 'rgba(205,127,50,0.1)' },
  };
  const colors = tierColors[tier];

  const attrColor = (val) => val >= 90 ? '#4ade80' : val >= 80 ? '#86efac' : val >= 70 ? '#facc15' : val >= 60 ? '#f97316' : '#e8edf5';

  if (compact) {
    return (
      <div onClick={onClick} className={`fut-card fut-card-${tier}`} style={{width:165,height:245,cursor:'pointer'}}>
        {/* Rating & Position */}
        <div style={{position:'absolute',top:12,left:12,zIndex:2}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:34,color:colors.primary,lineHeight:1,textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>{overall}</div>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:colors.secondary,letterSpacing:'0.05em',marginTop:2}}>{position}</div>
        </div>

        {/* Player Image Area */}
        <div style={{position:'absolute',top:10,right:10,width:85,height:95,borderRadius:6,overflow:'hidden',border:`1px solid ${colors.primary}30`,background:colors.bg}}>
          {player.playerImage ? (
            <img src={player.playerImage} alt={player.name} style={{
              width:'100%',
              height:'100%',
              objectFit:'cover',
              objectPosition: player.imagePosition || 'center top',
              transform: `scale(${player.imageZoom || 1})`,
            }}/>
          ) : (
            <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
                <ellipse cx="25" cy="18" rx="14" ry="16" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1" strokeOpacity="0.3"/>
                <path d="M5 58 C5 42, 12 35, 25 35 C38 35, 45 42, 45 58" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1" strokeOpacity="0.3"/>
              </svg>
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{position:'absolute',top:112,left:0,right:0,textAlign:'center',padding:'0 8px'}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:15,color:colors.primary,textTransform:'uppercase',letterSpacing:'0.06em',textShadow:'0 1px 3px rgba(0,0,0,0.5)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {player.name.split(' ').pop()}
          </div>
        </div>

        {/* Divider */}
        <div style={{position:'absolute',top:134,left:14,right:14,height:1,background:`linear-gradient(90deg, transparent, ${colors.primary}50, transparent)`}}/>

        {/* Attributes - 2 columns */}
        <div style={{position:'absolute',top:144,left:14,right:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px'}}>
          {[['PAC','DRI'],['SHO','DEF'],['PAS','PHY']].map(([left,right])=>(
            <React.Fragment key={left}>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:16,color:attrColor(attrs[left]),minWidth:24}}>{attrs[left]}</span>
                <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:10,color:colors.secondary,opacity:0.8}}>{left}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:16,color:attrColor(attrs[right]),minWidth:24}}>{attrs[right]}</span>
                <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:10,color:colors.secondary,opacity:0.8}}>{right}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Unavailable overlay */}
        {player.unavailable && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:14}}>
            <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:14,color:'#f87171',textTransform:'uppercase',letterSpacing:'0.1em'}}>Unavailable</span>
          </div>
        )}
      </div>
    );
  }

  // Full size card (for modal)
  return (
    <div className={`fut-card fut-card-${tier}`} style={{width:200,height:300}}>
      {/* Rating & Position */}
      <div style={{position:'absolute',top:14,left:14,zIndex:2}}>
        <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:44,color:colors.primary,lineHeight:1,textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>{overall}</div>
        <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:16,color:colors.secondary,letterSpacing:'0.05em',marginTop:2}}>{position}</div>
      </div>

      {/* Player Image Area */}
      <div style={{position:'absolute',top:12,right:12,width:100,height:110,borderRadius:8,overflow:'hidden',border:`1.5px solid ${colors.primary}40`,background:colors.bg}}>
        {player.playerImage ? (
          <img src={player.playerImage} alt={player.name} style={{
            width:'100%',
            height:'100%',
            objectFit:'cover',
            objectPosition: player.imagePosition || 'center top',
            transform: `scale(${player.imageZoom || 1})`,
          }}/>
        ) : (
          <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
            <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
              <ellipse cx="30" cy="20" rx="16" ry="18" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.3"/>
              <path d="M6 68 C6 48, 15 40, 30 40 C45 40, 54 48, 54 68" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.3"/>
            </svg>
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{position:'absolute',top:130,left:0,right:0,textAlign:'center',padding:'0 12px'}}>
        <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:colors.primary,textTransform:'uppercase',letterSpacing:'0.08em',textShadow:'0 1px 3px rgba(0,0,0,0.5)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
          {player.name.split(' ').pop()}
        </div>
      </div>

      {/* Divider */}
      <div style={{position:'absolute',top:156,left:18,right:18,height:1,background:`linear-gradient(90deg, transparent, ${colors.primary}50, transparent)`}}/>

      {/* Attributes - 2 columns */}
      <div style={{position:'absolute',top:168,left:16,right:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 28px'}}>
        {[['PAC','DRI'],['SHO','DEF'],['PAS','PHY']].map(([left,right])=>(
          <React.Fragment key={left}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:20,color:attrColor(attrs[left]),minWidth:28}}>{attrs[left]}</span>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:12,color:colors.secondary,opacity:0.8}}>{left}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:20,color:attrColor(attrs[right]),minWidth:28}}>{attrs[right]}</span>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:12,color:colors.secondary,opacity:0.8}}>{right}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Unavailable overlay */}
      {player.unavailable && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:14}}>
          <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:'#f87171',textTransform:'uppercase',letterSpacing:'0.1em'}}>Unavailable</span>
        </div>
      )}
    </div>
  );
}

/* ─── FUT CARD EDITOR MODAL ──────────────────────────────────────────────────── */
function FUTCardEditorModal({ player, onSave, onClose }) {
  const [attrs, setAttrs] = useState(player.futAttributes || { PAC: 50, SHO: 50, PAS: 50, DRI: 50, DEF: 50, PHY: 50 });
  const [imageData, setImageData] = useState(player.playerImage || null);
  const [imageZoom, setImageZoom] = useState(player.imageZoom || 1);
  const [imagePosX, setImagePosX] = useState(player.imagePosX ?? 50); // 0-100, 50 = center
  const [imagePosY, setImagePosY] = useState(player.imagePosY ?? 20); // 0-100, 20 = near top
  const [uploading, setUploading] = useState(false);

  const overall = Math.round((attrs.PAC + attrs.SHO + attrs.PAS + attrs.DRI + attrs.DEF + attrs.PHY) / 6);
  const tier = overall >= 85 ? 'gold' : overall >= 70 ? 'silver' : 'bronze';
  const tierColors = {
    gold: { primary: '#d4af37', secondary: '#f4e4a6', bg: 'rgba(212,175,55,0.1)' },
    silver: { primary: '#c0c0c0', secondary: '#e8e8e8', bg: 'rgba(192,192,192,0.1)' },
    bronze: { primary: '#cd7f32', secondary: '#e8c496', bg: 'rgba(205,127,50,0.1)' },
  };
  const colors = tierColors[tier];

  const attrLabels = {
    PAC: 'Pace',
    SHO: 'Shooting',
    PAS: 'Passing',
    DRI: 'Dribbling',
    DEF: 'Defending',
    PHY: 'Physical'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageData(ev.target.result);
      setImageZoom(1);
      setImagePosX(50);
      setImagePosY(30);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ 
      futAttributes: attrs, 
      playerImage: imageData,
      imageZoom,
      imagePosX,
      imagePosY,
      imagePosition: `${imagePosX}% ${imagePosY}%`
    });
  };

  const position = player.positionPreferences?.[0]?.pos || 'CM';
  const attrColor = (val) => val >= 90 ? '#4ade80' : val >= 80 ? '#86efac' : val >= 70 ? '#facc15' : val >= 60 ? '#f97316' : '#e8edf5';

  return (
    <Modal title="Edit Player Card" onClose={onClose} width={600} zIndex={150}>
      <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        {/* Left side: Card Preview + Photo Controls */}
        <div style={{flexShrink:0,width:200}}>
          {/* Card Preview */}
          <div className={`fut-card fut-card-${tier}`} style={{width:200,height:300,cursor:'default'}}>
            {/* Rating & Position */}
            <div style={{position:'absolute',top:14,left:14,zIndex:2}}>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:44,color:colors.primary,lineHeight:1,textShadow:'0 2px 4px rgba(0,0,0,0.5)'}}>{overall}</div>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:16,color:colors.secondary,letterSpacing:'0.05em',marginTop:2}}>{position}</div>
            </div>

            {/* Player Image Area */}
            <div style={{position:'absolute',top:12,right:12,width:100,height:110,borderRadius:8,overflow:'hidden',border:`1.5px solid ${colors.primary}40`,background:colors.bg}}>
              {imageData ? (
                <img src={imageData} alt={player.name} style={{
                  width:'100%',
                  height:'100%',
                  objectFit:'cover',
                  objectPosition: `${imagePosX}% ${imagePosY}%`,
                  transform: `scale(${imageZoom})`,
                }}/>
              ) : (
                <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
                  <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                    <ellipse cx="30" cy="20" rx="16" ry="18" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.3"/>
                    <path d="M6 68 C6 48, 15 40, 30 40 C45 40, 54 48, 54 68" fill={colors.primary+'15'} stroke={colors.primary} strokeWidth="1.5" strokeOpacity="0.3"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{position:'absolute',top:130,left:0,right:0,textAlign:'center',padding:'0 12px'}}>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:colors.primary,textTransform:'uppercase',letterSpacing:'0.08em',textShadow:'0 1px 3px rgba(0,0,0,0.5)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {player.name.split(' ').pop()}
              </div>
            </div>

            {/* Divider */}
            <div style={{position:'absolute',top:156,left:18,right:18,height:1,background:`linear-gradient(90deg, transparent, ${colors.primary}50, transparent)`}}/>

            {/* Attributes */}
            <div style={{position:'absolute',top:168,left:16,right:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 28px'}}>
              {[['PAC','DRI'],['SHO','DEF'],['PAS','PHY']].map(([left,right])=>(
                <React.Fragment key={left}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:20,color:attrColor(attrs[left]),minWidth:28}}>{attrs[left]}</span>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:12,color:colors.secondary,opacity:0.8}}>{left}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:20,color:attrColor(attrs[right]),minWidth:28}}>{attrs[right]}</span>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:600,fontSize:12,color:colors.secondary,opacity:0.8}}>{right}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Photo Upload Button */}
          <div style={{marginTop:12}}>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} id="fut-photo-upload"/>
            <label htmlFor="fut-photo-upload" style={{
              display:'block',width:'100%',padding:'10px 14px',
              background:'linear-gradient(135deg, #172236 0%, #1e2d42 100%)',
              border:'1px dashed #3a4f6a',borderRadius:8,
              color:'#7a90aa',fontSize:12,fontFamily:'Barlow Condensed',fontWeight:700,
              textAlign:'center',cursor:'pointer',transition:'all 0.15s',
              letterSpacing:'0.04em'
            }}>
              📷 {imageData ? 'Change Photo' : 'Upload Photo'}
            </label>
            {uploading && <div style={{marginTop:6,fontSize:11,color:'#5a6f8a',textAlign:'center'}}>Uploading...</div>}
          </div>

          {/* Photo Adjustment Controls */}
          {imageData && (
            <div style={{marginTop:12,padding:12,background:'#172236',borderRadius:8,border:'1px solid #1e2e45'}}>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>📐 Adjust Photo</div>
              
              {/* Zoom */}
              <div style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:11,color:'#7a90aa',fontFamily:'Barlow Condensed'}}>Zoom</span>
                  <span style={{fontSize:11,color:'#e8edf5',fontFamily:'Barlow Condensed',fontWeight:700}}>{Math.round(imageZoom * 100)}%</span>
                </div>
                <input type="range" min="100" max="200" value={imageZoom * 100}
                  onChange={e => setImageZoom(+e.target.value / 100)}
                  style={{width:'100%',accentColor:colors.primary,cursor:'pointer'}}/>
              </div>

              {/* Horizontal Position */}
              <div style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:11,color:'#7a90aa',fontFamily:'Barlow Condensed'}}>← Horizontal →</span>
                  <span style={{fontSize:11,color:'#e8edf5',fontFamily:'Barlow Condensed',fontWeight:700}}>{imagePosX}%</span>
                </div>
                <input type="range" min="0" max="100" value={imagePosX}
                  onChange={e => setImagePosX(+e.target.value)}
                  style={{width:'100%',accentColor:colors.primary,cursor:'pointer'}}/>
              </div>

              {/* Vertical Position */}
              <div style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:11,color:'#7a90aa',fontFamily:'Barlow Condensed'}}>↑ Vertical ↓</span>
                  <span style={{fontSize:11,color:'#e8edf5',fontFamily:'Barlow Condensed',fontWeight:700}}>{imagePosY}%</span>
                </div>
                <input type="range" min="0" max="100" value={imagePosY}
                  onChange={e => setImagePosY(+e.target.value)}
                  style={{width:'100%',accentColor:colors.primary,cursor:'pointer'}}/>
              </div>

              {/* Reset & Remove buttons */}
              <div style={{display:'flex',gap:6,marginTop:10}}>
                <button onClick={()=>{setImageZoom(1);setImagePosX(50);setImagePosY(30);}}
                  style={{flex:1,padding:'6px 10px',background:'#1e2d42',border:'1px solid #3a4f6a',borderRadius:6,color:'#7a90aa',fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer'}}>
                  Reset Position
                </button>
                <button onClick={()=>setImageData(null)}
                  style={{flex:1,padding:'6px 10px',background:'transparent',border:'1px solid #7f1d1d',borderRadius:6,color:'#f87171',fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer'}}>
                  Remove Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Attribute Sliders */}
        <div style={{flex:1,minWidth:240}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>⚡ Attributes</div>
          {Object.entries(attrLabels).map(([key, label]) => {
            const val = attrs[key];
            const c = val >= 90 ? '#4ade80' : val >= 80 ? '#86efac' : val >= 70 ? '#facc15' : val >= 60 ? '#f97316' : '#7a90aa';
            return (
              <div key={key} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:12,color:'#7a90aa',fontFamily:'Barlow Condensed',fontWeight:600}}>{label}</span>
                  <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:c}}>{val}</span>
                </div>
                <input
                  type="range" min="1" max="99" value={val}
                  onChange={e => setAttrs(a => ({...a, [key]: +e.target.value}))}
                  style={{width:'100%',accentColor:c,cursor:'pointer'}}
                />
              </div>
            );
          })}

          {/* Overall preview */}
          <div style={{marginTop:16,padding:'14px 18px',background:'linear-gradient(135deg, #172236 0%, #1e2d42 100%)',borderRadius:10,border:'1px solid #1e2e45',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.06em'}}>Overall Rating</span>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:10,color:'#475569',marginTop:2}}>
                {tier.toUpperCase()} TIER
              </div>
            </div>
            <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:36,color:colors.primary,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{overall}</span>
          </div>

          {/* Tier info */}
          <div style={{marginTop:10,padding:'8px 12px',background:'rgba(255,255,255,0.02)',borderRadius:6,fontSize:10,color:'#5a6f8a',lineHeight:1.5}}>
            <strong style={{color:'#d4af37'}}>Gold</strong>: 85+ &nbsp;|&nbsp; 
            <strong style={{color:'#c0c0c0'}}>Silver</strong>: 70-84 &nbsp;|&nbsp; 
            <strong style={{color:'#cd7f32'}}>Bronze</strong>: &lt;70
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20,paddingTop:16,borderTop:'1px solid #1e2e45'}}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>💾 Save Card</Btn>
      </div>
    </Modal>
  );
}

/* ─── ALL PERFORMANCES MODAL ─────────────────────────────────────────────────── */
function AllPerformancesModal({ player, events, onClose }) {
  const ratedMatches = events
    .filter(e => e.type==='competitive' && (isPast(e.date) || e.gameCompleted || e.matchConfirmed) && e.performanceScores && e.performanceScores[player.id] != null)
    .sort((a,b) => b.date.localeCompare(a.date));

  const avg = ratedMatches.length
    ? (ratedMatches.reduce((s,e)=>s+e.performanceScores[player.id],0) / ratedMatches.length)
    : null;

  const ratingColor  = v => v>=9?'#4ade80':v>=7?'#86efac':v>=5?'#facc15':v>=3?'#f97316':'#f87171';
  const ratingLabel  = v => v===10?'World Class':v>=9?'Excellent':v>=8?'Very Good':v>=7?'Good':v>=5?'Average':v>=3?'Poor':'Awful';

  return (
    <Modal title={`Performance History — ${player.name}`} onClose={onClose} width={520} zIndex={150}>
      {/* Summary bar */}
      {avg !== null ? (
        <div style={{display:'flex',alignItems:'center',gap:20,padding:'14px 18px',background:'#172236',borderRadius:10,marginBottom:18,border:'1px solid #1e2e45'}}>
          <GaugeArc score={Math.round(avg*10)/10} size={80}/>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:28,color:ratingColor(Math.round(avg)),lineHeight:1}}>
              {avg.toFixed(2)}<span style={{fontSize:14,color:'#5a6f8a',fontWeight:400}}> / 10</span>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,color:'#7a90aa',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:3}}>Career Average</div>
            <div style={{fontSize:12,color:'#5a6f8a',marginTop:3}}>{ratedMatches.length} rated match{ratedMatches.length!==1?'es':''}</div>
          </div>
        </div>
      ) : (
        <div style={{padding:'16px',background:'#172236',borderRadius:10,marginBottom:18,fontSize:13,color:'#5a6f8a',textAlign:'center'}}>No rated matches yet.</div>
      )}

      {/* Match list */}
      <div style={{display:'grid',gap:6,maxHeight:'52vh',overflowY:'auto',paddingRight:4}}>
        {ratedMatches.map((ev,i) => {
          const score  = ev.performanceScores[player.id];
          const c      = ratingColor(score);
          const lineup = (ev.confirmedLineup||[]).find(l=>l.playerId===player.id);
          return (
            <div key={ev.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',background:'#172236',borderRadius:8,border:`1px solid #1e2e45`,borderLeft:`3px solid ${c}`}}>
              {/* Rank */}
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:'#334155',width:18,textAlign:'center',flexShrink:0}}>#{ratedMatches.length-i}</div>
              {/* Date block */}
              <div style={{textAlign:'center',flexShrink:0,width:28}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:'#e8edf5',lineHeight:1}}>{new Date(ev.date+'T12:00:00').getDate()}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,color:'#5a6f8a',textTransform:'uppercase'}}>{new Date(ev.date+'T12:00:00').toLocaleDateString('en-GB',{month:'short'})}</div>
              </div>
              <div style={{width:1,height:32,background:'#1e2e45',flexShrink:0}}/>
              {/* Match info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,color:'#e8edf5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev.title}</div>
                <div style={{display:'flex',gap:6,marginTop:3,alignItems:'center'}}>
                  {lineup && <span style={{background:'#1e2d42',color:'#4ade80',padding:'1px 6px',borderRadius:3,fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{lineup.posType}</span>}
                  <span style={{fontSize:11,color:c,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{ratingLabel(score)}</span>
                </div>
              </div>
              {/* Score gauge */}
              <GaugeArc score={score} size={56}/>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ─── ROSTER PAGE ────────────────────────────────────────────────────────────── */
function RosterPage({data,setData,currentUser}) {
  const [selectedPlayer,setSelectedPlayer]=useState(null);
  const [editingSkills,setEditingSkills]=useState(false);
  const [editingPrefs,setEditingPrefs]=useState(false);
  const [localSkills,setLocalSkills]=useState({});
  const [localPrefs,setLocalPrefs]=useState([]);
  const [managerPref,setManagerPref]=useState('');
  const [editingContact,setEditingContact]=useState(false);
  const [localDiscord,setLocalDiscord]=useState('');
  const [localGamingId,setLocalGamingId]=useState('');
  const [showAddPlayer,setShowAddPlayer]=useState(false);
  const [newPlayerName,setNewPlayerName]=useState('');
  const [editingName,setEditingName]=useState(false);
  const [localName,setLocalName]=useState('');
  const [editingFUTCard,setEditingFUTCard]=useState(null);

  // Check if current user can edit a player's FUT card (own card or admin/manager)
  const canEditFUTCard = (p) => currentUser.role==='admin'||currentUser.role==='manager'||(currentUser.playerId===p.id);

  function saveFUTCard(playerId, cardData) {
    setData(d=>({...d, players:d.players.map(p=>
      p.id===playerId ? {
        ...p, 
        futAttributes: cardData.futAttributes, 
        playerImage: cardData.playerImage,
        imageZoom: cardData.imageZoom,
        imagePosX: cardData.imagePosX,
        imagePosY: cardData.imagePosY,
        imagePosition: cardData.imagePosition
      } : p
    )}));
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(s=>({
        ...s, 
        futAttributes: cardData.futAttributes, 
        playerImage: cardData.playerImage,
        imageZoom: cardData.imageZoom,
        imagePosX: cardData.imagePosX,
        imagePosY: cardData.imagePosY,
        imagePosition: cardData.imagePosition
      }));
    }
    setEditingFUTCard(null);
  }

  const canEditSkills = currentUser.role==='admin'||currentUser.role==='manager';
  const canEditPrefs = (p) => currentUser.role==='admin'||currentUser.role==='manager'||(currentUser.playerId===p.id);
  const canSetMgrPref = currentUser.role==='admin'||currentUser.role==='manager';
  const isAdmin = currentUser.role==='admin';
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showAllPerformances, setShowAllPerformances] = useState(false);

  function openPlayer(p) {
    setSelectedPlayer(p);
    setLocalSkills({...p.skillRatings});
    setLocalPrefs([...p.positionPreferences]);
    setLocalDiscord(p.discordName||'');
    setLocalGamingId(p.gamingId||'');
    setLocalName(p.name);
    setEditingSkills(false); setEditingPrefs(false); setEditingContact(false); setEditingName(false); setManagerPref(''); setConfirmRemove(false);
  }

  function removeFromRoster() {
    setData(d=>({...d, players:d.players.map(p=>p.id===selectedPlayer.id?{...p,removedFromRoster:true}:p)}));
    setSelectedPlayer(null);
    setConfirmRemove(false);
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    const pid = `p${Date.now()}`;
    const uid = `u${Date.now()}`;
    const newPlayer = {
      id:pid, userId:uid, name,
      positionPreferences:[], skillRatings:{},
      managerPreference:{}, unavailable:false,
      trainingAttended:[], gamesPlayed:[],
      discordName:'', gamingId:'',
    };
    const newUser = {id:uid, name, role:'player', playerId:pid};
    setData(d=>({...d, players:[...d.players,newPlayer], users:[...d.users,newUser]}));
    setNewPlayerName('');
    setShowAddPlayer(false);
  }

  function saveName() {
    const name = localName.trim();
    if (!name) return;
    setData(d=>({...d,
      players:d.players.map(p=>p.id===selectedPlayer.id?{...p,name}:p),
      users:d.users.map(u=>u.id===selectedPlayer.userId?{...u,name}:u),
    }));
    setSelectedPlayer(s=>({...s,name}));
    setEditingName(false);
  }

  function saveContact() {
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,discordName:localDiscord,gamingId:localGamingId}:p)}));
    setSelectedPlayer(s=>({...s,discordName:localDiscord,gamingId:localGamingId}));
    setEditingContact(false);
  }

  function saveSkills() {
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,skillRatings:{...localSkills}}:p)}));
    setSelectedPlayer(s=>({...s,skillRatings:{...localSkills}}));
    setEditingSkills(false);
  }

  function savePrefs() {
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,positionPreferences:[...localPrefs]}:p)}));
    setSelectedPlayer(s=>({...s,positionPreferences:[...localPrefs]}));
    setEditingPrefs(false);
  }

  function addManagerPref() {
    if (!managerPref) return;
    const updated = {...selectedPlayer.managerPreference,[managerPref]:true};
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,managerPreference:updated}:p)}));
    setSelectedPlayer(s=>({...s,managerPreference:updated}));
    setManagerPref('');
  }

  function removeManagerPref(pos) {
    const updated = {...selectedPlayer.managerPreference};
    delete updated[pos];
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,managerPreference:updated}:p)}));
    setSelectedPlayer(s=>({...s,managerPreference:updated}));
  }

  function toggleUnavailable() {
    const val = !selectedPlayer.unavailable;
    setData(d=>({...d,players:d.players.map(p=>p.id===selectedPlayer.id?{...p,unavailable:val}:p)}));
    setSelectedPlayer(s=>({...s,unavailable:val}));
  }

  function addPref() {
    const available = ALL_POS.filter(p=>!localPrefs.find(lp=>lp.pos===p));
    if (!available.length) return;
    setLocalPrefs(lp=>[...lp,{pos:available[0],rank:lp.length+1}]);
  }

  function removePref(idx) {
    const updated = localPrefs.filter((_,i)=>i!==idx).map((p,i)=>({...p,rank:i+1}));
    setLocalPrefs(updated);
  }

  const topSkills = p => {
    const prefPositions = new Set(p.positionPreferences.map(x=>x.pos));
    if (prefPositions.size === 0) return [];
    return p.positionPreferences
      .sort((a,b)=>a.rank-b.rank)
      .map(pref => [pref.pos, p.skillRatings[pref.pos]??0]);
  };

  // Calculate average performance rating for a player
  const getAvgRating = (playerId) => {
    const ratedMatches = data.events.filter(e =>
      e.type==='competitive' && (isPast(e.date) || e.gameCompleted || e.matchConfirmed) &&
      e.performanceScores && e.performanceScores[playerId] != null
    );
    if (ratedMatches.length === 0) return null;
    const sum = ratedMatches.reduce((s, e) => s + e.performanceScores[playerId], 0);
    return (sum / ratedMatches.length).toFixed(1);
  };

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <SectionTitle style={{margin:0}}>Player Roster</SectionTitle>
        {canEditSkills&&<Btn onClick={()=>setShowAddPlayer(true)}>+ Add Player</Btn>}
      </div>
      {data.players.filter(p=>p.removedFromRoster).length>0&&(
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>
          {data.players.filter(p=>p.removedFromRoster).length} player(s) removed from roster — records retained in database.
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:20,justifyItems:'center'}}>
        {data.players.filter(p=>!p.removedFromRoster).map(p=>(
          <FUTPlayerCard key={p.id} player={p} onClick={()=>openPlayer(p)} compact={true}/>
        ))}
      </div>

      {selectedPlayer && (
        <Modal title={editingName ? 'Edit Player Name' : selectedPlayer.name} onClose={()=>setSelectedPlayer(null)} width={580}>
          {/* Name edit section (admin/manager only) */}
          {canEditSkills && (
            <div style={{marginBottom:16,background:C.card2,borderRadius:10,padding:14,display:'flex',alignItems:'center',gap:10}}>
              {!editingName ? (
                <>
                  <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:17,color:C.text,flex:1}}>{selectedPlayer.name}</span>
                  <Btn variant="secondary" onClick={()=>setEditingName(true)} style={{padding:'5px 12px',fontSize:12}}>✏️ Rename</Btn>
                </>
              ) : (
                <>
                  <Input value={localName} onChange={e=>setLocalName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&saveName()}
                    style={{flex:1,fontSize:15,fontFamily:'Barlow Condensed',fontWeight:700}}
                    placeholder="Player name" autoFocus/>
                  <Btn onClick={saveName} style={{padding:'5px 14px',fontSize:12}}>Save</Btn>
                  <Btn variant="secondary" onClick={()=>setEditingName(false)} style={{padding:'5px 10px',fontSize:12}}>✕</Btn>
                </>
              )}
            </div>
          )}

          {/* FUT Card Display */}
          <div style={{marginBottom:20,display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
            <FUTPlayerCard player={selectedPlayer}/>
            {canEditFUTCard(selectedPlayer) && (
              <Btn variant="secondary" onClick={()=>setEditingFUTCard(selectedPlayer)} style={{padding:'8px 16px',fontSize:12}}>
                ✏️ Edit Player Card
              </Btn>
            )}
          </div>

          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
            {canSetMgrPref&&<Btn variant={selectedPlayer.unavailable?'primary':'secondary'} onClick={toggleUnavailable}>{selectedPlayer.unavailable?'Mark Available':'Mark Unavailable'}</Btn>}
            {isAdmin&&(
              <div style={{marginLeft:'auto'}}>
                {!confirmRemove ? (
                  <Btn variant="danger" onClick={()=>setConfirmRemove(true)} style={{padding:'8px 14px',fontSize:13}}>Remove from Roster</Btn>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(248,113,113,0.08)',border:'1px solid #7f1d1d',borderRadius:8,padding:'8px 12px'}}>
                    <span style={{fontSize:12,color:'#f87171'}}>Remove {selectedPlayer.name} from roster?</span>
                    <Btn variant="danger" onClick={removeFromRoster} style={{padding:'5px 12px',fontSize:12}}>Confirm</Btn>
                    <Btn variant="secondary" onClick={()=>setConfirmRemove(false)} style={{padding:'5px 10px',fontSize:12}}>Cancel</Btn>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Manager Preference */}
          {canSetMgrPref&&(
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:C.text,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>⭐ Manager Priority Positions</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                {Object.keys(selectedPlayer.managerPreference).map(pos=>(
                  <span key={pos} style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b',padding:'4px 10px',borderRadius:6,fontSize:12,fontFamily:'Barlow Condensed',fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
                    {pos} <span onClick={()=>removeManagerPref(pos)} style={{cursor:'pointer',opacity:0.7}}>✕</span>
                  </span>
                ))}
                {Object.keys(selectedPlayer.managerPreference).length===0&&<span style={{color:C.muted,fontSize:13}}>None set</span>}
              </div>
              <div style={{display:'flex',gap:8}}>
                <Select value={managerPref} onChange={e=>setManagerPref(e.target.value)} style={{flex:1}}>
                  <option value="">Select position...</option>
                  {ALL_POS.filter(p=>!selectedPlayer.managerPreference[p]).map(p=><option key={p}>{p}</option>)}
                </Select>
                <Btn onClick={addManagerPref}>Add</Btn>
              </div>
            </div>
          )}

          {/* Gaming Details */}
          <div style={{marginBottom:16,background:C.card2,borderRadius:10,padding:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:C.text,textTransform:'uppercase',letterSpacing:'0.06em'}}>🎮 Gaming Details</span>
              {!editingContact
                ? <Btn variant="secondary" onClick={()=>setEditingContact(true)} style={{padding:'6px 12px',fontSize:12}}>Edit</Btn>
                : <div style={{display:'flex',gap:8}}>
                    <Btn onClick={saveContact} style={{padding:'6px 14px',fontSize:12}}>Save</Btn>
                    <Btn variant="secondary" onClick={()=>setEditingContact(false)} style={{padding:'6px 12px',fontSize:12}}>Cancel</Btn>
                  </div>
              }
            </div>
            {!editingContact ? (
              <div className="two-col">
                <div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>Discord</div>
                  <div style={{fontSize:14,color:selectedPlayer.discordName?C.text:C.muted,fontStyle:selectedPlayer.discordName?'normal':'italic'}}>
                    {selectedPlayer.discordName||'Not set'}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>PS / Xbox ID</div>
                  <div style={{fontSize:14,color:selectedPlayer.gamingId?C.text:C.muted,fontStyle:selectedPlayer.gamingId?'normal':'italic'}}>
                    {selectedPlayer.gamingId||'Not set'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="two-col">
                <div>
                  <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:5}}>Discord</label>
                  <Input value={localDiscord} onChange={e=>setLocalDiscord(e.target.value)} placeholder="username or user#1234"/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:5}}>PS / Xbox ID</label>
                  <Input value={localGamingId} onChange={e=>setLocalGamingId(e.target.value)} placeholder="your gamertag"/>
                </div>
              </div>
            )}
          </div>

          {/* Position Preferences */}
          <div style={{marginBottom:20,background:C.card2,borderRadius:10,padding:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:C.text,textTransform:'uppercase',letterSpacing:'0.06em'}}>🎯 Position Preferences</span>
              {canEditPrefs(selectedPlayer)&&!editingPrefs&&<Btn variant="secondary" onClick={()=>setEditingPrefs(true)} style={{padding:'6px 12px',fontSize:12}}>Edit</Btn>}
            </div>
            {!editingPrefs ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {selectedPlayer.positionPreferences.length===0&&<span style={{color:C.muted,fontSize:13}}>No preferences set</span>}
                {selectedPlayer.positionPreferences.sort((a,b)=>a.rank-b.rank).map(p=>(
                  <span key={p.pos} style={{background:'#1e2d42',color:C.textSm,padding:'5px 10px',borderRadius:6,fontSize:12,fontFamily:'Barlow Condensed',fontWeight:700}}>
                    <span style={{color:C.accent,marginRight:4}}>#{p.rank}</span>{p.pos}
                  </span>
                ))}
              </div>
            ) : (
              <div>
                {localPrefs.map((pref,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                    <span style={{color:C.accent,fontFamily:'Barlow Condensed',fontWeight:700,width:24}}>#{i+1}</span>
                    <Select value={pref.pos} onChange={e=>setLocalPrefs(lp=>lp.map((x,j)=>j===i?{...x,pos:e.target.value}:x))} style={{flex:1}}>
                      {ALL_POS.map(p=><option key={p}>{p}</option>)}
                    </Select>
                    <button onClick={()=>removePref(i)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:16}}>✕</button>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <Btn variant="secondary" onClick={addPref} style={{fontSize:12,padding:'6px 12px'}}>+ Add Position</Btn>
                  <Btn onClick={savePrefs}>Save</Btn>
                  <Btn variant="secondary" onClick={()=>setEditingPrefs(false)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>

          {/* Skill Ratings */}
          <div style={{background:C.card2,borderRadius:10,padding:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:C.text,textTransform:'uppercase',letterSpacing:'0.06em'}}>📊 Skill Ratings</span>
              {canEditSkills&&!editingSkills&&<Btn variant="secondary" onClick={()=>setEditingSkills(true)} style={{padding:'6px 12px',fontSize:12}}>Edit Ratings</Btn>}
            </div>
            {!editingSkills ? (
              (() => {
                const prefPositions = selectedPlayer.positionPreferences
                  .sort((a,b)=>a.rank-b.rank)
                  .map(p=>p.pos);
                if (prefPositions.length === 0) return (
                  <div style={{color:C.muted,fontSize:13,fontStyle:'italic'}}>
                    No position preferences set — add preferences above to see skill ratings here.
                  </div>
                );
                return (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 24px'}}>
                    {prefPositions.map(pos=>(
                      <div key={pos}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          <span style={{fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700}}>{pos}</span>
                          <span style={{fontSize:10,color:C.textSm,fontFamily:'Barlow Condensed'}}>
                            #{selectedPlayer.positionPreferences.find(p=>p.pos===pos)?.rank} preference
                          </span>
                        </div>
                        <SkillBar value={selectedPlayer.skillRatings[pos]??0}/>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div>
                <div style={{fontSize:12,color:C.muted,marginBottom:12,fontStyle:'italic'}}>
                  Editing all positions — ratings are used by the lineup algorithm regardless of preferences.
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 20px'}}>
                  {ALL_POS.map(pos=>{
                    const isPref = selectedPlayer.positionPreferences.some(p=>p.pos===pos);
                    return (
                      <div key={pos}>
                        <div style={{fontSize:11,fontFamily:'Barlow Condensed',marginBottom:3,display:'flex',alignItems:'center',gap:5}}>
                          <span style={{color:isPref?C.text:C.muted}}>{pos}</span>
                          {isPref&&<span style={{color:C.accent,fontSize:10}}>★</span>}
                          <span style={{color:C.accent,marginLeft:'auto'}}>{localSkills[pos]??0}</span>
                        </div>
                        <input type="range" min="0" max="99" value={localSkills[pos]??0}
                          onChange={e=>setLocalSkills(s=>({...s,[pos]:+e.target.value}))}
                          style={{width:'100%',accentColor:isPref?C.accent:'#334155'}}/>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:'flex',gap:8,marginTop:16}}>
                  <Btn onClick={saveSkills}>Save Ratings</Btn>
                  <Btn variant="secondary" onClick={()=>setEditingSkills(false)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        {/* ── Match Performance Section ── */}
          {(()=>{
            const ratedMatches = data.events
              .filter(e => e.type==='competitive' && (isPast(e.date) || e.gameCompleted || e.matchConfirmed) && e.performanceScores && e.performanceScores[selectedPlayer.id] != null)
              .sort((a,b) => b.date.localeCompare(a.date));
            const last5 = ratedMatches.slice(0,5);
            const avg = last5.length ? last5.reduce((s,e)=>s+e.performanceScores[selectedPlayer.id],0)/last5.length : null;
            const ratingColor = v => v>=9?'#4ade80':v>=7?'#86efac':v>=5?'#facc15':v>=3?'#f97316':'#f87171';

            return (
              <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:10,padding:16,marginTop:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:'#e8edf5',textTransform:'uppercase',letterSpacing:'0.06em'}}>🏆 Match Performance</span>
                  {ratedMatches.length > 0 && (
                    <Btn variant="secondary" onClick={()=>setShowAllPerformances(true)} style={{padding:'5px 12px',fontSize:11}}>
                      View All ({ratedMatches.length})
                    </Btn>
                  )}
                </div>

                {last5.length === 0 ? (
                  <div style={{textAlign:'center',padding:'18px 0',color:'#5a6f8a',fontSize:13}}>
                    No rated matches yet — performance scores appear here after match ratings are saved.
                  </div>
                ) : (
                  <div style={{display:'flex',gap:0,alignItems:'flex-start'}}>
                    {/* Average gauge — larger */}
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingRight:16,borderRight:'1px solid #1e2e45',marginRight:16,flexShrink:0}}>
                      <GaugeArc score={Math.round((avg??0)*10)/10} size={88}/>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:-2}}>Avg ({last5.length}g)</div>
                    </div>

                    {/* Last 5 individual gauges */}
                    <div style={{flex:1,display:'flex',gap:4,justifyContent:'space-around',flexWrap:'wrap'}}>
                      {last5.map((ev, i) => {
                        const score = ev.performanceScores[selectedPlayer.id];
                        const lineup = (ev.confirmedLineup||[]).find(l=>l.playerId===selectedPlayer.id);
                        const label = ev.title.replace(/^.*vs\s*/i,'').slice(0,8) || `G${last5.length-i}`;
                        return (
                          <GaugeArc key={ev.id} score={score} size={72}
                            label={lineup?.posType || ''}
                            sublabel={new Date(ev.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                          />
                        );
                      })}
                      {/* Ghost gauges to fill up to 5 slots */}
                      {Array.from({length: Math.max(0, 5-last5.length)}).map((_,i) => (
                        <div key={`ghost-${i}`} style={{width:72,textAlign:'center',opacity:0.25}}>
                          <GaugeArc score={0} size={72} noScore={true}/>
                          <div style={{fontSize:9,color:'#334155',fontFamily:"'Barlow Condensed',sans-serif",marginTop:-2}}>—</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* All Performances Modal */}
      {showAllPerformances && selectedPlayer && (
        <AllPerformancesModal
          player={selectedPlayer}
          events={data.events}
          onClose={()=>setShowAllPerformances(false)}
        />
      )}

      {/* Add Player Modal */}
      {showAddPlayer&&(
        <Modal title="Add New Player" onClose={()=>{setShowAddPlayer(false);setNewPlayerName('');}}>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6}}>Player Name</label>
            <Input
              value={newPlayerName}
              onChange={e=>setNewPlayerName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addPlayer()}
              placeholder="Full name..."
              autoFocus
            />
            <div style={{fontSize:12,color:C.muted,marginTop:8}}>
              A new player account will be created. You can update their role in User Management.
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={()=>{setShowAddPlayer(false);setNewPlayerName('');}}>Cancel</Btn>
            <Btn onClick={addPlayer} disabled={!newPlayerName.trim()}>Create Player</Btn>
          </div>
        </Modal>
      )}

      {/* FUT Card Editor Modal */}
      {editingFUTCard && (
        <FUTCardEditorModal
          player={editingFUTCard}
          onSave={(cardData) => saveFUTCard(editingFUTCard.id, cardData)}
          onClose={() => setEditingFUTCard(null)}
        />
      )}
    </div>
  );
}

/* ─── LINEUP GENERATOR ───────────────────────────────────────────────────────── */
function LineupPage({data,setData,currentUser}) {
  const [selectedEvent,setSelectedEvent]=useState('');
  const [selectedFormation,setSelectedFormation]=useState(data.formations[0]?.id||'');
  const [result,setResult]=useState(null);
  const [confirmed,setConfirmed]=useState(false);
  // selectedSlot: { slotId, posType } — the slot whose swap panel is open
  const [selectedSlot,setSelectedSlot]=useState(null);
  // allEligible: full pool of players used for generation (needed for scoring)
  const [allEligible,setAllEligible]=useState([]);

  const upcomingGames = data.events.filter(e=>e.type==='competitive'&&!isPast(e.date));
  const formation = data.formations.find(f=>f.id===selectedFormation);

  function generate() {
    if (!formation) return;
    const eventData = selectedEvent ? data.events.find(e=>e.id===selectedEvent) : null;
    let eligibleIds;
    if (eventData) {
      eligibleIds = new Set(eventData.attendees||[]);
    } else {
      eligibleIds = new Set(data.players.map(p=>p.id));
    }
    const attending = data.players.filter(p=>eligibleIds.has(p.id)&&!p.unavailable);
    if (attending.length < formation.slots.length) {
      alert(`Not enough attending players (${attending.length}) for this formation (needs ${formation.slots.length})`);
      return;
    }
    const r = generateLineup(formation, attending, data.events, getWeights(data));
    setResult(r);
    setAllEligible(attending);
    setConfirmed(false);
    setSelectedSlot(null);
  }

  function confirmLineup() {
    if (!selectedEvent||!result) return;
    setData(d=>({...d,events:d.events.map(e=>e.id===selectedEvent?{...e,confirmedLineup:result.lineup,formationId:selectedFormation}:e)}));
    setConfirmed(true);
  }

  function handleSlotClick(slot) {
    if (!result) return;
    // Toggle: clicking the already-selected slot closes the panel
    if (selectedSlot?.slotId === slot.id) { setSelectedSlot(null); return; }
    setSelectedSlot({ slotId: slot.id, posType: slot.posType });
  }

  // Swap the player currently in selectedSlot with candidatePlayerId.
  // If candidatePlayerId is already a starter in another slot, swap those two slots.
  // If they're a sub, move them into the slot and push the current starter to subs.
  function swapPlayer(candidatePlayerId) {
    if (!result||!selectedSlot) return;
    const lineup = result.lineup.map(l=>({...l}));
    const subs = [...result.subs];

    const targetIdx = lineup.findIndex(l=>l.slotId===selectedSlot.slotId);
    const candidateStarterIdx = lineup.findIndex(l=>l.playerId===candidatePlayerId);
    const isSubbing = candidateStarterIdx === -1; // candidate is currently on the bench

    if (isSubbing) {
      // Move current starter to subs, put candidate into the slot
      const outgoingPlayer = data.players.find(p=>p.id===lineup[targetIdx].playerId);
      lineup[targetIdx] = { ...lineup[targetIdx], playerId: candidatePlayerId,
        score: calcScore(data.players.find(p=>p.id===candidatePlayerId), selectedSlot.posType, data.events, getWeights(data)) };
      const newSubs = subs.filter(p=>p.id!==candidatePlayerId);
      if (outgoingPlayer) newSubs.push(outgoingPlayer);
      setResult({ lineup, subs: newSubs });
    } else {
      // Both are starters — swap their slot assignments
      const slotA = lineup[targetIdx].slotId;
      const posA = lineup[targetIdx].posType;
      const slotB = lineup[candidateStarterIdx].slotId;
      const posB = lineup[candidateStarterIdx].posType;
      lineup[targetIdx] = { ...lineup[targetIdx], slotId: slotA, posType: posA,
        playerId: candidatePlayerId,
        score: calcScore(data.players.find(p=>p.id===candidatePlayerId), posA, data.events, getWeights(data)) };
      lineup[candidateStarterIdx] = { ...lineup[candidateStarterIdx], slotId: slotB, posType: posB,
        playerId: lineup[targetIdx-0].playerId === candidatePlayerId // already set above, grab old
          ? result.lineup[targetIdx].playerId : result.lineup[targetIdx].playerId,
        score: calcScore(data.players.find(p=>p.id===result.lineup[targetIdx].playerId), posB, data.events, getWeights(data)) };
      // re-derive cleanly to avoid mutation confusion
      const oldTargetPid = result.lineup[targetIdx].playerId;
      const oldCandidatePid = result.lineup[candidateStarterIdx].playerId;
      lineup[targetIdx].playerId = oldCandidatePid;
      lineup[candidateStarterIdx].playerId = oldTargetPid;
      lineup[targetIdx].score = calcScore(data.players.find(p=>p.id===oldCandidatePid), posA, data.events, getWeights(data));
      lineup[candidateStarterIdx].score = calcScore(data.players.find(p=>p.id===oldTargetPid), posB, data.events, getWeights(data));
      setResult({ lineup, subs });
    }
    setSelectedSlot(null);
  }

  const lineupPlayers = result?.lineup.map(l=>({
    ...data.players.find(p=>p.id===l.playerId), slotId:l.slotId, posType:l.posType, score:l.score
  }))||[];
  const subPlayers = result?.subs||[];

  // Build the candidate list for the swap panel
  const swapCandidates = useMemo(()=>{
    if (!selectedSlot||!result||!allEligible.length) return [];
    const currentPid = result.lineup.find(l=>l.slotId===selectedSlot.slotId)?.playerId;
    return allEligible
      .filter(p=>p.id!==currentPid)
      .map(p=>{
        const score = calcScore(p, selectedSlot.posType, data.events, getWeights(data));
        const starterEntry = result.lineup.find(l=>l.playerId===p.id);
        const isSub = !starterEntry;
        const currentPos = starterEntry ? starterEntry.posType : null;
        return { ...p, scoreForPos: score, isSub, currentPos };
      })
      .sort((a,b)=>b.scoreForPos-a.scoreForPos);
  },[selectedSlot, result, allEligible, data.events]);

  const currentSlotPlayer = selectedSlot
    ? data.players.find(p=>p.id===result?.lineup.find(l=>l.slotId===selectedSlot.slotId)?.playerId)
    : null;

  return (
    <div className="fade-in">
      <SectionTitle>Lineup Generator</SectionTitle>
      <div className="lineup-layout">

        {/* Left column: controls + starting list */}
        <div>
          <Card style={{marginBottom:16}}>
            <FormRow label="Formation">
              <Select value={selectedFormation} onChange={e=>{setSelectedFormation(e.target.value);setResult(null);setSelectedSlot(null);}}>
                {data.formations.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </FormRow>
            <FormRow label="Match (optional — filters by RSVP)">
              <Select value={selectedEvent} onChange={e=>{setSelectedEvent(e.target.value);setResult(null);setSelectedSlot(null);}}>
                <option value="">All available players</option>
                {upcomingGames.map(e=><option key={e.id} value={e.id}>{e.title} ({formatDisplayDate(e.date)})</option>)}
              </Select>
            </FormRow>
            <Btn onClick={generate} style={{width:'100%',padding:14,fontSize:16}}>⚡ Generate Lineup</Btn>
          </Card>

          {result&&(
            <Card>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:C.text,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Starting 11</div>
              {lineupPlayers.map((p,i)=>{
                const isActive = selectedSlot?.slotId===p.slotId;
                return (
                  <div key={i} onClick={()=>handleSlotClick(formation.slots.find(s=>s.id===p.slotId))}
                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px',marginBottom:2,borderRadius:7,gap:8,cursor:'pointer',
                      background:isActive?'rgba(74,222,128,0.12)':'transparent',
                      border:`1px solid ${isActive?C.accent:'transparent'}`,transition:'all 0.15s'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{background:isActive?C.accent2:'#1e2d42',color:isActive?'#fff':C.accent,padding:'2px 6px',borderRadius:4,fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700,minWidth:32,textAlign:'center',transition:'all 0.15s'}}>{p.posType}</span>
                      <span style={{fontSize:13,color:C.text}}>{p.name}</span>
                    </div>
                    <span style={{fontSize:11,color:C.muted,fontFamily:'Barlow Condensed'}}>{p.score}</span>
                  </div>
                );
              })}
              {subPlayers.length>0&&(
                <>
                  <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:C.muted,margin:'12px 0 6px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Bench</div>
                  {subPlayers.map((p,i)=>(
                    <div key={i} style={{fontSize:13,color:C.textSm,padding:'4px 0'}}>{p.name}</div>
                  ))}
                </>
              )}
              <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}>
                {selectedEvent&&!confirmed&&<Btn onClick={confirmLineup} style={{flex:1}}>✅ Confirm Lineup</Btn>}
                {confirmed&&<Badge c={C.accent}>✅ Lineup Confirmed!</Badge>}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: pitch + swap panel */}
        {formation&&(
          <div>
            {/* hint text */}
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'center'}}>
              {result
                ? selectedSlot
                  ? <span style={{color:'#f59e0b'}}>⇄ Select a player below to swap into <span style={{color:C.accent}}>{selectedSlot.posType}</span> — or click the position again to cancel</span>
                  : '⚽ Click any position to swap players'
                : `${formation.name} Formation`}
            </div>

            <PitchDisplay
              formation={formation}
              lineup={result?.lineup.map(l=>({slotId:l.slotId,playerId:l.playerId}))||[]}
              players={data.players}
              subPlayers={subPlayers}
              interactive={!!result}
              highlightSlot={selectedSlot?.slotId}
              onSlotClick={handleSlotClick}
            />

            {/* ── Swap panel ── */}
            {selectedSlot&&swapCandidates.length>0&&(
              <div className="fade-in" style={{marginTop:20,background:C.card,border:`1px solid ${C.accent}`,borderRadius:12,overflow:'hidden'}}>
                {/* Header */}
                <div style={{background:'rgba(74,222,128,0.08)',borderBottom:`1px solid ${C.border}`,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:16,color:C.accent,letterSpacing:'0.04em',textTransform:'uppercase'}}>
                      Swap {selectedSlot.posType}
                    </span>
                    {currentSlotPlayer&&<span style={{fontSize:13,color:C.textSm,marginLeft:8}}>Currently: <strong style={{color:C.text}}>{currentSlotPlayer.name}</strong></span>}
                  </div>
                  <button onClick={()=>setSelectedSlot(null)} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
                </div>

                {/* Column headers */}
                <div className="swap-panel-grid" style={{display:'grid',gridTemplateColumns:'1fr 80px 70px 80px',gap:8,padding:'8px 16px',borderBottom:`1px solid ${C.border}`}}>
                  {['Player','Score','Status',''].map((h,i)=>(
                    <div key={i} className={i===2?'hide-mobile':''} style={{fontSize:10,fontWeight:700,color:C.muted,fontFamily:'Barlow Condensed',letterSpacing:'0.08em',textTransform:'uppercase',textAlign:i>0?'center':'left'}}>{h}</div>
                  ))}
                </div>

                {/* Candidate rows */}
                <div style={{maxHeight:320,overflowY:'auto'}}>
                  {swapCandidates.map((p,i)=>{
                    const scoreColor = p.scoreForPos>=600?C.accent:p.scoreForPos>=400?'#facc15':p.scoreForPos>=200?'#f97316':'#94a3b8';
                    return (
                      <div key={p.id}
                        className="swap-panel-grid"
                        style={{display:'grid',gridTemplateColumns:'1fr 80px 70px 80px',gap:8,padding:'10px 16px',
                          borderBottom:`1px solid ${C.border}`,alignItems:'center',
                          background:i%2===0?'transparent':'rgba(255,255,255,0.015)',
                          transition:'background 0.15s',cursor:'pointer'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(74,222,128,0.07)'}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':'rgba(255,255,255,0.015)'}>
                        {/* Name + prefs */}
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:'Barlow'}}>{p.name}</div>
                          {p.positionPreferences.length>0&&(
                            <div style={{fontSize:11,color:C.muted,marginTop:1}}>
                              Prefers: {p.positionPreferences.sort((a,b)=>a.rank-b.rank).slice(0,2).map(x=>x.pos).join(', ')}
                            </div>
                          )}
                        </div>
                        {/* Score */}
                        <div style={{textAlign:'center'}}>
                          <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:scoreColor}}>{p.scoreForPos}</span>
                          <div style={{fontSize:10,color:C.muted}}>pts</div>
                        </div>
                        {/* Status */}
                        <div className="hide-mobile" style={{textAlign:'center'}}>
                          {p.isSub
                            ? <span style={{background:'rgba(96,165,250,0.12)',color:'#60a5fa',padding:'3px 7px',borderRadius:5,fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700}}>BENCH</span>
                            : <span style={{background:'rgba(74,222,128,0.1)',color:C.accent,padding:'3px 7px',borderRadius:5,fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700}}>{p.currentPos}</span>}
                        </div>
                        {/* Action */}
                        <div style={{textAlign:'center'}}>
                          <button onClick={()=>swapPlayer(p.id)}
                            style={{background:C.accent2,color:'#fff',border:'none',borderRadius:6,padding:'5px 10px',fontSize:12,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s'}}
                            onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.15)'}
                            onMouseLeave={e=>e.currentTarget.style.filter='brightness(1)'}>
                            {p.isSub?'Sub In':'Swap'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MATCH RESULT MODAL ────────────────────────────────────────────────────── */
function MatchResultModal({ event, players, onSave, onClose }) {
  const lineupPlayers = (event.confirmedLineup || []).map(l => {
    const p = players.find(pl => pl.id === l.playerId);
    return p ? { ...p, posType: l.posType } : null;
  }).filter(Boolean);

  // Initialize with existing data if editing
  const [homeScore, setHomeScore] = useState(event.matchResult?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(event.matchResult?.awayScore ?? 0);
  const [goals, setGoals] = useState(event.matchResult?.goals || []);
  
  // For adding new goal
  const [newScorer, setNewScorer] = useState('');
  const [newAssister, setNewAssister] = useState('');
  const [isOwnGoal, setIsOwnGoal] = useState(false);

  function addGoal() {
    if (!newScorer && !isOwnGoal) return;
    const goal = {
      id: `g${Date.now()}`,
      scorerId: isOwnGoal ? null : newScorer,
      assisterId: newAssister || null,
      isOwnGoal,
      minute: null, // Could add minute input later
    };
    setGoals(g => [...g, goal]);
    // Auto-increment home score
    setHomeScore(h => h + 1);
    // Reset form
    setNewScorer('');
    setNewAssister('');
    setIsOwnGoal(false);
  }

  function removeGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    setGoals(g => g.filter(x => x.id !== goalId));
    // Auto-decrement home score
    if (goal) setHomeScore(h => Math.max(0, h - 1));
  }

  function handleSave() {
    onSave({
      homeScore,
      awayScore,
      goals,
    });
  }

  const getPlayerName = (id) => {
    const p = players.find(x => x.id === id);
    return p ? p.name : 'Unknown';
  };

  // Get scorers and assisters count for summary
  const scorerCounts = {};
  const assisterCounts = {};
  goals.forEach(g => {
    if (g.scorerId) scorerCounts[g.scorerId] = (scorerCounts[g.scorerId] || 0) + 1;
    if (g.assisterId) assisterCounts[g.assisterId] = (assisterCounts[g.assisterId] || 0) + 1;
  });

  return (
    <Modal title={`Match Result — ${event.title}`} onClose={onClose} width={580} zIndex={150}>
      {/* Score display */}
      <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:12,padding:'20px 24px',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
          {/* Home (Our team) */}
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Our Team</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <button onClick={() => setHomeScore(h => Math.max(0, h - 1))}
                style={{width:32,height:32,borderRadius:8,background:'#1e2d42',border:'1px solid #3a4f6a',color:'#8896ae',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background='#253047'}
                onMouseLeave={e=>e.currentTarget.style.background='#1e2d42'}>−</button>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:56,color:'#4ade80',lineHeight:1,minWidth:60,textAlign:'center'}}>{homeScore}</div>
              <button onClick={() => setHomeScore(h => h + 1)}
                style={{width:32,height:32,borderRadius:8,background:'#1e2d42',border:'1px solid #3a4f6a',color:'#8896ae',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background='#253047'}
                onMouseLeave={e=>e.currentTarget.style.background='#1e2d42'}>+</button>
            </div>
          </div>

          {/* Divider */}
          <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:24,color:'#334155'}}>:</div>

          {/* Away (Opponent) */}
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Opponent</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <button onClick={() => setAwayScore(a => Math.max(0, a - 1))}
                style={{width:32,height:32,borderRadius:8,background:'#1e2d42',border:'1px solid #3a4f6a',color:'#8896ae',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background='#253047'}
                onMouseLeave={e=>e.currentTarget.style.background='#1e2d42'}>−</button>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:56,color:'#f87171',lineHeight:1,minWidth:60,textAlign:'center'}}>{awayScore}</div>
              <button onClick={() => setAwayScore(a => a + 1)}
                style={{width:32,height:32,borderRadius:8,background:'#1e2d42',border:'1px solid #3a4f6a',color:'#8896ae',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background='#253047'}
                onMouseLeave={e=>e.currentTarget.style.background='#1e2d42'}>+</button>
            </div>
          </div>
        </div>

        {/* Result indicator */}
        <div style={{textAlign:'center',marginTop:12}}>
          <span style={{
            fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,
            padding:'4px 12px',borderRadius:6,
            background: homeScore > awayScore ? 'rgba(74,222,128,0.15)' : homeScore < awayScore ? 'rgba(248,113,113,0.15)' : 'rgba(250,204,21,0.15)',
            color: homeScore > awayScore ? '#4ade80' : homeScore < awayScore ? '#f87171' : '#facc15',
          }}>
            {homeScore > awayScore ? '🏆 WIN' : homeScore < awayScore ? '❌ LOSS' : '🤝 DRAW'}
          </span>
        </div>
      </div>

      {/* Add Goal Section */}
      {lineupPlayers.length > 0 && (
        <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:'#e8edf5',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>⚽ Add Goal</div>
          
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <label style={{display:'block',fontSize:10,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>Scorer</label>
              <Select value={newScorer} onChange={e => setNewScorer(e.target.value)} disabled={isOwnGoal} style={{opacity: isOwnGoal ? 0.5 : 1}}>
                <option value="">Select player...</option>
                {lineupPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            <div>
              <label style={{display:'block',fontSize:10,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>Assist (optional)</label>
              <Select value={newAssister} onChange={e => setNewAssister(e.target.value)} disabled={isOwnGoal} style={{opacity: isOwnGoal ? 0.5 : 1}}>
                <option value="">No assist</option>
                {lineupPlayers.filter(p => p.id !== newScorer).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12,color:'#7a90aa'}}>
              <input type="checkbox" checked={isOwnGoal} onChange={e => { setIsOwnGoal(e.target.checked); if (e.target.checked) { setNewScorer(''); setNewAssister(''); }}}
                style={{width:16,height:16,accentColor:'#f87171'}}/>
              Own Goal (opponent)
            </label>
            <Btn onClick={addGoal} disabled={!newScorer && !isOwnGoal} style={{padding:'8px 16px',fontSize:13}}>
              + Add Goal
            </Btn>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 && (
        <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:10,padding:16,marginBottom:16}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:'#e8edf5',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>📋 Goals Recorded ({goals.length})</div>
          <div style={{display:'grid',gap:6,maxHeight:200,overflowY:'auto'}}>
            {goals.map((g, i) => (
              <div key={g.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'#1e2d42',borderRadius:6}}>
                <span style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:14,color:'#4ade80',width:20}}>{i + 1}.</span>
                {g.isOwnGoal ? (
                  <span style={{flex:1,fontSize:13,color:'#f87171',fontStyle:'italic'}}>Own Goal</span>
                ) : (
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,color:'#e8edf5',fontWeight:600}}>⚽ {getPlayerName(g.scorerId)}</span>
                    {g.assisterId && (
                      <span style={{fontSize:12,color:'#7a90aa',marginLeft:8}}>
                        (🅰️ {getPlayerName(g.assisterId)})
                      </span>
                    )}
                  </div>
                )}
                <button onClick={() => removeGoal(g.id)}
                  style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14,padding:4}}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {goals.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {/* Top Scorers */}
          <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:8,padding:12}}>
            <div style={{fontSize:10,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:8}}>⚽ Scorers</div>
            {Object.entries(scorerCounts).sort((a,b) => b[1] - a[1]).map(([pid, count]) => (
              <div key={pid} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#e8edf5',padding:'2px 0'}}>
                <span>{getPlayerName(pid)}</span>
                <span style={{color:'#4ade80',fontWeight:700}}>{count}</span>
              </div>
            ))}
            {Object.keys(scorerCounts).length === 0 && <div style={{fontSize:11,color:'#475569',fontStyle:'italic'}}>No scorers</div>}
          </div>
          {/* Top Assisters */}
          <div style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:8,padding:12}}>
            <div style={{fontSize:10,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:8}}>🅰️ Assists</div>
            {Object.entries(assisterCounts).sort((a,b) => b[1] - a[1]).map(([pid, count]) => (
              <div key={pid} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#e8edf5',padding:'2px 0'}}>
                <span>{getPlayerName(pid)}</span>
                <span style={{color:'#60a5fa',fontWeight:700}}>{count}</span>
              </div>
            ))}
            {Object.keys(assisterCounts).length === 0 && <div style={{fontSize:11,color:'#475569',fontStyle:'italic'}}>No assists</div>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:16,borderTop:'1px solid #1e2e45'}}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} style={{background:'#22c55e'}}>✓ Save & Complete Match</Btn>
      </div>
    </Modal>
  );
}

/* ─── PERFORMANCE RATING MODAL ──────────────────────────────────────────────── */
function PerformanceRatingModal({event, players, onSave, onClose}) {
  const lineupPlayers = (event.confirmedLineup||[]).map(l=>{
    const p = players.find(pl=>pl.id===l.playerId);
    return p ? {...p, posType:l.posType} : null;
  }).filter(Boolean);

  const [scores, setScores] = useState(() => {
    const existing = event.performanceScores || {};
    const init = {};
    lineupPlayers.forEach(p => { init[p.id] = existing[p.id] ?? 7; });
    return init;
  });

  const ratingColor = v => v>=9?'#4ade80':v>=7?'#86efac':v>=5?'#facc15':v>=3?'#f97316':'#f87171';
  const ratingLabel = v => v===10?'World Class':v>=9?'Excellent':v>=7?'Good':v>=5?'Average':v>=3?'Poor':'Awful';

  function handleSave() {
    onSave(scores);
  }

  return (
    <Modal title={`Rate Players — ${event.title}`} onClose={onClose} width={600} zIndex={150}>
      <div style={{marginBottom:16,padding:'10px 14px',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:8,fontSize:13,color:'#9fedb8',lineHeight:1.5}}>
        Rate each player's performance from <strong style={{color:'#4ade80'}}>1</strong> (awful) to <strong style={{color:'#4ade80'}}>10</strong> (world class). Scores are saved to this match and factor into future lineup generation.
      </div>

      <div style={{display:'grid',gap:6,maxHeight:'55vh',overflowY:'auto',paddingRight:4}}>
        {lineupPlayers.map(p => {
          const val = scores[p.id] ?? 7;
          const c = ratingColor(val);
          return (
            <div key={p.id} style={{background:'#172236',border:'1px solid #1e2e45',borderRadius:9,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'center'}}>
              {/* Left: name + pos */}
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:c+'22',border:`2px solid ${c}55`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontWeight:800,fontSize:12,color:c,flexShrink:0}}>
                  {p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:14,color:'#e8edf5'}}>{p.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                    <span style={{background:'#1e2d42',color:'#4ade80',padding:'1px 6px',borderRadius:4,fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700}}>{p.posType}</span>
                    <span style={{fontSize:11,color:c,fontFamily:'Barlow Condensed',fontWeight:700}}>{ratingLabel(val)}</span>
                  </div>
                </div>
              </div>

              {/* Right: score display + slider */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,minWidth:180}}>
                {/* Number display */}
                <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:36,color:c,lineHeight:1,letterSpacing:'-0.02em'}}>
                  {val}<span style={{fontSize:16,color:'#5a6f8a',fontWeight:600}}>/10</span>
                </div>
                {/* Slider */}
                <div style={{width:'100%',position:'relative'}}>
                  <input type="range" min="1" max="10" step="1" value={val}
                    onChange={e=>setScores(s=>({...s,[p.id]:+e.target.value}))}
                    style={{width:'100%',accentColor:c,cursor:'pointer'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                      <span key={n} onClick={()=>setScores(s=>({...s,[p.id]:n}))}
                        style={{fontSize:9,fontFamily:'Barlow Condensed',fontWeight:700,color:val===n?c:'#334155',cursor:'pointer',width:14,textAlign:'center',transition:'color 0.1s'}}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team avg preview */}
      {lineupPlayers.length > 0 && (
        <div style={{marginTop:14,padding:'10px 16px',background:'#172236',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.06em'}}>Team Average</span>
          <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:22,color:ratingColor(
            Math.round(lineupPlayers.reduce((s,p)=>s+(scores[p.id]??7),0)/lineupPlayers.length)
          )}}>
            {(lineupPlayers.reduce((s,p)=>s+(scores[p.id]??7),0)/lineupPlayers.length).toFixed(1)}/10
          </span>
        </div>
      )}

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18,paddingTop:16,borderTop:'1px solid #1e2e45'}}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>💾 Save Performance Ratings</Btn>
      </div>
    </Modal>
  );
}

/* ─── MATCH RATING SCREEN ──────────────────────────────────────────────────── */
function MatchRatingScreen({ event, players, formation, onSave, onBack }) {
  const lineupPlayers = (event.confirmedLineup||[]).map(l => {
    const p = players.find(pl => pl.id === l.playerId);
    return p ? { ...p, posType: l.posType, slotId: l.slotId } : null;
  }).filter(Boolean);

  const [scores, setScores] = useState(() => {
    const ex = event.performanceScores || {};
    const init = {};
    lineupPlayers.forEach(p => { init[p.id] = ex[p.id] != null ? ex[p.id] : 7; });
    return init;
  });
  const [selectedPid, setSelectedPid] = useState(null);

  const ratingColor = v => {
    if (v >= 9) return '#4ade80'; if (v >= 7) return '#86efac';
    if (v >= 5) return '#facc15'; if (v >= 3) return '#f97316';
    return '#f87171';
  };
  const ratingLabel = v => {
    if (v >= 10) return 'World Class'; if (v >= 9) return 'Excellent';
    if (v >= 7) return 'Good'; if (v >= 5) return 'Average';
    if (v >= 3) return 'Poor'; return 'Awful';
  };

  const selectedPlayer = selectedPid ? lineupPlayers.find(p => p.id === selectedPid) : null;
  const selectedVal = selectedPid ? (scores[selectedPid] != null ? scores[selectedPid] : 7) : null;

  const teamAvg = lineupPlayers.length > 0
    ? lineupPlayers.reduce((s,p) => s + (scores[p.id] != null ? scores[p.id] : 7), 0) / lineupPlayers.length
    : 0;

  function ArcGauge({ value, size }) {
    const sz = size || 100;
    const v = value || 0;
    const cx = sz/2, cy = sz*0.56, r = sz*0.38, sw = sz*0.1;
    const toRad = d => d * Math.PI / 180;
    const pt = deg => [cx + r*Math.cos(toRad(deg)), cy + r*Math.sin(toRad(deg))];
    const arcD = (from, to) => {
      const diff = ((to-from)%360+360)%360;
      if (diff < 0.5) return '';
      const [x1,y1]=pt(from); const [x2,y2]=pt(to);
      return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${diff>180?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    };
    const fillEnd = 150 + ((v-1)/9)*240;
    const c = ratingColor(v);
    return (
      <svg width={sz} height={sz*0.75} style={{overflow:'visible'}}>
        <path d={arcD(150,390)} fill="none" stroke="#1e2d42" strokeWidth={sw} strokeLinecap="round"/>
        {v>1&&<path d={arcD(150,fillEnd)} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>}
        <text x={cx} y={cy+sz*0.02} textAnchor="middle" dominantBaseline="middle"
          style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:sz*0.28,fill:c}}>
          {v%1===0?v:v.toFixed(1)}
        </text>
        <text x={cx} y={cy+sz*0.22} textAnchor="middle"
          style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:sz*0.1,fill:'#5a6f8a'}}>
          /10
        </text>
      </svg>
    );
  }

  function RatingPitch() {
    if (!formation) return null;
    return (
      <div style={{position:'relative',width:'100%',maxWidth:220,margin:'0 auto'}}>
        <div className="pitch-bg" style={{width:'100%',paddingBottom:'145%',position:'relative',borderRadius:8,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} viewBox="0 0 100 145" preserveAspectRatio="none">
            <rect x="4" y="4" width="92" height="137" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7"/>
            <line x1="4" y1="72.5" x2="96" y2="72.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7"/>
            <circle cx="50" cy="72.5" r="11" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7"/>
            <rect x="22" y="4" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
            <rect x="22" y="121" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
          </svg>
          {formation.slots.map(slot => {
            const lp = lineupPlayers.find(p => p.slotId === slot.id);
            if (!lp) return null;
            const val = scores[lp.id] != null ? scores[lp.id] : 7;
            const c = ratingColor(val);
            const isSel = selectedPid === lp.id;
            const ini = lp.name.split(' ').map(w=>w[0]).join('').slice(0,2);
            return (
              <div key={slot.id}
                onClick={() => setSelectedPid(isSel ? null : lp.id)}
                style={{position:'absolute',left:`${slot.x}%`,top:`${slot.y}%`,
                  transform:'translate(-50%,-50%)',textAlign:'center',cursor:'pointer',zIndex:10}}>
                <div style={{width:36,height:36,borderRadius:'50%',margin:'0 auto',
                  background:isSel ? c : c+'2a', border:`2.5px solid ${c}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:isSel ? `0 0 10px ${c}99` : '0 2px 5px rgba(0,0,0,0.4)',
                  transition:'all 0.15s'}}>
                  <span style={{fontSize:10,fontWeight:800,color:isSel?'#0c1220':c,fontFamily:'Barlow Condensed'}}>{ini}</span>
                </div>
                <div style={{marginTop:2,fontSize:9,fontWeight:700,color:'#fff',fontFamily:'Barlow Condensed',
                  textShadow:'0 1px 3px rgba(0,0,0,0.9)',background:'rgba(0,0,0,0.55)',
                  padding:'1px 3px',borderRadius:3,display:'inline-block'}}>
                  {val%1===0?val:val.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:'#e8edf5',
            textTransform:'uppercase',letterSpacing:'0.04em'}}>Player Ratings</div>
          <div style={{fontSize:12,color:'#5a6f8a',marginTop:2}}>Click a position or player to rate</div>
        </div>
        <div style={{textAlign:'center'}}>
          <ArcGauge value={Math.round(teamAvg*2)/2} size={64}/>
          <div style={{fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,color:'#5a6f8a',
            letterSpacing:'0.06em',textTransform:'uppercase',marginTop:-4}}>Team Avg</div>
        </div>
      </div>

      {/* Main grid: pitch + panel */}
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:20,alignItems:'start'}}>
        {/* Pitch */}
        <div>
          <RatingPitch/>
          <div style={{marginTop:6,fontSize:11,color:'#5a6f8a',textAlign:'center',
            fontFamily:'Barlow Condensed',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>
            Tap a token to rate
          </div>
        </div>

        {/* Player panel */}
        <div>
          {selectedPlayer ? (
            /* ── Rating panel ── */
            <div className="fade-in" style={{background:'#172236',
              border:`1px solid ${ratingColor(selectedVal)}44`,borderRadius:12,padding:18}}>
              {/* Player header */}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',
                  background:ratingColor(selectedVal)+'22',
                  border:`2px solid ${ratingColor(selectedVal)}66`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:'Barlow Condensed',fontWeight:800,fontSize:13,
                  color:ratingColor(selectedVal),flexShrink:0}}>
                  {selectedPlayer.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:16,color:'#e8edf5'}}>{selectedPlayer.name}</div>
                  <div style={{display:'flex',gap:6,marginTop:2}}>
                    <span style={{background:'#1e2d42',color:'#4ade80',padding:'1px 6px',
                      borderRadius:4,fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700}}>{selectedPlayer.posType}</span>
                    <span style={{fontSize:11,color:ratingColor(selectedVal),fontFamily:'Barlow Condensed',fontWeight:700}}>
                      {ratingLabel(selectedVal)}
                    </span>
                  </div>
                </div>
                <button onClick={()=>setSelectedPid(null)}
                  style={{background:'none',border:'none',color:'#5a6f8a',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
              </div>

              {/* Arc gauge */}
              <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                <ArcGauge value={selectedVal} size={110}/>
              </div>

              {/* Slider */}
              <div style={{marginBottom:10}}>
                <input type="range" min="1" max="10" step="0.5" value={selectedVal}
                  onChange={e=>setScores(s=>({...s,[selectedPlayer.id]:+e.target.value}))}
                  style={{width:'100%',accentColor:ratingColor(selectedVal),cursor:'pointer'}}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                    <span key={n} onClick={()=>setScores(s=>({...s,[selectedPlayer.id]:n}))}
                      style={{fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer',
                        width:18,textAlign:'center',transition:'color 0.1s',
                        color:Math.round(selectedVal)===n?ratingColor(selectedVal):'#334155'}}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick chips */}
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:14}}>
                {[[1,'Awful'],[3,'Poor'],[5,'Avg'],[7,'Good'],[9,'Exc'],[10,'WC']].map(([v,lbl])=>(
                  <button key={v} onClick={()=>setScores(s=>({...s,[selectedPlayer.id]:v}))}
                    style={{flex:1,background:Math.round(selectedVal)===v?ratingColor(v)+'33':'#1e2d42',
                      color:Math.round(selectedVal)===v?ratingColor(v):'#5a6f8a',
                      border:`1px solid ${Math.round(selectedVal)===v?ratingColor(v)+'55':'#253047'}`,
                      borderRadius:6,padding:'5px 4px',fontSize:11,fontFamily:'Barlow Condensed',
                      fontWeight:700,cursor:'pointer',transition:'all 0.1s'}}>
                    {v} {lbl}
                  </button>
                ))}
              </div>

              {/* Prev / Next */}
              <div style={{display:'flex',gap:8}}>
                {(()=>{
                  const idx = lineupPlayers.findIndex(p=>p.id===selectedPid);
                  const prev = lineupPlayers[idx-1]; const next = lineupPlayers[idx+1];
                  return (<>
                    <Btn variant="secondary" onClick={()=>prev&&setSelectedPid(prev.id)}
                      style={{flex:1,padding:'7px 8px',fontSize:12,opacity:prev?1:0.35}}>
                      ← {prev?prev.name.split(' ')[0]:'Prev'}
                    </Btn>
                    <Btn variant="secondary" onClick={()=>next&&setSelectedPid(next.id)}
                      style={{flex:1,padding:'7px 8px',fontSize:12,opacity:next?1:0.35}}>
                      {next?next.name.split(' ')[0]:'Next'} →
                    </Btn>
                  </>);
                })()}
              </div>
            </div>
          ) : (
            /* ── Player list ── */
            <div style={{display:'grid',gap:4,maxHeight:360,overflowY:'auto',paddingRight:2}}>
              {lineupPlayers.map(p => {
                const val = scores[p.id] != null ? scores[p.id] : 7;
                const c = ratingColor(val);
                return (
                  <div key={p.id} onClick={()=>setSelectedPid(p.id)}
                    style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',
                      background:'#172236',border:'1px solid #1e2e45',borderRadius:7,
                      cursor:'pointer',transition:'all 0.12s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=c+'55';e.currentTarget.style.background='#1a2740'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e2e45';e.currentTarget.style.background='#172236'}}>
                    <span style={{background:'#1e2d42',color:'#4ade80',padding:'2px 6px',borderRadius:4,
                      fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,width:34,
                      textAlign:'center',flexShrink:0}}>{p.posType}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:'#e8edf5'}}>{p.name}</span>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:17,color:c,lineHeight:1}}>
                        {val%1===0?val:val.toFixed(1)}
                      </span>
                      <div style={{width:5,height:5,borderRadius:'50%',background:c}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid #1e2e45',
        display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <Btn onClick={()=>onSave(scores)} style={{background:'#7c3aed'}}>💾 Save Ratings</Btn>
      </div>
    </div>
  );
}


/* ─── EVENTS PAGE (shared for trainings & matches) ──────────────────────────── */
function EventsPage({data,setData,currentUser,type}) {
  const [showAddModal,setShowAddModal]=useState(false);
  const [form,setForm]=useState({title:'',date:'',time:'18:00',location:''});
  const [activeTab,setActiveTab]=useState('upcoming');
  const [selectedEvent,setSelectedEvent]=useState(null);
  const [editingEvent,setEditingEvent]=useState(false);
  const [editForm,setEditForm]=useState({title:'',date:'',time:'',location:''});
  const [confirmDialog,setConfirmDialog]=useState(null); // {message, onConfirm}
  const [ratingEvent,setRatingEvent]=useState(null);
  const [matchScreen,setMatchScreen]=useState('overview');
  const [matchResultEvent,setMatchResultEvent]=useState(null); // For match result modal

  const isMatch = type==='competitive';
  const canAdd = currentUser.role==='admin'||currentUser.role==='manager';
  const myPlayer = data.players.find(p=>p.id===currentUser.playerId);

  const events = data.events.filter(e=>e.type===type).sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming = events.filter(e=>!isPast(e.date));
  const past = events.filter(e=>isPast(e.date));
  const shown = activeTab==='upcoming'?upcoming:past;

  function addEvent() {
    if (!form.title||!form.date) return;
    const newEv = {id:`ev${Date.now()}`,type,title:form.title,date:form.date,time:form.time,location:form.location,attendees:[],confirmedAttendees:[],...(isMatch?{formationId:data.formations[0]?.id,confirmedLineup:null}:{})};
    setData(d=>({...d,events:[...d.events,newEv]}));
    setForm({title:'',date:'',time:'18:00',location:''}); setShowAddModal(false);
  }

  function deleteEvent(id) {
    setConfirmDialog({
      message: `Delete this ${isMatch ? 'match' : 'training'}? This cannot be undone.`,
      onConfirm: () => {
        setData(d=>({...d,events:d.events.filter(e=>e.id!==id)}));
        setSelectedEvent(null);
        setConfirmDialog(null);
      }
    });
  }

  function startEditEvent(ev) {
    setEditForm({title:ev.title, date:ev.date, time:ev.time, location:ev.location||''});
    setEditingEvent(true);
  }

  function saveEvent(evId) {
    setConfirmDialog({
      message: 'Save changes to this event?',
      onConfirm: () => {
        setData(d=>({...d,events:d.events.map(e=>
          e.id===evId ? {...e, title:editForm.title, date:editForm.date, time:editForm.time, location:editForm.location} : e
        )}));
        setSelectedEvent(se=>({...se, title:editForm.title, date:editForm.date, time:editForm.time, location:editForm.location}));
        setEditingEvent(false);
        setConfirmDialog(null);
      }
    });
  }

  function toggleAttendance(ev) {
    if (!myPlayer) return;
    const pid = myPlayer.id;
    const attending = (ev.attendees||[]).includes(pid);
    setData(d=>({...d,events:d.events.map(e=>e.id===ev.id?{...e,attendees:attending?e.attendees.filter(x=>x!==pid):[...e.attendees,pid]}:e)}));
    if (selectedEvent?.id===ev.id) setSelectedEvent(se=>({...se,attendees:attending?se.attendees.filter(x=>x!==pid):[...se.attendees,pid]}));
  }

  function confirmAttendance(ev, pid, confirm) {
    setData(d=>({...d,events:d.events.map(e=>{
      if(e.id!==ev.id) return e;
      const conf = e.confirmedAttendees||[];
      return {...e,confirmedAttendees:confirm?[...new Set([...conf,pid])]:conf.filter(x=>x!==pid)};
    })}));
  }

  function manuallyAddPlayer(evId, pid) {
    if (!pid) return;
    setData(d=>({...d,events:d.events.map(e=>
      e.id===evId && !(e.attendees||[]).includes(pid)
        ? {...e, attendees:[...e.attendees, pid]}
        : e
    )}));
  }

  function removePlayerFromEvent(evId, pid) {
    setData(d=>({...d,events:d.events.map(e=>
      e.id===evId ? {
        ...e,
        attendees:(e.attendees||[]).filter(x=>x!==pid),
        confirmedAttendees:(e.confirmedAttendees||[]).filter(x=>x!==pid),
      } : e
    )}));
  }

  function toggleMatchCompleted(evId) {
    // If already completed, just toggle off
    const ev = data.events.find(e => e.id === evId);
    if (ev?.gameCompleted) {
      setData(d=>({...d,events:d.events.map(e=>
        e.id===evId ? {...e, gameCompleted:false} : e
      )}));
    } else {
      // Open match result modal instead of directly marking complete
      setMatchResultEvent(ev);
    }
  }

  function saveMatchResult(evId, result) {
    setData(d=>({...d,events:d.events.map(e=>
      e.id===evId ? {...e, gameCompleted:true, matchResult:result} : e
    )}));
    setMatchResultEvent(null);
  }

  function savePerformanceRatings(evId, scores) {
    setData(d=>({...d,events:d.events.map(e=>
      e.id===evId ? {...e, performanceScores:scores, matchConfirmed:true} : e
    )}));
    setMatchScreen('overview');
  }

  const getPlayer = id => data.players.find(p=>p.id===id)||data.users.find(u=>u.id===id);
  const getPlayerName = id => { const p=data.players.find(p=>p.id===id); return p?p.name:id; };

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <SectionTitle style={{margin:0}}>{isMatch?'Matches':'Trainings'}</SectionTitle>
        {canAdd&&<Btn onClick={()=>setShowAddModal(true)}>+ Add {isMatch?'Match':'Training'}</Btn>}
      </div>

      <Tabs tabs={[{id:'upcoming',label:`Upcoming (${upcoming.length})`},{id:'past',label:`Past (${past.length})`}]} active={activeTab} onChange={setActiveTab}/>

      <div style={{display:'grid',gap:8}}>
        {shown.length===0&&<div style={{color:C.muted,padding:32,textAlign:'center',fontSize:14}}>No {activeTab} {isMatch?'matches':'trainings'}.</div>}
        {shown.map(ev=>{
          const iAttend = myPlayer&&(ev.attendees||[]).includes(myPlayer.id);
          const past_ = isPast(ev.date);
          const hasLineupSet = ev.confirmedLineup && ev.confirmedLineup.length > 0;
          return (
            <div key={ev.id} className={`card-hover ${isMatch?'event-card-match':'event-card-training'}`}
              onClick={()=>setSelectedEvent(ev)}
              style={{
                background:C.card, border:`1px solid ${C.border}`,
                borderRadius:8, padding:'14px 16px',
                cursor:'pointer', display:'flex', alignItems:'center', gap:16,
              }}>
              {/* Date block */}
              <div style={{flexShrink:0,textAlign:'center',width:44}}>
                <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:22,color:C.text,lineHeight:1}}>
                  {new Date(ev.date+'T12:00:00').getDate()}
                </div>
                <div style={{fontFamily:'Barlow Condensed',fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                  {new Date(ev.date+'T12:00:00').toLocaleDateString('en-GB',{month:'short'})}
                </div>
              </div>

              {/* Divider */}
              <div style={{width:1,height:36,background:C.border,flexShrink:0}}/>

              {/* Main info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:16,color:C.text,letterSpacing:'0.01em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev.title}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                  {ev.time}{ev.location?` · ${ev.location}`:''}
                </div>
              </div>

              {/* Right side indicators */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                {/* Show score if match completed */}
                {isMatch&&ev.matchResult&&(
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'#172236',borderRadius:6,padding:'4px 10px',marginBottom:2}}>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:18,color:ev.matchResult.homeScore>ev.matchResult.awayScore?'#4ade80':ev.matchResult.homeScore<ev.matchResult.awayScore?'#f87171':'#facc15'}}>
                      {ev.matchResult.homeScore}
                    </span>
                    <span style={{color:'#475569',fontSize:12}}>:</span>
                    <span style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:18,color:'#7a90aa'}}>
                      {ev.matchResult.awayScore}
                    </span>
                  </div>
                )}
                {myPlayer&&!past_&&(
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:iAttend?C.accent:'#f87171'}}/>
                    <span style={{fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700,color:iAttend?C.accent:'#f87171'}}>
                      {iAttend?'Going':'Not Going'}
                    </span>
                  </div>
                )}
                {!ev.matchResult&&<div style={{fontSize:11,color:C.muted}}>{(ev.attendees||[]).length} attending</div>}
                {isMatch&&hasLineupSet&&!ev.gameCompleted&&<div style={{fontSize:10,color:C.accent,fontFamily:'Barlow Condensed',fontWeight:700}}>✓ Lineup set</div>}
                {isMatch&&ev.matchConfirmed&&<div style={{fontSize:10,color:'#a78bfa',fontFamily:'Barlow Condensed',fontWeight:700}}>⭐ Rated</div>}
                {isMatch&&ev.gameCompleted&&!ev.matchResult&&<div style={{fontSize:10,color:'#34d399',fontFamily:'Barlow Condensed',fontWeight:700}}>✓ Completed</div>}
                {past_&&!ev.gameCompleted&&<div style={{fontSize:10,color:C.muted,fontFamily:'Barlow Condensed'}}>Past</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {/* Performance Rating Modal */}
      {ratingEvent&&(
        <PerformanceRatingModal
          event={data.events.find(e=>e.id===ratingEvent.id)||ratingEvent}
          players={data.players}
          onSave={(scores)=>savePerformanceRatings(ratingEvent.id, scores)}
          onClose={()=>setRatingEvent(null)}
        />
      )}

      {/* Match Result Modal */}
      {matchResultEvent&&(
        <MatchResultModal
          event={data.events.find(e=>e.id===matchResultEvent.id)||matchResultEvent}
          players={data.players}
          onSave={(result)=>saveMatchResult(matchResultEvent.id, result)}
          onClose={()=>setMatchResultEvent(null)}
        />
      )}

      {showAddModal&&(
        <Modal title={`Add ${isMatch?'Match':'Training'}`} onClose={()=>setShowAddModal(false)}>
          <FormRow label="Title"><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder={isMatch?'Match vs Opponent':'Tuesday Training'}/></FormRow>
          <FormRow label="Date"><Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} min={new Date().toISOString().split('T')[0]}/></FormRow>
          <FormRow label="Time"><Input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></FormRow>
          <FormRow label="Location"><Input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Ground name / address"/></FormRow>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
            <Btn variant="secondary" onClick={()=>setShowAddModal(false)}>Cancel</Btn>
            <Btn onClick={addEvent}>Create</Btn>
          </div>
        </Modal>
      )}

      {/* Event Detail Modal */}
      {selectedEvent&&(()=>{
        const ev = data.events.find(e=>e.id===selectedEvent.id)||selectedEvent;
        const iAttend = myPlayer&&(ev.attendees||[]).includes(myPlayer.id);
        const past_ = isPast(ev.date);

        // For match events: resolve formation + lineup
        const matchFormation = isMatch
          ? data.formations.find(f=>f.id===ev.formationId) || data.formations[0]
          : null;
        const hasLineup = isMatch && ev.confirmedLineup && ev.confirmedLineup.length > 0;

        return (
          <Modal title={editingEvent ? `Edit: ${ev.title}` : ev.title} onClose={()=>{setSelectedEvent(null);setEditingEvent(false);setMatchScreen('overview');}} width={isMatch ? 860 : 560}>

            {/* ── Confirm dialog overlay ── */}
            {confirmDialog&&(
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
                <div className="fade-in" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,maxWidth:380,width:'90%',textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:12}}>⚠️</div>
                  <div style={{fontSize:15,color:C.text,marginBottom:20,lineHeight:1.5}}>{confirmDialog.message}</div>
                  <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                    <Btn variant="secondary" onClick={()=>setConfirmDialog(null)}>Cancel</Btn>
                    <Btn onClick={confirmDialog.onConfirm}>Confirm</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* ── Edit form ── */}
            {editingEvent ? (
              <div style={{background:C.card2,borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:5}}>Title</label>
                    <Input value={editForm.title} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))} placeholder="Event title"/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:5}}>Date</label>
                    <Input type="date" value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:5}}>Time</label>
                    <Input type="time" value={editForm.time} onChange={e=>setEditForm(f=>({...f,time:e.target.value}))}/>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{display:'block',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:5}}>Location</label>
                    <Input value={editForm.location} onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} placeholder="Ground name / address"/>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn onClick={()=>saveEvent(ev.id)} disabled={!editForm.title}>Save Changes</Btn>
                  <Btn variant="secondary" onClick={()=>setEditingEvent(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              /* Meta badges + edit button */
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:16}}>
                <Badge c={C.textSm}>📅 {formatDisplayDate(ev.date)}</Badge>
                <Badge c={C.textSm}>🕐 {ev.time}</Badge>
                {ev.location&&<Badge c={C.textSm}>📍 {ev.location}</Badge>}
                {isMatch&&(hasLineup
                  ? ev.matchConfirmed
                    ? <><Badge c={C.accent}>✅ Lineup Set</Badge><Badge c='#a78bfa'>⭐ Rated</Badge></>
                    : <Badge c={C.accent}>✅ Lineup Set</Badge>
                  : <Badge c='#f59e0b'>⏳ No Lineup Yet</Badge>)}
                {isMatch&&ev.gameCompleted&&<Badge c='#34d399'>✅ Completed</Badge>}
                {canAdd&&<Btn variant="secondary" onClick={()=>startEditEvent(ev)} style={{padding:'3px 12px',fontSize:12,marginLeft:'auto'}}>✏️ Edit</Btn>}
              </div>
            )}

            {/* ── MATCH LAYOUT: pitch left, details right ── */}
            {isMatch ? (
              matchScreen === 'ratings' ? (
                <MatchRatingScreen
                  event={data.events.find(e=>e.id===ev.id)||ev}
                  players={data.players}
                  formation={matchFormation}
                  onSave={(scores)=>savePerformanceRatings(ev.id, scores)}
                  onBack={()=>setMatchScreen('overview')}
                />
              ) : (
              <div className="match-modal-layout">

                {/* Left: pitch */}
                <div>
                  <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:C.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8,textAlign:'center'}}>
                    {matchFormation?.name} · {hasLineup ? 'Confirmed Lineup' : 'No lineup generated yet'}
                  </div>
                  {matchFormation ? (
                    <PitchDisplay
                      formation={matchFormation}
                      lineup={hasLineup ? ev.confirmedLineup.map(l=>({slotId:l.slotId,playerId:l.playerId})) : []}
                      players={data.players}
                      subPlayers={[]}
                      interactive={false}
                    />
                  ) : (
                    <div style={{background:C.card2,borderRadius:10,padding:20,textAlign:'center',color:C.muted,fontSize:13}}>No formation assigned</div>
                  )}
                  {!hasLineup&&(
                    <div style={{marginTop:10,padding:'10px 12px',background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,fontSize:12,color:'#f59e0b',textAlign:'center',lineHeight:1.5}}>
                      Go to <strong>Lineup Generator</strong> and select this match to generate and confirm a lineup.
                    </div>
                  )}
                  {hasLineup&&(
                    <div style={{marginTop:12,background:C.card2,borderRadius:8,padding:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.muted,fontFamily:'Barlow Condensed',letterSpacing:'0.06em',marginBottom:8,textTransform:'uppercase'}}>Starting 11</div>
                      {ev.confirmedLineup.map((l,i)=>(
                        <div key={i} style={{display:'flex',gap:8,padding:'4px 0',alignItems:'center'}}>
                          <span style={{background:'#1e2d42',color:C.accent,padding:'1px 5px',borderRadius:4,fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,minWidth:30,textAlign:'center'}}>{l.posType}</span>
                          <span style={{fontSize:12,color:C.text}}>{getPlayerName(l.playerId)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: RSVP + attendees + actions */}
                <div>
                  {/* Match Result Display */}
                  {ev.matchResult && (
                    <div style={{background:'linear-gradient(135deg, #172236 0%, #1a2845 100%)',border:'1px solid #1e2e45',borderRadius:12,padding:16,marginBottom:14}}>
                      {/* Score */}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginBottom:12}}>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:42,color:ev.matchResult.homeScore>ev.matchResult.awayScore?'#4ade80':ev.matchResult.homeScore<ev.matchResult.awayScore?'#f87171':'#facc15',lineHeight:1}}>
                            {ev.matchResult.homeScore}
                          </div>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:10,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>Us</div>
                        </div>
                        <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:20,color:'#334155'}}>:</div>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:42,color:'#7a90aa',lineHeight:1}}>
                            {ev.matchResult.awayScore}
                          </div>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:10,color:'#5a6f8a',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>Them</div>
                        </div>
                      </div>
                      {/* Result badge */}
                      <div style={{textAlign:'center',marginBottom:ev.matchResult.goals?.length>0?12:0}}>
                        <span style={{
                          fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,
                          padding:'4px 14px',borderRadius:6,
                          background: ev.matchResult.homeScore > ev.matchResult.awayScore ? 'rgba(74,222,128,0.15)' : ev.matchResult.homeScore < ev.matchResult.awayScore ? 'rgba(248,113,113,0.15)' : 'rgba(250,204,21,0.15)',
                          color: ev.matchResult.homeScore > ev.matchResult.awayScore ? '#4ade80' : ev.matchResult.homeScore < ev.matchResult.awayScore ? '#f87171' : '#facc15',
                        }}>
                          {ev.matchResult.homeScore > ev.matchResult.awayScore ? '🏆 VICTORY' : ev.matchResult.homeScore < ev.matchResult.awayScore ? '❌ DEFEAT' : '🤝 DRAW'}
                        </span>
                      </div>
                      {/* Scorers & Assists */}
                      {ev.matchResult.goals?.length > 0 && (
                        <div style={{borderTop:'1px solid #1e2e45',paddingTop:10}}>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                            {/* Scorers */}
                            <div>
                              <div style={{fontSize:9,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>⚽ Scorers</div>
                              {(()=>{
                                const counts = {};
                                ev.matchResult.goals.filter(g=>g.scorerId).forEach(g=>{counts[g.scorerId]=(counts[g.scorerId]||0)+1;});
                                return Object.entries(counts).map(([pid,c])=>(
                                  <div key={pid} style={{fontSize:11,color:'#e8edf5',padding:'1px 0'}}>
                                    {getPlayerName(pid)}{c>1&&<span style={{color:'#4ade80',fontWeight:700,marginLeft:4}}>×{c}</span>}
                                  </div>
                                ));
                              })()}
                              {ev.matchResult.goals.filter(g=>g.isOwnGoal).length>0&&(
                                <div style={{fontSize:11,color:'#f87171',fontStyle:'italic',padding:'1px 0'}}>Own goal ×{ev.matchResult.goals.filter(g=>g.isOwnGoal).length}</div>
                              )}
                            </div>
                            {/* Assists */}
                            <div>
                              <div style={{fontSize:9,color:'#5a6f8a',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4}}>🅰️ Assists</div>
                              {(()=>{
                                const counts = {};
                                ev.matchResult.goals.filter(g=>g.assisterId).forEach(g=>{counts[g.assisterId]=(counts[g.assisterId]||0)+1;});
                                const entries = Object.entries(counts);
                                if (entries.length===0) return <div style={{fontSize:11,color:'#475569',fontStyle:'italic'}}>None</div>;
                                return entries.map(([pid,c])=>(
                                  <div key={pid} style={{fontSize:11,color:'#e8edf5',padding:'1px 0'}}>
                                    {getPlayerName(pid)}{c>1&&<span style={{color:'#60a5fa',fontWeight:700,marginLeft:4}}>×{c}</span>}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Edit button */}
                      {canAdd && (
                        <div style={{marginTop:10,textAlign:'center'}}>
                          <Btn variant="secondary" onClick={()=>setMatchResultEvent(ev)} style={{padding:'5px 12px',fontSize:11}}>✏️ Edit Result</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RSVP */}
                  {!past_&&myPlayer&&(
                    <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>Your RSVP</div>
                      <Btn onClick={()=>toggleAttendance(ev)} variant={iAttend?'secondary':'primary'} style={{width:'100%'}}>
                        {iAttend?'✓ I\'m Going (click to cancel)':'Mark Attendance'}
                      </Btn>
                    </div>
                  )}

                  {/* Attendees */}
                  <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:14}}>
                    <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:C.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                      RSVPs ({(ev.attendees||[]).length})
                      {past_&&<span style={{color:'#f59e0b',marginLeft:8}}> · {(ev.confirmedAttendees||[]).length} confirmed</span>}
                    </div>

                    {/* Manual add picker */}
                    {canAdd&&(()=>{
                      const missing = data.players.filter(p=>!(ev.attendees||[]).includes(p.id));
                      if (!missing.length) return null;
                      return (
                        <div style={{display:'flex',gap:6,marginBottom:10}}>
                          <Select key={`add-match-${ev.id}-${missing.length}`} id={`add-match-${ev.id}`} defaultValue={missing[0]?.id||''} style={{flex:1,fontSize:12,padding:'6px 10px'}}>
                            {missing.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </Select>
                          <Btn style={{padding:'6px 12px',fontSize:12}} onClick={()=>{
                            const sel = document.getElementById(`add-match-${ev.id}`);
                            if (sel?.value) { manuallyAddPlayer(ev.id, sel.value); }
                          }}>Add</Btn>
                        </div>
                      );
                    })()}

                    {(ev.attendees||[]).length===0&&<div style={{color:C.muted,fontSize:13}}>No RSVPs yet.</div>}
                    <div style={{maxHeight:200,overflowY:'auto'}}>
                      {(ev.attendees||[]).map(pid=>{
                        const pname = getPlayerName(pid);
                        const confirmed_ = (ev.confirmedAttendees||[]).includes(pid);
                        const inLineup = hasLineup && ev.confirmedLineup.some(l=>l.playerId===pid);
                        return (
                          <div key={pid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <span style={{fontSize:13,color:C.text}}>{pname}</span>
                              {inLineup&&<span style={{background:'rgba(74,222,128,0.1)',color:C.accent,padding:'1px 6px',borderRadius:4,fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700}}>
                                {ev.confirmedLineup.find(l=>l.playerId===pid)?.posType}
                              </span>}
                            </div>
                            <div style={{display:'flex',gap:5,alignItems:'center'}}>
                              {canAdd&&past_&&(
                                <>
                                  <button onClick={()=>confirmAttendance(ev,pid,true)} style={{background:confirmed_?C.accent2:'#1e2d42',color:confirmed_?'#fff':C.muted,border:'none',borderRadius:5,padding:'3px 8px',fontSize:10,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer'}}>Attended</button>
                                  {confirmed_&&<button onClick={()=>confirmAttendance(ev,pid,false)} style={{background:'#7f1d1d',color:'#fca5a5',border:'none',borderRadius:5,padding:'3px 6px',fontSize:10,cursor:'pointer'}}>✕</button>}
                                </>
                              )}
                              {canAdd&&<button onClick={()=>removePlayerFromEvent(ev.id,pid)} title="Remove from event" style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14,lineHeight:1,marginLeft:2}} onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>✕</button>}
                              {!canAdd&&past_&&confirmed_&&<Badge c={C.accent}>✓</Badge>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rate Players button — past matches with confirmed lineup, admin/manager only */}
                  {canAdd && past_ && hasLineup && (
                    <div style={{marginBottom:12}}>
                      {!ev.matchConfirmed ? (
                        <Btn onClick={()=>setRatingEvent(ev)} style={{width:'100%',padding:12,fontSize:14,background:'#7c3aed'}}>
                          🏁 Confirm Match & Rate Players
                        </Btn>
                      ) : (
                        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.25)',borderRadius:8}}>
                          <span style={{fontSize:16}}>⭐</span>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.04em'}}>Match Rated</div>
                            <div style={{fontSize:11,color:'#7a90aa',marginTop:1}}>
                              Team avg: {ev.performanceScores && ev.confirmedLineup
                                ? (ev.confirmedLineup.reduce((s,l)=>s+(ev.performanceScores[l.playerId]||0),0)/ev.confirmedLineup.length).toFixed(1)
                                : '—'}/10
                            </div>
                          </div>
                          <Btn variant="secondary" onClick={()=>setRatingEvent(ev)} style={{padding:'5px 12px',fontSize:11}}>Edit Ratings</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mark as Completed */}
                  {canAdd&&(
                    <div style={{marginBottom:10}}>
                      <div
                        onClick={()=>toggleMatchCompleted(ev.id)}
                        style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:9,cursor:'pointer',
                          background:ev.gameCompleted?'rgba(52,211,153,0.08)':'rgba(255,255,255,0.03)',
                          border:`1px solid ${ev.gameCompleted?'rgba(52,211,153,0.35)':'#1e2e45'}`,
                          transition:'all 0.15s'}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=ev.gameCompleted?'rgba(52,211,153,0.5)':'#3a4f6a'}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=ev.gameCompleted?'rgba(52,211,153,0.35)':'#1e2e45'}>
                        {/* Checkbox */}
                        <div style={{width:22,height:22,borderRadius:6,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                          background:ev.gameCompleted?'#34d399':'transparent',
                          border:`2px solid ${ev.gameCompleted?'#34d399':'#3a4f6a'}`,
                          transition:'all 0.15s'}}>
                          {ev.gameCompleted&&<span style={{color:'#0c1220',fontSize:13,fontWeight:900,lineHeight:1}}>✓</span>}
                        </div>
                        <div>
                          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,color:ev.gameCompleted?'#34d399':'#e8edf5',letterSpacing:'0.02em'}}>
                            {ev.gameCompleted?'Match Completed':'Mark as Completed'}
                          </div>
                          <div style={{fontSize:11,color:'#5a6f8a',marginTop:1}}>
                            {ev.gameCompleted?'Click to undo':'Finishes the match and unlocks player ratings'}
                          </div>
                        </div>
                      </div>
                      {ev.gameCompleted&&hasLineup&&(
                        <Btn onClick={()=>setMatchScreen('ratings')}
                          style={{width:'100%',marginTop:8,padding:'10px 14px',fontSize:14,background:'#7c3aed'}}>
                          ⭐ Rate Players
                        </Btn>
                      )}
                      {ev.gameCompleted&&ev.matchConfirmed&&(
                        <div style={{marginTop:6,padding:'7px 12px',background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:7,
                          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{fontSize:12,color:'#a78bfa',fontFamily:'Barlow Condensed',fontWeight:700}}>
                            Team avg: {ev.performanceScores&&ev.confirmedLineup
                              ?(ev.confirmedLineup.reduce((s,l)=>s+(ev.performanceScores[l.playerId]||0),0)/ev.confirmedLineup.length).toFixed(1)
                              :'---'}/10
                          </span>
                          <Btn variant='secondary' onClick={()=>setMatchScreen('ratings')} style={{padding:'3px 10px',fontSize:11}}>Edit</Btn>
                        </div>
                      )}
                    </div>
                  )}

                  {canAdd&&(
                    <div style={{display:'flex',justifyContent:'flex-end'}}>
                      <Btn variant="danger" onClick={()=>deleteEvent(ev.id)}>🗑 Delete Match</Btn>
                    </div>
                  )}
                </div>
              </div>
              )
            ) : (
              /* ── TRAINING LAYOUT (unchanged) ── */
              <>
                {!past_&&myPlayer&&(
                  <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:16}}>
                    <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>Your RSVP</div>
                    <Btn onClick={()=>toggleAttendance(ev)} variant={iAttend?'secondary':'primary'} style={{width:'100%'}}>
                      {iAttend?'✓ I\'m Going (click to cancel)':'Mark Attendance'}
                    </Btn>
                  </div>
                )}
                <div style={{background:C.card2,borderRadius:10,padding:14,marginBottom:16}}>
                  <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>RSVPs ({(ev.attendees||[]).length})</div>

                  {/* Manual add picker */}
                  {canAdd&&(()=>{
                    const missing = data.players.filter(p=>!(ev.attendees||[]).includes(p.id));
                    if (!missing.length) return null;
                    return (
                      <div style={{display:'flex',gap:6,marginBottom:10}}>
                        <Select key={`add-train-${ev.id}-${missing.length}`} id={`add-train-${ev.id}`} defaultValue={missing[0]?.id||''} style={{flex:1,fontSize:12,padding:'6px 10px'}}>
                          {missing.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                        <Btn style={{padding:'6px 12px',fontSize:12}} onClick={()=>{
                          const sel = document.getElementById(`add-train-${ev.id}`);
                          if (sel?.value) { manuallyAddPlayer(ev.id, sel.value); }
                        }}>Add</Btn>
                      </div>
                    );
                  })()}

                  {(ev.attendees||[]).length===0&&<div style={{color:C.muted,fontSize:13}}>No RSVPs yet.</div>}
                  {(ev.attendees||[]).map(pid=>{
                    const pname = getPlayerName(pid);
                    const confirmed_ = (ev.confirmedAttendees||[]).includes(pid);
                    return (
                      <div key={pid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                        <span style={{fontSize:13,color:C.text}}>{pname}</span>
                        <div style={{display:'flex',gap:5,alignItems:'center'}}>
                          {canAdd&&past_&&(
                            <>
                              <button onClick={()=>confirmAttendance(ev,pid,true)} style={{background:confirmed_?C.accent2:'#1e2d42',color:confirmed_?'#fff':C.muted,border:'none',borderRadius:5,padding:'4px 10px',fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700,cursor:'pointer'}}>Attended</button>
                              {confirmed_&&<button onClick={()=>confirmAttendance(ev,pid,false)} style={{background:'#7f1d1d',color:'#fca5a5',border:'none',borderRadius:5,padding:'4px 8px',fontSize:11,cursor:'pointer'}}>✕</button>}
                            </>
                          )}
                          {canAdd&&<button onClick={()=>removePlayerFromEvent(ev.id,pid)} title="Remove from event" style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14,lineHeight:1,marginLeft:2}} onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>✕</button>}
                          {!canAdd&&past_&&confirmed_&&<Badge c={C.accent}>✓</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {canAdd&&(
                  <div style={{display:'flex',justifyContent:'flex-end'}}>
                    <Btn variant="danger" onClick={()=>deleteEvent(ev.id)}>🗑 Delete Event</Btn>
                  </div>
                )}
              </>
            )}
          </Modal>
        );
      })()}
    </div>
  );
}

/* ─── SLOT EDITOR ROW ────────────────────────────────────────────────────────── */
function SlotEditorRow({slot, index, onChange, onRemove, canRemove}) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'32px 1fr 70px 70px auto',gap:6,marginBottom:6,alignItems:'center'}}>
      <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,textAlign:'center'}}>{index+1}</span>
      <Select value={slot.posType} onChange={e=>{const v=e.target.value;onChange({...slot,posType:v,label:v});}}>
        {ALL_POS.map(p=><option key={p}>{p}</option>)}
      </Select>
      <div>
        <div style={{fontSize:10,color:C.muted,fontFamily:'Barlow Condensed',marginBottom:2}}>X %</div>
        <Input type="number" min="0" max="100" value={slot.x}
          onChange={e=>onChange({...slot,x:Math.min(100,Math.max(0,+e.target.value))})}/>
      </div>
      <div>
        <div style={{fontSize:10,color:C.muted,fontFamily:'Barlow Condensed',marginBottom:2}}>Y %</div>
        <Input type="number" min="0" max="100" value={slot.y}
          onChange={e=>onChange({...slot,y:Math.min(100,Math.max(0,+e.target.value))})}/>
      </div>
      <button onClick={onRemove} disabled={!canRemove}
        style={{background:'none',border:'none',color:canRemove?'#f87171':'#334155',cursor:canRemove?'pointer':'default',fontSize:18,lineHeight:1,paddingTop:14}}>✕</button>
    </div>
  );
}

/* ─── FORMATION EDITOR MODAL ─────────────────────────────────────────────────── */
function FormationEditorModal({formation, onSave, onClose, isNew=false}) {
  const [name, setName] = useState(formation?.name || '');
  const [slots, setSlots] = useState(
    formation?.slots ? formation.slots.map(s=>({...s})) : []
  );
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'preview'

  function updateSlot(index, updated) {
    setSlots(s => s.map((x,i) => i===index ? updated : x));
  }
  function addSlot() {
    if (slots.length >= 11) return;
    setSlots(s => [...s, {id:`s${Date.now()}`, posType:'CM', label:'CM', x:50, y:50}]);
  }
  function removeSlot(index) {
    if (slots.length <= 1) return;
    setSlots(s => s.filter((_,i) => i!==index));
  }

  function handleSave() {
    if (!name.trim()) return alert('Please enter a formation name');
    if (slots.length !== 11) return alert(`You need exactly 11 positions (currently ${slots.length})`);
    onSave({name: name.trim(), slots});
  }

  const countLabel = slots.length === 11
    ? <span style={{color:C.accent}}>✓ 11/11</span>
    : <span style={{color:slots.length>11?'#f87171':'#f59e0b'}}>{slots.length}/11</span>;

  return (
    <Modal title={isNew ? 'Create Formation' : `Edit Formation: ${formation.name}`} onClose={onClose} width={680} zIndex={150}>
      <div style={{display:'flex',gap:24,alignItems:'flex-start'}}>
        {/* Left: editor */}
        <div style={{flex:1,minWidth:0}}>
          <FormRow label="Formation Name">
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. 4-3-3"/>
          </FormRow>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em'}}>
              Positions {countLabel}
            </div>
            <div style={{display:'flex',gap:6}}>
              <Btn variant="secondary" onClick={addSlot} style={{padding:'5px 10px',fontSize:11}} disabled={slots.length>=11}>
                + Add
              </Btn>
            </div>
          </div>

          <div style={{maxHeight:340,overflowY:'auto',paddingRight:4}}>
            {slots.map((slot, i) => (
              <SlotEditorRow key={slot.id} slot={slot} index={i}
                onChange={updated => updateSlot(i, updated)}
                onRemove={() => removeSlot(i)}
                canRemove={slots.length > 1}/>
            ))}
          </div>

          <div style={{marginTop:8,padding:'10px 12px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:8,fontSize:12,color:C.textSm,lineHeight:1.6}}>
            💡 <strong style={{color:C.text}}>Tip:</strong> X and Y are percentage positions on the pitch (0–100). X=50 is centre, Y=88 is the goal line, Y=10 is the top of the pitch.
          </div>
        </div>

        {/* Right: live pitch preview */}
        <div style={{width:200,flexShrink:0}}>
          <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:12,color:C.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8,textAlign:'center'}}>Live Preview</div>
          <PitchDisplay formation={{slots}} lineup={[]} players={[]}/>
          <div style={{textAlign:'center',marginTop:8,fontSize:11,color:C.muted}}>
            {slots.length}/11 positions placed
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>{isNew ? 'Create Formation' : 'Save Changes'}</Btn>
      </div>
    </Modal>
  );
}

/* ─── FORMATIONS PAGE ───────────────────────────────────────────────────────── */
function FormationsPage({data,setData,currentUser}) {
  const [selected,setSelected]=useState(null);
  const [showAddModal,setShowAddModal]=useState(false);
  const [editingFormation,setEditingFormation]=useState(null);
  const canEdit = currentUser.role==='admin'||currentUser.role==='manager';

  function addPreset(name) {
    if (!PRESET_FORMATIONS[name]||data.formations.find(f=>f.name===name)) return;
    const f={id:`f${Date.now()}`,name,slots:PRESET_FORMATIONS[name].map(s=>({...s}))};
    setData(d=>({...d,formations:[...d.formations,f]}));
  }

  function deleteFormation(id) {
    if (!window.confirm('Delete this formation?')) return;
    setData(d=>({...d,formations:d.formations.filter(f=>f.id!==id)}));
    setSelected(null);
  }

  function saveNewFormation({name, slots}) {
    setData(d=>({...d,formations:[...d.formations,{id:`f${Date.now()}`,name,slots}]}));
    setShowAddModal(false);
  }

  function saveEditedFormation({name, slots}) {
    setData(d=>({...d,formations:d.formations.map(f=>f.id===editingFormation.id?{...f,name,slots}:f)}));
    // update selected view if it's open
    setSelected(s=>s?.id===editingFormation.id?{...s,name,slots}:s);
    setEditingFormation(null);
  }

  function openEdit(f, e) {
    e.stopPropagation();
    setEditingFormation(f);
  }

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <SectionTitle style={{margin:0}}>Formations</SectionTitle>
        {canEdit&&<div style={{display:'flex',gap:8}}>
          <Select onChange={e=>e.target.value&&addPreset(e.target.value)} defaultValue="">
            <option value="">+ Add Preset...</option>
            {Object.keys(PRESET_FORMATIONS).filter(name=>!data.formations.find(f=>f.name===name)).map(name=><option key={name}>{name}</option>)}
          </Select>
          <Btn onClick={()=>setShowAddModal(true)}>+ Custom</Btn>
        </div>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {data.formations.map(f=>(
          <div key={f.id} className="card-hover" onClick={()=>setSelected(f)}
            style={{background:C.card,border:`1px solid ${selected?.id===f.id?C.accent:C.border}`,borderRadius:12,padding:20,cursor:'pointer',transition:'all 0.2s',position:'relative'}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:28,color:C.accent,marginBottom:4}}>{f.name}</div>
            <div style={{fontSize:13,color:C.muted}}>{f.slots.length} positions</div>
            <div style={{fontSize:12,color:C.textSm,marginTop:6}}>
              {[...new Set(f.slots.map(s=>s.posType))].join(', ')}
            </div>
            {canEdit&&(
              <div style={{position:'absolute',top:12,right:12,display:'flex',gap:6}} onClick={e=>e.stopPropagation()}>
                <button onClick={e=>openEdit(f,e)}
                  style={{background:'#1e2d42',border:'none',color:C.textSm,borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:12,fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.04em',transition:'all 0.15s'}}
                  title="Edit formation">✏️</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View Modal */}
      {selected&&!editingFormation&&(
        <Modal title={selected.name} onClose={()=>setSelected(null)} width={480}>
          <div style={{marginBottom:16}}>
            <PitchDisplay formation={selected} lineup={[]} players={[]}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:13,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>Positions</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {selected.slots.map(s=>(
                <span key={s.id} style={{background:'#1e2d42',color:C.textSm,padding:'4px 10px',borderRadius:5,fontSize:11,fontFamily:'Barlow Condensed',fontWeight:700}}>
                  {s.posType} <span style={{color:'#334155',fontSize:10}}>({s.x},{s.y})</span>
                </span>
              ))}
            </div>
          </div>
          {canEdit&&(
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <Btn variant="secondary" onClick={()=>{setEditingFormation(selected);}}>✏️ Edit Formation</Btn>
              <Btn variant="danger" onClick={()=>deleteFormation(selected.id)}>Delete</Btn>
            </div>
          )}
        </Modal>
      )}

      {/* Create Modal */}
      {showAddModal&&(
        <FormationEditorModal
          formation={null}
          isNew={true}
          onSave={saveNewFormation}
          onClose={()=>setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingFormation&&(
        <FormationEditorModal
          formation={editingFormation}
          isNew={false}
          onSave={saveEditedFormation}
          onClose={()=>setEditingFormation(null)}
        />
      )}
    </div>
  );
}

/* ─── USER MANAGEMENT PAGE ───────────────────────────────────────────────────── */
function UsersPage({data,setData,currentUser}) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',role:'player'});
  const [editUser,setEditUser]=useState(null);

  function addUser() {
    if (!form.name) return;
    const uid = `u${Date.now()}`;
    const pid = form.role==='player'?`p${Date.now()}`:null;
    const newUser = {id:uid,name:form.name,role:form.role,playerId:pid};
    const updates = {users:[...data.users,newUser]};
    if (pid) {
      const newPlayer = {id:pid,userId:uid,name:form.name,positionPreferences:[],skillRatings:Object.fromEntries(ALL_POS.map(p=>[p,50])),managerPreference:{},unavailable:false};
      updates.players = [...data.players,newPlayer];
    }
    setData(d=>({...d,...updates}));
    setForm({name:'',role:'player'}); setShowAdd(false);
  }

  function updateRole(uid, role) {
    setData(d=>({...d,users:d.users.map(u=>u.id===uid?{...u,role}:u)}));
  }

  function deleteUser(uid) {
    const user = data.users.find(u=>u.id===uid);
    if (uid===currentUser.id) return alert("Can't delete yourself");
    setData(d=>({...d,users:d.users.filter(u=>u.id!==uid),players:user?.playerId?d.players.filter(p=>p.id!==user.playerId):d.players}));
  }

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <SectionTitle style={{margin:0}}>User Management</SectionTitle>
        <Btn onClick={()=>setShowAdd(true)}>+ Add User</Btn>
      </div>

      <div style={{display:'grid',gap:10}}>
        {data.users.map(u=>(
          <div key={u.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[u.role]},${roleColor[u.role]}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontWeight:800,fontSize:14,color:'#fff',flexShrink:0}}>
              {u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div style={{flex:1,minWidth:140}}>
              <div style={{fontWeight:600,fontSize:14,color:C.text}}>{u.name}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>ID: {u.id}</div>
            </div>
            <RolePill role={u.role}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <Select value={u.role} onChange={e=>updateRole(u.id,e.target.value)} style={{padding:'6px 10px',fontSize:12,width:'auto'}}>
                {['admin','manager','player'].map(r=><option key={r}>{r}</option>)}
              </Select>
              {u.id!==currentUser.id&&<Btn variant="danger" onClick={()=>deleteUser(u.id)} style={{padding:'6px 12px',fontSize:12}}>Delete</Btn>}
            </div>
          </div>
        ))}
      </div>

      {showAdd&&(
        <Modal title="Add User" onClose={()=>setShowAdd(false)}>
          <FormRow label="Full Name"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="John Smith"/></FormRow>
          <FormRow label="Role">
            <Select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              {['admin','manager','player'].map(r=><option key={r}>{r}</option>)}
            </Select>
          </FormRow>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addUser}>Create User</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── CHANGE PASSWORD PAGE ───────────────────────────────────────────────────── */
/* ─── WEIGHT CONFIG ─────────────────────────────────────────────────────────── */
const WEIGHT_CONFIG = [
  {
    key: 'skillMultiplier',
    label: 'Skill Rating Multiplier',
    icon: '📊',
    desc: 'Each position skill point (0–99) is multiplied by this value. The dominant factor — a rating of 85 with ×7 contributes 595 pts.',
    min: 1, max: 20, step: 1, suffix: '×',
    maxPts: v => `Max ~${99*v} pts`,
  },
  {
    key: 'managerPriorityBonus',
    label: 'Manager Priority Bonus',
    icon: '⭐',
    desc: 'Flat point bonus added when you flag a player for a specific position. Acts as a hard override — set high to lock players in, low to let other factors decide.',
    min: 0, max: 1000, step: 25, suffix: ' pts',
    maxPts: v => `Adds ${v} pts flat`,
  },
  {
    key: 'trainingReliabilityMax',
    label: 'Training Reliability Weight',
    icon: '🏃',
    desc: 'Attendance rate (0–100%) is multiplied by this value. Rewards players who consistently show up to training sessions.',
    min: 0, max: 5, step: 0.1, suffix: '×',
    maxPts: v => `Max ${Math.round(100*v)} pts (100% attendance)`,
  },
  {
    key: 'prefRankMultiplier',
    label: 'Position Preference Multiplier',
    icon: '🎯',
    desc: 'Player\'s preference rank bonus: (6 − rank) × this value. #1 preferred position scores highest. Ensures players tend to play where they want.',
    min: 0, max: 20, step: 1, suffix: '×',
    maxPts: v => `Max ${5*v} pts (#1 preference)`,
  },
  {
    key: 'performanceMultiplier',
    label: 'Match Performance Multiplier',
    icon: '🏆',
    desc: 'Average match performance rating (1–10) × this value. Rewards players who have performed well in past matches. Scores are entered after each game.',
    min: 0, max: 50, step: 1, suffix: '×',
    maxPts: v => `Max ${10*v} pts (10/10 avg rating)`,
  },
];

function SettingsPage({data,setData,currentUser}) {
  const isAdmin = currentUser.role==='admin';

  // Local weight state — initialised from stored weights merged with defaults
  const storedWeights = data.scoringWeights || {};
  const [weights, setWeights] = useState(() => ({...DEFAULT_WEIGHTS,...storedWeights}));
  const [weightMsg, setWeightMsg] = useState(null);
  const [weightsDirty, setWeightsDirty] = useState(false);

  function updateWeight(key, val) {
    setWeights(w => ({...w, [key]: val}));
    setWeightsDirty(true);
    setWeightMsg(null);
  }

  function saveWeights() {
    setData(d => ({...d, scoringWeights: {...weights}}));
    setWeightsDirty(false);
    setWeightMsg({ok:true, text:'Scoring weights saved. New lineups will use these values.'});
  }

  function resetWeights() {
    setWeights({...DEFAULT_WEIGHTS});
    setData(d => ({...d, scoringWeights: {...DEFAULT_WEIGHTS}}));
    setWeightsDirty(false);
    setWeightMsg({ok:true, text:'Weights reset to defaults.'});
  }

  const sliderColor = '#4ade80';

  return (
    <div className="fade-in">
      <SectionTitle>Settings</SectionTitle>

      {/* ── Lineup Scoring Weights (admin only) ── */}
      {isAdmin && (
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:8}}>
            <div>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:18,color:C.text,textTransform:'uppercase',letterSpacing:'0.04em'}}>⚙️ Lineup Scoring Weights</div>
              <div style={{fontSize:12,color:C.muted,marginTop:3}}>Admin only — controls how each factor influences lineup generation.</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="secondary" onClick={resetWeights} style={{fontSize:12,padding:'7px 14px'}}>Reset Defaults</Btn>
              <Btn onClick={saveWeights} style={{fontSize:12,padding:'7px 16px'}} disabled={!weightsDirty}>
                {weightsDirty ? '💾 Save Changes' : '✓ Saved'}
              </Btn>
            </div>
          </div>

          {weightMsg && (
            <div style={{padding:'9px 14px',borderRadius:7,background:weightMsg.ok?'rgba(74,222,128,0.08)':'rgba(248,113,113,0.08)',color:weightMsg.ok?C.accent:'#f87171',fontSize:13,marginBottom:12,border:`1px solid ${weightMsg.ok?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.2)'}`}}>
              {weightMsg.text}
            </div>
          )}

          <div style={{display:'grid',gap:10}}>
            {WEIGHT_CONFIG.map(cfg => {
              const val = weights[cfg.key] ?? DEFAULT_WEIGHTS[cfg.key];
              const defVal = DEFAULT_WEIGHTS[cfg.key];
              const isChanged = val !== defVal;
              const pct = ((val - cfg.min) / (cfg.max - cfg.min)) * 100;
              return (
                <div key={cfg.key} style={{background:C.card,border:`1px solid ${isChanged?'rgba(74,222,128,0.3)':C.border}`,borderRadius:10,padding:'16px 18px',transition:'border-color 0.15s'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'start',marginBottom:10}}>
                    {/* Left: label + desc */}
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <span style={{fontSize:16}}>{cfg.icon}</span>
                        <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:15,color:C.text,letterSpacing:'0.02em'}}>{cfg.label}</span>
                        {isChanged && <span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:10,color:C.accent,background:'rgba(74,222,128,0.1)',padding:'1px 7px',borderRadius:4,letterSpacing:'0.06em'}}>MODIFIED</span>}
                      </div>
                      <div style={{fontSize:12,color:C.muted,lineHeight:1.55,maxWidth:460}}>{cfg.desc}</div>
                    </div>
                    {/* Right: value display */}
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:'Barlow Condensed',fontWeight:900,fontSize:28,color:isChanged?C.accent:C.textSm,lineHeight:1}}>
                        {Number.isInteger(val) ? val : val.toFixed(1)}{cfg.suffix}
                      </div>
                      {isChanged && <div style={{fontSize:10,color:C.muted,marginTop:2}}>default: {defVal}{cfg.suffix}</div>}
                    </div>
                  </div>

                  {/* Slider */}
                  <div style={{position:'relative'}}>
                    <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={val}
                      onChange={e=>updateWeight(cfg.key, +e.target.value)}
                      style={{width:'100%',accentColor:sliderColor,cursor:'pointer'}}/>
                    {/* Min/max labels + impact preview */}
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:4,alignItems:'center'}}>
                      <span style={{fontSize:10,color:'#334155',fontFamily:'Barlow Condensed'}}>{cfg.min}{cfg.suffix}</span>
                      <span style={{fontSize:11,color:'#4ade8088',fontFamily:'Barlow Condensed',fontWeight:700,letterSpacing:'0.04em'}}>
                        {cfg.maxPts(val)}
                      </span>
                      <span style={{fontSize:10,color:'#334155',fontFamily:'Barlow Condensed'}}>{cfg.max}{cfg.suffix}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score preview row */}
          <div style={{marginTop:14,padding:'12px 16px',background:C.card2,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Example Score Preview — 85-rated player, 100% attendance, 10/10 performance, #1 preference</div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              {[
                {label:'Skill',val:85*weights.skillMultiplier,c:'#60a5fa'},
                {label:'Attendance',val:Math.round(100*weights.trainingReliabilityMax),c:'#a78bfa'},
                {label:'Preference',val:Math.round(5*weights.prefRankMultiplier),c:'#f59e0b'},
                {label:'Performance',val:Math.round(10*weights.performanceMultiplier),c:'#4ade80'},
              ].map(item=>(
                <div key={item.label} style={{textAlign:'center'}}>
                  <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:20,color:item.c,lineHeight:1}}>{item.val}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{item.label}</div>
                </div>
              ))}
              <div style={{textAlign:'center',borderLeft:`1px solid ${C.border}`,paddingLeft:16}}>
                <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:20,color:C.text,lineHeight:1}}>
                  {85*weights.skillMultiplier + Math.round(100*weights.trainingReliabilityMax) + Math.round(5*weights.prefRankMultiplier) + Math.round(10*weights.performanceMultiplier)}
                </div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>Total</div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

/* ─── LOGIN PAGE ─────────────────────────────────────────────────────────────── */
function LoginPage({users, onLogin}) {
  const [selectedUser,setSelectedUser]=useState('');

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg,padding:20,position:'relative'}}>
      <div style={{position:'fixed',top:14,right:16,fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:C.muted,letterSpacing:'0.08em',background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:'3px 9px'}}>
        {APP_VERSION}
      </div>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontSize:60,marginBottom:12}}>⚽</div>
          <h1 style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:36,letterSpacing:'0.05em',color:C.text,textTransform:'uppercase',lineHeight:1}}>Team Manager</h1>
          <p style={{color:C.muted,marginTop:8,fontSize:14}}>Select your account to continue</p>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:32}}>
          <FormRow label="Who are you?">
            <Select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
              <option value="">Choose player / staff...</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </Select>
          </FormRow>
          <Btn
            onClick={()=>{ const u=users.find(x=>x.id===selectedUser); if(u) onLogin(u); }}
            disabled={!selectedUser}
            style={{width:'100%',padding:14,fontSize:16,opacity:selectedUser?1:0.5}}>
            Enter →
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [data,setDataRaw]=useState(null);
  const [currentUser,setCurrentUser]=useState(null);
  const [page,setPage]=useState('dashboard');
  const [loading,setLoading]=useState(true);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [moreOpen,setMoreOpen]=useState(false);

  function setData(updater) {
    setDataRaw(prev=>{
      const next = typeof updater==='function'?updater(prev):updater;
      saveData(next);
      return next;
    });
  }

  useEffect(()=>{
    let done = false;
    const finish = (d) => { if (!done) { done=true; setDataRaw(d); setLoading(false); } };
    loadData().then(saved => finish(saved || createInitialData())).catch(() => finish(createInitialData()));
    // safety net: always clear loading after 4s
    const t = setTimeout(() => finish(createInitialData()), 4000);
    return () => clearTimeout(t);
  },[]);

  // Compute derived values (safe even when data is null)
  const navItems = (!loading && currentUser)
    ? NAV_ITEMS.filter(n=>n.roles.includes(currentUser.role))
    : [];
  const sideW = sidebarOpen ? 220 : 70;
  const PRIMARY_TABS = ['dashboard','roster','trainings','games'];
  const primaryNav = navItems.filter(n=>PRIMARY_TABS.includes(n.id));
  const moreNav = navItems.filter(n=>!PRIMARY_TABS.includes(n.id));

  function renderPage() {
    if (!data || !currentUser) return null;
    switch(page) {
      case 'dashboard': return <DashboardPage data={data} currentUser={currentUser} setPage={setPage}/>;
      case 'roster': return <RosterPage data={data} setData={setData} currentUser={currentUser}/>;
      case 'lineup': return <LineupPage data={data} setData={setData} currentUser={currentUser}/>;
      case 'trainings': return <EventsPage data={data} setData={setData} currentUser={currentUser} type="training"/>;
      case 'games': return <EventsPage data={data} setData={setData} currentUser={currentUser} type="competitive"/>;
      case 'formations': return <FormationsPage data={data} setData={setData} currentUser={currentUser}/>;
      case 'users': return <UsersPage data={data} setData={setData} currentUser={currentUser}/>;
      case 'settings': return <SettingsPage data={data} setData={setData} currentUser={currentUser}/>;
      default: return null;
    }
  }

  // Loading screen
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:16,animation:'spin 1s linear infinite'}}>⚽</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{color:C.muted,fontFamily:'Barlow Condensed',fontSize:16}}>Loading...</div>
      </div>
    </div>
  );

  // Login screen
  if (!currentUser) return (
    <LoginPage
      users={data.users}
      onLogin={u=>{ setCurrentUser(u); setPage('dashboard'); }}
    />
  );

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex'}}>
      {/* ── Version badge — always visible top-right ── */}
      <div style={{position:'fixed',top:14,right:16,zIndex:200,fontFamily:'Barlow Condensed',fontWeight:700,fontSize:11,color:C.muted,letterSpacing:'0.08em',background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:'3px 9px',userSelect:'none',pointerEvents:'none'}}>
        {APP_VERSION}
      </div>
      {/* ── Desktop sidebar ── */}
      <div className="desktop-sidebar" style={{width:sideW,background:C.sidebar,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',transition:'width 0.2s',position:'fixed',top:0,left:0,bottom:0,zIndex:50,overflow:'hidden'}}>
        <div style={{padding:sidebarOpen?'24px 20px 16px':'24px 0 16px',textAlign:sidebarOpen?'left':'center',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          {sidebarOpen ? (
            <div>
              <div style={{fontSize:24,lineHeight:1}}>⚽</div>
              <div style={{fontFamily:'Barlow Condensed',fontWeight:800,fontSize:16,color:C.text,marginTop:6,letterSpacing:'0.04em',textTransform:'uppercase',lineHeight:1}}>Team Manager</div>
            </div>
          ) : <div style={{fontSize:24}}>⚽</div>}
        </div>
        <nav style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
          {navItems.map(item=>(
            <div key={item.id} className="nav-item" onClick={()=>setPage(item.id)}
              style={{display:'flex',alignItems:'center',gap:sidebarOpen?12:0,justifyContent:sidebarOpen?'flex-start':'center',padding:sidebarOpen?'11px 12px':'11px 0',borderRadius:8,marginBottom:2,cursor:'pointer',background:page===item.id?'rgba(74,222,128,0.1)':'none',color:page===item.id?C.accent:C.textSm,transition:'all 0.15s'}}>
              <span style={{fontSize:18,flexShrink:0}}>{item.icon}</span>
              {sidebarOpen&&<span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{item.label}</span>}
              {page===item.id&&<div style={{marginLeft:'auto',width:3,height:18,background:C.accent,borderRadius:2,display:sidebarOpen?'block':'none'}}/>}
            </div>
          ))}
        </nav>
        <div style={{padding:'12px 8px',borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <div className="nav-item" onClick={()=>setPage('settings')} style={{display:'flex',alignItems:'center',gap:sidebarOpen?12:0,justifyContent:sidebarOpen?'flex-start':'center',padding:sidebarOpen?'10px 12px':'10px 0',borderRadius:8,marginBottom:4,cursor:'pointer',color:page==='settings'?C.accent:C.textSm}}>
            <span style={{fontSize:18}}>⚙️</span>
            {sidebarOpen&&<span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,letterSpacing:'0.04em'}}>Settings</span>}
          </div>
          <div className="nav-item" onClick={()=>setCurrentUser(null)} style={{display:'flex',alignItems:'center',gap:sidebarOpen?12:0,justifyContent:sidebarOpen?'flex-start':'center',padding:sidebarOpen?'10px 12px':'10px 0',borderRadius:8,cursor:'pointer',color:C.muted}}>
            <span style={{fontSize:18}}>🚪</span>
            {sidebarOpen&&<span style={{fontFamily:'Barlow Condensed',fontWeight:700,fontSize:14,letterSpacing:'0.04em'}}>Sign Out</span>}
          </div>
          {sidebarOpen&&(
            <div style={{padding:'10px 12px',marginTop:8}}>
              <div style={{fontSize:11,color:C.muted,fontFamily:'Barlow Condensed',letterSpacing:'0.04em'}}>{currentUser.name}</div>
              <RolePill role={currentUser.role}/>
            </div>
          )}
        </div>
      </div>

      {/* Desktop collapse toggle */}
      <button className="desktop-collapse-btn desktop-sidebar" onClick={()=>setSidebarOpen(o=>!o)}
        style={{position:'fixed',top:20,left:sideW-12,zIndex:60,width:24,height:24,borderRadius:'50%',background:C.accent2,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,transition:'left 0.2s',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
        {sidebarOpen?'◀':'▶'}
      </button>

      {/* ── Main content ── */}
      <div className="main-content" style={{marginLeft:sideW,flex:1,padding:32,minHeight:'100vh',transition:'margin-left 0.2s',maxWidth:`calc(100vw - ${sideW}px)`}}>
        {renderPage()}
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="mobile-tab-bar">
        <div className="mobile-tab-bar-inner">
          {primaryNav.map(item=>(
            <button key={item.id} className={`mobile-tab-item${page===item.id?' active':''}`}
              onClick={()=>{ setPage(item.id); setMoreOpen(false); }}>
              <span className="mobile-tab-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          {moreNav.length > 0 && (
            <button className={`mobile-tab-item${moreNav.some(n=>n.id===page)||page==='settings'?' active':''}`}
              onClick={()=>setMoreOpen(o=>!o)}>
              <span className="mobile-tab-icon">☰</span>
              <span>More</span>
            </button>
          )}
        </div>

        {/* More menu popup */}
        {moreOpen && (
          <div className="mobile-more-menu fade-in">
            {moreNav.map(item=>(
              <div key={item.id} className={`mobile-more-item${page===item.id?' active':''}`}
                onClick={()=>{ setPage(item.id); setMoreOpen(false); }}>
                <span style={{fontSize:18}}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
            <div className="mobile-more-item" onClick={()=>{ setPage('settings'); setMoreOpen(false); }} style={{color:page==='settings'?C.accent:C.muted}}>
              <span style={{fontSize:18}}>⚙️</span><span>Settings</span>
            </div>
            <div style={{height:1,background:C.border,margin:'6px 0'}}/>
            <div className="mobile-more-item" onClick={()=>setCurrentUser(null)} style={{color:'#f87171'}}>
              <span style={{fontSize:18}}>🚪</span><span>Sign Out</span>
            </div>
            <div style={{padding:'8px 12px 4px',fontSize:11,color:C.muted,fontFamily:'Barlow Condensed'}}>
              {currentUser.name} · <RolePill role={currentUser.role}/>
            </div>
          </div>
        )}
        {moreOpen && <div style={{position:'fixed',inset:0,zIndex:85}} onClick={()=>setMoreOpen(false)}/>}
      </div>
    </div>
  );
}
