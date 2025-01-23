import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ShotsService } from './shots.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateShotDto, EditShotDto, ReadShotDto } from 'src/dto/shots.dto';

@ApiTags('shots')
@Controller('shots')
export class ShotsController {
  constructor(private readonly ShotsService: ShotsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a Shot' })
  @ApiResponse({
    status: 200,
    description: 'Shot Successfully Read',
    type: ReadShotDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async get(@Param('id') id: string): Promise<ReadShotDto> {
    return await this.ShotsService.get(id);
  }

  @Get('many/:userId')
  @ApiOperation({ summary: 'Get all Shots' })
  @ApiResponse({
    status: 200,
    description: 'Shots Successfully Read',
    type: [ReadShotDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAll(@Param('userId') userId: string): Promise<ReadShotDto[]> {
    const shots = await this.ShotsService.getAll(userId);
    return shots;
}

  @Post('/one')
  @ApiOperation({ summary: 'create one Shot' })
  @ApiBody({ type: CreateShotDto })
  @ApiResponse({
    status: 201,
    description: 'Shot Successfully Created',
    type: ReadShotDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() createShotDto: CreateShotDto) {
    console.log(createShotDto)
    return await this.ShotsService.create(createShotDto);
  }

  @Patch('one/:id')
  @ApiOperation({ summary: 'Edit one shot' })
  @ApiBody({ type: EditShotDto })
  @ApiResponse({
    status: 201,
    description: 'Shot Successfully edited',
    type: ReadShotDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async edit(@Body() editShotDto: EditShotDto, @Param("id") id:string) {
    return await this.ShotsService.edit(editShotDto, id);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete One Shot'})
  @ApiResponse({
    status: 201,
    description: 'Shot Successfully Deleted',
    type: ReadShotDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param("id") id:string): Promise<ReadShotDto>{
    return await this.ShotsService.delete(id)
  }
}
