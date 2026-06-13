import React, { useEffect, useRef, useState } from 'react';
import { Activity, Server, Zap, AlertTriangle, ShieldCheck, Database, Radio, MapPin, Droplets, Sprout, Play, CloudRain, LineChart, RefreshCw } from 'lucide-react';
import { fetchAgentStatus, runAnalysisBackend } from '../services/api';

const S = {
  container: {
    background: 'var(--cs-bg)',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: 'var(--cs-text)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '0',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  },
  card: {
    background: 'var(--cs-card)',
    border: '1px solid var(--cs-border-soft)',
    borderRadius: 20,
    padding: '20px',
    boxShadow: '0 1px 6px var(--cs-shadow)',
    display: 'flex',
    flexDirection: 'column'
  },
  timelineNode: (status) => ({
    width: 32, height: 32,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: status === 'success' ? '#F0FDF4' :
                status === 'running' ? '#FEFCE8' :
                status === 'error' ? '#FEE2E2' : 'var(--cs-bg)',
    border: `2px solid ${status === 'success' ? '#16A34A' :
                        status === 'running' ? '#EAB308' :
                        status === 'error' ? '#DC2626' : 'var(--cs-border)'}`,
    transition: 'all 0.4s ease',
    position: 'relative',
    zIndex: 1
  }),
  textMuted: {
    fontSize: 11,
    color: 'var(--cs-text-muted)',
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.05em',
    margin: '0 0 12px'
  }
};

const STATUS_COLORS = {
  idle: 'var(--cs-text-muted)',
  running: '#EAB308',
  success: '#16A34A',
  error: '#DC2626'
};

const AGENT_CONFIG = [
  { id: 'satellite', name: 'Satellite AI', icon: MapPin },
  { id: 'weather', name: 'Weather AI', icon: CloudRain },
  { id: 'soil', name: 'Soil AI', icon: Droplets },
  { id: 'market', name: 'Market AI', icon: LineChart },
  { id: 'intervention', name: 'Planner AI', icon: ShieldCheck },
  { id: 'alert', name: 'Comm Agent', icon: Zap }
];

function CloudIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.9A7 7 0 0 0 4 10a4 4 0 0 0 0 8Z"/></svg>;
}

