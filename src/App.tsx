import React from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import GamePlatform from './components/GamePlatform';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './contexts/AuthContext';
import GameList from './components/GameList';
import GameRoom from './components/GameRoom';
import EnhancedGameRoom from './components/EnhancedGameRoom';
import WalletPage from './components/WalletPage';
import TransactionHistory from './components/TransactionHistory';
import CreateGameModal from './components/CreateGameModal';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import InteractiveTutorial from './components/InteractiveTutorial';
import VoiceSettings from './components/VoiceSettings';
import LanguageSelector from './components/LanguageSelector';
import AdminPage from './components/AdminPage';
import './index.css';
import { TooltipProvider } from './components/ui/Tooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from './components/ui/Tooltip';
import { ToastProvider, ToastViewport } from './components/ui/Toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './components/ui/DropdownMenu';
import { useLanguage } from './contexts/LanguageContext';
import { UserService } from './services/firebaseService';
import { languageManager, t as translate } from './utils/languages';

const navItems = [
  { path: '/', key: 'home', icon: '🏠' },
  { path: '/games', key: 'games', icon: '🎮' },
  { path: '/wallet', key: 'wallet', icon: '💰' },
  { path: '/profile', key: 'profile', icon: '👤' },
  { path: '/settings', key: 'settings', icon: '⚙️' },
];

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { setLanguage, currentLanguage, t } = useLanguage();
  const [balance, setBalance] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!user) return;
    UserService.getUserProfile().then((p) => setBalance((p as any)?.balance ?? 0)).catch(() => setBalance(null));
  }, [user]);
  return (
    <header className="sticky top-0 z-40 w-full neon-header">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        <NavLink to="/" className="text-white font-extrabold text-lg mr-6">
          <span className="brand-gradient">Bingo Platform</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-2 text-sm neon-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `px-3 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 ${isActive ? 'bg-white/10 text-white' : ''}`}
            >
              <span className="mr-1">{item.icon}</span>
              {translate(item.key as any)}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {balance !== null && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs text-amber-300 border border-amber-500/30">
              <span>ETB</span>
              <span className="font-semibold">{balance}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-md px-2 py-1 text-xs">
            <button onClick={() => { setLanguage('en'); languageManager.setLanguage('en'); }} className={`px-2 py-0.5 rounded ${currentLanguage.code?.toLowerCase().startsWith('en') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'}`}>EN</button>
            <button onClick={() => { setLanguage('am'); languageManager.setLanguage('am'); }} className={`px-2 py-0.5 rounded ${currentLanguage.code?.toLowerCase().startsWith('am') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'}`}>AM</button>
          </div>
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </TooltipTrigger>
            <TooltipContent>Players online</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white font-semibold">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="hidden sm:inline">{user?.displayName || user?.email || 'User'}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <NavLink to="/wallet">Wallet</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/transactions">Transactions</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/settings">Settings</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout(); }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};


const App: React.FC = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/login');

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={700}>
      <ToastProvider swipeDirection="right">
        <div className="min-h-screen relative overflow-hidden game-cyberpunk">
          <div className="aurora-layer"></div>
          <div className="glow-orb left-[-60px] top-[120px]"></div>
          <div className="glow-orb right-[-80px] bottom-[160px]"></div>
          <div className="starfield"></div>
          <div className="holo-grid"></div>
          <div className="vignette"></div>
          <div className="noise"></div>
          <div className="scanlines"></div>
          {!isAuthRoute && <Header />}
          <div>
            <div className={!isAuthRoute ? 'px-4 pt-6 md:pt-8' : ''}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><GamePlatform /></ProtectedRoute>} />
                <Route path="/games" element={<ProtectedRoute><GameList /></ProtectedRoute>} />
                <Route path="/create-game" element={<ProtectedRoute><CreateGameModal /></ProtectedRoute>} />
                <Route path="/game/:gameId" element={<ProtectedRoute><EnhancedGameRoom /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/tutorial" element={<ProtectedRoute><InteractiveTutorial /></ProtectedRoute>} />
                <Route path="/voice" element={<ProtectedRoute><VoiceSettings /></ProtectedRoute>} />
                <Route path="/language" element={<ProtectedRoute><LanguageSelector /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
          <ToastViewport />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
};

export default App;
