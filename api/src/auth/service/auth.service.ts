import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SessionData } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Express.User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { email: user.email, id: user.id };
    }
    return null;
  }

  async login(user?: Express.User): Promise<SessionData> {
    if (user == null) {
      return null;
    }
    const payload = { email: user.email, sub: user.id };
    return {
      userEmail: user.email,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
