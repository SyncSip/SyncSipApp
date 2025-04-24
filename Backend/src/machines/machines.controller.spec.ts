import { Test, TestingModule } from '@nestjs/testing';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { CreateMachineDto, EditMachineDto, ReadMachineDto } from 'src/dto/machine.dto';
import { NotFoundException } from '@nestjs/common';

describe('MachinesController', () => {
  let controller: MachinesController;
  let service: MachinesService;

  const mockMachinesService = {
    getOne: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    edit: jest.fn(),
  };

  // Create a complete mock machine that satisfies ReadMachineDto
  const createMockMachine = (id: string, userId: string, brandName = 'Test Brand', model = 'Test Model'): ReadMachineDto => ({
    id,
    brandName,
    model,
    userId
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachinesController],
      providers: [
        {
          provide: MachinesService,
          useValue: mockMachinesService,
        },
      ],
    }).compile();

    controller = module.get<MachinesController>(MachinesController);
    service = module.get<MachinesService>(MachinesService);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a machine by id', async () => {
      const machineId = 'test-uuid';
      const mockMachine = createMockMachine(machineId, 'user-id');
      
      mockMachinesService.getOne.mockResolvedValue(mockMachine);

      const result = await controller.get(machineId);

      expect(result).toEqual(mockMachine);
      expect(mockMachinesService.getOne).toHaveBeenCalledWith(machineId);
    });

    it('should return null if machine not found', async () => {
      const machineId = 'non-existent-uuid';
      
      mockMachinesService.getOne.mockResolvedValue(null);

      const result = await controller.get(machineId);

      expect(result).toBeNull();
      expect(mockMachinesService.getOne).toHaveBeenCalledWith(machineId);
    });

    it('should propagate errors from service', async () => {
      const machineId = 'test-uuid';
      const error = new Error('Service error');
      
      mockMachinesService.getOne.mockRejectedValue(error);

      await expect(controller.get(machineId)).rejects.toThrow(error);
      expect(mockMachinesService.getOne).toHaveBeenCalledWith(machineId);
    });
  });

  describe('getAll', () => {
    it('should return all machines for a user', async () => {
      const userId = 'user-uuid';
      const mockMachines: ReadMachineDto[] = [
        createMockMachine('machine-1', userId, 'Brand 1', 'Model 1'),
        createMockMachine('machine-2', userId, 'Brand 2', 'Model 2')
      ];
      
      mockMachinesService.getAll.mockResolvedValue(mockMachines);

      const result = await controller.getAll(userId);

      expect(result).toEqual(mockMachines);
      expect(mockMachinesService.getAll).toHaveBeenCalledWith(userId);
    });

    it('should handle empty array result', async () => {
      const userId = 'user-uuid';
      
      mockMachinesService.getAll.mockResolvedValue([]);

      const result = await controller.getAll(userId);

      expect(result).toEqual([]);
      expect(mockMachinesService.getAll).toHaveBeenCalledWith(userId);
    });

    it('should propagate errors from service', async () => {
      const userId = 'user-uuid';
      const error = new Error('Service error');
      
      mockMachinesService.getAll.mockRejectedValue(error);

      await expect(controller.getAll(userId)).rejects.toThrow(error);
      expect(mockMachinesService.getAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create a new machine', async () => {
      const createMachineDto: CreateMachineDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const createdMachine = createMockMachine(
        'new-machine-uuid', 
        createMachineDto.userId,
        createMachineDto.brandName,
        createMachineDto.model
      );
      
      mockMachinesService.create.mockResolvedValue(createdMachine);

      const result = await controller.create(createMachineDto);

      expect(result).toEqual(createdMachine);
      expect(mockMachinesService.create).toHaveBeenCalledWith(createMachineDto);
    });

    it('should propagate errors from service', async () => {
      const createMachineDto: CreateMachineDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const error = new Error('Database error');
      mockMachinesService.create.mockRejectedValue(error);

      await expect(controller.create(createMachineDto)).rejects.toThrow(error);
      expect(mockMachinesService.create).toHaveBeenCalledWith(createMachineDto);
    });
  });

  describe('delete', () => {
    it('should delete a machine', async () => {
      const machineId = 'machine-uuid';
      const deletedMachine = createMockMachine(machineId, 'user-uuid');
      
      mockMachinesService.delete.mockResolvedValue(deletedMachine);

      const result = await controller.delete(machineId);

      expect(result).toEqual(deletedMachine);
      expect(mockMachinesService.delete).toHaveBeenCalledWith(machineId);
    });

    it('should handle not found error', async () => {
      const machineId = 'non-existent-uuid';
      const error = new NotFoundException();
      
      mockMachinesService.delete.mockRejectedValue(error);

      await expect(controller.delete(machineId)).rejects.toThrow(NotFoundException);
      expect(mockMachinesService.delete).toHaveBeenCalledWith(machineId);
    });

    it('should propagate other errors from service', async () => {
      const machineId = 'machine-uuid';
      const error = new Error('Database error');
      
      mockMachinesService.delete.mockRejectedValue(error);

      await expect(controller.delete(machineId)).rejects.toThrow(error);
      expect(mockMachinesService.delete).toHaveBeenCalledWith(machineId);
    });
  });

  describe('edit', () => {
    it('should update a machine', async () => {
      const machineId = 'machine-uuid';
      const editMachineDto: EditMachineDto = {
        brandName: 'Updated Brand',
        model: 'Updated Model',
      };
      
      const updatedMachine = createMockMachine(
        machineId, 
        'user-uuid',
        editMachineDto.brandName,
        editMachineDto.model
      );
      
      mockMachinesService.edit.mockResolvedValue(updatedMachine);

      const result = await controller.edit(machineId, editMachineDto);

      expect(result).toEqual(updatedMachine);
      expect(mockMachinesService.edit).toHaveBeenCalledWith(editMachineDto, machineId);
    });

    it('should handle not found error', async () => {
      const machineId = 'non-existent-uuid';
      const editMachineDto: EditMachineDto = {
        brandName: 'Updated Brand',
      };
      
      const error = new NotFoundException();
      mockMachinesService.edit.mockRejectedValue(error);

      await expect(controller.edit(machineId, editMachineDto)).rejects.toThrow(NotFoundException);
      expect(mockMachinesService.edit).toHaveBeenCalledWith(editMachineDto, machineId);
    });

    it('should handle partial updates', async () => {
      const machineId = 'machine-uuid';
      const editMachineDto: EditMachineDto = {
        brandName: 'Updated Brand',
      };
      
      const updatedMachine = createMockMachine(
        machineId, 
        'user-uuid',
        editMachineDto.brandName,
        'Original Model'
      );
      
      mockMachinesService.edit.mockResolvedValue(updatedMachine);

      const result = await controller.edit(machineId, editMachineDto);

      expect(result).toEqual(updatedMachine);
      expect(mockMachinesService.edit).toHaveBeenCalledWith(editMachineDto, machineId);
    });
  });
});
