
export interface GameRequest {
    gameName: string
}

export interface Game {
    name: string,
    players: {
        currentGuesserId: string,
        ids: Map<string, boolean>
    }
}