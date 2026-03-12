// src/events/events.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('Websocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // ✅ Client ke auth se userId lo aur room join karo
    const userId =
      client.handshake.auth?.userId || client.handshake.query?.userId;

    if (userId) {
      client.join(userId as string);
      this.logger.log(`User ${userId} joined room ${userId}`);
    } else {
      this.logger.warn(`Client ${client.id} connected without userId`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ✅ Sirf ek specific user ko emit karo (room = userId)
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
    this.logger.log(`Emitted '${event}' to user ${userId}`);
  }

  // Sabko emit karo (admin broadcast ke liye)
  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}