import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

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
