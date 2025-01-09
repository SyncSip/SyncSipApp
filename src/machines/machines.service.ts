import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Machine } from 'src/data/entities/machine.entity/machine.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateMachineDto, EditMachineDto, ReadMachineDto } from 'src/dto/machine.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MachinesService {
    constructor(
        @InjectRepository(Machine)
        private machineRepository: Repository<Machine>,
        @InjectRepository(Shot)
        private shotRepository: Repository<Shot>
    ){}

    async getOne(id: string): Promise<ReadMachineDto>{
        const machine = await this.machineRepository.findOneBy({id: id})
        return machine
    }

    async getAll(userId: string): Promise<ReadMachineDto[]>{
        try {
            const machines = await this.machineRepository.findBy({userId: userId})
            console.log(machines)
            return machines
            
        } catch (error) {
            throw error
        }
    }

    async create(createMachineDto: CreateMachineDto): Promise<ReadMachineDto>{
        try {
            const newMachine = this.machineRepository.create(createMachineDto)
            await this.machineRepository.save(newMachine)
            return newMachine
        } catch (error) {
            throw error
        }
    }

    async delete(id:string): Promise<ReadMachineDto>{
        const machine = await this.machineRepository.findOneBy({id:id})
        if(!machine){
            throw new NotFoundException()
        }
        const update = await this.shotRepository.update(
            { machineId: id },
            { machineId: null }
        );

        await this.machineRepository.remove(machine)
        return machine
    }

    async edit(editMachineDto: EditMachineDto, id:string): Promise<ReadMachineDto>{
        const machine = await this.machineRepository.findOneBy({id:id})
        if (!machine) {
            throw new NotFoundException();
        }
        const updatedMachine = this.machineRepository.merge(machine, editMachineDto)
        await this.machineRepository.save(updatedMachine)

        return updatedMachine
    }



}
