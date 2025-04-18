var board;
var score = 0;
var rows = 4;
var columns = 4;
var previousBoard = null;
var previousScore = null;
var highScore = parseInt(localStorage.getItem('highScore')) || 0;

window.onload = function() {
    updateHighScore();
    setGame();
}

function setGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    previousBoard = JSON.parse(JSON.stringify(board));
    previousScore = score;
    score = 0;

    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ''; 

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.style.top = (r * 100 + 5) + "px";
            tile.style.left = (c * 100 + 5) + "px";
            let num = board[r][c];
            updateTile(tile, num);
            boardElement.append(tile);
        }
    }
    setTwo();
    setTwo();
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.className = "tile";
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x" + num.toString());
        } else {
            tile.classList.add("x8192");
        }
    }
}

document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowUp" || e.code === "ArrowDown") {
        saveState();
        let moved = false;
        if (e.code === "ArrowLeft") {
            moved = slideLeft();
        } else if (e.code === "ArrowRight") {
            moved = slideRight();
        } else if (e.code === "ArrowUp") {
            moved = slideUp();
        } else if (e.code === "ArrowDown") {
            moved = slideDown();
        }
        if (moved) {
            setTwo();
            document.getElementById("score").innerText = score;
            checkGameOver();
            checkWin();
            updateHighScore();
        }
    }
});

function filterZero(row) {
    return row.filter(num => num !== 0);
}

function slide(row) {
    row = filterZero(row);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }
    row = filterZero(row);
    while (row.length < columns) {
        row.push(0);
    }
    return row;
}

function slideLeft() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
            moved = true;
        }
        board[r] = newRow;
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    return moved;
}

function slideRight() {
    let moved = false;
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row.reverse();
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
            moved = true;
        }
        board[r] = newRow.reverse();
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    return moved;
}

function slideUp() {
    let moved = false;
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
            moved = true;
        }
        for (let r = 0; r < rows; r++) {
            board[r][c] = newRow[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    return moved;
}

function slideDown() {
    let moved = false;
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        let newRow = slide(row);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
            moved = true;
        }
        for (let r = 0; r < rows; r++) {
            board[3 - r][c] = newRow[r];
            let tile = document.getElementById((3 - r).toString() + "-" + c.toString());
            let num = board[3 - r][c];
            updateTile(tile, num);
        }
    }
    return moved;
}

function setTwo() {
    let emptyCells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }
    if (emptyCells.length > 0) {
        let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        updateTile(tile, board[r][c]);
    }
}

function checkGameOver() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 0 ||
                (c < columns - 1 && board[r][c] === board[r][c + 1]) ||
                (r < rows - 1 && board[r][c] === board[r + 1][c])) {
                return;
            }
        }
    }
    showGameOver();
}

function checkWin() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === 2048) {
                showWin();
                return;
            }
        }
    }
}

function showGameOver() {
    const overlay = document.getElementById('overlay');
    overlay.querySelector('.overlay-text').innerText = 'Game Over';
    overlay.classList.add('active');
}

function showWin() {
    const overlay = document.getElementById('overlay');
    overlay.querySelector('.overlay-text').innerText = 'You Win!';
    overlay.classList.add('active');
}

document.getElementById('restart').addEventListener('click', function() {
    setGame();
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('active');
});

document.getElementById('undo').addEventListener('click', function() {
    undoMove();
});

function saveState() {
    previousBoard = JSON.parse(JSON.stringify(board));
    previousScore = score;
}

function undoMove() {
    if (!previousBoard) return;

    board = JSON.parse(JSON.stringify(previousBoard));
    score = previousScore;

    const boardElement = document.getElementById("board");
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    document.getElementById("score").innerText = score;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('highscore').innerText = highScore;
}
