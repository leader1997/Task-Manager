import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, ObjectId } from 'mongoose';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ timestamps: true })
export class UserEntity {
  @ApiProperty({
    description: 'The username',
    example: 'johnDoe',
  })
  @Prop({ required: true, unique: true })
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@email.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
