import WebSocket from "ws";

export interface Player {
  id?: WebSocket; // MVP
  playerId: string;
}
