import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import leavesTopRight from '../assets/leaves-top-right.png';
import onboardingFarm from '../assets/onboarding-farm.png';
import { useI18n } from '../I18nContext';

export default function LoginScreen({ onLogin }) {
  const { t } = useI18n();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  };

  return (
    <div className="split-auth-container">
      <img src={leavesTopRight} className="mobile-only" alt="" style={{
        position: 'absolute', top: 0, right: 0, width: 112,
        pointerEvents: 'none', userSelect: 'none', zIndex: 0, opacity: 0.6,
      }} />

      {/* Left Side: Form & Branding */}
      <div className="split-auth-brand" style={{ position: 'relative', zIndex: 10, overflowY: 'auto' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 52px)',
          paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
        }}>
          <svg width="44" height="44" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 12 }}>
            <path d="M36 62 C36 62,14 46,16 22 C16 8,36 8,36 8" fill="#6B9B58" />
            <path d="M36 62 C36 62,20 44,30 16 C38 8,54 18,36 62" fill="#3d6b4a" />
            <line x1="36" y1="62" x2="54" y2="30" stroke="#C9913A" strokeWidth="4.5" strokeLinecap="round"/>
            {[[54,28],[50,33],[46,38]].map(([cx,cy],i) => (
              <ellipse key={i} cx={cx} cy={cy} rx="3.5" ry="2.5" transform={`rotate(-30 ${cx} ${cy})`} fill="#C9913A" />
            ))}
          </svg>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--cs-text)', margin: 0 }}>
            {t('welcome_back')}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--cs-text-dim)', fontWeight: 500, margin: '4px 0 0' }}>
            {t('login_to_continue')}
          </p>
        </div>

        {/* Form */}
        <div className="content-max" style={{
          width: '100%', maxWidth: 400, margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          padding: '0 24px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          gap: 16,

      }}>
        {/* Email */}
        <div>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--cs-text-sec)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            {t('email_label')}
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--cs-text-muted)' }} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{
                width:'100%', background:'var(--cs-card)',
                border:'1.5px solid var(--cs-border)', borderRadius:16,
                paddingLeft:40, paddingRight:16, paddingTop:14, paddingBottom:14,
                fontSize:14, color:'var(--cs-text)', outline:'none',
                boxSizing:'border-box', fontFamily:'inherit',
                boxShadow:'0 1px 3px var(--cs-shadow)',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--cs-text-sec)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
            {t('password_label')}
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--cs-text-muted)' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              style={{
                width:'100%', background:'var(--cs-card)',
                border:'1.5px solid var(--cs-border)', borderRadius:16,
                paddingLeft:40, paddingRight:44, paddingTop:14, paddingBottom:14,
                fontSize:14, color:'var(--cs-text)', outline:'none',
                boxSizing:'border-box', fontFamily:'inherit',
                boxShadow:'0 1px 3px var(--cs-shadow)',
              }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--cs-text-muted)', padding:0 }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ textAlign:'right', marginTop:6 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--cs-accent)', cursor:'pointer' }}>{t('forgot_password')}</span>
          </div>
        </div>

        {/* Login button */}
        <button onClick={handleLogin} disabled={loading} style={{
          width:'100%', background:'var(--cs-accent)', color:'#FFFFFF',
          fontWeight:700, fontSize:15, padding:'15px 24px', borderRadius:14,
          border:'none', cursor: loading ? 'not-allowed' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          marginTop:4, transition:'background 0.2s', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {t('login_btn')}…
            </>
          ) : t('login_btn')}
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
          <div style={{ flex:1, height:1, background:'var(--cs-border)' }} />
          <span style={{ fontSize:11, color:'var(--cs-text-dim)', fontWeight:500 }}>{t('or_continue_with')}</span>
          <div style={{ flex:1, height:1, background:'var(--cs-border)' }} />
        </div>

        {/* Social buttons */}
        <div style={{ display:'flex', gap:12 }}>
          {[
            { label: 'Google', svg: (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )},
            { label: 'Apple', svg: (
              <svg width="16" height="18" viewBox="0 0 24 24" fill="var(--cs-text)">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            )},
          ].map(({ label, svg }) => (
            <button key={label} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background:'var(--cs-card)', border:'1.5px solid var(--cs-border)', borderRadius:14,
              padding:'12px 16px', fontSize:13, fontWeight:700, color:'var(--cs-text)',
              cursor:'pointer', boxShadow:'0 1px 3px var(--cs-shadow)', fontFamily:'inherit',
            }}>
              {svg} {label}
            </button>
          ))}
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--cs-text-dim)', margin:'8px 0 0' }}>
          {t('new_farmer')}{' '}
          <span style={{ fontWeight:700, color:'var(--cs-accent)', cursor:'pointer' }}>{t('create_account')}</span>
        </p>
      </div>
      </div>

      {/* Right Side: Visual */}
      <div className="split-auth-visual desktop-only">
        <img src={onboardingFarm} alt="Farm landscape" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center center' }} />
      </div>
    </div>
  );
}
