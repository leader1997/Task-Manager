import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { TaskEntity } from './task.model';
import { GetUserByIdDto } from '../users/users.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task') private readonly taskModel: Model<TaskEntity>,
    private readonly userService: UsersService,
  ) {}

  getUserTasks(userId: ObjectId) {
    return this.taskModel.find({ owner: userId }).lean();
  }

  async createTask(task: CreateTaskDto, userId: ObjectId) {
    await this.userService.getUserById(userId);
    let newTask = {
      ...task,
      owner: userId,
      completed: false,
    };

    return this.taskModel.create(newTask);
  }

  async updateTask(_id: ObjectId, userId: ObjectId, task: UpdateTaskDto) {
    try {
      let result = await this.taskModel
        .findOneAndUpdate({ _id: _id, owner: userId }, task)
        .lean();

      if (!result) throw new NotFoundException('Task not found');

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Bad request ');
    }
  }

  async deleteTask(_id: ObjectId, userId: ObjectId) {
    try {
      let result = await this.taskModel
        .findOneAndDelete({
          _id: _id,
          owner: userId,
        })
        .lean();

      if (!result) throw new NotFoundException('Task not found');

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new UnauthorizedException('Bad request');
    }
  }
}
