import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GrindersService } from './grinders.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ReadGrinderDto,
  CreateGrinderDto,
  EditGrinderDto,
} from 'src/dto/grinder.dto';

@Controller('grinders')
export class GrindersController {
  constructor(private grindersService: GrindersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a Grinder' })
  @ApiResponse({
    status: 200,
    description: 'Grinder Successfully Read',
    type: ReadGrinderDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async get(@Param('id') id: string): Promise<ReadGrinderDto> {
    return this.grindersService.getOne(id);
  }

  @Get('/many/:id')
  @ApiOperation({ summary: 'Get many Grinders' })
  @ApiResponse({
    status: 200,
    description: 'Grinders Successfully Read',
    type: [ReadGrinderDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAll(@Param('id') userId: string): Promise<ReadGrinderDto[]> {
    return await this.grindersService.getMany(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create One Grinder' })
  @ApiBody({ type: CreateGrinderDto })
  @ApiResponse({
    status: 200,
    description: 'Grinder Successfully Created',
    type: [ReadGrinderDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createGrinderDto: CreateGrinderDto,
  ): Promise<ReadGrinderDto> {
    return await this.grindersService.create(createGrinderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete One Grinder' })
  @ApiResponse({
    status: 200,
    description: 'grinder Successfully Deleted',
    type: ReadGrinderDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param('id') id: string): Promise<ReadGrinderDto> {
    return await this.grindersService.delete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit One Grinder' })
  @ApiResponse({
    status: 200,
    description: 'Grinder Successfully edited',
    type: ReadGrinderDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async edit(
    @Param('id') id: string,
    @Body() editGrinderDto: EditGrinderDto,
  ): Promise<ReadGrinderDto> {
    console.log(id);
    return this.grindersService.edit(editGrinderDto, id);
  }
}
