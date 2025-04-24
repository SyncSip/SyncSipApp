// src/shots/shots.service.spec.ts

// Mock modules must be at the top, before imports
jest.mock('src/data/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('src/data/entities/shot.entity/shot.entity', () => ({
  Shot: class MockShot {
    id: string;
    userId: string;
    time: number;
    weight: number;
    dose: number;
    machineId: string;
    grinderId: string;
    beansId: string;
    graphData: any;
    group: string;
    starred: boolean;
    createdAt: Date;
    updatedAt: Date;
    customFields: any[];
    user: any;
    machine: any;
    grinder: any;
    beans: any;
  },
}));

jest.mock('src/dto/shots.dto', () => ({
  CreateShotDto: class MockCreateShotDto {
    userId: string;
    time: number;
    weight: number;
    dose: number;
    machineId?: string;
    grinderId?: string;
    beansId?: string;
    graphData?: any;
    group?: string;
    starred?: boolean;
    customFields?: any[];
  },
  EditShotDto: class MockEditShotDto {
    time?: number;
    weight?: number;
    dose?: number;
    machineId?: string;
    grinderId?: string;
    beansId?: string;
    graphData?: any;
    group?: string;
    starred?: boolean;
    customFields?: any[];
  },
  ReadShotDto: class MockReadShotDto {
    id: string;
    userId: string;
    time: number;
    weight: number;
    dose: number;
    machineId?: string;
    grinderId?: string;
    beansId?: string;
    graphData?: any;
    group?: string;
    starred?: boolean;
    createdAt: Date;
    updatedAt: Date;
    customFields?: any[];
    machine?: any;
    grinder?: any;
    beans?: any;
  },
}));


import { Test, TestingModule } from '@nestjs/testing';
import { ShotsService } from './shots.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/data/database.service';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateShotDto, EditShotDto, ReadShotDto } from 'src/dto/shots.dto';

