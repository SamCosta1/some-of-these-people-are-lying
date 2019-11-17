
import * as functions from 'firebase-functions';
import {Game, GameRequest} from "./models";
import * as admin from 'firebase-admin';
import {CallableContext} from "firebase-functions/lib/providers/https";

admin.initializeApp();

export const joinGame = functions.https.onCall(async (request: GameRequest, context: CallableContext) => {
    const uid = validate(request, context);

    const gameSnapshot = await getGameSnapshot(request);
    const game: Game = gameSnapshot.val();

    if (!gameSnapshot || !game || !gameSnapshot.key) {
        throw new functions.https.HttpsError('not-found', "That game doesn't exist, why not create it?");
    }

    if (game.players.ids.get(uid)) {
        throw new functions.https.HttpsError( 'already-exists', 'You\'re already part of that game!')
    }

    return addPlayerToGame(gameSnapshot.key, uid);

});

export const createAndJoinGame = functions.https.onCall(async (request: GameRequest, context: CallableContext) => {
    const uid = validate(request, context);

    const gameSnapshot = await getGameSnapshot(request);

    if (gameSnapshot && !gameSnapshot.val()) {
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

function addPlayerToGame(gameId: string, userId: string) {
    return Promise.all([
        admin.database().ref(`games/${gameId}/players/ids/${userId}`).set(true),
        admin.database().ref(`users/${userId}/current-game`).set(gameId)
    ]);

}

async function getGameSnapshot(request: GameRequest): Promise<admin.database.DataSnapshot> {
    return await admin.database().ref('games').orderByChild('name').equalTo(request.gameName).once("value");
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