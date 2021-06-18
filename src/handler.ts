import { error, log } from "./responders";
import WebSocket from "ws";
import store from "./store";
import { LastPosition } from "./types/types";
import random from 'random';

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
              "size": lobby.players.length
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
      case "join":
        if (!req.name) {
          res = error("Not a proper format!");
          break;
        }

        var lobby = store.lobbies.find(lobby => lobby.name === req.name);
        if (lobby) {
          var player = store.findPlayer(client);
          if (player) {
            store.subscriptions.lobbies = store.subscriptions.lobbies.filter(player => player.id !== client);
            player.color = Math.floor(random.int(0, 2_147_483_647))
            res = {
              type: "success",
              message: "lobbyconnected",
              mycolor: player.color
            }
            if (lobby.players.length !== 0) {
              client.send(JSON.stringify({
                type: "moved",
                players: lobby.players.map(lobbyPlayer => ({
                  playerId: lobbyPlayer.playerId,
                  x: lobbyPlayer.lastPosition?.x ?? 0,
                  y: lobbyPlayer.lastPosition?.y ?? 0,
                  rotation: lobbyPlayer.lastPosition?.rotation ?? 0,
                  facing: lobbyPlayer.lastPosition?.facing ? 1 : -1,
                  color: lobbyPlayer.color
                }))
              }))
            }
            player.knowsColorsOf = lobby.players.slice(0);
            lobby.players.push(player);
            for (var subscriber of store.subscriptions.lobbies) {
              subscriber.id?.send(JSON.stringify({
                type: "lobbies",
                method: "playerJoined",
                name: lobby.name
              }));
            }
          } else {
            res = error()
            console.log(res);
          }
        } else {
          res = error()
        }
        break;
      case "leave":
        var lobby = store.lobbies.find(lobby => lobby.players.some(player => player.id === client));
        if (lobby) {
          var player = store.findPlayer(client);

          if (!player)
            break;

          lobby.players = lobby.players.filter(player => player.id !== client);
          lobby.players.forEach(lobbyPlayer => lobbyPlayer.knowsColorsOf =
            lobbyPlayer.knowsColorsOf.filter(lobbyPlayer => lobbyPlayer.id != client));
          for (var subscriber of store.subscriptions.lobbies) {
            subscriber.id?.send(JSON.stringify({
              type: "lobbies",
              method: "playerLeft",
              name: lobby.name
            }));
          }
          lobby.players.forEach(lobbyPlayer => lobbyPlayer.id?.send(JSON.stringify(({
            type: "disconnected",
            playerId: player?.playerId
          }))));
          player.knowsColorsOf = [];
          res = {
            type: "success",
            message: "lobbyleft"
          }
        } else {
          res = {
            type: "error"
          }
        }
        break;
      case "move":
        if (req.x == null || req.y == null || req.facing == null || req.rotation == null || (req.facing != 1 && req.facing != -1)) {
          res = error("Not a proper format!");
          break;
        }

        var player = store.findPlayer(client);

        if(!player)
          break;

        var lobby = store.lobbies.find(lobby => lobby.players.some(player => player.id === client));
        if (!lobby)
          break;

        if (player.lastPosition?.x === req.x && player.lastPosition?.y === req.y && player.lastPosition?.rotation === req.rotation && player.lastPosition?.facing === (req.facing === 1))
          break; // ignore packets if last position is the same one

        if (!player.lastPosition)
          player.lastPosition = new LastPosition(req.x, req.y, req.rotation, req.facing === 1); // fuck javascript btw
        else {
          player.lastPosition.x = req.x;
          player.lastPosition.y = req.y;
          player.lastPosition.rotation = req.rotation;
          player.lastPosition.facing = req.facing === 1;
        }

        lobby.players.forEach(lobbyPlayer => {
          if (lobbyPlayer.id !== client && player) {
            var payload = {
              type: "moved",
              playerId: player.playerId,
              x: req.x ?? 0,
              y: req.y ?? 0,
              rotation: req.rotation,
              facing: req.facing
            }

            if (!lobbyPlayer.knowsColorsOf.some(lobbyPlayer => lobbyPlayer.id === client)) {
              payload = Object.assign(payload, {color: player.color});
              lobbyPlayer.knowsColorsOf.push(player);
            }

            lobbyPlayer.id?.send(JSON.stringify(payload))
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
