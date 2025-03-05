import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { RefreshTokenStrategy } from './refresh-token-strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: "24h"}
    })
  ],
  providers: [AuthService, LocalStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
