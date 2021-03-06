/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Game {
  constructor(height = 6, width = 7, p1, p2) {
    this.boardElement = document.getElementById('board');
    this.height = height;
    this.width = width;
    this.currPlayer = p1;
    this.p1 = p1;
    this.p2 = p2;
    this.board = [];
    this.makeBoard();
    this.makeHtmlBoard();
  }
  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({length: this.width}));
    }
  }
  makeHtmlBoard() {
    this.boardElement.innerText = '';

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    this.boardElement.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      this.boardElement.append(row);
    }
  }
  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }
  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  endGame(msg) {
    const boardTop = document.querySelector("#column-top");
    boardTop.removeEventListener("click", this.handleClick);
    alert(msg);
  }

  handleClick = (evt) => {
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin([y, x], 4, this.currPlayer, this.board, [this.horizontal, this.vertical, this.diagonal_1, this.diagonal_2])) {
      // Using setTimeout to skip the rendering and show the player choice before show the alert
      return setTimeout(() => this.endGame(`Player ${this.currPlayer.color} won!`));
    }

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }

    // switch players
    this.currPlayer = this.currPlayer === this.p1 ? this.p2 : this.p1;
  }

  horizontal = (row, col) => [[row, col-3], [row, col-2], [row, col-1], [row, col], [row, col+1], [row, col+2], [row, col+3]]
  vertical = (row, col) => [[row-3, col], [row-2, col], [row-1, col], [row, col], [row+1, col], [row+2, col], [row+3, col]]
  diagonal_1 = (row, col) => [[row-3, col-3], [row-2, col-2], [row-1, col-1], [row, col], [row+1, col+1], [row+2, col+2], [row+3, col+3]];
  diagonal_2 = (row, col) => [[row+3, col-3], [row+2, col-2], [row+1, col-1], [row, col], [row-1, col+1], [row-2, col+2], [row-3, col+3]];

  checkForWin = (target, minMatch, player, board, patterns) => {
    const checks = patterns.map(pattern => this.checkPattern(target, minMatch, player, board, pattern));
    return checks.some(value => value);
  }

  checkPattern = (target, minMatch, player, board, pattern) => {
    const values = this.applyPattern(target, board, pattern);

    return this.getMaxSequentialOccurrence(player, values) >= minMatch;
  }
  applyPattern = (target, board, pattern) => {
    const [row, col] = target;
    // [[x,y-3], [x,y-2], [x,y-1], [x,y], [x,y+1], [x,y+2], [x,y+3]]
    const coordinates = pattern(row, col);
    // [[1,-1], [1,0], [1,1], [1,2], [1,3], [1,4], [1,5]]

    return coordinates.map(([row, col]) => (board[row] || [])[col]);
    // [undefined, player1, undefined, player2, player2, player2, player2]
  };
  getMaxSequentialOccurrence = (player, values) => {
    let maxAccumulator = 0;
    // playerColor = black;
    const playerColor = player.color;
    // player1 = {"color": "blue"};
    // player2 = {"color": "black"};
    // values = [undefined, player1, undefined, player2, player2, player2, player2];
	values.reduce((accumulator, current) => {
	    const currentColor = (current || {}).color;
        if (currentColor !== playerColor) {
            return 0;
        }
        const newAccumulator = accumulator + 1;
	    maxAccumulator = Math.max(maxAccumulator, newAccumulator);

        return newAccumulator;
    }, 0);

    return maxAccumulator;
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}
const button = document.getElementById('start-game-button');
button.addEventListener('click', function () {
  const playerOneColor = document.getElementById('color-player-1');
  const playerTwoColor = document.getElementById('color-player-2');
  if (playerOneColor.value && playerTwoColor.value) {
    const playerOne = new Player(playerOneColor.value);
    const playerTwo = new Player(playerTwoColor.value);
    new Game(6, 7, playerOne, playerTwo);
  } else {
    alert('Players must provide colors!');
  }

})
