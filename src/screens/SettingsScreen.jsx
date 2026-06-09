import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Key, Lock } from 'lucide-react';
import settingsLeaves from '../assets/settings-leaves.png';
import { useI18n } from '../I18nContext';
import { useTheme } from '../ThemeContext';

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

function ChangePasswordModal({ onClose }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!current) { setError('Please enter your current password.'); return; }
    if (newPass !== confirm) { setError(t('passwords_no_match')); return; }
    if (newPass.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setError('');
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1400);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--cs-card)', width: '100%', maxWidth: 420, margin: '0 auto',
          borderRadius: '28px 28px 0 0', padding: '24px 20px 40px',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ width: 40, height: 4, background: 'var(--cs-border)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--cs-text)', margin: '0 0 20px', textAlign: 'center' }}>
          {t('change_password_title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: t('current_password'), val: current, set: setCurrent },
            { label: t('new_password'),     val: newPass, set: setNewPass },
            { label: t('confirm_password'), val: confirm, set: setConfirm },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--cs-text-sec)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {field.label}
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--cs-text-muted)' }} />
                <input
                  type="password"
                  value={field.val}
                  onChange={e => field.set(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--cs-bg)',
                    border: '1.5px solid var(--cs-border)', borderRadius: 14,
                    paddingLeft: 40, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                    fontSize: 14, color: 'var(--cs-text)', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          ))}
          {error && (
            <p style={{ color: 'var(--cs-danger)', fontSize: 12, fontWeight: 600, margin: 0, textAlign: 'center' }}>
              {error}
            </p>
          )}
          <button
            onClick={handleSave}
            style={{
              marginTop: 8, width: '100%',
              background: saved ? '#16A34A' : 'var(--cs-accent)',
              color: '#FFFFFF',
              fontWeight: 800, fontSize: 15, padding: '15px',
              borderRadius: 16, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.3s',
            }}
          >
            <Lock size={16} />
            {saved ? '✓ ' + t('password_updated') : t('update_password')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsScreen({ onNavigate }) {
  const { t, language, setLanguage } = useI18n();
  const { isDark, setIsDark } = useTheme();

  const [units,     setUnits]     = useState('metric');
  const [autoSync,  setAutoSync]  = useState(true);
  const [location,  setLocation]  = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

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
            value={units} onChange={setUnits}
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
          <Row label={t('auto_sync')}      sub={t('auto_sync_sub')}  toggle value={autoSync}  onChange={setAutoSync} />
          <Row label={t('location_access')} sub={t('location_sub')} toggle value={location}   onChange={setLocation} />
          <Row label={t('share_analytics')} sub={t('share_sub')}    toggle value={analytics}  onChange={setAnalytics} isLast />
        </Section>

        <Section title={t('account')}>
          <Row label={t('change_password')} value="" onClick={() => setShowPassModal(true)} />
          <Row label={t('linked_devices')}  value="1 Device" />
          <Row label={t('export_data')}     value="" isLast />
        </Section>

        <Section title={t('about')}>
          <Row label={t('version')}   value="1.0.0" />
          <Row label={t('rate_app')}  value="⭐⭐⭐⭐⭐" isLast />
        </Section>

        <button style={{
          width: '100%', background: 'var(--cs-danger-light)',
          border: '1.5px solid var(--cs-danger-border)',
          borderRadius: 16, padding: '14px', fontSize: 14, fontWeight: 700,
          color: 'var(--cs-danger)', cursor: 'pointer',
        }}>
          {t('delete_account')}
        </button>
      </div>

      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} />}
    </div>
  );
}
