import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Key, Lock } from 'lucide-react';
import settingsLeaves from '../assets/settings-leaves.png';
import { useI18n } from '../I18nContext';
import { useTheme } from '../ThemeContext';
import { useCropSentinel } from '../state/AppContext';

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
        background: value ? 'var(--cs-accent)' : 'var(--cs-toggle-off)',
        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left 0.25s',
      }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: 'var(--cs-accent)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: 8, paddingLeft: 4,
      }}>{title}</p>
      <div style={{
        background: 'var(--cs-card)', borderRadius: 24, overflow: 'hidden',
        border: '1px solid var(--cs-border-soft)',
        boxShadow: '0 1px 4px var(--cs-shadow)',
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, sub, value, toggle, onChange, isLast, onClick }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--cs-bg)',
        cursor: (toggle || onClick) ? 'pointer' : 'default',
      }}
      onClick={toggle ? () => onChange(!value) : onClick}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cs-text)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--cs-text-muted)', margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {toggle
        ? <Toggle value={value} onChange={onChange} />
        : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--cs-text-muted)' }}>{value}</span>
            <ChevronRight size={14} style={{ color: 'var(--cs-icon-dim)' }} />
          </div>
        )
      }
    </div>
  );
}

function OptionPicker({ label, options, value, onChange, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--cs-bg)' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cs-text)', margin: 0 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--cs-text-muted)' }}>
            {options.find(o => o.key === value)?.label ?? value}
          </span>
          <ChevronRight size={14} style={{
            color: 'var(--cs-icon-dim)',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }} />
        </div>
      </div>
      {open && (
        <div style={{ background: 'var(--cs-bg)', padding: '4px 0 8px' }}>
          {options.map(opt => (
            <div
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', cursor: 'pointer' }}
            >
              <span style={{
                fontSize: 13,
                color: value === opt.key ? 'var(--cs-accent)' : 'var(--cs-text)',
                fontWeight: value === opt.key ? 700 : 500,
              }}>
                {opt.label}
              </span>
              {value === opt.key && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cs-accent)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Change Password feature removed by user request.

export default function SettingsScreen({ onNavigate }) {
  const { t, language, setLanguage } = useI18n();
  const { isDark, setIsDark } = useTheme();
  const { state, setState } = useCropSentinel();

  const prefs = state.preferences;
  const setPref = (key, value) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  };



  const handleExportData = () => {
    const dataToExport = {
      profile: state.profileData,
      farms: state.farms,
      preferences: state.preferences,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CropSentinel_Export.json';
    a.click();
    URL.revokeObjectURL(url);
  };


  const themeKey = isDark ? 'dark' : 'light';

  return (
    <div className="content-max" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--cs-bg)', position: 'relative', overflow: 'hidden' }}>
      <img src={settingsLeaves} alt="" style={{ position: 'absolute', top: 0, right: 0, width: 112, pointerEvents: 'none', opacity: 0.5, zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: '24px 20px 16px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onNavigate('profile')}
          style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--cs-card)',
            border: '1px solid var(--cs-border-soft)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px var(--cs-shadow)',
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} style={{ color: 'var(--cs-text)' }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--cs-text)', margin: 0 }}>
          {t('settings')}
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 32px', position: 'relative', zIndex: 10, overflowY: 'auto' }}>

        <Section title={t('preferences')}>
          <OptionPicker
            label={t('units')}
            options={[{ key: 'metric', label: 'Metric (°C, mm)' }, { key: 'imperial', label: 'Imperial (°F, in)' }]}
            value={prefs.units} onChange={(val) => setPref('units', val)}
          />
          <OptionPicker
            label={t('language')}
            options={[{ key: 'en', label: 'English' }, { key: 'hi', label: 'हिन्दी' }, { key: 'gu', label: 'ગુજરાતી' }]}
            value={language} onChange={setLanguage}
          />
          {/* Theme picker — directly connected to ThemeContext */}
          <OptionPicker
            label={t('theme')}
            options={[
              { key: 'light', label: '☀️  Light  (Beige)' },
              { key: 'dark',  label: '🌑  Dark  (Deep Green)' },
            ]}
            value={themeKey}
            onChange={val => setIsDark(val === 'dark')}
            isLast
          />
        </Section>

        <Section title={t('data_privacy')}>
          <Row label={t('auto_sync')}      sub={t('auto_sync_sub')}  toggle value={prefs.autoSync}  onChange={(val) => setPref('autoSync', val)} />
          <Row label={t('location_access')} sub={t('location_sub')} toggle value={prefs.location}   onChange={(val) => setPref('location', val)} />
          <Row label={t('share_analytics')} sub={t('share_sub')}    toggle value={prefs.analytics}  onChange={(val) => setPref('analytics', val)} isLast />
        </Section>

        <Section title={t('account')}>
          <Row label={t('linked_devices')}  value="1 Device" />
          <Row label={t('export_data')}     value="" onClick={handleExportData} isLast />
        </Section>

        <Section title={t('about')}>
          <Row label={t('version')}   value="1.0.0" />
          <Row label={t('rate_app')}  value="⭐⭐⭐⭐⭐" isLast />
        </Section>

      </div>
    </div>
  );
}
