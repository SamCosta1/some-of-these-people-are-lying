
export interface GameRequest {
    gameName: string
}

export interface Game {
    id: string,
    name: string,
    players: {
        currentGuesserId: string,
        ids: any
    }
}