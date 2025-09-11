import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GameService, UserService } from '../services/firebaseService';
import ProfileSetup from './ProfileSetup';

const getAvatar = (level: number) => {
  if (level >= 10) return '/assets/avatar-legendary.png';
  if (level >= 5) return '/assets/avatar-epic.png';
  return '/assets/avatar-default.png';
};

const GamePlatform: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    UserService.getUserProfile().then(setProfile).catch(() => setProfile(null));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    GameService.getLeaderboard('global')
      .then(lb => setLeaderboard(lb.players || []))
      .catch(() => setLeaderboard([]));
  }, [user]);

  // Navigation replaces scene logic

  const handleClaimReward = () => {
    setRewardClaimed(true);
    setTimeout(() => setShowDailyReward(false), 1200);
  };

  const renderSplashScreen = () => (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="relative z-10 text-center animate-fade-in">
        <div className="text-7xl mb-6">🎮</div>
        <h1 className="text-5xl font-bold mb-2 brand-gradient">Bingo Platform</h1>
        <p className="text-slate-300 mb-8">Advanced Gaming Experience</p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );

  // Show loading only until we have a logged-in user
  if (!user) {
    return renderSplashScreen();
  }

  const needsOnboarding = (profile as any)?.tutorial && (profile as any)?.tutorial?.completed === false;
  if (needsOnboarding) {
    return (
      <>
        {renderSplashScreen()}
        <ProfileSetup onComplete={() => window.location.reload()} />
      </>
    );
  }

  // Main menu UI with real leaderboard and router navigation
  const renderMainMenu = () => (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-2 py-8">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="w-full max-w-4xl panel-cyber rounded-3xl p-8 flex flex-col gap-8 animate-fade-in">
        {/* Header with animated avatar and progress bar */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-purple-500 animate-spin-slow">
              <img src={getAvatar(profile?.level ?? 1)} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold drop-shadow-lg tracking-tight brand-gradient">Bingo Platform</h1>
              <p className="text-lg text-slate-300 font-medium">Advanced Gaming Experience</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-semibold text-lg">{user?.displayName ?? 'Player'}</div>
              <div className="text-sm text-cyan-300">Level {profile?.level ?? 1}</div>
              <div className="w-32 h-3 bg-slate-800/60 rounded-full mt-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 shadow-[0_0_12px_rgba(0,255,240,0.45)]" style={{width: `${Math.min(100, (profile?.experience ?? 0) % 1000 / 10)}%`}}></div>
              </div>
              <div className="text-xs text-slate-400 mt-1">XP: {profile?.experience ?? 0}/1000</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(0,255,240,0.4),0_0_16px_rgba(255,0,230,0.3)]">
              <span className="text-white font-bold text-xl">{profile?.level ?? 1}</span>
            </div>
          </div>
        </header>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {profile && [
            { label: 'ETB Balance', value: profile.balance, color: 'from-purple-600 to-purple-800', text: 'text-purple-200' },
            { label: 'Games Played', value: profile.gamesPlayed, color: 'from-blue-600 to-blue-800', text: 'text-blue-200' },
            { label: 'Games Won', value: profile.gamesWon, color: 'from-green-600 to-green-800', text: 'text-green-200' },
            { label: 'Achievements', value: profile.achievements ? profile.achievements.length : 0, color: 'from-yellow-600 to-yellow-800', text: 'text-yellow-200' },
          ].map((card, idx) => (
            <div key={card.label} className={`card-cyber rounded-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="text-4xl font-extrabold text-white mb-2 animate-bounce drop-shadow-[0_0_12px_rgba(0,255,240,0.5)]">{card.value}</div>
              <div className={`font-semibold ${card.text}`}>{card.label}</div>
            </div>
          ))}
        </div>
        {/* Game Modes */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile && [
              { icon: '🎯', title: 'Classic Bingo', desc: 'Traditional bingo game with 75 balls.', price: 'ETB 100' },
              { icon: '⚡', title: 'Speed Bingo', desc: 'Fast-paced bingo with 90 balls.', price: 'ETB 200' },
              { icon: '🏆', title: 'Tournament Bingo', desc: 'Compete in tournaments.', price: 'ETB 500' },
            ].map((mode, idx) => (
              <div key={mode.title} className="card-cyber rounded-2xl p-6 hover:shadow-[0_0_24px_rgba(0,255,240,0.25),0_0_24px_rgba(255,0,230,0.2)] transform hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="text-5xl mb-4 animate-bounce">{mode.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{mode.title}</h3>
                <p className="text-slate-400 mb-4">{mode.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-semibold">{mode.price}</span>
                  <span className="text-slate-500">2-10 players</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/games')}
                className="w-full btn-modern"
              >
                🎮 Join Game
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="w-full btn-modern"
              >
                🛒 Shop
              </button>
              <button
                onClick={() => navigate('/games')}
                className="w-full btn-modern"
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Last game: 2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Level up: 1 day ago</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Achievement unlocked</span>
              </div>
            </div>
          </div>
        </div>
        {/* Leaderboard Preview */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Leaderboard Preview</h2>
          <div className="panel-cyber rounded-2xl p-6">
            <div className="flex flex-col gap-2">
              {leaderboard.length === 0 ? (
                <div className="text-slate-400">No leaderboard data yet.</div>
              ) : leaderboard.slice(0, 5).map(player => (
                <div key={player.playerId} className="flex items-center gap-3">
                  <span className="text-yellow-400 text-xl">{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '🏅'}</span>
                  <span className="text-white font-semibold">{player.playerName}</span>
                  <span className="text-green-400 ml-auto">Score: {player.score}</span>
                  <span className="text-blue-400 ml-2">Rank {player.rank}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Daily Reward Button */}
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow-lg hover:scale-105 transition-all"
            onClick={() => setShowDailyReward(true)}
            disabled={rewardClaimed}
          >
            {rewardClaimed ? 'Reward Claimed!' : 'Claim Daily Reward'}
          </button>
        </div>
      </div>
      {/* Daily Reward Modal */}
      {showDailyReward && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-yellow-500">Daily Reward</h2>
            <p className="text-lg mb-6">You've earned <span className="font-bold text-green-500">+50 XP</span> and <span className="font-bold text-yellow-400">+10 ETB</span>!</p>
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold shadow-lg hover:scale-105 transition-all"
              onClick={handleClaimReward}
              disabled={rewardClaimed}
            >
              {rewardClaimed ? 'Reward Claimed!' : 'Claim Reward'}
            </button>
          </div>
        </div>
      )}

    </div>
  );

  // Always show main menu for now
  return renderMainMenu();
};

export default GamePlatform;
