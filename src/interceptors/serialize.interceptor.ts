import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';

interface ClassContructor {
  new (...args: any[]): {}  // This is a type that means "I accept anything as long as it is a class"
}

export function Serialize(dto: ClassContructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        // 'data' is the User entity we want to transform
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, // We need this in order to work corectly with our DTO
        });
      }),
    );
  }
}
