import { ApiProperty } from '@nestjs/swagger';

export class ReadShotDto {
  @ApiProperty({
    description: 'The unique identifier of the shot',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid'
  })
  userId: string;

  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number'
  })
  time: number;

  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number'
  })
  weight: number;

  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number'
  })
  dose: number;

  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid'
  })
  machineId: string;

  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid'
  })
  grinderId: string;

  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid'
  })
  beansId: string;

  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9]
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9]
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2]
      }
    },
    additionalProperties: false
  })
  graphData: Record<string, any>;

  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity'
  })
  group: string;

  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean'
  })
  starred: boolean;

  @ApiProperty({
    description: 'Timestamp of the time when the shot was created',
    example: new Date(),
  })
  createdAt: Date;


}

export class CreateShotDto {

  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid'
  })
  userId: string;

  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number'
  })
  time: number;

  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number'
  })
  weight: number;

  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number'
  })
  dose: number;

  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid'
  })
  machineId: string;

  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid'
  })
  grinderId: string;

  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid'
  })
  beansId: string;

  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9]
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9]
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2]
      }
    },
    additionalProperties: false
  })
  graphData: Record<string, any>;

  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity'
  })
  group: string;

  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean'
  })
  starred: boolean;
}

export class EditShotDto {

  @ApiProperty({
    description: 'The user who created the shot',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid'
  })
  userId: string;

  @ApiProperty({
    description: 'The shot time in seconds',
    example: 25.5,
    type: 'number'
  })
  time: number;

  @ApiProperty({
    description: 'The weight of the shot in grams',
    example: 36.5,
    type: 'number'
  })
  weight: number;

  @ApiProperty({
    description: 'The dose of coffee used in grams',
    example: 18.0,
    type: 'number'
  })
  dose: number;

  @ApiProperty({
    description: 'The identifier of the machine used',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid'
  })
  machineId: string;

  @ApiProperty({
    description: 'The identifier of the grinder used',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid'
  })
  grinderId: string;

  @ApiProperty({
    description: 'The identifier of the beans used',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid'
  })
  beansId: string;

  @ApiProperty({
    description: 'The shot graph data',
    type: 'object',
    properties: {
      pressure: {
        type: 'array',
        items: { type: 'number' },
        example: [9.0, 9.1, 9.0, 8.9]
      },
      flow: {
        type: 'array',
        items: { type: 'number' },
        example: [2.0, 2.1, 2.0, 1.9]
      },
      temperature: {
        type: 'array',
        items: { type: 'number' },
        example: [93.5, 93.4, 93.3, 93.2]
      }
    },
    additionalProperties: false
  })
  graphData: Record<string, any>;

  @ApiProperty({
    description: 'The group identifier',
    example: 'Fruity'
  })
  group: string;

  @ApiProperty({
    description: 'Whether the shot is starred/favorited',
    example: true,
    type: 'boolean'
  })
  starred: boolean;
}

export class DeleteShotDto {
    @ApiProperty({
        description: "Identifier of the shot",
        example: "23ou32uwrqoi8ur423",
        format: "uuid"
    })
    id: string
}
