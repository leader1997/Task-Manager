import { ObjectId } from 'mongodb';
import { UserEntity } from '../../src/users/users.model';

export const userStub = (): UserEntity => {
  return {
    _id: new ObjectId('5f9f1b9b9c9d440000a1b1b1'),
    username: 'johnDoe',
    email: 'leadermossab@gmail.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserEntity;
};
