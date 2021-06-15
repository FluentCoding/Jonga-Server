import type { Player, Lobby } from "./types/types";
import WebSocket from "ws";

interface GlobalStore {
    players: Player[],
    subscriptions: Record<string, Player[]>,
    lobbies: Lobby[],

    findPlayer(client: WebSocket | undefined): Player | undefined
    removePlayer(playerId: WebSocket | undefined): void
}

// Default tournaments, will change it soon
var store : GlobalStore = {
    players: [],
    subscriptions: {
        lobbies: []
    },
    lobbies: [],

    findPlayer: (client) => {
        return store.players.find(player => player.id === client);
    },
    removePlayer: (playerId) => {
        store.players = store.players.filter(value => value.id !== playerId);
    }
};

export default store;