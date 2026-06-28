import type { GameResult } from "./schemas"
import { type DifficultyStats, type UserProfile } from "./schemas/profile"

export const createEmptyDifficultyStats = (): DifficultyStats => ({
    gamesPlayed: 0,
    gamesWon: 0,
    fastestTime: null,
    averageTime: null,

})

export const emptyProfile = (): UserProfile => ({
    easy: createEmptyDifficultyStats(),
    medium: createEmptyDifficultyStats(),
    hard: createEmptyDifficultyStats(),
    achievements: []
})

export function applyGameResult(profile: UserProfile, gameResult: GameResult): UserProfile {
    const existingStats = profile[gameResult.difficulty]
    const updated = updateDifficulty(existingStats, gameResult)

    return {
        ...profile, 
        [gameResult.difficulty]: updated
    }
}

function updateDifficulty(stats: DifficultyStats, gameResult: GameResult): DifficultyStats {
    const gamesPlayed = stats.gamesPlayed + 1

    if (!gameResult.won) {
        return {
            ...stats,
            gamesPlayed
        }
    }

    const gamesWon = stats.gamesWon + (gameResult.won? 1 : 0)
    const prevTime = (stats.averageTime ?? 0) * (gamesWon - 1)

    return {
        gamesPlayed,
        gamesWon, 
        fastestTime: Math.min(stats.fastestTime ?? Infinity, gameResult.timeElapsed),
        averageTime: (prevTime + gameResult.timeElapsed) / gamesWon 
    }
}
