import React from 'react';
import { useI18n } from '../I18nContext';

import { Search, Plus, Droplets, Trash2 } from 'lucide-react';
import { useCropSentinel } from '../state/AppContext';
import { fetchFarms, analyzeFarm, deleteFarmApi } from '../services/api';
import { getHealthStatus } from '../utils/health';
import wheatImg from '../assets/wheat.png';
import riceImg from '../assets/rice.png';

function FarmCard({ cropImg, name, crop, area, soilType, badge, badgeBg, badgeColor, score, ringColor, ndvi, moisture, onClick, onDelete }) {
  const r = 22; const circ = 2*Math.PI*r; const offset = circ-(circ*score/100);
  return (
    <div onClick={onClick} style={{
      background:'var(--cs-card)', borderRadius:24, padding:16,
      boxShadow:'0 1px 6px var(--cs-shadow)', border:'1px solid var(--cs-border-soft)',
      marginBottom:12, cursor:onClick?'pointer':'default', position: 'relative'
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:56, height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={cropImg} alt={crop}
            style={{ width:52, height:52, objectFit:'contain', display:'block' }}
            onError={e => { e.target.style.display='none'; }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{name}</p>
          <p style={{ fontSize:11, color:'var(--cs-text-muted)', fontWeight:500, margin:'2px 0 6px' }}>
            {crop} | Area: {area} | Soil: {soilType}
          </p>
          <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:999, fontSize:10, fontWeight:700, background:badgeBg, color:badgeColor }}>{badge}</span>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            <div>
              <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', margin:0 }}>NDVI</p>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{ndvi}</p>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Droplets size={12} style={{ color:'#60A5FA' }} />
              <div>
                <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:600, textTransform:'uppercase', margin:0 }}>Humidity</p>
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
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <Trash2 size={14} color="#DC2626" />
        </button>
      )}
    </div>
  );
}

  export default function FarmsListScreen({ onNavigate }) {
    const { t } = useI18n();
    const { state, setCurrentFarm, setState } = useCropSentinel();
    const [query, setQuery] = React.useState('');
    
    const farms = state.farms || [];
    const loading = state.isLoading;
  
    // Map backend farms to UI cards using real analysis data
    const FARMS = farms.map((f, i) => {
      const score = f.analysis?.satellite?.farm_health_score || 0;
      const status = getHealthStatus(f.analysis);
      const ndviVal = f.analysis?.satellite?.ndvi?.toString() || '--';
      const moistureVal = f.analysis?.weather?.current?.humidity ? `${f.analysis.weather.current.humidity}%` : '--';

      return { 
        id: String(f.id), 
        cropImg: wheatImg, 
        name: f.farm_name || 'Data unavailable', 
        crop: f.crop_type || "Data unavailable",
        area: f.area ? `${f.area} Ac` : "Data unavailable",
        soilType: f.soil_type || "Data unavailable",
        badge: status.label, 
        badgeBg: status.bg, 
        badgeColor: status.color, 
        score: score, 
        ringColor: status.ring, 
        ndvi: ndviVal, 
        moisture: moistureVal, 
        nav: 'farm_detail' 
      };
    });
  
    const filtered = FARMS.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.crop.toLowerCase().includes(query.toLowerCase())
    );

    const handleDeleteFarm = async (farmId) => {
      if (!window.confirm("Are you sure you want to delete this farm?")) return;
      try {
        await deleteFarmApi(farmId);
        setState(prev => ({
          ...prev,
          farms: prev.farms.filter(f => String(f.id) !== String(farmId))
        }));
      } catch (err) {
        console.error("Failed to delete farm", err);
      }
    };

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
            <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', margin:'4px 0 0' }}>{FARMS.length} farms registered</p>
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
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:14, color:'var(--cs-text-muted)', fontWeight:600 }}>Loading your farms...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <p style={{ fontSize:14, color:'var(--cs-text-muted)', fontWeight:600 }}>{query ? t('no_farms_match') : "You have not added any farms yet."}</p>
            </div>
          ) : (
            <div className="desktop-grid-large">
              {filtered.map(f => (
                <FarmCard key={f.id} cropImg={f.cropImg} name={f.name} crop={f.crop}
                  area={f.area} soilType={f.soilType}
                  badge={f.badge} badgeBg={f.badgeBg} badgeColor={f.badgeColor}
                  score={f.score} ringColor={f.ringColor} ndvi={f.ndvi}
                  moisture={f.moisture} trend={f.trend}
                  onClick={f.nav ? () => {
                    setCurrentFarm(f.id);
                    onNavigate(f.nav);
                  } : null}
                  onDelete={() => handleDeleteFarm(f.id)}
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
