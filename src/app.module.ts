import 'dotenv/config';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      autoCreate: true,
    }),
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  exports: [AppModule],
})
export class AppModule {}
