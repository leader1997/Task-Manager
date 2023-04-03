import { userStub } from '../stubs/users.stubs';

export const MockUserService = {
  createUser: jest.fn().mockResolvedValue(userStub()),
  getUsers: jest.fn().mockResolvedValue([userStub()]),
  getUserById: jest.fn().mockResolvedValue(userStub()),
  whoami: jest.fn().mockResolvedValue(userStub()),
};