describe('ShotsService', () => {
  let service: ShotsService;
  let shotRepository: Repository<Shot>;

  const mockShotRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDatabaseService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShotsService,
        {
          provide: getRepositoryToken(Shot),
          useValue: mockShotRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ShotsService>(ShotsService);
    shotRepository = module.get<Repository<Shot>>(getRepositoryToken(Shot));
    

    jest.clearAllMocks();
    

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return a shot by id', async () => {

      const shotId = 'test-uuid';
      const mockShot = {
        id: shotId,
        userId: 'user-id',
        time: 30,
        weight: 36,
        dose: 18,
        machine: { id: 'machine-id' },
        grinder: { id: 'grinder-id' },
        beans: { id: 'beans-id' },
      };
      
      mockShotRepository.findOne.mockResolvedValue(mockShot);


      const result = await service.get(shotId);


      expect(result).toEqual(mockShot);
      expect(mockShotRepository.findOne).toHaveBeenCalledWith({
        where: { id: shotId },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
    });

    it('should throw NotFoundException if shot not found', async () => {

      const shotId = 'non-existent-uuid';
      mockShotRepository.findOne.mockResolvedValue(null);


      await expect(service.get(shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotRepository.findOne).toHaveBeenCalledWith({
        where: { id: shotId },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
    });

    it('should propagate errors', async () => {

      const shotId = 'test-uuid';
      const error = new Error('Database error');
      mockShotRepository.findOne.mockRejectedValue(error);


      await expect(service.get(shotId)).rejects.toThrow(error);
    });
  });

  describe('getAll', () => {
    it('should return all shots for a user', async () => {

      const userId = 'user-uuid';
      const mockShots = [
        {
          id: 'shot-1',
          userId,
          time: 30,
          weight: 36,
          dose: 18,
          machine: { id: 'machine-id' },
        },
        {
          id: 'shot-2',
          userId,
          time: 28,
          weight: 40,
          dose: 20,
          machine: { id: 'machine-id' },
        },
      ];
      
      mockShotRepository.find.mockResolvedValue(mockShots);


      const result = await service.getAll(userId);


      expect(result).toEqual(mockShots);
      expect(mockShotRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
    });

    it('should return empty array if no shots found', async () => {

      const userId = 'user-uuid';
      mockShotRepository.find.mockResolvedValue(null);


      const result = await service.getAll(userId);


      expect(result).toEqual([]);
      expect(mockShotRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
    });

    it('should throw InternalServerErrorException on error', async () => {

      const userId = 'user-uuid';
      mockShotRepository.find.mockRejectedValue(new Error('Database error'));


      await expect(service.getAll(userId)).rejects.toThrow(InternalServerErrorException);
      expect(mockShotRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: {
          machine: true,
          grinder: true,
          beans: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new shot', async () => {
      // Arrange
      const createShotDto = {
        userId: 'user-uuid',
        time: 30,
        weight: 36,
        dose: 18,
        machineId: 'machine-id',
      };
      
      const createdShot = {
        id: 'new-shot-uuid',
        ...createShotDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockShotRepository.create.mockReturnValue(createdShot);
      mockShotRepository.save.mockResolvedValue(createdShot);


      const result = await service.create(createShotDto as CreateShotDto);


      expect(result).toEqual(createdShot);
      expect(mockShotRepository.create).toHaveBeenCalledWith(createShotDto);
      expect(mockShotRepository.save).toHaveBeenCalledWith(createdShot);
    });

    it('should throw InternalServerErrorException on error', async () => {

      const createShotDto = {
        userId: 'user-uuid',
        time: 30,
        weight: 36,
        dose: 18,
      };
      
      mockShotRepository.create.mockReturnValue({});
      mockShotRepository.save.mockRejectedValue(new Error('Database error'));


      await expect(service.create(createShotDto as CreateShotDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockShotRepository.create).toHaveBeenCalledWith(createShotDto);
    });
  });

  describe('edit', () => {
    it('should update a shot', async () => {

      const shotId = 'shot-uuid';
      const editShotDto = {
        time: 32,
        weight: 40,
      };
      
      const existingShot = {
        id: shotId,
        userId: 'user-uuid',
        time: 30,
        weight: 36,
        dose: 18,
      };
      
      const updatedShot = {
        ...existingShot,
        time: editShotDto.time,
        weight: editShotDto.weight,
      };
      
      mockShotRepository.findOneBy.mockResolvedValueOnce(existingShot);
      mockShotRepository.update.mockResolvedValue({ affected: 1 });
      mockShotRepository.findOneBy.mockResolvedValueOnce(updatedShot);


      const result = await service.edit(editShotDto as EditShotDto, shotId);


      expect(result).toEqual(updatedShot);
      expect(mockShotRepository.findOneBy).toHaveBeenCalledWith({ id: shotId });
      expect(mockShotRepository.update).toHaveBeenCalledWith(shotId, editShotDto);
      expect(mockShotRepository.findOneBy).toHaveBeenCalledWith({ id: shotId });
    });

    it('should throw NotFoundException if shot not found', async () => {

      const shotId = 'non-existent-uuid';
      const editShotDto = {
        time: 32,
      };
      
      mockShotRepository.findOneBy.mockResolvedValue(null);


      await expect(service.edit(editShotDto as EditShotDto, shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotRepository.findOneBy).toHaveBeenCalledWith({ id: shotId });
      expect(mockShotRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a shot', async () => {

      const shotId = 'shot-uuid';
      const existingShot = {
        id: shotId,
        userId: 'user-uuid',
        time: 30,
        weight: 36,
        dose: 18,
      };
      
      mockShotRepository.findOneBy.mockResolvedValue(existingShot);
      mockShotRepository.remove.mockResolvedValue(existingShot);


      const result = await service.delete(shotId);


      expect(result).toEqual(existingShot);
      expect(mockShotRepository.findOneBy).toHaveBeenCalledWith({ id: shotId });
      expect(mockShotRepository.remove).toHaveBeenCalledWith(existingShot);
    });

    it('should throw NotFoundException if shot not found', async () => {

      const shotId = 'non-existent-uuid';
      mockShotRepository.findOneBy.mockResolvedValue(null);


      await expect(service.delete(shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotRepository.findOneBy).toHaveBeenCalledWith({ id: shotId });
      expect(mockShotRepository.remove).not.toHaveBeenCalled();
    });
  });
});
