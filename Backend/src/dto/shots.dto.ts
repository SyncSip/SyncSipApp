import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomField } from 'src/data/entities/shot.entity/shot.entity';

export class ReadMachineDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The unique identifier of the machine',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The brand name of the machine',
    example: 'Lelit',
  })
  brandName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The model of the machine',
    example: 'Bianca',
  })
  model: string;
}

export class ReadGrinderDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The unique identifier of the grinder',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The brand name of the grinder',
    example: 'Niche',
  })
  brandName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The model of the grinder',
    example: 'Zero',
  })
  model: string;
}

export class ReadBeanDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The unique identifier of the beans',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The roastery name',
    example: 'Square Mile',
  })
  roastery: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The bean name/type',
    example: 'Red Brick',
  })
  bean: string;
}

export class ReadShotDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The unique identifier of the shot',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  userId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number',
  })
  time: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number',
  })
  weight: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number',
  })
  dose: number;

  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
    nullable: true,
  })
  machineId: string;

  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
    nullable: true,
  })
  grinderId: string;

  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
    nullable: true,
  })
  beansId: string;

  @ValidateNested()
  @Type(() => ReadMachineDto)
  @ApiProperty({
    description: 'The machine used for the shot',
    type: () => ReadMachineDto,
    nullable: true,
  })
  machine: ReadMachineDto;

  @ValidateNested()
  @Type(() => ReadGrinderDto)
  @ApiProperty({
    description: 'The grinder used for the shot',
    type: () => ReadGrinderDto,
    nullable: true,
  })
  grinder: ReadGrinderDto;

  @ValidateNested()
  @Type(() => ReadBeanDto)
  @ApiProperty({
    description: 'The beans used for the shot',
    type: () => ReadBeanDto,
    nullable: true,
  })
  beans: ReadBeanDto;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        pressure: { type: 'number', example: 9.0 },
        flow: { type: 'number', example: 2.0 },
        temperature: { type: 'number', example: 93.5 },
      },
    },
    example: [
      { pressure: 9.0, flow: 2.0, temperature: 93.5 },
      { pressure: 9.1, flow: 2.1, temperature: 93.4 },
      { pressure: 9.0, flow: 2.0, temperature: 93.3 },
      { pressure: 8.9, flow: 1.9, temperature: 93.2 },
    ],
    nullable: true,
  })
  graphData?: any;

  @IsString()
  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity',
    nullable: true,
  })
  group: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean',
  })
  starred: boolean;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Timestamp of when the shot was created',
    example: new Date(),
  })
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Timestamp of when the shot was last updated',
    example: new Date(),
  })
  updatedAt: Date;

  @IsArray()
  @ApiProperty({
    description: 'Custom Fields for other infos for the user',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example: 'Top-Note',
        },
        value: {
          type: 'string',
          example: 'floral',
        },
      },
    },
    example: [
      { key: 'Top-Note', value: 'floral' },
      { key: 'Heart-Note', value: 'fruity' },
      { key: 'Bottom-Note', value: 'tangy' },
    ],
    nullable: true,
  })
  customFields: CustomField[];
}

export class CreateShotDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  userId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number',
  })
  time: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number',
  })
  weight: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number',
  })
  dose: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
    nullable: true,
  })
  machineId: string | null;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
    nullable: true,
  })
  grinderId: string | null;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
    nullable: true,
  })
  beansId: string | null;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        pressure: { type: 'number', example: 9.0 },
        flow: { type: 'number', example: 2.0 },
        temperature: { type: 'number', example: 93.5 },
      },
    },
    example: [
      { pressure: 9.0, flow: 2.0, temperature: 93.5 },
      { pressure: 9.1, flow: 2.1, temperature: 93.4 },
      { pressure: 9.0, flow: 2.0, temperature: 93.3 },
      { pressure: 8.9, flow: 1.9, temperature: 93.2 },
    ],
    nullable: true,
  })
  graphData?: any;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity',
    nullable: true,
  })
  group: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean',
  })
  starred: boolean;

  @IsArray()
  @ApiProperty({
    description: 'Custom Fields for other infos for the user',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example: 'Top-Note',
        },
        value: {
          type: 'string',
          example: 'floral',
        },
      },
    },
    example: [
      { key: 'Top-Note', value: 'floral' },
      { key: 'Heart-Note', value: 'fruity' },
      { key: 'Bottom-Note', value: 'tangy' },
    ],
    nullable: true,
  })
  customFields: CustomField[];
}

export class EditShotDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  userId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number',
  })
  time?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number',
  })
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number',
  })
  dose?: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
    nullable: true,
  })
  machineId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
    nullable: true,
  })
  grinderId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
    nullable: true,
  })
  beansId?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        pressure: { type: 'number', example: 9.0 },
        flow: { type: 'number', example: 2.0 },
        temperature: { type: 'number', example: 93.5 },
      },
    },
    example: [
      { pressure: 9.0, flow: 2.0, temperature: 93.5 },
      { pressure: 9.1, flow: 2.1, temperature: 93.4 },
      { pressure: 9.0, flow: 2.0, temperature: 93.3 },
      { pressure: 8.9, flow: 1.9, temperature: 93.2 },
    ],
    nullable: true,
  })
  graphData?: any;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity',
    nullable: true,
  })
  group?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean',
  })
  starred?: boolean;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'Custom Fields for other infos for the user',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example: 'Top-Note',
        },
        value: {
          type: 'string',
          example: 'floral',
        },
      },
    },
    example: [
      { key: 'Top-Note', value: 'floral' },
      { key: 'Heart-Note', value: 'fruity' },
      { key: 'Bottom-Note', value: 'tangy' },
    ],
    nullable: true,
  })
  customFields: CustomField[];
}

export class DeleteShotDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Identifier of the shot',
    example: '23ou32uwrqoi8ur423',
    format: 'uuid',
  })
  id: string;
}
