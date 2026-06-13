import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, MessageSquare, LineChart as LineChartIcon, Sprout, Info, Droplets, ShieldAlert, Wind, Thermometer, Cloud, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

import { fetchNdviHistory, fetchFarms, analyzeFarm } from '../services/api';
import { getHealthStatus } from '../utils/health';
import GlobalFarmSelector from '../components/GlobalFarmSelector';
import { formatArea, formatTemp, formatRainfall } from '../utils/units';
import { useCropSentinel } from '../state/AppContext';
import { formatINR } from '../utils/currency';

const S = {
  container: {
    display: 'flex', flexDirection: 'column', minHeight: '100%',
    background: 'var(--cs-bg)', paddingBottom: 24, overflowY: 'auto'
  },
  header: {
    padding: '22px 20px 10px', display: 'flex', alignItems: 'center', gap: 12
  },
  card: {
    background: 'var(--cs-card)', borderRadius: 16,
    border: '1px solid var(--cs-border-soft)',
    boxShadow: '0 1px 4px var(--cs-shadow)',
    padding: '16px', marginBottom: '12px'
  },
  textMuted: {
    fontSize: 11, color: 'var(--cs-text-muted)', textTransform: 'uppercase',
    fontWeight: 700, letterSpacing: '0.05em', margin: '0 0 12px'
  }
};

