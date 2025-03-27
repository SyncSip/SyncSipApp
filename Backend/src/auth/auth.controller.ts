import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto, UserResponseDto } from 'src/dto/user-response.dto';
import { LocalStrategy } from './local.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalStrategy)
  @Post('/login')
  async login(@Body() body: {username: string, password: string}) {
    const login = await this.authService.login(body.username, body.password);
    console.log(login)
    return login
  }

  @UseGuards(LocalStrategy)
  @Post('/refresh')
  async refreshTokens(@Body() body: RefreshDto) {
    return this.authService.refreshTokens(body.id, body.refreshToken);
  }

  @Post('/logout')
  async logout(@Body() body: RefreshDto) {
    await this.authService.logout(body.id);
    return { message: 'Logged out successfully' };
  }

  @Post('/register')
  async register(@Body() body: CreateUserDto){
    console.log(body)
    return await this.authService.register(body)
  }
}
