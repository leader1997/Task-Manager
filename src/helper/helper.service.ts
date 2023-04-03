import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TaskEntity } from '../tasks/tasks.model';
import { UserEntity } from '../users/users.model';

@Injectable()
export class HelperService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserEntity>,
    @InjectModel('Task') private readonly taskModel: Model<TaskEntity>,
  ) {}

  async getUserByEmail(email: string) {
    const doc = await this.userModel.findOne({ email: email }).lean();
    if (!doc) {
      throw new NotFoundException('user not found');
    }
    return doc;
  }

  async getUserById(_id: ObjectId) {
    const doc = await this.userModel.findById(_id).lean();
    if (!doc) {
      throw new NotFoundException('user not found');
    }
    return doc;
  }

  async dropDatabase() {
    /*delete collection 'uesrs'*/
    await this.userModel.collection.drop();
    await this.taskModel.collection.drop();
  }

  async syncIndexes() {
    await this.userModel.syncIndexes();
    await this.taskModel.syncIndexes();
  }
}
