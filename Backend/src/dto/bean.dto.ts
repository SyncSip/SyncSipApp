import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
} from 'class-validator';
import { CustomField } from 'src/data/entities/shot.entity/shot.entity';

export class CreateBeanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the roastery',
    example: 'Square Mile',
  })
  roastery: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the bean/blend',
    example: 'Red Brick',
  })
  bean: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The altitude of the coffee farm in meters',
    example: '1000',
    required: false,
  })
  altitudeInMeters?: string;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'The date this bean was roasted',
    example: new Date(),
    required: false,
  })
  roastDate?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'process',
    example: 'Washed',
    required: false,
  })
  process?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Genetic',
    example: 'Arabica',
    required: false,
  })
  genetic?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Variety',
    example: 'Maragogype',
    required: false,
  })
  variety?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Customfields',
    example: [{ key: 'frozen', value: 'yes' }],
    required: false,
  })
  customFields?: CustomField[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The origin country of the coffee',
    example: 'Kenya',
    required: false,
  })
  origin?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Indicates if a bag of coffee is empty or not',
    example: 'true',
    required: false,
  })
  full?: boolean;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's id the beans belong to",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  userId: string;
}

export class ReadBeanDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The bean's id",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the roastery',
    example: 'Square Mile',
  })
  roastery: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the bean/blend',
    example: 'Red Brick',
  })
  bean: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The user's id the beans belong to",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  userId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The altitude of the coffee farm in meters',
    example: '1000',
  })
  altitudeInMeters: string;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'The date this bean was roasted',
    example: '01.04.2025',
  })
  roastDate: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'process',
    example: 'Washed',
  })
  process: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Genetic',
    example: 'Arabica',
  })
  genetic: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Variety',
    example: 'Maragogype',
  })
  variety: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Customfields',
    example: [{ key: 'frozen', value: 'yes' }],
  })
  customFields: CustomField[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The origin country of the coffee',
    example: 'Kenya',
  })
  origin: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if a bag of coffee is empty or not',
    example: 'true',
  })
  full: boolean;
}

export class EditBeanDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The name of the roastery',
    example: 'Square Mile',
    required: false,
  })
  roastery?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The name of the bean/blend',
    example: 'Red Brick',
    required: false,
  })
  bean?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The altitude of the coffee farm in meters',
    example: '1000',
    required: false,
  })
  altitudeInMeters?: string;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'The date this bean was roasted',
    example: '01.04.2025',
    required: false,
  })
  roastDate?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'process',
    example: 'Washed',
    required: false,
  })
  process?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Genetic',
    example: 'Arabica',
    required: false,
  })
  genetic?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Variety',
    example: 'Maragogype',
    required: false,
  })
  variety?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Customfields',
    example: [{ key: 'frozen', value: 'yes' }],
    required: false,
  })
  customFields?: CustomField[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The origin country of the coffee',
    example: 'Kenya',
    required: false,
  })
  origin?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Indicates if a bag of coffee is empty or not',
    example: 'true',
    required: false,
  })
  full?: boolean;
}

export class DeleteBeanDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: "The bean's id",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;
}
