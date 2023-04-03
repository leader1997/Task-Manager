import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateRequest<T, U extends object>(
  dtoClass: ClassConstructor<U>,
  input: T,
  toBe: number = 0,
): Promise<U> {
  const request = plainToClass(dtoClass, input) as U;
  const errors = await validate(request);
  expect(errors.length).toBe(toBe);

  return request;
}
