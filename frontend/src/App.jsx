import React, { useState } from 'react';
import { Home, Sprout, TrendingUp, Bell, User, AlertTriangle } from 'lucide-react';

import { I18nProvider, useI18n } from './I18nContext';
import { ThemeProvider } from './ThemeContext';
import { useCropSentinel, AppProvider } from './state/AppContext';

import WelcomeScreen          from './screens/WelcomeScreen';
import LoginScreen             from './screens/LoginScreen';
import HomeScreen              from './screens/HomeScreen';
import FarmsListScreen         from './screens/FarmsListScreen';
import FarmsScreen             from './screens/FarmsScreen';
import InterventionScreen      from './screens/InterventionScreen';
import InsightsScreen          from './screens/InsightsScreen';
import AlertsScreen            from './screens/AlertsScreen';
import ProfileScreen           from './screens/ProfileScreen';
import AddFieldScreen          from './screens/AddFieldScreen';
import SettingsScreen          from './screens/SettingsScreen';
import NotificationSettings    from './screens/NotificationSettings';
import HelpSupportScreen       from './screens/HelpSupportScreen';
import AboutScreen             from './screens/AboutScreen';
import FarmDetailsConfigScreen from './screens/FarmDetailsConfigScreen';
import EditProfileScreen       from './screens/EditProfileScreen';
import SoilIntelligenceScreen  from './screens/SoilIntelligenceScreen';

const BOTTOM_NAV_SCREENS = ['home','farms','insights','alerts','profile'];

function AppNavigation() {
  const { t } = useI18n();
  const { state } = useCropSentinel();
  const getInitialState = () => {
    const hasToken = localStorage.getItem('cs_token');
    const p = localStorage.getItem('cs_phase');
    const s = localStorage.getItem('cs_screen');
    if (hasToken) {
      if (!p || p === 'welcome' || p === 'login') return { phase: 'app', screen: 'home' };
      return { phase: p, screen: s || 'home' };
    } else {
      // Route Protection: Redirect unauthenticated app access to login
      if (p === 'app') return { phase: 'login', screen: 'home' };
      return { phase: p || 'welcome', screen: s || 'home' };
    }
  };

  const [phase, setPhase]   = useState(() => getInitialState().phase);
  const [screen, setScreen] = useState(() => getInitialState().screen);

  React.useEffect(() => {
    // Set initial history state on mount
    window.history.replaceState({ phase, screen }, '');

    const handlePopState = (e) => {
      if (e.state) {
        setPhase(e.state.phase || 'welcome');
        setScreen(e.state.screen || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('cs_phase', phase);
    localStorage.setItem('cs_screen', screen);
    
    // Continuous Route Protection
    const hasToken = localStorage.getItem('cs_token');
    if (phase === 'app' && !hasToken) {
      setPhase('login');
      window.history.replaceState({ phase: 'login', screen: 'home' }, '');
    }
  }, [phase, screen]);

  const handleSetPhase = (newPhase) => {
    window.history.pushState({ phase: newPhase, screen: screen }, '');
    setPhase(newPhase);
  };

  const navigate = (to) => {
    if (to === 'welcome') { 
      window.history.pushState({ phase: 'welcome', screen: 'home' }, '');
      setPhase('welcome'); 
      setScreen('home'); 
      return; 
    }
    if (to !== screen) {
      window.history.pushState({ phase: phase, screen: to }, '');
      setScreen(to);
    }
  };

  const NAV_ITEMS = [
    { key: 'home',     Icon: Home,       label: t('home')     },
    { key: 'farms',    Icon: Sprout,     label: t('farms')    },
    { key: 'insights', Icon: TrendingUp, label: t('insights') },
    { key: 'alerts',   Icon: Bell,       label: t('alerts'),  badge: true },
    { key: 'profile',  Icon: User,       label: t('profile')  },
  ];

  const renderScreen = () => {
    if (phase === 'welcome') return <WelcomeScreen onStart={() => handleSetPhase('login')} />;
    if (phase === 'login')   return <LoginScreen   onLogin={() => { handleSetPhase('app'); setScreen('edit_profile'); }}  />;

    // The blocking error screen has been removed. Errors are now shown via a non-blocking top banner.

    switch (screen) {
      case 'home':                  return <HomeScreen             onNavigate={navigate} />;
      case 'farms':                 return <FarmsListScreen         onNavigate={navigate} />;
      case 'farm_detail':           return <FarmsScreen             onNavigate={navigate} />;
      case 'soil_intelligence':     return <SoilIntelligenceScreen  onNavigate={navigate} />;
      case 'intervention':          return <InterventionScreen      onNavigate={navigate} />;
      case 'insights':              return <InsightsScreen          onNavigate={navigate} />;
      case 'alerts':                return <AlertsScreen            onNavigate={navigate} />;
      case 'profile':               return <ProfileScreen           onNavigate={navigate} />;
      case 'edit_profile':          return <EditProfileScreen       onNavigate={navigate} />;
      case 'add_field':             return <AddFieldScreen          onNavigate={navigate} />;
      case 'settings':              return <SettingsScreen          onNavigate={navigate} />;
      case 'notification_settings': return <NotificationSettings    onNavigate={navigate} />;
      case 'help_support':          return <HelpSupportScreen       onNavigate={navigate} />;
      case 'about':                 return <AboutScreen             onNavigate={navigate} />;
      case 'farm_details_config':   return <FarmDetailsConfigScreen onNavigate={navigate} />;
      default:                      return <HomeScreen             onNavigate={navigate} />;
    }
  };

  const showNav = phase === 'app' && BOTTOM_NAV_SCREENS.includes(screen);

  return (
    <div className="app-shell-desktop" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      background: 'var(--cs-bg)',
    }}>
      {/* Main content area — fills all space beside the nav */}
      <div style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {phase === 'app' && state.error && (
          <div style={{ background: '#FEF2F2', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #FEE2E2', zIndex: 100 }}>
            <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#991B1B', fontWeight: 600, lineHeight: 1.4 }}>
              Unable to reach server. Some live data may be unavailable.
            </p>
          </div>
        )}
        {renderScreen()}
      </div>

      {/* Bottom nav (mobile) / Left sidebar (desktop via CSS) */}
      {showNav && (
        <nav className="app-nav">
          {NAV_ITEMS.map(({ key, Icon, label, badge }) => {
            const active = screen === key;
            return (
              <button
                key={key}
                onClick={() => navigate(key)}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {badge && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 8, height: 8,
                      background: 'var(--cs-danger)',
                      borderRadius: '50%',
                      border: '2px solid var(--cs-card)',
                    }} />
                  )}
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Floating Chatbot only shown on main app screens */}
      {phase === 'app' && <FloatingChatbot />}
    </div>
  );
}

import { Toaster } from 'react-hot-toast';
import FloatingChatbot from './components/FloatingChatbot';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppNavigation />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--cs-card)',
              color: 'var(--cs-text)',
              border: '1px solid var(--cs-border)',
              borderRadius: '12px',
              fontWeight: 600,
            },
          }}
        />
      </I18nProvider>
    </ThemeProvider>
  );
}
