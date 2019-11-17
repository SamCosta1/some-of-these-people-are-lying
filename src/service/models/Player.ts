export class Player {
    id: string;
    isThisPlayer: boolean;
    isGuesser: boolean;

    constructor(id: string, isThisPlayer: boolean, isGuesser: boolean) {
        this.id = id;
        this.isThisPlayer = isThisPlayer;
        this.isGuesser = isGuesser;
    }
}