export default function SoilIntelligenceScreen({ onNavigate }) {
  const { state } = useCropSentinel();
  const [showReasoning, setShowReasoning] = useState(false);
  const [ndviHistory, setNdviHistory] = useState([]);
  const [ndviStatus, setNdviStatus] = useState('loading');
  const [locationName, setLocationName] = useState('');
  
  const analysis = state.activeAnalysis;

  const farm = state.farms.find(f => String(f.id) === String(state.activeFarmId));
  const status = getHealthStatus(analysis);

  React.useEffect(() => {
    if (farm && farm.latitude && farm.longitude) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${farm.latitude}&lon=${farm.longitude}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.county || '';
            const state = data.address.state || '';
            setLocationName(`${city}${city && state ? ', ' : ''}${state}`);
          }
        })
        .catch(console.error);

      setNdviStatus('loading');
      fetchNdviHistory(farm.latitude, farm.longitude).then(data => {
        if(data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(d => ({
            day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            ndvi: parseFloat(d.value)
          }));
          setNdviHistory(mapped);
          setNdviStatus('available');
        } else {
          setNdviStatus('unavailable');
        }
      }).catch((e) => {
        console.error(e);
        setNdviStatus('unavailable');
      });
    } else {
      setNdviStatus('unavailable');
    }
  }, [farm?.latitude, farm?.longitude]);
  return (
    <div style={S.container} className="scroll-area">
      
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => onNavigate('home')}
          style={{ width:34, height:34, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <ArrowLeft size={16} strokeWidth={2.2} style={{ color:'var(--cs-text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize:18, fontWeight:800, color:'var(--cs-text)', margin:0 }}>Soil Intelligence</h1>
          <p style={{ fontSize:12, color:'var(--cs-text-muted)', margin:0, fontWeight:600 }}>Predictive Analytics Dashboard</p>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        
        {/* Unified Top Context Bar */}
        <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <GlobalFarmSelector />
          <div style={{ textAlign: 'right', display: 'flex', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px' }}>Crop</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--cs-text)', margin: 0 }}>{farm?.crop_type || 'No DB field'}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px' }}>Area</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--cs-text)', margin: 0 }}>{formatArea(farm?.area, state?.preferences?.units)}</p>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          
          {/* Farm Health Hero */}
          <div style={{ ...S.card, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--cs-text-muted)', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase' }}>Farm Health Index</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: status.color, lineHeight: 1 }}>
                {analysis?.satellite?.farm_health_score || 'N/A'}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cs-text-sec)', marginBottom: 4 }}>/ 100</span>
            </div>
          </div>

          {/* Action Hero */}
          <div style={{ ...S.card, marginBottom: 0, border: '2px solid rgba(220, 38, 38, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={14} color="#DC2626" />
              <p style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', margin: 0, textTransform: 'uppercase' }}>Priority Recommendation</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--cs-text)', margin: 0, lineHeight: 1.2 }}>
              {analysis?.intervention?.action || 'No intervention required'}
            </p>
          </div>
        </div>

        {/* Dense Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div style={{ ...S.card, marginBottom: 0, padding: '12px' }}>
             <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Yield Loss Risk</p>
             <p style={{ fontSize: 16, fontWeight: 900, color: '#DC2626', margin: 0 }}>
               {analysis?.intervention?.estimated_yield_loss !== undefined && analysis?.intervention?.estimated_yield_loss !== null ? formatINR(analysis.intervention.estimated_yield_loss) : 'Risk data unavailable'}
             </p>
          </div>
          <div style={{ ...S.card, marginBottom: 0, padding: '12px', background: status.bg, border: `1px solid ${status.ring}` }}>
             <p style={{ fontSize: 10, color: status.color, textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Risk Level</p>
             <p style={{ fontSize: 16, fontWeight: 900, color: status.color, margin: 0 }}>
               {analysis?.risk?.risk_level || 'N/A'}
             </p>
          </div>
          <div style={{ ...S.card, marginBottom: 0, padding: '12px' }}>
             <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Crop Status</p>
             <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--cs-text)', margin: 0 }}>
               {analysis?.satellite?.status || 'N/A'}
             </p>
          </div>
          <div style={{ ...S.card, marginBottom: 0, padding: '12px' }}>
             <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>Est. Moisture</p>
             <p style={{ fontSize: 16, fontWeight: 800, color: '#3B82F6', margin: 0 }}>
               {analysis?.weather?.current?.humidity ? `${analysis.weather.current.humidity}%` : 'N/A'}
             </p>
          </div>
        </div>

        {/* AI Estimation Disclaimer */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 20 }}>
          <Info size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 10, color: '#1E3A8A', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
            <strong>NO SENSORS REQUIRED:</strong> Moisture and Risk metrics are computationally derived from weather humidity, satellite NDVI signatures, and predictive models.
          </p>
        </div>

        {/* Trend Analytics Dashboard */}
        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--cs-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
          <LineChartIcon size={16} color="var(--cs-accent)" /> Trend Analytics Engine
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <TrendChartCard 
             title="NDVI Historical Trend" 
             data={ndviHistory} 
             dataKey="ndvi" 
             lineStroke="#38BDF8" 
             labelPrefix="NDVI" 
             formatter={(val) => [val, 'NDVI']}
             statusMessage={ndviStatus === 'loading' ? 'Loading real-time NDVI history...' : 'Insufficient historical data for trend analysis'}
          />

          {analysis?.weather?.forecast && analysis.weather.forecast.length > 2 && (
             <>
                <TrendChartCard 
                   title="Temperature Forecast" 
                   data={analysis?.weather?.forecast?.map(d => ({ day: new Date(d.date).toLocaleDateString('en-US', {weekday:'short'}), temp_max: d.temp_max })) || []} 
                   dataKey="temp_max" 
                   lineStroke="#F97316" 
                   labelPrefix="Temperature" 
                   formatter={(val) => [formatTemp(val, state?.preferences?.units), 'Max Temp']}
                />
                <TrendChartCard 
                   title="Rainfall Probability" 
                   data={analysis.weather.forecast.map(d => ({ day: new Date(d.date).toLocaleDateString('en-US', {weekday:'short'}), rain_prob: d.rain_probability }))} 
                   dataKey="rain_prob" 
                   lineStroke="#3B82F6" 
                   labelPrefix="Rainfall Probability" 
                   formatter={(val) => [`${val}%`, 'Probability']}
                />
             </>
          )}
        </div>

        {/* Reference Accordions */}
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <button 
            onClick={() => setShowReasoning(!showReasoning)}
            style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cs-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={10} color="var(--cs-accent)" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--cs-text)', textTransform: 'uppercase' }}>Alert Reasoning</span>
            </div>
            {showReasoning ? <ChevronUp size={16} color="var(--cs-icon-dim)" /> : <ChevronDown size={16} color="var(--cs-icon-dim)" />}
          </button>
          
          {showReasoning && (
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--cs-border-soft)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 13, color: 'var(--cs-text)', lineHeight: 1.5, margin: 0, marginTop: 12 }}>
                  {analysis?.risk?.llm_explanation || 'No diagnostic reasoning provided by backend.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Data Provenance Details */}
        <div style={S.card}>
          <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--cs-text)', textTransform: 'uppercase', marginBottom: 12 }}>Data Provenance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--cs-text-muted)', fontWeight: 600 }}>Location Resolution</span>
              <span style={{ fontSize: 10, color: 'var(--cs-text)', fontWeight: 700 }}>{locationName || analysis?.weather?.location || 'Unknown'} (OSM)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--cs-text-muted)', fontWeight: 600 }}>Satellite Analysis Capture</span>
              <span style={{ fontSize: 10, color: 'var(--cs-text)', fontWeight: 700 }}>
                {analysis?.satellite?.captured_at ? new Date(analysis.satellite.captured_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--cs-text-muted)', fontWeight: 600 }}>Risk Analysis Extracted</span>
              <span style={{ fontSize: 10, color: 'var(--cs-text)', fontWeight: 700 }}>
                {new Date().toLocaleString()} (Real-time Run)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ReasonItem({ icon: Icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cs-bg)', border: '1px solid var(--cs-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color="var(--cs-text-sec)" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--cs-text)', margin: 0, lineHeight: 1.4, marginTop: 4 }}>
        {text}
      </p>
    </div>
  );
}

