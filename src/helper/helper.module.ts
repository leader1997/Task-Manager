import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from '../tasks/task.model';
import { UserSchema } from '../users/user.model';
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
