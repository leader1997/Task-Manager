import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';
export type TaskEntity = HydratedDocument<TaskModel>;

@Schema({ timestamps: true })
export class TaskModel {
  @ApiProperty({
    description: 'The ID of the task',
    example: 'title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'description',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'The ID of the owner of the task',
    example: '5f9f1c9c9c9c9c9c9c9c9c9c',
  })
  @Prop({
    type: ObjectId,
    ref: 'User',
    localField: 'owner',
    foreignField: '_id',
  })
  owner: ObjectId;

  @ApiProperty({
    description: 'Whether the task is completed or not',
    example: 'true',
  })
  @Prop({ required: true })
  completed: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(TaskModel);
