import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Search, Check } from 'lucide-react';
import { useCropSentinel } from '../state/AppContext';
import { formatArea } from '../utils/units';
import { getHealthStatus } from '../utils/health';

export default function GlobalFarmSelector() {
  const { state, setCurrentFarm } = useCropSentinel();
  const farms = state.farms || [];
  const activeFarm = farms.find(f => String(f.id) === String(state.activeFarmId));
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (farms.length <= 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--cs-text)', margin: 0 }}>
          {activeFarm?.farm_name || 'Unknown Farm'}
        </h2>
        {activeFarm?.latitude && activeFarm?.longitude && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <MapPin size={12} color="var(--cs-text-sec)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cs-text-sec)', fontFamily: 'monospace' }}>
              {parseFloat(activeFarm.latitude).toFixed(4)}°N, {parseFloat(activeFarm.longitude).toFixed(4)}°E
            </span>
          </div>
        )}
      </div>
    );
  }

  const filteredFarms = farms.filter(f => f.farm_name?.toLowerCase().includes(search.toLowerCase()) || f.crop_type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', maxWidth: '320px', zIndex: 100 }}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          background: isOpen ? 'var(--cs-card-alt)' : 'transparent',
          padding: '8px 12px', borderRadius: '14px', cursor: 'pointer',
          transition: 'background 0.2s', margin: '-8px -12px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h2 style={{ 
            fontSize: 18, fontWeight: 900, color: 'var(--cs-text)', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {activeFarm?.farm_name || 'Select Farm'}
          </h2>
          {activeFarm?.latitude && activeFarm?.longitude && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPin size={11} color="var(--cs-text-sec)" />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--cs-text-sec)', fontFamily: 'monospace' }}>
                {parseFloat(activeFarm.latitude).toFixed(4)}°N, {parseFloat(activeFarm.longitude).toFixed(4)}°E
              </span>
            </div>
          )}
        </div>
        <ChevronDown 
          size={18} 
          color="var(--cs-text)" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0, marginLeft: 8 }} 
        />
      </div>

      {/* Dropdown Menu */}
      <div style={{
        position: 'absolute', top: '100%', left: '-12px', right: '-12px', marginTop: '12px',
        background: 'var(--cs-card)', borderRadius: '18px', border: '1px solid var(--cs-border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: '400px'
      }}>
        
        {/* Search Bar (Only if > 5 farms) */}
        {farms.length > 5 && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--cs-border-soft)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--cs-text-muted)" style={{ position: 'absolute', left: 10 }} />
              <input 
                type="text" 
                placeholder="Search farms..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'var(--cs-bg)', border: 'none', borderRadius: '10px',
                  padding: '8px 10px 8px 32px', fontSize: 13, color: 'var(--cs-text)', outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        )}

        {/* Farm List */}
        <div style={{ overflowY: 'auto', padding: '6px' }}>
          {filteredFarms.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cs-text-muted)', fontSize: 13 }}>No farms found</div>
          ) : (
            filteredFarms.map(f => {
              const isActive = String(f.id) === String(state.activeFarmId);
              const health = getHealthStatus(f.analysis);
              const areaStr = f.area ? formatArea(f.area, state.preferences?.units) : 'Area Unknown';
              
              return (
                <div 
                  key={f.id}
                  onClick={() => {
                    setCurrentFarm(f.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    background: isActive ? 'var(--cs-accent-light)' : 'transparent',
                    transition: 'background 0.2s',
                    marginBottom: 2
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'var(--cs-bg)'; }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--cs-accent)' : 'var(--cs-text)' }}>
                        {f.farm_name}
                      </span>
                      {isActive && <Check size={14} color="var(--cs-accent)" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--cs-text-muted)', fontWeight: 600 }}>{f.crop_type || 'Data unavailable'}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cs-icon-dim)' }} />
                      <span style={{ fontSize: 11, color: 'var(--cs-text-muted)', fontWeight: 600 }}>{areaStr}</span>
                    </div>
                  </div>
                  
                  {/* Health Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--cs-card)', padding: '4px 8px', borderRadius: '20px', border: '1px solid var(--cs-border-soft)', boxShadow: '0 1px 2px var(--cs-shadow)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: health.ring }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cs-text)', textTransform: 'uppercase' }}>{health.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
