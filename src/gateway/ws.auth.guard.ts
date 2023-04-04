import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { HelperService } from '../helper/helper.service';
import { Socket } from 'socket.io';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private helperService: HelperService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const authHeader = client.handshake.headers['auth-token'];

    if (!Array.isArray(authHeader)) {
      try {
        const result = await this.jwtService.verify(authHeader, {
          secret: process.env.SECRET_TOKEN,
        });

        const user = await this.helperService.getUserById(
          new ObjectId(result._id),
        );
        if (user) {
          client['user'] = user;
          return true;
        }
      } catch {}
    }

    client.emit('error_events', 'Unauthorized');

    return false;
  }
}

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const ip = client._socket.remoteAddress;
    const key = this.generateKey(context, ip);
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return true;
  }
}
