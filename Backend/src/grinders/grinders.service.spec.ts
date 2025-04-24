jest.mock('src/data/entities/grinder.entity/grinder.entity', () => ({
  Grinder: class Grinder {
    id: string;
    brandName: string;
    model: string;
    userId: string;
    user: any;
    shots: any[];
  },
}));

jest.mock('src/data/entities/shot.entity/shot.entity', () => ({
  Shot: class Shot {
    id: string;
    userId: string;
    grinderId: string;
  },
}));

jest.mock('src/dto/grinder.dto', () => ({
  CreateGrinderDto: class CreateGrinderDto {
    brandName: string;
    model: string;
    userId: string;
  },
  EditGrinderDto: class EditGrinderDto {
    brandName?: string;
    model?: string;
  },
  ReadGrinderDto: class ReadGrinderDto {
    id: string;
    brandName: string;
    model: string;
    userId: string;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { GrindersService } from './grinders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Grinder } from 'src/data/entities/grinder.entity/grinder.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateGrinderDto, EditGrinderDto, ReadGrinderDto } from 'src/dto/grinder.dto';

describe('GrindersService', () => {
  let service: GrindersService;
  let grinderRepository: Repository<Grinder>;
  let shotRepository: Repository<Shot>;

  const mockGrinderRepository = {
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  const mockShotRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrindersService,
        {
          provide: getRepositoryToken(Grinder),
          useValue: mockGrinderRepository,
        },
        {
          provide: getRepositoryToken(Shot),
          useValue: mockShotRepository,
        },
      ],
    }).compile();

    service = module.get<GrindersService>(GrindersService);
    grinderRepository = module.get<Repository<Grinder>>(getRepositoryToken(Grinder));
    shotRepository = module.get<Repository<Shot>>(getRepositoryToken(Shot));
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a grinder by id', async () => {
      const grinderId = 'test-uuid';
      const mockGrinder = {
        id: grinderId,
        brandName: 'Test Brand',
        model: 'Test Model',
        userId: 'user-id',
      };
      
      mockGrinderRepository.findOneBy.mockResolvedValue(mockGrinder);

      const result = await service.getOne(grinderId);

      expect(result).toEqual(mockGrinder);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
    });

    it('should throw NotFoundException if grinder not found', async () => {
      const grinderId = 'non-existent-uuid';
      mockGrinderRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getOne(grinderId)).rejects.toThrow(NotFoundException);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
    });

    it('should propagate errors', async () => {
      const grinderId = 'test-uuid';
      const error = new Error('Database error');
      mockGrinderRepository.findOneBy.mockRejectedValue(error);

      await expect(service.getOne(grinderId)).rejects.toThrow(error);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
    });
  });

  describe('getMany', () => {
    it('should return all grinders for a user', async () => {
      const userId = 'user-uuid';
      const mockGrinders = [
        {
          id: 'grinder-1',
          brandName: 'Brand 1',
          model: 'Model 1',
          userId,
        },
        {
          id: 'grinder-2',
          brandName: 'Brand 2',
          model: 'Model 2',
          userId,
        },
      ];
      
      mockGrinderRepository.findBy.mockResolvedValue(mockGrinders);

      const result = await service.getMany(userId);

      expect(result).toEqual(mockGrinders);
      expect(mockGrinderRepository.findBy).toHaveBeenCalledWith({ userId });
    });

    it('should throw NotFoundException if no grinders found', async () => {
      const userId = 'user-uuid';
      mockGrinderRepository.findBy.mockResolvedValue(null);

      await expect(service.getMany(userId)).rejects.toThrow(NotFoundException);
      expect(mockGrinderRepository.findBy).toHaveBeenCalledWith({ userId });
    });

    it('should propagate errors', async () => {
      const userId = 'user-uuid';
      const error = new Error('Database error');
      mockGrinderRepository.findBy.mockRejectedValue(error);

      await expect(service.getMany(userId)).rejects.toThrow(error);
      expect(mockGrinderRepository.findBy).toHaveBeenCalledWith({ userId });
    });
  });

  describe('create', () => {
    it('should create a new grinder', async () => {
      const createGrinderDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const createdGrinder = {
        id: 'new-grinder-uuid',
        ...createGrinderDto,
      };
      
      mockGrinderRepository.create.mockReturnValue(createdGrinder);
      mockGrinderRepository.save.mockResolvedValue(createdGrinder);

      const result = await service.create(createGrinderDto as CreateGrinderDto);

      expect(result).toEqual(createdGrinder);
      expect(mockGrinderRepository.create).toHaveBeenCalledWith(createGrinderDto);
      expect(mockGrinderRepository.save).toHaveBeenCalledWith(createdGrinder);
    });

    it('should propagate errors', async () => {
      const createGrinderDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const error = new Error('Database error');
      mockGrinderRepository.create.mockReturnValue({});
      mockGrinderRepository.save.mockRejectedValue(error);

      await expect(service.create(createGrinderDto as CreateGrinderDto)).rejects.toThrow(error);
      expect(mockGrinderRepository.create).toHaveBeenCalledWith(createGrinderDto);
    });
  });

  describe('delete', () => {
    it('should delete a grinder and update related shots', async () => {
      const grinderId = 'grinder-uuid';
      const existingGrinder = {
        id: grinderId,
        brandName: 'Test Brand',
        model: 'Test Model',
        userId: 'user-uuid',
      };
      
      mockGrinderRepository.findOneBy.mockResolvedValue(existingGrinder);
      mockShotRepository.update.mockResolvedValue({ affected: 2 });
      mockGrinderRepository.remove.mockResolvedValue(existingGrinder);

      const result = await service.delete(grinderId);

      expect(result).toEqual(existingGrinder);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
      expect(mockShotRepository.update).toHaveBeenCalledWith(
        { grinderId },
        { grinderId: null }
      );
      expect(mockGrinderRepository.remove).toHaveBeenCalledWith(existingGrinder);
    });

    it('should propagate errors', async () => {
      const grinderId = 'grinder-uuid';
      const error = new Error('Database error');
      mockGrinderRepository.findOneBy.mockRejectedValue(error);

      await expect(service.delete(grinderId)).rejects.toThrow(error);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
    });
  });

  describe('edit', () => {
    it('should update a grinder', async () => {
      const grinderId = 'grinder-uuid';
      const editGrinderDto = {
        brandName: 'Updated Brand',
        model: 'Updated Model',
      };
      
      const existingGrinder = {
        id: grinderId,
        brandName: 'Old Brand',
        model: 'Old Model',
        userId: 'user-uuid',
      };
      
      const updatedGrinder = {
        ...existingGrinder,
        ...editGrinderDto,
      };
      
      mockGrinderRepository.findOneBy.mockResolvedValue(existingGrinder);
      mockGrinderRepository.merge.mockReturnValue(updatedGrinder);
      mockGrinderRepository.save.mockResolvedValue(updatedGrinder);

      const result = await service.edit(editGrinderDto as EditGrinderDto, grinderId);

      expect(result).toEqual(updatedGrinder);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
      expect(mockGrinderRepository.merge).toHaveBeenCalledWith(existingGrinder, editGrinderDto);
      expect(mockGrinderRepository.save).toHaveBeenCalledWith(updatedGrinder);
    });

    it('should throw NotFoundException if grinder not found', async () => {
      const grinderId = 'non-existent-uuid';
      const editGrinderDto = {
        brandName: 'Updated Brand',
      };
      
      mockGrinderRepository.findOneBy.mockResolvedValue(null);

      await expect(service.edit(editGrinderDto as EditGrinderDto, grinderId)).rejects.toThrow(NotFoundException);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
      expect(mockGrinderRepository.merge).not.toHaveBeenCalled();
      expect(mockGrinderRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate errors', async () => {
      const grinderId = 'grinder-uuid';
      const editGrinderDto = {
        brandName: 'Updated Brand',
      };
      const error = new Error('Database error');
      
      mockGrinderRepository.findOneBy.mockResolvedValue({});
      mockGrinderRepository.merge.mockReturnValue({});
      mockGrinderRepository.save.mockRejectedValue(error);

      await expect(service.edit(editGrinderDto as EditGrinderDto, grinderId)).rejects.toThrow(error);
      expect(mockGrinderRepository.findOneBy).toHaveBeenCalledWith({ id: grinderId });
    });
  });
});
