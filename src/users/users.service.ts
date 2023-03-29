import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserEntity>,
    private jwtService: JwtService,
  ) {}

  helloWorld() {
    return 'Hello World';
  }

  async createUser(user: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    let payload = { ...user, password: hash };
    try {
      let result = (await this.userModel.create(payload)).toObject();
      delete result.password;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Duplicate email');
    }
  }

  getUsers() {
    return this.userModel.find({}, { __v: 0, password: 0 });
  }

  async getUserById(_id: ObjectId) {
    try {
      const user = await this.userModel.findById(_id, { __v: 0, password: 0 });
      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Bad request', error.message);
    }
  }

  async whoami(access_token: string) {
    try {
      const { _id } = await this.jwtService.verifyAsync(access_token, {
        secret: process.env.SECRET_TOKEN,
      });
      const user = this.getUserById(_id);

      if (!user) throw new NotFoundException('invalid token');
      return user;
    } catch (error) {
      throw new UnauthorizedException('invalid token');
    }
  }
}
