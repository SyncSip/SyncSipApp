import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bean } from 'src/data/entities/beans.entity/beans.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateBeanDto, EditBeanDto, ReadBeanDto } from 'src/dto/bean.dto';
import { Repository } from 'typeorm';

@Injectable()
export class BeansService {
    constructor(
        @InjectRepository(Bean)
        private beanRepository: Repository<Bean>,
        @InjectRepository(Shot)
        private shotRepository: Repository<Shot>
    ){}

    async getOne(id: string): Promise<ReadBeanDto>{
        const bean = await this.beanRepository.findOneBy({id: id})
        return bean
    }

    async getMany(userId: string): Promise<ReadBeanDto[]>{
        try {
            const beans = await this.beanRepository.find({where: {userId: userId}, order: {
                full: "DESC"
            }})

            console.log("ahhh: ", beans)
            return beans
            
        } catch (error) {
            throw error
        }
    }

    async create(createBeanDto: CreateBeanDto): Promise<ReadBeanDto>{
        try {
            const newbean = this.beanRepository.create(createBeanDto)
            await this.beanRepository.save(newbean)
            return newbean
        } catch (error) {
            throw error
        }
    }

    async delete(id:string): Promise<ReadBeanDto>{
        const bean = await this.beanRepository.findOneBy({id:id})
        if(!bean){
            throw new NotFoundException()
        }
        const update = await this.shotRepository.update(
            { beansId: id },
            { beansId: null }
        );

        await this.beanRepository.remove(bean)
        return bean
    }

    async edit(editBeanDto: EditBeanDto, id:string): Promise<ReadBeanDto>{
        const bean = await this.beanRepository.findOneBy({id:id})
        if (!bean) {
            throw new NotFoundException();
        }
        const updatedbean = this.beanRepository.merge(bean, editBeanDto)
        await this.beanRepository.save(updatedbean)

        return updatedbean
    }

}
