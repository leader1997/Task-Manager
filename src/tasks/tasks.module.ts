import { Module } from '@nestjs/common';
import { HelperModule } from '../helper/helper.module';
import { UsersModule } from '../users/users.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [HelperModule, UsersModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
