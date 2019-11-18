export class Player {
    id: string;
    isThisPlayer: boolean;
    isGuesser: boolean;

    static EMPTY: Player = new Player("-", false, false);

    constructor(id: string, isThisPlayer: boolean, isGuesser: boolean) {
        this.id = id;
        this.isThisPlayer = isThisPlayer;
        this.isGuesser = isGuesser;
    }
}