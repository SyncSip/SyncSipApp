import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, isString } from 'class-validator';

export class UserResponseDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's id",
    example: '234957689234',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's name",
    example: 'John Doe',
  })
  name: string;
}

export class LoginResponseDto {
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's id",
    example: '234957689234',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'the access token',
  })
  accessToken: string;
}

export class RefreshDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's id",
    example: '234957689234',
  })
  id: string;

  @IsNotEmpty()
  @ApiProperty({
    description: "The user's refresh token",
    example: '234957689234',
  })
  refreshToken: string;
}
