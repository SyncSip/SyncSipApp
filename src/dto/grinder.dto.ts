import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateGrinderDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's brand name",
        example: 'Niche',
    })
    brandName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's model",
        example: 'Zero',
    })
    model: string;

    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The user's id the grinder belongs to",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    userId: string;
}

export class ReadGrinderDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's id",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's brand name",
        example: 'Niche',
    })
    brandName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's model",
        example: 'Zero',
    })
    model: string;

    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The user's id the grinder belongs to",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    userId: string;
}

export class EditGrinderDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: "The grinder's brand name",
        example: 'Niche',
        required: false
    })
    brandName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: "The grinder's model",
        example: 'Zero',
        required: false
    })
    model?: string;
}

export class DeleteGrinderDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The grinder's id",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    id: string;
}
