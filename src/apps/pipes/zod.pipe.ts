import { ZodSchema } from 'zod';
import { ArgumentMetadata } from '../../core/types';
import { PipeTransform } from '../../core/decorators';
import { HttpException } from '../../core/http';

export class ZodValidationPipe implements PipeTransform<any, any> {
  constructor(
    private readonly schema: ZodSchema
  ) {}

  static create(schema: ZodSchema) {
    return new ZodValidationPipe(schema);
  }

  transform(value: unknown, meta: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      const message = `Validation failed for ${meta.type}${meta.data ? ` (${meta.data})` : ''}`;
      throw new HttpException(400, message);
    }
  }
}