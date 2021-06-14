import type { Player } from "./types/types";
import store from "./store";

// Connect into the system
export function connect(player: Player) {
  store.players.push(player);
}