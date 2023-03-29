import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HelperModule } from '../helper/helper.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, HelperModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
