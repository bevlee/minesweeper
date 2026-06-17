import { type GameStats, type UserProfile, UserProfileSchema, type AchievementId } from "./schemas/UserProfile"


export const createEmptyGameStats = (): GameStats => ({
    
    gamesPlayed: 0,
    gamesWon: 0,
    fastestTime: 999,
    averageTime: 999,

})

export const emptyProfile = (): UserProfile => ({
    easy: createEmptyGameStats(),
    medium: createEmptyGameStats(),
    hard: createEmptyGameStats(),
    achievements: []
})

