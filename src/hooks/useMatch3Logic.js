import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

const GRID_SIZE = 8;
const TOTAL_MOVES = 30; // Default for solo: 30 moves
const TOTAL_TIME = 120; // Default for solo: 2 minutes
const COLORS = 6;
const SPECIAL_DROP_CHANCE = 0.05;

const SPECIAL_TYPES = {
  LINE_BREAKER: 7,
  DOUBLE_BOMBER: 8,
  LASER_SHOT: 9,
  CHAOS_ORB: 10,
};

export const useMatch3Logic = (multiplayerConfig = null) => {
  // Memoize settings to prevent unnecessary re-renders
  const gameSettings = useMemo(() => {
    if (multiplayerConfig?.settings) {
      return {
        timeLimit: multiplayerConfig.settings.timeLimit,
        totalMoves: multiplayerConfig.settings.totalMoves
      };
    }
    return {
      timeLimit: TOTAL_TIME,
      totalMoves: TOTAL_MOVES
    };
  }, [multiplayerConfig?.settings?.timeLimit, multiplayerConfig?.settings?.totalMoves]);

  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(() => gameSettings.totalMoves);
  const [timeLeft, setTimeLeft] = useState(() => gameSettings.timeLimit);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [shake, setShake] = useState(false);
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [fallingCells, setFallingCells] = useState(new Set());
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('match3HighScore') || '0');
  });
  const comboRef = useRef(1);
  const timerRef = useRef(null);
  const gameOverRef = useRef(false);
  const scoreUpdateTimeoutRef = useRef(null);
  const gameStartTimeRef = useRef(null);

  const createRandomCell = useCallback((avoidSpecial = false) => {
    if (!avoidSpecial && Math.random() < SPECIAL_DROP_CHANCE) {
      const specials = Object.values(SPECIAL_TYPES);
      return specials[Math.floor(Math.random() * specials.length)];
    }
    return Math.floor(Math.random() * COLORS) + 1;
  }, []);

  const initializeGrid = useCallback(() => {
    const newGrid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        let cell;
        do {
          cell = createRandomCell(true);
          newGrid[row][col] = cell;
        } while (
          (col >= 2 && newGrid[row][col - 1] === cell && newGrid[row][col - 2] === cell) ||
          (row >= 2 && newGrid[row - 1][col] === cell && newGrid[row - 2][col] === cell)
        );
      }
    }
    return newGrid;
  }, [createRandomCell]);

  useEffect(() => {
    setGrid(initializeGrid());
  }, [initializeGrid]);

  // Update moves and time when settings change (for multiplayer)
  useEffect(() => {
    if (multiplayerConfig?.settings) {
      setMoves(gameSettings.totalMoves);
      setTimeLeft(gameSettings.timeLimit);
    }
  }, [gameSettings.totalMoves, gameSettings.timeLimit, multiplayerConfig?.settings]);

  // Timer effect - synced with server time for multiplayer
  useEffect(() => {
    if (gameOver) return;

    // For multiplayer, sync with server start time
    if (multiplayerConfig?.gameStartTime) {
      gameStartTimeRef.current = multiplayerConfig.gameStartTime;
      
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        const remaining = Math.max(0, gameSettings.timeLimit - elapsed);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 100);
      
      return () => clearInterval(timer);
    } else {
      // Solo mode - normal countdown
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameOver, multiplayerConfig?.gameStartTime, gameSettings.timeLimit]);

  const findMatches = useCallback((currentGrid) => {
    const matches = new Set();

    const isMatchable = (val1, val2, val3) => {
      if (val1 === null || val2 === null || val3 === null) return false;
      
      const isSpecial1 = val1 > COLORS;
      const isSpecial2 = val2 > COLORS;
      const isSpecial3 = val3 > COLORS;
      
      // Case 1: All same special (💣💣💣)
      if (isSpecial1 && isSpecial2 && isSpecial3) {
        return val1 === val2 && val2 === val3;
      }
      
      // Case 2: Has special as wildcard
      if (isSpecial1 || isSpecial2 || isSpecial3) {
        // Get normal values
        const normalVals = [];
        if (!isSpecial1) normalVals.push(val1);
        if (!isSpecial2) normalVals.push(val2);
        if (!isSpecial3) normalVals.push(val3);
        
        // If all normals are same, it's a match
        if (normalVals.length === 0) return false; // All special but different
        return normalVals.every(v => v === normalVals[0]);
      }
      
      // Case 3: All normal
      return val1 === val2 && val2 === val3;
    };

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col <= GRID_SIZE - 3; col++) {
        if (isMatchable(currentGrid[row][col], currentGrid[row][col + 1], currentGrid[row][col + 2])) {
          let endCol = col + 2;
          while (endCol < GRID_SIZE - 1) {
            if (isMatchable(currentGrid[row][col], currentGrid[row][col + 1], currentGrid[row][endCol + 1])) {
              endCol++;
            } else {
              break;
            }
          }
          for (let c = col; c <= endCol; c++) {
            matches.add(`${row}-${c}`);
          }
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row <= GRID_SIZE - 3; row++) {
        if (isMatchable(currentGrid[row][col], currentGrid[row + 1][col], currentGrid[row + 2][col])) {
          let endRow = row + 2;
          while (endRow < GRID_SIZE - 1) {
            if (isMatchable(currentGrid[row][col], currentGrid[row + 1][col], currentGrid[endRow + 1][col])) {
              endRow++;
            } else {
              break;
            }
          }
          for (let r = row; r <= endRow; r++) {
            matches.add(`${r}-${col}`);
          }
        }
      }
    }

    return Array.from(matches).map(pos => {
      const [row, col] = pos.split('-').map(Number);
      return { row, col };
    });
  }, []);

  const detectSpecialPattern = useCallback((matches) => {
    if (matches.length >= 5) {
      return SPECIAL_TYPES.CHAOS_ORB;
    }
    if (matches.length === 4) {
      return SPECIAL_TYPES.DOUBLE_BOMBER;
    }
    
    const rows = {};
    const cols = {};
    matches.forEach(({ row, col }) => {
      rows[row] = (rows[row] || 0) + 1;
      cols[col] = (cols[col] || 0) + 1;
    });
    
    const hasLShape = Object.values(rows).some(count => count >= 3) && 
                      Object.values(cols).some(count => count >= 3);
    
    if (hasLShape) {
      return Math.random() < 0.5 ? SPECIAL_TYPES.LINE_BREAKER : SPECIAL_TYPES.LASER_SHOT;
    }
    
    return null;
  }, []);

  const activateSpecial = useCallback((row, col, type, currentGrid) => {
    const cellsToRemove = new Set();
    
    console.log(`🔥 Activating special type ${type} at (${row}, ${col})`);

    switch (type) {
      case SPECIAL_TYPES.LINE_BREAKER:
        console.log('💥 LINE_BREAKER activated!');
        for (let c = 0; c < GRID_SIZE; c++) cellsToRemove.add(`${row}-${c}`);
        for (let r = 0; r < GRID_SIZE; r++) cellsToRemove.add(`${r}-${col}`);
        break;

      case SPECIAL_TYPES.DOUBLE_BOMBER:
        console.log('💣 DOUBLE_BOMBER activated!');
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              cellsToRemove.add(`${nr}-${nc}`);
            }
          }
        }
        break;

      case SPECIAL_TYPES.LASER_SHOT:
        console.log('⚡ LASER_SHOT activated!');
        for (let c = 0; c < GRID_SIZE; c++) cellsToRemove.add(`${row}-${c}`);
        for (let r = 0; r < GRID_SIZE; r++) cellsToRemove.add(`${r}-${col}`);
        break;

      case SPECIAL_TYPES.CHAOS_ORB:
        console.log('🌟 CHAOS_ORB activated!');
        const targetColor = Math.floor(Math.random() * COLORS) + 1;
        console.log(`Target color: ${targetColor}`);
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (currentGrid[r][c] === targetColor) {
              cellsToRemove.add(`${r}-${c}`);
            }
          }
        }
        break;
    }
    
    console.log(`Cells to remove: ${cellsToRemove.size}`);

    return Array.from(cellsToRemove).map(pos => {
      const [r, c] = pos.split('-').map(Number);
      return { row: r, col: c };
    });
  }, []);

  const removeMatches = useCallback((currentGrid, matchedCells) => {
    const newGrid = currentGrid.map(row => [...row]);
    let specialCreated = null;

    if (matchedCells.length > 0) {
      const specialType = detectSpecialPattern(matchedCells);
      if (specialType && matchedCells.length >= 4) {
        const centerMatch = matchedCells[Math.floor(matchedCells.length / 2)];
        specialCreated = { row: centerMatch.row, col: centerMatch.col, type: specialType };
      }

      matchedCells.forEach(({ row, col }) => {
        if (specialCreated && row === specialCreated.row && col === specialCreated.col) {
          return;
        }
        newGrid[row][col] = null;
      });

      if (specialCreated) {
        newGrid[specialCreated.row][specialCreated.col] = specialCreated.type;
        console.log(`✨ Special item created: Type ${specialCreated.type} at (${specialCreated.row}, ${specialCreated.col})`);
      }
    }

    return newGrid;
  }, [detectSpecialPattern]);

  const applyGravity = useCallback((currentGrid) => {
    const newGrid = currentGrid.map(row => [...row]);

    for (let col = 0; col < GRID_SIZE; col++) {
      let emptyRow = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col] !== null) {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = newGrid[row][col];
            newGrid[row][col] = null;
          }
          emptyRow--;
        }
      }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE; row++) {
        if (newGrid[row][col] === null) {
          newGrid[row][col] = createRandomCell();
        }
      }
    }

    return newGrid;
  }, [createRandomCell]);

  const addFloatingText = useCallback((text, row, col, specialType = null, forceShow = false) => {
    const id = Date.now() + Math.random();
    
    // Never show special icon for combo type
    let finalSpecialType = specialType === 'combo' ? null : null;
    
    setFloatingTexts(prev => [...prev, { id, text, row, col, specialType: finalSpecialType }]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1300); // Slightly longer than animation duration to ensure cleanup
  }, []);

  const processMatches = useCallback(async (currentGrid) => {
    let newGrid = currentGrid.map(row => [...row]);
    let totalPoints = 0;
    let hasMatches = true;

    while (hasMatches && !gameOverRef.current) {
      const matches = findMatches(newGrid);
      
      let allCellsToRemove = [...matches];
      let specialsActivated = 0;
      let isSuperSpecial = false;
      
      // Check if it's a super special match (3 same special)
      if (matches.length >= 3) {
        const matchedCells = matches.map(m => newGrid[m.row][m.col]);
        const specialCells = matchedCells.filter(c => c > COLORS);
        if (specialCells.length === 3 && specialCells.every(c => c === specialCells[0])) {
          isSuperSpecial = true;
          console.log('🌟 SUPER SPECIAL MATCH! 3x same special!');
        }
      }
      
      // Activate all special items in matches
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cell = newGrid[row][col];
          if (cell > COLORS && matches.some(m => m.row === row && m.col === col)) {
            const specialCells = activateSpecial(row, col, cell, newGrid);
            allCellsToRemove = [...allCellsToRemove, ...specialCells];
            specialsActivated++;
          }
        }
      }

      const uniqueCells = Array.from(
        new Set(allCellsToRemove.map(c => `${c.row}-${c.col}`))
      ).map(pos => {
        const [row, col] = pos.split('-').map(Number);
        return { row, col };
      });

      if (uniqueCells.length === 0) {
        hasMatches = false;
        break;
      }

      // Trigger explode animation
      const explodingSet = new Set(uniqueCells.map(c => `${c.row}-${c.col}`));
      setExplodingCells(explodingSet);

      let points = uniqueCells.length * 10 * comboRef.current;
      
      // Bonus for special activations
      if (isSuperSpecial) {
        points *= 3; // Triple points for super special!
      } else if (specialsActivated > 0) {
        points += specialsActivated * 50; // Bonus per special activated
      }
      
      totalPoints += points;

      // Update score immediately
      setScore(prev => {
        const newScore = prev + points;
        
        // Sync to Firebase if multiplayer
        if (multiplayerConfig?.onScoreUpdate) {
          // Debounce score updates
          if (scoreUpdateTimeoutRef.current) {
            clearTimeout(scoreUpdateTimeoutRef.current);
          }
          scoreUpdateTimeoutRef.current = setTimeout(() => {
            multiplayerConfig.onScoreUpdate(newScore);
          }, 500);
        }
        
        return newScore;
      });

      if (uniqueCells.length > 0) {
        const centerCell = uniqueCells[Math.floor(uniqueCells.length / 2)];
        let text = `+${points}`;
        
        if (isSuperSpecial) {
          text = `+${points} SUPER!`;
        } else if (specialsActivated > 1) {
          text = `+${points} COMBO!`;
        } else if (specialsActivated === 1) {
          text = `+${points} SPECIAL!`;
        }
        addFloatingText(text, centerCell.row, centerCell.col, null);
      }

      // Wait for explode animation (500ms total)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove matches and update grid immediately
      newGrid = removeMatches(newGrid, uniqueCells);
      setGrid(newGrid);
      setExplodingCells(new Set());
      
      // Small delay before gravity
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Mark cells that will fall
      const falling = new Set();
      for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
          if (newGrid[row][col] !== null) {
            let emptyBelow = 0;
            for (let checkRow = row + 1; checkRow < GRID_SIZE; checkRow++) {
              if (newGrid[checkRow][col] === null) emptyBelow++;
            }
            if (emptyBelow > 0) {
              falling.add(`${row}-${col}`);
            }
          }
        }
      }
      setFallingCells(falling);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      newGrid = applyGravity(newGrid);
      setGrid(newGrid);
      
      await new Promise(resolve => setTimeout(resolve, 350));
      
      setFallingCells(new Set());
      
      comboRef.current++;
    }

    comboRef.current = 1;
    return { newGrid, totalPoints };
  }, [findMatches, activateSpecial, removeMatches, applyGravity, addFloatingText]);

  const swapCells = useCallback(async (row1, col1, row2, col2) => {
    if (isAnimating || gameOver) return;

    setIsAnimating(true);
    const newGrid = grid.map(row => [...row]);
    
    // Check if either cell is a special item
    const cell1IsSpecial = newGrid[row1][col1] > COLORS;
    const cell2IsSpecial = newGrid[row2][col2] > COLORS;
    const cell1IsNormal = newGrid[row1][col1] >= 1 && newGrid[row1][col1] <= COLORS;
    const cell2IsNormal = newGrid[row2][col2] >= 1 && newGrid[row2][col2] <= COLORS;
    
    // Check if swap is valid for special items
    const validSpecialSwap = (cell1IsSpecial && cell2IsNormal) || (cell2IsSpecial && cell1IsNormal);
    
    [newGrid[row1][col1], newGrid[row2][col2]] = [newGrid[row2][col2], newGrid[row1][col1]];
    
    setGrid(newGrid);
    await new Promise(resolve => setTimeout(resolve, 200));

    const matches = findMatches(newGrid);
    
    // Special item activation logic - ONLY activate if there's a match!
    if ((cell1IsSpecial || cell2IsSpecial) && matches.length > 0) {
      console.log('✅ Special activated via match 3');
      setMoves(prev => prev - 1);
      
      // Process matches normally (special will be activated in processMatches)
      const { newGrid: finalGrid } = await processMatches(newGrid);
      setGrid(finalGrid);
    }
    // Normal match 3 logic
    else if (matches.length > 0) {
      setMoves(prev => prev - 1);
      const { newGrid: finalGrid } = await processMatches(newGrid);
      setGrid(finalGrid);
    }
    // Invalid swap
    else {
      [newGrid[row1][col1], newGrid[row2][col2]] = [newGrid[row2][col2], newGrid[row1][col1]];
      setGrid(newGrid);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }

    setIsAnimating(false);
  }, [grid, isAnimating, gameOver, findMatches, processMatches, activateSpecial, applyGravity, addFloatingText]);

  const handleCellClick = useCallback((row, col) => {
    if (isAnimating || gameOver) return;

    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else {
      const rowDiff = Math.abs(selectedCell.row - row);
      const colDiff = Math.abs(selectedCell.col - col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapCells(selectedCell.row, selectedCell.col, row, col);
      }
      setSelectedCell(null);
    }
  }, [selectedCell, isAnimating, gameOver, swapCells]);

  useEffect(() => {
    if ((moves <= 0 || timeLeft <= 0) && !gameOver) {
      gameOverRef.current = true;
      setGameOver(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Update high score for solo mode
      if (!multiplayerConfig && score > highScore) {
        setHighScore(score);
        localStorage.setItem('match3HighScore', score.toString());
      }
      
      // Mark player as dead in multiplayer
      if (multiplayerConfig?.onGameOver) {
        multiplayerConfig.onGameOver(score);
      }
    }
  }, [moves, timeLeft, gameOver, score, highScore, multiplayerConfig]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (scoreUpdateTimeoutRef.current) {
      clearTimeout(scoreUpdateTimeoutRef.current);
    }
    gameOverRef.current = false;
    gameStartTimeRef.current = null;
    setGrid(initializeGrid());
    setScore(0);
    setMoves(gameSettings.totalMoves);
    setTimeLeft(gameSettings.timeLimit);
    setGameOver(false);
    setSelectedCell(null);
    setFloatingTexts([]);
    comboRef.current = 1;
  }, [initializeGrid, gameSettings]);

  return {
    grid,
    score,
    moves,
    timeLeft,
    selectedCell,
    isAnimating,
    gameOver,
    highScore,
    floatingTexts,
    shake,
    explodingCells,
    fallingCells,
    handleCellClick,
    resetGame,
  };
};
