import { config } from 'dotenv';

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { env } from './env';

console.log(env.MONGO_URL, env.SECRET_TOKEN, env.PORT, env.NODE_ENV);

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      autoCreate: true,
    }),
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  exports: [AppModule],
})
export class AppModule {}
