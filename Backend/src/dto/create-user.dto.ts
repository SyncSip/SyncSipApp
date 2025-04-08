import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's email address",
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    description: "The user's password",
    minimum: 8,
    example: 'password123',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's name",
    example: 'John Doe',
  })
  name: string;
}

export class DeleteUserDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The users id',
    example: '76342976324893',
  })
  id: string;
}

export class ReadUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's name",
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's email address",
    example: 'user@example.com',
  })
  email: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The users id',
    example: '76342976324893',
  })
  id: string;
}

export class EditUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The user's name",
    example: 'John Doe',
  })
  name?: string;
}
