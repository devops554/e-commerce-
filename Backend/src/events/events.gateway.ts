// src/events/events.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { ShipmentsService } from '../shipments/shipments.service';

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

  constructor(
    @Inject(forwardRef(() => ShipmentsService))
    private readonly shipmentsService: ShipmentsService,
  ) { }

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
      this.logger.log(`User ${userId} joined personal room ${userId}`);
    } else {
      this.logger.warn(`Client ${client.id} connected without userId`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (data.orderId) {
      client.join(`order_${data.orderId}`);
      this.logger.log(`Client ${client.id} joined room order_${data.orderId}`);
      return { status: 'joined', room: `order_${data.orderId}` };
    }
  }

  @SubscribeMessage('location-update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { latitude: number; longitude: number; partnerId?: string },
  ) {
    const partnerId = data.partnerId || client.handshake.auth?.userId || client.handshake.query?.userId;
    if (!partnerId) {
      this.logger.warn(`Location update ignored: No partnerId found for client ${client.id}`);
      return;
    }

    this.logger.log(`Location update from partner ${partnerId}: ${data.latitude}, ${data.longitude}`);

    // Delegate to ShipmentsService to find active shipment and broadcast
    await this.shipmentsService.handlePartnerLocationUpdate(partnerId, data.latitude, data.longitude);
  }

  // ✅ Sirf ek specific user ko emit karo (room = userId)
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
    this.logger.log(`Emitted '${event}' to user ${userId}`);
  }

  // ✅ Broadcast to a specific order room
  emitToOrderRoom(orderId: string, event: string, data: any) {
    this.server.to(`order_${orderId}`).emit(event, data);
    this.logger.log(`Emitted '${event}' to order room order_${orderId}`);
  }

  // Sabko emit karo (admin broadcast ke liye)
  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}