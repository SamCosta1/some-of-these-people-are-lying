import AuthService from "./AuthService";
import GameService from "./GameService";
import ErrorService from "./ErrorService";
import WikiService from "./WikiService";

class Injector {
    authService = new AuthService();
    gameService = new GameService(this.authService);
    errorService = new ErrorService();
    wikiService = new WikiService();
}

let _injector: Injector;

export default {
    instance: () => {
        if (!_injector) {
            throw new Error("Injector not initalized");
        }

        return _injector;
    },
    initializeInjector: () => {
        if (_injector) {
            throw new Error("Injector already initalized");
        }

        _injector =  new Injector();
        return _injector;
    }
}