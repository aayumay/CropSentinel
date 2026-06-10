import React from 'react';
import { useI18n } from '../I18nContext';

import { Search, Plus, Droplets } from 'lucide-react';
import { useCropSentinel } from '../state/DemoContext';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import wheatImg from '../assets/wheat.png';
import riceImg from '../assets/rice.png';

const trendUp   = [{v:0.52},{v:0.54},{v:0.51},{v:0.58},{v:0.61}];
const trendDown = [{v:0.52},{v:0.50},{v:0.45},{v:0.38},{v:0.21}];

function FarmCard({ cropImg, name, crop, badge, badgeBg, badgeColor, score, ringColor, ndvi, moisture, trend, onClick }) {
  const r = 22; const circ = 2*Math.PI*r; const offset = circ-(circ*score/100);
  return (
    <div onClick={onClick} style={{
      background:'var(--cs-card)', borderRadius:24, padding:16,
      boxShadow:'0 1px 6px var(--cs-shadow)', border:'1px solid var(--cs-border-soft)',
      marginBottom:12, cursor:onClick?'pointer':'default',
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:56, height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={cropImg} alt={crop}
            style={{ width:52, height:52, objectFit:'contain', display:'block' }}
            onError={e => { e.target.style.display='none'; }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{name}</p>
          <p style={{ fontSize:11, color:'var(--cs-text-muted)', fontWeight:500, margin:'2px 0 6px' }}>{crop}</p>
          <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:999, fontSize:10, fontWeight:700, background:badgeBg, color:badgeColor }}>{badge}</span>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            <div>
              <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', margin:0 }}>NDVI</p>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{ndvi}</p>
            </div>
            <div style={{ width:48, height:24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}><YAxis domain={['dataMin','dataMax']} hide />
                  <Line type="monotone" dataKey="v" stroke={ringColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Droplets size={12} style={{ color:'#60A5FA' }} />
              <div>
                <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', margin:0 }}>Moisture</p>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{moisture}</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width:56, height:56, position:'relative', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="56" height="56" style={{ transform:'rotate(-90deg)', position:'absolute', top:0, left:0 }}>
            <circle cx="28" cy="28" r={r} strokeWidth="4" stroke="#F0EDE6" fill="transparent" />
            <circle cx="28" cy="28" r={r} strokeWidth="4" stroke={ringColor} fill="transparent"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:1 }}>
            <span style={{ fontSize:17, fontWeight:900, color:'var(--cs-text)', lineHeight:1 }}>{score}</span>
            <span style={{ fontSize:8, color:'var(--cs-text-muted)', fontWeight:600 }}>/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

  export default function FarmsListScreen({ onNavigate }) {
    const { t } = useI18n();
    const { state, setCurrentFarm } = useCropSentinel();
    const crisis = state.isCrisisActive;
    const [query, setQuery] = React.useState('');
  
    const FARMS = [
      { id:'north', cropImg:wheatImg, name:t('north_field'), crop:t('wheat'), badge:crisis ? t('drought_risk') : t('healthy'), badgeBg:crisis ? '#FEE2E2' : '#F0FDF4', badgeColor:crisis ? '#DC2626' : '#16A34A', score:crisis?32:72, ringColor:crisis?'#EF4444':'#EA580C', ndvi:crisis?'0.21':'0.61', moisture:crisis ? t('low') : t('optimal'), trend:crisis?trendDown:trendUp, nav:'farm_detail' },
      { id:'south', cropImg:riceImg,  name:t('south_field'), crop:t('rice'),  badge:t('healthy'), badgeBg:'#F0FDF4', badgeColor:'#16A34A', score:88, ringColor:'#22C55E', ndvi:'0.72', moisture:t('optimal'), trend:[{v:0.60},{v:0.63},{v:0.68},{v:0.70},{v:0.72}], nav:'farm_detail' },
    ];
  
    const filtered = FARMS.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.crop.toLowerCase().includes(query.toLowerCase())
    );
    return (
      <div className="dashboard-container" style={{ background:'var(--cs-bg)', minHeight:'100%', paddingBottom:24 }}>
        <div style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)',
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
          paddingBottom: '12px',
          display:'flex', justifyContent:'space-between', alignItems:'center'
        }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{t('my_farms')}</h1>
            <p style={{ fontSize:11, fontWeight:700, color:'#DC2626', margin:'4px 0 0' }}>{t('farms_alert').replace('{n}', 2).replace('{a}', 1)}</p>
          </div>
        </div>
        {/* Search */}
        <div style={{ margin:'0 20px 16px', position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--cs-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search_farms')}
            style={{ width:'100%', background:'var(--cs-card)', border:'1px solid var(--cs-border)', borderRadius:16, paddingLeft:36, paddingRight:16, paddingTop:12, paddingBottom:12, fontSize:13, color:'var(--cs-text)', outline:'none', boxSizing:'border-box', boxShadow:'0 1px 4px var(--cs-shadow)', fontFamily:'inherit' }}
          />
        </div>
        <div style={{ padding:'0 20px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:14, color:'var(--cs-text-muted)', fontWeight:600 }}>{t('no_farms_match')}</p>
            </div>
          ) : (
            <div className="desktop-grid-large">
              {filtered.map(f => (
                <FarmCard key={f.id} cropImg={f.cropImg} name={f.name} crop={f.crop}
                  badge={f.badge} badgeBg={f.badgeBg} badgeColor={f.badgeColor}
                  score={f.score} ringColor={f.ringColor} ndvi={f.ndvi}
                  moisture={f.moisture} trend={f.trend}
                  onClick={f.nav ? () => {
                    setCurrentFarm(f.id);
                    onNavigate(f.nav);
                  } : null}
                />
              ))}
            </div>
          )}
        <button onClick={() => onNavigate('add_field')} style={{
          width:'100%', maxWidth: 400, margin: '16px auto 0',
          background:'var(--cs-accent)', color:'white', fontWeight:700,
          fontSize:14, padding:'14px 24px', borderRadius:16, border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          fontFamily:'inherit'
        }}>
          <Plus size={16} strokeWidth={2.5} /> {t('add_new_field')}
        </button>
      </div>
    </div>
  );
}
