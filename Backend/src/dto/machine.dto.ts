import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class ReadMachineDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The Machines id',
    example: '234957689234',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The machines Brand Name',
    example: 'La Marzocco',
  })
  brandName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The Machine Model',
    example: 'Linea Micra',
  })
  model: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The users id the machine belongs to',
    example: '7963432324987hr',
  })
  userId: string;
}

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The machines Brand Name',
    example: 'La Marzocco',
  })
  brandName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The Machine Model',
    example: 'Linea Micra',
  })
  model: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The users id the machine belongs to',
    example: '7963432324987hr',
  })
  userId: string;
}

export class EditMachineDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The machines Brand Name',
    example: 'La Marzocco',
    required: false,
  })
  brandName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The Machine Model',
    example: 'Linea Micra',
    required: false,
  })
  model?: string;
}
