import AuthService from "./AuthService";
import GameService from "./GameService";

class Injector {

    authService = new AuthService();
    gameService = new GameService(this.authService);
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