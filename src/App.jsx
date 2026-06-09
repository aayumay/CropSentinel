import React, { useState } from 'react';
import { Home, Sprout, TrendingUp, Bell, User } from 'lucide-react';

import { I18nProvider, useI18n } from './I18nContext';
import { ThemeProvider } from './ThemeContext';

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

const BOTTOM_NAV_SCREENS = ['home','farms','insights','alerts','profile'];

function AppNavigation() {
  const { t } = useI18n();
  const [phase, setPhase]   = useState('welcome');
  const [screen, setScreen] = useState('home');

  const navigate = (to) => {
    if (to === 'welcome') { setPhase('welcome'); setScreen('home'); return; }
    setScreen(to);
  };

  const NAV_ITEMS = [
    { key: 'home',     Icon: Home,       label: t('home')     },
    { key: 'farms',    Icon: Sprout,     label: t('farms')    },
    { key: 'insights', Icon: TrendingUp, label: t('insights') },
    { key: 'alerts',   Icon: Bell,       label: t('alerts'),  badge: true },
    { key: 'profile',  Icon: User,       label: t('profile')  },
  ];

  const renderScreen = () => {
    if (phase === 'welcome') return <WelcomeScreen onStart={() => setPhase('login')} />;
    if (phase === 'login')   return <LoginScreen   onLogin={() => setPhase('app')}  />;

    switch (screen) {
      case 'home':                  return <HomeScreen             onNavigate={navigate} />;
      case 'farms':                 return <FarmsListScreen         onNavigate={navigate} />;
      case 'farm_detail':           return <FarmsScreen             onNavigate={navigate} />;
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
    </div>
  );
}

import { Toaster } from 'react-hot-toast';

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
