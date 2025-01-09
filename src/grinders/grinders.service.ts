import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grinder } from 'src/data/entities/grinder.entity/grinder.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateGrinderDto, EditGrinderDto, ReadGrinderDto } from 'src/dto/grinder.dto';
import { Repository } from 'typeorm';

@Injectable()
export class GrindersService {
    constructor(
        @InjectRepository(Grinder) 
        private grinderRepository: Repository<Grinder>,
        @InjectRepository(Shot)
        private shotsRepository: Repository<Shot>
    ){}

    async getOne(id:string): Promise<ReadGrinderDto>{
        try {
            const grinder = await this.grinderRepository.findOneBy({id:id})
            if(!grinder){
                throw new NotFoundException()
            }
            return grinder
        } catch (error) {
            throw error
        }
    }

    async getMany(userId: string): Promise<ReadGrinderDto[]>{
        try {
            const grinders = await this.grinderRepository.findBy({userId: userId})
            if(!grinders){
                throw new NotFoundException()
            }
            return grinders
        } catch (error) {
            throw error
        }
    }

    async create(createGrinderDto: CreateGrinderDto): Promise<ReadGrinderDto>{
        try {
            const newGrinder = this.grinderRepository.create(createGrinderDto)
            await this.grinderRepository.save(newGrinder)
            return newGrinder
        } catch (error) {
            throw error
        }
    }

    async delete(id:string): Promise<ReadGrinderDto>{
        try {
            const grinder = await this.grinderRepository.findOneBy({id:id})
            await this.shotsRepository.update({grinderId: id}, {grinderId: null})
            await this.grinderRepository.remove(grinder)
            return grinder
        } catch (error) {
            throw error
        }
    }

    async edit(editGrinderDto: EditGrinderDto, id:string): Promise<ReadGrinderDto>{
        try {
            const grinder = await this.grinderRepository.findOneBy({id: id})
            if(!grinder){
                throw new NotFoundException()
            }
            const newGrinder = this.grinderRepository.merge(grinder, editGrinderDto)
            await this.grinderRepository.save(newGrinder)
            return newGrinder
        } catch (error) {
            throw error
        }
    }
}
