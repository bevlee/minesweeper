<script lang="ts">
    import { GameState } from '$lib/GameState.svelte';
	import type { Difficulty } from '$lib/schemas/Difficulty';
    let difficulty: Difficulty = $state("easy")
	let gameOverSound: HTMLAudioElement = new Audio('/audio/boom.mp3');
	let gameWinSound: HTMLAudioElement= new Audio('/audio/victory.mp3');

	function playBoom() {
		gameOverSound?.play();
	}
	function playWin() {
		gameWinSound?.play();
	}
    let settings = {
        rows: 9,
        cols: 9,
        bombs: 10
    }
    let flags: number = $state(0)
    let gameState = $state(new GameState(settings))
    let errorMessage: string = $state("");
    let gameOver: boolean = $derived(gameState.gameStatus.status === "won" || gameState.gameStatus.status === "lost");
    let timer: number
    let timeElapsed: number = $state(0);

    let reset = () => {
        errorMessage = ""
        gameState = new GameState(settings)
        flags = 0
        clearInterval(timer)
        timer = 0
        timeElapsed = 0
    }
    $effect(() => {
        const gameStatus = gameState.gameStatus.status
        if (gameStatus === "playing" && !timer) {
            startTimer()
        }
        if (gameStatus === "won" || gameStatus === "lost") {
            clearInterval(timer)
            timer = 0
        }
    })

    $effect(() => {
        const onVisibility = () => {
            if (document.hidden) {
                clearInterval(timer)
                // unset the timer incrementing
                timer = 0
            } else if (gameState.gameStatus.status === "playing") {
                startTimer()
            }
        }
        document.addEventListener("visibilitychange", onVisibility)
        return () => document.removeEventListener("visibilitychange", onVisibility)

    })

    const startTimer = () => {
        timer = setInterval(() => {
            timeElapsed ++
        }, 1000);
    }

    let changeDifficulty = (newDifficulty: Difficulty) => {
        difficulty = newDifficulty
        switch (difficulty) {

            case 'easy':
                settings = {
                    rows: 9,
                    cols: 9,
                    bombs: 10
                }
                break
            case 'medium':
                settings = {
                    rows: 16,
                    cols: 16,
                    bombs: 40
                }
                break
            case 'hard':
                settings = {
                    rows: 16,
                    cols: 30,
                    bombs: 99
                }
                break
        }
        reset()

    }
    let leftClickCell = (row: number, col: number) => {
        if (gameOver) {
            return
        }
        gameState.revealTile(row, col)
        gameOver = gameState.gameStatus.status === "won" || gameState.gameStatus.status === "lost"
        if (gameOver) {
            errorMessage = gameState.gameStatus.status === "won" ? "victory!" : "You Lose!"
            switch (errorMessage) {
                case "victory!":
                    playWin()
                    break;
                case "You Lose!":
                    playBoom()
                    break;
                default:
            }
        }
    }

    let printBoardState = () => {
        console.log(gameState)
    }
    let rightClickCell = (row: number, col: number) => {

        if (gameOver) {
            return
        }
        gameState.flagTile(row, col)
        flags = gameState.flags
        // console.log("flagging ", row," on col: ", col)
    }

    let displayCell = (state: string, value: string) => {
        if (state === "hidden") {
            return ""
        } else if (state === "flag") {
            return "🚩"
        } else if (state === "shown") {
            if (value == "") {
                return "e"
            } else {
                return value
            }
        }
    }

    let isEmpty = (state: string, value: string) => {
        return displayCell(state, value) === "e"
    }
</script>

<h1>Welcome to TicTacToe</h1>

<button
onclick={() => {reset()}}>
Reset
</button>
<div>

<button
onclick={() => {changeDifficulty('easy')}}>
Easy
</button>
<button
onclick={() => {changeDifficulty('medium')}}>
Medium
</button>
<button
onclick={() => {changeDifficulty('hard')}}>
Hard
</button>
</div>
{#if gameOver}
    <div class="game-over">Game over!</div>
{/if}
<br/>
<div class="gameHeader" >
    <div>
        Time elapsed: {timeElapsed}
    </div>
    <div>
        Bombs: {gameState.bombs - flags}
    </div>
</div>

<div class="board">
    <div class={`${difficulty}Grid`}>

    {#each gameState.board as rows, rowIndex}
        {#each rows as cell, colIndex}
        <button
            onclick={() => leftClickCell(rowIndex, colIndex)}
            oncontextmenu={(e) => {e.preventDefault(); rightClickCell(rowIndex, colIndex)}}
        >

            <div class={`cell ${isEmpty(cell.status, cell.value) ? "empty ": ""} `}> {displayCell(cell.status, cell.value) === "e" ? "" : displayCell(cell.status, cell.value)}</div>
        </button>
        {/each}
    {/each}

    </div>
</div>

{#if errorMessage != ""}
    <div>
        Error:  {errorMessage}
    </div>
{/if}

<button
onclick={() => {printBoardState()}}>
print board state
</button>
<hr/>

<style>
    .gameHeader {

    }
    .empty {
        background-color: #e5e7eb;

    }
    .cell {
        display: flex;
        border: 1px solid black;
        aspect-ratio: 1 / 1;
        justify-content: center;
        align-items: center

    }
    .easyGrid {
        display: grid;
        grid-template-columns: repeat(9, 1fr); /* 9 equal columns */
        border: 1px solid black;
    }
    .mediumGrid {
        display: grid;
        grid-template-columns: repeat(16, 1fr); /* 16 equal columns */
        border: 1px solid black;
    }
    .hardGrid {
        display: grid;
        grid-template-columns: repeat(30, 1fr); /* 30 equal columns */
        border: 1px solid black;
    }
    .board {
        width:80vh;
        max-height:80vh;
    }
</style>