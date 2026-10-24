const gameCells = document.querySelectorAll('.gamecell');
const resetButton = document.querySelector('main button');

const namesDialog = document.querySelector('.names-dialog');
const namesDialogButton = namesDialog.querySelector('button');

let IA_mode = false; 
const modeButton = document.getElementById('mode-button');

modeButton.addEventListener('change', function() {
    IA_mode = (this.value === "true");
});

const Player = (name, symbol) => {
    const getSymbol = () => symbol;
    const getName = () => name;
    return {getSymbol, getName};
}

//Inicialization of Players
namesDialog.showModal();
namesDialogButton.addEventListener('click', (event) => {
    const form = namesDialog.querySelector('form');
    const player1Name = form.querySelector('#name1');
    const player2Name = form.querySelector('#name2');
    if (form.checkValidity()) {
        event.preventDefault(); // Don't want to submit this form
        const player1 = Player(player1Name.value, 'X');
        const player2 = Player(player2Name.value, 'O');
        namesDialog.close();
        gameInitialization(player1, player2);
    } 
});

//Game Initialization after player names being chosen
function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = [null, null, null, null, null, null, null, null, null];
    
        const addToArray = (symbol, position) => {
            gameBoardArray[position] = symbol;
        }
    
        const clearArray = () => {
            gameBoardArray = [null, null, null, null, null, null, null, null, null];
        }

        const getArray = () => gameBoardArray;
    
        const getGameBoardRows = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [];
            for (let i = 0; i < gameBoardArray.length / 3; i++) {
                res.push(copyGameArray.splice(0, 3));
            }
            return res;
        }
    
        const getGameBoardColumns = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [[],[],[]];
            for (let i = 0; i < gameBoardArray.length; i++) {
                if (i % 3 === 0) {
                    res[0].push(copyGameArray[i]);
                } else if (i % 3 === 1) {
                    res[1].push(copyGameArray[i]);
                } else {
                    res[2].push(copyGameArray[i]);
                }
            }
            return res;
        }
    
        const getGameBoardDiagonals = () => {
            const copyGameArray = [...gameBoardArray];
            const diagonal1 = [copyGameArray[0], copyGameArray[4], copyGameArray[8]];
            const diagonal2 = [copyGameArray[2], copyGameArray[4], copyGameArray[6]];
            return [diagonal1, diagonal2];
        }
    
        const areItemsOfArrayEqual = (arr) => {
            const res = {
                areItemsEqual: null,
                winnerSymbol: ''
            };
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] !== arr[i + 1] || arr[i] === null) {
                    res.areItemsEqual = false;
                    return res;
                }
            }
            res.areItemsEqual = true;
            res.winnerSymbol = arr[0];
            return res;
        } 
    
        const checkWinner = () => {
            const gameRows = getGameBoardRows();
            const gameColumns = getGameBoardColumns();
            const gameDiagonals = getGameBoardDiagonals();
            const gameCombinations = [...gameRows, ...gameColumns, ...gameDiagonals];
    
            const result = {
                hasSomeoneWon: false,
                tie: false,
                winnerSymbol: '',
            };
            
            //Checks if there is a winner
            for (let i = 0; i < gameCombinations.length; i++) {
                const localRes = areItemsOfArrayEqual(gameCombinations[i]);
                if (localRes.areItemsEqual) {
                    result.hasSomeoneWon = true;
                    result.winnerSymbol = localRes.winnerSymbol;
                    return result;
                };
            }
    
            //Checks tie
            if (!gameBoardArray.includes(null)) {
                result.tie = true;
                return result;
            }
    
            return result;
        }
    
        return {addToArray, clearArray, checkWinner, getArray};
    
    })();
    
    
    const displayController = (() => {
        const playerTurnTitle = document.querySelector('main p');
        const winnerDialog = document.querySelector('.result-dialog');
        const winnerDialogMessage = winnerDialog.querySelector('h1');
    
        // Close dialog when click outside form
        winnerDialog.addEventListener('click', (event) => {
            if (event.target === winnerDialog) {
                winnerDialog.close();
            }
        });
        
        const addPlayerSymbol = (target, symbol) => {
            target.textContent = symbol;
        }
    
        const changePlayerTurnTitle = (message) => {
            playerTurnTitle.textContent = message;
        }
    
        const showResultDialog = (message) => {
            winnerDialogMessage.textContent = message;
            winnerDialog.showModal();
        }
    
        const cleanGameboard = () => {
            gameCells.forEach(cell => {cell.textContent = ''})
        }
    
        return {addPlayerSymbol, changePlayerTurnTitle, showResultDialog, cleanGameboard};
        
    })();
    
    const game = ((firstPlayer, secondPlayer) => {
    let currentPlayer = firstPlayer;
    let gameEnded = false;

    // Inicialização do PlayerTurnTitle
    displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);

    const makePlayerMove = (cell, player) => {
        // Se a célula já tiver texto, retorna true (está ocupada)
        if (cell.textContent !== '') return true;

        displayController.addPlayerSymbol(cell, player.getSymbol());
        gameBoard.addToArray(player.getSymbol(), cell.dataset.position);
        return false;
    }

    const parseSymbolToPlayer = (symbol, player1, player2) => {
        switch (symbol) {
            case player1.getSymbol(): return player1;
            case player2.getSymbol(): return player2;
            default: throw new Error('Invalid symbol provided');
        }
    }

    const processGameResult = (player1, player2) => {
        const res = { gameEnded: false };
        const winnerObj = gameBoard.checkWinner();
        
        if (winnerObj.hasSomeoneWon) {
            const winnerPlayer = parseSymbolToPlayer(winnerObj.winnerSymbol, player1, player2);
            const message = `${winnerPlayer.getName()} Wins!`;
            displayController.showResultDialog(message);
            res.gameEnded = true;
        } else if (winnerObj.tie) {
            const message = `It's a Tie`;
            displayController.showResultDialog(message);
            res.gameEnded = true;
        }
        return res;
    }

    const changePlayerTurn = () => {
        currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
        const message = gameEnded ? 'Game End' : `${currentPlayer.getName()}'s Turn`;
        displayController.changePlayerTurnTitle(message);

        if (!gameEnded && IA_mode && currentPlayer === secondPlayer) {
        setTimeout(doIAMove, 1000);
        }
    }

    const doIAMove = () => {
    if (gameEnded) return;

    const arr = gameBoard.getArray(); 
    let targetPosition = null;

    //Se a IA estiver quase ganhando:
    if (arr[0] === null && arr[1] === 'O' && arr[2] === 'O' || arr[0] === null && arr[4] === 'O' && arr[8] === 'O' || arr[0] === null && arr[3] === 'O' && arr[6] === 'O') targetPosition = 0;
    else if (arr[1] === null && arr[0] === 'O' && arr[2] === 'O' || arr[1] === null && arr[4] === 'O' && arr[7] === 'O') targetPosition = 1;
    else if (arr[2] === null && arr[0] === 'O' && arr[1] === 'O' || arr[2] === null && arr[4] === 'O' && arr[6] === 'O' || arr[2] === null && arr[5] === 'O' && arr[8] === 'O') targetPosition = 2;
    else if (arr[3] === null && arr[0] === 'O' && arr[6] === 'O' || arr[3] === null && arr[4] === 'O' && arr[5] === 'O') targetPosition = 3;
    else if (arr[4] === null && arr[3] === 'O' && arr[5] === 'O' || arr[4] === null && arr[0] === 'O' && arr[8] === 'O' || arr[4] === null && arr[2] === 'O' && arr[6] === 'O' || arr[4] === null && arr[1] === 'O' && arr[7] === 'O') targetPosition = 4;
    else if (arr[5] === null && arr[3] === 'O' && arr[4] === 'O' || arr[5] === null && arr[2] === 'O' && arr[8] === 'O') targetPosition = 5;
    else if (arr[6] === null && arr[0] === 'O' && arr[3] === 'O' || arr[6] === null && arr[2] === 'O' && arr[4] === 'O' || arr[6] === null && arr[7] === 'O' && arr[8] === 'O') targetPosition = 6;
    else if (arr[7] === null && arr[1] === 'O' && arr[4] === 'O' || arr[7] === null && arr[6] === 'O' && arr[8] === 'O') targetPosition = 7;
    else if (arr[8] === null && arr[0] === 'O' && arr[4] === 'O' || arr[8] === null && arr[2] === 'O' && arr[5] === 'O' || arr[8] === null && arr[6] === 'O' && arr[7] === 'O') targetPosition = 8;
    // Se o jogador estiver quase ganhando:
    else if (arr[0] === null && arr[1] === 'X' && arr[2] === 'X' || arr[0] === null && arr[4] === 'X' && arr[8] === 'X' || arr[0] === null && arr[3] === 'X' && arr[6] === 'X') targetPosition = 0;
    else if (arr[1] === null && arr[0] === 'X' && arr[2] === 'X' || arr[1] === null && arr[4] === 'X' && arr[7] === 'X') targetPosition = 1;
    else if (arr[2] === null && arr[0] === 'X' && arr[1] === 'X' || arr[2] === null && arr[4] === 'X' && arr[6] === 'X' || arr[2] === null && arr[5] === 'X' && arr[8] === 'X') targetPosition = 2;
    else if (arr[3] === null && arr[0] === 'X' && arr[6] === 'X' || arr[3] === null && arr[4] === 'X' && arr[5] === 'X') targetPosition = 3;
    else if (arr[4] === null && arr[3] === 'X' && arr[5] === 'X' || arr[4] === null && arr[0] === 'X' && arr[8] === 'X' || arr[4] === null && arr[2] === 'X' && arr[6] === 'X' || arr[4] === null && arr[1] === 'X' && arr[7] === 'X') targetPosition = 4;
    else if (arr[5] === null && arr[3] === 'X' && arr[4] === 'X' || arr[5] === null && arr[2] === 'X' && arr[8] === 'X') targetPosition = 5;
    else if (arr[6] === null && arr[0] === 'X' && arr[3] === 'X' || arr[6] === null && arr[2] === 'X' && arr[4] === 'X' || arr[6] === null && arr[7] === 'X' && arr[8] === 'X') targetPosition = 6;
    else if (arr[7] === null && arr[1] === 'X' && arr[4] === 'X' || arr[7] === null && arr[6] === 'X' && arr[8] === 'X') targetPosition = 7;
    else if (arr[8] === null && arr[0] === 'X' && arr[4] === 'X' || arr[8] === null && arr[2] === 'X' && arr[5] === 'X' || arr[8] === null && arr[6] === 'X' && arr[7] === 'X') targetPosition = 8;
    //Se não, a IA escolhe uma posição aleatória:
    if (targetPosition === null) {
        let availablePositions = [];
        arr.forEach((cell, index) => {
            if (cell === null) availablePositions.push(index);
        });
        if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            targetPosition = availablePositions[randomIndex];
        }
    }

    if (targetPosition !== null) {
        const targetCell = Array.from(gameCells).find(cell => parseInt(cell.dataset.position) === targetPosition);
        
        makePlayerMove(targetCell, currentPlayer);
        
        const result = processGameResult(firstPlayer, secondPlayer);
        gameEnded = result.gameEnded;
        changePlayerTurn();
    }
};

    const doPlayerTurn = function(e) {
    if (gameEnded) return;
    
    // 🌟 PROTEÇÃO: Impede cliques humanos se for o turno da IA
    if (IA_mode && currentPlayer === secondPlayer) return;

    const isCellTaken = makePlayerMove(e.target, currentPlayer);
    if (isCellTaken) return;

    const result = processGameResult(firstPlayer, secondPlayer);
    gameEnded = result.gameEnded;
    changePlayerTurn();
}

    const cleanGame = function() {
        displayController.cleanGameboard();
        gameBoard.clearArray();
        currentPlayer = firstPlayer; // Garante que o Player 1 sempre recomeça
        displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
        gameEnded = false;
    }

    return { doPlayerTurn, cleanGame };

})(player1, player2);
        
    resetButton.addEventListener('click', game.cleanGame);
    
    gameCells.forEach(cell => {
        cell.addEventListener('click', game.doPlayerTurn);
    });
}
