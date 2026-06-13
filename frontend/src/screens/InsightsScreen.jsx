import React, { useState } from 'react';
import { TrendingUp, Droplets, Thermometer, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, Wind, CloudRain, Zap, Lightbulb } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/AppContext';
import { fetchNdviHistory, fetchMarketHistory } from '../services/api';
import GlobalFarmSelector from '../components/GlobalFarmSelector';

const COLORS = ['var(--cs-accent)', '#60A5FA', '#F59E0B'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'var(--cs-card)', border:'1px solid var(--cs-border)', borderRadius:10, padding:'6px 10px', fontSize:11 }}>
        <p style={{ margin:0, color:'var(--cs-text-muted)', fontWeight:600 }}>{label}</p>
        <p style={{ margin:'2px 0 0', color:'var(--cs-text)', fontWeight:700 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function InsightsScreen() {
  const { language } = useI18n();
  const { state } = useCropSentinel();
  
  const [ndviHistory, setNdviHistory] = useState([]);
  const [marketHistory, setMarketHistory] = useState([]);

  const isHi = language === 'hi';

  const activeFarm = state.farms?.find(f => String(f.id) === String(state.activeFarmId)) || {};
  const activeAnalysis = state.activeAnalysis || {};

  React.useEffect(() => {
    if (!activeFarm.latitude || !activeFarm.longitude) return;

    fetchNdviHistory(activeFarm.latitude, activeFarm.longitude).then(data => {
      if(data && Array.isArray(data)) {
        const mapped = data.map(d => ({
          d: new Date(d.date).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { weekday: 'short' }),
          v: parseFloat(d.value)
        }));
        setNdviHistory(mapped);
      }
    }).catch(console.error);

    fetchMarketHistory(activeFarm.latitude, activeFarm.longitude).then(data => {
      if(data && Array.isArray(data)) {
        const mapped = data.map(d => ({
          d: new Date(d.date).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { weekday: 'short' }),
          v: parseFloat(d.value)
        }));
        setMarketHistory(mapped);
      }
    }).catch(() => {});
  }, [activeFarm.latitude, activeFarm.longitude, isHi]);

  const isStressed = activeAnalysis.risk?.risk_level === 'HIGH' || activeAnalysis.risk?.risk_level === 'CRITICAL';
  const hasWaterAction = activeAnalysis.intervention?.action?.toLowerCase().includes('irrigate');

  // Market Calculation
  let latestPrice = marketHistory.length > 0 ? marketHistory[marketHistory.length - 1].v : 0;
  let prevPrice = marketHistory.length > 1 ? marketHistory[marketHistory.length - 2].v : latestPrice;

  if (isNaN(latestPrice) || latestPrice === 0) {
    const CROP_PRICES = { 'wheat': 2125, 'rice': 2040, 'cotton': 6080, 'maize': 1962, 'corn': 1962, 'soybean': 4300, 'sugarcane': 315 };
    const cropKey = (activeFarm.crop_type || '').toLowerCase();
    let basePrice = CROP_PRICES[cropKey] || 2500; 
    const farmIdNum = parseInt(activeFarm.id) || 1;
    latestPrice = basePrice + ((farmIdNum * 137) % 250);
    prevPrice = ((farmIdNum % 2) === 0) ? Math.floor(latestPrice * 0.98) : Math.floor(latestPrice * 1.015);
  }

  // Simulated Weather Trend Array based on activeAnalysis.weather.current.precipitation_probability
  const rainProb = activeAnalysis.weather?.current?.precipitation_probability || 0;
  const simulatedWeatherHistory = [
    { d: 'Mon', v: Math.max(0, rainProb - 20) },
    { d: 'Tue', v: Math.max(0, rainProb - 10) },
    { d: 'Wed', v: rainProb },
    { d: 'Thu', v: Math.min(100, rainProb + 15) },
    { d: 'Fri', v: Math.min(100, rainProb + 5) }
  ];

  // AI Logic block
  let aiInsightText = isHi ? 'मौसम और मिट्टी की नमी इष्टतम है। सामान्य खेती जारी रखें।' : 'Weather and soil moisture are optimal. Continue normal farming practices.';
  if (rainProb > 50) aiInsightText = isHi ? 'बारिश की उच्च संभावना। सिंचाई रोकें।' : 'High chance of rain. Delay irrigation to prevent waterlogging.';
  else if (isStressed || activeAnalysis.satellite?.moisture === 'LOW') aiInsightText = isHi ? 'खेत सूख रहा है। अगले 48 घंटों में सिंचाई करें।' : 'Field is drying rapidly. Irrigate within the next 48 hours to prevent crop stress.';

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      {/* ── Row 1: Farm Selector + Summary ── */}
      <div style={{ padding:'24px 0 20px', display:'flex', flexWrap:'wrap', gap:20, alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:'var(--cs-text)', margin:0 }}>
            {isHi ? 'भविष्यवाणी इंजन' : 'Prediction Engine'}
          </h1>
          <div style={{ marginTop: 12 }}>
            <GlobalFarmSelector />
          </div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>{isHi ? 'फसल' : 'Crop'}</p>
            <p style={{ fontSize:16, fontWeight:800, color:'var(--cs-text)', margin:0 }}>
              {activeFarm.crop_type && activeFarm.crop_type.trim() !== '' 
                ? activeFarm.crop_type 
                : 'Data unavailable'}
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>{isHi ? 'बुवाई' : 'Sowing Date'}</p>
            <p style={{ fontSize:16, fontWeight:800, color:'var(--cs-text)', margin:0 }}>
              {activeFarm.sowing_date && activeFarm.sowing_date.trim() !== '' 
                ? activeFarm.sowing_date 
                : 'Data unavailable'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom: '40px', WebkitOverflowScrolling:'touch' }}>
        
        {/* ── Row 2: Snapshot Cards ── */}
        <div className="cs-grid cs-grid-4" style={{ marginBottom: 20 }}>
          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: isStressed ? '#FEE2E2' : '#D1FAE5' }}>
                {isStressed ? <AlertTriangle size={18} color="#DC2626" /> : <CheckCircle size={18} color="#059669" />}
              </div>
              <h3 className="cs-card-title">{isHi ? 'स्वास्थ्य स्थिति' : 'Health Status'}</h3>
            </div>
            <p style={{ fontSize:22, fontWeight:900, margin:0, color: isStressed ? '#DC2626' : '#059669' }}>
              {isStressed ? (isHi ? 'तनावग्रस्त' : 'Stressed') : (isHi ? 'सामान्य' : 'Optimal')}
            </p>
          </div>

          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#FEF3C7' }}>
                <Zap size={18} color="#D97706" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'जोखिम स्थिति' : 'Risk Status'}</h3>
            </div>
            <p style={{ fontSize:22, fontWeight:900, margin:0, color: '#D97706' }}>
              {activeAnalysis.risk?.risk_level || '--'}
            </p>
          </div>

          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#E0F2FE' }}>
                <Thermometer size={18} color="#0284C7" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'मौसम स्नैपशॉट' : 'Weather Snapshot'}</h3>
            </div>
            <p style={{ fontSize:22, fontWeight:900, margin:0, color: 'var(--cs-text)' }}>
              {activeAnalysis.weather?.current?.precipitation_probability || 0}% {isHi ? 'बारिश' : 'Rain'}
            </p>
          </div>

          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#EDE9FE' }}>
                <Droplets size={18} color="#8B5CF6" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'सिफारिश' : 'Recommendation'}</h3>
            </div>
            <p style={{ fontSize:22, fontWeight:900, margin:0, color: 'var(--cs-text)' }}>
              {hasWaterAction ? (isHi ? 'सिंचाई करें' : 'Irrigate') : (isHi ? 'कोई कार्रवाई नहीं' : 'No Action')}
            </p>
          </div>
        </div>

        {/* ── Row 3: Trend Charts ── */}
        <div className="cs-grid cs-grid-3" style={{ marginBottom: 20 }}>
          
          <div className="cs-card">
            <div className="cs-card-header" style={{ border:'none', paddingBottom:0 }}>
              <h3 className="cs-card-title">{isHi ? 'NDVI ट्रेंड' : 'NDVI Trend'}</h3>
            </div>
            <div style={{ height: 160, marginTop:12, minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviHistory} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--cs-border)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="v" stroke={COLORS[0]} strokeWidth={3} dot={{ r:4, fill:COLORS[0], strokeWidth:0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cs-card">
            <div className="cs-card-header" style={{ border:'none', paddingBottom:0 }}>
              <h3 className="cs-card-title">{isHi ? 'बारिश की संभावना ट्रेंड' : 'Rain Probability Trend'}</h3>
            </div>
            <div style={{ height: 160, marginTop:12, minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulatedWeatherHistory} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--cs-border)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="v" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cs-card">
            <div className="cs-card-header" style={{ border:'none', paddingBottom:0 }}>
              <h3 className="cs-card-title">{isHi ? 'बाजार मूल्य ट्रेंड' : 'Market Price Trend'}</h3>
            </div>
            <div style={{ height: 160, marginTop:12, minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketHistory} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--cs-border)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:9, fill:'var(--cs-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="v" stroke={COLORS[2]} strokeWidth={3} dot={{ r:4, fill:COLORS[2], strokeWidth:0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 4: AI & Actions ── */}
        <div className="cs-grid cs-grid-3">
          
          <div className="cs-card" style={{ background: 'linear-gradient(to bottom right, #F8FAFC, #F1F5F9)' }}>
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#DBEAFE' }}>
                <Lightbulb size={18} color="#2563EB" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'एआई इनसाइट्स' : 'AI Insights'}</h3>
            </div>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--cs-text)', lineHeight:1.5, margin:0 }}>
              {aiInsightText}
            </p>
          </div>

          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#FEF3C7' }}>
                <Info size={18} color="#D97706" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'तकनीकी विवरण' : 'Technical Details'}</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>NDVI Score</p>
                <p style={{ fontSize:16, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{activeAnalysis.satellite?.ndvi ?? '--'}</p>
              </div>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>Risk Score</p>
                <p style={{ fontSize:16, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{activeAnalysis.risk?.risk_score ?? '--'}</p>
              </div>
            </div>
          </div>

          <div className="cs-card">
            <div className="cs-card-header">
              <div className="cs-card-icon-box" style={{ background: '#D1FAE5' }}>
                <CheckCircle size={18} color="#059669" />
              </div>
              <h3 className="cs-card-title">{isHi ? 'कार्रवाई' : 'Action Plan'}</h3>
            </div>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>{isHi ? 'समय' : 'Timing'}</p>
            <p style={{ fontSize:15, fontWeight:800, color:'var(--cs-text)', margin:'0 0 12px' }}>{isHi ? 'देर शाम या सुबह' : 'Late evening / early morning'}</p>
            
            <p style={{ fontSize:11, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>{isHi ? 'प्राथमिकता' : 'Priority'}</p>
            <p style={{ fontSize:15, fontWeight:800, color:'var(--cs-text)', margin:0 }}>{activeAnalysis.intervention?.priority || 'LOW'}</p>
          </div>

        </div>

      </div>
    </div>
  );
}
