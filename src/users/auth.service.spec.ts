import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    // create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    // We create a new DI container for testing
    const module = await Test.createTestingModule({
      providers: [
        // Proviers is a list of classes registered inside the DI container
        AuthService,
        {
          provide: UsersService, // If anyone ask for this
          useValue: fakeUsersService, // give them this
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user sings up with email that is in use', async () => {
    await service.signup('sdf@asdf.com', 'asdf');

    const signUpPromise = service.signup('sdf@asdf.com', 'asdf');
    await expect(signUpPromise).rejects.toThrow(BadRequestException);
  });

  it('throws if signin is called with an unused email', async () => {
    const signInPromise = service.signin('asdf@asdf.com', 'asdf');
    await expect(signInPromise).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('dadawds@kmksd.com', 'wrong_password');

    const promise = service.signin('dadawds@kmksd.com', 'password');
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdf');

    const user = await service.signin('asdf@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });
});
