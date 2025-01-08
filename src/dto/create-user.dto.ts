import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The user\'s email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'The user\'s password',
    minimum: 8,
    example: 'password123'
  })
  password: string;

  @ApiProperty({
    description: 'The user\'s name',
    example: 'John Doe'
  })
  name: string;
}

export class DeleteUserDto {
  @ApiProperty({
    description: 'The users id',
    example: "76342976324893"
  })
  id: string
}

export class ReadUserDto {
  @ApiProperty({
    description: 'The user\'s name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'The user\'s email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'The users id',
    example: "76342976324893"
  })
  id: string
}

export class EditUserDto{
  @ApiProperty({
    description: 'The user\'s name',
    example: 'John Doe'
  })
  name: string
}
