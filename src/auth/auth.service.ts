import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';

const mockUser = {
  id: '87r3280934234',
  name: 'snooducks',
};
@Injectable()
export class AuthService {
  async register(createUserDto: CreateUserDto) {
    return mockUser;
  }
  async login(loginDto: LoginDto) {
    return mockUser;
  }
}
