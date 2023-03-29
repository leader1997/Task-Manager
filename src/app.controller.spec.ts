import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AppModule } from './app.module';
import { TasksController } from './tasks/tasks.controller';
import { UsersController } from './users/users.controller';
import { CreateUserDto, LoginUserDto } from './users/users.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HelperService } from './helper/helper.service';
import { DeleteTaskDto, UpdateTaskDto } from './tasks/tasks.dto';
import { UserEntity } from './users/user.model';
import { TaskEntity } from './tasks/task.model';

describe('App', () => {
  let usersController: UsersController;
  let taskController: TasksController;
  let helperService: HelperService;

  let user1: UserEntity & { _id: ObjectId };
  let user2: UserEntity & { _id: ObjectId };

  let task1: TaskEntity & { _id: ObjectId };
  let task2: TaskEntity & { _id: ObjectId };

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ValidationPipe)
      .useValue(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      )
      .compile();

    usersController = app.get<UsersController>(UsersController);
    taskController = app.get<TasksController>(TasksController);
    helperService = app.get<HelperService>(HelperService);

    await helperService.dropDatabase();
    await helperService.syncIndexes();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User', () => {
    /*===============================================================================================*/
    it('Should create 2 users and a task for each one', async () => {
      //-----------------------------------------------------------------------------------------------
      //Create User 1
      const request = plainToInstance(CreateUserDto, {
        username: 'mossab',
        email: 'mossab@gmail.com',
        password: 'Mossab1997',
      });

      const errors = await validate(request);

      expect(errors.length).toBe(0);

      user1 = await usersController.createUser(request);

      expect(user1).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      //Create User 2
      const request2 = plainToInstance(CreateUserDto, {
        username: 'mossab2',
        email: 'mossab2@gmail.com',
        password: 'Mossab1997',
      });

      const errors2 = await validate(request2);

      expect(errors2.length).toBe(0);

      user2 = await usersController.createUser(request2);

      expect(user2).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      //Create Task 1
      const task = {
        title: 'Task_1',
        description: 'test description',
      };

      let payload = {
        body: task,
      } as Request;

      payload['user'] = { _id: user1._id };

      task1 = await taskController.createTask(task, payload);

      expect(task1).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      const task_2 = {
        title: 'Task_1',
        description: 'test description',
      };

      let payload_2 = {
        body: task,
      } as Request;

      payload_2['user'] = { _id: user2._id };

      task2 = await taskController.createTask(task_2, payload_2);

      expect(task2).toHaveProperty('_id');

      console.log(
        ` Task 1: ${task1._id}, Task 1: ${task1._id} , User 1: ${user1._id}, User 2: ${user2._id}`,
      );
    });
    /*===============================================================================================*/

    it('Should detect Duplicate Email during user registration', async () => {
      let request = {
        username: 'mossab',
        email: 'mossab@gmail.com',
        password: 'Mossab1997',
      } as CreateUserDto;

      await expect(usersController.createUser(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should detect an invalid access token after calling whoami', async () => {
      let request = {
        cookies: {
          'access-token':
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDFlZjUzMDFkM2IyNzA0OTlkMGUxZmMiLCJpYXQiOjE2Nzk4NTQxNTF9.3qWw0VmGoyFiO3d-y4U87UBhJN9t7-TSW6zndi40KBk',
        },
      } as Request;

      await expect(usersController.whoami(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should not pass the registration cause of Missing required fields', async () => {
      let dto = plainToInstance(CreateUserDto, {
        email: 'eemail3@mail.com',
        password: 'Mossab1997',
      });

      const errors = await validate(dto);
      expect(errors.length).not.toBe(0);

      await expect(usersController.createUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should detect if a user exists by Id', async () => {
      const request = {
        _id: new ObjectId('64209351cc72086b0fa51263'),
      };

      await expect(usersController.getUserById(request as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should not connect using incorrect Login/Password', async () => {
      const request = plainToInstance(LoginUserDto, {
        email: 'mossab@gmail.com',
        password: 'Mossab197',
      });

      const errors = await validate(request);

      expect(errors.length).toBe(0);

      await expect(
        usersController.login(request, {} as Response),
      ).rejects.toThrow(BadRequestException);
    });
  });

  //================================================================================================

  describe('TASK', () => {
    it('should not create a task for an not existing user', async () => {
      const request = {
        title: 'test',
        description: 'test description',
      };

      let payload = {
        body: {
          title: 'Task_2',
        },
      } as Request;

      payload['user'] = { _id: new ObjectId('64209351cc72086b0fa51263') };

      await expect(taskController.createTask(request, payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should try to Update a not found task', async () => {
      const request = plainToInstance(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

      const errors = await validate(request);
      expect(errors.length).toBe(0);

      const req = {
        user: {
          _id: user1._id,
        },
        params: {
          _id: new ObjectId('6420b682a779e193d2d6dc4d'), //must be changed
        },
        body: request,
      } as unknown as Request;

      await expect(
        taskController.updateTask(
          req.params['_id'] as any,
          req.user['_id'],
          req,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should try to Update a task not owned by user', async () => {
      const request = plainToInstance(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

      const errors = await validate(request);

      expect(errors.length).toBe(0);

      const req = {
        user: {
          _id: user1._id,
        },
        params: {
          _id: task2._id,
        },
        body: request,
      } as unknown as Request;

      await expect(
        taskController.updateTask(
          req.params['_id'] as any,
          req.user['_id'],
          req,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('Should try to Update a non-existent task', async () => {
      const request = plainToInstance(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

      const errors = await validate(request);

      expect(errors.length).toBe(0);

      const req = {
        user: {
          _id: user1._id,
        },
        params: {
          _id: new ObjectId('6420b682a779e196d2d6d000'),
        },
        body: request,
      } as unknown as Request;

      await expect(
        taskController.updateTask(
          req.params['_id'] as any,
          req.user['_id'],
          req,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should try to Delete a task not owned by user', async () => {
      const req = {
        user: {
          _id: user1._id,
        },
        params: {
          _id: task2._id,
        },
      } as unknown as Request;

      let params = req.params as unknown as DeleteTaskDto;

      let user = req.user['_id'];

      await expect(taskController.deleteTask(params, req)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not Delete a task by a not existing by user', async () => {
      const req = {
        user: {
          _id: new ObjectId('6420bca69205345885d22476'),
        },
        params: {
          _id: task1._id,
        },
      } as unknown as Request;

      let params = req.params as unknown as DeleteTaskDto;

      let user = req.user['_id'];

      await expect(taskController.deleteTask(params, req)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should try to Retrieve tasks for a non-existent user', async () => {
      const req = {
        user: {
          _id: new ObjectId('6420b23a19492bededf61da5'),
        },
      } as unknown as Request;

      let params = req.params as unknown as DeleteTaskDto;

      let user = req.user['_id'];

      try {
        const result = await taskController.getUserTasks(req);
        expect(result).toEqual([]);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
