<script lang="ts">
	import { ACHIEVEMENTS } from '$lib/achievements/catalog';
	import type { AchievementId, DifficultyStats } from '$lib/schemas/profile';

	let {
		easy,
		medium,
		hard,
		achievements
	}: {
		easy: DifficultyStats;
		medium: DifficultyStats;
		hard: DifficultyStats;
		achievements: AchievementId[];
	} = $props();

	const rows = $derived([
		{ label: 'Easy', stats: easy },
		{ label: 'Medium', stats: medium },
		{ label: 'Hard', stats: hard }
	]);
</script>

<div class="profile">
	<h2>Stats</h2>
	<table>
		<thead>
			<tr>
				<th>Difficulty</th>
				<th>Played</th>
				<th>Won</th>
				<th>Fastest</th>
				<th>Average</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as { label, stats }}
				<tr>
					<td>{label}</td>
					<td>{stats.gamesPlayed}</td>
					<td>{stats.gamesWon}</td>
					<td>{stats.fastestTime}</td>
					<td>{stats.averageTime}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<h2>Achievements</h2>
	{#if achievements.length === 0}
		<p class="empty">No achievements earned yet.</p>
	{:else}
		<ul class="achievements">
			{#each achievements as id}
				<li class="achievement" title={ACHIEVEMENTS[id].description}>
					<span class="name">{ACHIEVEMENTS[id].title}</span>
					<span class="desc">{ACHIEVEMENTS[id].description}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.profile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.5rem 0.75rem;
		text-align: center;
	}
	th {
		font-weight: 600;
		border-bottom: 1px solid currentColor;
	}
	tbody tr:nth-child(even) {
		background: rgba(0, 0, 0, 0.04);
	}

	.achievements {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}
	.achievement {
		width: 9rem;
		height: 9rem;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.75rem;
		background: #f0f0f3;
		box-shadow:
			6px 6px 12px rgba(0, 0, 0, 0.15),
			-6px -6px 12px rgba(255, 255, 255, 0.7);
	}
	.achievement .name {
		font-weight: 700;
		font-size: 0.9rem;
	}
	.achievement .desc {
		font-size: 0.7rem;
		margin-top: 0.25rem;
		opacity: 0.8;
	}
	.empty {
		opacity: 0.7;
		font-style: italic;
	}
</style>
