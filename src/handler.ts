import { error, log } from "./responders";
import WebSocket from "ws";
import store from "./store";
import { LastPosition } from "./types/types";

export function handleMessage(incoming: string, client: WebSocket): string {
  try {
    const req = JSON.parse(incoming);

    if (!req) {
      return JSON.stringify(error("Didn't send anything!"));
    } else if (!req.command) {
      return JSON.stringify(error("Didn't receive any command!"));
    }

    let res: any;

    switch (req.command) {
      case "subscribe":
        if (req.type == "lobbies") {
          if (store.subscriptions.lobbies.some(player => player.id === client))
            break;

          var player = store.findPlayer(client);
          if (!player)
            break;
          
          store.subscriptions.lobbies.push(player);
          res = {
            type: "lobbies",
            method: "set",
            message: store.lobbies.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime()).map(lobby => ({
              "name": lobby.name,
              "size": lobby.players
            }))
          }
        }
        break;
      case "unsubscribe":
        if (req.type == "lobbies") {
          if (!store.subscriptions.lobbies.some(player => player.id === client))
            break;

          store.subscriptions.lobbies = store.subscriptions.lobbies.filter(player => player.id !== client);
        }
        break;
      case "move":
        if (!req.x || !req.y || !req.facing || (req.facing != 1 && req.facing != -1)) {
          res = error("Not a proper format!");
          break;
        }

        var player = store.findPlayer(client);

        if(!player)
          break;

        if (player.lastPosition?.x === req.x && player.lastPosition?.y === req.y && player.lastPosition?.facing === (req.facing === 1))
          break; // ignore packets if last position is the same one

        if (!player.lastPosition)
          player.lastPosition = new LastPosition(req.x, req.y, req.facing === 1); // fuck javascript btw
        else {
          player.lastPosition.x = req.x;
          player.lastPosition.y = req.y;
          player.lastPosition.facing = req.facing === 1;
        }

        store.players.forEach(player => {
          if (player.id !== client) {
            player.id?.send(JSON.stringify({
              type: "moved",
              playerId: client,
              x: req.x,
              y: req.y,
              facing: req.facing
            }))
          }
        })
        break;
      case "ping":
        return "pong"
    }

    return res && JSON.stringify(res);
  } catch(e) {
    console.log(e);
    return JSON.stringify(error("Not a proper format!"));
  }
}
