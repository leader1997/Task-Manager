import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { ObjectId } from 'mongoose';
import {
  CreateTaskDto,
  CreateTaskResponseDto,
  DeleteTaskDto,
  UpdateTaskDto,
} from './tasks.dto';
import { TasksService } from './tasks.service';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthentificationGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../utils/zod.pipline';
import {
  CreateTaskSchema,
  DeleteTaskSchema,
  UpdateTaskSchema,
} from './tasks.schema';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private taskService: TasksService) {}

  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
    type: [CreateTaskResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'token not found!',
        error: 'Unauthorized',
      },
    },
  })
  @Get()
  @UseGuards(AuthentificationGuard)
  getUserTasks(@Req() request: Request) {
    return this.taskService.getUserTasks(request.user['_id']);
  }

  @ApiResponse({
    status: 200,
    description: 'Create Task',
    type: CreateTaskResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'token not found!',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'title must be shorter than or equal to 30 characters',
          'title should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  @Post()
  @UseGuards(AuthentificationGuard)
  createTask(
    @Body(new ZodValidationPipe(CreateTaskSchema)) task: CreateTaskDto,
    @Req() request: Request,
  ) {
    return this.taskService.createTask(task, request.user['_id']);
  }

  @ApiResponse({
    status: 200,
    description: 'the task has been successfully updated',
    type: [CreateTaskResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'token not found!',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: 'token not found!',
        error: 'Unauthorized',
      },
    },
  })
  @Put(':_id')
  @UseGuards(AuthentificationGuard)
  updateTask(
    @Param('_id') param: ObjectId,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) updateTask: UpdateTaskDto,
    @Req() request: Request,
  ) {
    return this.taskService.updateTask(param, request.user['_id'], updateTask);
  }

  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad request',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'the task has been successfully deleted',
    type: CreateTaskResponseDto,
  })
  @Delete(':_id')
  @UseGuards(AuthentificationGuard)
  deleteTask(
    @Param(new ZodValidationPipe(DeleteTaskSchema)) param: DeleteTaskDto,
    @Req() request: Request,
  ) {
    return this.taskService.deleteTask(param._id, request.user['_id']);
  }
}
