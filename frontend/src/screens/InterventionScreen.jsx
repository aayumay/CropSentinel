import React, { useState } from 'react';
import { ArrowLeft, Settings2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, PhoneCall, FileText } from 'lucide-react';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/AppContext';
import { formatINR } from '../utils/currency';
import { getHealthStatus } from '../utils/health';
import GlobalFarmSelector from '../components/GlobalFarmSelector';
import toast from 'react-hot-toast';

export default function InterventionScreen({ onNavigate }) {
  const { t } = useI18n();
  const { state } = useCropSentinel();
  const [showReasoning, setShowReasoning] = useState(false);

  const analysis = state.activeAnalysis || {};
  const risk = analysis.risk || {};
  const intervention = analysis.intervention || {};

  const status = getHealthStatus(analysis);
  const riskLevel = status.label.toUpperCase();
  const isDanger = status.label === 'Critical' || status.label === 'Moderate';
  
  const activeFarm = state.farms?.find(f => String(f.id) === String(state.activeFarmId)) || {};
  
  const bgClass = isDanger ? 'var(--cs-danger-light)' : '#FEF3C7';
  const borderClass = isDanger ? 'var(--cs-danger-border)' : '#FDE68A';
  const textClass = isDanger ? 'var(--cs-danger)' : '#D97706';

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
        <div style={{ width: 34 }} /> {/* Empty div to balance header flexbox since the settings button was removed */}
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ padding:'0 16px', flex:1, overflowY:'auto', paddingBottom:24 }}>

        {/* Farm Metadata Header */}
        <div style={{ ...card, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Target Farm</p>
          <div style={{ margin: '4px 0 12px 0' }}>
            <GlobalFarmSelector />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', margin:'0 0 2px' }}>Crop Type</p>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{activeFarm.crop_type || '--'}</p>
            </div>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', margin:'0 0 2px' }}>Area</p>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{activeFarm.area !== undefined && activeFarm.area !== null ? activeFarm.area : '--'}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation card */}
        <div style={{ ...card, background: bgClass, border: `1px solid ${borderClass}`, marginBottom:12 }}>
          {/* Badge */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <AlertTriangle size={13} style={{ color: textClass }} />
            <span style={{ fontSize:10, fontWeight:800, color: textClass, textTransform:'uppercase', letterSpacing:'0.1em' }}>
              AI Recommendation
            </span>
          </div>

          <h2 style={{ fontSize:24, fontWeight:900, color:'var(--cs-text)', margin:'0 0 4px', lineHeight:1.15 }}>
            {intervention.action || 'Continue Monitoring'}
          </h2>
          <p style={{ fontSize:13, color:'var(--cs-text-sec)', margin:'0 0 16px' }}>
            {intervention.reasoning || 'No immediate threat detected'}
          </p>

          {/* 3-stat grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Priority', value: riskLevel },
              { label:'Est. Cost', value: formatINR(intervention.estimated_cost) },
              { label:'Yield Risk', value: formatINR(intervention.estimated_yield_loss) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:'var(--cs-card)', borderRadius:14, padding:'10px 8px', textAlign:'center', border: `1px solid ${borderClass}` }}>
                <p style={{ fontSize:9, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>{label}</p>
                <p style={{ fontSize:14, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Why this intervention */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => setShowReasoning(!showReasoning)}
            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>Why was this alert generated?</p>
            {showReasoning ? <ChevronUp size={16} color="var(--cs-icon-dim)" /> : <ChevronDown size={16} color="var(--cs-icon-dim)" />}
          </button>
          {showReasoning && (
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--cs-border-soft)' }}>
              <p style={{ fontSize:12, color:'var(--cs-text-sec)', lineHeight:1.7, margin: '12px 0 0' }}>
                <span style={{ fontWeight: 800, color: 'var(--cs-text)', display: 'block', marginBottom: 4 }}>Risk Level: {riskLevel}</span>
                {risk.llm_explanation || "No explanation provided."}
              </p>
            </div>
          )}
        </div>

        {/* Expected Outcome */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>Expected Outcome</p>
            <span style={{ fontSize:12, fontWeight:800, color:'var(--cs-accent)', background:'var(--cs-accent-light)', padding:'3px 10px', borderRadius:20 }}>
              {isDanger ? 'High Impact' : 'Monitoring'}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Yield Protected</p>
              <p style={{ fontSize:28, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1 }}>{formatINR(intervention.estimated_yield_loss)}</p>
            </div>
            <div>
              <p style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Risk Score</p>
              <p style={{ fontSize:28, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1 }}>{risk.risk_score !== undefined ? risk.risk_score : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Explain Calculation */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px', background: 'var(--cs-bg)' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:'0 0 12px' }}>Calculation Basis</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--cs-text-sec)' }}>Expected Yield</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text)' }}>
                  {intervention.expected_yield !== undefined ? intervention.expected_yield : 'Waiting for backend payload'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--cs-text-sec)' }}>Market Price</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text)' }}>
                  {intervention.market_price_used !== undefined ? intervention.market_price_used : 'Waiting for backend payload'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--cs-text-sec)' }}>Calculation Formula</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--cs-text)', margin: 0, padding: '8px', background: 'var(--cs-card)', borderRadius: 6, border: '1px solid var(--cs-border-soft)' }}>
                  {intervention.calculation_basis !== undefined ? intervention.calculation_basis : 'Waiting for backend payload'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button
            onClick={() => { toast.success('Intervention sequence started!'); onNavigate('farm_detail'); }}
            style={{ width:'100%', background:'var(--cs-accent)', color:'#FFFFFF', fontWeight:800, fontSize:15, padding:'16px', borderRadius:18, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(74,124,89,0.35)', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <CheckCircle size={18} /> Execute Action
          </button>
          
          <button
            onClick={() => { toast.success('Farmer notified via SMS/Voice!'); }}
            style={{ width:'100%', background:'var(--cs-card)', color:'var(--cs-text)', fontWeight:800, fontSize:15, padding:'16px', borderRadius:18, border:'2px solid var(--cs-border)', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <PhoneCall size={18} color="var(--cs-accent)" /> Notify Farmer
          </button>
          
          <button
            onClick={() => { toast.success('Work order dispatched to field team.'); }}
            style={{ width:'100%', background:'var(--cs-card)', color:'var(--cs-text)', fontWeight:800, fontSize:15, padding:'16px', borderRadius:18, border:'2px solid var(--cs-border)', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <FileText size={18} color="#D97706" /> Create Work Order
          </button>
        </div>
      </div>
    </div>
  );
}
