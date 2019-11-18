export class Article {
    playerId: string;
    isThisPlayer: boolean;
    isRevealed: boolean;
    title: string;

    constructor(playerId: string, title: string, isRevealed: boolean, isThisPlayer: boolean) {
        this.playerId = playerId;
        this.title = title;
        this.isThisPlayer = isThisPlayer;
        this.isRevealed = isRevealed;
    }
}