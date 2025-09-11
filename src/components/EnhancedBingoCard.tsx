import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Clock, Target, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { BingoCard, BingoSquare, PowerUp, BingoPattern } from '../types/game';

interface EnhancedBingoCardProps {
  card: BingoCard;
  calledNumbers: number[];
  onMarkSquare: (column: keyof Omit<BingoCard, 'id' | 'playerId' | 'powerUps' | 'patterns'>, index: number) => void;
  onUsePowerUp: (powerUpId: string) => void;
  disabled?: boolean;
  gameMode?: 'classic' | 'speed' | 'pattern' | 'tournament';
  activePatterns?: BingoPattern[];
  showPowerUps?: boolean;
  autoMark?: boolean;
}

const BINGO_RANGES = {
  B: { color: 'bg-blue-500', textColor: 'text-blue-100', borderColor: 'border-blue-400' },
  I: { color: 'bg-indigo-500', textColor: 'text-indigo-100', borderColor: 'border-indigo-400' },
  N: { color: 'bg-emerald-500', textColor: 'text-emerald-100', borderColor: 'border-emerald-400' },
  G: { color: 'bg-amber-500', textColor: 'text-amber-100', borderColor: 'border-amber-400' },
  O: { color: 'bg-red-500', textColor: 'text-red-100', borderColor: 'border-red-400' }
};

const POWER_UP_ICONS = {
  free_space: Star,
  double_points: Zap,
  skip_number: Clock,
  extra_time: Target,
  hint: Sparkles,
  auto_mark: CheckCircle
};

