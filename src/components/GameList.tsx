import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GameService, Game } from '../services/firebaseService';
import { Button } from './ui/Button';

const GameList: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadGames();
    // eslint-disable-next-line
  }, [user]);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      const gamesData = await GameService.getGames();
      setGames(gamesData);
    } catch {
      setError('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!user) {
      setError('Please sign in to join games');
      return;
    }
    try {
      await GameService.joinGame(gameId, user.uid);
      navigate(`/game/${gameId}`);
    } catch {
      setError('Failed to join game');
    }
  };

  const handleCreateGame = () => {
    navigate('/create-game');
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'N/A';
    type ToDateObj = { toDate: () => Date };
    let date: Date;
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as ToDateObj).toDate === 'function') {
      date = (timestamp as ToDateObj).toDate();
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusText = (status: Game['status']) => {
    switch (status) {
      case 'waiting': return 'Waiting for Players';
      case 'active': return 'Game in Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{authError || error}</p>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">User Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="back-button"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="gaming-font text-4xl mb-4 gradient-text">Available Games</h1>
          <p className="text-slate-300">Join a game or create your own!</p>
        </div>

        <div className="flex justify-center mb-6">
          <Button onClick={handleCreateGame} variant="cyber">Create New Game</Button>
        </div>

        <div className="responsive-grid">
          {games.length === 0 ? (
            <div className="modern-card p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">No Games Available</h3>
              <p className="text-slate-300 mb-6">Be the first to create a game!</p>
              <button
                onClick={handleCreateGame}
                className="btn-modern"
              >
                Create Game
              </button>
            </div>
          ) : (
            games.map((game) => (
              <div key={game.id} className="modern-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{game.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${game.status === 'waiting' ? 'text-yellow-400' : game.status === 'active' ? 'text-green-400' : 'text-slate-400'}`}>
                    {getStatusText(game.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="text-white font-semibold">ETB {game.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prize Pool:</span>
                    <span className="text-green-400 font-semibold">ETB {game.prizePool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Players:</span>
                    <span className="text-white">
                      {game.players.length}/{game.maxPlayers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-slate-300 text-sm">
                      {formatDate(game.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {game.status === 'waiting' && !game.players.includes(user.uid) && (
                    <Button onClick={() => handleJoinGame(game.id)} variant="cyber" className="flex-1" disabled={game.players.length >= game.maxPlayers}>
                      {game.players.length >= game.maxPlayers ? 'Full' : 'Join Game'}
                    </Button>
                  )}
                  {game.status === 'active' && (
                    <Button onClick={() => navigate(`/game/${game.id}`)} variant="cyber" className="flex-1">
                      Watch Game
                    </Button>
                  )}
                  {game.status === 'completed' && (
                    <Button onClick={() => navigate(`/game/${game.id}`)} variant="secondary" className="flex-1">
                      View Results
                    </Button>
                  )}
                  {game.players.includes(user.uid) && game.status === 'waiting' && (
                    <Button onClick={() => navigate(`/game/${game.id}`)} className="flex-1">
                      Enter Game
                    </Button>
                  )}
                </div>
                {game.winner && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-400 text-sm">
                      <strong>Winner:</strong> {game.winner}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Button onClick={loadGames} variant="cyber" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Games'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameList;
