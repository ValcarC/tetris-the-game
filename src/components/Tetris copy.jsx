import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RefreshCw,
} from "lucide-react";

// Tetromino shapes
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const COLORS = {
  I: "bg-cyan-500",
  O: "bg-yellow-500",
  T: "bg-purple-500",
  S: "bg-green-500",
  Z: "bg-red-500",
  L: "bg-orange-500",
  J: "bg-blue-500",
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const Tetris = () => {
  const [board, setBoard] = useState(
    Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("tetrisHighScore") || "0")
  );
  const [gameOver, setGameOver] = useState(false);
  const [moveInterval, setMoveInterval] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false); // Default to false

  const musicRef = useRef(null);
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const currentPositionRef = useRef(currentPosition);
  const gameOverRef = useRef(gameOver);

  // Generate a new random piece
  const getRandomPiece = useCallback(() => {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      shape: SHAPES[randomShape],
      color: COLORS[randomShape],
    };
  }, []);

  const isValidMove = useCallback((board, piece, { x, y }) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback((piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const moveHorizontal = useCallback((direction) => {
    const newPosition = {
      x: currentPositionRef.current.x + direction,
      y: currentPositionRef.current.y,
    };
    if (isValidMove(boardRef.current, currentPieceRef.current, newPosition)) {
      setCurrentPosition(newPosition);
      currentPositionRef.current = newPosition;
    }
  }, [isValidMove]);

  const rotate = useCallback(() => {
    const rotatedPiece = rotatePiece(currentPieceRef.current);
    if (isValidMove(boardRef.current, rotatedPiece, currentPositionRef.current)) {
      setCurrentPiece(rotatedPiece);
      currentPieceRef.current = rotatedPiece;
    }
  }, [rotatePiece, isValidMove]);

  const initGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0));
    const newPiece = getRandomPiece();
    const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };

    setBoard(newBoard);
    boardRef.current = newBoard;

    setCurrentPiece(newPiece);
    currentPieceRef.current = newPiece;

    setCurrentPosition(startPosition);
    currentPositionRef.current = startPosition;

    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
  }, [getRandomPiece]);

  const movePieceDown = useCallback(() => {
    if (gameOverRef.current) return;

    const newPosition = {
      x: currentPositionRef.current.x,
      y: currentPositionRef.current.y + 1,
    };

    if (isValidMove(boardRef.current, currentPieceRef.current, newPosition)) {
      setCurrentPosition(newPosition);
      currentPositionRef.current = newPosition;
    } else {
      const newBoard = [...boardRef.current];
      for (let row = 0; row < currentPieceRef.current.shape.length; row++) {
        for (let col = 0; col < currentPieceRef.current.shape[row].length; col++) {
          if (currentPieceRef.current.shape[row][col]) {
            const boardY = currentPositionRef.current.y + row;
            const boardX = currentPositionRef.current.x + col;
            if (boardY >= 0) {
              newBoard[boardY][boardX] = currentPieceRef.current.color;
            }
          }
        }
      }

      const clearedBoard = newBoard.filter((row) => !row.every((cell) => cell));
      const linesCleared = BOARD_HEIGHT - clearedBoard.length;
      const newScore = score + linesCleared * 100;

      while (clearedBoard.length < BOARD_HEIGHT) {
        clearedBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }

      setBoard(clearedBoard);
      boardRef.current = clearedBoard;
      setScore(newScore);

      const newPiece = getRandomPiece();
      const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };

      if (!isValidMove(clearedBoard, newPiece, startPosition)) {
        setGameOver(true);
        gameOverRef.current = true;
      } else {
        setCurrentPiece(newPiece);
        currentPieceRef.current = newPiece;
        setCurrentPosition(startPosition);
        currentPositionRef.current = startPosition;
      }
    }
  }, [score, getRandomPiece, isValidMove]);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOverRef.current) return;

      switch (e.key) {
        case "ArrowLeft":
          moveHorizontal(-1);
          break;
        case "ArrowRight":
          moveHorizontal(1);
          break;
        case "ArrowDown":
          movePieceDown();
          break;
        case "ArrowUp":
          rotate();
          break;
        default:
          break;
      }
    },
    [moveHorizontal, movePieceDown, rotate]
  );

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("tetrisHighScore", score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    const dropInterval = setInterval(movePieceDown, 500);
    return () => clearInterval(dropInterval);
  }, [movePieceDown]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (musicEnabled) {
      musicRef.current.play().catch((error) => {
        console.error("Error playing music:", error);
      });
    } else {
      musicRef.current.pause();
    }
  }, [musicEnabled]);

  // Functions for continuous movement of the piece
  const startMove = (direction) => {
    if (moveInterval) return; // Prevent multiple intervals from being set
    const interval = setInterval(() => moveHorizontal(direction), 100); // Adjust speed as necessary
    setMoveInterval(interval);
  };

  const stopMove = () => {
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
  };

  const renderBoard = () => {
    const boardWithPiece = board.map((row) => [...row]);
    if (currentPiece && !gameOver) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const boardY = currentPosition.y + row;
            const boardX = currentPosition.x + col;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              boardWithPiece[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    return boardWithPiece;
  };

  const GameOverModal = () => (
    <div className="fixed inset-0 text-neutral-950 bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-zinc-200 p-8 rounded-lg text-center shadow-xl">
        <h2 className="text-4xl font-bold text-red-700 mb-4">GAME OVER</h2>
        <div className="text-xl text-neutral-950 mb-4">
          <p>
            Your Score:{" "}
            <span className="font-bold text-green-500">{score}</span>
          </p>
          <p>
            High Score:{" "}
            <span className="font-bold text-yellow-500">{highScore}</span>
          </p>
        </div>
        <button
          onClick={initGame}
          className="flex items-center justify-center mx-auto px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          <RefreshCw className="mr-2" /> Restart Game
        </button>
      </div>
    </div>
  );

  // Start game handler
  const handleStartGame = () => {
    setGameStarted(true);
    initGame(); // Initialize the game when starting
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-zinc-50">
      <audio ref={musicRef} src="/starshine_music.mp3" loop preload="auto" />
      {gameOver && <GameOverModal />}

      {!gameStarted && (
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-100 mb-12 transform -rotate-6">Welcome to Tetris</h1>

          <button
            onClick={handleStartGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition hover:animate-pulse"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="text-xl mb-6">
            Score: <span className="font-bold text-green-500">{score}</span>
            <span className="ml-4">
              High Score:{" "}
              <span className="font-bold text-yellow-500">{highScore}</span>
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 border-2 border-gray-700">
            {renderBoard().map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-4 h-4 ${cell || "bg-gray-800 border border-gray-700"}`}
                />
              ))
            )}
          </div>

          <div className="flex space-x-8 mt-6">
            <button
              onMouseDown={() => startMove(-1)}
              onMouseUp={stopMove}
              onMouseLeave={stopMove}
              onTouchStart={() => startMove(-1)}
              onTouchEnd={stopMove}
              className="p-4 bg-blue-500 rounded hover:bg-blue-600"
            >
              <ChevronLeft />
            </button>

            <button
              onMouseDown={() => startMove(1)}
              onMouseUp={stopMove}
              onMouseLeave={stopMove}
              onTouchStart={() => startMove(1)}
              onTouchEnd={stopMove}
              className="p-4 bg-blue-500 rounded hover:bg-blue-600"
            >
              <ChevronRight />
            </button>

            <button
              onClick={rotate}
              className="p-4 bg-green-500 rounded hover:bg-green-600"
            >
              <RotateCw />
            </button>

            <button
              onClick={movePieceDown}
              onMouseDown={() => setMoveInterval(setInterval(movePieceDown, 100))}
              onMouseUp={stopMove}
              onMouseLeave={stopMove}
              onTouchStart={() => setMoveInterval(setInterval(movePieceDown, 100))}
              onTouchEnd={stopMove}
              className="p-4 bg-red-500 rounded hover:bg-red-600"
            >
              <ChevronDown />
            </button>
          </div>

          {/* In-game options */}
          <div className="flex flex-col items-center mt-8">
            <label className="flex items-center cursor-pointer mb-4">
              <span className="mr-2 text-zinc-400">
                {musicEnabled ? "Music On" : "Music Off"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={musicEnabled}
                  onChange={() => setMusicEnabled(!musicEnabled)}
                  className="sr-only"
                />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div
                  className={`dot absolute left-1 top-1 bg-zinc-50 w-6 h-6 rounded-full transition ${
                    musicEnabled ? "transform translate-x-full bg-green-500" : ""
                  }`}
                ></div>
              </div>
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default Tetris;