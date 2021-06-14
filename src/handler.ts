import { error, log } from "./responders";
import WebSocket from "ws";
import store from "./store";

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
      case "move":
        if (!req.x || !req.y) {
          res = error("Not a proper format!");
          break;
        }

        var player = store.players.find(player => player.id === client);

        if(!player)
          return "";

        var id = player.playerId;

        player.lastPosition.x = req.x;
        player.lastPosition.y = req.y;

        store.players.forEach(player => {
          if (player.id !== client) {
            player.id?.send(JSON.stringify({
              type: "moved",
              playerId: id,
              x: req.x,
              y: req.y
            }))
          }
        })
      case "ping":
        return "pong"
    }

    return res && JSON.stringify(res);
  } catch(e) {
    console.log(e);
    return JSON.stringify(error("Not a proper format!"));
  }
}