const calculateTrend = (dataArray, valueKey, labelPrefix) => {
  if (!dataArray || dataArray.length < 3) return null;
  
  const vals = dataArray.map(d => Number(d[valueKey]));
  const current = vals[vals.length - 1];
  const first = vals[0];
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  
  const pctChange = first !== 0 ? ((current - first) / first) * 100 : 0;
  
  let direction = 'Stable';
  if (pctChange > 5) direction = 'Improving';
  if (pctChange < -5) direction = 'Declining';

  let interpretation = `${labelPrefix} has remained stable over the analyzed period, indicating consistent conditions.`;
  if (direction === 'Improving') interpretation = `${labelPrefix} has increased by ${Math.abs(pctChange).toFixed(1)}%.`;
  if (direction === 'Declining') interpretation = `${labelPrefix} has decreased by ${Math.abs(pctChange).toFixed(1)}%.`;

  if (labelPrefix === 'NDVI') {
    if (direction === 'Improving') interpretation = `NDVI has improved by ${Math.abs(pctChange).toFixed(1)}%, indicating positive crop growth and recovery.`;
    if (direction === 'Declining') interpretation = `NDVI has declined by ${Math.abs(pctChange).toFixed(1)}%, indicating potential vegetation stress or harvesting.`;
    if (direction === 'Stable') interpretation = `NDVI has remained stable over the period, indicating consistent crop health.`;
  }
  if (labelPrefix === 'Temperature' || labelPrefix === 'Rainfall Probability') {
     direction = pctChange > 5 ? 'Increasing' : pctChange < -5 ? 'Decreasing' : 'Stable';
  }

  return {
    current: current.toFixed(2),
    max: max.toFixed(2),
    min: min.toFixed(2),
    pctChange: pctChange.toFixed(1),
    direction,
    interpretation,
    count: dataArray.length,
    startDate: dataArray[0].day || dataArray[0].date,
    endDate: dataArray[dataArray.length - 1].day || dataArray[dataArray.length - 1].date
  };
};

function TrendChartCard({ title, data, dataKey, lineStroke, formatter, labelPrefix, statusMessage }) {
  const trend = calculateTrend(data, dataKey, labelPrefix);
  
  return (
    <div style={S.card}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text-sec)', marginBottom: 12 }}>{title}</p>
      
      {trend ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
             <div style={{ display: 'flex', gap: 12 }}>
                <div>
                   <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Start</p>
                   <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text)', margin: 0 }}>{trend.startDate}</p>
                </div>
                <div>
                   <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>End</p>
                   <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text)', margin: 0 }}>{trend.endDate}</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: 12, textAlign: 'right' }}>
                <div>
                   <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Points</p>
                   <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--cs-text)', margin: 0 }}>{trend.count}</p>
                </div>
                <div>
                   <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Trend</p>
                   <p style={{ fontSize: 12, fontWeight: 800, color: trend.direction.includes('Declin') ? '#DC2626' : trend.direction.includes('Improv') ? '#16A34A' : '#D97706', margin: 0 }}>
                     {trend.direction} ({trend.pctChange > 0 ? '+' : ''}{trend.pctChange}%)
                   </p>
                </div>
             </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
             <div style={{ background: 'var(--cs-bg)', padding: 8, borderRadius: 8, border: '1px solid var(--cs-border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Min</p>
                <p style={{ fontSize: 13, fontWeight: 800, margin: 0, color: 'var(--cs-text)' }}>{trend.min}</p>
             </div>
             <div style={{ background: 'var(--cs-bg)', padding: 8, borderRadius: 8, border: '1px solid var(--cs-border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Current</p>
                <p style={{ fontSize: 13, fontWeight: 800, margin: 0, color: 'var(--cs-text)' }}>{trend.current}</p>
             </div>
             <div style={{ background: 'var(--cs-bg)', padding: 8, borderRadius: 8, border: '1px solid var(--cs-border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--cs-text-muted)', margin: '0 0 2px' }}>Max</p>
                <p style={{ fontSize: 13, fontWeight: 800, margin: 0, color: 'var(--cs-text)' }}>{trend.max}</p>
             </div>
          </div>
          
          <div style={{ background: '#F0FDF4', padding: 10, borderRadius: 8, border: '1px solid #BBF7D0', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#166534', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
               <strong>AI Interpretation:</strong> {trend.interpretation}
            </p>
          </div>
        </div>
      ) : null}

      <div style={{ height: 180, width: '100%' }}>
        {(!data || data.length < 3) ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cs-text-muted)', fontSize: 12 }}>
            {statusMessage || "Insufficient historical data for trend analysis"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cs-border-soft)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--cs-text-muted)' }} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip formatter={formatter} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey={dataKey} stroke={lineStroke} strokeWidth={3} dot={{ r: 4, fill: lineStroke, strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
