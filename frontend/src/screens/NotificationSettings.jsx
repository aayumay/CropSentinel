import React from 'react';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/AppContext';
import { ArrowLeft, Bell, Volume2, Info, Lock } from 'lucide-react';

function DisabledToggle() {
  return (
    <div style={{
      width:44, height:24, borderRadius:12, cursor:'not-allowed',
      background: '#E2E8F0', position:'relative', flexShrink:0,
      opacity: 0.6
    }}>
      <div style={{
        position:'absolute', top:3, left: 3,
        width:18, height:18, borderRadius:'50%', background:'var(--cs-card)',
        boxShadow:'0 1px 2px rgba(0,0,0,0.1)',
      }} />
    </div>
  );
}

const Section = ({ title, icon: Icon, items }) => (
  <div style={{ marginBottom:24, opacity: 0.7 }}>
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
      <Icon size={14} style={{ color:'var(--cs-text-muted)' }} />
      <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
        {title} <span style={{ fontSize: 9, background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>Planned</span>
      </p>
    </div>
    <div style={{ background:'var(--cs-card)', borderRadius:24, overflow:'hidden', border:'1px solid var(--cs-border-soft)' }}>
      {items.map(({ key, label, sub }, i) => (
        <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i < items.length-1 ? '1px solid var(--cs-bg)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={14} color="var(--cs-text-muted)" />
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--cs-text-muted)', margin:0 }}>{label}</p>
              {sub && <p style={{ fontSize:11, color:'#94A3B8', margin:'2px 0 0' }}>{sub}</p>}
            </div>
          </div>
          <DisabledToggle />
        </div>
      ))}
    </div>
  </div>
);

export default function NotificationSettings({ onNavigate }) {
  const { state } = useCropSentinel();
  const profile = state.profileData || {};
  
  const email = profile.email || state.user?.email || 'No email configured';
  const phone = profile.phone || state.user?.phone || 'No phone configured';

  return (
    <div className="content-max" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      {/* Header */}
      <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => onNavigate('profile')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow-md)' }}>
          <ArrowLeft size={16} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:18, fontWeight:900, color:'var(--cs-text)', margin:0 }}>Notification Settings</h1>
        <span style={{ fontSize: 10, fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: 12, textTransform: 'uppercase' }}>Coming Soon</span>
      </div>

      <div style={{ padding:'0 20px 32px' }}>
        
        {/* Banner */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1E40AF', margin: '0 0 4px 0' }}>Under Development</h3>
            <p style={{ fontSize: 13, color: '#1E3A8A', margin: 0, lineHeight: 1.5 }}>
              Notification services are currently under development and will be available in a future release.
            </p>
          </div>
        </div>

        <Section title="Planned for Future Release - Channels" icon={Bell} items={[
          { key:'push',  label:'Push Notifications', sub:'Alerts on your device' },
          { key:'email', label:'Email Alerts',        sub:`Sent to ${email}` },
          { key:'sms',   label:'SMS Alerts',          sub:`Sent to ${phone}` },
        ]} />
        <Section title="Planned for Future Release - Alert Types" icon={Volume2} items={[
          { key:'drought', label:'Drought Risk Alerts',   sub:'Soil moisture warnings' },
          { key:'pest',    label:'Pest & Disease Alerts', sub:'Early detection reports' },
          { key:'weather', label:'Weather Warnings',      sub:'Extreme weather events' },
          { key:'ndvi',    label:'NDVI Updates',          sub:'Weekly health summaries' },
          { key:'market',  label:'Market Price Alerts',   sub:'Mandi price changes' },
        ]} />
      </div>
    </div>
  );
}
