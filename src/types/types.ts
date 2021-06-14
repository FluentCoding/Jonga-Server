import WebSocket from "ws";

export interface Player {
  id?: WebSocket; // MVP
  playerId: string;
  lastPosition: Vector2;
}

export class Vector2 {
  x: number;
  y: number

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}