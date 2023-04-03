import { IsEmail, IsMongoId, IsNotEmpty, MinLength } from 'class-validator';
import { ObjectId } from 'mongoose';
import { User } from './users.interface';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './users.model';
import produce from 'immer';

export class CreateUserDto implements User {
  @ApiProperty({
    description: 'The username of the user',
    required: true,
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    required: true,
    minLength: 8,
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class GetUserByIdDto {
  @ApiProperty({
    description: 'The ID of the user to retrieve',
  })
  @IsMongoId()
  _id: ObjectId;
}

export class LoginUserDto implements Pick<User, 'email' | 'password'> {
  @ApiProperty({
    description: 'The email of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty()
  password: string;
}
//================================================================
// Whoami
// Response: 200 OK
export class WhoamiResponseDto extends UserEntity {
  @ApiProperty({
    description: 'The ID of the user',
    example: '5f9f1c9c0b9b9c0b8c0b8c0b',
  })
  _id: ObjectId;
}

export class CreateResponseDto extends UserEntity {
  @ApiProperty({
    description: 'The ID of the user',
    example: '5f9f1c9c0b9b9c0b8c0b8c0b',
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'The date the user was created',
    example: '2020-11-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date the user was last updated',
    example: '2020-11-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateUserResponseDto extends CreateResponseDto {
  @ApiProperty({
    description: 'The tasks of the user',
    example:
      'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDFlZjUzMDFkM2IyNzA0OTlkMGUxZmIiLCJpYXQiOjE2Nzk3NTI0NTB9.tU0_pRmTWYKMlToqxCR74IlGBcV1CwltnekI9FSDdfw',
  })
  access_token: string;
}
