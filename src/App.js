import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// CONSTANTS
const NUM_OF_ROW = 4;
const NUM_OF_COLS = 4;
const PLAYER_ONE = 'one';
const PLAYER_TWO = 'two';

// ROW COMPONENT
const Row = ({ row, play }) => {
  return (
    <tr>
      {row.map((cell, i) => <Cell key={i} value={cell} columnIndex={i} play={play} />)}
    </tr>
  );
};
// CELL COMPONENT
const Cell = ({ value, columnIndex, play }) => {
  let color = 'white';
  if (value === PLAYER_ONE) {
    color = 'red';
  } else if (value === PLAYER_TWO) {
    color = 'blue';
  }

  return (
    <td>
      <div className="cell" onClick={() => play(columnIndex)}>
        <div className={color}></div>
      </div>
    </td>
  );
};

const App = () => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [moves, setMoves] = useState([]);
  const [player, setPlayer] = useState(PLAYER_ONE);

  useEffect(() => {
    initalizeGame();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (player === PLAYER_TWO) {
      playComputer();
    }
  }, [player])

  const checkVertical = (board) => {
    // Check only if row is 3 or greater
    for (let r = 3; r < NUM_OF_ROW; r++) {
      for (let c = 0; c < NUM_OF_COLS; c++) {
        if (board[r][c]) {
          if (board[r][c] === board[r - 1][c] &&
            board[r][c] === board[r - 2][c] &&
            board[r][c] === board[r - 3][c]) {
            return board[r][c];
          }
        }
      }
    }
  };

  const checkHorizontal = (board) => {
    // Check only if column is 3 or less
    for (let r = 0; r < NUM_OF_ROW; r++) {
      for (let c = 0; c < NUM_OF_COLS; c++) {
        if (board[r][c]) {
          if (board[r][c] === board[r][c + 1] &&
            board[r][c] === board[r][c + 2] &&
            board[r][c] === board[r][c + 3]) {
            return board[r][c];
          }
        }
      }
    }
  };

  const checkDiagonalRight = (board) => {
    // Check only if row is 3 or greater AND column is 3 or less
    for (let r = 3; r < NUM_OF_ROW; r++) {
      for (let c = 0; c < NUM_OF_COLS; c++) {
        if (board[r][c]) {
          if (board[r][c] === board[r - 1][c + 1] &&
            board[r][c] === board[r - 2][c + 2] &&
            board[r][c] === board[r - 3][c + 3]) {
            return board[r][c];
          }
        }
      }
    }
  };

  const checkDiagonalLeft = (board) => {
    // Check only if row is 3 or greater AND column is 3 or greater
    for (let r = 3; r < NUM_OF_ROW; r++) {
      for (let c = 2; c < NUM_OF_COLS; c++) {
        if (board[r][c]) {
          if (board[r][c] === board[r - 1][c - 1] &&
            board[r][c] === board[r - 2][c - 2] &&
            board[r][c] === board[r - 3][c - 3]) {
            return board[r][c];
          }
        }
      }
    }
  };

  const checkDraw = (board) => {
    for (let r = 0; r < NUM_OF_ROW; r++) {
      for (let c = 0; c < NUM_OF_COLS; c++) {
        if (board[r][c] === null) {
          return null;
        }
      }
    }
    return 'draw';
  };

  const drawBoard = () => {
    const newBoard = [];
    for (let i = 0; i < NUM_OF_ROW; i++) {
      const row = [];
      for (let j = 0; j < NUM_OF_COLS; j++) {
        row.push(null);
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
  };

  const initalizeGame = () => {
    drawBoard();
    setGameOver(false);
    setMessage('');
    setMoves([]);
    setPlayer(PLAYER_ONE);
  };

  const play = (c) => {
    if (!gameOver) {
      setPiece(c);
      const result = checkVertical(board) || checkDiagonalRight(board) || checkDiagonalLeft(board) || checkHorizontal(board) || checkDraw(board);
      switch (result) {
        case PLAYER_ONE:
          setGameOver(true);
          setMessage('Player 1 wins');
          break;
        case PLAYER_TWO:
          setGameOver(true);
          setMessage('Player 2 wins');
          break;
        case 'draw':
          setGameOver(true);
          setMessage('Game is a draw');
          break;
        default:
          setPlayer(PLAYER_TWO);
          break;
      }
    } else {
      setMessage('Game is over, start a new game')
    }
  };

  const playComputer = async() => {
    if (player === PLAYER_TWO) {
      const { data } = await axios.get(`/production?moves=[${moves}]`);
      if (data) {
        const computerMove = data[data.length - 1];
        setMoves(data);
        play(computerMove);
        setPlayer(PLAYER_ONE);
      }
    }
  };

  const setPiece = (c) => {
    const curBoard = [...board];
    // keep track of moves
    const newMoves = [...moves];
    newMoves.push(c)
    setMoves(newMoves);
    for (let r = 3; r >= 0; r--) {
      if (!board[r][c]) {
        board[r][c] = player;
        setBoard(curBoard);
        break;
      }
    }
  };

  return (
    <div className="App">
      <h1>Connect 4</h1>
      <button className='button' onClick={initalizeGame}>New Game</button>
      {message && <h2>{message}</h2>}
      <table>
        <tbody>
          {board.map((row, i) => (<Row key={i} row={row} play={play} rowIndex={i} />))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
