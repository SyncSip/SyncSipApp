import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, DeleteUserDto, EditUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from 'src/dto/user-response.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return user response', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const userResponse: UserResponseDto = {
        id: 'user-uuid',
        name: 'Test User'
      };
      
      mockUsersService.create.mockResolvedValue(userResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(userResponse);
      
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate BadRequestException from service', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };
      

      const error = new BadRequestException('Email already exists');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
      
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate InternalServerErrorException from service', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const error = new InternalServerErrorException('Database error');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
      
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors', async () => {
      const invalidUserDto = {
        name: 'Test User'

      };
      
      const error = new BadRequestException('Validation failed');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(invalidUserDto as CreateUserDto)).rejects.toThrow(BadRequestException);
    });
  });

});
