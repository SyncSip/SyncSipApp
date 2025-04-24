import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('src/data/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
  })),
}));

jest.mock('src/data/entities/user.entity/user.entity', () => ({
  User: class User {
    id: string;
    name: string;
    email: string;
    password: string;
    refreshToken?: string;
  },
}));

jest.mock('src/dto/create-user.dto', () => ({
  CreateUserDto: class CreateUserDto {
    name: string;
    email: string;
    password: string;
  },
  DeleteUserDto: class DeleteUserDto {},
  EditUserDto: class EditUserDto {},
}));

jest.mock('src/dto/user-response.dto', () => ({
  RefreshDto: class RefreshDto {
    id: string;
    refreshToken: string;
  },
}));

import { DatabaseService } from 'src/data/database.service';
import { User } from 'src/data/entities/user.entity/user.entity';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { RefreshDto } from 'src/dto/user-response.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let databaseService: DatabaseService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDatabaseService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('finOne', () => {
    it('should find a user by id', async () => {
      const userId = 'test-uuid';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.finOne(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent-uuid';
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.finOne(userId);

      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });

  describe('findByMail', () => {
    it('should find a user by email', async () => {
      const userEmail = 'test@example.com';
      const mockUser = {
        id: 'test-uuid',
        name: 'Test User',
        email: userEmail,
        password: 'hashedPassword',
      };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByMail(userEmail);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
    });

    it('should return null if user email not found', async () => {
      const userEmail = 'nonexistent@example.com';
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findByMail(userEmail);

      expect(result).toBeNull();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: userEmail });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = new CreateUserDto();
      createUserDto.name = 'New User';
      createUserDto.email = 'newuser@example.com';
      createUserDto.password = 'plainPassword';
      
      const hashedPassword = 'hashedPassword123';
      const salt = 'salt';
      
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      
      const createdUser = {
        id: 'new-uuid',
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      };
      
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', salt);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update user refresh token', async () => {
      const userId = 'test-uuid';
      const refreshToken = 'new-refresh-token';
      
      const updateTokenDto = new RefreshDto();
      updateTokenDto.id = userId;
      updateTokenDto.refreshToken = refreshToken;
      
      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: 'old-refresh-token',
      };
      
      const updatedUser = {
        ...existingUser,
        refreshToken: refreshToken,
      };
      
      mockUserRepository.findOneBy.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = await service.updateRefreshToken(updateTokenDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        refreshToken: refreshToken,
      });
    });

    it('should handle updating refresh token for non-existent user', async () => {
      const userId = 'non-existent-uuid';
      const refreshToken = 'new-refresh-token';
      
      const updateTokenDto = new RefreshDto();
      updateTokenDto.id = userId;
      updateTokenDto.refreshToken = refreshToken;
      
      mockUserRepository.findOneBy.mockResolvedValue(null);
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(service.updateRefreshToken(updateTokenDto)).rejects.toThrow();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
