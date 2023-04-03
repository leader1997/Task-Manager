/*module nest js*/

import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyGateway } from './gateway.server';
import { WebSocketAuthGuard } from './ws.auth.guard';
import { HelperService } from '../helper/helper.service';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [HelperModule],
  providers: [MyGateway, JwtService, WebSocketAuthGuard],
  exports: [MyGateway, WebSocketAuthGuard],
})
export class GateWayModule {}
