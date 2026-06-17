<script lang="ts">
	import Profile from '$lib/components/Profile.svelte';
	import { GameState } from '$lib/GameState.svelte';
	import { emptyProfile } from '$lib/profile';
	import type { Difficulty } from '$lib/schemas/Difficulty';
	import { UserProfileSchema, type GameStats, type UserProfile } from '$lib/schemas/UserProfile';

	let difficulty: Difficulty = $state('easy');
	let gameOverSound: HTMLAudioElement = new Audio('/audio/boom.mp3');
	let gameWinSound: HTMLAudioElement = new Audio('/audio/victory.mp3');

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
	};

	let flags: number = $state(0);
	let gameState = $state(new GameState(settings));
	let gameOver: boolean = $derived(
		gameState.gameStatus.status === 'won' || gameState.gameStatus.status === 'lost'
	);
	let won: boolean = $derived(gameState.gameStatus.status === 'won');
	let timer: number;
	let timeElapsed: number = $state(0);

    // get the player stats from localStorage
    const existingStats: string | null = localStorage.getItem("gameStats")
    let userStats: UserProfile = $state(emptyProfile())
    if (existingStats !== null) {
        const result  = UserProfileSchema.safeParse(JSON.parse(existingStats))
        if (result.success) {
            userStats = result.data
        }
    }


	let reset = () => {
		gameState = new GameState(settings);
		flags = 0;
		clearInterval(timer);
		timer = 0;
		timeElapsed = 0;
	};

	$effect(() => {
		const gameStatus = gameState.gameStatus.status;
		if (gameStatus === 'playing' && !timer) {
			startTimer();
		}
		if (gameStatus === 'won' || gameStatus === 'lost') {
			clearInterval(timer);
			timer = 0;
			if (gameStatus === 'won') playWin();
			else playBoom();
		}
	});

	$effect(() => {
		const onVisibility = () => {
			if (document.hidden) {
				clearInterval(timer);
				timer = 0;
			} else if (gameState.gameStatus.status === 'playing') {
				startTimer();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	});

	const startTimer = () => {
		timer = setInterval(() => {
			timeElapsed++;
		}, 1000);
	};

	let changeDifficulty = (newDifficulty: Difficulty) => {
		difficulty = newDifficulty;
		switch (difficulty) {
			case 'easy':
				settings = { rows: 9, cols: 9, bombs: 10 };
				break;
			case 'medium':
				settings = { rows: 16, cols: 16, bombs: 40 };
				break;
			case 'hard':
				settings = { rows: 16, cols: 30, bombs: 99 };
				break;
		}
		reset();
	};

	let leftClickCell = (row: number, col: number) => {
		if (gameOver) return;
		gameState.revealTile(row, col);
	};

	let rightClickCell = (row: number, col: number) => {
		if (gameOver) return;
		gameState.flagTile(row, col);
		flags = gameState.flags;
	};

	const pad3 = (n: number) => String(Math.max(0, Math.min(999, n))).padStart(3, '0');

	const resetFace = $derived.by(() => {
		if (gameState.gameStatus.status === 'won') return '😎';
		if (gameState.gameStatus.status === 'lost') return '😵';
		return '🙂';
	});

	const numberColor: Record<string, string> = {
		'1': 'text-ms-n1',
		'2': 'text-ms-n2',
		'3': 'text-ms-n3',
		'4': 'text-ms-n4',
		'5': 'text-ms-n5',
		'6': 'text-ms-n6',
		'7': 'text-ms-n7',
		'8': 'text-ms-n8'
	};
</script>

<div class="flex min-h-screen flex-col items-center gap-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight text-ms-text">Minesweeper</h1>

	<!-- HUD -->
	<div class="hud">
		<div class="counter" aria-label="Time elapsed">
			<span class="counter-icon">⏱</span>
			<span class="counter-digits">{pad3(timeElapsed)}</span>
		</div>

		<button class="face-btn" onclick={reset} aria-label="Reset game">
			<span class="text-3xl leading-none">{resetFace}</span>
		</button>

		<div class="counter" aria-label="Bombs remaining">
			<span class="counter-icon">💣</span>
			<span class="counter-digits">{pad3(gameState.bombs - flags)}</span>
		</div>
	</div>

	<!-- Difficulty picker -->
	<div class="segmented">
		<button
			class="seg-btn"
			class:seg-active={difficulty === 'easy'}
			onclick={() => changeDifficulty('easy')}
		>
			Easy
		</button>
		<button
			class="seg-btn"
			class:seg-active={difficulty === 'medium'}
			onclick={() => changeDifficulty('medium')}
		>
			Medium
		</button>
		<button
			class="seg-btn"
			class:seg-active={difficulty === 'hard'}
			onclick={() => changeDifficulty('hard')}
		>
			Hard
		</button>
	</div>

	<!-- Board -->
	<div class="board-card">
		<div class={`grid-${difficulty} gap-[3px]`}>
			{#each gameState.board as rows, rowIndex (rowIndex)}
				{#each rows as cell, colIndex (colIndex)}
					{@const shown = cell.status === 'shown'}
					{@const flagged = cell.status === 'flag'}
					{@const isBomb = cell.value === '💣'}
					{@const isNumber = shown && /^[1-8]$/.test(cell.value)}
					<button
						class="cell {shown ? 'cell-shown' : 'cell-hidden'} {shown && isBomb
							? 'cell-bomb'
							: ''}"
						onclick={() => leftClickCell(rowIndex, colIndex)}
						oncontextmenu={(e) => {
							e.preventDefault();
							rightClickCell(rowIndex, colIndex);
						}}
						aria-label={`row ${rowIndex + 1}, column ${colIndex + 1}`}
					>
						{#if flagged}
							<span>🚩</span>
						{:else if shown && isBomb}
							<span>💣</span>
						{:else if isNumber}
							<span class={`font-bold ${numberColor[cell.value]}`}>{cell.value}</span>
						{/if}
					</button>
				{/each}
			{/each}
		</div>
	</div>
	<Profile {...userStats} />

</div>

<style>
	/* Neumorphic shadow vocabulary */
	.hud,
	.board-card {
		background-color: var(--color-ms-surface);
		box-shadow:
			6px 6px 14px var(--color-ms-dark),
			-6px -6px 14px var(--color-ms-light);
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		border-radius: 1rem;
		width: 100%;
		max-width: 28rem;
	}

	.counter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		border-radius: 0.6rem;
		background-color: var(--color-ms-surface);
		box-shadow:
			inset 3px 3px 6px var(--color-ms-dark),
			inset -3px -3px 6px var(--color-ms-light);
	}
	.counter-icon {
		font-size: 1.1rem;
	}
	.counter-digits {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--color-ms-n3);
		letter-spacing: 0.05em;
		min-width: 3ch;
		text-align: right;
	}

	.face-btn {
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
		background-color: var(--color-ms-surface);
		box-shadow:
			4px 4px 8px var(--color-ms-dark),
			-4px -4px 8px var(--color-ms-light);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 120ms ease;
		cursor: pointer;
	}
	.face-btn:hover {
		transform: translateY(-1px);
	}
	.face-btn:active {
		box-shadow:
			inset 3px 3px 6px var(--color-ms-dark),
			inset -3px -3px 6px var(--color-ms-light);
		transform: translateY(0);
	}

	.segmented {
		display: flex;
		padding: 0.3rem;
		border-radius: 0.85rem;
		background-color: var(--color-ms-surface);
		box-shadow:
			inset 3px 3px 6px var(--color-ms-dark),
			inset -3px -3px 6px var(--color-ms-light);
		gap: 0.3rem;
	}
	.seg-btn {
		padding: 0.4rem 1rem;
		border-radius: 0.65rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-ms-text);
		opacity: 0.6;
		transition: all 120ms ease;
		cursor: pointer;
	}
	.seg-btn:hover {
		opacity: 1;
	}
	.seg-active {
		background-color: var(--color-ms-surface);
		opacity: 1;
		box-shadow:
			3px 3px 6px var(--color-ms-dark),
			-3px -3px 6px var(--color-ms-light);
	}

	.board-card {
		padding: 1rem;
		border-radius: 1.25rem;
	}

	.grid-easy,
	.grid-medium,
	.grid-hard {
		display: grid;
	}
	.grid-easy {
		grid-template-columns: repeat(9, minmax(0, 1fr));
		width: min(80vmin, 32rem);
	}
	.grid-medium {
		grid-template-columns: repeat(16, minmax(0, 1fr));
		width: min(85vmin, 40rem);
	}
	.grid-hard {
		grid-template-columns: repeat(30, minmax(0, 1fr));
		width: min(95vw, 64rem);
	}

	.cell {
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.35rem;
		background-color: var(--color-ms-surface);
		font-size: clamp(0.7rem, 2.2vmin, 1.1rem);
		transition: all 100ms ease;
		user-select: none;
	}
	.cell-hidden {
		box-shadow:
			2px 2px 4px var(--color-ms-dark),
			-2px -2px 4px var(--color-ms-light);
		cursor: pointer;
	}
	.cell-hidden:hover {
		box-shadow:
			3px 3px 6px var(--color-ms-dark),
			-3px -3px 6px var(--color-ms-light);
	}
	.cell-hidden:active {
		box-shadow:
			inset 2px 2px 4px var(--color-ms-dark),
			inset -2px -2px 4px var(--color-ms-light);
	}
	.cell-shown {
		box-shadow:
			inset 2px 2px 4px var(--color-ms-dark),
			inset -2px -2px 4px var(--color-ms-light);
		cursor: default;
	}
	.cell-bomb {
		background-color: #fecaca;
	}

	.modal-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem 2.5rem;
		border-radius: 1.5rem;
		min-width: 18rem;
	}
	.play-again {
		margin-top: 0.5rem;
		padding: 0.6rem 1.25rem;
		border-radius: 0.75rem;
		font-weight: 600;
		background-color: var(--color-ms-surface);
		box-shadow:
			3px 3px 6px var(--color-ms-dark),
			-3px -3px 6px var(--color-ms-light);
		transition: all 120ms ease;
		cursor: pointer;
	}
	.play-again:hover {
		transform: translateY(-1px);
	}
	.play-again:active {
		box-shadow:
			inset 3px 3px 6px var(--color-ms-dark),
			inset -3px -3px 6px var(--color-ms-light);
		transform: translateY(0);
	}
</style>
