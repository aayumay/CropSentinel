import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronRight, MapPin, Check, X, Navigation, Crosshair } from 'lucide-react';
import leavesBottomRight from '../assets/leaves-bottom-right.png';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useI18n } from '../I18nContext';
import toast from 'react-hot-toast';

import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

/* ── Fix default Leaflet icon ── */
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

/* ── Custom green farm pin ── */
const GreenIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 11.08 16 26 16 26S32 27.08 32 16C32 7.16 24.84 0 16 0z"
        fill="#4A7C59" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <circle cx="16" cy="16" r="4" fill="#4A7C59"/>
    </svg>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  className: '',
});

/* ── Blue GPS pulse dot ── */
const GpsIcon = L.divIcon({
  html: `
    <div style="
      width:20px;height:20px;border-radius:50%;
      background:rgba(59,130,246,0.25);
      border:2.5px solid #3B82F6;
      box-shadow:0 0 0 6px rgba(59,130,246,0.12);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="width:8px;height:8px;border-radius:50%;background:#3B82F6;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
});

/* ── Inner map component: handles clicks + fly-to ── */
function LocationMarker({ position, setPosition, gpsPos, flyTo, setFlyTo }) {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, 16, { animate: true, duration: 1.2 });
      setFlyTo(null);
    }
  }, [flyTo, map, setFlyTo]);

  useMapEvents({
    click(e) { setPosition(e.latlng); },
  });

  return (
    <>
      {gpsPos && <Marker position={gpsPos} icon={GpsIcon} />}
      {position && <Marker position={position} icon={GreenIcon} />}
    </>
  );
}

/* ── Shared styles ── */
const S = {
  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'var(--cs-text-sec)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 6,
  },
  input: {
    width: '100%', background: 'var(--cs-card)',
    border: '1.5px solid var(--cs-border)', borderRadius: 16,
    padding: '14px 16px', fontSize: 14, color: 'var(--cs-text)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
};

/* ══════════════════════════════════════════════════════════════════════
   MAP PICKER (full-screen panel — shown when user taps "Select on map")
══════════════════════════════════════════════════════════════════════ */
function MapPicker({ position, setPosition, gpsPos, flyTo, setFlyTo, gpsLoading, gpsError, onGps, onCancel, onConfirm }) {
  const { t } = useI18n();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      background: 'var(--cs-bg)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--cs-card)',
        borderBottom: '1px solid var(--cs-border-soft)',
        flexShrink: 0,
        boxShadow: '0 2px 8px var(--cs-shadow)',
      }}>
        <button
          onClick={onCancel}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--cs-text-sec)', fontSize:14, fontWeight:600, fontFamily:'inherit', padding:0 }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 style={{ fontSize:16, fontWeight:800, color:'var(--cs-text)', margin:0 }}>
          📍 {t('select_location')}
        </h2>
        {/* GPS button */}
        <button
          onClick={onGps}
          disabled={gpsLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 14px', borderRadius: 10,
            border: '1.5px solid var(--cs-accent)',
            background: gpsLoading ? 'var(--cs-accent-light)' : 'var(--cs-accent)',
            color: gpsLoading ? 'var(--cs-accent)' : '#fff',
            fontSize: 12, fontWeight: 700,
            cursor: gpsLoading ? 'wait' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          {gpsLoading ? (
            <>
              <svg style={{ animation:'spin 0.8s linear infinite' }} width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Locating…
            </>
          ) : (
            <>
              <Crosshair size={12} />
              My Location
            </>
          )}
        </button>
      </div>

      {/* GPS error strip */}
      {gpsError && (
        <div style={{ background:'#FEF2F2', borderBottom:'1px solid #FECACA', padding:'8px 20px', flexShrink:0 }}>
          <p style={{ fontSize:12, color:'#DC2626', fontWeight:600, margin:0 }}>⚠️ {gpsError}</p>
        </div>
      )}

      {/* THE MAP — explicit height so Leaflet renders */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapContainer
          center={position ? [position.lat, position.lng] : gpsPos ? [gpsPos.lat, gpsPos.lng] : [22.2887, 73.3634]}
          zoom={15}
          style={{ width: '100%', height: '100%', minHeight: '400px' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            gpsPos={gpsPos}
            flyTo={flyTo}
            setFlyTo={setFlyTo}
          />
        </MapContainer>

        {/* Tap hint — shows until user pins */}
        {!position && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.65)', color: '#fff',
            padding: '10px 20px', borderRadius: 24,
            fontSize: 13, fontWeight: 600,
            pointerEvents: 'none', zIndex: 999, whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
          }}>
            📍 Tap anywhere on the map to pin your farm
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--cs-card)',
        borderTop: '1px solid var(--cs-border-soft)',
        boxShadow: '0 -4px 16px var(--cs-shadow)',
        flexShrink: 0,
      }}>
        {/* Coordinate display */}
        <div style={{
          background: 'var(--cs-bg)', borderRadius: 14,
          padding: '12px 16px', marginBottom: 12,
          border: '1px solid var(--cs-border-soft)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: position ? 'var(--cs-accent-light)' : 'var(--cs-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MapPin size={16} style={{ color: position ? 'var(--cs-accent)' : 'var(--cs-text-muted)' }} />
          </div>
          {position ? (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--cs-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>
                Farm Coordinates (Pinned ✓)
              </p>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--cs-text)', margin: 0, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                {position.lat.toFixed(6)}°N, &nbsp;{position.lng.toFixed(6)}°E
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--cs-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>No Location Selected</p>
              <p style={{ fontSize: 12, color: 'var(--cs-text-muted)', margin: 0 }}>Tap the map above to drop a pin</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px', borderRadius: 14,
              border: '1.5px solid var(--cs-border)', background: 'var(--cs-bg)',
              color: 'var(--cs-text-sec)', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!position}
            style={{
              flex: 2, padding: '14px', borderRadius: 14, border: 'none',
              background: position ? 'var(--cs-accent)' : '#D1D5DB',
              color: '#FFFFFF', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: position ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              transition: 'background 0.2s',
              boxShadow: position ? '0 4px 12px rgba(74,124,89,0.3)' : 'none',
            }}
          >
            <Check size={15} /> {t('confirm')} Location
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════════════════════════ */
export default function AddFieldScreen({ onNavigate }) {
  const { t } = useI18n();
  const [farmName,   setFarmName]   = useState('');
  const [cropType,   setCropType]   = useState('');
  const [soilType,   setSoilType]   = useState('');
  const [area,       setArea]       = useState('');
  const [isMapOpen,  setIsMapOpen]  = useState(false);
  const [position,   setPosition]   = useState(null);
  const [gpsPos,     setGpsPos]     = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState('');
  const [flyTo,      setFlyTo]      = useState(null);
  const [isSaving,   setIsSaving]   = useState(false);

  /* ── GPS location ── */
  const handleGetLocation = useCallback(() => {
    setGpsLoading(true);
    setGpsError('');
    
    // As per user request: click "My Location" to immediately focus on Parul University
    setTimeout(() => {
      const parulLatlng = { lat: 22.2887, lng: 73.3634 };
      setGpsPos(parulLatlng);
      setPosition(parulLatlng);
      setFlyTo(parulLatlng);
      setGpsLoading(false);
    }, 400); // Slight delay for UX
  }, []);

  const handleSave = async () => {
    if (!farmName || !cropType || !position) {
      toast.error(t('validation_error'));
      return;
    }
    const payload = {
      farm_name: farmName, crop_type: cropType,
      soil_type: soilType, area,
      latitude: position.lat, longitude: position.lng,
    };
    setIsSaving(true);
    try {
      await axios.post('http://localhost:8000/api/farms', payload).catch(() =>
        console.warn('Backend offline — payload logged:', payload)
      );
      onNavigate('farms');
    } catch {
      toast.error('Failed to save farm. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── When map picker is open, show it full-screen ── */
  if (isMapOpen) {
    return (
      <MapPicker
        position={position}
        setPosition={setPosition}
        gpsPos={gpsPos}
        flyTo={flyTo}
        setFlyTo={setFlyTo}
        gpsLoading={gpsLoading}
        gpsError={gpsError}
        onGps={handleGetLocation}
        onCancel={() => { setIsMapOpen(false); setPosition(null); }}
        onConfirm={() => setIsMapOpen(false)}
      />
    );
  }

  /* ── Form view ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--cs-bg)', position: 'relative', overflow: 'hidden' }}>
      <img src={leavesBottomRight} alt="" style={{ position:'absolute', bottom:0, right:0, width:140, pointerEvents:'none', opacity:0.35, zIndex:0 }} />

      {/* Header */}
      <div style={{ padding: '24px 24px 12px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => onNavigate('farms')}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--cs-card)', border:'1px solid var(--cs-border-soft)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px var(--cs-shadow)' }}
        >
          <ArrowLeft size={16} strokeWidth={2} style={{ color:'var(--cs-text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:'var(--cs-text)', margin:0 }}>{t('add_field_title')}</h1>
          <p style={{ fontSize:12, color:'var(--cs-text-muted)', margin:'2px 0 0', fontWeight:500 }}>Fill details and pin your farm on the map</p>
        </div>
      </div>

      {/* ── Form — two column on desktop ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>

          {/* ── Left column: Field details ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--cs-card)', borderRadius: 20,
              border: '1px solid var(--cs-border-soft)',
              boxShadow: '0 1px 6px var(--cs-shadow)',
              padding: '20px 20px',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--cs-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
                Field Information
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Field Name */}
                <div>
                  <label style={S.label}>{t('field_name')}</label>
                  <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="e.g., My North Farm" style={S.input} />
                </div>

                {/* Crop Type */}
                <div>
                  <label style={S.label}>{t('crop_type_label')}</label>
                  <div style={{ position: 'relative' }}>
                    <select value={cropType} onChange={e => setCropType(e.target.value)} style={{ ...S.input, appearance: 'none', paddingRight: 36 }}>
                      <option value="" disabled>{t('choose_crop')}</option>
                      <option value="Wheat">{t('wheat')}</option>
                      <option value="Rice">{t('rice')}</option>
                      <option value="Cotton">{t('cotton')}</option>
                      <option value="Sugarcane">{t('sugarcane')}</option>
                      <option value="Corn">{t('corn')}</option>
                    </select>
                    <ChevronRight size={14} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%) rotate(90deg)', color:'var(--cs-text-muted)', pointerEvents:'none' }} />
                  </div>
                </div>

                {/* Soil Type */}
                <div>
                  <label style={S.label}>{t('soil_type')}</label>
                  <div style={{ position: 'relative' }}>
                    <select value={soilType} onChange={e => setSoilType(e.target.value)} style={{ ...S.input, appearance: 'none', paddingRight: 36 }}>
                      <option value="" disabled>{t('choose_soil')}</option>
                      <option value="Sandy">Sandy</option>
                      <option value="Clay">Clay</option>
                      <option value="Loamy">Loamy</option>
                      <option value="Silty">Silty</option>
                      <option value="Peaty">Peaty</option>
                    </select>
                    <ChevronRight size={14} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%) rotate(90deg)', color:'var(--cs-text-muted)', pointerEvents:'none' }} />
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label style={S.label}>{t('field_area')}</label>
                  <input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g., 5.2 acres" style={S.input} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: Location picker ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--cs-card)', borderRadius: 20,
              border: '1px solid var(--cs-border-soft)',
              boxShadow: '0 1px 6px var(--cs-shadow)',
              padding: '20px 20px',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--cs-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
                Farm Location
              </p>

              {/* Location button */}
              <div
                onClick={() => setIsMapOpen(true)}
                style={{
                  background: 'var(--cs-bg)', border: position ? '2px solid var(--cs-accent)' : '2px dashed var(--cs-border)',
                  borderRadius: 16, padding: '18px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', marginBottom: 12,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: position ? 'var(--cs-accent)' : 'var(--cs-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <MapPin size={20} style={{ color: position ? '#fff' : 'var(--cs-text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {position ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--cs-accent)', margin: '0 0 2px' }}>Location Pinned ✓</p>
                      <p style={{ fontSize: 12, color: 'var(--cs-text-muted)', margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {position.lat.toFixed(5)}°N, {position.lng.toFixed(5)}°E
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--cs-text)', margin: '0 0 2px' }}>Select on Map</p>
                      <p style={{ fontSize: 12, color: 'var(--cs-text-muted)', margin: 0 }}>Tap to open the map and pin your farm</p>
                    </>
                  )}
                </div>
                <ChevronRight size={16} style={{ color: 'var(--cs-text-muted)', flexShrink: 0 }} />
              </div>

              {/* GPS shortcut */}
              <button
                onClick={() => { setIsMapOpen(true); setTimeout(handleGetLocation, 400); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 16px', borderRadius: 14,
                  border: '1.5px solid var(--cs-accent)',
                  background: 'var(--cs-accent-light)',
                  color: 'var(--cs-accent)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                <Navigation size={14} />
                Use Current GPS Location
              </button>

              {/* Coordinate detail card — shown when pinned */}
              {position && (
                <div style={{
                  marginTop: 14, background: 'var(--cs-bg)', borderRadius: 14,
                  padding: '14px 16px', border: '1px solid var(--cs-border-soft)',
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--cs-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                    📍 Farm Coordinates
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'var(--cs-card)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--cs-border-soft)' }}>
                      <p style={{ fontSize: 9, color: 'var(--cs-text-muted)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 3px' }}>Latitude</p>
                      <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--cs-accent)', margin: 0, fontFamily: 'monospace' }}>
                        {position.lat.toFixed(6)}°N
                      </p>
                    </div>
                    <div style={{ background: 'var(--cs-card)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--cs-border-soft)' }}>
                      <p style={{ fontSize: 9, color: 'var(--cs-text-muted)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 3px' }}>Longitude</p>
                      <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--cs-accent)', margin: 0, fontFamily: 'monospace' }}>
                        {position.lng.toFixed(6)}°E
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMapOpen(true)}
                    style={{
                      marginTop: 10, width: '100%', padding: '8px', borderRadius: 10,
                      border: '1px solid var(--cs-border)', background: 'none',
                      color: 'var(--cs-text-sec)', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Change Location
                  </button>
                </div>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: isSaving ? '#9CA3AF' : 'var(--cs-accent)',
                color: '#FFFFFF', fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                boxShadow: isSaving ? 'none' : '0 4px 16px rgba(74,124,89,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {isSaving ? (
                <>
                  <svg style={{ animation:'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  {t('saving_field')}
                </>
              ) : t('save_field')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
