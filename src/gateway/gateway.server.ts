import { UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthGuard, WsThrottlerGuard } from './ws.auth.guard';
import { UserDocument } from '../users/users.model';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';

const options: ThrottlerModuleOptions = {
  ttl: 60,
  limit: 10,
};

@WebSocketGateway()
export class MyGateway {
  constructor(private readonly throttlerService: ThrottlerStorageService) {}

  @WebSocketServer() server: Server;

  notifyUserCreated(user: UserDocument) {
    this.server.emit('user_created', user);
  }

  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('hello')
  notifyHelloWorld(client: Socket) {
    this.server.emit('user_created', client['user']);
  }

  handleUnauthorized() {
    this.server.emit('user_created', 'Unauthorized');
  }

  handleConnection(client: Socket) {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected', client.id);
  }

  handleConnectionError(client: any) {
    console.log('client connection error', client.id);
  }
}
