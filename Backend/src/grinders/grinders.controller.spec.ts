import { Test, TestingModule } from '@nestjs/testing';
import { GrindersController } from './grinders.controller';
import { GrindersService } from './grinders.service';
import { CreateGrinderDto, EditGrinderDto, ReadGrinderDto } from 'src/dto/grinder.dto';
import { NotFoundException } from '@nestjs/common';

describe('GrindersController', () => {
  let controller: GrindersController;
  let service: GrindersService;

  const mockGrindersService = {
    getOne: jest.fn(),
    getMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    edit: jest.fn(),
  };

  // Create a complete mock grinder that satisfies ReadGrinderDto
  const createMockGrinder = (id: string, userId: string, brandName = 'Test Brand', model = 'Test Model'): ReadGrinderDto => ({
    id,
    brandName,
    model,
    userId
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrindersController],
      providers: [
        {
          provide: GrindersService,
          useValue: mockGrindersService,
        },
      ],
    }).compile();

    controller = module.get<GrindersController>(GrindersController);
    service = module.get<GrindersService>(GrindersService);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a grinder by id', async () => {
      const grinderId = 'test-uuid';
      const mockGrinder = createMockGrinder(grinderId, 'user-id');
      
      mockGrindersService.getOne.mockResolvedValue(mockGrinder);

      const result = await controller.get(grinderId);

      expect(result).toEqual(mockGrinder);
      expect(mockGrindersService.getOne).toHaveBeenCalledWith(grinderId);
    });

    it('should handle not found error', async () => {
      const grinderId = 'non-existent-uuid';
      const error = new NotFoundException();
      
      mockGrindersService.getOne.mockRejectedValue(error);

      await expect(controller.get(grinderId)).rejects.toThrow(NotFoundException);
      expect(mockGrindersService.getOne).toHaveBeenCalledWith(grinderId);
    });
  });

  describe('getAll', () => {
    it('should return all grinders for a user', async () => {
      const userId = 'user-uuid';
      const mockGrinders: ReadGrinderDto[] = [
        createMockGrinder('grinder-1', userId, 'Brand 1', 'Model 1'),
        createMockGrinder('grinder-2', userId, 'Brand 2', 'Model 2')
      ];
      
      mockGrindersService.getMany.mockResolvedValue(mockGrinders);

      const result = await controller.getAll(userId);

      expect(result).toEqual(mockGrinders);
      expect(mockGrindersService.getMany).toHaveBeenCalledWith(userId);
    });

    it('should handle not found error', async () => {
      const userId = 'user-uuid';
      const error = new NotFoundException();
      
      mockGrindersService.getMany.mockRejectedValue(error);

      await expect(controller.getAll(userId)).rejects.toThrow(NotFoundException);
      expect(mockGrindersService.getMany).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create a new grinder', async () => {
      const createGrinderDto: CreateGrinderDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const createdGrinder = createMockGrinder(
        'new-grinder-uuid', 
        createGrinderDto.userId,
        createGrinderDto.brandName,
        createGrinderDto.model
      );
      
      mockGrindersService.create.mockResolvedValue(createdGrinder);

      const result = await controller.create(createGrinderDto);

      expect(result).toEqual(createdGrinder);
      expect(mockGrindersService.create).toHaveBeenCalledWith(createGrinderDto);
    });

    it('should propagate errors from service', async () => {
      const createGrinderDto: CreateGrinderDto = {
        brandName: 'New Brand',
        model: 'New Model',
        userId: 'user-uuid',
      };
      
      const error = new Error('Database error');
      mockGrindersService.create.mockRejectedValue(error);

      await expect(controller.create(createGrinderDto)).rejects.toThrow(error);
      expect(mockGrindersService.create).toHaveBeenCalledWith(createGrinderDto);
    });
  });

  describe('delete', () => {
    it('should delete a grinder', async () => {
      const grinderId = 'grinder-uuid';
      const deletedGrinder = createMockGrinder(grinderId, 'user-uuid');
      
      mockGrindersService.delete.mockResolvedValue(deletedGrinder);

      const result = await controller.delete(grinderId);

      expect(result).toEqual(deletedGrinder);
      expect(mockGrindersService.delete).toHaveBeenCalledWith(grinderId);
    });

    it('should handle not found error', async () => {
      const grinderId = 'non-existent-uuid';
      const error = new NotFoundException();
      
      mockGrindersService.delete.mockRejectedValue(error);

      await expect(controller.delete(grinderId)).rejects.toThrow(NotFoundException);
      expect(mockGrindersService.delete).toHaveBeenCalledWith(grinderId);
    });
  });

  describe('edit', () => {
    it('should update a grinder', async () => {
      const grinderId = 'grinder-uuid';
      const editGrinderDto: EditGrinderDto = {
        brandName: 'Updated Brand',
        model: 'Updated Model',
      };
      
      const updatedGrinder = createMockGrinder(
        grinderId, 
        'user-uuid',
        editGrinderDto.brandName,
        editGrinderDto.model
      );
      
      mockGrindersService.edit.mockResolvedValue(updatedGrinder);

      const result = await controller.edit(grinderId, editGrinderDto);

      expect(result).toEqual(updatedGrinder);
      expect(mockGrindersService.edit).toHaveBeenCalledWith(editGrinderDto, grinderId);
    });

    it('should handle not found error', async () => {
      const grinderId = 'non-existent-uuid';
      const editGrinderDto: EditGrinderDto = {
        brandName: 'Updated Brand',
      };
      
      const error = new NotFoundException();
      mockGrindersService.edit.mockRejectedValue(error);

      await expect(controller.edit(grinderId, editGrinderDto)).rejects.toThrow(NotFoundException);
      expect(mockGrindersService.edit).toHaveBeenCalledWith(editGrinderDto, grinderId);
    });

    it('should propagate other errors from service', async () => {
      const grinderId = 'grinder-uuid';
      const editGrinderDto: EditGrinderDto = {
        brandName: 'Updated Brand',
      };
      
      const error = new Error('Database error');
      mockGrindersService.edit.mockRejectedValue(error);

      await expect(controller.edit(grinderId, editGrinderDto)).rejects.toThrow(error);
      expect(mockGrindersService.edit).toHaveBeenCalledWith(editGrinderDto, grinderId);
    });
  });
});
