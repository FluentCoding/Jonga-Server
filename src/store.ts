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
    lobbies: [{
        name: "Lobby 1",
        dateCreated: new Date(),
        players: []
    },{
        name: "Lobby 2",
        dateCreated: new Date(),
        players: []
    },{
        name: "Lobby 3",
        dateCreated: new Date(),
        players: []
    },{
        name: "Lobby 4",
        dateCreated: new Date(),
        players: []
    },{
        name: "Lobby 5",
        dateCreated: new Date(),
        players: []
    }],

    findPlayer: (client) => {
        return store.players.find(player => player.id === client);
    },
    removePlayer: (client) => {
        store.players = store.players.filter(value => value.id !== client);
        for (let key in store.subscriptions) {
            store.subscriptions[key] = store.subscriptions[key].filter(player => player.id !== client);
        }
    }
};

export default store;