import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateBeanDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The name of the roastery",
        example: 'Square Mile',
    })
    roastery: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The name of the bean/blend",
        example: 'Red Brick',
    })
    bean: string;

    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The user's id the beans belong to",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    userId: string;
}

export class ReadBeanDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The bean's id",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The name of the roastery",
        example: 'Square Mile',
    })
    roastery: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: "The name of the bean/blend",
        example: 'Red Brick',
    })
    bean: string;

    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The user's id the beans belong to",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    userId: string;
}

export class EditBeanDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: "The name of the roastery",
        example: 'Square Mile',
        required: false
    })
    roastery?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: "The name of the bean/blend",
        example: 'Red Brick',
        required: false
    })
    bean?: string;
}

export class DeleteBeanDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({
        description: "The bean's id",
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    id: string;
}
