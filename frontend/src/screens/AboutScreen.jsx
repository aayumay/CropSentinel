import React from 'react';
import { useI18n } from '../I18nContext';

import { ArrowLeft, Star, Shield, Globe, Cpu, Satellite, Leaf } from 'lucide-react';

const TECH = [
  { icon:Satellite, label:'Satellite Imagery',   sub:'Sentinel-2, 10m resolution' },
  { icon:Cpu,       label:'AI / ML Engine',       sub:'Multi-agent recommendation system' },
  { icon:Globe,     label:'Weather Data',         sub:'ECMWF + IMD forecast integration' },
  { icon:Shield,    label:'Data Privacy',         sub:'AES-256 encrypted, GDPR compliant' },
  { icon:Leaf,      label:'Built for India',      sub:'Kharif & Rabi crop cycles supported' },
];

export default function AboutScreen({ onNavigate }) {
  const { t } = useI18n();
  return (
    <div className="content-max" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)', paddingBottom:32 }}>
      <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => onNavigate('profile')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow-md)' }}>
          <ArrowLeft size={16} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:18, fontWeight:900, color:'var(--cs-text)', margin:0 }}>About CropSentinel</h1>
      </div>

      <div style={{ padding:'0 20px' }}>
        {/* Hero brand card */}
        <div style={{ background:'linear-gradient(135deg, #4A7C59, #3d6b4a)', borderRadius:28, padding:'24px 20px', marginBottom:20, textAlign:'center', position:'relative', overflow:'hidden' }}>
          <svg width="52" height="52" viewBox="0 0 72 72" fill="none" style={{ margin:'0 auto 12px' }}>
            <path d="M36 62 C36 62,14 46,16 22 C16 8,36 8,36 8" fill="#6B9B58" />
            <path d="M36 62 C36 62,20 44,30 16 C38 8,54 18,36 62" fill="rgba(255,255,255,0.8)" />
            <line x1="36" y1="62" x2="54" y2="30" stroke="#C9913A" strokeWidth="3.5" strokeLinecap="round"/>
            {[[54,28],[50,33],[46,38]].map(([cx,cy],i) => (
              <ellipse key={i} cx={cx} cy={cy} rx="3.5" ry="2.5" transform={`rotate(-30 ${cx} ${cy})`} fill="#C9913A" />
            ))}
          </svg>
          <h2 style={{ fontSize:22, fontWeight:900, color:'white', margin:'0 0 4px' }}>CropSentinel</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.75)', margin:'0 0 12px' }}>AI-Powered Farm Intelligence</p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'4px 12px' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#FCD34D" style={{ color:'#FCD34D' }} />)}
            <span style={{ fontSize:11, color:'white', fontWeight:700, marginLeft:4 }}>4.8 / 5.0</span>
          </div>
        </div>

        {/* Mission */}
        <div style={{ background:'var(--cs-card)', borderRadius:24, padding:16, marginBottom:20, border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-accent)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Our Mission</p>
          <p style={{ fontSize:13, color:'var(--cs-text-sec)', lineHeight:1.7, margin:0 }}>
            CropSentinel empowers Indian farmers with the same satellite and AI tools previously available only to large agribusinesses. Our goal is to help every farmer make data-driven decisions — reducing crop losses, conserving water, and improving incomes.
          </p>
        </div>

        {/* Tech stack */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-accent)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Technology</p>
        <div style={{ background:'var(--cs-card)', borderRadius:24, overflow:'hidden', border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)', marginBottom:20 }}>
          {TECH.map(({ icon:Icon, label, sub }, i) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < TECH.length-1 ? '1px solid var(--cs-bg)' : 'none' }}>
              <div style={{ width:34, height:34, background:'var(--cs-accent-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={15} style={{ color:'var(--cs-accent)' }} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{label}</p>
                <p style={{ fontSize:11, color:'var(--cs-text-muted)', margin:'1px 0 0' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Version info */}
        <div style={{ background:'var(--cs-card)', borderRadius:24, overflow:'hidden', border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          {[
            { label:'Version', value:'1.0.0' },
            { label:'Build',   value:'2026.06.09' },
            { label:'Licence', value:'Proprietary' },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 16px', borderBottom: i < 2 ? '1px solid var(--cs-bg)' : 'none' }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--cs-text)' }}>{label}</span>
              <span style={{ fontSize:13, color:'var(--cs-text-muted)' }}>{value}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize:11, color:'var(--cs-icon-dim)', textAlign:'center', marginTop:20 }}>© 2026 CropSentinel Technologies Pvt. Ltd.</p>
      </div>
    </div>
  );
}
