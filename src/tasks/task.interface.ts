import { ObjectId } from 'mongodb';

export interface Task {
  _id: ObjectId;
  title: string;
  description: string;
  completed: boolean;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
