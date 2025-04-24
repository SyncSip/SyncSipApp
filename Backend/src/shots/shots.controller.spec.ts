import { Test, TestingModule } from '@nestjs/testing';
import { ShotsController } from './shots.controller';
import { ShotsService } from './shots.service';
import { CreateShotDto, EditShotDto, ReadShotDto } from 'src/dto/shots.dto';
import { ReadMachineDto } from 'src/dto/machine.dto';
import { ReadBeanDto } from 'src/dto/bean.dto';
import { ReadGrinderDto } from 'src/dto/grinder.dto';
import { NotFoundException } from '@nestjs/common';

describe('ShotsController', () => {
  let controller: ShotsController;
  let service: ShotsService;

  const mockShotsService = {
    get: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    edit: jest.fn(),
    delete: jest.fn(),
  };

  const mockMachine: ReadMachineDto = {
    id: 'machine-id',
    brandName: 'Test Brand',
    model: 'Test Model',
    userId: 'user-id'
  };

  const mockBean: ReadBeanDto = {
    id: 'bean-id',
    roastery: 'Test Roastery',
    bean: 'Test Bean',
    userId: 'user-id',
    altitudeInMeters: '1800-2000',
    roastDate: new Date(),
    process: 'Washed',
    genetic: 'Bourbon',
    variety: 'Yellow Bourbon',
    origin: 'Colombia',
    full: true,
    customFields: []
  };

  const mockGrinder: ReadGrinderDto = {
    id: 'grinder-id',
    brandName: 'Test Grinder Brand',
    model: 'Test Grinder Model',
    userId: 'user-id'
  };


  const createMockShot = (id: string, userId: string): ReadShotDto => ({
      id,
      userId,
      time: Date.now(),
      weight: 36,
      dose: 18,
      machine: mockMachine,
      beans: mockBean,
      grinder: mockGrinder,
      beansId: mockBean.id,
      machineId: mockMachine.id,
      grinderId: mockGrinder.id,
      customFields: [],
      group: '',
      starred: false,
      createdAt: undefined,
      updatedAt: undefined
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShotsController],
      providers: [
        {
          provide: ShotsService,
          useValue: mockShotsService,
        },
      ],
    }).compile();

    controller = module.get<ShotsController>(ShotsController);
    service = module.get<ShotsService>(ShotsService);
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a shot by id', async () => {
      const shotId = 'test-uuid';
      const mockShot = createMockShot(shotId, 'user-id');
      
      mockShotsService.get.mockResolvedValue(mockShot);

      const result = await controller.get(shotId);

      expect(result).toEqual(mockShot);
      expect(mockShotsService.get).toHaveBeenCalledWith(shotId);
    });

    it('should handle not found error', async () => {
      const shotId = 'non-existent-uuid';
      const error = new NotFoundException();
      
      mockShotsService.get.mockRejectedValue(error);

      await expect(controller.get(shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotsService.get).toHaveBeenCalledWith(shotId);
    });
  });

  describe('getAll', () => {
    it('should return all shots for a user', async () => {
      const userId = 'user-uuid';
      const mockShots: ReadShotDto[] = [
        createMockShot('shot-1', userId),
        createMockShot('shot-2', userId)
      ];
      
      mockShotsService.getAll.mockResolvedValue(mockShots);

      const result = await controller.getAll(userId);

      expect(result).toEqual(mockShots);
      expect(mockShotsService.getAll).toHaveBeenCalledWith(userId);
    });

    it('should handle empty array result', async () => {
      const userId = 'user-uuid';
      
      mockShotsService.getAll.mockResolvedValue([]);

      const result = await controller.getAll(userId);

      expect(result).toEqual([]);
      expect(mockShotsService.getAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create a new shot', async () => {
      const createShotDto: CreateShotDto = {
          userId: 'user-uuid',
          time: Date.now(), // Using a number timestamp instead of Date object
          weight: 36,
          dose: 18,
          machineId: mockMachine.id,
          beansId: mockBean.id,
          grinderId: mockGrinder.id,
          customFields: [{ key: 'Pressure', value: '9 bar' }],
          group: '',
          starred: false
      };
      
      const createdShot = {
        id: 'new-shot-uuid',
        ...createShotDto,
        machine: mockMachine,
        beans: mockBean,
        grinder: mockGrinder
      };
      
      mockShotsService.create.mockResolvedValue(createdShot);

      const result = await controller.create(createShotDto);

      expect(result).toEqual(createdShot);
      expect(mockShotsService.create).toHaveBeenCalledWith(createShotDto);
    });

    it('should propagate errors from service', async () => {
      const createShotDto: CreateShotDto = {
          userId: 'user-uuid',
          time: Date.now(), // Using a number timestamp instead of Date object
          weight: 36,
          dose: 18,
          machineId: mockMachine.id,
          beansId: mockBean.id,
          grinderId: mockGrinder.id,
          customFields: [],
          group: '',
          starred: false
      };
      
      const error = new Error('Database error');
      mockShotsService.create.mockRejectedValue(error);

      await expect(controller.create(createShotDto)).rejects.toThrow(error);
      expect(mockShotsService.create).toHaveBeenCalledWith(createShotDto);
    });
  });

  describe('edit', () => {
    it('should update a shot', async () => {
      const shotId = 'shot-uuid';
      const editShotDto: EditShotDto = {
        customFields: [{ key: 'Notes', value: 'Good shot' }]
      };
      
      const updatedShot = createMockShot(shotId, 'user-uuid');
      
      mockShotsService.edit.mockResolvedValue(updatedShot);

      const result = await controller.edit(editShotDto, shotId);

      expect(result).toEqual(updatedShot);
      expect(mockShotsService.edit).toHaveBeenCalledWith(editShotDto, shotId);
    });

    it('should handle not found error', async () => {
      const shotId = 'non-existent-uuid';
      const editShotDto: EditShotDto = {
        customFields: []
      };
      
      const error = new NotFoundException();
      mockShotsService.edit.mockRejectedValue(error);

      await expect(controller.edit(editShotDto, shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotsService.edit).toHaveBeenCalledWith(editShotDto, shotId);
    });
  });

  describe('delete', () => {
    it('should delete a shot', async () => {
      const shotId = 'shot-uuid';
      const deletedShot = createMockShot(shotId, 'user-uuid');
      
      mockShotsService.delete.mockResolvedValue(deletedShot);

      const result = await controller.delete(shotId);

      expect(result).toEqual(deletedShot);
      expect(mockShotsService.delete).toHaveBeenCalledWith(shotId);
    });

    it('should handle not found error', async () => {
      const shotId = 'non-existent-uuid';
      const error = new NotFoundException();
      
      mockShotsService.delete.mockRejectedValue(error);

      await expect(controller.delete(shotId)).rejects.toThrow(NotFoundException);
      expect(mockShotsService.delete).toHaveBeenCalledWith(shotId);
    });
  });
});
