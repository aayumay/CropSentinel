import React, { useState } from 'react';
import { useI18n } from '../I18nContext';

import { Bell, X, ChevronRight, Droplets, Sun, Leaf, Thermometer, Wind, Clock, Trash2 } from 'lucide-react';

const ALL_ALERTS = [
  {
    id: 1, icon: Droplets, iconColor:'#DC2626', bg:'#FFF5F5',
    field:'North Field', time:'3 hrs ago', category:'Active',
    title:'🚨 Drought risk is high',
    body:'Moisture level is critically low. Irrigate immediately to prevent crop damage.',
    details: 'Soil moisture has dropped to 18% — critically below the 35% threshold for wheat. Without irrigation within the next 24–36 hours, you risk a 40–60% yield reduction. Recommended action: Apply drip irrigation at 6mm/hour for at least 3 hours.',
    recommendation: 'Irrigate immediately — apply 6mm/hr drip for 3 hours.',
    unread: true,
  },
  {
    id: 2, icon: Thermometer, iconColor:'#D97706', bg:'#FFFBEB',
    field:'Weather Alert', time:'6 hrs ago', category:'Active',
    title:'🌡️ Heat stress risk tomorrow',
    body:'Temperature forecast exceeds 42°C. Consider shade netting.',
    details: 'Maximum temperature will exceed 42°C over the next 3 days. High temperatures combined with low soil moisture can accelerate drought stress. Shade netting or temporary canopy cover is advised, especially for younger seedlings.',
    recommendation: 'Apply shade netting or schedule irrigation during cooler hours (5–7 AM).',
    unread: true,
  },
  {
    id: 3, icon: Leaf, iconColor:'#16A34A', bg:'#F0FDF4',
    field:'South Field', time:'1 day ago', category:'History',
    title:'✅ NDVI improving',
    body:'Your crop health index is improving steadily.',
    details: 'NDVI has risen from 0.61 to 0.72 over the past 7 days, indicating strong canopy growth and chlorophyll production. Continue current irrigation schedule and monitor for pest activity.',
    recommendation: 'Continue current schedule. No action required.',
    unread: false,
  },
  {
    id: 4, icon: Sun, iconColor:'#D97706', bg:'#FFFBEB',
    field:'Weather Alert', time:'2 days ago', category:'History',
    title:'☀️ High temperature expected',
    body:'Temperatures over 40°C forecast for 3 days.',
    details: 'Historical alert: High temperatures were forecasted and observed. Irrigation was adjusted successfully. Yield impact was minimal.',
    recommendation: 'Resolved. No further action needed.',
    unread: false,
  },
  {
    id: 5, icon: Wind, iconColor:'#6366F1', bg:'#EEF2FF',
    field:'North Field', time:'4 days ago', category:'History',
    title:'💨 Strong winds forecast',
    body:'Wind speeds up to 45 km/h expected. Secure equipment.',
    details: 'Wind speeds of 40–45 km/h were recorded. No structural damage was reported. Sprinkler irrigation was paused during peak wind hours to avoid drift.',
    recommendation: 'Resolved. Equipment secured successfully.',
    unread: false,
  },
];

