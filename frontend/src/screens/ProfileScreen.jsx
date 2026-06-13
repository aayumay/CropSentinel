import React from 'react';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/AppContext';
import { Camera, ChevronRight, Home, Settings, Bell, HelpCircle, Info, Edit3, LogOut, MapPin, Clock, AlertTriangle, Leaf } from 'lucide-react';
import profileLeaves from '../assets/profile-leaves.png';
import farmerAvatar  from '../assets/farmer-avatar.png';
import { formatArea } from '../utils/units';
import { fetchFarms } from '../services/api';

const MENU = [
  { icon: Home,        labelKey: 'farm_details',          screen: 'farm_details_config' },
  { icon: Settings,    labelKey: 'account_settings',      screen: 'settings'             },
  { icon: Bell,        labelKey: 'notification_settings', screen: 'notification_settings'},
  { icon: HelpCircle,  labelKey: 'help_support',          screen: 'help_support'         },
  { icon: Info,        labelKey: 'about',                 screen: 'about'                },
];

export default function ProfileScreen({ onNavigate }) {
  const { t } = useI18n();
  const { state } = useCropSentinel();
  const profile = state.profileData || {};
  const farms = state.farms || [];
  const numFarms = farms.length;
  
  const calculatedArea = farms.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);
  const displayArea = calculatedArea > 0 ? formatArea(calculatedArea, state.preferences?.units) : null;

  let activeAlerts = 0;
  farms.forEach(f => {
    const data = f.analysis;
    if (data?.intervention?.priority === 'HIGH' || data?.risk?.risk_level === 'CRITICAL') {
      activeAlerts++;
    }
  });

  const name = profile.name || state.user?.name || '';
  const email = profile.email || state.user?.email || '';
  const phone = profile.phone || state.user?.phone || ''; // Fallback for phone
  
  // Location Fallback Logic
  let location = profile.location;
  if (!location && farms.length > 0) {
    const firstFarm = farms[0];
    if (firstFarm.latitude && firstFarm.longitude) {
      location = `Farm at ${parseFloat(firstFarm.latitude).toFixed(2)}, ${parseFloat(firstFarm.longitude).toFixed(2)}`;
    }
  }

  // Last Scan logic
  let lastScan = null; // Do not default to 'Never'
  if (farms.length > 0) {
    const dates = farms
      .filter(f => f.analysis?.satellite?.timestamp)
      .map(f => new Date(f.analysis.satellite.timestamp));
    if (dates.length > 0) {
      const latest = new Date(Math.max(...dates));
      lastScan = latest.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)', paddingBottom:120, overflowY:'auto' }}>
      {/* Header */}
      <div style={{ padding:'24px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{t('profile')}</h1>
        <button onClick={() => onNavigate('edit_profile')}
          style={{ display:'flex', alignItems:'center', gap:5, background:'var(--cs-card)', border:'1px solid var(--cs-border)', borderRadius:12, padding:'7px 12px', fontSize:12, fontWeight:700, color:'var(--cs-accent)', cursor:'pointer' }}>
          <Edit3 size={13} /> {t('edit')}
        </button>
      </div>

      <div className="desktop-split" style={{ padding: '0 20px' }}>
        {/* Left Side: Profile Cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Profile Summary Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#E0F2FE' }}>
                <Camera size={18} color="#0284C7" onClick={() => onNavigate('edit_profile')} style={{cursor:'pointer'}} />
              </div>
              <h3 className="cs-card-title">Profile Summary</h3>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
               <img src={profile.photo || farmerAvatar} alt="Farmer" style={{ width:60, height:60, borderRadius:16, objectFit:'cover', border:'1px solid var(--cs-border-soft)' }} />
               <div>
                 <h2 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px', color:'var(--cs-text)' }}>{name || email || phone || 'CropSentinel User'}</h2>
                 {name && email && <p style={{ fontSize:13, color:'var(--cs-text-muted)', margin:0, fontWeight:600 }}>{email}</p>}
                 {name && !email && phone && <p style={{ fontSize:13, color:'var(--cs-text-muted)', margin:0, fontWeight:600 }}>{phone}</p>}
                 {location && location !== 'Unknown Location' && (
                   <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                     <MapPin size={12} color="var(--cs-text-muted)" />
                     <p style={{ fontSize:12, color:'var(--cs-text-muted)', margin:0, fontWeight:600 }}>{location}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Farm Statistics Card */}
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#D1FAE5' }}>
                <Leaf size={18} color="#059669" />
              </div>
              <h3 className="cs-card-title">Farm Statistics</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
               <div>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>Farms</p>
                  <p style={{ fontSize:24, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{numFarms}</p>
               </div>
               <div>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>Area</p>
                  <p style={{ fontSize:24, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{calculatedArea > 0 ? displayArea.split(' ')[0] : '--'}</p>
               </div>
               <div>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>Alerts</p>
                  <p style={{ fontSize:24, fontWeight:900, color: activeAlerts > 0 ? '#DC2626' : 'var(--cs-text)', margin:0 }}>{activeAlerts}</p>
               </div>
            </div>
            {lastScan && (
              <p style={{ fontSize:12, color:'var(--cs-text-muted)', margin:'16px 0 0 0', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <Clock size={12} /> Last Scan: {lastScan}
              </p>
            )}
          </div>

          {/* Incomplete Profile Banner (Kept as alert style) */}
          {calculatedArea === 0 && farms.length > 0 && (
            <div style={{ background:'var(--cs-danger-light)', borderRadius:16, padding:16, border:'1px solid var(--cs-danger-border)', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <AlertTriangle size={18} color="var(--cs-danger)" style={{ marginTop:2, flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:'var(--cs-danger)', margin:'0 0 4px' }}>Incomplete Profile</p>
                  <p style={{ fontSize:12, color:'var(--cs-text)', margin:0, lineHeight:1.4 }}>Some of your farms are missing acreage data. This severely degrades analysis accuracy.</p>
                </div>
              </div>
              <button onClick={() => onNavigate('farm_details_config')}
                style={{ alignSelf:'flex-start', background:'var(--cs-danger)', color:'white', border:'none', borderRadius:10, padding:'8px 16px', fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                Update Now <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

      {/* Right Side: Menu & Logout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Menu */}
        <div style={{ background:'var(--cs-card)', borderRadius:24, border:'1px solid var(--cs-border-soft)', overflow:'hidden', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
        {MENU.map(({ icon: Icon, labelKey, screen }, i) => (
          <button key={labelKey} onClick={() => onNavigate(screen)}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 16px', borderBottom: i < MENU.length-1 ? '1px solid var(--cs-bg)' : 'none', background:'none', cursor:'pointer', transition:'background 0.15s', fontFamily:'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--cs-bg)'}
            onMouseLeave={e => e.currentTarget.style.background='none'}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:34, height:34, background:'var(--cs-accent-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={16} strokeWidth={1.8} style={{ color:'var(--cs-accent)' }} />
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--cs-text)' }}>{t(labelKey)}</span>
            </div>
            <ChevronRight size={16} style={{ color:'var(--cs-icon-dim)' }} />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div>
        <button
          onClick={() => onNavigate('welcome')}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', background:'var(--cs-danger-light)', border:'1px solid var(--cs-danger-border)', borderRadius:18, fontSize:14, fontWeight:700, color:'var(--cs-danger)', cursor:'pointer', fontFamily:'inherit' }}
        >
          <LogOut size={16} /> {t('log_out')}
        </button>
      </div>
      </div>
      </div>
    </div>
  );
}
