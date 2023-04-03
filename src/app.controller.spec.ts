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
import { CreateUserDto, GetUserByIdDto, LoginUserDto } from './users/users.dto';
import { HelperService } from './helper/helper.service';
import { DeleteTaskDto, UpdateTaskDto } from './tasks/tasks.dto';
import { UserDocument } from './users/users.model';
import { TaskDocument } from './tasks/tasks.model';
import { validateRequest } from './utils/validateRequest';

describe('App', () => {
  let usersController: UsersController;
  let taskController: TasksController;
  let helperService: HelperService;

  let user1: UserDocument;
  let user2: UserDocument;

  let task1: TaskDocument;
  let task2: TaskDocument;

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
    it('Should create 2 users', async () => {
      //-----------------------------------------------------------------------------------------------
      //Create User 1
      const request = await validateRequest(CreateUserDto, {
        username: 'badr',
        email: 'badr@gmail.com',
        password: 'Mossab1997',
      });

      user1 = await usersController.createUser(request);

      expect(user1).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      //Create User 2
      const request2 = await validateRequest(CreateUserDto, {
        username: 'mossab2',
        email: 'mossab2@gmail.com',
        password: 'Mossab1997',
      });

      user2 = await usersController.createUser(request2);

      expect(user2).toHaveProperty('_id');
    });

    //-----------------------------------------------------------------------------------------------
    //Create Task 1
    it('Should create a task for each user ', async () => {
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
    });
    /*===============================================================================================*/

    it('Should detect Duplicate Email during user registration', async () => {
      let request = {
        username: 'badr',
        email: 'badr@gmail.com',
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
      let dto = (await validateRequest(
        CreateUserDto,
        {
          email: 'eemail3@mail.com',
          password: 'Mossab1997',
        },
        1,
      )) as CreateUserDto;

      await expect(usersController.createUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should detect if a user exists by Id', async () => {
      const request = (await validateRequest(GetUserByIdDto, {
        _id: new ObjectId('6424dadd1753b6c96fd57c01'),
      })) as GetUserByIdDto;

      await expect(usersController.getUserById(request)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should not connect using incorrect Login/Password', async () => {
      const request = (await validateRequest(LoginUserDto, {
        email: 'badr@gmail.com',
        password: 'Mossab197',
      })) as LoginUserDto;

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
      const request = await validateRequest(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

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
      const request = await validateRequest(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

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
      const request = await validateRequest(UpdateTaskDto, {
        title: 'test',
        description: 'test description',
      });

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