function AlertDetailModal({ alert, onClose }) {
  const Icon = alert.icon;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
      padding: '20px'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth: 500, background:'var(--cs-bg)',
          borderRadius:28,
          padding:'28px 24px',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >

        {/* Icon + Title */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:alert.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={20} strokeWidth={2} style={{ color:alert.iconColor }} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:800, color:'var(--cs-text)', margin:0, lineHeight:1.3 }}>{alert.title}</p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
              <Clock size={11} style={{ color:'var(--cs-text-muted)' }} />
              <span style={{ fontSize:11, color:'var(--cs-text-muted)' }}>{alert.field} · {alert.time}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'var(--cs-card-alt)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={16} style={{ color:'var(--cs-text-sec)' }} />
          </button>
        </div>

        {/* Full details */}
        <div style={{ background:'var(--cs-card)', borderRadius:20, padding:16, marginBottom:12, border:'1px solid var(--cs-border-soft)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Full Details</p>
          <p style={{ fontSize:13, color:'var(--cs-text-sec)', lineHeight:1.6, margin:0 }}>{alert.details}</p>
        </div>

        {/* Recommendation */}
        <div style={{ background:'var(--cs-accent-light)', borderRadius:20, padding:16, border:'1px solid #C6E0CC' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-accent)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Recommendation</p>
          <p style={{ fontSize:13, color:'var(--cs-text)', fontWeight:600, margin:0, lineHeight:1.5 }}>{alert.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

export default function AlertsScreen() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState(ALL_ALERTS);
  const [activeTab, setActiveTab] = useState('Active'); // 'Active' | 'History'
  const [selectedAlert, setSelectedAlert] = useState(null);

  const activeAlerts  = alerts.filter(a => a.category === 'Active');
  const historyAlerts = alerts.filter(a => a.category === 'History');
  const displayed = activeTab === 'Active' ? activeAlerts : historyAlerts;
  const unreadCount = activeAlerts.filter(a => a.unread).length;

  const clearActive = () => setAlerts(prev => prev.filter(a => a.category !== 'Active'));
  const dismissOne  = (id, e) => { e.stopPropagation(); setAlerts(prev => prev.filter(a => a.id !== id)); };

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      {/* Header & Tabs Container */}
      <div className="content-max" style={{ width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ padding:'24px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{t('alerts_title')}</h1>
            {unreadCount > 0
              ? <p style={{ fontSize:11, fontWeight:700, color:'#DC2626', margin:'4px 0 0' }}>{t('unread_alerts').replace('{n}', unreadCount)}</p>
              : <p style={{ fontSize:11, fontWeight:600, color:'var(--cs-text-muted)', margin:'4px 0 0' }}>{t('all_caught_up')}</p>
            }
          </div>
          {activeTab === 'Active' && activeAlerts.length > 0 && (
            <button onClick={clearActive} style={{ display:'flex', alignItems:'center', gap:5, background:'#FFF5F5', border:'1px solid #FEE2E2', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#DC2626', cursor:'pointer' }}>
              <Trash2 size={12} /> {t('clear_all')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, padding:'0 20px 12px' }}>
        {['Active','History'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding:'7px 18px', borderRadius:999, fontSize:12, fontWeight:700, cursor:'pointer', border:'none',
            background: activeTab===tab ? '#4A7C59' : 'white',
            color: activeTab===tab ? 'white' : '#9CA3AF',
            boxShadow: activeTab===tab ? '0 2px 8px rgba(74,124,89,0.3)' : '0 1px 3px var(--cs-shadow)',
          }}>
            {t(tab.toLowerCase())} {tab==='Active' && activeAlerts.length > 0 && `(${activeAlerts.length})`}
          </button>
        ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="content-max" style={{ flex:1, width:'100%', display:'flex', flexDirection:'column', gap:16, padding:'0 20px 32px', margin:'0 auto' }}>
        {displayed.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 0', gap:12 }}>
            <Bell size={40} style={{ color:'#D4D0C8' }} />
            <p style={{ fontSize:14, color:'var(--cs-text-muted)', fontWeight:600, margin:0 }}>{t('no_alerts').replace('{tab}', t(activeTab.toLowerCase()))}</p>
          </div>
        ) : displayed.map(alert => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} onClick={() => setSelectedAlert(alert)}
              style={{ background:'var(--cs-card)', borderRadius:24, padding:14, boxShadow:'0 1px 6px var(--cs-shadow)', border:'1px solid var(--cs-border-soft)', cursor:'pointer', position:'relative' }}>
              {alert.unread && <div style={{ position:'absolute', top:14, right:14, width:8, height:8, background:'#EF4444', borderRadius:'50%' }} />}
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:14, background:alert.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={16} strokeWidth={2} style={{ color:alert.iconColor }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{alert.field}</p>
                    <p style={{ fontSize:10, color:'var(--cs-text-muted)', margin:0 }}>{alert.time}</p>
                  </div>
                  <p style={{ fontSize:13, fontWeight:800, color:'var(--cs-text)', margin:'0 0 2px' }}>{alert.title}</p>
                  <p style={{ fontSize:12, color:'var(--cs-text-sec)', margin:0, lineHeight:1.4 }}>{alert.body}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                  <ChevronRight size={14} style={{ color:'var(--cs-icon-dim)' }} />
                  {alert.category === 'Active' && (
                    <button onClick={(e) => dismissOne(alert.id, e)}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                      <X size={13} style={{ color:'#DC2626' }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert detail modal */}
      {selectedAlert && <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  );
}
