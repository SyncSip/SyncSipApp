import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseService } from 'src/data/database.service';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateShotDto, EditShotDto, ReadShotDto } from 'src/dto/shots.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ShotsService {
  constructor(
    @InjectRepository(Shot)
    private shotRepository: Repository<Shot>,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  async get(id: string): Promise<ReadShotDto> {
    try {
      const shot = await this.shotRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
      if (!shot) {
        throw new NotFoundException();
      }
      return shot;
    } catch (error) {
      throw error;
    }
  }

  async getAll(userId: string): Promise<ReadShotDto[]> {
    try {
      console.log('Fetching shots for userId:', userId);
      const shots = await this.shotRepository.find({
        where: {
          userId: userId,
        },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
      if (!shots) {
        return [];
      }
      return shots;
    } catch (error) {
      console.error('Error fetching shots:', error);
      throw new InternalServerErrorException('Error fetching shots');
    }
  }

  async create(createShotDto: CreateShotDto): Promise<ReadShotDto> {
    try {
      const shot = this.shotRepository.create(createShotDto);
      await this.shotRepository.save(shot);
      return shot;
    } catch (error) {
      console.error('Error creating shot: ', error);
      throw new InternalServerErrorException();
    }
  }

  async edit(editShotDto: EditShotDto, id: string): Promise<ReadShotDto> {
    const shot = await this.shotRepository.findOneBy({ id: id });
    if (!shot) {
      throw new NotFoundException('Shot not found');
    }
    await this.shotRepository.update(id, editShotDto);
    const newShot = await this.shotRepository.findOneBy({ id: id });
    return newShot;
  }

  async delete(id: string): Promise<ReadShotDto> {
    const shot = await this.shotRepository.findOneBy({ id: id });
    if (!shot) {
      throw new NotFoundException();
    }
    await this.shotRepository.remove(shot);
    return shot;
  }
}
