import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsBoolean, IsObject, Min, IsOptional, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsObject()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9],
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9],
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2],
      },
    },
    additionalProperties: false,
    nullable: true,
  })
  graphData: any;

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

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
  })
  machineId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
  })
  grinderId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
  })
  beansId: string;

  @IsObject()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9],
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9],
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2],
      },
    },
    additionalProperties: false,
  })
  graphData: any;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity',
  })
  group: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean',
  })
  starred: boolean;
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

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
  })
  machineId?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
  })
  grinderId?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
  })
  beansId?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9],
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9],
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2],
      },
    },
    additionalProperties: false,
  })
  graphData?: any;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity',
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
