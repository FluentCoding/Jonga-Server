import type { Player } from "./types/types";
import WebSocket from "ws";

interface GlobalStore {
    players: Player[],

    removePlayer(playerId: WebSocket | undefined): void
}

// Default tournaments, will change it soon
var store : GlobalStore = {
    players: [],

    removePlayer: (playerId) => {
        store.players = store.players.filter(value => value.id !== playerId);
    }
};

export default store;