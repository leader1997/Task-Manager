import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from '../tasks/tasks.model';
import { UserSchema } from '../users/users.model';
import { HelperService } from './helper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Task', schema: TaskSchema },
    ]),
  ],
  providers: [HelperService],
  exports: [MongooseModule, HelperService],
})
export class HelperModule {}
