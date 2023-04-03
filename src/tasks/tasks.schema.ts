import * as z from 'zod';

export const CreateTaskSchema = z.object({
  description: z.string(),
  title: z.string(),
});

export const GetTaskByIdSchema = z.object({
  _id: z.string(),
});

export const UpdateTaskSchema = z.object({
  completed: z.boolean().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
});

export const DeleteTaskSchema = z.object({
  _id: z.string(),
});
