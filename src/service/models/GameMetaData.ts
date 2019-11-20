
export class GameMetaData {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public static EMPTY = new GameMetaData("-", "-")

}