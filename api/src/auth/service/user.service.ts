import { Injectable } from '@nestjs/common';
import { UserEntity } from '../model/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  async createUser(email: string, rawPassword: string): Promise<UserEntity> {
    const password = await bcrypt.hash(rawPassword, 10);
    return this.userRepository.save({ email, password });
  }
}
