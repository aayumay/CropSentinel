import React from 'react';
import { ArrowLeft, Settings2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useI18n } from '../I18nContext';
import toast from 'react-hot-toast';

export default function InterventionScreen({ onNavigate }) {
  const { t } = useI18n();

  const card = {
    background: 'var(--cs-card)',
    borderRadius: 22,
    border: '1px solid var(--cs-border-soft)',
    boxShadow: '0 1px 6px var(--cs-shadow)',
    marginBottom: 12,
    padding: '16px',
  };

  return (
    <div className="content-max" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>

      {/* ── Header ── */}
      <div style={{ padding:'22px 20px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={() => onNavigate('farm_detail')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <ArrowLeft size={16} strokeWidth={2.2} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:16, fontWeight:800, color:'var(--cs-text)', margin:0 }}>Intervention</h1>
        <button style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <Settings2 size={15} strokeWidth={1.8} style={{ color:'var(--cs-text-sec)' }} />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ padding:'0 16px', flex:1, overflowY:'auto', paddingBottom:24 }}>

        {/* AI Recommendation card */}
        <div style={{ ...card, background:'var(--cs-danger-light)', border:'1px solid var(--cs-danger-border)', marginBottom:12 }}>
          {/* Badge */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <AlertTriangle size={13} style={{ color:'var(--cs-danger)' }} />
            <span style={{ fontSize:10, fontWeight:800, color:'var(--cs-danger)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              AI Recommendation
            </span>
          </div>

          <h2 style={{ fontSize:24, fontWeight:900, color:'var(--cs-text)', margin:'0 0 4px', lineHeight:1.15 }}>
            Irrigate immediately
          </h2>
          <p style={{ fontSize:13, color:'var(--cs-text-sec)', margin:'0 0 16px' }}>
            Moisture level critically low
          </p>

          {/* 3-stat grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Irrigation', value:'35 mm'   },
              { label:'Cost',       value:'₹1,200'  },
              { label:'Yield Risk', value:'₹45,000' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:'var(--cs-card)', borderRadius:14, padding:'10px 8px', textAlign:'center', border:'1px solid var(--cs-danger-border)' }}>
                <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>{label}</p>
                <p style={{ fontSize:14, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Confidence */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>AI Confidence</p>
            <p style={{ fontSize:15, fontWeight:900, color:'var(--cs-accent)', margin:0 }}>91%</p>
          </div>
          {/* Progress track */}
          <div style={{ height:8, background:'var(--cs-border)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:'91%', background:'var(--cs-accent)', borderRadius:4, transition:'width 0.6s ease' }} />
          </div>
        </div>

        {/* Why this intervention */}
        <div style={card}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:'0 0 8px' }}>Why this intervention?</p>
          <p style={{ fontSize:12, color:'var(--cs-text-sec)', lineHeight:1.7, margin:0 }}>
            Soil moisture is far below optimal range. Timely irrigation can prevent yield loss and improve crop health.
          </p>
        </div>

        {/* Expected Outcome */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>Expected Outcome</p>
            <span style={{ fontSize:12, fontWeight:800, color:'var(--cs-accent)', background:'var(--cs-accent-light)', padding:'3px 10px', borderRadius:20 }}>
              High Impact
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Yield Improvement</p>
              <p style={{ fontSize:28, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1 }}>20–25%</p>
            </div>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>ROI</p>
              <p style={{ fontSize:28, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1 }}>3.8x</p>
            </div>
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={() => { toast.success('Intervention applied!'); onNavigate('farm_detail'); }}
          style={{ width:'100%', background:'var(--cs-accent)', color:'#FFFFFF', fontWeight:800, fontSize:15, padding:'16px', borderRadius:18, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(74,124,89,0.35)', fontFamily:'inherit', letterSpacing:'0.1px', marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <CheckCircle size={18} /> Apply Intervention
        </button>
      </div>
    </div>
  );
}
