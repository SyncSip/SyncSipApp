import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BeansService } from './beans.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReadGrinderDto, CreateGrinderDto, EditGrinderDto } from 'src/dto/grinder.dto';
import { CreateBeanDto, EditBeanDto, ReadBeanDto } from 'src/dto/bean.dto';

@Controller('beans')
export class BeansController {
    constructor(
        private beansService: BeansService
    ){}

    @Get(":id")
    @ApiOperation({summary: "Get a bean"})
    @ApiResponse({
        status: 200,
        description: 'Bean Successfully Read',
        type: ReadBeanDto,
      })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
      async get(@Param("id") id: string): Promise<ReadBeanDto>{
        return this.beansService.getOne(id)
      }

    @Get("/many/:id")
    @ApiOperation({summary: "Get many Beans"})
    @ApiResponse({
        status: 200,
        description: 'Beans Successfully Read',
        type: [ReadBeanDto],
      })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
      async getAll(@Param("id") userId: string): Promise<ReadBeanDto[]>{
        return await this.beansService.getMany(userId)
      }

    @Post()
    @ApiOperation({summary: "Create One Bean"})
    @ApiBody({type: CreateBeanDto})
    @ApiResponse({
        status: 200,
        description: 'Bean Successfully Created',
        type: [ReadBeanDto],
      })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async create(@Body() createBeanDto: CreateBeanDto): Promise<CreateBeanDto>{
        return await this.beansService.create(createBeanDto)
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete One bean"})
    @ApiResponse({
        status: 200,
        description: 'bean Successfully Deleted',
        type: ReadBeanDto,
      })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async delete(@Param("id") id :string):Promise<ReadBeanDto>{
        return await this.beansService.delete(id)
    }

    @Patch(":id")
    @ApiOperation({summary: "Edit One Bean"})
    @ApiResponse({
        status: 200,
        description: 'Bean Successfully edited',
        type: ReadBeanDto,
      })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async edit(@Param("id") id:string, @Body() editBeanDto: EditBeanDto): Promise<ReadBeanDto>{
        return this.beansService.edit(editBeanDto, id)
    }
}
