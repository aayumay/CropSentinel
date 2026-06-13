import React, { useState, useEffect } from 'react';
import { useI18n } from '../I18nContext';
import { fetchFarms, analyzeFarm } from '../services/api';
import { Bell, Droplets, Wind, Cloud, Thermometer, Database } from 'lucide-react';
import { useCropSentinel } from '../state/AppContext';
import { formatTemp } from '../utils/units';


function WeatherBadge({ icon: Icon, value, label, color }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
      <Icon size={18} strokeWidth={1.8} style={{ color }} />
      <span style={{ fontSize:13, fontWeight:700, color:'var(--cs-text)' }}>{value}</span>
      <span style={{ fontSize:10, color:'var(--cs-text-muted)', fontWeight:500 }}>{label}</span>
    </div>
  );
}



import AgentMissionControl from '../components/AgentMissionControl';

  export default function HomeScreen({ onNavigate }) {
    const { t } = useI18n();
    const { state } = useCropSentinel();
    
    const dashboardData = { 
      farm: state.farms.find(f => String(f.id) === String(state.activeFarmId)), 
      analysis: state.activeAnalysis 
    };
  
    const crisis = dashboardData?.analysis?.risk?.risk_level === 'HIGH';

  return (
    <div className="dashboard-container scroll-area" style={{ background:'var(--cs-bg)', minHeight:'100%', paddingBottom:24, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
        paddingBottom: '16px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start'
      }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:'var(--cs-text)', margin:0, lineHeight:1.2 }}>
            {t('good_morning')}<br />{state.profileData?.name || state.user?.name || t('farmer')}
          </h1>
          <p style={{ fontSize:11, color:'var(--cs-text-muted)', fontWeight:500, margin:'4px 0 0' }}>
            {dashboardData.farm ? `Monitoring: ${dashboardData.farm.farm_name}` : t('heres_whats')}
          </p>
        </div>
        <button
          onClick={() => onNavigate('alerts')}
          style={{
            width:36, height:36, borderRadius:'50%',
            background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', position:'relative',
            boxShadow:'0 1px 4px var(--cs-shadow-md)',
          }}
        >
          <Bell size={16} strokeWidth={1.8} style={{ color:'var(--cs-text-sec)' }} />
          <span style={{
            position:'absolute', top:6, right:6,
            width:8, height:8, background:'#EF4444',
            borderRadius:'50%', border:'2px solid var(--cs-card)',
          }} />
        </button>
      </div>

      {/* Weather strip */}
      <div style={{
        margin:'0 20px 16px',
        background:'var(--cs-card)',
        borderRadius:20,
        padding:'14px 20px',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        boxShadow:'0 1px 6px var(--cs-shadow)',
        border:'1px solid var(--cs-border-soft)',
      }}>
        <WeatherBadge icon={Thermometer} value={formatTemp(dashboardData?.analysis?.weather?.current?.temperature, state.preferences?.units)}    label={t('temp')}        color="#EF4444" />
        <WeatherBadge icon={Droplets}    value={dashboardData?.analysis?.weather?.current?.humidity ? `${dashboardData.analysis.weather.current.humidity}%` : "N/A"}    label={t('humidity')}    color="#60A5FA" />
        <WeatherBadge icon={Cloud}       value={dashboardData?.analysis?.weather?.current?.wind_speed ? `${dashboardData.analysis.weather.current.wind_speed}km/h` : "N/A"}    label={t('wind')} color="#93C5FD" />
        <WeatherBadge icon={Wind}        value={dashboardData?.analysis?.risk?.risk_level || "LOW"}    label="Risk"        color="#6EE7B7" />
      </div>

      {/* Advanced AI Agent Monitoring Dashboard */}
      <div style={{ padding: '0 20px' }}>
        <AgentMissionControl onNavigate={onNavigate} />
        
        <button
          onClick={() => onNavigate('soil_intelligence')}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '16px',
            background: 'var(--cs-card)',
            border: '1px solid var(--cs-border)',
            borderRadius: '16px',
            color: 'var(--cs-text)',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 1px 4px var(--cs-shadow)'
          }}
        >
          <Database size={16} color="var(--cs-accent)" />
          View Detailed Soil Intelligence
        </button>
      </div>

    </div>
  );
}
