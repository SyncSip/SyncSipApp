import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateMachineDto,
  EditMachineDto,
  ReadMachineDto,
} from 'src/dto/machine.dto';

@Controller('machines')
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a Machine' })
  @ApiResponse({
    status: 200,
    description: 'Machine Successfully Read',
    type: ReadMachineDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async get(@Param('id') id: string) {
    return this.machinesService.getOne(id);
  }

  @Get('/many/:id')
  @ApiOperation({ summary: 'Get many Machines' })
  @ApiResponse({
    status: 200,
    description: 'Machines Successfully Read',
    type: [ReadMachineDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAll(@Param('id') userId: string): Promise<ReadMachineDto[]> {
    console.log(userId);
    return await this.machinesService.getAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create One Machine' })
  @ApiBody({ type: CreateMachineDto })
  @ApiResponse({
    status: 200,
    description: 'Machines Successfully Created',
    type: [ReadMachineDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createMachineDto: CreateMachineDto,
  ): Promise<ReadMachineDto> {
    return await this.machinesService.create(createMachineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete One Machine' })
  @ApiResponse({
    status: 200,
    description: 'Machines Successfully Deleted',
    type: ReadMachineDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param('id') id: string): Promise<ReadMachineDto> {
    return await this.machinesService.delete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit One Machine' })
  @ApiResponse({
    status: 200,
    description: 'Machines Successfully edited',
    type: ReadMachineDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async edit(
    @Param('id') id: string,
    @Body() editMachineDto: EditMachineDto,
  ): Promise<ReadMachineDto> {
    console.log(id);
    return this.machinesService.edit(editMachineDto, id);
  }
}
