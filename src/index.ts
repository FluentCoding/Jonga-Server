import express = require("express");
import * as http from "http";
import WebSocket from "ws";
import { connect } from "./commands";
import { handleMessage } from "./handler";
import store from './store';
import { Player } from "./types/types";

const app = express();
const port = process.env.PORT || 80;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  ws.on('close', () => {
    // Remove player from the system
    var playerId = store.players.find(player => player.id === ws)?.playerId;

    if (!playerId)
      return;

    var lobby = store.removePlayer(ws);
    if (lobby) {
      for (var subscriber of store.subscriptions.lobbies) {
        subscriber.id?.send(JSON.stringify({
          type: "lobbies",
          method: "playerLeft",
          name: lobby.name
        }));
      }
      lobby.players.forEach(player => player.id?.send(JSON.stringify(({
        type: "disconnected",
        playerId: playerId
      }))))
    }
    console.log("Player " + playerId + " disconnected!")
  })

  ws.on("message", (message: string) => {
    const res = handleMessage(message, ws);
    res && ws.send(res);
  });

  const incomingPlayer : Player = {
    id: ws,
    playerId: uuidv4(),
    lastPosition: undefined,
    knowsColorsOf: []
  };
  connect(incomingPlayer);
  console.log("Player " + incomingPlayer.playerId + " connected!")
});

//start our server
server.listen(port, () => {
  console.log(`:: Server started on ${port}`);
});
