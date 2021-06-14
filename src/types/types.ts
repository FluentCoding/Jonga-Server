import WebSocket from "ws";

export interface Player {
  id?: WebSocket; // MVP
  playerId: string;
  lastPosition: LastPosition;
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