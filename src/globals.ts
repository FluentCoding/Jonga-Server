import type { Player } from "./types/types";

interface Store {
  players?: Player[];
}

declare global {
  var STORE: Store;
}
