import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Share2, Activity, ExternalLink, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/DemoContext';
import wheatImg from '../assets/wheat.png';
import riceImg from '../assets/rice.png';

/* ── MOCK TREND DATA ── */
const TRENDS = {
  north: { ndvi: [{d:'May 15',v:0.65}, {d:'Jun 1',v:0.62}, {d:'Jun 15',v:0.58}, {d:'Jul 1',v:0.21}] },
  south: { ndvi: [{d:'May 15',v:0.75}, {d:'Jun 1',v:0.77}, {d:'Jun 15',v:0.78}, {d:'Jul 1',v:0.80}] }
};

const card = {
  background: 'var(--cs-card)',
  borderRadius: 22,
  border: '1px solid var(--cs-border-soft)',
  boxShadow: '0 2px 10px var(--cs-shadow)',
  padding: 20,
  marginBottom: 16,
};

/* ══════════════════════════════════════════════════════════════════
   PREMIUM SVG FIELD MAP (Kept but adapted for a standard look)
══════════════════════════════════════════════════════════════════ */
function FieldHeatmap({ ndviScore, crisis, health }) {
  const [activeRisk, setActiveRisk] = React.useState(null);

  const risks = [];
  if (crisis) {
    risks.push({ cx: 120, cy: 80, r: 45, type: 'stress', label: 'Drought Risk' });
    risks.push({ cx: 280, cy: 150, r: 60, type: 'stress', label: 'Water Stress Detected' });
    risks.push({ cx: 180, cy: 160, r: 40, type: 'warn', label: 'Disease Risk' });
  } else if (health < 80) {
    risks.push({ cx: 340, cy: 160, r: 45, type: 'warn', label: 'Low Crop Health' });
    risks.push({ cx: 120, cy: 100, r: 40, type: 'warn', label: 'Pest Infestation Risk' });
  }

  // A sleek geometric SVG representation of a farm field
  return (
    <div style={{ position:'relative', width:'100%', height:240, background:'#203023', borderRadius:'inherit', overflow:'hidden' }}>
      
      {/* Background grid */}
      <div style={{
        position:'absolute', inset:0, opacity:0.1,
        backgroundImage: 'linear-gradient(#4ADE80 1px, transparent 1px), linear-gradient(90deg, #4ADE80 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="healthy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.6)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0)" />
          </radialGradient>
          <radialGradient id="stress" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(239,68,68,0.8)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0)" />
          </radialGradient>
          <radialGradient id="warn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(249,115,22,0.7)" />
            <stop offset="100%" stopColor="rgba(249,115,22,0)" />
          </radialGradient>
        </defs>

        {/* The geometric field shape */}
        <polygon points="40,20 360,40 380,210 20,190" fill="#2d6a1f" stroke="#1a3d0e" strokeWidth="2" />
        
        {/* Field sector lines */}
        <line x1="200" y1="30" x2="200" y2="200" stroke="#1a3d0e" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="30" y1="105" x2="370" y2="125" stroke="#1a3d0e" strokeWidth="1" strokeDasharray="4 4" />

        {/* Base healthy layer */}
        <circle cx="100" cy="100" r="60" fill="url(#healthy)" filter="url(#glow)" />
        <circle cx="260" cy="120" r="80" fill="url(#healthy)" filter="url(#glow)" />
        <circle cx="300" cy="60" r="40" fill="url(#healthy)" filter="url(#glow)" />

        {/* Dynamic Risk Overlay */}
        {risks.map((risk, i) => (
          <circle
            key={i}
            cx={risk.cx}
            cy={risk.cy}
            r={risk.r}
            fill={`url(#${risk.type})`}
            filter="url(#glow)"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              const rect = e.currentTarget.parentElement.getBoundingClientRect();
              setActiveRisk({ label: risk.label, x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
          />
        ))}
      </svg>
      
      {/* Interactive Tooltip Overlay */}
      {activeRisk && (
        <div style={{
          position: 'absolute',
          left: activeRisk.x,
          top: activeRisk.y,
          transform: 'translate(-50%, -100%)',
          background: 'var(--cs-card)',
          border: '1px solid var(--cs-border)',
          color: 'var(--cs-danger)',
          padding: '8px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 20,
          marginTop: '-12px',
          pointerEvents: 'none'
        }}>
          ⚠️ {activeRisk.label}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid var(--cs-border)',
          }} />
        </div>
      )}

      {/* Dismiss label on click elsewhere */}
      {activeRisk && (
        <div 
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          onClick={() => setActiveRisk(null)}
        />
      )}
      
      {/* Scanning Laser Animation */}
      <div className="laser-scan" />
      <style>{`
        .laser-scan {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(74, 222, 128, 0.6); box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
          animation: scan 3s linear infinite; z-index: 10; opacity: 0.7;
        }
        @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEFT PANEL — Reverting to normal theme with premium spacing
══════════════════════════════════════════════════════════════════ */
function LeftPanel({ farm, onNavigate }) {
  const { state } = useCropSentinel();
  const { t }     = useI18n();
  const crisis    = state.isCrisisActive && farm.id === 'north';
  const score     = crisis ? 32 : farm.health;
  const ndvi      = crisis ? '0.21' : farm.ndvi;
  const moisture  = crisis ? 'Low'  : farm.moisture;
  const ringColor = crisis ? '#EF4444' : farm.ringColor;
  const data      = TRENDS[farm.id];

  const statusLabel = crisis ? 'Critical'    : score >= 80 ? t('healthy')     : t('drought_risk');
  const statusBg    = crisis ? '#FEE2E2'     : score >= 80 ? '#DCFCE7'        : '#FEF3C7';
  const statusColor = crisis ? '#DC2626'     : score >= 80 ? '#16A34A'        : '#D97706';

  const r    = 54;
  const circ = 2 * Math.PI * r;
  const off  = circ - circ * score / 100;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>

      {/* Crop Type */}
      <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px' }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>
            {t('crop_type')}
          </p>
          <p style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{farm.crop}</p>
        </div>
        <img src={farm.img} alt={farm.crop} style={{ width:72, height:72, objectFit:'contain', opacity:0.9, flexShrink:0 }} />
      </div>

      {/* Health Score */}
      <div style={{ ...card, padding:'20px' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 16px', textAlign:'center' }}>
          {t('health_score')}
        </p>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="130" height="130" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r={r} strokeWidth="10" stroke="var(--cs-border)" fill="transparent" />
              <circle cx="65" cy="65" r={r} strokeWidth="10"
                stroke={ringColor} fill="transparent"
                strokeDasharray={circ} strokeDashoffset={off}
                strokeLinecap="round" />
            </svg>
            <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
              <span style={{ fontSize:40, fontWeight:900, color:'var(--cs-text)', lineHeight:1, display:'block' }}>{score}</span>
              <span style={{ fontSize:13, color:'var(--cs-text-muted)', fontWeight:500 }}>/100</span>
            </div>
          </div>
          <span style={{ fontSize:13, fontWeight:700, padding:'6px 20px', borderRadius:999, background:statusBg, color:statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        {[
          { label:'NDVI',           value:ndvi,      color:'var(--cs-accent)' },
          { label:t('moisture'),    value:moisture,  color:moisture==='Low'?'#EF4444':'#60A5FA' },
          { label:t('last_update'), value:'2 hrs ago', color:'var(--cs-text-sec)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background:'var(--cs-card)', borderRadius:16,
            border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)',
            padding:'12px 10px', textAlign:'center',
          }}>
            <p style={{ fontSize:9, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 6px' }}>{label}</p>
            <p style={{ fontSize:14, fontWeight:900, color, margin:0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {(farm.alerts > 0 || crisis) && (
        <div style={{ ...card, background:'#FEF2F2', border:'1px solid #FECACA', display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Activity size={18} style={{ color:'#fff' }} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:'#991B1B', margin:0 }}>Drought Risk Detected</p>
            <p style={{ fontSize:12, color:'#B91C1C', margin:'4px 0 0', fontWeight:500 }}>Moisture level critically low</p>
          </div>
        </div>
      )}

      {/* NDVI Trend */}
      <div style={{ ...card, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{t('ndvi_trend')}</p>
          <span style={{ fontSize:18, fontWeight:900, color:'var(--cs-accent)' }}>{ndvi}</span>
        </div>
        <div style={{ height:80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.ndvi} margin={{ top:4, right:4, left:-32, bottom:0 }}>
              <YAxis domain={['dataMin - 0.05','dataMax + 0.05']} hide />
              <XAxis dataKey="d" tick={{ fontSize:9, fill:'var(--cs-text-muted)', fontWeight:500 }} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="v" stroke={ringColor} strokeWidth={3} dot={{ r:4, fill:ringColor, strokeWidth:0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intervention button */}
      <button
        onClick={() => onNavigate('intervention')}
        style={{
          width:'100%', background:'var(--cs-accent)', color:'#FFFFFF',
          fontWeight:800, fontSize:16, padding:'18px', borderRadius:20,
          border:'none', cursor:'pointer',
          boxShadow:'0 8px 24px rgba(74,124,89,0.35)',
          fontFamily:'inherit', marginTop: 'auto',
          transition: 'all 0.2s ease',
        }}
      >
        {t('view_intervention')}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RIGHT PANEL — Satellite heatmap + coordinates + NDVI bar
══════════════════════════════════════════════════════════════════ */
function RightPanel({ farm }) {
  const { state } = useCropSentinel();
  const { t } = useI18n();
  const crisis    = state.isCrisisActive && farm.id === 'north';
  const ndvi      = crisis ? '0.21' : farm.ndvi;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>

      {/* Satellite View card */}
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px 10px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>
            Live Field Scan <span style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:500 }}>(Coming D2)</span>
          </p>
          <ExternalLink size={14} style={{ color:'var(--cs-text-muted)', cursor:'pointer' }} />
        </div>

        {/* High-quality SVG Field Map */}
        <FieldHeatmap ndviScore={farm.ndvi} crisis={crisis} health={farm.health} />

        {/* Legend */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)' }}>Low Health</span>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)' }}>High Health</span>
        </div>
        <div style={{ height:4, width:'100%', background:'linear-gradient(to right, #EF4444, #F59E0B, #10B981)' }} />
      </div>

      {/* GPS Card */}
      <div style={{ ...card, display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
        <div style={{ width:40, height:40, borderRadius:12, background:'var(--cs-bg)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <MapPin size={18} style={{ color:'var(--cs-text-sec)' }} />
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>Farm Coordinates</p>
          <p style={{ fontSize:15, fontWeight:800, color:'var(--cs-text)', margin:0, fontFamily:'monospace' }}>22.2887°N, 73.3634°E</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN SCREEN WRAPPER
══════════════════════════════════════════════════════════════════ */
export default function FarmsScreen({ onNavigate }) {
  const { state } = useCropSentinel();
  const { t } = useI18n();

  // "north" or "south"
  const farmId = state.currentFarm || 'north';
  const isNorth = farmId === 'north';

  const farmData = {
    id: farmId,
    crop: isNorth ? 'Wheat' : 'Rice',
    img: isNorth ? wheatImg : riceImg,
    health: isNorth ? 72 : 94,
    ndvi: isNorth ? '0.61' : '0.81',
    moisture: isNorth ? 'Low' : 'Optimal',
    alerts: isNorth ? 1 : 0,
    ringColor: isNorth ? '#F59E0B' : '#10B981',
  };

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      
      {/* ── Header ── */}
      <div style={{
        flexShrink:0,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
        paddingBottom: '12px',
        background:'var(--cs-bg)', borderBottom:'1px solid var(--cs-border-soft)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <button onClick={() => onNavigate('farms')}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <ArrowLeft size={18} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>

        <div style={{ background:'var(--cs-card)', borderRadius:'20px', padding:'6px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 2px 8px var(--cs-shadow)', border:'1px solid var(--cs-border-soft)' }}>
          <img src={farmData.img} alt="" style={{ width:16, height:16 }} />
          <div style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:13, fontWeight:800, color:'var(--cs-text)', lineHeight:1.2 }}>{isNorth ? 'North Field' : 'South Field'}</span>
            <span style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:600 }}>{farmData.crop}</span>
          </div>
        </div>

        <button style={{ width:36, height:36, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <Share2 size={16} strokeWidth={2} style={{ color:'var(--cs-text-sec)' }} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="desktop-split desktop-split-2-1" style={{ flex:1, overflowY:'auto', padding:'20px', gap:'20px', WebkitOverflowScrolling:'touch' }}>
        <div style={{ paddingBottom: 20 }}>
          <LeftPanel farm={farmData} onNavigate={onNavigate} />
        </div>
        <div style={{ paddingBottom: 40 }}>
          <RightPanel farm={farmData} />
        </div>
      </div>
    </div>
  );
}
