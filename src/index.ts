import express = require("express");
import * as http from "http";
import WebSocket from "ws";
import { connect } from "./commands";
import { handleMessage } from "./handler";
import store from './store';
import { Player, Vector2 } from "./types/types";

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
    store.removePlayer(ws);
    store.players.forEach(player => player.id?.send(JSON.stringify(({
      type: "disconnected",
      playerId: playerId
    }))))
    console.log("Player " + playerId + " disconnected!")
  })

  ws.on("message", (message: string) => {
    const res = handleMessage(message, ws);
    res && ws.send(res);
  });

  if (store.players.length !== 0) {
    ws.send(JSON.stringify({
      type: "moved",
      players: store.players.map(player => ({
        playerId: player.playerId,
        x: player.lastPosition.x,
        y: player.lastPosition.y
      }))
    }))
  }
  const incomingPlayer : Player = {
    id: ws,
    playerId: uuidv4(),
    lastPosition: new Vector2(0, 0)
  };
  connect(incomingPlayer);
  console.log("Player " + incomingPlayer.playerId + " connected!")
});

//start our server
server.listen(port, () => {
  console.log(`:: Server started on ${port}`);
});
