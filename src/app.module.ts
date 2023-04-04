import { config } from 'dotenv';

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { env } from './env';
import { ThrottlerModule } from '@nestjs/throttler';
import { Auth0Module } from './auth0/auth0.module';

console.log(env.MONGO_URL, env.SECRET_TOKEN, env.PORT, env.NODE_ENV);

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      autoCreate: true,
    }),
    UsersModule,
    TasksModule,
    Auth0Module,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 1,
    }),
  ],
  controllers: [AppController],
  exports: [AppModule],
})
export class AppModule {}
