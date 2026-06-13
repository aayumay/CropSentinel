import React, { useState } from 'react';
import { useI18n } from '../I18nContext';

import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q:'How does the satellite analysis work?', a:'CropSentinel uses Sentinel-2 multispectral imagery (10m resolution) processed every 5 days. Our AI computes NDVI, NDWI, and soil moisture proxies to detect stress before it becomes visible to the naked eye.' },
  { q:'How accurate are the crop health scores?', a:'Health scores are accurate to ±8% compared to ground-truth field surveys. They improve over time as the AI learns patterns specific to your farm\'s microclimate and soil type.' },
  { q:'What does NDVI mean?', a:'NDVI (Normalized Difference Vegetation Index) measures plant greenness and vigour. Values range from -1 to +1. Healthy crops typically score 0.6–0.9; drought stress drops them below 0.4.' },
  { q:'Can I add multiple fields?', a:'Yes. Navigate to Farms → Add New Field. Each field can have its own crop type and location pin. Up to 10 fields are supported in the current plan.' },
  { q:'How do I report an issue?', a:'Tap "Contact Support" below and describe your issue. Our team responds within 24 hours on weekdays.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)}
      style={{ padding:'14px 16px', borderBottom:'1px solid var(--cs-bg)', cursor:'pointer' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--cs-text)', margin:0, flex:1, lineHeight:1.4 }}>{q}</p>
        {open ? <ChevronUp size={16} style={{ color:'var(--cs-text-muted)', flexShrink:0, marginTop:2 }} /> : <ChevronDown size={16} style={{ color:'var(--cs-text-muted)', flexShrink:0, marginTop:2 }} />}
      </div>
      {open && <p style={{ fontSize:13, color:'var(--cs-text-sec)', margin:'10px 0 0', lineHeight:1.6 }}>{a}</p>}
    </div>
  );
}

export default function HelpSupportScreen({ onNavigate }) {
  const { t } = useI18n();
  return (
    <div className="content-max" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)', paddingBottom:32 }}>
      <div style={{ padding:'24px 20px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => onNavigate('profile')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow-md)' }}>
          <ArrowLeft size={16} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize:18, fontWeight:900, color:'var(--cs-text)', margin:0 }}>Help & Support</h1>
      </div>

      <div style={{ padding:'0 20px' }}>
        {/* Contact cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[
            { icon:MessageCircle, label:'Live Chat',    sub:'Avg. 5 min reply',     color:'var(--cs-accent)', bg:'#F0F7F2' },
            { icon:Phone,         label:'Call Us',      sub:'+91 1800-XXX-XXXX',    color:'#2563EB', bg:'#EFF6FF' },
            { icon:Mail,          label:'Email Us',     sub:'support@cropsentinel.ai', color:'#D97706', bg:'#FFFBEB' },
          ].map(({ icon:Icon, label, sub, color, bg }) => (
            <div key={label} onClick={() => {}} style={{ background:'var(--cs-card)', borderRadius:20, padding:14, border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)', cursor:'pointer' }}>
              <div style={{ width:36, height:36, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{label}</p>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', margin:'2px 0 0' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-accent)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Frequently Asked Questions</p>
        <div style={{ background:'var(--cs-card)', borderRadius:24, overflow:'hidden', border:'1px solid var(--cs-border-soft)', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </div>
    </div>
  );
}
