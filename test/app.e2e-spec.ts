/** init e2e testing file */
import {
  HttpStatus,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto, LoginUserDto } from '../src/users/users.dto';
import { UserDocument } from '../src/users/users.model';
import { TaskDocument } from '../src/tasks/tasks.model';
import { validateRequest } from '../src/utils/validateRequest';
import { UsersController } from '../src/users/users.controller';
import { Request } from 'express';
import { TasksController } from '../src/tasks/tasks.controller';
import { HelperService } from '../src/helper/helper.service';
import { JwtService } from '@nestjs/jwt';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let usersController: UsersController;
  let taskController: TasksController;
  let helperService: HelperService;
  let jwtService: JwtService;

  let user_1: UserDocument;
  let user_2: UserDocument;

  let task_1: TaskDocument;
  let task_2: TaskDocument;

  let access_token_1: string;
  let access_token_2: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = app.get<UsersService>(UsersService);
    usersController = app.get<UsersController>(UsersController);
    taskController = app.get<TasksController>(TasksController);
    helperService = app.get<HelperService>(HelperService);
    jwtService = app.get<JwtService>(JwtService);

    await helperService.dropDatabase();
    await helperService.syncIndexes();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User', () => {
    /*==================================================================================================*/
    it('Should create 2 users', async () => {
      //-----------------------------------------------------------------------------------------------
      //Create User 1
      const request = await validateRequest(CreateUserDto, {
        username: 'mossab',
        email: 'mossab@gmail.com',
        password: 'Mossab1997',
      });

      user_1 = await usersController.createUser(request);

      expect(user_1).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      //Create User 2
      const request2 = await validateRequest(CreateUserDto, {
        username: 'mossab2',
        email: 'mossab2@gmail.com',
        password: 'Mossab1997',
      });

      user_2 = await usersController.createUser(request2);

      expect(user_2).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      //Create Task 1
    });

    it('Should create a task for each user', async () => {
      const task = {
        title: 'Task_1',
        description: 'test description',
      };

      let payload = {
        body: task,
      } as Request;

      payload['user'] = { _id: user_1._id };

      task_1 = await taskController.createTask(task, payload);

      expect(task_1).toHaveProperty('_id');
      //-----------------------------------------------------------------------------------------------
      const task2 = {
        title: 'Task_1',
        description: 'test description',
      };

      let payload_2 = {
        body: task2,
      } as Request;

      payload_2['user'] = { _id: user_2._id };

      task_2 = await taskController.createTask(task2, payload_2);

      expect(task_2).toHaveProperty('_id');
    });

    it('Should init access token', async () => {
      access_token_1 = await jwtService.sign(
        { _id: user_1._id },
        { secret: process.env.SECRET_TOKEN },
      );

      access_token_2 = await jwtService.sign(
        { _id: user_2._id },
        { secret: process.env.SECRET_TOKEN },
      );
    });
    /*==================================================================================================*/
    it('/users/create (POST) - Should detect Duplicate Email during user registration', async () => {
      const user: CreateUserDto = {
        username: 'mossab',
        email: 'mossab@gmail.com',
        password: 'Mossab1997',
      };

      const response = await request(app.getHttpServer());
      response.post('/users/create').send(user).expect(HttpStatus.UNAUTHORIZED);
    });

    it('/users/create (POST)-  Should detect an invalid access token after calling whoami', async () => {
      const user: CreateUserDto = {
        username: 'mossab',
        email: 'leadermossab@gmail.com',
        password: 'Mossab1997',
      };

      let MY_ACCESS_TOKEN =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDFlZjUzMDFkM2IyNzA0OTlkMGUxZmMiLCJpYXQiOjE2Nzk4NTQxNTF9.3qWw0VmGoyFiO3d-y4U87UBhJN9t7-TSW6zndi40KBk';

      await request(app.getHttpServer())
        .post('/users/create')
        .set('Cookie', `access_token=${MY_ACCESS_TOKEN}`)
        .send(user)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/users/:id (Get) - Should detect if a user exists by Id', async () => {
      await request(app.getHttpServer())
        .get('/users/123')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('/users/login (POST) - Should not connect using incorrect Login/Password', async () => {
      const user: LoginUserDto = {
        email: 'mossab@gmail.com',
        password: 'Mossab197',
      };

      await request(app.getHttpServer())
        .post('/users/login')
        .send(user)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  //====================================================================================================
  describe('Task', () => {
    it('/tasks (POST) - Should not create a task for an not existing user', async () => {
      const task = {
        title: 'a',
        description: 'test',
      };

      await request(app.getHttpServer())
        .post('/tasks')
        .set('access-token', `${access_token_1}+ 'x'`)
        .send(task)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('/tasks/:id (UPDATE) - should try to Update a not found task', async () => {
      const task = {
        title: 'a',
        description: 'test',
      };

      await request(app.getHttpServer())
        .put('/tasks/123')
        .set('access-token', `${access_token_1}`)
        .send(task)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('/tasks/:id (UPDATE) - Should try to Update a task not owned by user', async () => {
      const task = {
        title: 'a',
        description: 'test',
      };

      await request(app.getHttpServer())
        .put(`/tasks/${task_1._id}`)
        .set('access-token', `${access_token_2}`)
        .send(task)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/tasks/:id (UPDATE) - try to Update a non-existent task', async () => {
      const task = {
        title: 'a',
        description: 'test',
      };

      await request(app.getHttpServer())
        .put(`/tasks/6420b682a779e196d2d6d000`)
        .set('access-token', `${access_token_2}`)
        .send(task)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/tasks/:id (DELETE) - should try to Delete a task not owned by user', async () => {
      const task = {
        completed: true,
      };

      await request(app.getHttpServer())
        .delete(`/tasks/${task_1._id}`)
        .set('access-token', `${access_token_2}`)
        .send(task)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/tasks/:id (DELETE) - should try to Delete a task not owned by user', async () => {
      const task = {
        completed: true,
      };

      await request(app.getHttpServer())
        .delete(`/tasks/${task_1._id}`)
        .set('access-token', `${access_token_2 + 'x'}`)
        .send(task)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('/tasks/ (GET) - should try to Retrieve tasks for a non-existent user', async () => {
      const task = {
        completed: true,
      };

      await request(app.getHttpServer())
        .get(`/tasks`)
        .set('access-token', `${access_token_2 + 'x'}`)
        .send(task)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
