import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Activity, ExternalLink, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useI18n } from '../I18nContext';
import { useCropSentinel } from '../state/AppContext';
import { fetchNdviHistory } from '../services/api';
import { getHealthStatus } from '../utils/health';
import { formatTemp, formatRainfall } from '../utils/units';
import GlobalFarmSelector from '../components/GlobalFarmSelector';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import wheatImg from '../assets/wheat.png';

const card = {
  background: 'var(--cs-card)',
  borderRadius: 22,
  border: '1px solid var(--cs-border-soft)',
  boxShadow: '0 2px 10px var(--cs-shadow)',
  padding: 20,
  marginBottom: 16,
};

function FieldHeatmap({ lat, lng, ndviScore }) {
  const centerLat = lat || 30.2225;
  const centerLng = lng || 75.8345;
  const center = [centerLat, centerLng];

  const userField = [
    [centerLat - 0.001, centerLng - 0.001],
    [centerLat + 0.001, centerLng - 0.001],
    [centerLat + 0.001, centerLng + 0.001],
    [centerLat - 0.001, centerLng + 0.001]
  ];

  const color = ndviScore < 0.3 ? '#EF4444' : (ndviScore < 0.6 ? '#F59E0B' : '#16A34A');

  return (
    <div style={{ position:'relative', width:'100%', height:240, borderRadius:'inherit', overflow:'hidden', zIndex: 0 }}>
      <MapContainer center={center} zoom={15} zoomControl={true} scrollWheelZoom={true} dragging={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri"
          maxZoom={19}
        />
        
        <Polygon positions={userField} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.4, weight: 2 }}>
          <LeafletTooltip direction="center" permanent={true} opacity={0.9} className="custom-tooltip">
            <div style={{ fontWeight: 'bold' }}>Your Field</div>
            <div>NDVI: {ndviScore}</div>
          </LeafletTooltip>
        </Polygon>
      </MapContainer>
      
      <div className="laser-scan" style={{ pointerEvents: 'none' }} />
      <style>{`
        .laser-scan {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(74, 222, 128, 0.6); box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
          animation: scan 3s linear infinite; z-index: 1000; opacity: 0.7;
        }
        @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        .custom-tooltip {
          background-color: var(--cs-card);
          border: 1px solid var(--cs-border);
          color: var(--cs-text);
          box-shadow: 0 2px 8px var(--cs-shadow);
        }
      `}</style>
    </div>
  );
}

