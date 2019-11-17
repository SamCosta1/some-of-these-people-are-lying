export interface RawPlayersSnapshot {
    playerIds: string[]
    currentGuesserId: string
}

export interface RawArticlesSnapshot {
    articles: {
        title: string,
        playerId: string
    }[]
}