const EnhancedBingoCard: React.FC<EnhancedBingoCardProps> = ({
  card,
  calledNumbers,
  onMarkSquare,
  onUsePowerUp,
  disabled = false,
  gameMode = 'classic',
  activePatterns = [],
  showPowerUps = true,
  autoMark = false
}) => {
  const [markedSquares, setMarkedSquares] = useState<Set<string>>(new Set());
  const [lastMarkedSquare, setLastMarkedSquare] = useState<string | null>(null);
  const [powerUpAnimations, setPowerUpAnimations] = useState<Set<string>>(new Set());

  // Auto-mark called numbers if enabled
  useEffect(() => {
    if (autoMark) {
      const newMarkedSquares = new Set(markedSquares);
      let hasChanges = false;

      Object.entries(card).forEach(([column, squares]) => {
        if (column !== 'id' && column !== 'playerId' && column !== 'powerUps' && column !== 'patterns') {
          squares.forEach((square, index) => {
            const squareKey = `${column}-${index}`;
            if (calledNumbers.includes(square.number) && !square.marked && !newMarkedSquares.has(squareKey)) {
              newMarkedSquares.add(squareKey);
              hasChanges = true;
            }
          });
        }
      });

      if (hasChanges) {
        setMarkedSquares(newMarkedSquares);
      }
    }
  }, [calledNumbers, autoMark, card, markedSquares]);

  const isNumberCalled = (number: number): boolean => {
    return calledNumbers.includes(number);
  };

  const isSquareMarked = (column: string, index: number): boolean => {
    const squareKey = `${column}-${index}`;
    return markedSquares.has(squareKey);
  };

  const handleSquareClick = (column: keyof Omit<BingoCard, 'id' | 'playerId' | 'powerUps' | 'patterns'>, index: number) => {
    if (disabled) return;

    const squareKey = `${column}-${index}`;
    const square = card[column][index];

    // Don't allow marking if number hasn't been called (unless it's a free space)
    if (square.number !== 0 && !isNumberCalled(square.number)) {
      return;
    }

    // Toggle mark state
    const newMarkedSquares = new Set(markedSquares);
    if (newMarkedSquares.has(squareKey)) {
      newMarkedSquares.delete(squareKey);
    } else {
      newMarkedSquares.add(squareKey);
      setLastMarkedSquare(squareKey);
    }

    setMarkedSquares(newMarkedSquares);
    onMarkSquare(column, index);

    // Clear last marked square after animation
    setTimeout(() => setLastMarkedSquare(null), 1000);
  };

  const handlePowerUpClick = (powerUp: PowerUp) => {
    if (disabled || !powerUp.isActive) return;

    // Add animation
    setPowerUpAnimations(prev => new Set(prev).add(powerUp.id));
    setTimeout(() => {
      setPowerUpAnimations(prev => {
        const newSet = new Set(prev);
        newSet.delete(powerUp.id);
        return newSet;
      });
    }, 1000);

    onUsePowerUp(powerUp.id);
  };

  const getSquareContent = (square: BingoSquare, column: string, index: number) => {
    if (square.number === 0) {
      return (
        <div className="flex flex-col items-center justify-center">
          <Star className="w-4 h-4 text-yellow-400 mb-1" />
          <span className="text-xs font-bold text-yellow-400">FREE</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm sm:text-lg font-bold">{square.number}</span>
        {square.powerUp && (
          <div className="mt-1">
            {React.createElement(POWER_UP_ICONS[square.powerUp.type] || Star, {
              className: "w-3 h-3 text-purple-400"
            })}
          </div>
        )}
      </div>
    );
  };

  const getSquareClasses = (square: BingoSquare, column: string, index: number) => {
    const baseClasses = [
      'aspect-square flex items-center justify-center rounded-lg text-sm sm:text-lg font-bold',
      'transition-all duration-300 transform hover:scale-105 border-2',
      'relative overflow-hidden'
    ];

    const squareKey = `${column}-${index}`;
    const isMarked = isSquareMarked(column, index);
    const isCalled = isNumberCalled(square.number);
    const isFreeSpace = square.number === 0;

    if (isMarked) {
      baseClasses.push('bg-green-500 text-white border-green-400 shadow-lg');
    } else if (isFreeSpace) {
      baseClasses.push('bg-emerald-500 text-white border-emerald-400');
    } else if (isCalled) {
      baseClasses.push('bg-white text-gray-800 border-gray-200 hover:bg-gray-50 ring-4 ring-yellow-400 ring-opacity-75 animate-pulse');
    } else {
      baseClasses.push('bg-white text-gray-800 border-gray-200 hover:bg-gray-50');
    }

    if (disabled) {
      baseClasses.push('cursor-not-allowed opacity-75');
    } else {
      baseClasses.push('cursor-pointer');
    }

    // Add animation for last marked square
    if (lastMarkedSquare === squareKey) {
      baseClasses.push('animate-bounce');
    }

    return baseClasses.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Power-ups Section */}
      {showPowerUps && card.powerUps && card.powerUps.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Power-ups
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {card.powerUps.map((powerUp) => (
              <motion.button
                key={powerUp.id}
                onClick={() => handlePowerUpClick(powerUp)}
                disabled={disabled || !powerUp.isActive}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                  ${powerUp.isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 hover:from-purple-600 hover:to-pink-600' 
                    : 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                  }
                  ${powerUpAnimations.has(powerUp.id) ? 'animate-pulse scale-110' : ''}
                `}
                whileHover={powerUp.isActive ? { scale: 1.05 } : {}}
                whileTap={powerUp.isActive ? { scale: 0.95 } : {}}
              >
                {React.createElement(POWER_UP_ICONS[powerUp.type] || Star, {
                  className: "w-6 h-6"
                })}
                <div className="text-center">
                  <p className="text-xs font-semibold">{powerUp.name}</p>
                  <p className="text-xs opacity-75">{powerUp.cost} {powerUp.currency}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Bingo Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-white/20">
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {Object.entries(BINGO_RANGES).map(([letter, range]) => (
            <motion.div
              key={letter}
              className={`${range.color} text-white text-center py-2 sm:py-3 rounded-lg font-bold text-lg sm:text-xl ${range.borderColor}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {letter}
            </motion.div>
          ))}
        </div>
        
        {/* Bingo Grid */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {Array.from({ length: 5 }, (_, rowIndex) => 
            Object.entries(card).filter(([key]) => key !== 'id' && key !== 'playerId' && key !== 'powerUps' && key !== 'patterns').map(([column, squares]) => {
              const square = squares[rowIndex];
              if (!square) return null;
              
              return (
                <motion.button
                  key={`${column}-${rowIndex}`}
                  onClick={() => handleSquareClick(column as keyof Omit<BingoCard, 'id' | 'playerId' | 'powerUps' | 'patterns'>, rowIndex)}
                  className={getSquareClasses(square, column, rowIndex)}
                  disabled={disabled}
                  whileHover={!disabled ? { scale: 1.05 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  layout
                >
                  <AnimatePresence mode="wait">
                    {isSquareMarked(column, rowIndex) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 bg-green-500 rounded-lg flex items-center justify-center"
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {getSquareContent(square, column, rowIndex)}
                  
                  {/* Power-up indicator */}
                  {square.powerUp && (
                    <motion.div
                      className="absolute top-1 right-1"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Active Patterns Display */}
        {activePatterns.length > 0 && (
          <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-200 mb-2">Active Patterns:</h4>
            <div className="flex flex-wrap gap-2">
              {activePatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {pattern.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Mode Indicator */}
      {gameMode && (
        <div className="text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            gameMode === 'tournament' ? 'bg-purple-500 text-white' :
            gameMode === 'speed' ? 'bg-red-500 text-white' :
            gameMode === 'pattern' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Mode
          </span>
        </div>
      )}
    </div>
  );
};

export default EnhancedBingoCard;