function LeftPanel({ farm, analysis, ndviHistory, onNavigate }) {
  const { t } = useI18n();
  const { state } = useCropSentinel();
  const score = analysis?.satellite?.farm_health_score || 0;
  const ndvi = analysis?.satellite?.ndvi?.toString() || '0.00';
  const status = getHealthStatus(analysis);
  const ringColor = status.ring;
  const statusLabel = status.label;
  const statusBg = status.bg;
  const statusColor = status.color;
  const crisis = status.label === 'Critical';

  const r = 54;
  const circ = 2 * Math.PI * r;
  const off = circ - circ * score / 100;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px' }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <GlobalFarmSelector />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12, marginTop: 10 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 2px' }}>Crop Type</p>
              <p style={{ fontSize:14, fontWeight:800, color:'var(--cs-text)', margin:0 }}>{farm.crop_type || 'Data unavailable'}</p>
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 2px' }}>Area</p>
              <p style={{ fontSize:14, fontWeight:800, color:'var(--cs-text)', margin:0 }}>{farm.area ? `${farm.area} Ac` : 'Data unavailable'}</p>
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 2px' }}>Soil</p>
              <p style={{ fontSize:14, fontWeight:800, color:'var(--cs-text)', margin:0 }}>{farm.soil_type || 'Data unavailable'}</p>
            </div>
          </div>
        </div>
        <img src={wheatImg} alt="Crop" style={{ width:72, height:72, objectFit:'contain', opacity:0.9, flexShrink:0 }} />
      </div>

      <div style={{ ...card, padding:'20px' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 16px', textAlign:'center' }}>
          {t('health_score')}
        </p>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="130" height="130" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r={r} strokeWidth="10" stroke="var(--cs-border)" fill="transparent" />
              <circle cx="65" cy="65" r={r} strokeWidth="10" stroke={ringColor} fill="transparent" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
            </svg>
            <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
              <span style={{ fontSize:40, fontWeight:900, color:'var(--cs-text)', lineHeight:1, display:'block' }}>{score}</span>
              <span style={{ fontSize:13, color:'var(--cs-text-muted)', fontWeight:500 }}>/100</span>
            </div>
          </div>
          <span style={{ fontSize:13, fontWeight:700, padding:'6px 20px', borderRadius:999, background:statusBg, color:statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
        <p style={{ fontSize:12, fontWeight:800, color:'var(--cs-text)', margin:'0 0 12px' }}>Live Weather Data</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label: 'Temperature', value: formatTemp(analysis?.weather?.current?.temperature, state?.preferences?.units) },
            { label: 'Humidity', value: analysis?.weather?.current?.humidity !== undefined ? `${analysis.weather.current.humidity}%` : 'N/A' },
            { label: 'Wind Speed', value: analysis?.weather?.current?.wind_speed !== undefined ? `${analysis.weather.current.wind_speed} km/h` : 'N/A' },
            { label: 'Rainfall', value: formatRainfall(analysis?.weather?.current?.rainfall, state?.preferences?.units) }
          ].map(({ label, value }) => (
            <div key={label} style={{ background:'var(--cs-bg)', borderRadius:12, padding:'10px', textAlign:'center', border: '1px solid var(--cs-border-soft)' }}>
              <p style={{ fontSize:9, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', margin:'0 0 4px' }}>{label}</p>
              <p style={{ fontSize:14, fontWeight:900, color:'var(--cs-accent)', margin:0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {crisis && (
        <div style={{ ...card, background:'#FEF2F2', border:'1px solid #FECACA', display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Activity size={18} style={{ color:'#fff' }} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:'#991B1B', margin:0 }}>Risk Detected</p>
            <p style={{ fontSize:12, color:'#B91C1C', margin:'4px 0 0', fontWeight:500 }}>Critical intervention required</p>
          </div>
        </div>
      )}

      <div style={{ ...card, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>{t('ndvi_trend')}</p>
          <span style={{ fontSize:18, fontWeight:900, color:'var(--cs-accent)' }}>{ndvi}</span>
        </div>
        <div style={{ height:80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ndviHistory} margin={{ top:4, right:4, left:-32, bottom:0 }}>
              <YAxis domain={['dataMin - 0.05','dataMax + 0.05']} hide />
              <XAxis dataKey="d" tick={{ fontSize:9, fill:'var(--cs-text-muted)', fontWeight:500 }} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="v" stroke={ringColor} strokeWidth={3} dot={{ r:4, fill:ringColor, strokeWidth:0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button onClick={() => onNavigate('intervention')} style={{ width:'100%', background:'var(--cs-accent)', color:'#FFFFFF', fontWeight:800, fontSize:16, padding:'18px', borderRadius:20, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(74,124,89,0.35)', fontFamily:'inherit', marginTop: 'auto', transition: 'all 0.2s ease' }}>
        {t('view_intervention')}
      </button>
    </div>
  );
}

function RightPanel({ farm, analysis }) {
  const ndviScore = analysis?.satellite?.ndvi || 0;
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px 10px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)', margin:0 }}>Live Field Scan</p>
          <ExternalLink size={14} style={{ color:'var(--cs-text-muted)', cursor:'pointer' }} />
        </div>
        <FieldHeatmap lat={farm.latitude} lng={farm.longitude} ndviScore={ndviScore} />
        <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)' }}>Low Health</span>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)' }}>High Health</span>
        </div>
        <div style={{ height:4, width:'100%', background:'linear-gradient(to right, #EF4444, #F59E0B, #10B981)' }} />
      </div>

      <div style={{ ...card, display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
        <div style={{ width:40, height:40, borderRadius:12, background:'var(--cs-bg)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <MapPin size={18} style={{ color:'var(--cs-text-sec)' }} />
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--cs-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>Farm Coordinates</p>
          <p style={{ fontSize:15, fontWeight:800, color:'var(--cs-text)', margin:0, fontFamily:'monospace' }}>
            {`${parseFloat(farm.latitude || 20.93).toFixed(4)}°N, ${parseFloat(farm.longitude || 77.77).toFixed(4)}°E`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FarmsScreen({ onNavigate }) {
  const { state } = useCropSentinel();
  const [ndviHistory, setNdviHistory] = useState([]);

  const farm = state.farms.find(f => String(f.id) === String(state.activeFarmId));
  const analysis = state.activeAnalysis;

  useEffect(() => {
    if (farm && farm.latitude && farm.longitude) {
      fetchNdviHistory(farm.latitude, farm.longitude).then(data => {
        if(data && Array.isArray(data)) {
          const mapped = data.map(d => ({
            d: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            v: parseFloat(d.value)
          }));
          setNdviHistory(mapped);
        }
      }).catch(console.error);
    }
  }, [farm?.latitude, farm?.longitude]);

  if (!farm || !analysis) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cs-text-muted)', fontSize: 14, minHeight: '100vh', background: 'var(--cs-bg)' }}>
        Analyzing satellite and weather data...
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--cs-bg)' }}>
      <div style={{ flexShrink:0, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)', paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)', paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)', paddingBottom: '12px', background:'var(--cs-bg)', borderBottom:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => onNavigate('farms')} style={{ width:36, height:36, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <ArrowLeft size={18} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>

        <div style={{ background:'var(--cs-card)', borderRadius:'20px', padding:'6px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 2px 8px var(--cs-shadow)', border:'1px solid var(--cs-border-soft)' }}>
          <img src={wheatImg} alt="" style={{ width:16, height:16 }} />
          <div style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize:13, fontWeight:800, color:'var(--cs-text)', lineHeight:1.2 }}>{farm.farm_name}</span>
            <span style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:600 }}>{farm.crop_type || 'N/A'}</span>
          </div>
        </div>

        <button style={{ width:36, height:36, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}>
          <Share2 size={16} strokeWidth={2} style={{ color:'var(--cs-text-sec)' }} />
        </button>
      </div>

      <div className="desktop-split desktop-split-2-1" style={{ flex:1, overflowY:'auto', padding:'20px', gap:'20px', WebkitOverflowScrolling:'touch' }}>
        <div style={{ paddingBottom: 20 }}>
          <LeftPanel farm={farm} analysis={analysis} ndviHistory={ndviHistory} onNavigate={onNavigate} />
        </div>
        <div style={{ paddingBottom: 40 }}>
          <RightPanel farm={farm} analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