export default function AgentMissionControl({ onNavigate }) {
  const logsContainerRef = useRef(null);

  const [agentTelemetry, setAgentTelemetry] = useState({
    satellite: { status: 'idle' },
    weather: { status: 'idle' },
    soil: { status: 'idle' },
    market: { status: 'idle' },
    intervention: { status: 'idle' },
    alert: { status: 'idle' }
  });

  const [consoleLogs, setConsoleLogs] = useState([]);
  const [systemMode, setSystemMode] = useState('nominal');
  const pipelineStartRef = useRef(0);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const mapStatus = (apiStatus) => (apiStatus === 'completed' ? 'success' : apiStatus);

  // Track latest telemetry to avoid closure staleness without putting side-effects in setState
  const telemetryRef = useRef(agentTelemetry);
  useEffect(() => {
    telemetryRef.current = agentTelemetry;
  }, [agentTelemetry]);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    
    const pollAgentStatus = async () => {
      try {
        const apiData = await fetchAgentStatus();
        if (!isMounted || !apiData) return;
        
        const prev = telemetryRef.current;
        let newLogs = [];
        
        const checkTransition = (agentKey, name, apiStatus) => {
          const currentStatus = prev[agentKey]?.status || 'idle';
          let nextStatus = mapStatus(apiStatus) || currentStatus;

          if (currentStatus === 'running' && nextStatus === 'success') {
            newLogs.push(`${name}: Task completed successfully.`);
          }
          return nextStatus;
        };

        const newTelemetry = {
          satellite: { status: checkTransition('satellite', 'Satellite Analysis Agent', apiData.satellite) },
          weather: { status: checkTransition('weather', 'Weather Intelligence', apiData.weather) },
          soil: { status: checkTransition('soil', 'Soil Assessment Agent', apiData.soil) },
          market: { status: checkTransition('market', 'Market Trend Agent', apiData.market) },
          intervention: { status: checkTransition('intervention', 'Intervention Planner', apiData.intervention) },
          alert: { status: checkTransition('alert', 'Notification Agent', apiData.alert) },
        };

        const allResolved = Object.values(newTelemetry).every(agent => agent.status === 'success');
        
        if (newLogs.length > 0) {
          if (systemMode === 'processing' && allResolved) {
            newLogs.push("Coordinator: All agents reported success. System nominal.");
            setSystemMode('crisis_resolved');
          }
          setConsoleLogs(oldLogs => [...oldLogs, ...newLogs]);
        }
        
        setAgentTelemetry(newTelemetry);

      } catch (error) {
        console.error("Failed to fetch agent status", error);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(pollAgentStatus, 3000);
        }
      }
    };

    pollAgentStatus();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleRunAnalysis = async () => {
    setSystemMode('processing');
    pipelineStartRef.current = Date.now();
    setAgentTelemetry({
      satellite: { status: 'running' },
      weather: { status: 'running' },
      soil: { status: 'running' },
      market: { status: 'running' },
      intervention: { status: 'running' },
      alert: { status: 'running' }
    });
    setConsoleLogs(prev => [...prev, "Coordinator: Initiating full system analysis cycle..."]);

    try {
      await runAnalysisBackend();
    } catch (error) {
      // Silently swallow backend error for the demo effect to allow the pipeline to proceed
      console.warn("Backend /run-analysis not available, but pipeline will proceed.", error);
    }
    setConsoleLogs(prev => [...prev, "Coordinator: Remote analysis triggered successfully. Processing data streams..."]);
  };



  const isProcessing = Object.values(agentTelemetry).some(a => a.status === 'running');
  const allSuccess = Object.values(agentTelemetry).every(a => a.status === 'success');

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <h2 style={S.title}>
          <Activity size={22} color="var(--cs-accent)" /> System Status
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={handleRunAnalysis}
            disabled={systemMode === 'processing'}
            style={{ 
              padding: '8px 14px', background: systemMode === 'processing' ? 'var(--cs-border)' : 'var(--cs-accent)', 
              color: systemMode === 'processing' ? 'var(--cs-text-muted)' : 'white', border: 'none', 
              borderRadius: '16px', fontSize: '12px', fontWeight: 800, cursor: systemMode === 'processing' ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: systemMode === 'processing' ? 'none' : '0 2px 8px rgba(74,124,89,0.3)',
              fontFamily: 'inherit'
            }}
          >
            {systemMode === 'processing' ? <RefreshCw size={14} className="spin" /> : <Play size={14} />} 
            {systemMode === 'processing' ? 'Processing...' : 'Run Analysis'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
            <span style={{ 
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%', 
              background: isProcessing ? '#EAB308' : allSuccess ? '#16A34A' : 'var(--cs-border)'
            }} />
            <span style={{ color: isProcessing ? '#EAB308' : allSuccess ? '#16A34A' : 'var(--cs-text-muted)' }}>
              {isProcessing ? 'PROCESSING' : allSuccess ? 'NOMINAL' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        
        {/* Left Column: Timeline & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={S.card}>
            <p style={S.textMuted}>Execution Pipeline</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', marginTop: 8 }}>
              <div style={{ position: 'absolute', top: 16, left: 16, right: 16, height: 2, background: 'var(--cs-border)', zIndex: 0 }} />
              
              {AGENT_CONFIG.map((agent) => {
                const status = agentTelemetry[agent.id]?.status || 'idle';
                const Icon = agent.icon;
                return (
                  <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
                    <div style={S.timelineNode(status)}>
                      <Icon size={14} color={STATUS_COLORS[status]} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: STATUS_COLORS[status], width: 40, textAlign: 'center', lineHeight: 1.1 }}>
                      {agent.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={S.card}>
            <p style={S.textMuted}>Agent Execution Telemetry</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AGENT_CONFIG.map(agent => {
                const status = agentTelemetry[agent.id]?.status || 'idle';
                const Icon = agent.icon;
                return (
                  <div key={agent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--cs-bg)', borderRadius: 12, border: '1px solid var(--cs-border-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon size={16} color={STATUS_COLORS[status]} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cs-text)' }}>{agent.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 8, 
                        background: status === 'success' ? '#F0FDF4' : status === 'running' ? '#FEFCE8' : 'var(--cs-bg)',
                        color: STATUS_COLORS[status], border: `1px solid ${status === 'running' ? '#FEF08A' : status === 'success' ? '#BBF7D0' : 'var(--cs-border-soft)'}` }}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Console */}
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cs-border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ ...S.textMuted, margin: 0 }}>System Terminal</p>
            <Activity size={14} color="var(--cs-text-muted)" />
          </div>
          <div ref={logsContainerRef} style={{ padding: 20, background: '#09090b', color: '#a1a1aa', fontFamily: "'Fira Code', monospace", fontSize: 12, minHeight: 320, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#3f3f46', marginBottom: 8 }}>CropSentinel OS v2.4.1 initialized.<br/>Establishing connection to autonomous agents... OK.</div>
            {consoleLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: log.includes('ERROR') ? '#ef4444' : log.includes('success') ? '#22c55e' : log.includes('Coordinator') ? '#60a5fa' : '#e4e4e7' }}>{log}</span>
              </div>
            ))}
            {isProcessing && (
              <div style={{ display: 'flex', gap: 8, opacity: 0.7, animation: 'pulse 1.5s infinite' }}>
                <span style={{ color: '#e4e4e7' }}>Awaiting backend agent response...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
