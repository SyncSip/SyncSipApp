import { Test, TestingModule } from '@nestjs/testing';
import { BeansController } from './beans.controller';
import { BeansService } from './beans.service';
import { CreateBeanDto, EditBeanDto, ReadBeanDto } from 'src/dto/bean.dto';

describe('BeansController', () => {
  let controller: BeansController;
  let service: BeansService;

  const mockBeansService = {
    getOne: jest.fn(),
    getMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    edit: jest.fn(),
  };

  const createMockBean = (id: string, userId: string, roastery = 'Test Roastery', beanName = 'Test Bean'): ReadBeanDto => ({
    id,
    roastery,
    bean: beanName,
    userId,
    altitudeInMeters: '1800-2000',
    roastDate: new Date('2024-01-15'),
    process: 'Washed',
    genetic: 'Bourbon',
    variety: 'Yellow Bourbon',
    origin: 'Colombia',
    full: true,
    customFields: []
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeansController],
      providers: [
        {
          provide: BeansService,
          useValue: mockBeansService,
        },
      ],
    }).compile();

    controller = module.get<BeansController>(BeansController);
    service = module.get<BeansService>(BeansService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return a bean by id', async () => {
      const beanId = 'test-uuid';
      const mockBean = createMockBean(beanId, 'user-id');
      
      mockBeansService.getOne.mockResolvedValue(mockBean);

      const result = await controller.get(beanId);

      expect(result).toEqual(mockBean);
      expect(mockBeansService.getOne).toHaveBeenCalledWith(beanId);
    });
  });

  describe('getAll', () => {
    it('should return all beans for a user', async () => {
      const userId = 'user-uuid';
      const mockBeans: ReadBeanDto[] = [
        createMockBean('bean-1', userId, 'Roastery 1', 'Bean 1'),
        createMockBean('bean-2', userId, 'Roastery 2', 'Bean 2')
      ];
      
      mockBeansService.getMany.mockResolvedValue(mockBeans);

      const result = await controller.getAll(userId);

      expect(result).toEqual(mockBeans);
      expect(mockBeansService.getMany).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    it('should create a new bean', async () => {
      const createBeanDto: CreateBeanDto = {
        roastery: 'New Roastery',
        bean: 'New Bean',
        userId: 'user-uuid',
        altitudeInMeters: '1800-2000',
        roastDate: new Date('2024-01-15'),
        process: 'Washed',
        genetic: 'Bourbon',
        variety: 'Yellow Bourbon',
        origin: 'Colombia',
        full: true,
        customFields: []
      };
      
      const createdBean = {
        id: 'new-bean-uuid',
        ...createBeanDto,
      };
      
      mockBeansService.create.mockResolvedValue(createdBean);

      const result = await controller.create(createBeanDto);

      expect(result).toEqual(createdBean);
      expect(mockBeansService.create).toHaveBeenCalledWith(createBeanDto);
    });
  });

  describe('delete', () => {
    it('should delete a bean', async () => {
      const beanId = 'bean-uuid';
      const deletedBean = createMockBean(beanId, 'user-uuid');
      
      mockBeansService.delete.mockResolvedValue(deletedBean);

      const result = await controller.delete(beanId);

      expect(result).toEqual(deletedBean);
      expect(mockBeansService.delete).toHaveBeenCalledWith(beanId);
    });
  });

  describe('edit', () => {
    it('should update a bean', async () => {
      const beanId = 'bean-uuid';
      const editBeanDto: EditBeanDto = {
        roastery: 'Updated Roastery',
        bean: 'Updated Bean',
        origin: 'Ethiopia',
        process: 'Natural'
      };
      
      const updatedBean = createMockBean(beanId, 'user-uuid', 'Updated Roastery', 'Updated Bean');
      updatedBean.origin = 'Ethiopia';
      updatedBean.process = 'Natural';
      
      mockBeansService.edit.mockResolvedValue(updatedBean);

      const result = await controller.edit(beanId, editBeanDto);

      expect(result).toEqual(updatedBean);
      expect(mockBeansService.edit).toHaveBeenCalledWith(editBeanDto, beanId);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from service.getOne', async () => {
      const error = new Error('Service error');
      mockBeansService.getOne.mockRejectedValue(error);

      await expect(controller.get('test-id')).rejects.toThrow(error);
    });

    it('should propagate errors from service.getMany', async () => {
      const error = new Error('Service error');
      mockBeansService.getMany.mockRejectedValue(error);

      await expect(controller.getAll('user-id')).rejects.toThrow(error);
    });

    it('should propagate errors from service.create', async () => {
      const error = new Error('Service error');
      mockBeansService.create.mockRejectedValue(error);

      const createBeanDto: CreateBeanDto = {
        roastery: 'New Roastery',
        bean: 'New Bean',
        userId: 'user-uuid',
      };

      await expect(controller.create(createBeanDto)).rejects.toThrow(error);
    });

    it('should propagate errors from service.delete', async () => {
      const error = new Error('Service error');
      mockBeansService.delete.mockRejectedValue(error);

      await expect(controller.delete('test-id')).rejects.toThrow(error);
    });

    it('should propagate errors from service.edit', async () => {
      const error = new Error('Service error');
      mockBeansService.edit.mockRejectedValue(error);

      const editBeanDto: EditBeanDto = {
        roastery: 'Updated Roastery',
      };

      await expect(controller.edit('test-id', editBeanDto)).rejects.toThrow(error);
    });
  });
});
