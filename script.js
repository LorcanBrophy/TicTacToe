// fields
let currentTurn = 0; // even is player, odd is ai
let gameMode = 'singleplayer';
let difficulty = 'easy';
let gameEnded = false;


const turnIndicator = document.getElementById('turn-indicator'); // text above board
const cellButtons = document.querySelectorAll('.cell-button'); // entire board

const sounds = {
  move: new Howl({ src: ['sounds/move.mp3'] }),
  select: new Howl({ src: ['sounds/select.mp3'] }),
  win: new Howl({ src: ['sounds/win.mp3'], volume: 0.2 }),
};

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // r
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // c
    [0, 4, 8], [2, 4, 6] // d
];

// utilites

function disableBoard() {
  cellButtons.forEach(btn => btn.disabled = true);
}

function getBoard() {
  return Array.from(cellButtons).map(btn => btn.textContent); // makes 1D array of X's and O's and ' 's
}

function updateTurnIndicator() {
  const body = document.querySelector("body");

  const isXTurn = currentTurn % 2 === 0;
  body.classList.toggle('x-turn', isXTurn);
  body.classList.toggle('o-turn', !isXTurn);
  turnIndicator.textContent = `Turn: ${isXTurn ? 'X' : 'O'}`;
}

function highlightWinner(pattern) {
  pattern.forEach(i => {
    cellButtons[i].style.color = 'limegreen';
  });
}

// game logic

function resetGame() {
  currentTurn = 0;
  gameEnded = false;
  updateTurnIndicator();

  cellButtons.forEach(button => {
    button.textContent = '';
    button.disabled = false;
    button.style.color = '';
  });
}

function playMove(button) {
  button.textContent = currentTurn % 2 === 0 ? 'X' : 'O';
  button.disabled = true;
  sounds.move.play();
  currentTurn++;
  updateTurnIndicator();
  checkWinner();

  if (gameMode === 'singleplayer' && currentTurn % 2 !== 0 && !gameEnded) {
    const delay = { easy: 800, medium: 1000, hard: 1200 }[difficulty];
    setTimeout(runAI, delay);
  }
}

function handleCellClick(event) {
  const button = event.target

  if (button.textContent === '' && !(gameMode === 'singleplayer' && currentTurn % 2 !== 0)) {
      playMove(button)
  }
}
// ai logic 

function validMove(index) {
  if (index >= 0 && index <= 8 && cellButtons[index].textContent === '') {
    playMove(cellButtons[index]);
    return true;
  }
  return false;
}

function runAI() {
  const board = getBoard();

  const moveStrategies = {
    easy: () => randomMove(),
    medium: () => {
      for (const symbol of ['O', 'X']) {
        if (validMove(getWinningOrBlockingMove(board, symbol))) return;
      }
      randomMove();
    },
    hard: () => {
      for (const symbol of ['O', 'X']) {
        if (validMove(getWinningOrBlockingMove(board, symbol))) return;
      }
      if (validMove(4)) return;
      randomMove();
    }
  };

  if (!gameEnded) moveStrategies[difficulty]();
}

function randomMove() {
  const emptyButtons = Array.from(cellButtons).filter(button => button.textContent === '');
  if (emptyButtons.length === 0) return; // if no squares are empty

  const randomIndex = Math.floor(Math.random() * emptyButtons.length);
  playMove(emptyButtons[randomIndex]);
}

function getWinningOrBlockingMove(board, symbol) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== '') continue;

    board[i] = symbol;
    const result = isWinning(board, symbol);
    board[i] = '';

    if (result) return i;
  }
  return -1;
}

// win logic

function checkWinner() {
  const board = getBoard();

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      turnIndicator.textContent = `Winner: ${board[a]}`;
      highlightWinner([a, b, c]);
      sounds.win.play();
      disableBoard();
      gameEnded = true;
      return;
    }
  }

  if (currentTurn === 9) {
    turnIndicator.textContent = "Draw!";
    gameEnded = true;
  }
}

function isWinning(board, symbol) {
  // check if a symbol in pattern matches
  //  if true, check if all symbols match

  for (let i = 0; i < winPatterns.length; i++) {
    let pattern = winPatterns[i];
    let match = true;

    for (let j = 0; j < pattern.length; j++) {
      if (board[pattern[j]] !== symbol) {
        match = false;
        break;
      }
    }

    if (match) return true;
  }

  return false;
}

// input listeners

function inputHandlers() {

  document.getElementById('start-button').addEventListener('click', () => {
    sounds.select.volume(0);
    sounds.select.play();

    document.getElementById('start-screen').style.display = 'none';

    setTimeout(() => {
      document.querySelector('.board').style.display = 'grid';
      document.querySelector('.menu').style.display = 'flex';
      document.getElementById('turn-indicator').style.display = 'block';

    }, 1250);

  });

  document.querySelector('.cells').addEventListener('click', handleCellClick);

  document.querySelector('.reset').addEventListener('click', () => {
    sounds.select.play();
    resetGame();
  });

  document.getElementById('mode-select').addEventListener('change', (event) => {
    gameMode = event.target.value;
    sounds.select.play();
    document.getElementById('difficulty-select').disabled = (gameMode === 'multiplayer');

    resetGame();
  });

  document.getElementById('difficulty-select').addEventListener('change', (event) => {
    difficulty = event.target.value;
    sounds.select.play();

    resetGame();
  });
}

inputHandlers();