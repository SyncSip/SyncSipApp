jest.mock('src/data/entities/machine.entity/machine.entity', () => ({
  Machine: class Machine {
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
    machineId: string;
  },
}));

jest.mock('src/dto/machine.dto', () => ({
  CreateMachineDto: class CreateMachineDto {
    brandName: string;
    model: string;
    userId: string;
  },
  EditMachineDto: class EditMachineDto {
    brandName?: string;
    model?: string;
  },
  ReadMachineDto: class ReadMachineDto {
    id: string;
    brandName: string;
    model: string;
    userId: string;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { MachinesService } from './machines.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Machine } from 'src/data/entities/machine.entity/machine.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateMachineDto, EditMachineDto, ReadMachineDto } from 'src/dto/machine.dto';

describe('MachinesService', () => {
  let service: MachinesService;
  let machineRepository: Repository<Machine>;
  let shotRepository: Repository<Shot>;

  const mockMachineRepository = {
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
        MachinesService,
        {
          provide: getRepositoryToken(Machine),
          useValue: mockMachineRepository,
        },
        {
          provide: getRepositoryToken(Shot),
          useValue: mockShotRepository,
        },
      ],
    }).compile();

    service = module.get<MachinesService>(MachinesService);
    machineRepository = module.get<Repository<Machine>>(getRepositoryToken(Machine));
    shotRepository = module.get<Repository<Shot>>(getRepositoryToken(Shot));
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a machine by id', async () => {
      const machineId = 'test-uuid';
      const mockMachine = {
        id: machineId,
        brandName: 'Test Brand',
        model: 'Test Model',
        userId: 'user-id',
      };
      
      mockMachineRepository.findOneBy.mockResolvedValue(mockMachine);

      const result = await service.getOne(machineId);

      expect(result).toEqual(mockMachine);
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
    });

    it('should return null if machine not found', async () => {
      const machineId = 'non-existent-uuid';
      mockMachineRepository.findOneBy.mockResolvedValue(null);

      const result = await service.getOne(machineId);

      expect(result).toBeNull();
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
    });
  });

  describe('getAll', () => {
    it('should return all machines for a user', async () => {
      const userId = 'user-uuid';
      const mockMachines = [
        {
          id: 'machine-1',
          brandName: 'Brand 1',
          model: 'Model 1',
          userId,
        },
        {
          id: 'machine-2',
          brandName: 'Brand 2',
          model: 'Model 2',
          userId,
        },
      ];
      
      mockMachineRepository.findBy.mockResolvedValue(mockMachines);

      const result = await service.getAll(userId);

      expect(result).toEqual(mockMachines);
      expect(mockMachineRepository.findBy).toHaveBeenCalledWith({ userId });
    });

    it('should propagate errors', async () => {
      const userId = 'user-uuid';
      const error = new Error('Database error');
      mockMachineRepository.findBy.mockRejectedValue(error);

      await expect(service.getAll(userId)).rejects.toThrow(error);
      expect(mockMachineRepository.findBy).toHaveBeenCalledWith({ userId });
    });
  });

  describe('create', () => {
    it('should create a new machine', async () => {
      const createMachineDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const createdMachine = {
        id: 'new-machine-uuid',
        ...createMachineDto,
      };
      
      mockMachineRepository.create.mockReturnValue(createdMachine);
      mockMachineRepository.save.mockResolvedValue(createdMachine);

      const result = await service.create(createMachineDto as CreateMachineDto);

      expect(result).toEqual(createdMachine);
      expect(mockMachineRepository.create).toHaveBeenCalledWith(createMachineDto);
      expect(mockMachineRepository.save).toHaveBeenCalledWith(createdMachine);
    });

    it('should propagate errors', async () => {
      const createMachineDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const error = new Error('Database error');
      mockMachineRepository.create.mockReturnValue({});
      mockMachineRepository.save.mockRejectedValue(error);

      await expect(service.create(createMachineDto as CreateMachineDto)).rejects.toThrow(error);
      expect(mockMachineRepository.create).toHaveBeenCalledWith(createMachineDto);
    });
  });

  describe('delete', () => {
    it('should delete a machine and update related shots', async () => {
      const machineId = 'machine-uuid';
      const existingMachine = {
        id: machineId,
        brandName: 'Test Brand',
        model: 'Test Model',
        userId: 'user-uuid',
      };
      
      mockMachineRepository.findOneBy.mockResolvedValue(existingMachine);
      mockShotRepository.update.mockResolvedValue({ affected: 2 });
      mockMachineRepository.remove.mockResolvedValue(existingMachine);

      const result = await service.delete(machineId);

      expect(result).toEqual(existingMachine);
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
      expect(mockShotRepository.update).toHaveBeenCalledWith(
        { machineId },
        { machineId: null }
      );
      expect(mockMachineRepository.remove).toHaveBeenCalledWith(existingMachine);
    });

    it('should throw NotFoundException if machine not found', async () => {
      const machineId = 'non-existent-uuid';
      mockMachineRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(machineId)).rejects.toThrow(NotFoundException);
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
      expect(mockShotRepository.update).not.toHaveBeenCalled();
      expect(mockMachineRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should update a machine', async () => {
      const machineId = 'machine-uuid';
      const editMachineDto = {
        brandName: 'Updated Brand',
        model: 'Updated Model',
      };
      
      const existingMachine = {
        id: machineId,
        brandName: 'Old Brand',
        model: 'Old Model',
        userId: 'user-uuid',
      };
      
      const updatedMachine = {
        ...existingMachine,
        ...editMachineDto,
      };
      
      mockMachineRepository.findOneBy.mockResolvedValue(existingMachine);
      mockMachineRepository.merge.mockReturnValue(updatedMachine);
      mockMachineRepository.save.mockResolvedValue(updatedMachine);

      const result = await service.edit(editMachineDto as EditMachineDto, machineId);

      expect(result).toEqual(updatedMachine);
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
      expect(mockMachineRepository.merge).toHaveBeenCalledWith(existingMachine, editMachineDto);
      expect(mockMachineRepository.save).toHaveBeenCalledWith(updatedMachine);
    });

    it('should throw NotFoundException if machine not found', async () => {
      const machineId = 'non-existent-uuid';
      const editMachineDto = {
        brandName: 'Updated Brand',
      };
      
      mockMachineRepository.findOneBy.mockResolvedValue(null);

      await expect(service.edit(editMachineDto as EditMachineDto, machineId)).rejects.toThrow(NotFoundException);
      expect(mockMachineRepository.findOneBy).toHaveBeenCalledWith({ id: machineId });
      expect(mockMachineRepository.merge).not.toHaveBeenCalled();
      expect(mockMachineRepository.save).not.toHaveBeenCalled();
    });
  });
});
