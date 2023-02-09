import { Injectable } from '@nestjs/common';
import { UserEntity } from '../model/user.entity';

@Injectable()
export class UserService {
  private readonly users: UserEntity[] = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'user1@domain.com',
      password: 'password',
    },
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      email: 'user2@domain.com',
      password: 'password',
    },
  ];

  async findOne(email: string): Promise<UserEntity | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
