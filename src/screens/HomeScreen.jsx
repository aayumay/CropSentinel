import React from 'react';
import { useI18n } from '../I18nContext';

import { Bell, Plus, Droplets, Wind, Cloud, Thermometer } from 'lucide-react';
import { useCropSentinel } from '../state/DemoContext';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// Direct URL imports so images always load on any device/network
import wheatImg from '../assets/wheat.png';
import riceImg from '../assets/rice.png';

const trendUp   = [{v:0.52},{v:0.54},{v:0.51},{v:0.58},{v:0.61}];
const trendDown = [{v:0.52},{v:0.50},{v:0.45},{v:0.38},{v:0.21}];

function WeatherBadge({ icon: Icon, value, label, color }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
      <Icon size={18} strokeWidth={1.8} style={{ color }} />
      <span style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)' }}>{value}</span>
      <span style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:500 }}>{label}</span>
    </div>
  );
}

function FarmCard({ cropImg, name, crop, badge, badgeBg, badgeColor, score, ringColor, ndvi, moisture, trend, onClick }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score / 100);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--cs-card)',
        borderRadius: 24,
        padding: '16px',
        boxShadow: '0 1px 6px var(--cs-shadow)',
        border: '1px solid var(--cs-border-soft)',
        marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        {/* Crop image */}
        <div style={{ width:56, height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img
            src={cropImg}
            alt={crop}
            style={{ width:52, height:52, objectFit:'contain', display:'block' }}
            onError={(e) => { e.target.style.display='none'; }}
          />
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--cs-text)', margin:0, lineHeight:1.2 }}>{name}</p>
          <p style={{ fontSize:11, color:'var(--cs-text-muted)', fontWeight:500, margin:'2px 0 6px' }}>{crop}</p>
          <span style={{
            display:'inline-block',
            padding:'2px 10px',
            borderRadius:999,
            fontSize:10,
            fontWeight:700,
            background:badgeBg,
            color:badgeColor,
          }}>
            {badge}
          </span>

          {/* NDVI + sparkline + moisture */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            <div>
              <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>NDVI</p>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{ndvi}</p>
            </div>
            <div style={{ width:48, height:24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <YAxis domain={['dataMin','dataMax']} hide />
                  <Line type="monotone" dataKey="v" stroke={ringColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Droplets size={12} style={{ color:'#60A5FA' }} />
              <div>
                <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>Moisture</p>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{moisture}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health ring */}
        <div style={{ width:56, height:56, position:'relative', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="56" height="56" style={{ transform:'rotate(-90deg)', position:'absolute', top:0, left:0 }}>
            <circle cx="28" cy="28" r={r} strokeWidth="4" stroke="var(--cs-border)" fill="transparent" />
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

export default function HomeScreen({ onNavigate }) {
  const { t } = useI18n();
  const { state } = useCropSentinel();
  const crisis = state.isCrisisActive;

  return (
    <div className="dashboard-container" style={{ background:'var(--cs-bg)', minHeight:'100%', paddingBottom:24 }}>

      {/* Header */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
        paddingBottom: '16px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start'
      }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1.2 }}>
            {t('good_morning')}<br />{t('farmer')}
          </h1>
          <p style={{ fontSize:11, color:'var(--cs-text-muted)', fontWeight:500, margin:'4px 0 0' }}>{t('heres_whats')}</p>
        </div>
        <button
          onClick={() => onNavigate('alerts')}
          style={{
            width:36, height:36, borderRadius:'50%',
            background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', position:'relative',
            boxShadow:'0 1px 4px var(--cs-shadow-md)',
          }}
        >
          <Bell size={16} strokeWidth={1.8} style={{ color:'var(--cs-text-sec)' }} />
          <span style={{
            position:'absolute', top:6, right:6,
            width:8, height:8, background:'#EF4444',
            borderRadius:'50%', border:'2px solid var(--cs-card)',
          }} />
        </button>
      </div>

      {/* Weather strip */}
      <div style={{
        margin:'0 20px 16px',
        background:'var(--cs-card)',
        borderRadius:20,
        padding:'14px 20px',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        boxShadow:'0 1px 6px var(--cs-shadow)',
        border:'1px solid var(--cs-border-soft)',
      }}>
        <WeatherBadge icon={Thermometer} value="31°C"    label={t('temp')}        color="#EF4444" />
        <WeatherBadge icon={Droplets}    value="56%"     label={t('humidity')}    color="#60A5FA" />
        <WeatherBadge icon={Cloud}       value="10%"     label={t('rain_chance')} color="#93C5FD" />
        <WeatherBadge icon={Wind}        value="18 km/h" label={t('wind')}        color="#6EE7B7" />
      </div>

      {/* My Farms */}
      <div style={{ padding:'0 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{t('my_farms')}</h2>
            <p style={{ fontSize:11, fontWeight:700, color:'#DC2626', margin:'2px 0 0' }}>{t('farms_alert').replace('{n}', 2).replace('{a}', 1)}</p>
          </div>
        </div>

        <div className="desktop-grid-large">
          <FarmCard
            cropImg={wheatImg}
            name={t('north_field')}
            crop={t('wheat')}
            badge={crisis ? t('drought_risk') : t('healthy')}
            badgeBg={crisis ? "#FEE2E2" : "#F0FDF4"}
            badgeColor={crisis ? "#DC2626" : "#16A34A"}
            score={crisis ? 32 : 72}
            ringColor={crisis ? '#EF4444' : '#EA580C'}
            ndvi={crisis ? '0.21' : '0.61'}
            moisture={crisis ? t('low') : t('optimal')}
            trend={crisis ? trendDown : trendUp}
            onClick={() => onNavigate('farm_detail')}
          />

          <FarmCard
            cropImg={riceImg}
            name={t('south_field')}
            crop={t('rice')}
            badge={t('healthy')}
            badgeBg="#F0FDF4"
            badgeColor="#16A34A"
            score={88}
            ringColor="#16A34A"
            ndvi="0.72"
            moisture={t('optimal')}
            trend={trendUp}
            onClick={() => onNavigate('farm_detail')}
          />
        </div>

        {/* Add New Field */}
        <button
          onClick={() => onNavigate('add_field')}
          style={{
            width:'100%',
            maxWidth: 400,
            margin: '16px auto 0',
            background:'var(--cs-accent)',
            color:'#FFFFFF',
            fontWeight:700,
            fontSize:14,
            padding:'14px 24px',
            borderRadius:16,
            border:'none',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:8,
            fontFamily:'inherit',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('add_new_field')}
        </button>
      </div>
    </div>
  );
}
