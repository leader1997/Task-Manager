import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthentificationGuard implements CanActivate {
  constructor(private userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let request = context.switchToHttp().getRequest() as Request;

              const token = request.headers['access-token'];

      if (token && typeof token === 'string') {
                let user = await this.userService.whoami(token);
        request.user = user;
        if (user) return true;

        return false;
      } else {
        throw new UnauthorizedException('token not found!');
      }
    } catch (e) {
      return false;
    }
  }
}
