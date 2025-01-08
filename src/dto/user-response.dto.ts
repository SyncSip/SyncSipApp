import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {

  @ApiProperty({
    description: 'The user\'s id',
    example: '234957689234'
  })
  id: string;

  @ApiProperty({
    description: 'The user\'s name',
    example: 'John Doe'
  })
  name: string;
}
