import { Expose } from 'class-transformer';

export class UserDto {
  @Expose() // Without this we would not receive 'id' in our final response package
  id: number;

  @Expose()
  email: string;
}
