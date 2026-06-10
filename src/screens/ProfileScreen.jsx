import React, { useState } from 'react';
import { useI18n } from '../I18nContext';

import { Camera, ChevronRight, Home, Settings, Bell, HelpCircle, Info, Edit3, LogOut } from 'lucide-react';
import profileLeaves from '../assets/profile-leaves.png';
import farmerAvatar  from '../assets/farmer-avatar.png';

const MENU = [
  { icon: Home,        labelKey: 'farm_details',          screen: 'farm_details_config' },
  { icon: Settings,    labelKey: 'account_settings',      screen: 'settings'             },
  { icon: Bell,        labelKey: 'notification_settings', screen: 'notification_settings'},
  { icon: HelpCircle,  labelKey: 'help_support',          screen: 'help_support'         },
  { icon: Info,        labelKey: 'about',                 screen: 'about'                },
];

export default function ProfileScreen({ onNavigate }) {
  const { t } = useI18n();
  const [name]  = useState('Ramesh Kumar');
  const [email] = useState('ramesh@example.com');

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
        {/* Left Side: Profile Banner */}
        <div style={{ flex: 1 }}>
          {/* Profile banner */}
      <div style={{ marginBottom: 20, background:'#4A7C59', borderRadius:28, padding:20, position:'relative', overflow:'hidden' }}>
        <img src={profileLeaves} alt="" style={{ position:'absolute', right:0, bottom:0, height:'100%', objectFit:'contain', opacity:0.2, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:16 }}>
          {/* Avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:72, height:72, borderRadius:20, overflow:'hidden', border:'2.5px solid rgba(255,255,255,0.35)', background:'#3d6b4a' }}>
              <img src={farmerAvatar} alt="Farmer" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
            </div>
            <button onClick={() => onNavigate('edit_profile')}
              style={{ position:'absolute', bottom:-4, right:-4, width:24, height:24, borderRadius:'50%', background:'var(--cs-card)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}>
              <Camera size={12} style={{ color:'var(--cs-accent)' }} />
            </button>
          </div>
          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:19, fontWeight:900, color:'white', margin:0, lineHeight:1.2 }}>{name}</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', margin:'3px 0 0' }}>{email}</p>
            <div style={{ display:'flex', gap:12, marginTop:10 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:900, color:'white', margin:0 }}>2</p>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.65)', margin:0 }}>Farms</p>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:900, color:'white', margin:0 }}>12.4</p>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.65)', margin:0 }}>Acres</p>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:900, color:'white', margin:0 }}>1</p>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.65)', margin:0 }}>Alert</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
