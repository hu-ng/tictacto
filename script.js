// Player class
const Player = (name, symbol) => {
	let playerName = name;
	const getName = () => playerName;
	const setName = (newName) => {playerName = newName};
	const getSymbol = () => symbol;
	const makeMove = (move, x, y) => {
		GameBoard.markBoard(move, x, y)
	}
	return {makeMove, getName, setName, getSymbol}
}

// Initialize two players
let playerOne = Player("Bob", "X")
let playerTwo = Player("Megan", "O")


// GameBoard Module
const GameBoard = (() => {
	const board = [
		['','',''],
		['','',''],
		['','','']
	];

	const getBoard = () => board;

	// Mark the board with a symbol at (x, y) location
	const markBoard = (move, x, y) => { board[x][y] = move };

	// Check if board is full
	const isBoardFull = () => {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				if (board[x][y] == "") {
					return false
				}
			}
		}
		return true
	};

	// Reset the board to empty characters
	const resetBoard = () => {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				board[x][y] = ""
			}
		}
	}

	return {getBoard, markBoard, isBoardFull, resetBoard}
})();


// Game Module
const GameController = ((p1, p2) => {
	let lastPlayer;
	
	// Save the original players of the game
	const playerOne = p1;
	const playerTwo = p2;

	const getLastPlayer = () => lastPlayer;

	// When a player makes a move
	const playerMove = (x, y) => {
		// If game board at this point is empty
		if(GameBoard.getBoard()[x][y] === "") {
			p1.makeMove(p1.getSymbol(), x, y)

			// Switch players
			lastPlayer = p1
			p1 = p2
			p2 = lastPlayer
	
			// Return the symbol just made
			return p2.getSymbol()
		} else {
			return false
		}
	};

	// Randomize turns in the beginning
	const randomStart = () => {
		if (Math.random() > 0.5) {
			let temp = p1;
			p1 = p2;
			p2 = temp;
		}
		return p1
	}

	// Check status of the game
	const checkGameStatus = (board) => {
		// Check rows
		for (let x=0; x < 3; x++) {
			let currSymbol = board[x][0];
			if (currSymbol == "") { continue };

			let sameCharCount = 0
			for (let y=1; y < 3; y++) {
				if (board[x][y] === currSymbol) {
					sameCharCount++
				}
			}
			if (sameCharCount == 2) { return true }
		}

		// Check columns
		for (let y = 0; y < 3; y++) {
			let currSymbol = board[0][y];
			if (currSymbol == "") { continue };

			let sameCharCount = 0
			for (let x=1; x < 3; x++) {
				if (board[x][y] === currSymbol) {
					sameCharCount++
				}
			}
			if (sameCharCount == 2) { return true }
		}

		// Check diagonals
		let first_diag = [board[0][0], board[1][1], board[2][2]].every(sym => sym == board[0][0] && sym != "");
		let second_diag = [board[0][2], board[1][1], board[2][0]].every(sym => sym == board[0][2] && sym != "");

		if (first_diag || second_diag) { return true }

		return false
	};

	// Reset the game
	const resetGame = () => {
		GameBoard.resetBoard();
		p1 = playerOne;
		p2 = playerTwo;
	};

	return {playerMove, checkGameStatus, getLastPlayer, resetGame, randomStart}
})(playerOne, playerTwo);


// Display Module
const DisplayController = ((doc) => {
	const boardElem = document.querySelector(".game-board")

	// Control content of a cell
	const chooseCell = (cellElem) => {
		let x = cellElem.dataset.row;
		let y = cellElem.dataset.column;
		let moveSymbol = GameController.playerMove(x, y);
		if (moveSymbol) { 
			cellElem.innerHTML = moveSymbol;
		};
	}

	// Render the board
	const renderBoard = () => {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				let cell = document.createElement('div')
				cell.setAttribute('class', 'box')
				cell.dataset.row = x
				cell.dataset.column = y
				cell.innerHTML = GameBoard.getBoard()[x][y]

				// Add event listener so players can interact with the board
				cell.addEventListener("click", function(){
					chooseCell(this);
					let gameStatus = GameController.checkGameStatus(GameBoard.getBoard());
					if (gameStatus) {
						alert(`${GameController.getLastPlayer().getName()} wins!`)
					} else if (GameBoard.isBoardFull()) {
						alert("It's a tie!")
					}
				})
				boardElem.appendChild(cell)
			}
		}
	};

	// Remove the board to help with reseting the game
	// TODO: Better way is to refill the cells. 
	const removeBoard = () => {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				boardElem.removeChild(boardElem.lastElementChild);
			}
		}
	};

	return { renderBoard, removeBoard }
})(document);


const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
let gameGenerated = false;

// Logic to start the game
startBtn.addEventListener("click", function(event) {
	event.preventDefault();
	if (!gameGenerated){
		let form = document.querySelector("form");
		let playerOneName = form[0].value;
		let playerTwoName = form[1].value;
		if (playerOneName && playerTwoName) {
			playerOne.setName(form[0].value);
			playerTwo.setName(form[1].value);
			DisplayController.renderBoard();
			firstMover = GameController.randomStart();
			alert(`${firstMover.getName()} goes first!`)
			gameGenerated = true;
		} else {
			alert("Please enter names for both players")
		}
	}
});


// Logic to reset the game
resetBtn.addEventListener("click", function(event) {
	event.preventDefault();
	GameController.resetGame();
	DisplayController.removeBoard();
	DisplayController.renderBoard();
	firstMover = GameController.randomStart();
	alert(`${firstMover.getName()} goes first!`)
})