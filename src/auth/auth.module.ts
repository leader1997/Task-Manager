import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HelperModule } from '../helper/helper.module';
import { AuthService } from './auth.service';

@Module({
  imports: [
    HelperModule,
    JwtModule.register({
      secret: process.env.SECRET_TOKEN,
    }),
  ],
  providers: [JwtService, AuthService],
  exports: [JwtService, AuthService],
})
export class AuthModule {}
