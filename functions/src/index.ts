
import * as functions from 'firebase-functions';
import {Game, GameRequest} from "./models";
import * as admin from 'firebase-admin';
import {CallableContext} from "firebase-functions/lib/providers/https";

admin.initializeApp();

export const joinGame = functions.https.onCall(async (request: GameRequest, context: CallableContext) => {
    const uid = validate(request, context);

    const game: Game | null = await getGameSnapshot(request);

    if (!game || !game.id) {
        throw new functions.https.HttpsError('not-found', "That game doesn't exist, why not create it?");
    }

    if (game.players && game.players.ids && game.players.ids[uid]) {
        throw new functions.https.HttpsError( 'already-exists', 'You\'re already part of that game!')
    }

    return addPlayerToGame(game.id, uid);
});

export const createAndJoinGame = functions.https.onCall(async (request: GameRequest, context: CallableContext) => {
    const uid = validate(request, context);

    const game: Game | null = await getGameSnapshot(request);

    if (game && game.id) {
        throw new functions.https.HttpsError('already-exists', "That game already exists, why not join it?");
    }

    const createGameSnapshot = await admin.database().ref('games').push({
        name: request.gameName
    });

    if (createGameSnapshot.key) {
        return addPlayerToGame(createGameSnapshot.key, uid);
    } else {
        throw new functions.https.HttpsError('unknown', "Failed to create game idk");
    }
});

export const leaveCurrentGame = functions.https.onCall(async (request: void, context: CallableContext) => {
    if (!context || !context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError('unauthenticated', "Who the hell are you?");
    }

    const uid = context.auth.uid;
    const gameSnap = await admin.database().ref(`users/${uid}/current-game`).once('value');
    const gameId: string = gameSnap.val();

    if (!gameId) {
        throw new functions.https.HttpsError('not-found', "You're not in a game...");
    }

    return Promise.all([
        admin.database().ref(`games/${gameId}/players/ids/${uid}`).remove(),
        admin.database().ref(`users/${uid}/current-game`).set(null)
    ]);
});

function addPlayerToGame(gameId: string, userId: string) {
    return Promise.all([
        admin.database().ref(`games/${gameId}/players/ids/${userId}`).set(true),
        admin.database().ref(`users/${userId}/current-game`).set(gameId)
    ]);

}

// TODO: Look at this with fresh eyes since surely there's a better way of doing this
async function getGameSnapshot(request: GameRequest): Promise<Game | null> {
    const gameSnapshot = await admin.database().ref('games').orderByChild('name').equalTo(request.gameName).limitToFirst(1).once("value");
    const child = gameSnapshot.val();
    for (let key in child){
        if (child.hasOwnProperty(key)){
            const game = child[key];
            game.id = key;
            return game
        }
    }

    return null;
}

// Returns the userId
function validate(request: GameRequest, context: CallableContext): string {
    if (!context || !context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError('unauthenticated', "Who the hell are you?")
    }

    if (request.gameName.trim().length < 2) {
        throw new functions.https.HttpsError('invalid-argument', "Invalid game name")
    }

    return context.auth.uid;
}