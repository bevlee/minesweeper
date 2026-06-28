import type { Difficulty, GameStatus, Settings, Tile } from './schemas/game';


export class GameState {
    board: Tile[][] = $state([]);
    gameStatus: GameStatus = $state({status: "ready"})
    rows: number;
    cols: number;
    bombsLeftCount: number;
    bombs: Set<string>;
    flags: number = $state(0)
    leftClicks: number = 0
    rightClicks: number = 0
    chords: number = 0
    visited: Set<string>
    constructor(settings: Settings) {
        this.gameStatus = {status: "ready"}
        //init board
        this.board = Array.from({length: settings.rows}, () => Array.from({length: settings.cols}, () => ({ value: "0", status: "hidden" }) satisfies Tile));
        this.rows = settings.rows;
        this.cols = settings.cols;
        this.bombsLeftCount = settings.bombs;
        this.bombs = new Set<string>;
        this.visited = new Set<string>()

        while (this.bombs.size < settings.bombs) {
            this.addBomb()
        }
        for (const bomb of this.bombs) {
            const [r,c] = bomb.split(",").map(Number)
            this.board[r][c].value = "💣"
        }
        let rowValue = 0;
        // calculate the tiles for their numbers 
        for (let row = 0; row < settings.rows; row++) {
            for (let col = 0; col < settings.cols; col++) {
                if (this.board[row][col].value !== "💣") {
                    // check all adjacent tiles and num of bombs adjacent
                    for (let rowModifier = -1; rowModifier <= 1; rowModifier ++) {
                        for (let colModifier = -1; colModifier <= 1; colModifier ++) {
                            if (row + rowModifier >= 0 && row + rowModifier < settings.rows &&col + colModifier >= 0 && col + colModifier < settings.cols && this.board[row+rowModifier][col+colModifier].value === "💣") {
                                rowValue++
                            }
                        }
                    }
                    this.board[row][col].value = rowValue === 0 ? "" : rowValue + ""
                    rowValue = 0
                }
            }
        }
    }

    addBomb() {
        const row = Math.floor(Math.random() * this.rows)
        const col = Math.floor(Math.random() * this.cols)
        this.bombs.add(`${row},${col}`)
    }
    
    revealTile(row: number, col: number) {

        if (this.board[row][col].status === "flag") {
            this.flagTile(row, col)
        }
        if (!this.visited.has(`${row},${col}`)) {
            this.leftClicks++
            // start the timer with this state
            this.gameStatus.status = "playing"
            this.visited.add(`${row},${col}`)

            if (this.visited.size === this.rows * this.cols - this.bombsLeftCount) {

                this.gameStatus = {status: "won"}

                return {isGameOver: true, gameStats: {
                    leftClicks: this.leftClicks,
                    rightClicks: this.rightClicks,
                    chords: this.chords

                }}
            }
            // console.log(`calling revealTile on tile ${row}, ${col}`)

            this.board[row][col].status = "shown"
            
            if (this.board[row][col].value === "💣") {
                this.gameStatus = {status: "lost"}
            } else if (this.board[row][col].value === "") {

                for (let rowModifier = -1; rowModifier <= 1; rowModifier ++) {
                    for (let colModifier = -1; colModifier <= 1; colModifier ++) {
                        if (row + rowModifier >= 0 && row + rowModifier < this.rows && col + colModifier >= 0 && col + colModifier < this.cols && !(colModifier == 0 && rowModifier == 0)) {
                            this.revealTile(row+rowModifier, col+colModifier)
                        }
                    }
                }
            }
        } else {
            // been visited already
            // do a scan of nearby flags
            // also called a chord
            if (/^[1-8]$/.test(this.board[row][col].value)) {
                this.chords++

                const tileValue = Number(this.board[row][col].value);
                let nearbyFlags = 0
                for (let rowModifier = -1; rowModifier <= 1; rowModifier ++) {
                        for (let colModifier = -1; colModifier <= 1; colModifier ++) {
                            if (row + rowModifier >= 0 && row + rowModifier < this.rows &&col + colModifier >= 0 && col + colModifier < this.cols && !(colModifier == 0 && rowModifier == 0)) {
                                if (this.board[row+rowModifier][col+colModifier].status == "flag") {
                                    nearbyFlags++
                                }
                            }
                        }
                    }
                if (nearbyFlags == tileValue) {
                    for (let rowModifier = -1; rowModifier <= 1; rowModifier ++) {
                        for (let colModifier = -1; colModifier <= 1; colModifier ++) {
                            if (row + rowModifier >= 0 && row + rowModifier < this.rows &&col + colModifier >= 0 && col + colModifier < this.cols && !(colModifier == 0 && rowModifier == 0)) {
                                if (this.board[row+rowModifier][col+colModifier].status == "hidden") {
                                    this.revealTile(row+rowModifier,col+colModifier)
                                }
                            }
                        }
                    }
                }
            }
        }

        return {isGameOver: false, gameStats: null}
    }

    flagTile(row: number, col: number) {
        this.rightClicks++
        if (this.board[row][col].status == "shown") {
            return
        }
        if (this.board[row][col].status === "flag") {

            this.board[row][col].status = "hidden"
            this.flags--
        } else {
            this.board[row][col].status = "flag"
            this.flags++
        }
    }

    getResult(timeElapsed: number, difficulty: Difficulty): GameResult | null {
        if (this.gameStatus.status !== "won" && this.gameStatus.status !== "lost") {
            return null
        }
        return {
            won: this.gameStatus.status === "won",
            timeElapsed,
            flagsPlaced: this.flags,
            difficulty
        }
    }
}