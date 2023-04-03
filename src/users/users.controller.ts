import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AuthService } from '../auth/auth.service';
import {
  CreateResponseDto,
  CreateUserDto,
  GetUserByIdDto,
  LoginUserDto,
  UpdateUserResponseDto,
  WhoamiResponseDto,
} from './users.dto';
import { UsersService } from './users.service';
import { ApiResponse, ApiTags, OmitType } from '@nestjs/swagger';
import { ZodValidationPipe } from '../utils/zod.pipline';
import {
  CreateUserSchema,
  GetUserByIdSchema,
  LoginUserSchema,
} from './user.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  //==================================================================================================

  @ApiResponse({
    status: 200,
    description: 'The user who is logged in',
    type: OmitType(WhoamiResponseDto, ['password']),
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'invalid token',
        error: 'Unauthorized',
      },
    },
  })
  @Get('whoami')
  async whoami(@Req() req: Request) {
    try {
      const token = req.cookies['access-token'];
      return this.userService.whoami(token);
    } catch (e) {
      return new UnauthorizedException();
    }
  }
  //==================================================================================================
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully created',
    type: OmitType(CreateResponseDto, ['password']),
  })
  @ApiResponse({
    status: 401,
    description: 'Duplicate email',
    schema: {
      example: {
        statusCode: 401,
        message: 'Duplicate email',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate email',
    schema: {
      example: {
        statusCode: 400,
        message: ['username should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @Post('create')
  createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) user: CreateUserDto,
  ) {
    return this.userService.createUser(user);
  }
  //==================================================================================================
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully retrieved',
    type: [OmitType(CreateResponseDto, ['password'])],
  })
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
  //==================================================================================================
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in',
    type: OmitType(UpdateUserResponseDto, ['password']),
  })
  @ApiResponse({
    status: 404,
    description: 'Duplicate email',
    schema: {
      example: {
        statusCode: 404,
        message: 'user not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate email',
    schema: {
      example: {
        statusCode: 400,
        message: 'email or password not correct!!',
        error: 'Bad Request',
      },
    },
  })
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginUserSchema)) credentials: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    let loggedUser = await this.authService.login(
      credentials.email,
      credentials.password,
    );

    response.cookie('access-token', `${loggedUser['access_token']}`, {
      httpOnly: true,
    });

    return loggedUser;
  }
  //==================================================================================================
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully logged out',
    schema: {
      example: { message: 'success' },
    },
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access-token');
    return { message: 'success' };
  }
  //==================================================================================================
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved',
    type: OmitType(CreateResponseDto, ['password']),
  })
  @ApiResponse({
    status: 404,
    description: 'Duplicate email',
    schema: {
      example: {
        statusCode: 404,
        message: 'user not found',
        error: 'Not Found',
      },
    },
  })
  @Get(':_id')
  getUserById(
    @Param(new ZodValidationPipe(GetUserByIdSchema)) params: GetUserByIdDto,
  ) {
    return this.userService.getUserById(params._id);
  }
}
