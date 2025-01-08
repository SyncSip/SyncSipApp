import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
}
