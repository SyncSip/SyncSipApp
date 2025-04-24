jest.mock('src/data/entities/beans.entity/beans.entity', () => ({
  Bean: class Bean {
    id: string;
    roastery: string;
    bean: string;
    altitudeInMeters: string;
    roastDate: Date;
    process: string;
    genetic: string;
    variety: string;
    origin: string;
    full: boolean;
    customFields: any[];
    userId: string;
    user: any;
    shots: any[];
  },
}));

jest.mock('src/data/entities/shot.entity/shot.entity', () => ({
  Shot: class Shot {
    id: string;
    userId: string;
    beansId: string;
  },
  CustomField: class CustomField {
    key: string; 
    value: string;
  },
}));

jest.mock('src/dto/bean.dto', () => ({
  CreateBeanDto: class CreateBeanDto {
    roastery: string;
    bean: string;
    altitudeInMeters?: string;
    roastDate?: Date;
    process?: string;
    genetic?: string;
    variety?: string;
    origin?: string;
    full?: boolean;
    customFields?: any[];
    userId: string;
  },
  EditBeanDto: class EditBeanDto {
    roastery?: string;
    bean?: string;
    altitudeInMeters?: string;
    roastDate?: Date;
    process?: string;
    genetic?: string;
    variety?: string;
    origin?: string;
    full?: boolean;
    customFields?: any[];
  },
  ReadBeanDto: class ReadBeanDto {
    id: string;
    roastery: string;
    bean: string;
    altitudeInMeters?: string;
    roastDate?: Date;
    process?: string;
    genetic?: string;
    variety?: string;
    origin?: string;
    full?: boolean;
    customFields?: any[];
    userId: string;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BeansService } from './beans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Bean } from 'src/data/entities/beans.entity/beans.entity';
import { Shot } from 'src/data/entities/shot.entity/shot.entity';
import { CreateBeanDto, EditBeanDto, ReadBeanDto } from 'src/dto/bean.dto';

describe('BeansService', () => {
  let service: BeansService;
  let beanRepository: Repository<Bean>;
  let shotRepository: Repository<Shot>;

  const mockBeanRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
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
        BeansService,
        {
          provide: getRepositoryToken(Bean),
          useValue: mockBeanRepository,
        },
        {
          provide: getRepositoryToken(Shot),
          useValue: mockShotRepository,
        },
      ],
    }).compile();

    service = module.get<BeansService>(BeansService);
    beanRepository = module.get<Repository<Bean>>(getRepositoryToken(Bean));
    shotRepository = module.get<Repository<Shot>>(getRepositoryToken(Shot));
    
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOne', () => {
    it('should return a bean by id', async () => {
      const beanId = 'test-uuid';
      const mockBean = {
        id: beanId,
        roastery: 'Test Roastery',
        bean: 'Test Bean',
        userId: 'user-id',
      };
      
      mockBeanRepository.findOneBy.mockResolvedValue(mockBean);

      const result = await service.getOne(beanId);

      expect(result).toEqual(mockBean);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
    });

    it('should return null if bean not found', async () => {
      const beanId = 'non-existent-uuid';
      mockBeanRepository.findOneBy.mockResolvedValue(null);

      const result = await service.getOne(beanId);

      expect(result).toBeNull();
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
    });
  });

  describe('getMany', () => {
    it('should return all beans for a user ordered by full DESC', async () => {
      const userId = 'user-uuid';
      const mockBeans = [
        {
          id: 'bean-1',
          roastery: 'Roastery 1',
          bean: 'Bean 1',
          full: true,
          userId,
        },
        {
          id: 'bean-2',
          roastery: 'Roastery 2',
          bean: 'Bean 2',
          full: false,
          userId,
        },
      ];
      
      mockBeanRepository.find.mockResolvedValue(mockBeans);

      const result = await service.getMany(userId);

      expect(result).toEqual(mockBeans);
      expect(mockBeanRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { full: 'DESC' },
      });
    });

    it('should propagate errors', async () => {
      const userId = 'user-uuid';
      const error = new Error('Database error');
      mockBeanRepository.find.mockRejectedValue(error);

      await expect(service.getMany(userId)).rejects.toThrow(error);
      expect(mockBeanRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { full: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create a new bean', async () => {
      const createBeanDto: CreateBeanDto = {
        roastery: 'New Roastery',
        bean: 'New Bean',
        origin: 'Ethiopia',
        full: true,
        userId: 'user-uuid',
      };
      
      const createdBean = {
        id: 'new-bean-uuid',
        ...createBeanDto,
      };
      
      mockBeanRepository.create.mockReturnValue(createdBean);
      mockBeanRepository.save.mockResolvedValue(createdBean);

      const result = await service.create(createBeanDto);

      expect(result).toEqual(createdBean);
      expect(mockBeanRepository.create).toHaveBeenCalledWith(createBeanDto);
      expect(mockBeanRepository.save).toHaveBeenCalledWith(createdBean);
    });

    it('should propagate errors', async () => {
      const createBeanDto: CreateBeanDto = {
        roastery: 'New Roastery',
        bean: 'New Bean',
        userId: 'user-uuid',
      };
      
      const error = new Error('Database error');
      mockBeanRepository.create.mockReturnValue({});
      mockBeanRepository.save.mockRejectedValue(error);

      await expect(service.create(createBeanDto)).rejects.toThrow(error);
      expect(mockBeanRepository.create).toHaveBeenCalledWith(createBeanDto);
    });
  });

  describe('delete', () => {
    it('should delete a bean and update related shots', async () => {
      const beanId = 'bean-uuid';
      const existingBean = {
        id: beanId,
        roastery: 'Test Roastery',
        bean: 'Test Bean',
        userId: 'user-uuid',
      };
      
      mockBeanRepository.findOneBy.mockResolvedValue(existingBean);
      mockShotRepository.update.mockResolvedValue({ affected: 2 });
      mockBeanRepository.remove.mockResolvedValue(existingBean);

      const result = await service.delete(beanId);

      expect(result).toEqual(existingBean);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
      expect(mockShotRepository.update).toHaveBeenCalledWith(
        { beansId: beanId },
        { beansId: null }
      );
      expect(mockBeanRepository.remove).toHaveBeenCalledWith(existingBean);
    });

    it('should throw NotFoundException if bean not found', async () => {
      const beanId = 'non-existent-uuid';
      mockBeanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(beanId)).rejects.toThrow(NotFoundException);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
      expect(mockShotRepository.update).not.toHaveBeenCalled();
      expect(mockBeanRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should update a bean', async () => {
      const beanId = 'bean-uuid';
      const editBeanDto: EditBeanDto = {
        roastery: 'Updated Roastery',
        bean: 'Updated Bean',
        full: false,
      };
      
      const existingBean = {
        id: beanId,
        roastery: 'Old Roastery',
        bean: 'Old Bean',
        full: true,
        userId: 'user-uuid',
      };
      
      const updatedBean = {
        ...existingBean,
        ...editBeanDto,
      };
      
      mockBeanRepository.findOneBy.mockResolvedValue(existingBean);
      mockBeanRepository.merge.mockReturnValue(updatedBean);
      mockBeanRepository.save.mockResolvedValue(updatedBean);

      const result = await service.edit(editBeanDto, beanId);

      expect(result).toEqual(updatedBean);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
      expect(mockBeanRepository.merge).toHaveBeenCalledWith(existingBean, editBeanDto);
      expect(mockBeanRepository.save).toHaveBeenCalledWith(updatedBean);
    });

    it('should throw NotFoundException if bean not found', async () => {
      const beanId = 'non-existent-uuid';
      const editBeanDto: EditBeanDto = {
        roastery: 'Updated Roastery',
      };
      
      mockBeanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.edit(editBeanDto, beanId)).rejects.toThrow(NotFoundException);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
      expect(mockBeanRepository.merge).not.toHaveBeenCalled();
      expect(mockBeanRepository.save).not.toHaveBeenCalled();
    });

    it('should handle complex bean data with custom fields', async () => {
      const beanId = 'bean-uuid';
      const editBeanDto: EditBeanDto = {
        roastery: 'Specialty Roastery',
        bean: 'Premium Bean',
        origin: 'Colombia',
        process: 'Washed',
        genetic: 'Bourbon',
        variety: 'Yellow Bourbon',
        altitudeInMeters: '1800-2000',
        full: true,
        customFields: [
          { key: 'Flavor Notes', value: 'Chocolate, Cherry, Caramel' },  
          { key: 'Roast Level', value: 'Medium' } 
        ]
      };
      
      const existingBean = {
        id: beanId,
        roastery: 'Old Roastery',
        bean: 'Old Bean',
        userId: 'user-uuid',
        customFields: [
          { key: 'Flavor Notes', value: 'Fruity' }
        ]
      };
      
      const updatedBean = {
        ...existingBean,
        ...editBeanDto,
      };
      
      mockBeanRepository.findOneBy.mockResolvedValue(existingBean);
      mockBeanRepository.merge.mockReturnValue(updatedBean);
      mockBeanRepository.save.mockResolvedValue(updatedBean);
    
      const result = await service.edit(editBeanDto, beanId);
    
      expect(result).toEqual(updatedBean);
      expect(result.customFields).toEqual(editBeanDto.customFields);
      expect(mockBeanRepository.findOneBy).toHaveBeenCalledWith({ id: beanId });
      expect(mockBeanRepository.merge).toHaveBeenCalledWith(existingBean, editBeanDto);
      expect(mockBeanRepository.save).toHaveBeenCalledWith(updatedBean);
    });
    
  });
});
