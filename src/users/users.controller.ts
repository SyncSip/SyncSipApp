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

  @Patch('user')
  @ApiOperation({ summary: 'edit a user' })
  @ApiBody({ type: EditUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully edited',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async register(@Body() editUserDto: EditUserDto): Promise<UserResponseDto> {
    return await this.UsersService.edit(editUserDto);
  }

  @Delete('user')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiBody({ type: DeleteUserDto })
  @ApiResponse({
    status: 200,
    description: 'Delete User',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async login(@Body() deleteUserDto: DeleteUserDto): Promise<UserResponseDto> {
    return this.UsersService.delete(deleteUserDto);
  }
}
