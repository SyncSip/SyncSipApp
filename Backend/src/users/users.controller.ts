import { Controller, Post, Body, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  CreateUserDto,
  DeleteUserDto,
  EditUserDto,
} from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from 'src/dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Post('')
  @ApiOperation({ summary: 'create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() body: CreateUserDto) {
    return await this.UsersService.create(body);
  }
}
