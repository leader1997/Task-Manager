import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class AuthService {
  constructor(
    private helperService: HelperService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.helperService.getUserByEmail(email);

    if (!user) throw new BadRequestException('email or password not correct!!');

    if (await bcrypt.compare(pass, user.password)) {
      let jwt = await this.jwtService.sign(
        { _id: user._id },
        { secret: process.env.SECRET_TOKEN },
      );

      const { password, ...result } = user;

      return { access_token: jwt, ...result } as any;
    } else {
      throw new BadRequestException('email or password not correct!!');
    }
  }
}
