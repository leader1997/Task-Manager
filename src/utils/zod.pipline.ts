import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import * as z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodObject<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const validatedData = this.schema.parse(value);
      return validatedData;
    } catch (error) {
      throw new BadRequestException(error.errors);
    }
  }
}
