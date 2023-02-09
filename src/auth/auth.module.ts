import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule],
  providers: [AuthService, UserService, LocalStrategy],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
