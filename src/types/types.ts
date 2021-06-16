import WebSocket from "ws";

export interface Player {
  id?: WebSocket; // MVP
  playerId: string;
  lastPosition?: LastPosition;
  color?: number;
  knowsColorsOf: Player[];
}

export interface Lobby {
  name: string;
  dateCreated: Date;
  players: Player[];
}

export class LastPosition {
  x: number;
  y: number;
  facing: boolean;

  constructor(x: number, y: number, facing: boolean) {
    this.x = x;
    this.y = y;
    this.facing = facing;
  }
}