import React, { useState } from 'react';
import { ArrowLeft, Save, X, Leaf, MapPin, Pencil, Check, Bell } from 'lucide-react';
import farmBanner from '../assets/farm-illustration-banner.png';
import { useCropSentinel } from '../state/AppContext';
import { formatArea } from '../utils/units';

/* ─── Edit-mode modal sheet ─────────────────────────────────────────────── */
function EditModal({ farmName, setFarmName, location, setLocation, area, setArea, onClose, onSave, saved }) {
  return (
    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:420, margin:'0 auto', background:'var(--cs-card)', borderRadius:'28px 28px 0 0', padding:'24px 20px 40px', boxShadow:'0 -4px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ width:40, height:4, background:'var(--cs-border)', borderRadius:2, margin:'0 auto 20px' }} />
        <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-accent)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:16 }}>
          Edit Farm Information
        </p>
        {[
          { label:'Farm Name',    val:farmName,  set:setFarmName },
          { label:'Location',     val:location,  set:setLocation },
          { label:'Area (acres)', val:area,      set:setArea     },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--cs-text-sec)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>
              {f.label}
            </label>
            <input value={f.val} onChange={e => f.set(e.target.value)}
              style={{ width:'100%', background:'var(--cs-bg)', border:'1.5px solid var(--cs-border)', borderRadius:12, padding:'11px 14px', fontSize:14, color:'var(--cs-text)', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
              onFocus={e => e.target.style.borderColor='var(--cs-accent)'}
              onBlur={e  => e.target.style.borderColor='var(--cs-border)'}
            />
          </div>
        ))}
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'13px', borderRadius:14, border:'1.5px solid var(--cs-border)', background:'var(--cs-bg)', fontSize:14, fontWeight:700, color:'var(--cs-text-sec)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit' }}>
            <X size={15} /> Cancel
          </button>
          <button onClick={onSave}
            style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background: saved ? '#16A34A' : 'var(--cs-accent)', fontSize:14, fontWeight:700, color:'#FFFFFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background 0.3s', fontFamily:'inherit' }}>
            <Save size={15} /> {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main screen ───────────────────────────────────────────────────────── */
export default function FarmDetailsConfigScreen({ onNavigate }) {
  const { state, setState } = useCropSentinel();
  const profile = state.profileData || {};
  
  // Real dynamic data from AppContext & local polyfill
  const farms = state.farms || [];
  const numFarms = farms.length;
  
  // The polyfill in api.js injects area. If none exists, it defaults to 0.
  const calculatedArea = farms.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);
  const displayAreaStr = calculatedArea > 0 ? formatArea(calculatedArea, state.preferences?.units) : null;
  
  let activeAlerts = 0;
  let overallNdvi = '--';
  let overallSoil = 'Unavailable';

  if (numFarms > 0) {
    farms.forEach(f => {
      const data = f.analysis;
      if (data?.intervention?.priority === 'HIGH' || data?.risk?.risk_level === 'CRITICAL') {
        activeAlerts++;
      }
    });
    
    const firstAnalysis = farms[0].analysis;
    if (firstAnalysis) {
       overallNdvi = firstAnalysis.satellite?.ndvi !== undefined ? firstAnalysis.satellite.ndvi : '--';
       overallSoil = firstAnalysis.satellite?.status ? (firstAnalysis.satellite.status.charAt(0).toUpperCase() + firstAnalysis.satellite.status.slice(1)) : 'Unavailable';
    }
  }

  const [isEditing, setIsEditing] = useState(false);
  const [farmName,  setFarmName]  = useState(profile.name ? profile.name + "'s Farm" : "My Farm");
  const [location,  setLocation]  = useState(profile.location || 'Unknown Location');
  const [area,      setArea]      = useState(calculatedArea || '');
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => {
    // Save location to profile
    setState(prev => ({
      ...prev,
      profileData: { ...prev.profileData, location: location }
    }));
    const currentProfile = JSON.parse(localStorage.getItem('cs_profile') || '{}');
    currentProfile.location = location;
    localStorage.setItem('cs_profile', JSON.stringify(currentProfile));

    // Fix missing area via polyfill
    const parsedArea = parseFloat(area);
    if (!isNaN(parsedArea) && parsedArea > 0 && farms.length > 0) {
      const farmsMissingArea = farms.filter(f => !f.area || parseFloat(f.area) === 0);
      if (farmsMissingArea.length > 0) {
        const areaPerFarm = parsedArea / farmsMissingArea.length;
        const polyfillMeta = JSON.parse(localStorage.getItem('cs_farm_meta') || '{}');
        
        const updatedFarms = [...farms];
        farmsMissingArea.forEach(missingFarm => {
          if (!polyfillMeta[missingFarm.id]) polyfillMeta[missingFarm.id] = {};
          polyfillMeta[missingFarm.id].area = areaPerFarm;
          
          // Update in local state array
          const idx = updatedFarms.findIndex(f => f.id === missingFarm.id);
          if (idx !== -1) updatedFarms[idx].area = areaPerFarm;
        });
        
        localStorage.setItem('cs_farm_meta', JSON.stringify(polyfillMeta));
        setState(prev => ({ ...prev, farms: updatedFarms }));
      }
    }

    setSaved(true);
    setTimeout(() => { setSaved(false); setIsEditing(false); }, 1200);
  };

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      {/* ── Header ── */}
      <div style={{ padding:'24px 0 20px', display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={() => onNavigate('profile')}
          style={{ width:36, height:36, borderRadius:'12px', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <ArrowLeft size={18} strokeWidth={2.5} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:20, fontWeight:900, color:'var(--cs-text)', margin:0 }}>Farm Details</h1>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom: '120px', WebkitOverflowScrolling:'touch' }}>
        <div className="cs-grid">
          
          {/* Farm Summary Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#E0F2FE' }}>
                <MapPin size={18} color="#0284C7" />
              </div>
              <h3 className="cs-card-title">Farm Summary</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <p style={tileLabelStyle}>Fields</p>
                <p style={{ ...tileValueStyle, color:'var(--cs-text)' }}>{numFarms}</p>
              </div>
              <div>
                <p style={tileLabelStyle}>Area</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  {displayAreaStr ? (
                    <>
                      <p style={{ ...tileValueStyle, color:'var(--cs-text)' }}>{displayAreaStr.split(' ')[0]}</p>
                      <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:600 }}>{displayAreaStr.split(' ')[1] || 'Acres'}</p>
                    </>
                  ) : (
                    <p style={{ fontSize:12, fontWeight:700, color:'var(--cs-text-muted)' }}>Unavailable</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#D1FAE5' }}>
                <Leaf size={18} color="#059669" />
              </div>
              <h3 className="cs-card-title">Soil Health</h3>
            </div>
            <p style={{ ...tileValueStyle, color:'var(--cs-text)' }}>{overallSoil}</p>
            <p style={{ fontSize:12, color:'var(--cs-text-muted)', fontWeight:600, marginTop:4 }}>Aggregated from {numFarms} fields</p>
          </div>

          {/* NDVI Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#EDE9FE' }}>
                <Leaf size={18} color="#8B5CF6" />
              </div>
              <h3 className="cs-card-title">Average NDVI</h3>
            </div>
            <p style={{ ...tileValueStyle, color:'var(--cs-text)' }}>{overallNdvi}</p>
            <p style={{ fontSize:12, color:'var(--cs-text-muted)', fontWeight:600, marginTop:4 }}>Latest satellite scan</p>
          </div>

          {/* Alerts & Risk Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: activeAlerts > 0 ? '#FEE2E2' : '#F1F5F9' }}>
                <Bell size={18} color={activeAlerts > 0 ? '#DC2626' : '#64748B'} />
              </div>
              <h3 className="cs-card-title">Active Alerts</h3>
            </div>
            <p style={{ ...tileValueStyle, color: activeAlerts > 0 ? '#DC2626' : 'var(--cs-text)' }}>{activeAlerts}</p>
            <p style={{ fontSize:12, color:'var(--cs-text-muted)', fontWeight:600, marginTop:4 }}>Fields requiring attention</p>
          </div>

        </div>

        {/* ── Bottom button ── */}
        <div style={{ marginTop:24 }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              width:'100%', background:'var(--cs-accent)', color:'#FFFFFF',
              fontWeight:800, fontSize:15, padding:'16px',
              borderRadius:18, border:'none', cursor:'pointer',
              boxShadow:'0 4px 18px rgba(74,124,89,0.35)',
              fontFamily:'inherit', letterSpacing:'0.1px',
            }}
          >
            Edit Farm Properties
          </button>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {isEditing && (
        <EditModal
          farmName={farmName} setFarmName={setFarmName}
          location={location} setLocation={setLocation}
          area={area}         setArea={setArea}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
          saved={saved}
        />
      )}
    </div>
  );
}

/* ─── Shared tile styles ─────────────────────────────────────────────────── */
const tileLabelStyle = {
  fontSize:11, fontWeight:700, color:'var(--cs-text-muted)',
  textTransform:'uppercase', letterSpacing:'0.05em',
  margin:'0 0 4px', lineHeight:1.3,
};

const tileValueStyle = {
  fontSize:24, fontWeight:900, margin:0, lineHeight:1,
};
