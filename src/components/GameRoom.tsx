import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameService, Game } from '../services/firebaseService';
import { VoiceService } from '../services/voiceService';
import { useAuth } from '../contexts/AuthContext';

const GameRoom: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBingoCard, setUserBingoCard] = useState<number[][]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameTimer, setGameTimer] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastCalledNumber, setLastCalledNumber] = useState<string>('');
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !gameId) return;
    loadGame();
    // eslint-disable-next-line
  }, [user, gameId]);

  useEffect(() => {
    // Initialize voice service
    const initVoice = async () => {
      try {
        await VoiceService.initialize();
        await VoiceService.preloadCommonSounds();
      } catch (error) {
        console.error('Failed to initialize voice service:', error);
        setVoiceEnabled(false);
      }
    };
    initVoice();
  }, []);

  const loadGame = async () => {
    if (!gameId) return;
    try {
      setIsLoading(true);
      const gameData = await GameService.getGame(gameId);
      if (!gameData) {
        setError('Game not found');
        return;
      }
      setGame(gameData);
      setCalledNumbers(gameData.calledNumbers || []);
      setIsGameStarted(gameData.status === 'active');
      // Generate bingo card for current user
      if (user && gameData.players.includes(user.uid)) {
        const card = generateBingoCard();
        setUserBingoCard(card);
      }
      // Start real-time updates
      const unsubscribe = GameService.onGameUpdate(gameId, (updatedGame) => {
        setGame(updatedGame);
        setCalledNumbers(updatedGame.calledNumbers || []);
        setIsGameStarted(updatedGame.status === 'active');
        // Handle new number calls with voice
        if (updatedGame.calledNumbers && updatedGame.calledNumbers.length > calledNumbers.length) {
          const newNumber = updatedGame.calledNumbers[updatedGame.calledNumbers.length - 1];
          handleNewNumberCall(newNumber);
        }
        // Handle game state changes
        if (updatedGame.status === 'active' && game?.status === 'waiting') {
          handleGameStart();
        }
        if (updatedGame.status === 'completed' && game?.status === 'active') {
          handleGameEnd(updatedGame.winner);
        }
      });
      return unsubscribe;
    } catch {
      setError('Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBingoCard = (): number[][] => {
    const card: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: number[] = [];
      for (let j = 0; j < 5; j++) {
        const min = i * 15 + 1;
        const max = (i + 1) * 15;
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        row.push(number);
      }
      card.push(row);
    }
    // Center space is free
    card[2][2] = 0;
    return card;
  };

  const handleNewNumberCall = async (number: number) => {
    const letter = getLetterForNumber(number);
    const numberStr = `${letter}-${number}`;
    setLastCalledNumber(numberStr);
    // Play voice announcement
    if (voiceEnabled) {
      try {
        await VoiceService.announceFullNumber(letter, number);
      } catch (error) {
        console.error('Failed to play number announcement:', error);
      }
    }
    // Visual feedback
    setTimeout(() => {
      setLastCalledNumber('');
    }, 3000);
  };

  const handleGameStart = async () => {
    setIsGameStarted(true);
    setGameTimer(0);
    // Play game start announcement
    if (voiceEnabled) {
      try {
        await VoiceService.playGameAnnouncement('game_start');
        await VoiceService.speak('Game starting in 3, 2, 1, Go!');
      } catch (error) {
        console.error('Failed to play game start announcement:', error);
      }
    }
    // Start timer
    timerRef.current = setInterval(() => {
      setGameTimer(prev => prev + 1);
    }, 1000);
  };

  const handleGameEnd = async (winner?: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Play game end announcement
    if (voiceEnabled) {
      try {
        if (winner === user?.uid) {
          await VoiceService.playGameAnnouncement('winner');
          await VoiceService.speak('Congratulations! You won!');
        } else if (winner) {
          await VoiceService.playGameAnnouncement('game_end');
          await VoiceService.speak('Game over! Better luck next time!');
        }
      } catch (error) {
        console.error('Failed to play game end announcement:', error);
      }
    }
  };

  const getLetterForNumber = (number: number): string => {
    if (number <= 15) return 'B';
    if (number <= 30) return 'I';
    if (number <= 45) return 'N';
    if (number <= 60) return 'G';
    return 'O';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    VoiceService.setEnabled(!voiceEnabled);
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
          <button onClick={() => navigate('/games')} className="btn-modern">
            Back to Games
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

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Game Not Found</h2>
          <button onClick={() => navigate('/games')} className="btn-modern">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 flex flex-col items-center justify-start relative">
      {/* Glassmorphism Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/games')}
          className="rounded-full bg-slate-800/60 hover:bg-slate-700/80 p-2 shadow-lg text-white text-xl transition duration-200"
          aria-label="Go back"
        >
          ←
        </button>
      </div>
      {/* Player Info and Voice Toggle */}
      <div className="w-full max-w-3xl px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-white font-semibold text-lg bg-slate-800/60 px-4 py-2 rounded-xl shadow-md">
          Player: {user.displayName || user.email}
        </div>
        <button
          onClick={toggleVoice}
          className={`btn-modern flex items-center gap-2 ${voiceEnabled ? '' : 'opacity-50'} shadow-md`}
          aria-label="Toggle Voice Announcements"
        >
          {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
        </button>
      </div>
      <div className="w-full max-w-3xl px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="gaming-font text-5xl mb-2 gradient-text animate-gradient">{game.title}</h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <span className={`px-4 py-2 rounded-full text-lg font-bold shadow-md ${
              game.status === 'waiting' ? 'text-yellow-400 bg-yellow-900/30' : 
              game.status === 'active' ? 'text-green-400 bg-green-900/30' : 'text-slate-400 bg-slate-800/30'
            } animate-fade-in`}>
              {game.status === 'waiting' ? 'Waiting for Players' :
               game.status === 'active' ? 'Game in Progress' :
               game.status === 'completed' ? 'Completed' : 'Cancelled'}
            </span>
            <span className="text-slate-400 text-lg bg-slate-800/60 px-3 py-1 rounded-xl shadow">Timer: {formatTime(gameTimer)}</span>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 max-w-md mx-auto animate-fade-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {/* Last Called Number Display */}
        {lastCalledNumber && (
          <div className="text-center mb-6 animate-pulse">
            <div className="text-7xl font-extrabold text-yellow-400 mb-2 drop-shadow-lg">
              {lastCalledNumber}
            </div>
            <div className="text-slate-300 text-lg">Last Called Number</div>
          </div>
        )}
        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="modern-card glass-card p-6 text-center shadow-lg animate-fade-in">
            <div className="text-3xl font-bold text-blue-400">{game.players.length}</div>
            <div className="text-slate-400 text-lg">Players</div>
          </div>
          <div className="modern-card glass-card p-6 text-center shadow-lg animate-fade-in">
            <div className="text-3xl font-bold text-green-400">ETB {game.prizePool}</div>
            <div className="text-slate-400 text-lg">Prize Pool</div>
          </div>
          <div className="modern-card glass-card p-6 text-center shadow-lg animate-fade-in">
            <div className="text-3xl font-bold text-purple-400">{calledNumbers.length}</div>
            <div className="text-slate-400 text-lg">Numbers Called</div>
          </div>
        </div>
        {/* Bingo Card */}
        {userBingoCard.length > 0 && (
          <div className="modern-card glass-card p-8 mb-8 shadow-xl animate-fade-in">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">Your Bingo Card</h2>
            <div className="grid grid-cols-5 gap-2">
              {userBingoCard.map((row, rowIndex) => (
                row.map((number, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`p-6 text-center rounded-xl font-extrabold text-2xl transition-all duration-200 shadow-md ${
                      number === 0 
                        ? 'bg-emerald-500 text-white border-emerald-400' 
                        : calledNumbers.includes(number)
                        ? 'bg-yellow-500 text-white border-yellow-400 animate-bounce'
                        : 'bg-slate-700 text-white border-slate-600'
                    } ${isGameStarted && game.status === 'active' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-75'}`}
                  >
                    {number === 0 ? 'FREE' : number}
                  </div>
                ))
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-400 text-center">Tap numbers as they are called to mark your card!</div>
          </div>
        )}
        {/* Called Numbers History */}
        <div className="modern-card glass-card p-8 shadow-xl animate-fade-in">
          <h3 className="text-xl font-semibold text-white mb-4">Called Numbers</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 75 }, (_, i) => i + 1).map((number) => (
              <div
                key={number}
                className={`p-3 text-center rounded-xl font-bold transition-colors shadow-md ${
                  calledNumbers.includes(number)
                    ? 'bg-green-500/30 border border-green-500/50 text-green-400 animate-fade-in'
                    : 'bg-slate-800/50 text-slate-400'
                }`}
              >
                {getLetterForNumber(number)}-{number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;