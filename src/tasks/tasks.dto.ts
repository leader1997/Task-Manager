import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

import { ObjectId } from 'mongoose';
import { Task } from './tasks.interface';
import { TaskEntity } from './tasks.model';

export class CreateTaskDto implements Pick<Task, 'title' | 'description'> {
  @ApiProperty({
    description: 'The title of the task',
    maxLength: 30,
  })
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    required: true,
  })
  @IsNotEmpty()
  description: string;
}

export class GetTaskByIdDto {
  @ApiProperty({
    description: 'The ID of the task to retrieve',
  })
  @IsMongoId()
  _id: ObjectId;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: 'Whether the task is completed or not',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed: boolean;
}

export class DeleteTaskDto {
  @ApiProperty({
    description: 'The ID of the task to delete',
  })
  @IsMongoId()
  _id: ObjectId;
}

//=========================
export class CreateTaskResponseDto extends TaskEntity {
  @ApiProperty({
    description: 'The DATE OF CREATION of the task',
    example: new Date(),
  })
  createdAt: Date;
  @ApiProperty({
    description: 'The DATE OF CREATION of the task',
    example: new Date(),
  })
  updatedAt: Date;
}
