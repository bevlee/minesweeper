<script lang="ts">
    import { GameState } from '$lib/GameState.svelte';
	import { string } from 'zod';
    import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
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
    let gameState = $state(new GameState(settings))
    let errorMessage: string = $state("");
    let gameOver: boolean = $state(false);
    let clickedCell: number[] = $state([0,0])
    let reset = () => {
        gameOver = false;
        errorMessage = ""
        gameState = new GameState(settings)
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
                    rows: 30,
                    cols: 16,
                    bombs: 99
                }
                break
        }

        gameState = new GameState(settings)

    }
    let leftClickCell = (row: number, col: number) => { 
        if (gameOver) { 
            return
        }
        gameState.revealTile(row, col)
        gameOver = gameState.gameStatus.status !== "playing"
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
        console.log(gameState.gameStatus)
    }
    let rightClickCell = (row: number, col: number) => { 

        if (gameOver) {
            return
        }
        gameState.flagTile(row, col)
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
    $effect(() => {
        if (gameState.gameOver) {
            alert("gameOver");
            console.log("ending the game");
        }
    });
</script>

<h1>Welcome to TicTacToe</h1>

{#if gameState.gameOver}
    <div class="game-over">Game over!</div>
{/if}
<br/>
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
<div>
    The clicked cell is {clickedCell}
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

<style>
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
        grid-template-columns: repeat(16, 1fr); /* 16 equal columns */
        border: 1px solid black;
    }
    .board {
        width:40%;
        height:40%;
        border: 1px solid black;
    }
</style>